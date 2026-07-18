// ─────────────────────────────────────────────────────────────────────────────
//  useNotifications — local notification preferences + reconciler
//
//  Two layers kept in sync:
//    1. PERSISTED prefs (profiles.notification_prefs) — survive reinstall,
//       sync across devices.
//    2. SCHEDULED OS notifications — what the device shows. Lost on uninstall;
//       re-derived from state on every launch.
//
//  Because a local notification can't inspect app state when it fires, we
//  don't schedule "repeat daily forever". Instead `syncNotifications(ctx)`
//  computes the desired one-shots from current state (see lib/notificationPlan)
//  and diff-applies (cancel managed range → schedule desired). A single
//  reconciler component (App.jsx) calls it reactively on boot, practice
//  completion, prefs change, and language change, so the rolling window stays
//  fresh and "skip a day I already practiced" just works.
//
//  Graceful on web: the plugin is a no-op; prefs still persist.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { track, EVENTS } from '../lib/track'
import i18n from '../i18n'
import { buildDesiredNotifications } from '../lib/notificationPlan'

// Managed id pool. The reconciler owns this whole block: every sync cancels
// all of them, then schedules the desired set into the low ids. Keeping a
// fixed range means we never leak a stale schedule.
const MANAGED_ID_BASE = 1100
const MANAGED_ID_COUNT = 8
const MANAGED_IDS = Array.from({ length: MANAGED_ID_COUNT }, (_, i) => MANAGED_ID_BASE + i)

// A soothing singing-bowl chime (res/raw/singing_bowl.wav) instead of the OS
// default. Android binds sound to the CHANNEL and a channel's sound is
// immutable once created — so to change it we version the channel ids (…_v2)
// and delete the old channels in ensureChannels(). Bump the suffix again if
// the sound ever changes.
const NOTIF_SOUND = 'singing_bowl.wav'

// OS channels (Android) so a user can mute one kind in system settings.
const CHANNELS = [
  { id: 'reminders_v2', name: 'Practice reminders', description: 'Your daily practice reminder', importance: 4, sound: NOTIF_SOUND },
  { id: 'streaks_v2',   name: 'Streaks',            description: 'Nudges to keep your streak alive', importance: 4, sound: NOTIF_SOUND },
  { id: 'insights_v2',  name: 'Insights',           description: 'Check-in and wind-down nudges',    importance: 3, sound: NOTIF_SOUND },
]
// Legacy channel ids (default sound) — deleted on init so the new ones apply.
const LEGACY_CHANNEL_IDS = ['reminders', 'streaks', 'insights']
const KIND_CHANNEL = {
  practice_reminder: 'reminders_v2',
  streak_save:       'streaks_v2',
  wind_down:         'insights_v2',
  vikriti_due:       'insights_v2',
}

const DEFAULT_REMINDER_TIME = '07:00'

// Localized copy resolved AT SCHEDULE TIME (the OS bakes text into pending
// notifications, so the reconciler re-runs on languageChanged).
function notificationContent(kind, args = {}) {
  const t = i18n.t.bind(i18n)
  switch (kind) {
    case 'practice_reminder':
      return { title: t('notifications.practiceReminderTitle'), body: t('notifications.practiceReminderBody') }
    case 'streak_save':
      return { title: t('notifications.streakSaveTitle'), body: t('notifications.streakSaveBody', { days: args.days ?? '' }) }
    case 'wind_down':
      return { title: t('notifications.windDownTitle'), body: t('notifications.windDownBody') }
    case 'vikriti_due':
      return { title: t('notifications.vikritiDueTitle'), body: t('notifications.vikritiDueBody') }
    default:
      return { title: t('notifications.practiceReminderTitle'), body: t('notifications.practiceReminderBody') }
  }
}

async function ensureChannels() {
  if (Capacitor.getPlatform() !== 'android') return
  // Drop legacy channels (default sound) so the versioned ones take effect.
  for (const id of LEGACY_CHANNEL_IDS) {
    try { await LocalNotifications.deleteChannel({ id }) } catch { /* absent is fine */ }
  }
  for (const ch of CHANNELS) {
    try { await LocalNotifications.createChannel(ch) }
    catch (err) { console.debug('[notifications] createChannel failed:', err?.message) }
  }
}

