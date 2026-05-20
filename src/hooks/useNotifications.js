// ─────────────────────────────────────────────────────────────────────────────
//  useNotifications — local notification scheduling
//
//  Manages the user's notification preferences (read from + written to
//  profiles.notification_prefs) and the corresponding OS-level schedule.
//  Currently supports one type: a daily practice reminder. The shape is
//  future-proofed for additional types (streak save, vikriti drift,
//  seasonal) which will land as separate sessions when we wire the
//  push-notifications side.
//
//  ARCHITECTURE
//  ────────────
//  Two layers of state must stay in sync:
//
//    1. PERSISTED preference (DB)       — survives app reinstall, syncs
//                                          across devices once we add that.
//    2. SCHEDULED OS notification       — what the device will actually
//                                          show. Lost on app uninstall;
//                                          must be re-applied on launch.
//
//  This hook owns BOTH sides. setPracticeReminder() writes the pref AND
//  reschedules the OS notification atomically. reapplyFromProfile() runs
//  on app launch to restore the OS-level schedule from the persisted
//  pref (e.g. after a reinstall, or after permission was revoked).
//
//  GRACEFUL ON WEB
//  ───────────────
//  The plugin is a no-op on web. We detect that via Capacitor.isNativePlatform()
//  and skip schedule/cancel calls — the pref still saves so it's ready
//  when the user later installs the native app.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { track, EVENTS } from '../lib/track'

// Stable numeric ids per notification type. Capacitor's API keys schedule
// + cancel operations by numeric id; we keep them in a small registry so
// adding a new type doesn't risk colliding with an existing one.
const NOTIFICATION_IDS = {
  practice_reminder: 1001,
  // streak_save:     1002,
  // vikriti_drift:   1003,
  // seasonal:        1004,
}

const DEFAULT_REMINDER_TIME = '07:00'

