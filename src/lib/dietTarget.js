// ─────────────────────────────────────────────────────────────────────────────
//  dietTarget.js — which dosha should this user's food advice be aimed at?
//
//  Ayurvedic diet targets the dosha that is currently AGGRAVATED (vikriti),
//  read against the birth constitution (prakriti) and the season — not the
//  constitution alone. The app already holds all three signals, so the
//  resolution order is the one the tradition uses:
//
//    1. vikriti   — a recent imbalance reading. This is the clinically correct
//                   target, and our actual differentiator: most apps only ever
//                   know your constitution.
//    2. prakriti  — the quiz constitution, when there is no recent reading.
//    3. none      — no signal. Advice is shown WITHOUT a personal verdict
//                   rather than guessed at.
//
//  Deliberately mirrors `resolveTargetDosha` in dailySession.js, and reads the
//  same `useVikritiSignal` shape, so practice and food never disagree about
//  who the user is today.
//
//  Season is an OVERLAY, not a target: ritucharya nudges toward cooling foods
//  in summer and warming ones in winter regardless of dosha. It is returned
//  alongside the target for the caller to weigh; it never replaces it.
//
//  Pure and side-effect free — the UI passes state in. Same rationale as
//  dailySession.js: the interesting logic stays testable without React.
// ─────────────────────────────────────────────────────────────────────────────

/** @typedef {'vata'|'pitta'|'kapha'} Dosha */
/** @typedef {'spring'|'summer'|'autumn'|'winter'} Season */

// Northern-hemisphere months. This is an assumption, and a wrong one for a
// user in Sydney — but the alternative (asking, or reading location) costs more
// than the nudge is worth, and season is only ever an overlay here. Revisit if
// the app gets a real southern-hemisphere audience.
import { effectivePrimary, afterBaseline, isBalancedConstitution } from './doshaState'

const SEASON_BY_MONTH = [
  'winter', 'winter', // Jan, Feb
  'spring', 'spring', 'spring', // Mar–May
  'summer', 'summer', 'summer', // Jun–Aug
  'autumn', 'autumn', 'autumn', // Sep–Nov
  'winter', // Dec
]

/**
 * @param {Date} [now]
 * @returns {Season}
 */
export function seasonFor(now = new Date()) {
  return SEASON_BY_MONTH[now.getMonth()]
}

/**
 * Resolve whose imbalance the food advice should speak to.
 *
 * @param {object}  ctx
 * @param {object}  [ctx.vikriti]  useVikritiSignal output ({ hasSignal, vikriti })
 * @param {object}  [ctx.profile]  the user's profile row (dosha / dosha_details)
 * @param {Date}    [ctx.now]
 * @returns {{dosha: Dosha|null, source: 'vikriti'|'prakriti'|'none', season: Season}}
 */
export function resolveDietTarget({ vikriti, profile, now = new Date() } = {}) {
  const season = seasonFor(now)

  // A vikriti signal counts only if it's newer than the constitution baseline
  // (a re-quiz supersedes a stale flare) — same rule as Home (#65).
  if (vikriti?.hasSignal && vikriti.vikriti && afterBaseline(profile, vikriti.lastCheckinAt)) {
    return { dosha: String(vikriti.vikriti).toLowerCase(), source: 'vikriti', season }
  }

  // A tridoshic/balanced constitution has no dominant to read a food against, so
  // we don't lens to its numeric top dosha — that made a balanced user's food
  // page say "read against your Pitta constitution" (same bug class as #65/#66
  // and meal check). With no live vikriti flare above, a balanced user gets the
  // neutral reference, not a single-dosha verdict.
  // A balanced/tridoshic constitution has a real profile but no single dominant
  // to lens to. Distinct from 'none' (never quizzed) so surfaces can say "you're
  // balanced" instead of wrongly prompting the quiz.
  if (isBalancedConstitution(profile)) return { dosha: null, source: 'balanced', season }

  // Prakriti honours the user's own self-correction (#52).
  const p = effectivePrimary(profile) || profile?.dosha_details?.primary || profile?.dosha
  if (p) return { dosha: String(p).toLowerCase(), source: 'prakriti', season }

  return { dosha: null, source: 'none', season }
}

/**
 * Should we explain the vikriti-vs-prakriti distinction here?
 *
 * True only when the two actually disagree — "your constitution is Pitta, but
 * this week you're running Vata-high, so we're settling Vata". Saying it when
 * they agree is noise; saying it when they differ turns a correctness nuance
 * the user would otherwise experience as a bug ("why is it not showing my
 * dosha?") into the moment the app looks like it's paying attention.
 *
 * @param {{dosha: Dosha|null, source: string}} target
 * @param {object} [profile]
 */
export function shouldExplainTarget(target, profile) {
  if (target?.source !== 'vikriti' || !target.dosha) return false
  const p = profile?.dosha_details?.primary || profile?.dosha
  if (!p) return false
  return String(p).toLowerCase() !== target.dosha
}
