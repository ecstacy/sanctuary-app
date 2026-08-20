// ─────────────────────────────────────────────────────────────────────────────
//  dietProfile.js — a derived read of how the user actually eats.
//
//  Task #45 (personalization data model). A pure fold over the user's meal_logs
//  into a structured DietProfile: the dosha their meals tend to push (surplus),
//  the tastes they over- and under-eat (the six-rasa balance — a classical lens
//  where chronic absence of a taste is itself a pattern), their food-group mix,
//  most-eaten foods, and when they eat. No runtime-invented facts — everything
//  reads from the reviewed ingredient dataset and the logged assessments.
//
//  Deliberately PURE (no supabase / no window): callers pass the already-loaded
//  logs, so it is trivially testable and reusable. It is the substrate for the
//  "getting to know you" progression (#55) and pattern-aware guidance.
// ─────────────────────────────────────────────────────────────────────────────

import { getIngredient } from './ingredients'

const DOSHAS = ['vata', 'pitta', 'kapha']
export const RASAS = ['sweet', 'sour', 'salty', 'pungent', 'bitter', 'astringent']

// A per-dosha average below this reads as "no meaningful lean" (mirrors the
// SHIFT_THRESHOLD in mealCheck so the two surfaces agree).
const LEAN_THRESHOLD = 0.15
// A taste is "over-represented" once it's on this share of eaten items.
const SURPLUS_SHARE = 0.2
// Per-check recency decay for the "lately" lean: the newest check counts fully,
// each older one 0.75×. Without this, a burst of identical older meals outvotes
// the recent ones and the card claims a trend the latest checks contradict —
// e.g. five old Pitta plates drowning out four recent balanced/Kapha ones.
const RECENCY_DECAY = 0.7

// Derive the meal slot from a timestamp (same cutoffs as MealCheckPage).
function slotOf(ts) {
  if (!ts) return null
  const hr = new Date(ts).getHours()
  if (Number.isNaN(hr)) return null
  return hr < 11 ? 'morning' : hr < 17 ? 'midday' : 'evening'
}

/**
 * Fold meal_logs into a DietProfile.
 * @param {Array<{item_ids?: string[], assessment?: {perDosha?: object}, eaten_at?: string}>} logs
 * @returns {{
 *   sample: number, itemTotal: number,
 *   doshaAvg: {vata:number,pitta:number,kapha:number}, dominant: ('vata'|'pitta'|'kapha'|null),
 *   rasaCount: Record<string,number>, surplusTastes: string[], missingTastes: string[],
 *   categoryCount: Record<string,number>, topFoods: Array<{id:string,name:string,count:number}>,
 *   slotCount: {morning:number,midday:number,evening:number}
 * }}
 */
export function computeDietProfile(logs = []) {
  const doshaSum = { vata: 0, pitta: 0, kapha: 0 }
  const rasaCount = Object.fromEntries(RASAS.map((r) => [r, 0]))
  const categoryCount = {}
  const foodCount = {}
  const slotCount = { morning: 0, midday: 0, evening: 0 }
  let itemTotal = 0

  // Newest-first, so the recency weight tracks actual time, not array order.
  const ordered = [...logs].sort((a, b) => new Date(b?.eaten_at || 0) - new Date(a?.eaten_at || 0))
  let weightSum = 0

  ordered.forEach((log, i) => {
    const per = log?.assessment?.perDosha
    if (per) {
      const w = Math.pow(RECENCY_DECAY, i)   // newest check = 1, each older ×0.75
      weightSum += w
      for (const d of DOSHAS) doshaSum[d] += w * (per[d] || 0)
    }

    const slot = slotOf(log?.eaten_at)
    if (slot) slotCount[slot] += 1

    // Taste / food / category mix stays an unweighted count over the window —
    // recency shapes the dosha LEAN (the headline), not what tastes appear.
    for (const id of log?.item_ids || []) {
      const ing = getIngredient(id)
      if (!ing) continue // unknown / unreviewed — behaves as if absent
      foodCount[id] = (foodCount[id] || 0) + 1
      categoryCount[ing.category] = (categoryCount[ing.category] || 0) + 1
      for (const r of ing.rasa || []) if (r in rasaCount) rasaCount[r] += 1
      itemTotal += 1
    }
  })

  const sample = logs.length
  const doshaAvg = {}
  for (const d of DOSHAS) doshaAvg[d] = weightSum ? doshaSum[d] / weightSum : 0

  // The dosha the user's meals most consistently push (their "surplus").
  let dominant = null
  let peak = LEAN_THRESHOLD
  for (const d of DOSHAS) if (doshaAvg[d] > peak) { peak = doshaAvg[d]; dominant = d }

  // Six-taste balance: what they eat a lot of, and what's missing entirely.
  const ranked = RASAS.map((r) => [r, rasaCount[r]]).sort((a, b) => b[1] - a[1])
  const surplusTastes = ranked
    .filter(([, c]) => itemTotal && c / itemTotal >= SURPLUS_SHARE)
    .slice(0, 2)
    .map(([r]) => r)
  const missingTastes = RASAS.filter((r) => rasaCount[r] === 0)

  const topFoods = Object.entries(foodCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, count]) => ({ id, count, name: getIngredient(id)?.name || id }))

  return { sample, itemTotal, doshaAvg, dominant, rasaCount, surplusTastes, missingTastes, categoryCount, topFoods, slotCount }
}

// Enough signal to say something honest about a pattern.
export function hasDietPattern(profile, minSample = 3) {
  return !!profile && profile.sample >= minSample && profile.itemTotal > 0
}

// The Monday (local) that starts the ISO-ish week containing `d`, as YYYY-MM-DD.
function weekStartOf(d) {
  const x = new Date(d)
  if (Number.isNaN(x.getTime())) return null
  x.setHours(0, 0, 0, 0)
  const dow = (x.getDay() + 6) % 7 // 0 = Monday
  x.setDate(x.getDate() - dow)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

/**
 * Per-week dosha trend for the trends page — a plain average of each check's
 * per-dosha shift within its calendar week, oldest week first. Unlike the card's
 * recency-weighted "lately" lean, here each week stands on its own so the user
 * can SEE a Pitta stretch give way to a balanced one.
 *
 * @param {Array} logs meal_logs (need assessment.perDosha + eaten_at)
 * @param {{weeks?:number}} [opts] how many most-recent weeks to keep (default 8)
 * @returns {Array<{weekStart:string, count:number, doshaAvg:object, dominant:string|null}>}
 */
export function computeWeeklyTrends(logs = [], { weeks = 8 } = {}) {
  const byWeek = new Map()
  for (const log of logs) {
    const per = log?.assessment?.perDosha
    const wk = weekStartOf(log?.eaten_at)
    if (!per || !wk) continue
    if (!byWeek.has(wk)) byWeek.set(wk, { weekStart: wk, count: 0, sum: { vata: 0, pitta: 0, kapha: 0 } })
    const bucket = byWeek.get(wk)
    bucket.count += 1
    for (const d of DOSHAS) bucket.sum[d] += per[d] || 0
  }

  return [...byWeek.values()]
    .sort((a, b) => (a.weekStart < b.weekStart ? -1 : 1)) // oldest → newest
    .slice(-weeks)
    .map(({ weekStart, count, sum }) => {
      const doshaAvg = {}
      for (const d of DOSHAS) doshaAvg[d] = count ? sum[d] / count : 0
      let dominant = null
      let peak = LEAN_THRESHOLD
      for (const d of DOSHAS) if (doshaAvg[d] > peak) { peak = doshaAvg[d]; dominant = d }
      return { weekStart, count, doshaAvg, dominant }
    })
}
