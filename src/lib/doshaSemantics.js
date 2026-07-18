// ─────────────────────────────────────────────────────────────────────────────
//  doshaSemantics.js — the ONE place that knows what a dosha number means
//
//  THE PROBLEM THIS EXISTS TO PREVENT
//  ──────────────────────────────────
//  Two datasets in this repo encode dosha numbers with OPPOSITE signs, because
//  they measure different things:
//
//    src/data/asanas.js + pranayamas.js   doshaAffinity: { vata: 1 }
//        "how well does this practice SUIT this dosha"
//        +1 = balancing (good fit)   ·   -1 = caution (aggravating)
//
//    src/data/ayurveda/dietary.js         RASAS.effect: { vata: -1 }
//        "what does this food DO to this dosha's level"
//        -1 = pacifies (reduces it)  ·   +1 = aggravates (increases it)
//
//  Both are individually correct and classically defensible — a food's effect
//  is conventionally described as raising or lowering a dosha, while a
//  practice is described by its suitability. But a `+1` means the OPPOSITE
//  thing in each, and nothing in the code says so.
//
//  This is not hypothetical. While generating the public /poses pages, the
//  food convention was applied to asana data: every page rendered "Increases
//  vata" where the truth was "Balancing", inverting the advice on all 76 pages
//  while looking entirely plausible. It was caught only by cross-checking
//  against getDoshaTag().
//
//  THE FIX
//  ───────
//  Never read these raw numbers. Convert through the functions below, which
//  return the same SUITABILITY vocabulary for both domains, so callers reason
//  in meaning ("is this good for vata?") instead of in signs. The inversion
//  lives here, once, under test — see doshaSemantics.test.js.
//
//  This matters most for the diet feature (docs/diet-feature-plan.md), which
//  will join food data to dosha state and is exactly where the trap lies.
// ─────────────────────────────────────────────────────────────────────────────

/** The shared vocabulary. Both practices and foods normalize to this. */
export const SUITABILITY = {
  BALANCING: 'balancing',   // good for someone with this dosha aggravated
  NEUTRAL:   'neutral',
  CAUTION:   'caution',     // can aggravate — use sparingly
}

/** Direction a food moves a dosha's level. Distinct from suitability. */
export const FOOD_EFFECT = {
  DECREASES: 'decreases',
  NEUTRAL:   'neutral',
  INCREASES: 'increases',
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

/**
 * Suitability of a PRACTICE (asana / pranayama) for a dosha.
 * Source of truth: `doshaAffinity` in asanas.js / pranayamas.js.
 * Convention: +1 balancing, 0 neutral, -1 caution.
 * Also accepts the legacy string schema a few older entries still use.
 *
 * @param {number|string|null|undefined} affinity
 * @returns {'balancing'|'neutral'|'caution'}
 */
export function practiceSuitability(affinity) {
  const n = num(affinity)
  if (n !== null) {
    if (n > 0) return SUITABILITY.BALANCING
    if (n < 0) return SUITABILITY.CAUTION
    return SUITABILITY.NEUTRAL
  }
  // Legacy strings: 'balancing' | 'aggravating' | 'neutral'
  if (affinity === 'balancing')   return SUITABILITY.BALANCING
  if (affinity === 'aggravating') return SUITABILITY.CAUTION
  return SUITABILITY.NEUTRAL
}

/**
 * What a FOOD does to a dosha's level.
 * Source of truth: `RASAS[taste].effect` in dietary.js.
 * Convention: -1 pacifies (decreases), 0 neutral, +1 aggravates (increases).
 *
 * @param {number|null|undefined} effect
 * @returns {'decreases'|'neutral'|'increases'}
 */
export function foodEffectDirection(effect) {
  const n = num(effect)
  if (n === null) return FOOD_EFFECT.NEUTRAL
  if (n < 0) return FOOD_EFFECT.DECREASES
  if (n > 0) return FOOD_EFFECT.INCREASES
  return FOOD_EFFECT.NEUTRAL
}

/**
 * Suitability of a FOOD for someone with this dosha aggravated.
 *
 * ⚠️ THIS IS WHERE THE SIGN FLIPS. A food that DECREASES a dosha (-1) is
 * BALANCING for that dosha — the opposite sign to a practice's +1. Call this
 * rather than comparing `effect` to a practice's `doshaAffinity`; the two are
 * not interchangeable numbers.
 *
 * @param {number|null|undefined} effect
 * @returns {'balancing'|'neutral'|'caution'}
 */
export function foodSuitability(effect) {
  const dir = foodEffectDirection(effect)
  if (dir === FOOD_EFFECT.DECREASES) return SUITABILITY.BALANCING
  if (dir === FOOD_EFFECT.INCREASES) return SUITABILITY.CAUTION
  return SUITABILITY.NEUTRAL
}
