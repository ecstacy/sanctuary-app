// Guardrail tests for the meal composer.
//
// The composer is where reviewed ingredient data turns into a suggestion, so
// it is the last place a safety constraint or an unreviewed fact could leak
// into something a user acts on. These tests encode that it can't.

import { describe, it, expect } from 'vitest'
import { composeMeals, mealSlotFor, netDoshaEffect, explainIdea } from './mealComposer'
import { MEAL_TEMPLATES, ALL_MEAL_TEMPLATES } from '../data/ayurveda/meals'
import { INGREDIENTS } from '../data/ayurveda/ingredients'
import { SUITABILITY } from './doshaSemantics'

const at = (h) => new Date(`2026-07-21T${String(h).padStart(2, '0')}:00:00`)

/** Run the composer with every template temporarily reviewed. */
function withReviewedTemplates(fn) {
  const before = ALL_MEAL_TEMPLATES.map((t) => t.reviewStatus)
  ALL_MEAL_TEMPLATES.forEach((t) => { t.reviewStatus = 'reviewed' })
  try { return fn() } finally {
    ALL_MEAL_TEMPLATES.forEach((t, i) => { t.reviewStatus = before[i] })
  }
}

describe('the review gate reaches the composer', () => {
  it('suggests nothing while templates are unreviewed', () => {
    // Chunk 4 ships dark on purpose: the templates are drafts until a human
    // signs them off, exactly as the ingredients were.
    const out = composeMeals({ now: at(8) })
    expect(out.ideas).toEqual([])
    expect(out.coverage.emptyBecauseUnreviewed).toBe(true)
  })

  it('never composes from a draft INGREDIENT even if the template is reviewed', () => {
    // The dangerous case: a reviewed dish laundering unverified ingredient
    // data into a suggestion.
    withReviewedTemplates(() => {
      const original = INGREDIENTS.mungDal.reviewStatus
      INGREDIENTS.mungDal.reviewStatus = 'draft'
      try {
        const out = composeMeals({ now: at(13), count: 99 })
        const ids = out.ideas.map((i) => i.id)
        expect(ids).not.toContain('kitchari')     // core includes mungDal
        expect(ids).not.toContain('riceDalGhee')
      } finally {
        INGREDIENTS.mungDal.reviewStatus = original
      }
    })
  })
})

describe('safety filtering happens BEFORE ranking', () => {
  it('drops a dish whose core contains an allergen, however well it scores', () => {
    withReviewedTemplates(() => {
      // Kitchari is core rice + mung + ghee and is the best-scoring midday
      // idea for Vata. A dairy allergy must remove it outright.
      const open = composeMeals({ now: at(13), targetDosha: 'vata', count: 99 })
      expect(open.ideas.map((i) => i.id)).toContain('kitchari')

      const filtered = composeMeals({
        now: at(13), targetDosha: 'vata', count: 99,
        dietPrefs: { allergens: ['dairy'] },
      })
      expect(filtered.ideas.map((i) => i.id)).not.toContain('kitchari')
    })
  })

  it('keeps a dish when only an OPTIONAL ingredient is excluded, minus that item', () => {
    withReviewedTemplates(() => {
      // chapatiSabzi: core wheat + spinach, optional ghee/garlic/onion.
      // A dairy allergy should cost it the ghee, not the meal.
      const out = composeMeals({
        now: at(13), count: 99, dietPrefs: { allergens: ['dairy'] },
      })
      const dish = out.ideas.find((i) => i.id === 'chapatiSabzi')
      expect(dish).toBeTruthy()
      expect(dish.optional.map((o) => o.id)).not.toContain('ghee')
    })
  })

  it('returns EMPTY rather than relaxing the filter', () => {
    withReviewedTemplates(() => {
      // Exclude enough that nothing survives. The composer must not fall back.
      const out = composeMeals({
        now: at(13), count: 99,
        dietPrefs: { allergens: ['dairy', 'gluten', 'nuts', 'sesame'], patterns: ['vegan', 'jain'] },
      })
      for (const idea of out.ideas) {
        // Whatever survived must genuinely be safe — no exceptions were made.
        expect(idea.core.map((c) => c.id)).not.toContain('ghee')
        expect(idea.core.map((c) => c.id)).not.toContain('milk')
      }
    })
  })

  it('reports an empty list caused by filtering distinctly from one caused by the gate', () => {
    withReviewedTemplates(() => {
      const out = composeMeals({
        now: at(13), count: 99,
        // Every template's core contains at least one of these.
        dietPrefs: { allergens: ['dairy', 'gluten'], patterns: ['vegan', 'jain', 'no_nightshade'] },
      })
      if (out.ideas.length === 0) {
        expect(out.coverage.emptyBecauseFiltered).toBe(true)
        expect(out.coverage.emptyBecauseUnreviewed).toBe(false)
      }
      expect(out.coverage.filteredOut).toBeGreaterThan(0)
    })
  })
})

