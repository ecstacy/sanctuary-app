// ─────────────────────────────────────────────────────────────────────────────
//  refine.js — the "sharpen your reading" post-quiz signals.
//
//  Confidence Batch E (#54). A short quiz can't fully represent a person, so
//  right after the result we offer a few optional, dosha-coded questions about
//  how they actually run day to day (digestion, sleep, mind). Answering deepens
//  the reading; the tally is honest evidence, not a silent override.
//
//  Captured pre-account, so it lives in localStorage (like sanctuary.pending.*
//  and sanctuary.intent). Feeds the "getting to know you" progression (#55) and
//  is a second source of dosha evidence for future personalization.
// ─────────────────────────────────────────────────────────────────────────────

const KEY = 'sanctuary.refine'
const DOSHAS = ['vata', 'pitta', 'kapha']

// The questions. `id` keys the i18n copy (doshaQuiz.refine.q.<id>); each option
// index maps to a dosha in `options`.
export const REFINE_QUESTIONS = [
  { id: 'digestion', options: ['vata', 'pitta', 'kapha'] },
  { id: 'sleep',     options: ['vata', 'pitta', 'kapha'] },
  { id: 'mind',      options: ['vata', 'pitta', 'kapha'] },
]

export function getRefine() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

// answers: { digestion: 'vata'|'pitta'|'kapha', sleep: …, mind: … }
// Returns the stored record incl. the tallied `lean` (the dosha the day-to-day
// answers point to). Never throws — refinement is a nice-to-have.
export function saveRefine(answers) {
  const tally = { vata: 0, pitta: 0, kapha: 0 }
  for (const d of Object.values(answers || {})) if (tally[d] != null) tally[d]++
  const lean = [...DOSHAS].sort((a, b) => tally[b] - tally[a])[0]
  const rec = { ...answers, lean, at: new Date().toISOString() }
  try { localStorage.setItem(KEY, JSON.stringify(rec)) } catch { /* storage unavailable */ }
  return rec
}
