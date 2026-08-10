// ─────────────────────────────────────────────────────────────────────────────
//  mealCheck.js — "I ate X, what does it do to my doshas?"
//
//  A DETERMINISTIC composition over the reviewed ingredient dataset — the same
//  no-invented-facts rule as search and the meal planner (docs/meal-check-plan.md,
//  docs/diet-feature-plan.md §2). Given a set of eaten foods it returns the net
//  per-dosha shift, a headline verdict framed against the user's constitution,
//  and rebalancing remedies (foods + pranayama).
//
//  ⚠ SIGN CONVENTION. Food doshaEffect is -1 pacifies / +1 aggravates; practice
//  doshaAffinity is +1 balances. The two are NOT interchangeable — food verdicts
//  never touch a practice number and vice-versa. Foods pacify a raised dosha when
//  doshaEffect[d] < 0; practices help it when doshaAffinity[d] > 0. Getting this
//  backwards silently inverts advice (it already shipped once on /poses).
//
//  Nothing here decides what a food DOES — that is read from ingredients.js.
//  This module only sums, ranks, and frames. Free-text parsing (parseMeal) is a
//  best-effort lookup over the same reviewed rows; unmatched tokens are surfaced,
//  never guessed.
// ─────────────────────────────────────────────────────────────────────────────

import { REVIEWED_INGREDIENTS, getIngredient, searchIngredients } from './ingredients'
import { exclusionFor } from './dietSafety'
import { PRANAYAMAS } from '../data/pranayamas'

export const DOSHAS = ['vata', 'pitta', 'kapha']

// How much a food's effect counts toward the meal's net shift. A plate is
// dominated by its staples and proteins; a pinch of spice only nudges. These
// are deliberate, coarse weights — the verdict is directional, not a nutrient
// calculation.
const CATEGORY_WEIGHT = {
  grain: 1, legume: 1, animal: 1, vegetable: 0.9, dairy: 0.9, fruit: 0.7,
  nut_seed: 0.6, other: 0.6, oil: 0.5, beverage: 0.5, sweetener: 0.4, spice: 0.35,
}
const weightOf = (f) => CATEGORY_WEIGHT[f?.category] ?? 0.6

// A per-dosha net magnitude (−1..1) below this reads as "no meaningful shift".
const SHIFT_THRESHOLD = 0.15

const notExcluded = (f, dietPrefs) => {
  const ex = exclusionFor(f, dietPrefs)
  return !(ex && ex.excluded)
}

// ── Parse free text → resolved / ambiguous / unknown tokens ─────────────────
const STOPWORDS = new Set([
  'a', 'an', 'the', 'some', 'of', 'my', 'for', 'plus', 'had', 'ate', 'i',
  'bit', 'little', 'few', 'cup', 'glass', 'bowl', 'piece', 'slice', 'served',
])

const isExact = (r, q) => r.name.toLowerCase() === q || (r.aliases || []).some((a) => a.toLowerCase() === q)

// Look a token up, tolerating plurals and finding the food ANYWHERE in a
// multi-word phrase: "scrambled eggs" → egg, "black coffee dripped" → coffee,
// "green tea" → green tea. Builds candidate queries most-specific first and
// returns on the first EXACT name/alias hit; otherwise the best partial set
// (which the UI then offers as a disambiguation).
function lookup(token) {
  const t = token.trim().toLowerCase()
  if (!t) return []
  const words = t.split(/\s+/)

  const cands = [t]
  if (t.endsWith('es')) cands.push(t.slice(0, -2))
  if (t.endsWith('s')) cands.push(t.slice(0, -1))
  // contiguous word-pairs ("green tea", "bottle gourd")
  for (let i = 0; i < words.length - 1; i++) cands.push(`${words[i]} ${words[i + 1]}`)
  // individual words, longest first (the longer word is likelier the food, not
  // a modifier like "black"/"fresh"); include singulars.
  for (const w of [...new Set(words)].filter((w) => w.length >= 3).sort((a, b) => b.length - a.length)) {
    cands.push(w)
    if (w.endsWith('es')) cands.push(w.slice(0, -2))
    else if (w.endsWith('s')) cands.push(w.slice(0, -1))
  }

  let partial = null
  for (const q of [...new Set(cands)]) {
    const { results } = searchIngredients(q)
    if (!results.length) continue
    const exact = results.find((r) => isExact(r, q))
    if (exact) return [exact]           // an exact hit wins outright
    if (!partial) partial = results     // remember the first partial as fallback
  }
  return partial || []
}

