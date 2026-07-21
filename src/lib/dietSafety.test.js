// Guardrail tests for the diet feature.
//
// These are not incidental coverage — they encode the three promises the
// feature is built on (docs/diet-feature-plan.md §2, §6):
//   1. unreviewed facts never reach a user,
//   2. an allergen is never surfaced, whatever its dosha score,
//   3. we stop advising and point to a professional when we should.
// If one of these fails, the feature is not safe to ship.

import { describe, it, expect, afterEach } from 'vitest'
import {
  ALLERGENS, DIET_PATTERNS, PATTERN_KEYS, PATTERNS_WITH_RULES,
  detectSeekHelp, needsSofterHandling, messageForTriggers,
  exclusionFor, filterSafe, allergensOf, unknownSafetyKeys,
  DISORDERED_EATING_MESSAGE, SEEK_HELP_MESSAGE,
} from './dietSafety'
import { INGREDIENTS, ALL_INGREDIENTS } from '../data/ayurveda/ingredients'
import { getIngredient, searchIngredients, coverageStats, suitabilityFor } from './ingredients'
import { SUITABILITY } from './doshaSemantics'

// The set a human actually fact-checked against Charaka. This list is the
// gate's memory: an entry marked reviewed but missing here is a failing test,
// not a silent ship. When a batch is signed off, add its ids here — and only
// here.
const REVIEWED_SIGNED_OFF = [
  // Batch 1 — signed off 2026-07-21 (docs/diet-review-batch-1.md)
  'basmatiRice', 'oats', 'ghee', 'yoghurt', 'gingerFresh', 'gingerDry',
  'mungDal', 'ryeBread', 'coffee',
  // Batch 2 — signed off 2026-07-21 (docs/diet-review-batch-2.md).
  // 24 entries reviewed, 26 rows out: `onion` split into onionRaw/onionCooked
  // and `apple` into apple/appleStewed, both at the reviewer's direction.
  'wheat', 'barley', 'uradDal', 'chickpea',
  'milk', 'buttermilk', 'butter', 'hardCheese',
  'honey', 'jaggery', 'sesameOil', 'oliveOil',
  'blackPepper', 'turmeric', 'cumin', 'corianderSeed', 'fennel', 'asafoetida',
  'garlic', 'onionRaw', 'onionCooked',
  'potato', 'spinach', 'apple', 'appleStewed', 'almond',
]

describe('the review gate — unreviewed facts must not reach users', () => {
  it('only entries a human signed off are marked reviewed', () => {
    const shipped = ALL_INGREDIENTS.filter((i) => i.reviewStatus === 'reviewed')
    expect(
      shipped.map((i) => i.id).sort(),
      'an entry marked reviewed but absent from this list was never fact-checked against Charaka',
    ).toEqual([...REVIEWED_SIGNED_OFF].sort())
  })

  it('getIngredient hides draft rows entirely', () => {
    // Simulate an unreviewed row rather than depending on one existing: once
    // every seeded entry is reviewed, the gate still has to work for batch 2.
    INGREDIENTS.ghee.reviewStatus = 'draft'
    expect(INGREDIENTS.ghee).toBeTruthy()          // exists in the dataset
    expect(getIngredient('ghee')).toBeNull()       // but is invisible to the app
  })

  it('an unknown id and an unreviewed id are indistinguishable to callers', () => {
    // Deliberate: a draft must behave exactly as if it does not exist, so no
    // caller can special-case its way around the gate.
    INGREDIENTS.ghee.reviewStatus = 'draft'
    expect(getIngredient('ghee')).toBe(getIngredient('nonexistentFood'))
  })

  it('coverage stats report the gate honestly', () => {
    const s = coverageStats()
    expect(s.total).toBeGreaterThan(0)
    expect(s.reviewed).toBe(REVIEWED_SIGNED_OFF.length)
    expect(s.reviewed + s.draft).toBe(s.total)
  })

  afterEach(() => { INGREDIENTS.ghee.reviewStatus = 'reviewed' })
})

describe('the gate opens correctly once a row is reviewed', () => {
  it('a reviewed row is visible to lookup and to search', () => {
    expect(getIngredient('ghee')).toBeTruthy()
    expect(getIngredient('ghee').name).toBe('Ghee')
    expect(searchIngredients('ghee').results.map((i) => i.id)).toContain('ghee')
    expect(searchIngredients('ghee').coverageMiss).toBe(false)
  })

  it('a food outside the reference reports a coverage miss, never a guess', () => {
    const { results, coverageMiss } = searchIngredients('bratwurst')
    expect(results).toEqual([])
    expect(coverageMiss).toBe(true)
  })
})

