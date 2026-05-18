// ─────────────────────────────────────────────────────────────────────────────
//  doshaQuiz.js — atomic-trait dosha questionnaire (Approach A+B)
//
//  WHY THIS DESIGN
//  ───────────────
//  The legacy quiz asked users to pick one of three dosha-coded composite
//  statements per question. This produced two problems:
//    1. Forced choice — users feeling between Vata and Pitta had no clean
//       way to express it; the algorithm got a noisy bit instead of a
//       useful signal.
//    2. Identity strain — each option bundled multiple traits ("slender +
//       long limbs + hard to gain weight"). If only one applied, the user
//       resisted picking it, and trust in the result collapsed.
//
//  This file replaces that with a DOSHA-BLIND trait inventory inspired by
//  validated psychometric instruments (Big Five, AyurType). Each question
//  asks about ONE atomic trait on a 3-point scale (Yes / Somewhat / Not
//  really). The user is never asked to identify with a dosha — the
//  V/P/K mapping lives in this scoring matrix, invisible to them.
//
//  Plus an ADAPTIVE TIEBREAKER pass: when the top two doshas score within
//  TIEBREAKER_GAP_PCT of each other, the user is asked 2–3 targeted
//  forced-choice questions that disambiguate the close pair specifically.
//  This both improves resolution AND shows the user the system is
//  responding to their answers — which is the biggest trust unlock
//  short of a human consultation.
//
//  TUNABLES
//  ────────
//  • Physical traits weigh 1.5× because they're prakriti markers
//    (lifelong and stable). Mental and lifestyle traits weigh 1.0×
//    because they conflate with vikriti (current state).
//  • TIEBREAKER_GAP_PCT = 10 → fire tiebreakers when close call.
//  • DUAL_GAP_PCT       =  5 → if still within 5% after tiebreakers,
//    label as a dual constitution (e.g. "Vata-Pitta").
// ─────────────────────────────────────────────────────────────────────────────

// ── Question bank ────────────────────────────────────────────────────────────
// Balanced: 5 vata + 5 pitta + 5 kapha = 15 questions, each the SHARPEST
// classical Charaka marker for its dosha. Trimmed from 30 to minimize
// onboarding drop-off; with 3-point Likert each question carries enough
// signal that 5 per dosha is a robust floor (clinical prakriti
// instruments use 30-60, but those are diagnostic; consumer onboarding
// needs to balance accuracy against completion).
//
// Per dosha: 3 body + 1 mind + 1 lifestyle. Body weighs 1.5× because
// physical traits are the most stable prakriti markers.
export const TRAIT_QUESTIONS = [
  // ── Body: frame ──────────────────────────────────────────────
  { id: 'v_frame_slim',     category: 'body', dosha: 'vata',  weight: 1.5,
    text: 'I am naturally slim and find it hard to gain weight.' },
  { id: 'p_frame_athletic', category: 'body', dosha: 'pitta', weight: 1.5,
    text: 'I have a medium, athletic build — muscle comes easily.' },
  { id: 'k_frame_solid',    category: 'body', dosha: 'kapha', weight: 1.5,
    text: 'I have a solid, sturdy frame that holds weight easily.' },

  // ── Body: skin ───────────────────────────────────────────────
  { id: 'v_skin_dry',       category: 'body', dosha: 'vata',  weight: 1.5,
    text: 'My skin tends to be dry, especially in winter.' },
  { id: 'p_skin_flush',     category: 'body', dosha: 'pitta', weight: 1.5,
    text: 'My skin flushes, reddens, or sunburns easily.' },
  { id: 'k_skin_smooth',    category: 'body', dosha: 'kapha', weight: 1.5,
    text: 'My skin is naturally smooth, thick, or slightly oily.' },

  // ── Body: temperature ────────────────────────────────────────
  { id: 'v_cold_hands',     category: 'body', dosha: 'vata',  weight: 1.5,
    text: 'My hands and feet often feel cold.' },
  { id: 'p_runs_warm',      category: 'body', dosha: 'pitta', weight: 1.5,
    text: 'I feel warmer than people around me, even in cool rooms.' },
  { id: 'k_handles_cold',   category: 'body', dosha: 'kapha', weight: 1.5,
    text: 'I tolerate cold weather well and rarely overheat.' },

  // ── Mind: stress response (most diagnostic mind marker) ──────
  { id: 'v_stress_anxious',  category: 'mind', dosha: 'vata',  weight: 1.0,
    text: 'Under stress, I tend toward worry or anxiety.' },
  { id: 'p_stress_irritable',category: 'mind', dosha: 'pitta', weight: 1.0,
    text: 'Under stress, I tend toward frustration or sharpness.' },
  { id: 'k_stress_withdraw', category: 'mind', dosha: 'kapha', weight: 1.0,
    text: 'Under stress, I tend to withdraw or shut down.' },

  // ── Lifestyle: appetite + sleep (sharpest lifestyle markers) ─
  { id: 'v_appetite_irreg',  category: 'lifestyle', dosha: 'vata',  weight: 1.0,
    text: 'My appetite is irregular — sometimes ravenous, sometimes I forget to eat.' },
  { id: 'p_appetite_strong', category: 'lifestyle', dosha: 'pitta', weight: 1.0,
    text: 'I have a strong, punctual appetite — missing a meal makes me irritable.' },
  { id: 'k_sleep_deep',      category: 'lifestyle', dosha: 'kapha', weight: 1.0,
    text: 'I fall asleep quickly and sleep deeply — sometimes hard to wake.' },
]

