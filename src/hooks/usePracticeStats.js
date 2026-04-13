import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'sanctuary_practice_history'

/**
 * Practice session shape:
 * {
 *   id: string (timestamp-based),
 *   date: string (YYYY-MM-DD),
 *   timestamp: number,
 *   routineKey: string,
 *   routineLabel: string,
 *   durationSeconds: number,
 *   completedCount: number,
 *   skippedCount: number,
 *   totalPoses: number,
 *   asanas: [{ id, sanskrit, actualDuration, skipped }]
 * }
 */

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysBetween(a, b) {
  const msDay = 86400000
  const da = new Date(a + 'T00:00:00')
  const db = new Date(b + 'T00:00:00')
  return Math.round(Math.abs(db - da) / msDay)
}

export function savePracticeSession(session) {
  const history = loadHistory()
  history.push({
    ...session,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: toDateStr(new Date()),
    timestamp: Date.now(),
  })
  saveHistory(history)
}

export default function usePracticeStats() {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    setSessions(loadHistory())
  }, [])

  const refresh = useCallback(() => {
    setSessions(loadHistory())
  }, [])

  // ── Derived stats ──

  const today = toDateStr(new Date())

  // Current streak: consecutive days ending today (or yesterday)
  const streak = (() => {
    if (sessions.length === 0) return 0
    const uniqueDays = [...new Set(sessions.map(s => s.date))].sort().reverse()
    if (uniqueDays.length === 0) return 0

    // Check if most recent session is today or yesterday
    const latestDay = uniqueDays[0]
    const gapFromToday = daysBetween(latestDay, today)
    if (gapFromToday > 1) return 0

    let count = 1
    for (let i = 1; i < uniqueDays.length; i++) {
      if (daysBetween(uniqueDays[i], uniqueDays[i - 1]) === 1) {
        count++
      } else {
        break
      }
    }
    return count
  })()

  // Minutes this week (Mon–Sun)
  const weekMinutes = (() => {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0=Sun
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
    monday.setHours(0, 0, 0, 0)
    const mondayStr = toDateStr(monday)

    return Math.round(
      sessions
        .filter(s => s.date >= mondayStr)
        .reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60
    )
  })()

  // Total minutes all time
  const totalMinutes = Math.round(
    sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60
  )

  // Total sessions
  const totalSessions = sessions.length

  // Sessions today
  const todaySessions = sessions.filter(s => s.date === today)

  // Minutes today
  const todayMinutes = Math.round(
    todaySessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60
  )

  // Longest streak ever
  const longestStreak = (() => {
    if (sessions.length === 0) return 0
    const uniqueDays = [...new Set(sessions.map(s => s.date))].sort()
    if (uniqueDays.length === 0) return 0
    let max = 1, current = 1
    for (let i = 1; i < uniqueDays.length; i++) {
      if (daysBetween(uniqueDays[i - 1], uniqueDays[i]) === 1) {
        current++
        max = Math.max(max, current)
      } else {
        current = 1
      }
    }
    return Math.max(max, current)
  })()

  // Get sessions filtered by period
  const getFilteredSessions = useCallback((period) => {
    const now = new Date()
    let cutoff

    switch (period) {
      case '1d': {
        cutoff = toDateStr(now)
        return sessions.filter(s => s.date === cutoff)
      }
      case '1w': {
        const d = new Date(now)
        d.setDate(d.getDate() - 7)
        cutoff = toDateStr(d)
        return sessions.filter(s => s.date >= cutoff)
      }
      case '1m': {
        const d = new Date(now)
        d.setMonth(d.getMonth() - 1)
        cutoff = toDateStr(d)
        return sessions.filter(s => s.date >= cutoff)
      }
      default:
        return sessions
    }
  }, [sessions])

  // Get daily aggregates for chart: [{ date, minutes, sessions }]
  const getDailyData = useCallback((period) => {
    const filtered = getFilteredSessions(period)
    const byDay = {}
    filtered.forEach(s => {
      if (!byDay[s.date]) byDay[s.date] = { date: s.date, minutes: 0, sessions: 0, poses: 0 }
      byDay[s.date].minutes += (s.durationSeconds || 0) / 60
      byDay[s.date].sessions += 1
      byDay[s.date].poses += (s.completedCount || 0)
    })

    // Fill in missing dates for chart continuity
    const now = new Date()
    let start
    switch (period) {
      case '1d': start = new Date(now); break
      case '1w': start = new Date(now); start.setDate(start.getDate() - 6); break
      case '1m': start = new Date(now); start.setDate(start.getDate() - 29); break
      default: {
        if (filtered.length === 0) return []
        start = new Date(filtered[0].date + 'T00:00:00')
        break
      }
    }
    start.setHours(0, 0, 0, 0)

    const result = []
    const cursor = new Date(start)
    while (cursor <= now) {
      const key = toDateStr(cursor)
      result.push(byDay[key] || { date: key, minutes: 0, sessions: 0, poses: 0 })
      cursor.setDate(cursor.getDate() + 1)
    }

    return result
  }, [getFilteredSessions])

  return {
    sessions,
    streak,
    weekMinutes,
    totalMinutes,
    totalSessions,
    todayMinutes,
    todaySessions: todaySessions.length,
    longestStreak,
    getFilteredSessions,
    getDailyData,
    refresh,
  }
}
