// ─────────────────────────────────────────────────────────────────────────────
//  mealComposer.js — "what should I eat right now"
//
//  A deterministic RULES COMPOSER over reviewed data, mirroring dailySession.js.
//  Pure: no I/O, no React, no clock of its own. Everything arrives through ctx.
//
//    composeMeals(ctx) → { ideas, reasons, coverage, seed, meta }
//
//  THERE IS NO FACT-GENERATION STEP HERE, SO THERE IS NO HALLUCINATION SURFACE.
//  Every claim an idea makes is read from a reviewed ingredient row or derived
//  arithmetically from several of them. The composer chooses and explains; it
//  never asserts.
//
//  ORDER OF OPERATIONS (the order matters, and it is not the obvious one)
//  ─────────────────────────────────────────────────────────────────────
//  1. GATE   — drop templates with any unreviewed core ingredient. Composing
//              from a draft would launder unverified data into a suggestion.
//  2. FILTER — drop templates whose CORE contains an excluded ingredient.
//              Hard removal, before any scoring. An Ayurvedic "ideal for your
//              Vata" must never outrank an allergy, and the only way to
//              guarantee that structurally is to filter before ranking rather
//              than to rank with a large penalty.
//  3. PRUNE  — drop excluded OPTIONAL ingredients individually; the dish
//              survives without them.
//  4. RANK   — dosha fit, season, slot, and what the user already has.
//  5. EXPLAIN— derive the why from the surviving ingredients.
//
//  DETERMINISM
//  ───────────
//  Seeded per (user, date, slot), like the practice composer: stable all day so
//  the Home widget doesn't flicker and analytics stay clean, different
//  tomorrow, different morning vs evening.
//
//  HONEST EMPTINESS
//  ────────────────
//  If filtering leaves nothing, the result is EMPTY with a reason — never a
//  relaxed filter, never a fallback suggestion. "We have nothing safe to
//  suggest" is a correct answer; quietly dropping a safety constraint to fill
//  the screen is not.
// ─────────────────────────────────────────────────────────────────────────────

import { ALL_MEAL_TEMPLATES } from '../data/ayurveda/meals'
import { getIngredient } from './ingredients'
import { exclusionFor } from './dietSafety'
import { foodSuitability, SUITABILITY } from './doshaSemantics'

// Same PRNG as dailySession.js — deliberately identical, so "deterministic per
// user per day" means the same thing in both composers.
function hashSeed(str) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DEFAULT_COUNT = 3

/** Which `kind`s belong on the "what should I eat" surface. */
const KINDS_ON_MEAL_SURFACE = new Set(['meal', 'preparation'])

/** Hour → meal slot. Coarse on purpose; nobody eats on a schedule. */
export function mealSlotFor(hour) {
  if (hour < 11) return 'morning'
  if (hour < 17) return 'midday'
  return 'evening'
}

/**
 * Net effect of a set of ingredients on one dosha, as a SUM of their individual
 * effects clamped to the display vocabulary.
 *
 * Summing is the honest operation here: it is arithmetic over reviewed rows, so
 * it can be shown alongside its inputs and checked. Anything cleverer would be
 * the composer forming its own opinion, which is the thing this design exists
 * to prevent.
 */
export function netDoshaEffect(ingredients, dosha) {
  if (!dosha) return { sum: 0, suitability: SUITABILITY.NEUTRAL }
  const sum = ingredients.reduce((n, i) => n + (i?.doshaEffect?.[dosha] ?? 0), 0)
  // Clamp to −1/0/+1 before interpreting: the vocabulary has three values, and
  // "very balancing" is not one of them.
  const clamped = sum > 0 ? 1 : sum < 0 ? -1 : 0
  return { sum, suitability: foodSuitability(clamped) }
}

/**
 * Build the human-readable reasons for one idea, entirely from ingredient data.
 * No authored prose — every clause names an ingredient and restates what that
 * ingredient's reviewed row already says.
 */
export function explainIdea(ingredients, dosha) {
  if (!dosha) return []
  const out = []
  for (const i of ingredients) {
    const s = foodSuitability(i?.doshaEffect?.[dosha])
    if (s === SUITABILITY.BALANCING) out.push({ id: i.id, name: i.name, effect: 'settles' })
    else if (s === SUITABILITY.CAUTION) out.push({ id: i.id, name: i.name, effect: 'increases' })
  }
  return out
}