describe('allergens are an absolute filter, not a ranking penalty', () => {
  const ghee = INGREDIENTS.ghee
  const rice = INGREDIENTS.basmatiRice

  it('excludes an allergen even when it is ideal for the dosha', () => {
    // Ghee pacifies both Vata and Pitta — the strongest possible "favor" —
    // and must still be removed for a dairy allergy.
    expect(suitabilityFor(ghee, 'vata')).toBe(SUITABILITY.BALANCING)
    const { excluded, reason, key } = exclusionFor(ghee, { allergens: [ALLERGENS.DAIRY] })
    expect(excluded).toBe(true)
    expect(reason).toBe('allergen')
    expect(key).toBe('dairy')
  })

  it('reports allergens distinctly from dietary patterns', () => {
    // The UI must not describe an allergen as merely "doesn't suit your diet".
    expect(exclusionFor(ghee, { allergens: ['dairy'] }).reason).toBe('allergen')
    expect(exclusionFor(ghee, { patterns: [DIET_PATTERNS.VEGAN] }).reason).toBe('pattern')
  })

  it('filterSafe REMOVES rather than down-ranks', () => {
    const out = filterSafe([ghee, rice], { allergens: ['dairy'] })
    expect(out.map((i) => i.id)).toEqual(['basmatiRice'])
  })

  it('leaves unaffected foods alone', () => {
    expect(exclusionFor(rice, { allergens: ['dairy', 'nuts'] }).excluded).toBe(false)
  })

  it('handles an empty or missing profile without excluding everything', () => {
    expect(filterSafe([ghee, rice], {})).toHaveLength(2)
    expect(filterSafe([ghee, rice], undefined)).toHaveLength(2)
  })

  it('vegan excludes dairy; vegetarian does not', () => {
    expect(exclusionFor(ghee, { patterns: ['vegan'] }).excluded).toBe(true)
    expect(exclusionFor(ghee, { patterns: ['vegetarian'] }).excluded).toBe(false)
  })
})

