// ─────────────────────────────────────────────────────────────────────────────
//  dietPrefs.js — the shape of a user's stored diet preferences
//
//  Split out from useDietPrefs so the normaliser is a pure function with no
//  React and no Supabase behind it. That matters for more than tidiness: this
//  is the boundary between untrusted stored JSON (profiles.diet_prefs is
//  client-written jsonb) and a safety filter, and boundary code should be
//  testable without a browser.
// ─────────────────────────────────────────────────────────────────────────────

import { ALLERGEN_KEYS, PATTERN_KEYS } from './dietSafety'

const ALLERGEN_SET = new Set(ALLERGEN_KEYS)
const PATTERN_SET  = new Set(PATTERN_KEYS)

export const EMPTY_DIET_PREFS = Object.freeze({ allergens: [], patterns: [] })

/**
 * Coerce whatever is stored into a known-good shape.
 *
 * DROPS unrecognised keys rather than passing them through. A stale or
 * hand-edited key would round-trip through the database and then match no
 * exclusion rule — a preference the user believes is on, silently doing
 * nothing. `nightshade` is the real case: it was an allergen key until review
 * moved it to a pattern, and any value stored under the old key must not
 * survive as a dead allergen.
 *
 * Normalisation must stay identical to `dietSafety`'s, or a value saved here
 * would fail to match at filter time. A test asserts the round trip.
 *
 * @param {{allergens?: unknown, patterns?: unknown}} raw
 * @returns {{allergens: string[], patterns: string[]}}
 */
export function normalizeDietPrefs(raw) {
  const pick = (list, allowed) =>
    Array.isArray(list)
      ? [...new Set(
          list
            .filter((k) => typeof k === 'string')
            .map((k) => k.trim().toLowerCase().replace(/[\s-]+/g, '_'))
            .filter((k) => allowed.has(k)),
        )].sort()
      : []
  return {
    allergens: pick(raw?.allergens, ALLERGEN_SET),
    patterns:  pick(raw?.patterns,  PATTERN_SET),
  }
}