// ── Public API ──────────────────────────────────────────────────────────────
export function useNotifications() {
  const { user, profile, refreshProfile } = useAuth()
  const [permissionState, setPermissionState] = useState('unknown')
  const [busy, setBusy] = useState(false)

  const prefs = normalizePrefs(profile?.notification_prefs)

  // ── Permission check + channel setup ──
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) { setPermissionState('unsupported'); return }
    ensureChannels()
    LocalNotifications.checkPermissions()
      .then((res) => setPermissionState(res.display === 'granted' ? 'granted' : 'denied'))
      .catch(() => setPermissionState('unknown'))
  }, [])

  const requestPermission = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return false
    track(EVENTS.NOTIFICATION_PERMISSION_REQUESTED, { platform: Capacitor.getPlatform() })
    try {
      const res = await LocalNotifications.requestPermissions()
      const granted = res.display === 'granted'
      setPermissionState(granted ? 'granted' : 'denied')
      track(EVENTS.NOTIFICATION_PERMISSION_RESULT, { platform: Capacitor.getPlatform(), granted, raw_state: res.display })
      return granted
    } catch (err) {
      console.error('[notifications] permission request failed:', err)
      setPermissionState('denied')
      track(EVENTS.NOTIFICATION_PERMISSION_RESULT, { platform: Capacitor.getPlatform(), granted: false, error: err?.message || 'unknown' })
      return false
    }
  }, [])

  // Persist a pref change (no OS scheduling here — the reconciler picks it up
  // reactively after refreshProfile). Requests permission when turning a type
  // on for the first time.
  const savePref = useCallback(async (next, { needPermission } = {}) => {
    if (!user?.id) return false
    setBusy(true)
    try {
      if (needPermission && permissionState !== 'granted' && Capacitor.isNativePlatform()) {
        const granted = await requestPermission()
        if (!granted) return false
      }
      const { error } = await supabase.from('profiles').update({ notification_prefs: next }).eq('id', user.id)
      if (error) { console.error('[notifications] pref save failed:', error.message); return false }
      await refreshProfile()
      return true
    } finally {
      setBusy(false)
    }
  }, [user?.id, permissionState, requestPermission, refreshProfile])

  // The daily practice reminder (enable + time). Kept as its own method so the
  // existing Settings toggle keeps working; fires the enable/disable/time events.
  const setPracticeReminder = useCallback(async ({ enabled, time }) => {
    const wasEnabled = prefs.practice_reminder.enabled
    const priorTime = prefs.practice_reminder.time
    const next = {
      ...prefs,
      practice_reminder: { enabled: !!enabled, time: time || priorTime },
    }
    const ok = await savePref(next, { needPermission: enabled })
    if (!ok) return false
    if (enabled && !wasEnabled) track(EVENTS.NOTIFICATION_REMINDER_ENABLED, { time: next.practice_reminder.time })
    else if (!enabled && wasEnabled) track(EVENTS.NOTIFICATION_REMINDER_DISABLED, { time: priorTime })
    else if (enabled && time && time !== priorTime) track(EVENTS.NOTIFICATION_REMINDER_TIME_CHANGED, { from: priorTime, to: next.practice_reminder.time })
    return true
  }, [prefs, savePref])

  // Generic per-type toggle (streak_save / wind_down / vikriti_due).
  const setTypeEnabled = useCallback(async (kind, enabled) => {
    if (!(kind in prefs)) return false
    const next = { ...prefs, [kind]: { ...prefs[kind], enabled: !!enabled } }
    const ok = await savePref(next, { needPermission: enabled })
    if (!ok) return false
    track(enabled ? EVENTS.NOTIFICATION_TYPE_ENABLED : EVENTS.NOTIFICATION_TYPE_DISABLED, { kind })
    return true
  }, [prefs, savePref])

  // ── The reconciler ──
  // Called by App.jsx's reconciler component with live practice context.
  // Rebuilds the whole managed schedule from state.
  const syncNotifications = useCallback(async (ctx) => {
    if (!Capacitor.isNativePlatform()) return
    const perm = await LocalNotifications.checkPermissions().catch(() => null)
    if (perm?.display !== 'granted') {
      // No permission — clear any managed schedule, leave prefs intact.
      await cancelManaged()
      return
    }
    const desired = buildDesiredNotifications({ prefs, now: new Date(), ...ctx })
    await cancelManaged()
    if (!desired.length) return
    const notifications = desired.map((d, i) => ({
      id: MANAGED_IDS[i] ?? (MANAGED_ID_BASE + i),
      ...notificationContent(d.kind, d.args),
      channelId: KIND_CHANNEL[d.kind],
      // Status-bar silhouette (white alpha mask, tinted by iconColor). Set here
      // as well as in capacitor.config so the schedule call never falls back to
      // the default exclamation icon. See res/drawable/ic_stat_lotus.xml.
      smallIcon: 'ic_stat_lotus',
      iconColor: '#3f7a52',
      sound: NOTIF_SOUND,
      // INEXACT on purpose. `allowWhileIdle: true` asks for an exact alarm,
      // which needs SCHEDULE_EXACT_ALARM — denied by default since Android 14
      // for our targetSdk (36) unless the user hunts down the "Alarms &
      // reminders" toggle. That made reminders silently never fire for anyone
      // who didn't. A practice nudge doesn't need second-precision (07:00
      // arriving at 07:05 is fine), so we let the system batch it: no special
      // permission, no Play declaration, and no silent-failure path.
      // Don't "fix" this back to true — see docs/TODO.md #23e.
      schedule: { at: d.at },
      extra: { kind: d.kind },
    }))
    try { await LocalNotifications.schedule({ notifications }) }
    catch (err) { console.error('[notifications] schedule failed:', err?.message) }
  }, [prefs])

  return {
    prefs,
    permissionState,
    busy,
    isSupported: Capacitor.isNativePlatform(),
    requestPermission,
    setPracticeReminder,
    setTypeEnabled,
    syncNotifications,
  }
}

// ── Internals ─────────────────────────────────────────────────────────────
function normalizePrefs(raw) {
  const base = raw || {}
  return {
    // Reminder is explicit opt-in (drives the OS permission prompt).
    practice_reminder: {
      enabled: base.practice_reminder?.enabled ?? false,
      time:    base.practice_reminder?.time    ?? DEFAULT_REMINDER_TIME,
    },
    // The conditional nudges default ON — they only ever fire once permission
    // exists (granted when the user enables the reminder or via the prompt),
    // and each self-silences when the user practices. Opt-out in Settings.
    streak_save: { enabled: base.streak_save?.enabled ?? true },
    wind_down:   { enabled: base.wind_down?.enabled   ?? true },
    vikriti_due: { enabled: base.vikriti_due?.enabled ?? true },
  }
}

// Legacy ids from the pre-reconciler build (a repeating reminder at 1001).
// Included in every cancel so upgrades don't leak a stale repeating schedule.
const LEGACY_IDS = [1001, 1002, 1003, 1004]
async function cancelManaged() {
  const ids = [...MANAGED_IDS, ...LEGACY_IDS].map((id) => ({ id }))
  try { await LocalNotifications.cancel({ notifications: ids }) }
  catch (err) { console.debug('[notifications] cancel failed:', err?.message) }
}