describe('the exclusion path fails CLOSED, not open', () => {
  // Every bug this block guards has the same shape: the filter looks present
  // and does nothing, so the user is told an excluded food suits them. That
  // is the harmful direction, and none of it is visible from the UI.

  it('matches allergens regardless of casing or spacing in stored prefs', () => {
    // diet_prefs is client-written jsonb: 'Dairy', ' dairy ' and 'DAIRY' all
    // occur. An exact Set comparison fails on every one of them — and fails
    // open, telling an allergic user their allergen is fine.
    for (const variant of ['dairy', 'Dairy', 'DAIRY', ' dairy ', 'Dairy ']) {
      const out = exclusionFor(INGREDIENTS.ghee, { allergens: [variant] })
      expect(out.excluded, `variant ${JSON.stringify(variant)}`).toBe(true)
      expect(out.reason).toBe('allergen')
    }
  })

  it('normalises pattern keys the same way', () => {
    expect(exclusionFor(INGREDIENTS.garlic, { patterns: ['No-Onion-Garlic'] }).excluded).toBe(true)
    expect(exclusionFor(INGREDIENTS.garlic, { patterns: ['JAIN'] }).excluded).toBe(true)
  })

  it('implies the dairy allergen from the category even if the row omits it', () => {
    // A row that forgets `allergens: ['dairy']` must not thereby become safe.
    const forgetful = { id: 'x', category: 'dairy', allergens: [] }
    expect(allergensOf(forgetful)).toContain('dairy')
    expect(exclusionFor(forgetful, { allergens: ['dairy'] }).excluded).toBe(true)
  })

  it('reports every matching allergen, not just the first', () => {
    const both = { id: 'y', category: 'other', allergens: ['gluten', 'sesame'] }
    const out = exclusionFor(both, { allergens: ['sesame', 'gluten'] })
    expect(out.all.map((h) => h.key)).toEqual(['gluten', 'sesame'])  // sorted, deterministic
  })

  it('every declared dietary pattern actually has a rule', () => {
    // A pattern in DIET_PATTERNS with no rule in exclusionFor is a filter the
    // user believes is on while it does nothing — exactly how 'allium' and
    // 'root' sat dead for a release.
    expect([...PATTERNS_WITH_RULES].sort()).toEqual(PATTERN_KEYS.slice().sort())
  })

  it('no entry carries an unknown allergen or tag key', () => {
    // A typo like 'diary' or 'alium' matches no rule and so filters nothing.
    for (const i of ALL_INGREDIENTS) {
      expect(unknownSafetyKeys(i), `${i.id} has unrecognised safety keys`).toEqual([])
    }
  })

  it('halal and kosher exclude meat rather than implying approval', () => {
    // We cannot certify anything. Staying silent on an animal food would read
    // as "this is fine for you", so we exclude and the UI says we can't confirm.
    const meat = { id: 'z', category: 'animal' }
    expect(exclusionFor(meat, { patterns: ['halal'] }).excluded).toBe(true)
    expect(exclusionFor(meat, { patterns: ['kosher'] }).excluded).toBe(true)
  })

  it('treats animal rennet as not vegetarian, despite the dairy category', () => {
    // Rennet is slaughter-derived. The dairy category alone would let a hard
    // cheese through a vegetarian filter.
    expect(exclusionFor(INGREDIENTS.hardCheese, { patterns: ['vegetarian'] }).excluded).toBe(true)
    expect(exclusionFor(INGREDIENTS.hardCheese, { patterns: ['vegan'] }).excluded).toBe(true)
  })

  it('excludes potato for a nightshade allergy', () => {
    // 'nightshade' was a canonical allergen key from the start, and potato was
    // the first food in the dataset that is one — untagged, it matched nothing.
    expect(exclusionFor(INGREDIENTS.potato, { allergens: ['nightshade'] }).excluded).toBe(true)
  })

  it('survives malformed prefs instead of failing open on a crash', () => {
    for (const prefs of [null, undefined, {}, { allergens: null }, { patterns: 'vegan' }, { allergens: [1, null] }]) {
      expect(() => exclusionFor(INGREDIENTS.ghee, prefs)).not.toThrow()
    }
    // A string where an array belongs must not be treated as a set of chars.
    expect(exclusionFor(INGREDIENTS.ghee, { patterns: 'vegan' }).excluded).toBe(false)
  })
})

describe('pattern exclusions rely on dietTags, which entries must actually set', () => {
  // `exclusionFor` has always honoured 'allium'/'root', but for a while no
  // entry set them — so the rule was live and doing nothing. These tests bind
  // the rule to real rows so a future entry can't quietly go untagged.
  // (Reads INGREDIENTS directly: most of these are batch-2 drafts.)
  it('excludes alliums for Jain and no-onion-garlic', () => {
    for (const p of ['jain', 'no_onion_garlic']) {
      expect(exclusionFor(INGREDIENTS.garlic, { patterns: [p] }).excluded, `garlic/${p}`).toBe(true)
      // Both halves of the onion split must stay tagged — a split is an easy
      // place to drop a safety tag on one row and not notice.
      expect(exclusionFor(INGREDIENTS.onionRaw, { patterns: [p] }).excluded, `onionRaw/${p}`).toBe(true)
      expect(exclusionFor(INGREDIENTS.onionCooked, { patterns: [p] }).excluded, `onionCooked/${p}`).toBe(true)
    }
  })

  it('excludes roots for Jain only, not for no-onion-garlic', () => {
    expect(exclusionFor(INGREDIENTS.potato, { patterns: ['jain'] }).excluded).toBe(true)
    expect(exclusionFor(INGREDIENTS.potato, { patterns: ['no_onion_garlic'] }).excluded).toBe(false)
  })

  it('excludes fresh ginger for Jain but not dry ginger', () => {
    // Jain practice excludes the fresh underground root and permits the dried
    // spice. Tagging both, or neither, would be wrong in opposite directions.
    expect(exclusionFor(INGREDIENTS.gingerFresh, { patterns: ['jain'] }).excluded).toBe(true)
    expect(exclusionFor(INGREDIENTS.gingerDry, { patterns: ['jain'] }).excluded).toBe(false)
  })

  it('excludes honey for vegan but not vegetarian', () => {
    // Honey is a 'sweetener', so no category rule catches it — without the
    // animal_derived tag a vegan would be told it suits them.
    expect(exclusionFor(INGREDIENTS.honey, { patterns: ['vegan'] }).excluded).toBe(true)
    expect(exclusionFor(INGREDIENTS.honey, { patterns: ['vegan'] }).reason).toBe('pattern')
    expect(exclusionFor(INGREDIENTS.honey, { patterns: ['vegetarian'] }).excluded).toBe(false)
  })
})