// ── Answer scale ─────────────────────────────────────────────────────────────
// Three points: a "somewhat" affordance is the critical middle ground that
// the legacy 1-of-3 design lacked. Captures partial agreement without
// requiring full identification.
export const ANSWER_OPTIONS = [
  { value: 'yes',      label: 'Yes',         weight: 1.0 },
  { value: 'somewhat', label: 'Somewhat',    weight: 0.5 },
  { value: 'no',       label: 'Not really',  weight: 0.0 },
]

// ── Tiebreaker thresholds ────────────────────────────────────────────────────
export const TIEBREAKER_GAP_PCT = 10  // fire tiebreakers when top 2 within 10 pts
export const TIEBREAKER_BONUS   = 2.0 // each tiebreaker adds this to chosen dosha
export const DUAL_GAP_PCT       = 5   // post-tiebreaker: if still <5pt gap → dual

// ── Tiebreaker question pools ────────────────────────────────────────────────
// Each pool targets one specific dosha pair. Forced binary choice — explicitly
// designed to be sharper than the inventory questions. The user sees these
// AFTER the inventory, framed as "Quick check — your top two are close. A
// few more questions to dial it in." That framing is what turns the
// close-call problem into a trust feature.
export const TIEBREAKERS = {
  'vata|pitta': [
    {
      id: 'tb_vp_stress',
      prompt: 'Under real pressure, you feel more —',
      options: [
        { label: 'Scattered and anxious',         dosha: 'vata'  },
        { label: 'Sharp and frustrated',          dosha: 'pitta' },
      ],
    },
    {
      id: 'tb_vp_sleepless',
      prompt: "When you can't sleep, your mind —",
      options: [
        { label: 'Races between many things',     dosha: 'vata'  },
        { label: 'Focuses on solving a problem',  dosha: 'pitta' },
      ],
    },
    {
      id: 'tb_vp_cold',
      prompt: 'Cold weather is —',
      options: [
        { label: 'Hard for you to tolerate',      dosha: 'vata'  },
        { label: 'A welcome relief',              dosha: 'pitta' },
      ],
    },
  ],
  'kapha|vata': [
    {
      id: 'tb_vk_freetime',
      prompt: 'With free time, you prefer —',
      options: [
        { label: 'Variety and new experiences',   dosha: 'vata'  },
        { label: 'Familiar comforts and rest',    dosha: 'kapha' },
      ],
    },
    {
      id: 'tb_vk_weight',
      prompt: 'Your body weight —',
      options: [
        { label: 'Stays low and fluctuates',          dosha: 'vata'  },
        { label: 'Stays steady or slowly creeps up',  dosha: 'kapha' },
      ],
    },
    {
      id: 'tb_vk_mind',
      prompt: "You'd describe your mind as —",
      options: [
        { label: 'Quick and creative',            dosha: 'vata'  },
        { label: 'Steady and deliberate',         dosha: 'kapha' },
      ],
    },
  ],
  'kapha|pitta': [
    {
      id: 'tb_pk_hangry',
      prompt: 'If a meal is delayed —',
      options: [
        { label: 'You get irritable and hangry',  dosha: 'pitta' },
        { label: 'You barely notice',             dosha: 'kapha' },
      ],
    },
    {
      id: 'tb_pk_conflict',
      prompt: 'In a conflict, you tend to —',
      options: [
        { label: 'Confront directly',             dosha: 'pitta' },
        { label: 'Avoid and let it settle',       dosha: 'kapha' },
      ],
    },
    {
      id: 'tb_pk_stamina',
      prompt: 'Your stamina is —',
      options: [
        { label: 'Intense and consuming',         dosha: 'pitta' },
        { label: 'Slow-burning and lasting',      dosha: 'kapha' },
      ],
    },
  ],
}

