// ─────────────────────────────────────────────────────────────────────────────
//  voiceCoach.js — the brain for the in-practice voice teacher
//
//  Given a pose, its duration, the current second, and the user's dosha,
//  decide what (if anything) the teacher should say *right now*. The goal
//  is to feel like a real instructor in a studio: regular alignment cues,
//  breath pacing, encouragement, and time milestones — not a robot reading
//  four canned lines.
//
//  Design principles
//  -----------------
//  • Phase-based: entry → settle → deepen → milestones → exit.
//  • Adaptive: short poses (<30s) get fewer cues, long poses (>2min) get
//    rotating universal cues so the room never goes awkwardly silent.
//  • Pose-first, universal-fallback: each asana already ships voiceCues
//    (enter / hold / breathe / exit). We use those for the anchor moments,
//    then layer universal alignment / breath / presence prompts in the
//    gaps so the user always feels guided.
//  • Dosha-aware: a one-line tonal nudge per dosha, sprinkled into the
//    hold so the practice feels personalized.
//  • Idempotent: callers pass a `said` set; we never repeat a key. The
//    schedule is deterministic per (poseIndex, duration) so repeats and
//    pauses don't cause double-speak.
//
//  Returns
//  -------
//  A list of `{ key, text }` to speak this tick. Usually 0–1 items.
// ─────────────────────────────────────────────────────────────────────────────

// ── Universal cue banks ─────────────────────────────────────────────────────
// Generic prompts a teacher reaches for on any pose. Keep each one short
// (one breath worth) so the speech doesn't talk over the next milestone.

const ALIGNMENT_CUES = [
  'Soften your jaw. Drop your shoulders away from your ears.',
  'Lengthen through the crown of your head.',
  'Engage your core gently — supportive, not gripping.',
  'Press evenly through both feet. Or both sit bones.',
  'Roll your shoulders back. Open your collarbones.',
  'Relax your forehead. Let the eyes be soft.',
  'Notice where you are holding tension. Let it go.',
]

const BREATH_CUES = [
  'Inhale slowly through the nose. Exhale fully.',
  'Make your exhale a little longer than the inhale.',
  'Breathe into the part of you that feels tight.',
  'Five long breaths from here.',
  'Steady the breath, and the mind follows.',
  'Let each exhale soften the pose a little deeper.',
]

const PRESENCE_CUES = [
  'You are doing beautifully. Stay with it.',
  'Stay with the breath. Stay with the body.',
  'Notice what is here, without judgment.',
  'You belong on this mat. Right here, right now.',
  'No need to rush. The pose meets you where you are.',
  'Soften the effort. Find the ease inside the work.',
]

// One-line tonal nudges keyed to the user's dominant dosha. Picked once
// per pose to flavor the hold without dominating the script.
const DOSHA_NUDGE = {
  vata:  'Stay grounded. Slow and steady. Nothing to chase.',
  pitta: 'Soften the effort. This is not a contest.',
  kapha: 'Stay engaged. Light up the body from within.',
}

// Deterministic picker — same (bank, index) always returns the same line,
// so a given pose's cue rotation stays stable across repeats.
function pick(bank, seed) {
  if (!bank || !bank.length) return null
  return bank[Math.abs(seed) % bank.length]
}

// Index-into-bank variant — same picker math, but returns the index so we
// can build a stable fileKey alongside the text (e.g. `coach__align_3`).
function pickIndex(bank, seed) {
  if (!bank || !bank.length) return -1
  return Math.abs(seed) % bank.length
}

// Exported so the generator script can enumerate every coach phrase the
// runtime might pick. Each entry is { key, text } — the key matches what
// `buildSchedule` stamps on its cue items, which is also what the audio
// manifest is indexed by. Editing a phrase here → re-running the
// generator → only the changed clip re-synthesizes (hash-keyed).
export const COACH_PHRASES = (() => {
  const items = []
  ALIGNMENT_CUES.forEach((t, i) => items.push({ key: `coach__align_${i}`,    text: t }))
  BREATH_CUES   .forEach((t, i) => items.push({ key: `coach__breath_${i}`,   text: t }))
  PRESENCE_CUES .forEach((t, i) => items.push({ key: `coach__presence_${i}`, text: t }))
  Object.entries(DOSHA_NUDGE).forEach(([d, t]) => items.push({ key: `coach__dosha_${d}`, text: t }))
  items.push({ key: 'coach__milestone_halfway', text: 'Halfway through the hold. Stay with it.' })
  items.push({ key: 'coach__milestone_thirty',  text: 'Thirty seconds. Stay with the breath.' })
  items.push({ key: 'coach__milestone_fifteen', text: 'Fifteen seconds. Three more breaths.' })
  return items
})()

// ── Schedule ────────────────────────────────────────────────────────────────
// For a given pose duration D, return an array of milestones the coach
// should hit. Each milestone is `{ atRemaining, key, text }`. We compute
// these once when the pose starts and the caller checks them on every
// tick. Keys are namespaced by poseIndex so multi-pose routines don't
// collide and so a `said` set can track without growing across sessions.

// Higher priority survives the min-gap collision filter. Pose-authored
// cues and explicit time milestones outrank universal flavor prompts.
const PRIORITY = {
  enter: 100, exit: 100,
  hold: 80, 'breathe-pose': 80,
  halfway: 70, fifteen: 70, thirty: 70,
  dosha: 50,
  'breath-univ': 40, align: 40, presence: 30,
}