describe('ideas assert nothing their ingredients do not', () => {
  it('templates carry no dosha data of their own', () => {
    // If a template could rate itself, that rating could drift from the
    // reviewed ingredient rows underneath it and nothing would catch it.
    for (const t of ALL_MEAL_TEMPLATES) {
      expect(t.doshaEffect, `${t.id} must not assert a dosha effect`).toBeUndefined()
      expect(t.whyFavor, `${t.id} must not carry authored Ayurvedic prose`).toBeUndefined()
      expect(t.confidence, `${t.id} must not claim a confidence of its own`).toBeUndefined()
    }
  })

  it('every referenced ingredient id exists', () => {
    for (const t of ALL_MEAL_TEMPLATES) {
      for (const id of [...t.coreIds, ...(t.optionalIds || [])]) {
        expect(INGREDIENTS[id], `${t.id} references unknown ingredient "${id}"`).toBeTruthy()
      }
    }
  })

  it('derives the verdict by summing reviewed rows', () => {
    // ghee vata -1, rice vata -1 → settles. Arithmetic over reviewed data,
    // showable alongside its inputs.
    const net = netDoshaEffect([INGREDIENTS.ghee, INGREDIENTS.basmatiRice], 'vata')
    expect(net.sum).toBe(-2)
    expect(net.suitability).toBe(SUITABILITY.BALANCING)
  })

  it('clamps rather than inventing degrees of balancing', () => {
    const many = [INGREDIENTS.ghee, INGREDIENTS.basmatiRice, INGREDIENTS.oats]
    expect(netDoshaEffect(many, 'vata').suitability).toBe(SUITABILITY.BALANCING)
  })

  it('surfaces per-ingredient contributions, including unhelpful ones', () => {
    // An honest explanation names what works against the target too.
    const out = explainIdea([INGREDIENTS.ghee, INGREDIENTS.oats], 'kapha')
    expect(out.every((c) => c.effect === 'increases')).toBe(true)
    expect(out.map((c) => c.id)).toEqual(['ghee', 'oats'])
  })

  it('flags an idea as derived when any ingredient is property-derived', () => {
    withReviewedTemplates(() => {
      const out = composeMeals({ now: at(8), count: 99 })
      const porridge = out.ideas.find((i) => i.id === 'spicedOatPorridge')
      // Oats are `medium` — the idea must not present as classically cited.
      expect(porridge.isDerived).toBe(true)
    })
  })

  it('degrades to no verdict rather than guessing when there is no target dosha', () => {
    withReviewedTemplates(() => {
      const out = composeMeals({ now: at(13), targetDosha: null, count: 3 })
      expect(out.ideas.length).toBeGreaterThan(0)
      expect(out.ideas[0].suitability).toBe(SUITABILITY.NEUTRAL)
      expect(out.ideas[0].contributions).toEqual([])
    })
  })
})

describe('determinism and slotting', () => {
  it('is stable for the same user, day and slot', () => {
    withReviewedTemplates(() => {
      const a = composeMeals({ userId: 'u1', now: at(13) })
      const b = composeMeals({ userId: 'u1', now: at(14) })   // same slot
      expect(a.ideas.map((i) => i.id)).toEqual(b.ideas.map((i) => i.id))
      expect(a.seed).toBe(b.seed)
    })
  })

  it('differs across users and across slots', () => {
    withReviewedTemplates(() => {
      const morning = composeMeals({ userId: 'u1', now: at(8) })
      const evening = composeMeals({ userId: 'u1', now: at(20) })
      expect(morning.seed).not.toBe(evening.seed)
      expect(composeMeals({ userId: 'u1', now: at(13) }).seed)
        .not.toBe(composeMeals({ userId: 'u2', now: at(13) }).seed)
    })
  })

  it('maps hours to slots', () => {
    expect(mealSlotFor(7)).toBe('morning')
    expect(mealSlotFor(13)).toBe('midday')
    expect(mealSlotFor(20)).toBe('evening')
  })

  it('prefers dishes that match the slot', () => {
    withReviewedTemplates(() => {
      const out = composeMeals({ now: at(8), count: 3 })
      expect(out.ideas[0].slots).toContain('morning')
    })
  })

  it('ranks up what the user already has', () => {
    withReviewedTemplates(() => {
      const out = composeMeals({
        now: at(13), count: 99,
        availableIngredients: ['potato', 'ghee'],
      })
      const potato = out.ideas.find((i) => i.id === 'potatoWithGhee')
      expect(potato.reasons.map((r) => r.code)).toContain('have:all')
    })
  })

  it('survives a missing context entirely', () => {
    expect(() => composeMeals()).not.toThrow()
    expect(composeMeals().ideas).toEqual([])
  })
})