// Pair key is alphabetically sorted so {vata,pitta} and {pitta,vata} both
// resolve to the same pool.
function pairKey(a, b) {
  return [a, b].sort().join('|')
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ── Scoring ──────────────────────────────────────────────────────────────────
//
// answers           — { [questionId]: 'yes' | 'somewhat' | 'no' }
// tiebreakerAnswers — { [tiebreakerId]: 'vata' | 'pitta' | 'kapha' } (optional)
//
// Returns: { scores, percentages, primary, secondary, tertiary, topGapPct }
//
// Scoring model: each question contributes `answerWeight × questionWeight`
// to its assigned dosha. No negative weights — having a Vata trait doesn't
// reduce your Pitta score, you can authentically be both. Percentages are
// the share of the total, then snapped to sum to exactly 100 by adjusting
// the largest bucket (largest-remainder rounding).
export function scoreQuiz(answers, tiebreakerAnswers = {}) {
  const scores = { vata: 0, pitta: 0, kapha: 0 }

  for (const q of TRAIT_QUESTIONS) {
    const ans = answers[q.id]
    const opt = ANSWER_OPTIONS.find(o => o.value === ans)
    const w = opt ? opt.weight : 0
    scores[q.dosha] += w * q.weight
  }

  for (const dosha of Object.values(tiebreakerAnswers)) {
    if (scores[dosha] !== undefined) scores[dosha] += TIEBREAKER_BONUS
  }

  const total = scores.vata + scores.pitta + scores.kapha
  const percentages = total > 0 ? {
    vata:  Math.round((scores.vata  / total) * 100),
    pitta: Math.round((scores.pitta / total) * 100),
    kapha: Math.round((scores.kapha / total) * 100),
  } : { vata: 33, pitta: 33, kapha: 34 }

  // Snap to 100 by adjusting the largest bucket.
  const sum = percentages.vata + percentages.pitta + percentages.kapha
  if (sum !== 100) {
    const maxKey = ['vata', 'pitta', 'kapha'].reduce(
      (a, b) => percentages[a] >= percentages[b] ? a : b
    )
    percentages[maxKey] += (100 - sum)
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const primary    = sorted[0][0]
  const secondary  = sorted[1][0]
  const tertiary   = sorted[2][0]
  const topGapPct  = percentages[primary] - percentages[secondary]

  return { scores, percentages, primary, secondary, tertiary, topGapPct }
}

// True when the top two doshas are close enough that we should ask
// disambiguating tiebreakers before showing the result.
export function needsTiebreaker(result) {
  return result.topGapPct < TIEBREAKER_GAP_PCT
}

// Tiebreaker pool for the top two doshas of a result.
export function tiebreakersFor(result) {
  return TIEBREAKERS[pairKey(result.primary, result.secondary)] || []
}

// Final label string: "Vata", "Vata-Pitta", or "Tridoshic".
// Computed post-tiebreaker — call after re-scoring with tiebreaker picks.
export function labelFor(result) {
  const { vata, pitta, kapha } = result.scores
  if (vata === pitta && pitta === kapha) return 'Tridoshic'
  if (result.topGapPct < DUAL_GAP_PCT) {
    return `${capitalize(result.primary)}-${capitalize(result.secondary)}`
  }
  return capitalize(result.primary)
}
