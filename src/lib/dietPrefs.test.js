// Tests for the diet-prefs normaliser.
//
// This is the boundary between untrusted stored JSON and the safety filter, so
// the failure it guards is the same one as everywhere else in this feature: a
// preference that LOOKS set and filters nothing.

import { describe, it, expect } from 'vitest'
import { normalizeDietPrefs } from '../lib/dietPrefs'
import { exclusionFor, ALLERGEN_KEYS, PATTERN_KEYS } from '../lib/dietSafety'
import { INGREDIENTS } from '../data/ayurveda/ingredients'

describe('normalizeDietPrefs', () => {
  it('keeps canonical keys', () => {
    const out = normalizeDietPrefs({ allergens: ['dairy', 'nuts'], patterns: ['vegan'] })
    expect(out).toEqual({ allergens: ['dairy', 'nuts'], patterns: ['vegan'] })
  })

  it('normalises casing and spacing the same way the filter does', () => {
    // Must match dietSafety's normalisation exactly, or a value saved here
    // would fail to match at filter time.
    const out = normalizeDietPrefs({ allergens: [' Dairy '], patterns: ['No-Onion-Garlic'] })
    expect(out.allergens).toEqual(['dairy'])
    expect(out.patterns).toEqual(['no_onion_garlic'])
  })

  it('DROPS unrecognised keys rather than storing them', () => {
    // A stale or hand-edited key would round-trip through the database and
    // then match no rule — a preference the user believes is on, doing
    // nothing. 'nightshade' is the real case: it used to be an allergen.
    const out = normalizeDietPrefs({
      allergens: ['dairy', 'nightshade', 'unicorn'],
      patterns:  ['vegan', 'paleo'],
    })
    expect(out.allergens).toEqual(['dairy'])
    expect(out.patterns).toEqual(['vegan'])
  })

  it('survives malformed stored values', () => {
    for (const bad of [null, undefined, {}, { allergens: 'dairy' }, { allergens: [1, null, {}] }]) {
      expect(() => normalizeDietPrefs(bad)).not.toThrow()
      expect(normalizeDietPrefs(bad)).toEqual({ allergens: [], patterns: [] })
    }
  })

  it('de-duplicates and sorts, so saved order never changes behaviour', () => {
    const out = normalizeDietPrefs({ allergens: ['nuts', 'dairy', 'nuts'] })
    expect(out.allergens).toEqual(['dairy', 'nuts'])
  })

  it('offers exactly the keys the filter implements', () => {
    // The picker renders ALLERGEN_KEYS/PATTERN_KEYS directly, so anything
    // offered is by construction something exclusionFor can act on. This
    // asserts that stays true.
    for (const key of PATTERN_KEYS) {
      expect(normalizeDietPrefs({ patterns: [key] }).patterns, key).toEqual([key])
    }
    for (const key of ALLERGEN_KEYS) {
      expect(normalizeDietPrefs({ allergens: [key] }).allergens, key).toEqual([key])
    }
  })

  it('round-trips into a working exclusion', () => {
    // End to end: what the picker stores is what the filter reads.
    const stored = normalizeDietPrefs({ allergens: ['DAIRY'], patterns: [] })
    expect(exclusionFor(INGREDIENTS.ghee, stored).excluded).toBe(true)
    expect(exclusionFor(INGREDIENTS.basmatiRice, stored).excluded).toBe(false)
  })
})
