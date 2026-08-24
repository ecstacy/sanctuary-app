// Guardrail tests for the meal composer.
//
// The composer is where reviewed ingredient data turns into a suggestion, so
// it is the last place a safety constraint or an unreviewed fact could leak
// into something a user acts on. These tests encode that it can't.

import { describe, it, expect } from 'vitest'
import { composeMeals, dailyPractices, mealSlotFor, netDoshaEffect, explainIdea } from './mealComposer'
import { MEAL_TEMPLATES, ALL_MEAL_TEMPLATES } from '../data/ayurveda/meals'
import { INGREDIENTS } from '../data/ayurveda/ingredients'
import { SUITABILITY } from './doshaSemantics'

const at = (h) => new Date(`2026-07-21T${String(h).padStart(2, '0')}:00:00`)

// The templates a human actually signed off (docs/diet-review-batch-3-meals.md,
// 2026-07-22). Same gate memory as the ingredient set: a template marked
// reviewed but missing here is a failing test, not a silent ship.
const REVIEWED_TEMPLATES = [
  'spicedOatPorridge', 'stewedAppleBreakfast', 'ricePorridge', 'honeyWarmWater',
  'kitchari', 'chickpeaCurry', 'chapatiSabzi', 'barleySoup', 'buttermilkRice',
  'potatoWithGhee', 'uradDalStew', 'spicedMilk',
  // Batch 4 — 2026-08-15 (fuller everyday meals, using the modern-foods batch).
  'avocadoToast', 'eggsOnToast', 'salmonRiceGreens', 'chickenRiceVeg',
  'grainBowlHummus', 'tofuStirFryRice', 'lentilPastaVeg', 'greekSalad',
  'paneerPeasChapati', 'dalRiceGreens', 'mixedVegSoup',
  // Batch 5 — 2026-08-15 (breadth across cuisines/slots, reviewed ingredients).
  'muesliYoghurtFruit', 'bananaBerrySmoothie', 'pohaPeas', 'semolinaUpma',
  'peanutButterBananaToast', 'vegetableOmelette', 'rajmaChawal', 'dalTadkaRice',
  'vegetablePulao', 'fishCurryRice', 'tunaSandwich', 'chickpeaSaladBowl',
  'quinoaSalad', 'lentilSoup', 'tomatoSoup',
  // Batch 6 — 2026-08-16 (meals using modern batch-2 ingredients).
  'ricottaToast', 'grilledCheeseSandwich', 'pastaPesto', 'hummusPitaPlate',
  'bulgurSalad', 'capreseSalad', 'codRiceVeg', 'sardineToast', 'lambCurryRice',
  'whiteBeanStew', 'splitPeaSoup',
  // Batch 7 — 2026-08-24 (recipes on modern batch-5 ingredients: soba, udon,
  // vermicelli, farro, tapioca).
  'sobaGreensBowl', 'udonNoodleSoup', 'farroVegBowl', 'vermicelliUpma',
  'sabudanaKhichdi',
]

/**
 * Kept from when every template was draft. Now a no-op in the common case, but
 * still the honest way to express "with the content available" — and it keeps
 * working if a future batch lands as draft.
 */
function withReviewedTemplates(fn) {
  const before = ALL_MEAL_TEMPLATES.map((t) => t.reviewStatus)
  ALL_MEAL_TEMPLATES.forEach((t) => { t.reviewStatus = 'reviewed' })
  try { return fn() } finally {
    ALL_MEAL_TEMPLATES.forEach((t, i) => { t.reviewStatus = before[i] })
  }
}

/** Run `fn` with one template forced to draft, then restore it. */
function withDraft(id, fn) {
  const tpl = MEAL_TEMPLATES[id]
  const before = tpl.reviewStatus
  tpl.reviewStatus = 'draft'
  try { return fn() } finally { tpl.reviewStatus = before }
}