/**
 * Templates that are `kind: 'practice'` — dinacharya observances rather than
 * food, so they are excluded from `composeMeals` entirely and surfaced here
 * instead.
 *
 * Same gate and same safety filter as meals: unreviewed rows are invisible,
 * and a practice whose core ingredient the user excludes is not shown. Honey
 * in lukewarm water is not offered to someone who has excluded honey, however
 * traditional the practice is.
 *
 * @param {{dietPrefs?: object}} [ctx]
 */
export function dailyPractices(ctx = {}) {
  const dietPrefs = ctx.dietPrefs || {}
  return ALL_MEAL_TEMPLATES
    .filter((tpl) => tpl.reviewStatus === 'reviewed' && tpl.kind === 'practice')
    .map((tpl) => ({ tpl, core: tpl.coreIds.map(getIngredient) }))
    .filter(({ core }) => core.every(Boolean))
    .filter(({ core }) => !core.some((i) => exclusionFor(i, dietPrefs).excluded))
    .map(({ tpl, core }) => ({
      id:    tpl.id,
      name:  tpl.name,
      prep:  tpl.prep || null,
      slots: tpl.slots,
      core:  core.map((i) => ({ id: i.id, name: i.name })),
    }))
}

/**
 * @param {object}   ctx
 * @param {string}   [ctx.userId]
 * @param {Date}     [ctx.now]
 * @param {'vata'|'pitta'|'kapha'|null} [ctx.targetDosha]
 * @param {string}   [ctx.doshaSource]  'vikriti' | 'prakriti' | 'none'
 * @param {'spring'|'summer'|'autumn'|'winter'} [ctx.season]
 * @param {string}   [ctx.forceSlot]
 * @param {{allergens?: string[], patterns?: string[]}} [ctx.dietPrefs]
 * @param {string[]} [ctx.availableIngredients] ingredient ids the user has
 * @param {number}   [ctx.count]
 */
