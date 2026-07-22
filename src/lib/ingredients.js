// ─────────────────────────────────────────────────────────────────────────────
//  ingredients.js (lib) — the ONLY way the app reads food data
//
//  Every read goes through here so two invariants can't be bypassed by a
//  careless caller:
//
//    1. THE REVIEW GATE. Only `reviewStatus: 'reviewed'` rows are ever
//       returned. Drafts are drafted from the classical framework but NOT yet
//       fact-checked by a human, and shipping them would make the app
//       confidently wrong — the exact failure the whole design exists to
//       prevent. Importing INGREDIENTS directly in a component defeats this;
//       don't.
//
//    2. COVERAGE HONESTY. A miss returns an explicit "not in our reference"
//       result, never a guess and never a silently-empty screen. The UI is
//       expected to say so plainly.
//
//  Dosha interpretation is delegated to lib/doshaSemantics.js — foods and
//  practices use OPPOSITE sign conventions, and nothing here re-derives that.
// ─────────────────────────────────────────────────────────────────────────────

import { ALL_INGREDIENTS, INGREDIENTS } from '../data/ayurveda/ingredients'
import { foodSuitability, SUITABILITY } from './doshaSemantics'
import { exclusionFor } from './dietSafety'

/** Rows cleared for display. Computed once — the dataset is static. */
const REVIEWED = ALL_INGREDIENTS.filter((i) => i.reviewStatus === 'reviewed')

/**
 * The reviewed rows, for browse surfaces that list foods rather than search
 * them. Exported so no UI is ever tempted to import INGREDIENTS directly and
 * filter for itself — that is how a draft reaches a user.
 */
export const REVIEWED_INGREDIENTS = REVIEWED

/** How much of the dataset is actually live. Used for coverage messaging. */
export function coverageStats() {
  return {
    reviewed: REVIEWED.length,
    total: ALL_INGREDIENTS.length,
    draft: ALL_INGREDIENTS.length - REVIEWED.length,
  }
}

/**
 * Look up one ingredient by id. Returns null for unknown OR unreviewed ids —
 * the caller cannot tell the difference, which is deliberate: an unreviewed
 * entry must behave exactly as if it does not exist.
 * @param {string} id
 */
export function getIngredient(id) {
  const hit = INGREDIENTS[id]
  return hit && hit.reviewStatus === 'reviewed' ? hit : null
}

/**
 * Search reviewed ingredients.
 *
 * Matching mirrors the fix already made in DiscoverPage: names and aliases
 * match on substring (people type partial words), but PROSE fields match only
 * at a word boundary. Raw substring matching on prose is what once made "mal"
 * match Vrksasana via its benefits text.
 *
 * @param {string} query
 * @returns {{results: object[], coverageMiss: boolean, query: string}}
 */
export function searchIngredients(query) {
  const q = String(query ?? '').trim().toLowerCase()
  if (q.length < 2) return { results: [], coverageMiss: false, query: q }

  const wordBoundary = new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')

  const results = REVIEWED.filter((i) => {
    if (i.name.toLowerCase().includes(q)) return true
    if ((i.sanskrit || '').toLowerCase().includes(q)) return true
    if ((i.aliases || []).some((a) => a.toLowerCase().includes(q))) return true
    // Prose: word-boundary only.
    return wordBoundary.test(i.whyFavor || '') || wordBoundary.test(i.whyAvoid || '')
  })

  return { results, coverageMiss: results.length === 0, query: q }
}

/**
 * How this food sits with a given dosha, in display terms.
 *
 * Returns the shared balancing/neutral/caution vocabulary rather than a raw
 * number, so no caller ever has to know which sign convention this dataset
 * uses. See doshaSemantics.js.
 *
 * @param {object} ingredient
 * @param {'vata'|'pitta'|'kapha'} dosha
 */
export function suitabilityFor(ingredient, dosha) {
  if (!ingredient || !dosha) return SUITABILITY.NEUTRAL
  return foodSuitability(ingredient.doshaEffect?.[dosha])
}

/**
 * Everything a result view needs for one ingredient and one user, resolved in
 * one place: dosha fit, safety exclusion, and whether the guidance is
 * classically attested or property-derived.
 *
 * @param {object} ingredient
 * @param {'vata'|'pitta'|'kapha'|null} targetDosha
 * @param {{allergens?: string[], patterns?: string[]}} dietPrefs
 */
export function describeForUser(ingredient, targetDosha, dietPrefs = {}) {
  if (!ingredient) return null
  const exclusion = exclusionFor(ingredient, dietPrefs)
  const suitability = targetDosha ? suitabilityFor(ingredient, targetDosha) : null

  return {
    ingredient,
    targetDosha,
    suitability,
    // Safety outranks dosha fit in the UI: an allergen is never presented as
    // merely "not ideal for you".
    exclusion,
    isDerived: ingredient.confidence === 'medium',
    citation: ingredient.source,
  }
}