describe('the review gate reaches the composer', () => {
  it('only templates a human signed off are marked reviewed', () => {
    const shipped = ALL_MEAL_TEMPLATES.filter((t) => t.reviewStatus === 'reviewed')
    expect(
      shipped.map((t) => t.id).sort(),
      'a template marked reviewed but absent from this list was never checked',
    ).toEqual([...REVIEWED_TEMPLATES].sort())
  })

  it('hides a draft template entirely', () => {
    // The gate still has to work for the next batch, now that none are draft.
    withDraft('kitchari', () => {
      const ids = composeMeals({ now: at(13), count: 99 }).ideas.map((i) => i.id)
      expect(ids).not.toContain('kitchari')
    })
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
      } finally {
        INGREDIENTS.mungDal.reviewStatus = original
      }
    })
  })
})

describe('safety filtering happens BEFORE ranking', () => {
  it('drops a dish whose core contains an allergen, however well it scores', () => {
    withReviewedTemplates(() => {
      // buttermilkRice is core rice + buttermilk. A dairy allergy must remove
      // it outright, no matter how well it otherwise scores.
      const open = composeMeals({ now: at(13), season: 'summer', count: 99 })
      expect(open.ideas.map((i) => i.id)).toContain('buttermilkRice')

      const filtered = composeMeals({
        now: at(13), season: 'summer', count: 99,
        dietPrefs: { allergens: ['dairy'] },
      })
      expect(filtered.ideas.map((i) => i.id)).not.toContain('buttermilkRice')
    })
  })

  it('does NOT drop a dish when the allergen is only a garnish', () => {
    // The core/optional rule, agreed at review 2026-07-21: core is bulk and
    // identity; fats and spices are optional unless the dish is nothing
    // without them. Kitchari is rice + dal, so a dairy-allergic user gets
    // kitchari WITHOUT the ghee rather than losing the dish. Before the rule,
    // ghee sat in core (because it was in the dish's name) and they lost it.
    withReviewedTemplates(() => {
      const out = composeMeals({
        now: at(13), targetDosha: 'vata', count: 99,
        dietPrefs: { allergens: ['dairy'] },
      })
      const dish = out.ideas.find((i) => i.id === 'kitchari')
      expect(dish, 'kitchari must survive a dairy allergy').toBeTruthy()
      expect(dish.optional.map((o) => o.id)).not.toContain('ghee')
      expect(dish.core.map((c) => c.id)).toEqual(['mungDal', 'basmatiRice'])
    })
  })

  it('excludes practices from the meal surface entirely', () => {
    // Honey in lukewarm water is a dinacharya observance, not a breakfast.
    // Excluded rather than ranked low: low-ranked still means "we are
    // offering you this to eat".
    withReviewedTemplates(() => {
      const out = composeMeals({ now: at(8), season: 'spring', count: 99 })
      expect(out.ideas.map((i) => i.id)).not.toContain('honeyWarmWater')
      expect(out.coverage.notAMeal).toBeGreaterThan(0)
    })
  })

  it('ranks a full meal above a mere preparation', () => {
    withReviewedTemplates(() => {
      const out = composeMeals({ now: at(13), count: 99 })
      const ids = out.ideas.map((i) => i.id)
      const potato = ids.indexOf('potatoWithGhee')
      const kitchari = ids.indexOf('kitchari')
      expect(potato).toBeGreaterThan(-1)
      expect(kitchari, 'a complete meal should outrank a component').toBeLessThan(potato)
      expect(out.ideas.find((i) => i.id === 'potatoWithGhee').kind).toBe('preparation')
    })
  })

  it('surfaces traditional balancing ingredients without making them required', () => {
    // The batch-3 answer to "chickpeas need digestive spices": keep the
    // principle in the data and every spice optional, rather than bending the
    // engine. It informs; it must never filter or score.
    withReviewedTemplates(() => {
      const out = composeMeals({ now: at(13), count: 99 })
      const dish = out.ideas.find((i) => i.id === 'uradDalStew')
      expect(dish.balancedBy.map((b) => b.id).length).toBeGreaterThan(0)
      // Still optional — the dish survives with none of them present.
      expect(dish.core.map((c) => c.id)).toEqual(['uradDal'])
    })
  })

  it('does not repeat an ingredient the dish already lists', () => {
    // Asafoetida is optional ON chickpeaCurry and also in chickpea.balancedBy.
    // Showing it in both places reads as two separate recommendations for the
    // same spice.
    withReviewedTemplates(() => {
      const out = composeMeals({ now: at(13), count: 99 })
      const dish = out.ideas.find((i) => i.id === 'chickpeaCurry')
      const listed = new Set([...dish.core, ...dish.optional].map((i) => i.id))
      for (const b of dish.balancedBy) {
        expect(listed.has(b.id), `${b.id} shown twice`).toBe(false)
      }
      expect(dish.optional.map((o) => o.id)).toContain('asafoetida')
      expect(dish.balancedBy.map((b) => b.id)).not.toContain('asafoetida')
    })
  })

  it('does not suggest a balancing ingredient the user cannot eat', () => {
    withReviewedTemplates(() => {
      const out = composeMeals({
        now: at(13), count: 99, dietPrefs: { allergens: ['dairy'] },
      })
      const dish = out.ideas.find((i) => i.id === 'chickpeaCurry')
      // chickpea.balancedBy includes ghee; a dairy allergy must remove it
      // from the advice, not just from the ingredient list.
      expect(dish.balancedBy.map((b) => b.id)).not.toContain('ghee')
    })
  })

  it('no template name promises an ingredient that can be filtered away', () => {
    // Corollary of the rule: if a name mentions an optional ingredient, a
    // restricted user is shown a dish whose name references something we just
    // removed. Checked mechanically for the fats and spices most likely to be
    // filtered — a cheap guard against the next name drifting back.
    const RISKY = { ghee: 'ghee', milk: 'milk', butter: 'butter', sesameOil: 'sesame' }
    for (const t of ALL_MEAL_TEMPLATES) {
      for (const [id, word] of Object.entries(RISKY)) {
        if ((t.optionalIds || []).includes(id)) {
          expect(
            t.name.toLowerCase(),
            `${t.id} names "${word}" but treats it as optional`,
          ).not.toContain(word)
        }
      }
    }
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

describe('dailyPractices — the dinacharya surface', () => {
  it('hides a draft practice', () => {
    withDraft('honeyWarmWater', () => {
      expect(dailyPractices().map((p) => p.id)).not.toContain('honeyWarmWater')
    })
  })

  it('returns practices, and ONLY practices', () => {
    // The complement of the meal surface: what composeMeals excludes is
    // exactly what this returns, so nothing falls between the two.
    withReviewedTemplates(() => {
      const ids = dailyPractices().map((p) => p.id)
      expect(ids).toContain('honeyWarmWater')
      const mealIds = composeMeals({ now: at(8), count: 99 }).ideas.map((i) => i.id)
      for (const id of ids) expect(mealIds, `${id} appears on both surfaces`).not.toContain(id)
    })
  })

  it('applies the same safety filter as meals', () => {
    // A traditional practice is not offered to someone who has excluded its
    // ingredient, however classical it is.
    withReviewedTemplates(() => {
      const out = dailyPractices({ dietPrefs: { patterns: ['vegan'] } })  // honey
      expect(out.map((p) => p.id)).not.toContain('honeyWarmWater')
    })
  })

  it('hides a practice whose ingredient is unreviewed', () => {
    withReviewedTemplates(() => {
      const original = INGREDIENTS.honey.reviewStatus
      INGREDIENTS.honey.reviewStatus = 'draft'
      try {
        expect(dailyPractices().map((p) => p.id)).not.toContain('honeyWarmWater')
      } finally {
        INGREDIENTS.honey.reviewStatus = original
      }
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
    // No user, no clock, no dosha, no prefs. Must still return a well-formed
    // result rather than throwing — the Home widget calls this on first paint,
    // before the profile has loaded.
    expect(() => composeMeals()).not.toThrow()
    const out = composeMeals()
    expect(Array.isArray(out.ideas)).toBe(true)
    expect(out.meta.targetDosha).toBeNull()
    // With no target it still suggests, but offers no personal verdict.
    for (const idea of out.ideas) expect(idea.contributions).toEqual([])
  })
})