// ── Public API ──────────────────────────────────────────────────────────────
export function useNotifications() {
  const { user, profile, refreshProfile } = useAuth()
  const [permissionState, setPermissionState] = useState('unknown') // 'granted' | 'denied' | 'unknown'
  const [busy, setBusy]                       = useState(false)

  // Current pref blob, with sensible defaults applied for any missing keys.
  const prefs = normalizePrefs(profile?.notification_prefs)

  // ── Initial permission check ────────────────────────────────────────────
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      setPermissionState('unsupported')
      return
    }
    LocalNotifications.checkPermissions()
      .then((res) => setPermissionState(res.display === 'granted' ? 'granted' : 'denied'))
      .catch(() => setPermissionState('unknown'))
  }, [])

  // ── Permission flow ─────────────────────────────────────────────────────
  // Request notification permission. Returns true on grant. On Android 13+
  // this opens the OS prompt; on older Android + iOS this is the
  // standard flow. On web, immediately resolves false.
  //
  // Tracks both the prompt impression AND the result — Android 13+
  // permission grant rate is the single biggest drop-off in any
  // notification feature, so we measure it directly.
  const requestPermission = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return false
    track(EVENTS.NOTIFICATION_PERMISSION_REQUESTED, {
      platform: Capacitor.getPlatform(),
    })
    try {
      const res = await LocalNotifications.requestPermissions()
      const granted = res.display === 'granted'
      setPermissionState(granted ? 'granted' : 'denied')
      track(EVENTS.NOTIFICATION_PERMISSION_RESULT, {
        platform: Capacitor.getPlatform(),
        granted,
        raw_state: res.display,
      })
      return granted
    } catch (err) {
      console.error('[notifications] permission request failed:', err)
      setPermissionState('denied')
      track(EVENTS.NOTIFICATION_PERMISSION_RESULT, {
        platform: Capacitor.getPlatform(),
        granted: false,
        error:   (err && err.message) || 'unknown',
      })
      return false
    }
  }, [])

  // ── Practice reminder ───────────────────────────────────────────────────
  // Enable + set time atomically. The function:
  //   1. Persists the pref (so re-installs / device swaps restore it)
  //   2. Re-schedules the OS notification with the new time
  //   3. Refreshes the profile so other hooks reading the pref see it
  const setPracticeReminder = useCallback(async ({ enabled, time }) => {
    if (!user?.id) return false
    setBusy(true)

    try {
      // 1. Acquire OS permission if turning on and not yet granted.
      if (enabled && permissionState !== 'granted' && Capacitor.isNativePlatform()) {
        const granted = await requestPermission()
        if (!granted) {
          setBusy(false)
          return false
        }
      }

      // 2. Persist the preference.
      const nextPrefs = {
        ...prefs,
        practice_reminder: {
          enabled: !!enabled,
          time:    time || prefs.practice_reminder.time,
        },
      }
      const { error } = await supabase
        .from('profiles')
        .update({ notification_prefs: nextPrefs })
        .eq('id', user.id)

      if (error) {
        console.error('[notifications] pref save failed:', error.message)
        setBusy(false)
        return false
      }

      // 3. Apply at the OS level.
      if (Capacitor.isNativePlatform()) {
        await cancelNotification(NOTIFICATION_IDS.practice_reminder)
        if (enabled) {
          await scheduleDailyAt({
            id:    NOTIFICATION_IDS.practice_reminder,
            title: 'Time for your practice',
            body:  'Your mat is waiting. Five minutes is enough to start.',
            time:  nextPrefs.practice_reminder.time,
          })
        }
      }

      // 4. Refresh profile so the rest of the app sees the new pref
      //    without waiting for the next page mount.
      await refreshProfile()

      // 5. Analytics — separate events for enable/disable/time-change so
      //    each one has a clean PostHog filter. Time changes fire on top
      //    of enable-while-already-on (the user picks a new time on an
      //    already-on toggle), distinguished by the prior pref state.
      const wasEnabled = prefs.practice_reminder.enabled
      const priorTime  = prefs.practice_reminder.time

      if (enabled && !wasEnabled) {
        track(EVENTS.NOTIFICATION_REMINDER_ENABLED, {
          time: nextPrefs.practice_reminder.time,
        })
      } else if (!enabled && wasEnabled) {
        track(EVENTS.NOTIFICATION_REMINDER_DISABLED, {
          time: priorTime,
        })
      } else if (enabled && time && time !== priorTime) {
        track(EVENTS.NOTIFICATION_REMINDER_TIME_CHANGED, {
          from: priorTime,
          to:   nextPrefs.practice_reminder.time,
        })
      }

      return true
    } finally {
      setBusy(false)
    }
  }, [user?.id, prefs, permissionState, requestPermission, refreshProfile])

  // ── Boot-time re-apply ──────────────────────────────────────────────────
  // Called once per app launch (and on auth change) to re-establish the
  // OS-level schedule from the persisted pref. Handles the reinstall
  // case + the "user revoked permission in OS settings" case (we won't
  // know until we try to re-schedule and the OS rejects us).
  const reapplyFromProfile = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return
    const reminder = prefs.practice_reminder
    if (!reminder?.enabled) {
      // Make sure no stale OS schedule survives a "disable from another device" flow.
      await cancelNotification(NOTIFICATION_IDS.practice_reminder)
      return
    }
    // Check permission first — silent re-apply must not show a prompt.
    const perm = await LocalNotifications.checkPermissions().catch(() => null)
    if (perm?.display !== 'granted') {
      // No permission — we can't schedule. Leave the pref in place so
      // the next time the user opens Settings, they can re-grant.
      return
    }
    await cancelNotification(NOTIFICATION_IDS.practice_reminder)
    await scheduleDailyAt({
      id:    NOTIFICATION_IDS.practice_reminder,
      title: 'Time for your practice',
      body:  'Your mat is waiting. Five minutes is enough to start.',
      time:  reminder.time,
    })
  }, [prefs])

  return {
    prefs,
    permissionState,
    busy,
    requestPermission,
    setPracticeReminder,
    reapplyFromProfile,
    isSupported: Capacitor.isNativePlatform(),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Internals
// ─────────────────────────────────────────────────────────────────────────────

// Apply defaults to whatever's in profiles.notification_prefs. Keeping this
// pure lets the Settings UI render without null-juggling.
function normalizePrefs(raw) {
  const base = raw || {}
  return {
    practice_reminder: {
      enabled: base.practice_reminder?.enabled ?? false,
      time:    base.practice_reminder?.time    ?? DEFAULT_REMINDER_TIME,
    },
  }
}

// Schedule one notification that repeats daily at HH:MM local time.
// Capacitor's "repeats: true" + schedule.on with hour+minute is the
// supported recipe for daily repeats. We don't use a Date here because
// then `repeats: true` would mean "every (date interval)" — vague.
async function scheduleDailyAt({ id, title, body, time }) {
  const [h, m] = time.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return

  // Capacitor requires the schedule's `on` to be a future moment when
  // repeats=true. If today's HH:MM has already passed, the first fire
  // is tomorrow — Capacitor handles this if `at` is in the past by
  // skipping to the next matching slot, but we compute it explicitly
  // for clarity.
  const now  = new Date()
  const next = new Date()
  next.setHours(h, m, 0, 0)
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1)
  }

  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title,
        body,
        schedule: {
          on:      { hour: h, minute: m },
          allowWhileIdle: true,  // Doze-mode safe
          repeats: true,
        },
        // Optional payload — used when we wire deeplink-on-tap (Phase 2).
        extra: { kind: 'practice_reminder', scheduled_at: next.toISOString() },
      },
    ],
  })
}

async function cancelNotification(id) {
  try {
    await LocalNotifications.cancel({ notifications: [{ id }] })
  } catch (err) {
    // Cancel can fail for "doesn't exist" — fine, treat as success.
    console.debug('[notifications] cancel failed (likely already absent):', err?.message)
  }
}
