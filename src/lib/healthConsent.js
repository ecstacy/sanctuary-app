// ─────────────────────────────────────────────────────────────────────────────
//  healthConsent.js — explicit consent for health-adjacent data (GDPR Art. 9)
//
//  SEPARATE from consent.js (analytics). Different lawful basis, different
//  data, different legal weight:
//    • consent.js   → aggregate product analytics (Art. 6 legitimate-interest-
//                     adjacent; opt-in for cross-user analytics)
//    • this module  → dosha results, mood/energy/stress check-ins, sleep
//                     self-reports, vikriti tracking, and (v2) ALLERGIES and
//                     DIETARY RESTRICTIONS. These are SPECIAL CATEGORY data
//                     under Art. 9; processing them needs EXPLICIT consent
//                     (Art. 9(2)(a)).
//
//  ⚠ The consent TEXT defines the scope, not this comment. If you add a new
//  category of health data, widen doshaQuiz.consentText AND bump
//  CONSENT_VERSION — otherwise the app is processing data the user never
//  agreed to, and the stored consent record cannot demonstrate otherwise.
//
//  Keeping them separate means a user can't accidentally grant one by
//  toggling the other, and the audit trail for each is clean.
//
//  CAPTURE POINT
//  -------------
//  The dosha quiz is the first place the app collects health-adjacent data,
//  so the consent checkbox gates the quiz start. Once granted it covers all
//  downstream wellness data (check-ins, vikriti) — the consent text says so.
//
//  VERSION GATING
//  --------------
//  `CONSENT_VERSION` bumps whenever the consent text materially changes
//  (new data types, new processors). `hasHealthConsent()` only returns true
//  when the stored version matches the current one — so a bump cleanly
//  re-prompts every user without extra plumbing.
//
//  STORAGE
//  -------
//  • localStorage `sanctuary.healthConsent.v1` — authoritative device copy,
//    works before login + survives logout. Anonymous quiz-takers are covered
//    here; the decision migrates to their profile on signup (AuthContext).
//  • profiles.health_data_consent (JSONB) — durable server record so the
//    controller can *demonstrate* consent (a GDPR requirement) and so it
//    follows the user across devices.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sanctuary.healthConsent.v1'

// Bump this when the consent wording materially changes → forces re-prompt.
//
// v2 (2026-07-21) — diet feature. v1 said "dosha results and wellness inputs
// (mood, energy, sleep)", which does NOT cover an allergy or a medical dietary
// restriction. Storing those under v1 would have been processing special-
// category data outside the scope the user agreed to, so the text was widened
// and the version bumped to re-prompt. Done pre-launch, when the re-prompt
// costs essentially nothing; the same change after launch would be far more
// expensive, which is the argument for getting consent scope right early.
export const CONSENT_VERSION = 2

const DEFAULT_STATE = Object.freeze({
  granted: false,
  version: 0,
  at:      null,
})

let _state = readFromStorage()
const _subs = new Set()

function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE }
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_STATE,
      ...parsed,
      granted: !!parsed.granted,
      version: Number(parsed.version) || 0,
    }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

function writeToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota / disabled — non-fatal */ }
}

function emit() {
  _subs.forEach(fn => { try { fn(_state) } catch { /* no-op */ } })
}

// ── Public API ───────────────────────────────────────────────────────────────

export function getHealthConsent() {
  return _state
}

// True only when consent is granted AND for the CURRENT version. A version
// bump (consent text changed) flips this back to false → re-prompt. Fails
// closed: any parse weirdness reads as "not consented".
export function hasHealthConsent() {
  return _state.granted === true && _state.version === CONSENT_VERSION
}

// Record explicit consent. Stamps the current version + timestamp so we
// can demonstrate when + to what the user agreed.
export function grantHealthConsent() {
  _state = {
    granted: true,
    version: CONSENT_VERSION,
    at:      new Date().toISOString(),
  }
  writeToStorage(_state)
  emit()
  return _state
}

// Withdrawal — GDPR requires consent be as easy to withdraw as to give.
// Surfaced from a future Settings control. Doesn't delete already-collected
// data (that's the separate account-deletion / export path); it stops the
// basis for further processing.
export function revokeHealthConsent() {
  _state = { granted: false, version: CONSENT_VERSION, at: new Date().toISOString() }
  writeToStorage(_state)
  emit()
  return _state
}

// Merge the server-side copy on profile load. Server wins only when it
// represents a newer/equal-version grant than what's local — covers the
// cross-device case (consented on phone, opening on web).
export function hydrateFromProfile(profileValue) {
  if (!profileValue || typeof profileValue !== 'object') return
  const incoming = {
    granted: !!profileValue.granted,
    version: Number(profileValue.version) || 0,
    at:      profileValue.at || null,
  }
  // Prefer whichever is the current-version grant; if both or neither,
  // prefer the more recent timestamp.
  const localCurrent  = _state.granted && _state.version === CONSENT_VERSION
  const serverCurrent = incoming.granted && incoming.version === CONSENT_VERSION
  if (serverCurrent && !localCurrent) {
    _state = incoming
    writeToStorage(_state)
    emit()
  }
}

export function subscribe(fn) {
  _subs.add(fn)
  return () => _subs.delete(fn)
}
