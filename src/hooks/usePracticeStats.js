import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const LOCAL_CACHE_KEY = 'sanctuary_practice_history'

/**
 * Practice session shape (Supabase row):
 * {
 *   id: uuid,
 *   user_id: uuid,
 *   date: string (YYYY-MM-DD),
 *   routine_key: string,
 *   routine_label: string,
 *   duration_seconds: number,
 *   completed_count: number,
 *   skipped_count: number,
 *   total_poses: number,
 *   asanas: [{ id, sanskrit, actualDuration, skipped }],
 *   created_at: string,
 * }
 */

// ── Helpers ────────────────────────────────────────────────────────────

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysBetween(a, b) {
  const msDay = 86400000
  const da = new Date(a + 'T00:00:00')
  const db = new Date(b + 'T00:00:00')
  return Math.round(Math.abs(db - da) / msDay)
}

function readLocalCache() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocalCache(sessions) {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(sessions))
  } catch { /* quota exceeded — ignore */ }
}

// ── Save a practice session (called from PracticePage) ────────────────
//
// Returns the inserted session row id (uuid) so callers can link follow-on
// events — e.g. user_state_checkins.related_session_id for the
// pre-practice → session → post-practice loop (Chunks 13-14).
// Returns null if there was no user or the insert failed.

export async function savePracticeSession(session, userId) {
  const dateStr = toDateStr(new Date())

  // 1) Save session header to Supabase — capture new row id for fan-out
  let sessionRowId = null
  if (userId) {
    const { data, error } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: userId,
        practice_date: dateStr,
        routine_key: session.routineKey,
        routine_label: session.routineLabel,
        duration_seconds: session.durationSeconds,
        completed_count: session.completedCount,
        skipped_count: session.skippedCount,
        total_poses: session.totalPoses,
        asanas: session.asanas,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to save practice session:', error.message)
    } else {
      sessionRowId = data?.id ?? null
    }
  }

  // 2) Fan out one row per pose into pose_interactions (ML/analytics table)
  if (sessionRowId && Array.isArray(session.asanas) && session.asanas.length > 0) {
    const poseRows = session.asanas
      .filter(a => a && a.id)
      .map((a, i) => ({
        session_id: sessionRowId,
        user_id: userId,
        pose_id: a.id,
        pose_sanskrit: a.sanskrit ?? null,
        pose_order: i + 1,
        prescribed_duration_seconds: a.prescribedDuration ?? null,
        actual_duration_seconds: a.actualDuration ?? 0,
        was_skipped: !!a.skipped,
        was_repeated: false,
      }))

    if (poseRows.length > 0) {
      const { error: poseErr } = await supabase.from('pose_interactions').insert(poseRows)
      if (poseErr) console.error('Failed to save pose interactions:', poseErr.message)
    }
  }

  // 3) Update local cache for instant UI update / offline fallback
  const cached = readLocalCache()
  cached.push({
    ...session,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: dateStr,
    timestamp: Date.now(),
  })
  writeLocalCache(cached)

  return sessionRowId
}

// ── Migrate localStorage sessions to Supabase (runs once) ────────────

async function migrateLocalToSupabase(userId) {
  const MIGRATED_KEY = 'sanctuary_practice_migrated'
  if (localStorage.getItem(MIGRATED_KEY)) return

  const local = readLocalCache()
  if (local.length === 0) {
    localStorage.setItem(MIGRATED_KEY, '1')
    return
  }

  const rows = local.map(s => ({
    user_id: userId,
    practice_date: s.date,
    routine_key: s.routineKey,
    routine_label: s.routineLabel,
    duration_seconds: s.durationSeconds || 0,
    completed_count: s.completedCount || 0,
    skipped_count: s.skippedCount || 0,
    total_poses: s.totalPoses || 0,
    asanas: s.asanas || [],
    created_at: s.timestamp ? new Date(s.timestamp).toISOString() : new Date().toISOString(),
  }))

  const { error } = await supabase.from('practice_sessions').insert(rows)
  if (!error) {
    localStorage.setItem(MIGRATED_KEY, '1')
  } else {
    console.error('Migration failed:', error.message)
  }
}

// ── The hook ──────────────────────────────────────────────────────────

export default function usePracticeStats() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  // Normalize a Supabase row into the shape the rest of the app expects
  const normalize = (row) => ({
    id: row.id,
    date: row.practice_date,
    routineKey: row.routine_key,
    routineLabel: row.routine_label,
    durationSeconds: row.duration_seconds,
    completedCount: row.completed_count,
    skippedCount: row.skipped_count,
    totalPoses: row.total_poses,
    asanas: row.asanas,
    timestamp: new Date(row.created_at).getTime(),
  })

  const fetchSessions = useCallback(async () => {
    if (!user) {
      setSessions([])
      setLoading(false)
      return
    }

    // Migrate any localStorage data first (idempotent)
    await migrateLocalToSupabase(user.id)

    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('practice_date', { ascending: true })

    if (error) {
      console.error('Failed to fetch practice sessions:', error.message)
      // Fallback to local cache
      setSessions(readLocalCache())
    } else {
      const normalized = (data || []).map(normalize)
      setSessions(normalized)
      // Keep local cache in sync
      writeLocalCache(normalized)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const refresh = useCallback(() => {
    fetchSessions()
  }, [fetchSessions])

  // ── Derived stats ──────────────────────────────────────────────────

  const today = toDateStr(new Date())

  // Has the user ever completed a session?
  const hasSessions = sessions.length > 0

  // Current streak: consecutive days ending today (or yesterday)
  const streak = (() => {
    if (sessions.length === 0) return 0
    const uniqueDays = [...new Set(sessions.map(s => s.date))].sort().reverse()
    if (uniqueDays.length === 0) return 0

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
    loading,
    hasSessions,
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
