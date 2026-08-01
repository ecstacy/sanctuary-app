// ─────────────────────────────────────────────────────────────────────────────
//  dailySession.js — the "Today's Practice" composer
//
//  Pure, deterministic function that assembles a full multi-pose yoga session
//  tailored to the user, given the signals we already collect. No I/O, no React,
//  no clock of its own — everything comes in through `ctx` so it's trivially
//  testable and identical on every render.
//
//    composeDailySession(ctx) → Session
//
//  DESIGN
//  ──────
//  • A session is an ARC, not a pose list: centering → warm-up → peak →
//    wind-down → close. Each phase draws from a tag/category-filtered pool and
//    fills toward a duration budget.
//  • Slot drives the whole character. Morning energizes (warming, backbends,
//    sun salutation); evening winds down (forward folds, hips, restorative,
//    and NO heating poses). Afternoon resolves to whichever of the two the
//    user hasn't done today (see resolveSlot) — we ship two arcs, not three.
//  • Personalization is WEIGHTING, not filtering: vikriti (current imbalance)
//    or prakriti (constitution), the day's check-in, and recent history bias
//    pose selection and swap the peak — they never empty a phase.
//  • Deterministic per (user, date, slot): a seeded PRNG makes the session
//    stable all day (no reroll anxiety, clean analytics) yet different every
//    day and different morning vs evening. This is what structurally kills the
//    old "same asana every time" behaviour.
//  • Explainable: every session carries `reasons[]` (codes + fallback labels)
//    so the card can show why, and analytics can log it.
//
//  Personalization is intentionally light in v1 (free feature, broad safety):
//  we compose from beginner/intermediate poses and lean on the rich per-pose
//  `tags` + numeric `doshaAffinity` the data already ships. Deeper swaps
//  (injury-aware contraindication filtering, Plus-only variants) are later.
// ─────────────────────────────────────────────────────────────────────────────

import { ASANAS } from '../data/asanas'

// ── Seeded PRNG ──────────────────────────────────────────────────────────────
// mulberry32: tiny, fast, good enough for shuffling a pose pool. Deterministic
// from a 32-bit seed, so the same (user, date, slot) always yields the same
// session — the property the whole feature leans on.
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

// ── Composition constants ────────────────────────────────────────────────────
const DEFAULT_TARGET_MINUTES = 13
const DURATION_TOLERANCE_S = 150 // ±2.5 min — a session lands "about right", not exact
// How many recent sessions to scan when penalizing repeats. A pose in the last
// two sessions is downweighted so consecutive days feel fresh without banning
// staples like savasana outright (the penalty is a nudge, not a filter).
const RECENT_SESSION_WINDOW = 2

// Levels we auto-compose from. Advanced poses are aspirational / higher
// injury-risk and stay opt-in via search + explicit routines, never
// auto-prescribed. (Data has a stray capitalized 'Beginner' — normalize.)
const ALLOWED_LEVELS = new Set(['beginner', 'intermediate'])
function levelOf(a) { return String(a.level || '').toLowerCase() }
function tagsOf(a) { return a.tags || [] }
function hasTag(a, t) { return tagsOf(a).includes(t) }
function hasAnyTag(a, ts) { return ts.some(t => hasTag(a, t)) }

// Poses we never auto-place regardless of pool: arm balances and the two named
// flows that ARE their own full session (they'd dominate the budget and double
// the arc). Sun Salutation A is allowed — it's the canonical warm-up.
const NEVER_AUTO = new Set(['chandraNamaskar', 'suryaNamaskarB'])
function eligible(a) {
  return a && ALLOWED_LEVELS.has(levelOf(a)) && !hasTag(a, 'arm_balance') && !NEVER_AUTO.has(a.id)
}

// The final rest is sacred — it only ever belongs in the `close` phase. Without
// this, Savasana's restorative/supine category matches the evening peak pool,
// gets grabbed mid-session, and the arc ends on something other than the rest.
const CLOSE_ONLY = new Set(['savasana'])
function isCloseOnly(a) { return CLOSE_ONLY.has(a.id) || hasTag(a, 'final_pose') }