const brief = (r) => ({ id: r.id, name: r.name })

// Nearest known foods for an unknown token — best-effort suggestions for the UI.
function nearest(token) {
  const first = token.trim().toLowerCase().split(/\s+/)[0]
  if (first.length < 3) return []
  return REVIEWED_INGREDIENTS
    .filter((f) => f.name.toLowerCase().startsWith(first.slice(0, 3)))
    .slice(0, 3)
    .map(brief)
}

export function parseMeal(text) {
  const tokens = String(text || '')
    .split(/[,+\n/]|\band\b|\bwith\b|\bplus\b/i)
    // drop filler words from inside each phrase too ("a unicornberry" → the food,
    // "bit of yoghurt" → "yoghurt") so the token we match/report is the food.
    .map((t) => t.trim().toLowerCase().split(/\s+/).filter((w) => w && !STOPWORDS.has(w)).join(' '))
    .filter(Boolean)

  const matched = []
  const ambiguous = []
  const unknown = []
  const seen = new Set()

  for (const token of tokens) {
    const results = lookup(token)
    if (results.length === 0) {
      unknown.push({ token, suggestions: nearest(token) })
    } else if (results.length === 1) {
      if (!seen.has(results[0].id)) {
        seen.add(results[0].id)
        matched.push({ token, id: results[0].id, name: results[0].name })
      }
    } else {
      ambiguous.push({ token, options: results.slice(0, 4).map(brief) })
    }
  }
  return { matched, ambiguous, unknown }
}

// ── Assess a resolved meal against the user's constitution ──────────────────
export function assessMeal(ids, profile = {}) {
  const items = (ids || []).map(getIngredient).filter(Boolean)

  const raw = { vata: 0, pitta: 0, kapha: 0 }
  let totalW = 0
  for (const f of items) {
    const w = weightOf(f)
    totalW += w
    for (const d of DOSHAS) raw[d] += w * (f.doshaEffect?.[d] || 0)
  }

  const perDosha = { vata: 0, pitta: 0, kapha: 0 }
  const dir = { vata: 'neutral', pitta: 'neutral', kapha: 'neutral' }
  for (const d of DOSHAS) {
    perDosha[d] = totalW ? raw[d] / totalW : 0
    dir[d] = perDosha[d] > SHIFT_THRESHOLD ? 'raises'
      : perDosha[d] < -SHIFT_THRESHOLD ? 'settles' : 'neutral'
  }

  // Constitution lens: this week's state (vikriti) first, birth type (prakriti)
  // as fallback. Raising the dosha the user already runs high in is the concern.
  const vikriti = (profile?.vikriti_details?.primary || '').toLowerCase()
  const prakriti = (profile?.dosha_details?.primary || profile?.dosha || '').toLowerCase()
  const lens = DOSHAS.includes(vikriti) ? vikriti : (DOSHAS.includes(prakriti) ? prakriti : null)

  // Headline = the dosha the meal raises most (if any).
  let headline = null
  let peak = SHIFT_THRESHOLD
  for (const d of DOSHAS) {
    if (perDosha[d] > peak) { peak = perDosha[d]; headline = d }
  }

  // Concern framing.
  //   mind   — raises the user's own (already-elevated) dosha  → "not ideal"
  //   watch  — raises a different dosha                         → "keep an eye"
  //   good   — raises nothing and settles the lens dosha        → "supportive"
  //   neutral— balanced / no meaningful shift
  let concern = 'neutral'
  if (headline) concern = headline === lens ? 'mind' : 'watch'
  else if (lens && dir[lens] === 'settles') concern = 'good'

  return {
    items: items.map((f) => f.id),
    perDosha,
    dir,
    headline,
    lens,
    prakriti: DOSHAS.includes(prakriti) ? prakriti : null,
    vikriti: DOSHAS.includes(vikriti) ? vikriti : null,
    concern,
  }
}

