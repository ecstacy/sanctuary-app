// ─────────────────────────────────────────────────────────────────────────────
//  currentDoshaState.js — the ONE derivation of "who is the user, right now?"
//
//  Two data points live side by side and must never be conflated OR shown in
//  isolation without the other:
//    • prakriti — the birth constitution (stable; the quiz result).
//    • vikriti  — the current imbalance (this week; a fresh check-in pattern or
//                 the vikriti quiz), and only ever read AGAINST the prakriti.
//
//  Home's "your state this week" card and the Dosha profile page both need this,
//  and they were deriving it separately — so the card could show a live Pitta
//  flare while the page it links to showed only the Vata constitution, with no
//  bridge between them. This module is the single owner (regression-checklist
//  #1 / the #65 bug class): both surfaces read the same result, so the number
//  and the label can never come from different reads.
//
//  Pure and side-effect free — callers pass profile + the two vikriti reads in.
//  useCurrentDoshaState wires the hooks; deriveCurrentDoshaState is the logic.
// ─────────────────────────────────────────────────────────────────────────────

import { effectivePrimary, dominantDoshas } from './doshaState'

const DOSHAS = ['vata', 'pitta', 'kapha']

/**
 * @param {object} ctx
 * @param {object} [ctx.profile]   the user's profile row
 * @param {object} [ctx.signal]    useVikritiSignal output ({ hasSignal, vikriti, lastCheckinAt })
 * @param {object} [ctx.schedule]  useVikritiSchedule output ({ lastVikritiAt, lastVikritiPrimary, lastVikritiPercentages, daysSinceLast })
 * @returns {{
 *   currentDosha: string|null, source: 'vikriti'|'prakriti'|null,
 *   isElevated: boolean, balanced: boolean, isTridoshic: boolean,
 *   prakriti: string|null, prakritiValid: boolean,
 *   prakritiPercentages: object|null, currentPercentages: object|null,
 *   matchesPrakriti: boolean
 * }}
 */
export function deriveCurrentDoshaState({ profile, signal, schedule } = {}) {
  // A vikriti reading counts only if it's newer than the constitution baseline —
  // re-taking the quiz invalidates deviations from the previous constitution, so
  // a stale "High Pitta" doesn't linger after a re-quiz (#65).
  const baselineAt = profile?.dosha_details?.assessedAt || null
  const afterBaseline = (ts) => !baselineAt || (!!ts && ts > baselineAt)

  const signalRelevant = !!signal?.hasSignal && afterBaseline(signal?.lastCheckinAt)
  const vikritiFresh = !!schedule?.lastVikritiAt
    && (schedule?.daysSinceLast ?? Infinity) <= 14
    && afterBaseline(schedule?.lastVikritiAt)

  const signalDosha = signalRelevant
    ? String(signal.vikriti || '').toLowerCase()
    : (vikritiFresh ? String(schedule.lastVikritiPrimary || '').toLowerCase() : null)
  const signalValid = DOSHAS.includes(signalDosha) ? signalDosha : null

  // Prakriti honours the user's own "I feel more like X" self-correction (#52).
  const prakriti = (effectivePrimary(profile) || profile?.dosha_details?.primary || profile?.dosha || '').toLowerCase()
  const prakritiValid = DOSHAS.includes(prakriti)
  const prakritiPercentages = profile?.dosha_details?.percentages || null

  const isTridoshic = (profile?.dosha || '').toLowerCase() === 'tridoshic'
    || (!!prakritiPercentages
      && (Math.max(prakritiPercentages.vata, prakritiPercentages.pitta, prakritiPercentages.kapha)
        - Math.min(prakritiPercentages.vata, prakritiPercentages.pitta, prakritiPercentages.kapha) <= 3))

  const isElevated = !!signalValid
  const balanced = isTridoshic && !isElevated
  const currentDosha = signalValid || (prakritiValid ? prakriti : null)

  // Co-dominance: a 40-40-20 constitution is dual (Vata-Kapha), not an arbitrary
  // single pick. A live vikriti flare is always a single dosha; a balanced /
  // tridoshic reading has none. `currentDosha` stays the primary (for the gem
  // key, colours, lensing); `currentDoshas` carries the 1–2 to NAME.
  let currentDoshas
  if (signalValid) {
    currentDoshas = [signalValid]
  } else if (balanced || !prakritiValid) {
    currentDoshas = balanced ? [] : (prakritiValid ? [prakriti] : [])
  } else {
    const dom = dominantDoshas(prakritiPercentages)
    if (dom.length === 2) {
      currentDoshas = dom.includes(prakriti) ? [prakriti, dom.find((d) => d !== prakriti)] : dom
    } else {
      currentDoshas = [prakriti]
    }
  }

  // The percentages that go with whichever source is the reading, so the split
  // shown always matches the label.
  const currentPercentages = (vikritiFresh && schedule?.lastVikritiPercentages) || prakritiPercentages || null

  return {
    currentDosha,
    currentDoshas,
    source: signalValid ? 'vikriti' : (prakritiValid ? 'prakriti' : null),
    isElevated,
    balanced,
    isTridoshic,
    prakriti: prakritiValid ? prakriti : null,
    prakritiValid,
    prakritiPercentages,
    currentPercentages,
    // True when today's reading agrees with the baseline — the "this week"
    // section can then stay quiet rather than showing the same dosha twice.
    matchesPrakriti: !!signalValid && prakritiValid && signalValid === prakriti,
  }
}
