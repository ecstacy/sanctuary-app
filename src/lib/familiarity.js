// ─────────────────────────────────────────────────────────────────────────────
//  familiarity.js — how well the app has gotten to know the user.
//
//  Confidence Batch F (#55). A short quiz can't fully represent a person, so we
//  express the reading as something that DEEPENS with engagement rather than a
//  fixed verdict. This folds the self-knowledge signals we've gathered into a
//  qualitative stage — deliberately NOT a numeric "profile 20% complete" meter,
//  which reads early on as "the app barely knows me" and undercuts trust.
//
//  Signals (each an explicit thing the user told us, or ongoing check-ins):
//    intent (#53) · refine (#54) · self-report (#52) · vikriti check-ins.
//  Prakriti (the quiz) is the gate: with no baseline there's nothing to deepen.
//
//  Pure and side-effect-free — the caller gathers the signals.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {{hasPrakriti:boolean, intent?:boolean, refine?:boolean, selfReport?:boolean, vikritiCount?:number}} signals
 * @returns {{stage:0|1|2|3, score:number, key:string} | null}
 *   null when there's no baseline yet (nothing to progress against).
 */
export function computeFamiliarity({ hasPrakriti, intent, refine, selfReport, vikritiCount = 0 } = {}) {
  if (!hasPrakriti) return null

  let score = 0
  if (intent) score += 1
  if (refine) score += 1
  if (selfReport) score += 1
  if (vikritiCount >= 1) score += 1   // has started checking in
  if (vikritiCount >= 3) score += 1   // an ongoing rhythm

  const stage = score >= 5 ? 3 : score >= 3 ? 2 : score >= 1 ? 1 : 0
  return { stage, score, key: `stage${stage}` }
}