describe('seek-help triggers', () => {
  it('detects pregnancy, conditions and medication', () => {
    expect(detectSeekHelp('is ginger safe while pregnant').categories).toContain('pregnancy')
    expect(detectSeekHelp('what should I eat with diabetes').categories).toContain('medical')
    expect(detectSeekHelp('does this interact with my medication').categories).toContain('medication')
  })

  it('is case-insensitive and matches inside sentences', () => {
    expect(detectSeekHelp('I am in my second TRIMESTER').triggered).toBe(true)
  })

  it('does not fire on ordinary food questions', () => {
    expect(detectSeekHelp('is rice good for vata').triggered).toBe(false)
    expect(detectSeekHelp('ghee').triggered).toBe(false)
    expect(detectSeekHelp('').triggered).toBe(false)
  })

  it('routes disordered-eating signals to the supportive message, not diet advice', () => {
    const { categories, triggered } = detectSeekHelp('how do I stop eating to lose weight fast')
    expect(triggered).toBe(true)
    expect(needsSofterHandling(categories)).toBe(true)
    expect(messageForTriggers(categories)).toBe(DISORDERED_EATING_MESSAGE)
  })

  it('uses the standard referral message for other triggers', () => {
    const { categories } = detectSeekHelp('I have kidney problems')
    expect(needsSofterHandling(categories)).toBe(false)
    expect(messageForTriggers(categories)).toBe(SEEK_HELP_MESSAGE)
  })
})

describe('dosha interpretation uses the FOOD convention', () => {
  it('-1 reads as balancing, +1 as caution', () => {
    // Ghee: vata -1 (pacifies), kapha +1 (aggravates). Reading these raw, or
    // with the asana convention, would invert the advice — that shipped once.
    expect(suitabilityFor(INGREDIENTS.ghee, 'vata')).toBe(SUITABILITY.BALANCING)
    expect(suitabilityFor(INGREDIENTS.ghee, 'kapha')).toBe(SUITABILITY.CAUTION)
    expect(suitabilityFor(INGREDIENTS.basmatiRice, 'kapha')).toBe(SUITABILITY.NEUTRAL)
  })

  it('degrades to neutral rather than guessing', () => {
    expect(suitabilityFor(null, 'vata')).toBe(SUITABILITY.NEUTRAL)
    expect(suitabilityFor(INGREDIENTS.ghee, null)).toBe(SUITABILITY.NEUTRAL)
  })
})

describe('dataset integrity', () => {
  it('every entry carries a source and a confidence level', () => {
    for (const i of ALL_INGREDIENTS) {
      expect(i.source, `${i.id} needs a source`).toBeTruthy()
      expect(['high', 'medium']).toContain(i.confidence)
      expect(['draft', 'reviewed']).toContain(i.reviewStatus)
    }
  })

  it('property-derived entries are marked medium and explain themselves', () => {
    // A food absent from the classical corpus must not masquerade as attested.
    for (const i of ALL_INGREDIENTS.filter((x) => x.source.text === 'modern')) {
      expect(i.confidence, `${i.id} is non-classical, so cannot be 'high'`).toBe('medium')
      expect(i.source.note, `${i.id} must say how it was derived`).toBeTruthy()
    }
  })

  it('classically-cited entries carry a verse reference', () => {
    for (const i of ALL_INGREDIENTS.filter((x) => x.source.text === 'CS')) {
      expect(i.source.verse, `${i.id} cites Charaka, so needs a verse`).toBeTruthy()
    }
  })

  it('dosha effects are only -1, 0 or 1', () => {
    for (const i of ALL_INGREDIENTS) {
      for (const d of ['vata', 'pitta', 'kapha']) {
        expect([-1, 0, 1], `${i.id}.${d}`).toContain(i.doshaEffect[d])
      }
    }
  })

  it('ids are unique and match their keys', () => {
    for (const [key, i] of Object.entries(INGREDIENTS)) expect(i.id).toBe(key)
  })
})
