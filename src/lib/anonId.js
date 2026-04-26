// Random per-install identifier used ONLY for aggregate analytics events.
//
// Properties by design:
//   • Never tied to the auth user_id. Not included in user profile row.
//   • Random UUID (crypto.randomUUID when available, else a small fallback).
//   • Can be rotated — if the user toggles aggregate consent off, we forget
//     it and mint a new one on next opt-in.
//
// Stored in localStorage under `sanctuary.anon_id`. Survives app upgrades
// but dies with a clear-data reset, which is intentional.

const KEY = 'sanctuary.anon_id'

function uuid() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch { /* fall through */ }
  // RFC 4122-ish fallback for older WebViews
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getAnonId() {
  try {
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = uuid()
      localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    // Storage unavailable — give a per-session id so events still aggregate
    // within one session, then vanish.
    return uuid()
  }
}

export function rotateAnonId() {
  try {
    localStorage.removeItem(KEY)
  } catch { /* ignore */ }
  return getAnonId()
}
