// ─────────────────────────────────────────────────────────────────────────────
//  useMealFavourites — a per-device set of favourited meal ids.
//
//  Meal Check logs history, but there was no way to keep a dish you liked and
//  come back to it. This is the lightweight loop closure: a star on the meal
//  detail page persists here, and the /meals page surfaces "your favourites".
//
//  localStorage v1 — per-device, no backend. Fine for a personal convenience;
//  if favourites should follow the account across devices later, back it with
//  Supabase behind the same hook. Every read/write is guarded so a private
//  window or blocked storage degrades to "no favourites" rather than throwing.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'

const KEY = 'sanctuary.mealFavourites.v1'

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
  } catch { return [] }
}

// Notify other hook instances in the same tab (storage events only fire across
// tabs), so the detail-page star and the /meals row stay in sync live.
const listeners = new Set()
function broadcast(ids) { listeners.forEach((fn) => fn(ids)) }

export function useMealFavourites() {
  const [ids, setIds] = useState(read)

  useEffect(() => {
    const onChange = (next) => setIds(next)
    listeners.add(onChange)
    const onStorage = (e) => { if (e.key === KEY) setIds(read()) }
    window.addEventListener('storage', onStorage)
    return () => { listeners.delete(onChange); window.removeEventListener('storage', onStorage) }
  }, [])

  const persist = useCallback((next) => {
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
    setIds(next)
    broadcast(next)
  }, [])

  const isFavourite = useCallback((id) => ids.includes(id), [ids])

  const toggle = useCallback((id) => {
    if (!id) return false
    const has = read().includes(id)
    const next = has ? read().filter((x) => x !== id) : [...read(), id]
    persist(next)
    return !has   // the new state
  }, [persist])

  return { favourites: ids, isFavourite, toggle }
}
