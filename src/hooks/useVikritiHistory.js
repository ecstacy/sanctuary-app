// ─────────────────────────────────────────────────────────────────────────────
//  useVikritiHistory — daily vikriti timeline from self-reports
//
//  Sibling of useVikritiSignal (which reads the last 14 days and returns ONE
//  current reading). This reads a longer window and returns a PER-DAY series
//  so the Journey page can show the user their dosha pattern over time —
//  "your Vata flared early in the month, settled by mid-month."
//
//  Each day with at least one check-in (with both energy + stress) gets:
//    { date, energy, stress, vikriti }  where vikriti is the quadrant
//    (vata|pitta|kapha) or null (balanced / no clear quadrant).
//  Days with no usable check-in are omitted from `days` but counted in the
//  window so the strip can show gaps honestly.
//
//  Classification uses the SAME classifyVikriti() as the home signal, so the
//  timeline and the daily reading can never disagree.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { classifyVikriti } from './useVikritiSignal'

const DEFAULT_WINDOW_DAYS = 30

function mean(arr) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0
}
function round1(n) { return Math.round(n * 10) / 10 }

export function useVikritiHistory(windowDays = DEFAULT_WINDOW_DAYS) {
  const { user } = useAuth()
  const [state, setState] = useState({
    isLoading:  true,
    days:       [],     // [{ date, energy, stress, vikriti }]
    counts:     { vata: 0, pitta: 0, kapha: 0, balanced: 0 },
    dominant:   null,   // 'vata' | 'pitta' | 'kapha' | null
    daysTracked: 0,     // distinct days with a usable check-in
    windowDays,
  })

  useEffect(() => {
    let cancelled = false
    if (!user?.id) {
      setState(s => ({ ...s, isLoading: false, days: [], daysTracked: 0 }))
      return
    }

    async function load() {
      const since = new Date()
      since.setDate(since.getDate() - windowDays)

      const { data, error } = await supabase
        .from('user_state_checkins')
        .select('stress_level, energy_level, created_at')
        .eq('user_id', user.id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true })

      if (cancelled) return
      if (error) {
        console.error('[vikriti history] fetch failed:', error.message)
        setState(s => ({ ...s, isLoading: false }))
        return
      }

      // Group usable check-ins (both scales present) by calendar day.
      const byDay = {}
      for (const c of data || []) {
        if (c.stress_level == null || c.energy_level == null) continue
        const day = (c.created_at || '').slice(0, 10)
        if (!day) continue
        ;(byDay[day] ||= { e: [], s: [] })
        byDay[day].e.push(c.energy_level)
        byDay[day].s.push(c.stress_level)
      }

      const days = []
      const counts = { vata: 0, pitta: 0, kapha: 0, balanced: 0 }
      for (const date of Object.keys(byDay).sort()) {
        const energy = round1(mean(byDay[date].e))
        const stress = round1(mean(byDay[date].s))
        const vikriti = classifyVikriti(energy, stress)
        days.push({ date, energy, stress, vikriti })
        counts[vikriti || 'balanced']++
      }

      // Dominant = the quadrant (excluding 'balanced') with the most days.
      const ranked = ['vata', 'pitta', 'kapha']
        .filter(k => counts[k] > 0)
        .sort((a, b) => counts[b] - counts[a])
      const dominant = ranked[0] || null

      setState({
        isLoading:   false,
        days,
        counts,
        dominant,
        daysTracked: days.length,
        windowDays,
      })
    }

    load()
    return () => { cancelled = true }
  }, [user?.id, windowDays])

  return state
}
