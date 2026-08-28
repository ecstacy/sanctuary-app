// ─────────────────────────────────────────────────────────────────────────────
//  doshaState.js — the shared, pure rules for "who is the user, dosha-wise, right
//  now". Every surface that personalizes (Home, the daily session, food/diet
//  target, meal check, analytics) routes its constitution/vikriti decision
//  through here, so they can never disagree — the class of bug #65 fixed on Home,
//  hoisted app-wide.
//
//  Two rules everyone must honour:
//   • SELF-REPORT WINS. If the user corrected their reading ("not quite → I feel
//     more like X", #52), that is their baseline primary.
//   • VIKRITI MUST BE NEWER THAN THE BASELINE. A vikriti reading (acute check-in
//     signal or the vikriti quiz) describes a deviation FROM the constitution.
//     Re-taking the constitution quiz stamps dosha_details.assessedAt; any
//     vikriti recorded before that is stale and must be ignored, so a new
//     constitution cleanly resets the reading instead of leaving a phantom flare.
//
//  Pure and dependency-free (no supabase / no React), so it's importable from the
//  pure engine libs and trivially testable.
// ─────────────────────────────────────────────────────────────────────────────

const DOSHAS = ['vata', 'pitta', 'kapha']

/**
 * The primary dosha the app treats as the user's baseline constitution: their
 * own self-correction (#52) wins over the quiz result, then the legacy label.
 * @returns {'vata'|'pitta'|'kapha'|null}
 */
export function effectivePrimary(profile) {
  const d = profile?.dosha_details || {}
  const sr = d.selfReport
  if (sr?.fit === 'adjusted' && DOSHAS.includes(sr.primary)) return sr.primary
  const quiz = (d.primary || profile?.dosha || '').toLowerCase()
  return DOSHAS.includes(quiz) ? quiz : null
}

/** When the constitution baseline was (re)established, or null for older rows. */
export function baselineAt(profile) {
  return profile?.dosha_details?.assessedAt || null
}

/**
 * Is the user's constitution tridoshic / balanced — no clear dominant dosha?
 * True when the quiz percentages sit within a narrow band of each other (a
 * ~33/33/34 reading). Surfaces that personalize to a single dominant dosha must
 * NOT do so for a balanced person: `effectivePrimary` still returns the numeric
 * top dosha, but that top is not meaningfully dominant, so lensing a meal (or a
 * suggestion) to it is the class of bug #65/#66 — it makes a balanced user look
 * Pitta. Callers use this to drop the single-dosha lens and fall back to
 * "assess the meal on its own" instead.
 */
export function isBalancedConstitution(profile) {
  const p = profile?.dosha_details?.percentages
  if (!p) return false
  const vals = DOSHAS.map((d) => Number(p[d]) || 0)
  if (vals.every((v) => v === 0)) return false
  return Math.max(...vals) - Math.min(...vals) <= 10
}

// Top two doshas within this many points read as CO-DOMINANT (a dual
// constitution), so a 40-40-20 reading is "Vata-Kapha" rather than an arbitrary
// single pick, while 45-37-18 (8 apart) stays single Vata.
export const CODOM_GAP = 8

/**
 * The 1–2 dominant doshas of a percentage split, co-dominance–aware. Returns the
 * top dosha, plus the second when it sits strictly within CODOM_GAP points of the
 * top — ordered by percentage, descending. Does NOT itself decide "balanced"
 * (that's the caller's job via isBalancedConstitution / tridoshic checks), so it
 * can be reused wherever a split is already known to have a dominant.
 * @param {object|null} percentages  { vata, pitta, kapha }
 * @param {{gap?: number}} [opts]
 * @returns {string[]}  [] | [d] | [d1, d2]
 */
export function dominantDoshas(percentages, { gap = CODOM_GAP } = {}) {
  if (!percentages) return []
  const ranked = DOSHAS
    .map((d) => ({ d, v: Number(percentages[d]) || 0 }))
    .sort((a, b) => b.v - a.v)
  if (ranked.every((r) => r.v === 0)) return []
  const out = [ranked[0].d]
  if (ranked[0].v - ranked[1].v < gap) out.push(ranked[1].d)
  return out
}

/**
 * Is a vikriti timestamp newer than the constitution baseline (i.e. not stale)?
 * True when there is no baseline yet, so behaviour is unchanged for profiles
 * assessed before assessedAt existed — until their next quiz.
 * @param {object} profile
 * @param {string|null|undefined} ts  ISO timestamp of the vikriti reading
 */
export function afterBaseline(profile, ts) {
  const b = baselineAt(profile)
  return !b || (!!ts && ts > b)
}
