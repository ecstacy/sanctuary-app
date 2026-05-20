// ─────────────────────────────────────────────────────────────────────────────
//  useProtocolProgress — read + mutate protocol day completions
//
//  Powers the "mark complete" buttons on ProtocolPage and the history
//  rollup at the bottom. The table is append-only (every mark inserts a
//  row, every unmark deletes the most recent row for that day), so the
//  hook derives two layered views:
//
//    currentAttempt — completions within the last CURRENT_WINDOW_DAYS.
//                     Drives the "Day 2 ✓" badges on the tabs and the
//                     button state on each day's complete CTA.
//
//    history        — completions older than the current window, grouped
//                     into past "attempts" by time clustering. Drives the
//                     "You've worked through this 3 times" rollup at the
//                     bottom of the page.
//
//  WHY CLIENT-SIDE GROUPING
//  ────────────────────────
//  Past-attempt detection from raw completion timestamps is a 10-line
//  client computation — moving it to a database view would require a
//  view + grant + (eventually) cache logic. Not worth the complexity
//  while the data shape is still finding its feet.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// "Current attempt" window — completions inside this window count toward
// the active run; completions older than this roll into history. Same
// 14-day window as useVikritiSignal so the two concepts stay aligned:
// a vikriti reading triggers a protocol; the protocol "current attempt"
// is whatever happens in that same 14-day frame.
const CURRENT_WINDOW_DAYS = 14

// Gap that separates one historical attempt from another. If completions
// for the same protocol are spaced more than ATTEMPT_GAP_DAYS apart, we
// treat them as belonging to different attempts. Tuned so a person who
// did Day 1 Monday and Day 2 the next weekend is still "one attempt".
const ATTEMPT_GAP_DAYS = 21

export function useProtocolProgress(vikriti) {
  const { user } = useAuth()

  const [rows, setRows]           = useState([])
  const [isLoading, setLoading]   = useState(true)
  const [error, setError]         = useState(null)

  // ── Fetch ───────────────────────────────────────────────────────────────
  const reload = useCallback(async () => {
    if (!user?.id || !vikriti) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('protocol_day_completions')
      .select('id, day, completed_at')
      .eq('user_id', user.id)
      .eq('vikriti', vikriti)
      .order('completed_at', { ascending: false })

    if (err) {
      console.error('[protocol] fetch failed:', err.message)
      setError(err)
      setRows([])
    } else {
      setRows(data || [])
      setError(null)
    }
    setLoading(false)
  }, [user?.id, vikriti])

  useEffect(() => { reload() }, [reload])

  // ── Derived views ───────────────────────────────────────────────────────
  // Re-computed on every render — cheap (rows is small), and avoids a
  // useMemo dependency dance.
  const now = Date.now()
  const windowStart = now - CURRENT_WINDOW_DAYS * 86_400_000

  // Current attempt: latest completion per day, only counting completions
  // inside the current window. Map { day: ISO timestamp }.
  const currentAttempt = {}
  for (const r of rows) {
    const t = new Date(r.completed_at).getTime()
    if (t < windowStart) continue
    if (!currentAttempt[r.day]) currentAttempt[r.day] = r.completed_at
  }
  const currentDaysCompleted = Object.keys(currentAttempt).length

  // History: cluster completions outside the current window into attempts
  // by gap. Each attempt: { startedAt, completedAt, daysCompleted }.
  const olderRows = rows.filter(
    r => new Date(r.completed_at).getTime() < windowStart
  ).sort((a, b) => +new Date(a.completed_at) - +new Date(b.completed_at))

  const history = []
  let bucket = null
  for (const r of olderRows) {
    const t = +new Date(r.completed_at)
    if (!bucket || t - bucket.lastT > ATTEMPT_GAP_DAYS * 86_400_000) {
      if (bucket) history.push(bucketToAttempt(bucket))
      bucket = { startedAt: r.completed_at, lastT: t, days: new Set([r.day]) }
    } else {
      bucket.days.add(r.day)
      bucket.lastT = t
      bucket.completedAt = r.completed_at
    }
  }
  if (bucket) history.push(bucketToAttempt(bucket))
  history.reverse()  // newest historical attempt first

  // ── Mutations ───────────────────────────────────────────────────────────
  // markDayComplete inserts a row and optimistically updates local state.
  // The optimistic update is what makes the button feel instant; the
  // reload() on settle re-syncs from the source of truth.
  const markDayComplete = useCallback(async (day, context = {}) => {
    if (!user?.id || !vikriti) return null

    // Optimistic insert with a temp id; we'll replace via reload().
    const tempId = `temp_${Date.now()}`
    const optimisticRow = { id: tempId, day, completed_at: new Date().toISOString() }
    setRows(prev => [optimisticRow, ...prev])

    const { error: err } = await supabase
      .from('protocol_day_completions')
      .insert({ user_id: user.id, vikriti, day, context })

    if (err) {
      console.error('[protocol] mark failed:', err.message)
      // Roll back the optimistic insert.
      setRows(prev => prev.filter(r => r.id !== tempId))
      return null
    }
    await reload()
    return optimisticRow
  }, [user?.id, vikriti, reload])

  // Unmark: delete the most recent completion row for (user, vikriti, day).
  // Append-only history means earlier completions stay — only the current
  // attempt's mark for that day is removed.
  const unmarkDay = useCallback(async (day) => {
    if (!user?.id || !vikriti) return
    // Find the most recent row for this day in the current attempt.
    const target = rows.find(
      r => r.day === day && new Date(r.completed_at).getTime() >= windowStart
    )
    if (!target) return

    // Optimistic remove.
    setRows(prev => prev.filter(r => r.id !== target.id))

    const { error: err } = await supabase
      .from('protocol_day_completions')
      .delete()
      .eq('id', target.id)

    if (err) {
      console.error('[protocol] unmark failed:', err.message)
      // Re-fetch to restore correct state.
      await reload()
    }
  }, [user?.id, vikriti, rows, windowStart, reload])

  return {
    isLoading,
    error,
    currentAttempt,         // { 1: ISO, 2: ISO, ... }
    currentDaysCompleted,   // integer 0..N
    history,                // [{ startedAt, completedAt, daysCompleted }, …]
    totalAttempts:          history.length + (currentDaysCompleted > 0 ? 1 : 0),
    markDayComplete,
    unmarkDay,
  }
}

function bucketToAttempt(b) {
  return {
    startedAt:     b.startedAt,
    completedAt:   b.completedAt || b.startedAt,
    daysCompleted: b.days.size,
  }
}