const MIN_GAP_SECONDS = 6

export function buildSchedule({ asana, poseIndex, userDosha }) {
  const D = asana.durationSeconds
  const items = []

  // `fileKey` points the runtime at the pre-recorded Nova HD MP3 to play
  // for this cue. Per-pose cues use `${asanaId}__{slot}`; universal bank
  // cues use the indexed coach__* keys mirrored in COACH_PHRASES so the
  // generator can pre-record exactly what the runtime will request.
  const cue = (atRemaining, key, text, fileKey) => {
    if (!text) return
    items.push({
      atRemaining: Math.max(0, Math.min(D, atRemaining)),
      key: `p${poseIndex}-${key}`,
      text,
      priority: PRIORITY[key] ?? 10,
      kind: key,
      fileKey,
    })
  }

  // ── Entry (immediately on start) ──
  // The narration effect in PracticePage now handles entry (pose name +
  // instructions[] read inline during the hold), so we no longer schedule
  // an 'enter' cue here — it would double up. Kept the slot in PRIORITY
  // for historical compatibility with stored schedules.

  // ── Hold cue from the pose itself — landed once the user has had a
  //     moment to arrive. ~15% in, but never before 4 seconds and only
  //     for poses long enough to settle (≥20s).
  if (D >= 20) {
    cue(D - Math.max(4, Math.floor(D * 0.15)), 'hold', asana.voiceCues.hold, `${asana.id}__hold`)
  }

  // ── Pose-specific breath instruction at ~35% ──
  if (D >= 30) {
    cue(D - Math.floor(D * 0.35), 'breathe-pose', asana.voiceCues.breathe, `${asana.id}__breathe`)
  }

  // ── Universal alignment refinement at ~45% (long poses only) ──
  if (D >= 45) {
    const i = pickIndex(ALIGNMENT_CUES, poseIndex)
    cue(D - Math.floor(D * 0.45), 'align', ALIGNMENT_CUES[i], `coach__align_${i}`)
  }

  // ── Halfway flag for ≥60s holds ──
  if (D >= 60) {
    cue(Math.floor(D / 2), 'halfway', 'Halfway through the hold. Stay with it.', 'coach__milestone_halfway')
  }

  // ── Dosha tonal nudge at ~60% (long poses) ──
  if (D >= 60 && userDosha && DOSHA_NUDGE[userDosha]) {
    cue(D - Math.floor(D * 0.6), 'dosha', DOSHA_NUDGE[userDosha], `coach__dosha_${userDosha}`)
  }

  // ── Universal breath cue at ~72% ──
  if (D >= 45) {
    const i = pickIndex(BREATH_CUES, poseIndex + 1)
    cue(D - Math.floor(D * 0.72), 'breath-univ', BREATH_CUES[i], `coach__breath_${i}`)
  }

  // ── Presence / encouragement — only when there is enough room before
  //     the 15s and 8s exit cues, otherwise it just doubles up.
  if (D >= 75) {
    const i = pickIndex(PRESENCE_CUES, poseIndex + 2)
    cue(D - Math.floor(D * 0.82), 'presence', PRESENCE_CUES[i], `coach__presence_${i}`)
  }

  // ── Time milestones ──
  // 30s remaining for very long poses (≥120s)
  if (D >= 120) {
    cue(30, 'thirty', 'Thirty seconds. Stay with the breath.', 'coach__milestone_thirty')
  }
  // 15s remaining for medium+ poses
  if (D >= 60) {
    cue(15, 'fifteen', 'Fifteen seconds. Three more breaths.', 'coach__milestone_fifteen')
  }
  // ── Exit prep ──
  // Pose-authored exit cue arrives ~8s out so the user has time to begin
  // releasing as the bell sounds.
  cue(8, 'exit', asana.voiceCues.exit, `${asana.id}__exit`)

  // Sort latest-first (entry → exit by timeline) so the dedupe pass below
  // walks the practice in order.
  items.sort((a, b) => b.atRemaining - a.atRemaining)

  // Min-gap dedupe — if two cues land within MIN_GAP_SECONDS of each
  // other, keep the higher-priority one. Prevents the teacher from
  // talking over themselves on shorter poses where percentages collide.
  const kept = []
  for (const item of items) {
    const collision = kept.find(k => Math.abs(k.atRemaining - item.atRemaining) < MIN_GAP_SECONDS)
    if (!collision) {
      kept.push(item)
      continue
    }
    if (item.priority > collision.priority) {
      // Replace the lower-priority neighbor.
      const idx = kept.indexOf(collision)
      kept[idx] = item
    }
    // Otherwise drop the new (lower-priority) item.
  }

  // Final ordering by timeRemaining (descending — entry first).
  return kept.sort((a, b) => b.atRemaining - a.atRemaining)
}

// ── Rest period narration ──────────────────────────────────────────────────
// Spoken between poses — calls out the next pose so the user doesn't have
// to look at the screen, and lands a brief breath instruction so the rest
// doesn't feel like dead air.

export function restNarration({ nextAsana, restSeconds }) {
  if (!nextAsana) return null
  const intro = restSeconds >= 12
    ? 'Rest. Soften the body. Take three slow breaths.'
    : 'Rest, and breathe.'
  return `${intro} Next: ${nextAsana.english}.`
}
