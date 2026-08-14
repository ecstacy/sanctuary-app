// ─────────────────────────────────────────────────────────────────────────────
//  asanaDone.js — "done for the day" per-asana tracker.
//
//  A lightweight personal check: tick a pose done today from its detail page or
//  the library, independent of a full guided session. Resets automatically at
//  local midnight (the store is keyed by today's date; a stale day reads empty
//  and is overwritten on the next write).
//
//  v1 is device-local (localStorage) — the core job-to-be-done with zero backend
//  or migration. Cross-device sync and feeding it into Journey/streak stats is a
//  deliberate follow-up (would need a Supabase table); this intentionally does
//  NOT touch the practice-session streak, which stays tied to real sessions.
// ─────────────────────────────────────────────────────────────────────────────

const KEY = 'sanctuary.asanaDone'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (raw && raw.date === todayKey() && Array.isArray(raw.ids)) return new Set(raw.ids)
  } catch { /* unavailable / malformed — treat as empty */ }
  return new Set()
}

function write(set) {
  try { localStorage.setItem(KEY, JSON.stringify({ date: todayKey(), ids: [...set] })) } catch { /* quota — ignore */ }
}

/** The set of asana ids marked done today (empty on a new day). */
export function getDoneToday() {
  return read()
}

export function isDoneToday(id) {
  return read().has(id)
}

/** Toggle an asana's done-today state; returns the new done boolean for `id`. */
export function toggleDoneToday(id) {
  const s = read()
  if (s.has(id)) s.delete(id)
  else s.add(id)
  write(s)
  return s.has(id)
}

export function doneTodayCount() {
  return read().size
}