export function composeMeals(ctx = {}) {
  const now  = ctx.now instanceof Date ? ctx.now : new Date()
  const slot = ctx.forceSlot || mealSlotFor(now.getHours())
  const dietPrefs = ctx.dietPrefs || {}
  const targetDosha = ctx.targetDosha || null
  const have = new Set(ctx.availableIngredients || [])

  const dateKey = now.toISOString().slice(0, 10)
  const seed = hashSeed(`${ctx.userId || 'anon'}|${dateKey}|${slot}|meals`)
  const rand = mulberry32(seed)

  let gatedOut = 0      // templates dropped for unreviewed content
  let filteredOut = 0   // templates dropped for the user's own safety filter
  let notAMeal = 0      // practices — correct to omit, not a coverage problem

  const candidates = []

  for (const tpl of ALL_MEAL_TEMPLATES) {
    if (tpl.reviewStatus !== 'reviewed') { gatedOut++; continue }

    // A 'practice' is a dinacharya observance, not food — honey in lukewarm
    // water is not a breakfast idea. Excluded here rather than ranked low,
    // because low-ranked still means "we are offering you this to eat".
    const kind = tpl.kind || 'meal'
    if (!KINDS_ON_MEAL_SURFACE.has(kind)) { notAMeal++; continue }

    // 1. GATE — every core ingredient must itself be reviewed. getIngredient
    //    returns null for drafts, so this is the same gate, reused rather than
    //    reimplemented.
    const core = tpl.coreIds.map(getIngredient)
    if (core.some((i) => !i)) { gatedOut++; continue }

    // 2. FILTER — before any scoring.
    const blocked = core.map((i) => exclusionFor(i, dietPrefs)).find((e) => e.excluded)
    if (blocked) { filteredOut++; continue }

    // 3. PRUNE optional extras individually.
    const optional = (tpl.optionalIds || [])
      .map(getIngredient)
      .filter((i) => i && !exclusionFor(i, dietPrefs).excluded)

    candidates.push({ tpl, core, optional, kind })
  }

  // 4. RANK
  const scored = candidates.map((c) => {
    let score = 0
    const reasons = []

    if (c.tpl.slots?.includes(slot)) { score += 4; reasons.push({ code: `slot:${slot}` }) }
    else score -= 2   // a nudge, not a ban — porridge at night is odd, not wrong

    // A full meal outranks a component. Mashed potato is a real answer to
    // "what should I eat", just a less complete one than kitchari.
    if (c.kind === 'preparation') score -= 1.5

    if (targetDosha) {
      // Core carries the dish; optional extras count for less because the user
      // may not add them.
      const coreNet = netDoshaEffect(c.core, targetDosha)
      const optNet  = netDoshaEffect(c.optional, targetDosha)
      score += -coreNet.sum * 3 + -optNet.sum * 1
      if (coreNet.suitability === SUITABILITY.BALANCING) {
        reasons.push({ code: `pacify:${targetDosha}` })
      }
    }

    if (ctx.season) {
      if (c.tpl.seasons?.includes(ctx.season)) { score += 2; reasons.push({ code: `season:${ctx.season}` }) }
      // A template with NO seasons is all-season; only a mismatch is penalised.
      else if (c.tpl.seasons?.length) score -= 1
    }

    if (have.size) {
      const covered = c.tpl.coreIds.filter((id) => have.has(id)).length
      const ratio = covered / Math.max(1, c.tpl.coreIds.length)
      score += ratio * 5
      if (ratio === 1) reasons.push({ code: 'have:all' })
      else if (covered > 0) reasons.push({ code: 'have:some' })
    }

    score += rand() * 1.5     // deterministic tie-break + rotation

    return { ...c, score, reasons }
  }).sort((a, b) => b.score - a.score)

  // 5. EXPLAIN
  const ideas = scored.slice(0, ctx.count || DEFAULT_COUNT).map((c) => {
    const all = [...c.core, ...c.optional]
    const net = netDoshaEffect(c.core, targetDosha)
    return {
      id:         c.tpl.id,
      name:       c.tpl.name,
      prep:       c.tpl.prep || null,
      slots:      c.tpl.slots,
      core:       c.core.map((i) => ({ id: i.id, name: i.name, category: i.category })),
      optional:   c.optional.map((i) => ({ id: i.id, name: i.name, category: i.category })),
      /** Dominant ingredient category — the primary key for a dish's visual. */
      category:   c.core[0]?.category || null,
      /** Optional real photo/illustration. Null today; the hook for the future
       *  themed-image pipeline — when a template carries one, the card shows it
       *  in place of the generated tile with no other change. */
      image:      c.tpl.image || null,
      kind:       c.kind,
      suitability: net.suitability,
      /**
       * Traditional companions for whatever in this dish needs them — the
       * asafoetida-and-ginger that make heavy legumes digestible. Purely
       * informational: it never filters and never scores. It exists so the
       * principle survives the rule that every spice stays optional.
       * Only ingredients that are themselves reviewed and not excluded appear.
       */
      balancedBy: (() => {
        // Anything already listed as core or optional is part of the
        // suggestion, so repeating it under "traditionally balanced with"
        // reads as two different recommendations for the same spice.
        const already = new Set([...c.core, ...c.optional].map((i) => i.id))
        return [...new Set(c.core.flatMap((i) => i.balancedBy || []))]
          .filter((id) => !already.has(id))
          .map(getIngredient)
          .filter((i) => i && !exclusionFor(i, dietPrefs).excluded)
          .map((i) => ({ id: i.id, name: i.name }))
      })(),
      /** Per-ingredient, so the verdict can be shown WITH its inputs. */
      contributions: explainIdea(c.core, targetDosha),
      reasons:    c.reasons,
      /** True if any ingredient is property-derived rather than classically cited. */
      isDerived:  all.some((i) => i.confidence === 'medium'),
      citations:  [...new Set(c.core.filter((i) => i.source?.text === 'CS')
                    .map((i) => i.source.verse))].filter(Boolean),
    }
  })

  const reasons = []
  reasons.push({ code: `slot:${slot}` })
  if (targetDosha && ctx.doshaSource === 'vikriti') reasons.push({ code: `pacify:${targetDosha}` })
  else if (targetDosha) reasons.push({ code: `dosha:${targetDosha}` })
  if (ctx.season) reasons.push({ code: `season:${ctx.season}` })

  return {
    slot,
    ideas,
    reasons,
    /**
     * Why the list is the length it is. `filteredOut > 0 && ideas.length === 0`
     * is the case the UI must never paper over: we had ideas and the user's own
     * safety filter removed them all. Saying so is the honest answer; relaxing
     * the filter to fill the screen is not.
     */
    coverage: {
      totalTemplates: ALL_MEAL_TEMPLATES.length,
      gatedOut,
      filteredOut,
      notAMeal,
      shown: ideas.length,
      emptyBecauseFiltered: ideas.length === 0 && filteredOut > 0,
      emptyBecauseUnreviewed: ideas.length === 0 && filteredOut === 0 && gatedOut > 0,
    },
    seed,
    meta: { targetDosha, doshaSource: ctx.doshaSource || 'none', season: ctx.season || null, dateKey },
  }
}
