// ─────────────────────────────────────────────────────────────────────────────
//  consent.js — analytics consent state
//
//  What this module is for
//  -----------------------
//  The app already writes first-party, per-user product data (recommendation
//  shown → clicked, check-ins, search queries) so we can personalize *this
//  user's* experience. That's core product function — no consent modal,
//  it's what the user signed up for.
//
//  What this module gates is *aggregate* analytics: using anonymized,
//  user-id-stripped copies of those events to answer product questions
//  across the whole user base (e.g. "does the new home layout lift
//  week-2 retention?"). That needs explicit consent in most jurisdictions.
//
//  Defaults
//  --------
//  • `aggregate` → off until the user says yes
//  • `crash`     → off until the user says yes (no crash reporter wired up
//                  today, but the flag is here so we can add one later
//                  without shipping another consent prompt)
//
//  Storage
//  -------
//  • localStorage: `sanctuary.consent.v1` → the authoritative device copy,
//    works before login and survives logout.
//  • profiles.analytics_consent (JSONB, optional migration) → per-account
//    copy so the choice follows the user across devices. AuthContext should
//    call `hydrateFromProfile()` on profile load; we accept either a plain
//    boolean (legacy) or the JSON shape below.
//
//  Shape
//  -----
//    {
//      aggregate: boolean,
//      crash: boolean,
//      decidedAt: ISOString | null,
//      askAgainAfter: ISOString | null,   // set when user says "not now"
//    }
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sanctuary.consent.v1'
const ASK_AGAIN_DAYS = 90

const DEFAULT_STATE = Object.freeze({
  aggregate: false,
  crash: false,
  decidedAt: null,
  askAgainAfter: null,
})

// Simple in-memory cache + subscriber set so React components can re-render.
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
      // Coerce suspicious values
      aggregate: !!parsed.aggregate,
      crash: !!parsed.crash,
    }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

function writeToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota or disabled — safe to ignore */ }
}

function emit() {
  _subs.forEach(fn => {
    try { fn(_state) } catch { /* no-op */ }
  })
}

// ── Public API ───────────────────────────────────────────────────────────────

export function getConsent() {
  return _state
}

// Has the user made any explicit decision yet? (Not "not now".)
export function hasDecided() {
  return _state.decidedAt !== null
}

// Should we show the consent card right now?
// Rules:
//   • not shown if user has already decided (yes or no)
//   • not shown if user recently chose "not now" and the cool-off window
//     hasn't elapsed
export function shouldAskNow() {
  if (_state.decidedAt) return false
  if (_state.askAgainAfter) {
    const until = Date.parse(_state.askAgainAfter)
    if (!Number.isNaN(until) && until > Date.now()) return false
  }
  return true
}

export function grantAggregate() {
  _state = {
    ..._state,
    aggregate: true,
    decidedAt: new Date().toISOString(),
    askAgainAfter: null,
  }
  writeToStorage(_state)
  emit()
  return _state
}

export function declineAggregate() {
  _state = {
    ..._state,
    aggregate: false,
    crash: false,
    decidedAt: new Date().toISOString(),
    askAgainAfter: null,
  }
  writeToStorage(_state)
  emit()
  return _state
}

// "Not now" — soft dismissal. Don't count as a decision; just wait.
export function deferConsent(days = ASK_AGAIN_DAYS) {
  const next = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
  _state = { ..._state, askAgainAfter: next }
  writeToStorage(_state)
  emit()
  return _state
}

// Toggle from the Profile settings screen. Marks the flip as a decision.
export function setAggregate(enabled) {
  _state = {
    ..._state,
    aggregate: !!enabled,
    decidedAt: new Date().toISOString(),
    askAgainAfter: null,
  }
  writeToStorage(_state)
  emit()
  return _state
}

// Hydrate from the server-side copy on profile load. We take the server copy
// only if it's newer than our local decision — otherwise the local wins
// (handles the case where the user just toggled on this device but the row
// hasn't synced yet).
export function hydrateFromProfile(profileValue) {
  if (!profileValue) return
  let incoming
  if (typeof profileValue === 'boolean') {
    incoming = { ...DEFAULT_STATE, aggregate: profileValue, decidedAt: new Date(0).toISOString() }
  } else if (typeof profileValue === 'object') {
    incoming = { ...DEFAULT_STATE, ...profileValue, aggregate: !!profileValue.aggregate, crash: !!profileValue.crash }
  } else {
    return
  }

  const localT = _state.decidedAt ? Date.parse(_state.decidedAt) : 0
  const serverT = incoming.decidedAt ? Date.parse(incoming.decidedAt) : 0
  if (serverT > localT) {
    _state = incoming
    writeToStorage(_state)
    emit()
  }
}

// Subscribe to state changes. Returns an unsubscribe fn.
export function subscribe(fn) {
  _subs.add(fn)
  return () => _subs.delete(fn)
}

// Guard helpers for analytics.js — returns true only when the user has
// explicitly opted in. Designed to fail closed.
export function isAggregateAllowed() {
  return _state.aggregate === true
}

export function isCrashReportingAllowed() {
  return _state.crash === true
}