// ── Slot resolution ──────────────────────────────────────────────────────────
// Two arcs (morning/evening). Afternoon folds into whichever the user hasn't
// done today: if they haven't practiced a morning session yet, give them the
// morning energizer; otherwise wind them toward evening.
export function rawSlot(hour) {
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
export function resolveSlot(hour, doneSlotsToday = []) {
  const raw = rawSlot(hour)
  if (raw !== 'afternoon') return raw
  return doneSlotsToday.includes('morning') ? 'evening' : 'morning'
}

// ── Dosha target ─────────────────────────────────────────────────────────────
// Pacify the current imbalance if we have a vikriti reading; otherwise support
// the birth constitution. Returns a dosha key or null (→ neutral composition).
function resolveTargetDosha(ctx) {
  if (ctx.vikriti?.hasSignal && ctx.vikriti.vikriti) {
    return { dosha: ctx.vikriti.vikriti, source: 'vikriti' }
  }
  const p = ctx.profile?.dosha_details?.primary || ctx.profile?.dosha
  if (p) return { dosha: String(p).toLowerCase(), source: 'prakriti' }
  return { dosha: null, source: 'none' }
}

// ── Check-in → tag affinities ────────────────────────────────────────────────
// The day's mood check-in (stress/sleep/energy/flexibility) biases selection
// toward matching tags. Additive weighting only.
const CHECKIN_TAGS = {
  stress:      ['stress_relief', 'wind_down', 'grounding', 'anxiety', 'release_tension'],
  sleep:       ['pre_sleep', 'restorative', 'insomnia', 'wind_down', 'deep_rest'],
  energy:      ['energizing', 'wake_up', 'warming', 'low_energy', 'build_stamina'],
  flexibility: ['hip_opener', 'hamstring_stretch', 'forward_fold', 'spine_extension', 'tight_hips'],
}

// ── Arc definition ───────────────────────────────────────────────────────────
// Each phase: a candidate predicate (which poses may fill it) + how the phase
// wants to grow. `min`/`max` bound pose count; the peak/winddown flex to hit
// the duration budget. `preferTags` nudges score within the pool.
//
// Evening deliberately excludes warming/energizing poses via `avoidTags`.
function phasePlan(slot) {
  const evening = slot === 'evening'
  return [
    {
      key: 'centering',
      min: 1, max: 1,
      pool: a => a.category === 'seated' || hasAnyTag(a, ['centering', 'pre_meditation', 'grounding', 'pranayama_seat']),
      preferTags: evening ? ['wind_down', 'gentle', 'grounding'] : ['grounding', 'centering', 'wake_up'],
    },
    {
      key: 'warmup',
      min: 1, max: 1,
      pool: a => hasAnyTag(a, evening ? ['gentle', 'wind_down', 'lower_back_relief', 'reset']
                                       : ['wake_up', 'warming', 'energizing', 'sequence']) ||
                 a.id === 'cardiacWarmup',
      preferTags: evening ? ['gentle', 'reset'] : ['warming', 'energizing', 'sequence'],
    },
    {
      key: 'peak',
      min: 2, max: 3, flex: true,
      pool: a => evening
        ? (['forward_fold', 'twist', 'restorative', 'supine'].includes(a.category) || hasAnyTag(a, ['hip_opener', 'wind_down', 'pre_sleep']))
        : (['standing', 'backbend', 'balance', 'sequence'].includes(a.category) || hasAnyTag(a, ['energizing', 'strength', 'feel_strong'])),
      avoidTags: evening ? ['warming', 'energizing', 'wake_up', 'cardiovascular'] : [],
      preferTags: evening ? ['pitta_pacifying', 'wind_down', 'hip_opener'] : ['energizing', 'spine_extension', 'strength'],
    },
    {
      key: 'winddown',
      min: 1, max: 2, flex: true,
      pool: a => ['forward_fold', 'twist', 'restorative', 'supine'].includes(a.category) ||
                 hasAnyTag(a, ['wind_down', 'restorative', 'hip_opener', 'lower_back_relief']),
      avoidTags: evening ? ['warming', 'energizing'] : [],
      preferTags: ['wind_down', 'restorative', 'gentle'],
    },
    {
      key: 'close',
      min: 1, max: 1,
      pool: a => a.id === 'savasana' || hasTag(a, 'final_pose'),
      preferTags: ['deep_rest', 'final_pose'],
    },
  ]
}

// ── Scoring ──────────────────────────────────────────────────────────────────
// A pose's fit for a phase in this context. Higher = better. Selection takes
// the top scorers with a small seeded jitter so the arc rotates day to day
// without going random.
function scorePose(a, { phase, slot, targetDosha, checkin, recentIds, rand }) {
  let s = 0

  // Time-of-day fit — the single strongest signal.
  if (hasTag(a, slot)) s += 4

  // Phase preference tags.
  if (phase.preferTags) s += phase.preferTags.filter(t => hasTag(a, t)).length * 2

  // Dosha pacification: numeric affinity (+pacifies / −aggravates the target)
  // plus a bonus for the explicit `{dosha}_pacifying` tag.
  if (targetDosha) {
    const aff = a.doshaAffinity?.[targetDosha]
    if (typeof aff === 'number') s += aff * 2
    if (hasTag(a, `${targetDosha}_pacifying`)) s += 2
  }

  // Check-in mood bias.
  if (checkin && CHECKIN_TAGS[checkin]) {
    s += CHECKIN_TAGS[checkin].filter(t => hasTag(a, t)).length * 2
  }

  // Freshness: downweight poses done in the last couple of sessions so
  // consecutive days feel new. A nudge, not a ban (staples can still recur).
  if (recentIds.has(a.id)) s -= 3

  // Seeded jitter breaks ties deterministically and rotates the pool.
  s += rand() * 1.5

  return s
}

// ── The composer ─────────────────────────────────────────────────────────────
/**
 * @param {object} ctx
 * @param {object}  ctx.profile        user profile (dosha, dosha_details)
 * @param {object}  ctx.vikriti        useVikritiSignal output ({ hasSignal, vikriti })
 * @param {string}  ctx.checkin        today's check-in id | null
 * @param {Array}   ctx.history        recent practice_sessions rows (newest first),
 *                                     each with { asanas: [{id}...] } or { asanaIds: [...] }
 * @param {Date}    ctx.now            clock (injected for testability)
 * @param {string}  ctx.userId         for the per-user seed
 * @param {number} [ctx.targetMinutes] session length target
 * @param {string} [ctx.forceSlot]     override slot (used by the evening follow-up)
 * @returns {{ slot, asanaIds, totalSeconds, targetMinutes, reasons, seed, meta }}
 */
export function composeDailySession(ctx = {}) {
  const now = ctx.now instanceof Date ? ctx.now : new Date()
  const targetMinutes = ctx.targetMinutes || DEFAULT_TARGET_MINUTES
  const targetSeconds = targetMinutes * 60

  const doneSlotsToday = ctx.doneSlotsToday || []
  const slot = ctx.forceSlot || resolveSlot(now.getHours(), doneSlotsToday)

  const dateKey = now.toISOString().slice(0, 10)
  const seed = hashSeed(`${ctx.userId || 'anon'}|${dateKey}|${slot}`)
  const rand = mulberry32(seed)

  const { dosha: targetDosha, source: doshaSource } = resolveTargetDosha(ctx)
  const checkin = ctx.checkin || null

  // Poses from the last N sessions → freshness penalty.
  const recentIds = new Set()
  for (const sess of (ctx.history || []).slice(0, RECENT_SESSION_WINDOW)) {
    const ids = Array.isArray(sess.asanaIds)
      ? sess.asanaIds
      : (sess.asanas || []).map(x => (typeof x === 'string' ? x : x.id)).filter(Boolean)
    ids.forEach(id => recentIds.add(id))
  }

  const allEligible = Object.values(ASANAS).filter(eligible)
  const picked = []
  const pickedIds = new Set()
  let totalSeconds = 0

  const phases = phasePlan(slot)
  // Reserve the close (savasana ≈ 180s) so budgeting the flexible phases
  // doesn't crowd it out.
  const closePhase = phases[phases.length - 1]
  const closeReserve = 180

  for (const phase of phases) {
    const isClose = phase === closePhase
    // Close-only poses (savasana / final_pose) are reserved for the close and
    // excluded everywhere else.
    const closeGate = a => isClose ? true : !isCloseOnly(a)
    let pool = allEligible.filter(a =>
      !pickedIds.has(a.id) &&
      closeGate(a) &&
      phase.pool(a) &&
      !(phase.avoidTags && hasAnyTag(a, phase.avoidTags))
    )
    // Never leave a phase empty: if filters were too strict, relax avoidTags.
    if (!pool.length) {
      pool = allEligible.filter(a => !pickedIds.has(a.id) && closeGate(a) && phase.pool(a))
    }
    if (!pool.length) continue

    const scored = pool
      .map(a => ({ a, score: scorePose(a, { phase, slot, targetDosha, checkin, recentIds, rand }) }))
      .sort((x, y) => y.score - x.score)

    let count = 0
    for (const { a } of scored) {
      if (count >= phase.max) break
      // Bilateral poses (warrior, triangle, tree…) are practised on BOTH sides,
      // so they cost twice their listed hold in the real session. Budget them
      // at 2× so a session that includes them stays on target rather than
      // silently running long.
      const cost = a.bilateral ? a.durationSeconds * 2 : a.durationSeconds
      // For flexible phases, stop adding once we're within budget (leaving the
      // close reserve), but always honour the phase minimum.
      if (phase.flex && count >= phase.min) {
        const projected = totalSeconds + cost + (isClose ? 0 : closeReserve)
        if (projected > targetSeconds + DURATION_TOLERANCE_S) break
      }
      picked.push({ id: a.id, phase: phase.key })
      pickedIds.add(a.id)
      totalSeconds += cost
      count++
    }
  }

  // ── Reasons (explainability) ──
  const reasons = []
  reasons.push({ code: `slot:${slot}`, label: slot === 'morning' ? 'Morning practice' : slot === 'evening' ? 'Evening wind-down' : 'Daily practice' })
  if (targetDosha && doshaSource === 'vikriti') reasons.push({ code: `pacify:${targetDosha}`, label: `Rebalancing ${cap(targetDosha)}` })
  else if (targetDosha && doshaSource === 'prakriti') reasons.push({ code: `dosha:${targetDosha}`, label: `For your ${cap(targetDosha)} nature` })
  if (checkin) reasons.push({ code: `checkin:${checkin}`, label: `You said: ${checkin}` })

  return {
    slot,
    asanaIds: picked.map(p => p.id),
    poses: picked, // [{ id, phase }] — phase kept for debugging / future UI
    totalSeconds,
    targetMinutes,
    reasons,
    seed,
    meta: { targetDosha, doshaSource, checkin, dateKey },
  }
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s }