// ── Rebalancing remedies for the raised dosha ───────────────────────────────
// Classical tastes that pacify each dosha, and the potency that counters it
// (Vata & Kapha are cold → warming; Pitta is hot → cooling). Used to prefer
// remedies that genuinely oppose the excess, not just any food that nets down.
const RASA_FOR = {
  vata: ['sweet', 'sour', 'salty'],
  pitta: ['sweet', 'bitter', 'astringent'],
  kapha: ['pungent', 'bitter', 'astringent'],
}
const VIRYA_FOR = { vata: 'heating', pitta: 'cooling', kapha: 'heating' }

function remedyScore(f, target, slot, balancedByIds) {
  let s = 1
  if (f.confidence === 'high') s += 0.6                        // classical > derived
  if (balancedByIds.has(f.id)) s += 0.5                        // named antidote of what they ate
  // Time-of-day fit: a remedy for right now should suit the slot.
  if (slot && f.bestTime?.length) s += f.bestTime.includes(slot) ? 1.0 : -0.4
  // Corrective forms — a spice or tea is the natural "have a little to settle
  // it" remedy; a heavy staple is not.
  if (f.category === 'spice') s += 0.7
  else if (f.category === 'beverage') s += 0.4
  // Properties that actively counter the excess.
  if (f.virya === VIRYA_FOR[target]) s += 0.4
  if ((f.rasa || []).some((r) => (RASA_FOR[target] || []).includes(r))) s += 0.3
  return s
}

export function remediesFor(assessment, { dietPrefs = {}, slot = null } = {}) {
  const target = assessment?.headline
  const combos = mealCombos(assessment?.items || [])
  if (!target) return { target: null, foods: [], practices: [], combos }

  const eaten = new Set(assessment.items)

  // Classical antidotes named in the offending foods' `balancedBy` get a boost
  // (but only when they too pacify the target — balancedBy is about
  // digestibility, not always dosha direction).
  const balancedByIds = new Set(
    assessment.items
      .map(getIngredient)
      .filter((f) => f && (f.doshaEffect?.[target] || 0) > 0)
      .flatMap((f) => f.balancedBy || []),
  )

  // Reviewed foods that PACIFY the raised dosha, are safe, and weren't just
  // eaten — ranked so only the most RELEVANT (classical, time-appropriate,
  // corrective, actively-opposing) surface; the tail of technically-pacifying-
  // but-odd suggestions is dropped by taking only the top few.
  const foods = REVIEWED_INGREDIENTS
    .filter((f) => (f.doshaEffect?.[target] || 0) < 0)
    .filter((f) => !eaten.has(f.id))
    .filter((f) => notExcluded(f, dietPrefs))
    .map((f) => ({ f, score: remedyScore(f, target, slot, balancedByIds) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ f }) => ({ id: f.id, name: f.name, isDerived: f.confidence !== 'high' }))

  // Pranayama that BALANCES the raised dosha (doshaAffinity[target] > 0).
  // Breath is the post-meal-safe choice (no inversions on a full stomach). Rank
  // by a focus score so a target-specific breath (Sheetali cools only Pitta)
  // beats a generalist (Nadi Shodhana balances all three) for a specific excess.
  const focus = (p) => {
    const others = DOSHAS.filter((d) => d !== target)
      .reduce((s, d) => s + Math.max(0, p.doshaAffinity?.[d] || 0), 0)
    return (p.doshaAffinity[target] || 0) - 0.5 * others
  }
  const practices = Object.values(PRANAYAMAS)
    .filter((p) => (p.doshaAffinity?.[target] || 0) > 0)
    .sort((a, b) => focus(b) - focus(a))
    .slice(0, 2)
    .map((p) => ({ id: p.id, sanskrit: p.sanskrit, english: p.english }))

  return { target, foods, practices, combos }
}

// Viruddha āhāra within the meal itself: flag when one item's combosToAvoid
// text names another item actually in the meal. Conservative (name/alias
// substring) to avoid false positives; returns [] when the data doesn't support
// a confident pairing.
export function mealCombos(ids) {
  const items = (ids || []).map(getIngredient).filter(Boolean)
  const out = []
  for (const a of items) {
    for (const warn of a.combosToAvoid || []) {
      const w = String(warn).toLowerCase()
      for (const b of items) {
        if (b.id === a.id) continue
        const names = [b.name, ...(b.aliases || [])].map((n) => n.toLowerCase())
        if (names.some((n) => n.length > 2 && w.includes(n))) {
          out.push({ a: a.id, b: b.id, note: warn })
        }
      }
    }
  }
  return out
}
