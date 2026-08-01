// ─────────────────────────────────────────────────────────────────────────────
//  doshaOutcome.js — map a dosha percentage split to the pre-rendered gem image
//  that best represents it. There are ten gems (public/dosha-gems/<key>.png):
//
//    • 6 single-dominant, keyed `<dominant>-<secondary>` — one dosha leads and
//      the image shows which one is next (vata-pitta ≠ vata-kapha).
//    • 3 co-dominant pairs, keyed `<a>-<b>-dual` (a,b in vata→pitta→kapha order)
//      — the top two are close, the third is a thin ribbon.
//    • 1 `tridoshic` — all three roughly even.
//
//  Colour legend in the art: Vata = purple, Pitta = gold, Kapha = teal.
// ─────────────────────────────────────────────────────────────────────────────

// Canonical dosha order for building stable pair keys.
const ORDER = { vata: 0, pitta: 1, kapha: 2 }

// Tuning: how close the three shares must be to read as tridoshic, and how
// close the top two must be to read as a co-dominant pair rather than a single
// dominant. Expressed as percentage-point gaps of the whole.
export const TRIDOSHIC_SPREAD_PCT = 12   // (max − min) below this → tridoshic
export const DUAL_GAP_PCT = 8            // (1st − 2nd) below this → dual pair

export const OUTCOME_KEYS = [
  'vata-pitta', 'vata-kapha', 'pitta-kapha', 'pitta-vata', 'kapha-pitta', 'kapha-vata',
  'vata-kapha-dual', 'pitta-kapha-dual', 'vata-pitta-dual',
  'tridoshic',
]

/** @param {{vata?:number,pitta?:number,kapha?:number}} percentages */
export function gemImageKey(percentages = {}) {
  const v = Math.max(0, percentages.vata || 0)
  const p = Math.max(0, percentages.pitta || 0)
  const k = Math.max(0, percentages.kapha || 0)
  const total = v + p + k || 1
  // Rank by share, breaking ties by the canonical order so the result is stable.
  const ranked = [['vata', v], ['pitta', p], ['kapha', k]]
    .sort((a, b) => (b[1] - a[1]) || (ORDER[a[0]] - ORDER[b[0]]))
  const [first, second, third] = ranked

  const spread = ((first[1] - third[1]) / total) * 100
  if (spread < TRIDOSHIC_SPREAD_PCT) return 'tridoshic'

  const gap = ((first[1] - second[1]) / total) * 100
  if (gap < DUAL_GAP_PCT) {
    const pair = [first[0], second[0]].sort((a, b) => ORDER[a] - ORDER[b])
    return `${pair[0]}-${pair[1]}-dual`
  }
  return `${first[0]}-${second[0]}`
}
