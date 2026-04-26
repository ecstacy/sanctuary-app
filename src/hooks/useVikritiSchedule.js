import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  useVikritiSchedule — when is the next vikriti check-in due?
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Cadence strategy (user-approved, see Chunk planning discussion):
 *    • First ~3 checks: every 3 days (high engagement, learn fast)
 *    • After that: every 7 days (sustainable long-term)
 *
 *  "Due" means: days-since-last-vikriti >= threshold. First-timers (no vikriti
 *  yet but have a prakriti) are always due — so the UI can invite them.
 *
 *  Returns:
 *    loading               — still checking
 *    hasPrakriti           — user has a baseline (precondition for vikriti)
 *    lastVikritiAt         — ISO string or null
 *    lastVikritiPrimary    — 'vata' | 'pitta' | 'kapha' | null
 *    lastVikritiSecondary  — 'vata' | 'pitta' | 'kapha' | null
 *    daysSinceLast         — integer (Infinity if no vikriti yet)
 *    vikritiCount          — how many vikriti assessments the user has taken
 *    nextDueAt             — ISO string of when the next one should happen
 *    isDue                 — whether we should surface the prompt now
 */

// Fine-tune here without touching any UI. Both guard rails are deliberate:
// UI surfaces rely on `isDue` to decide visibility; anything not due stays
// invisible rather than half-nagging the user.
const INITIAL_INTERVAL_DAYS = 3
const SETTLED_INTERVAL_DAYS = 7
const INITIAL_PHASE_COUNT   = 3  // first N vikriti assessments use the tighter cadence

// localStorage cache so HomePage doesn't get a delayed pop-in of the
// "Weekly check-in" card on every visit. Scoped per-user so accounts can't
// leak each other's schedule.
const CACHE_KEY = 'sanctuary.vikritiSchedule.v1'

function readCache(userId) {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw || !userId) return null
    const parsed = JSON.parse(raw)
    if (parsed?.userId !== userId) return null
    return parsed.state || null
  } catch {
    return null
  }
}

function writeCache(userId, state) {
  if (!userId) return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ userId, state }))
  } catch { /* quota — ignore */ }
}

// Recompute time-derived fields from a cached snapshot so `daysSinceLast`
// and `isDue` stay correct even if the cache is hours/days old.
function refreshDerived(cached) {
  if (!cached) return null
  const intervalDays = (cached.vikritiCount ?? 0) < INITIAL_PHASE_COUNT
    ? INITIAL_INTERVAL_DAYS
    : SETTLED_INTERVAL_DAYS
  let daysSinceLast = Infinity
  let nextDueAt = null
  if (cached.lastVikritiAt) {
    const last = new Date(cached.lastVikritiAt)
    daysSinceLast = Math.floor((Date.now() - last.getTime()) / 86400000)
    nextDueAt = new Date(last.getTime() + intervalDays * 86400000).toISOString()
  }
  return {
    ...cached,
    daysSinceLast,
    nextDueAt,
    isDue: daysSinceLast >= intervalDays,
    loading: false,
  }
}

export default function useVikritiSchedule() {
  const { user, profile } = useAuth()
  const [state, setState] = useState(() => {
    const cached = refreshDerived(readCache(user?.id))
    return cached || {
      loading:              true,
      hasPrakriti:          false,
      lastVikritiAt:        null,
      lastVikritiPrimary:   null,
      lastVikritiSecondary: null,
      daysSinceLast:        Infinity,
      vikritiCount:         0,
      nextDueAt:            null,
      isDue:                false,
    }
  })
  // Bumping this re-runs the fetch effect. Exposed via the returned
  // `refetch()` so callers (e.g. HomePage returning from /vikriti) can
  // force a fresh read without waiting for auth/profile to change.
  const [refetchKey, setRefetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const hasPrakriti = !!(profile?.dosha_details?.primary || profile?.dosha)

    if (!user?.id || !hasPrakriti) {
      setState(s => ({ ...s, loading: false, hasPrakriti }))
      return
    }

    ;(async () => {
      // Fetch the most recent vikriti row + the total count. Two fast indexed
      // queries; cheaper than pulling history we don't need.
      const { data: latest, error: latestErr } = await supabase
        .from('dosha_assessments')
        .select('created_at, primary_dosha, secondary_dosha')
        .eq('user_id', user.id)
        .eq('assessment_type', 'vikriti')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestErr) console.error('useVikritiSchedule latest fetch:', latestErr.message)

      const { count, error: countErr } = await supabase
        .from('dosha_assessments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('assessment_type', 'vikriti')

      if (countErr) console.error('useVikritiSchedule count fetch:', countErr.message)

      if (cancelled) return

      const vikritiCount        = count ?? 0
      const lastVikritiAt       = latest?.created_at ?? null
      const lastVikritiPrimary  = latest?.primary_dosha ?? null
      const lastVikritiSecondary = latest?.secondary_dosha ?? null

      // Pick the cadence based on how many checks the user has done.
      const intervalDays = vikritiCount < INITIAL_PHASE_COUNT
        ? INITIAL_INTERVAL_DAYS
        : SETTLED_INTERVAL_DAYS

      let daysSinceLast = Infinity
      let nextDueAt     = null
      if (lastVikritiAt) {
        const last = new Date(lastVikritiAt)
        daysSinceLast = Math.floor((Date.now() - last.getTime()) / 86400000)
        nextDueAt = new Date(last.getTime() + intervalDays * 86400000).toISOString()
      }

      const isDue = daysSinceLast >= intervalDays

      const next = {
        loading:              false,
        hasPrakriti:          true,
        lastVikritiAt,
        lastVikritiPrimary,
        lastVikritiSecondary,
        daysSinceLast,
        vikritiCount,
        nextDueAt,
        isDue,
      }
      setState(next)
      writeCache(user.id, next)
    })()

    return () => { cancelled = true }
  }, [user?.id, profile?.dosha, profile?.dosha_details, refetchKey])

  return { ...state, refetch: () => setRefetchKey(k => k + 1) }
}
