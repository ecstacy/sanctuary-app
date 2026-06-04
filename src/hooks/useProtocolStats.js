// ─────────────────────────────────────────────────────────────────────────────
//  useProtocolStats — cross-vikriti totals for the Settings "your journey"
//  surface
//
//  Sibling of useProtocolProgress, which is per-vikriti and tuned for the
//  Protocol page's current-attempt UI. This one aggregates across all
//  three vikriti so we can show a Plus member "you've completed 3
//  protocols" type figures in Settings.
//
//  COUNTING SEMANTICS
//  ──────────────────
//  totalDaysCompleted — every row in protocol_day_completions for the user
//                       (an "active day-of-protocol" count, regardless of
//                       which vikriti it belonged to)
//
//  protocolsFinished  — every row where day === 3. Each represents a
//                       distinct attempt that reached the final day, since
//                       the table is append-only and the UI only writes a
//                       new day-3 row when the user marks day 3 of a fresh
//                       attempt (unmarking deletes the most recent).
//                       Honest "I finished this" count.
//
//  protocolsStarted   — distinct attempts started, computed by grouping
//                       rows by time-cluster (matches useProtocolProgress's
//                       21-day attempt-gap). Useful for showing "started 5,
//                       finished 3" if we want completion-rate UI later.
//
//  Kept lean — one Supabase query, all computation client-side. The
//  protocol_day_completions table for a given user is tiny (tens of rows
//  even for engaged users) so we don't need server-side aggregation.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// Same gap as useProtocolProgress — completions further apart than this
// are treated as different attempts.
const ATTEMPT_GAP_DAYS = 21

export function useProtocolStats() {
  const { user } = useAuth()
  const [stats, setStats]     = useState({
    totalDaysCompleted: 0,
    protocolsFinished:  0,
    protocolsStarted:   0,
    isLoading:          true,
  })

  useEffect(() => {
    let cancelled = false
    if (!user?.id) {
      setStats({ totalDaysCompleted: 0, protocolsFinished: 0, protocolsStarted: 0, isLoading: false })
      return
    }

    async function load() {
      const { data, error } = await supabase
        .from('protocol_day_completions')
        .select('vikriti, day, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: true })

      if (cancelled) return
      if (error) {
        console.error('[protocol stats] fetch failed:', error.message)
        setStats({ totalDaysCompleted: 0, protocolsFinished: 0, protocolsStarted: 0, isLoading: false })
        return
      }

      const rows               = data || []
      const totalDaysCompleted = rows.length
      const protocolsFinished  = rows.filter(r => r.day === 3).length

      // Attempt counting — group per-vikriti by time-gap, mirroring
      // useProtocolProgress so the two surfaces tell the same story.
      const byVikriti = rows.reduce((acc, r) => {
        (acc[r.vikriti] ||= []).push(r)
        return acc
      }, {})

      let protocolsStarted = 0
      for (const arr of Object.values(byVikriti)) {
        let prevT = null
        for (const r of arr) {
          const t = +new Date(r.completed_at)
          if (prevT === null || (t - prevT) > ATTEMPT_GAP_DAYS * 86_400_000) {
            protocolsStarted++
          }
          prevT = t
        }
      }

      setStats({ totalDaysCompleted, protocolsFinished, protocolsStarted, isLoading: false })
    }

    load()
    return () => { cancelled = true }
  }, [user?.id])

  return stats
}
