// ─────────────────────────────────────────────────────────────────────────────
//  intent.js — the user's stated reason for being here.
//
//  Confidence Batch D (#53). One high-signal, low-friction tap at onboarding —
//  "what brought you here?" — so the app can bend to their goal from minute one
//  and the user feels heard before the quiz has even run. It is the cheapest
//  personal signal available (far less friction than more quiz questions), and a
//  second anchor for every "why this for you" rationale.
//
//  Captured pre-account, so it lives in localStorage (like sanctuary.pending.*).
//  Cross-device persistence can piggyback on the #45 data model later.
// ─────────────────────────────────────────────────────────────────────────────

// The options. `id` keys the i18n label (onboarding.intent.options.<id>); icon
// is a Material Symbols name.
export const INTENTS = [
  { id: 'calm',      icon: 'self_improvement' },
  { id: 'energy',    icon: 'bolt' },
  { id: 'digestion', icon: 'nutrition' },
  { id: 'sleep',     icon: 'bedtime' },
  { id: 'curious',   icon: 'explore' },
]

export const INTENT_IDS = INTENTS.map((i) => i.id)

const KEY = 'sanctuary.intent'

export function getIntent() {
  try {
    const v = localStorage.getItem(KEY)
    return INTENT_IDS.includes(v) ? v : null
  } catch { return null }
}

export function setIntent(id) {
  try {
    if (id && INTENT_IDS.includes(id)) localStorage.setItem(KEY, id)
    else localStorage.removeItem(KEY)
  } catch { /* storage unavailable — intent is a nice-to-have, never blocks */ }
}
