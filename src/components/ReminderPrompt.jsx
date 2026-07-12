import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import usePracticeStats from '../hooks/usePracticeStats'
import { useNotifications } from '../hooks/useNotifications'
import { track, EVENTS } from '../lib/track'

// One-time contextual nudge to turn on the daily reminder. Shown on Home once
// the user has completed 2 daily sessions (a proven high-intent moment for
// notification opt-in) — never on first launch, never if they already enabled
// it, already dismissed it, or the OS denied permission. Dismissal is sticky
// via localStorage (mirrors the WelcomeToPlus pattern).
const DISMISS_KEY = 'sanctuary.reminderPromptDismissed'
const REMINDER_TIME = '07:00'

export default function ReminderPrompt() {
  const { t } = useTranslation()
  const stats = usePracticeStats()
  const { prefs, permissionState, isSupported, setPracticeReminder, busy } = useNotifications()
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
  })
  const shownRef = useRef(false)

  const dailyCount = useMemo(
    () => (stats.sessions || []).filter(s => s?.routine_key === 'daily').length,
    [stats.sessions],
  )

  const eligible =
    isSupported &&
    !dismissed &&
    dailyCount >= 2 &&
    !prefs.practice_reminder.enabled &&
    permissionState !== 'denied'

  useEffect(() => {
    if (eligible && !shownRef.current) {
      shownRef.current = true
      track(EVENTS.NOTIFICATION_PROMPT_SHOWN, { daily_count: dailyCount })
    }
  }, [eligible, dailyCount])

  if (!eligible) return null

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
    track(EVENTS.NOTIFICATION_PROMPT_DISMISSED, {})
    setDismissed(true)
  }
  const accept = async () => {
    track(EVENTS.NOTIFICATION_PROMPT_ACCEPTED, {})
    const ok = await setPracticeReminder({ enabled: true, time: REMINDER_TIME })
    // Either way, don't ask again — granted enables it; denied is captured by
    // permissionState so `eligible` goes false regardless.
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
    setDismissed(true)
    if (!ok) { /* permission denied — silently done */ }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 stagger-2 bg-primary-container/40 border border-primary-container">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="material-symbols-outlined text-primary text-xl mt-0.5">notifications_active</span>
        <div className="flex-1 min-w-0">
          <p className="font-headline text-lg text-on-surface leading-tight mb-1">{t('reminderPrompt.title')}</p>
          <p className="font-body text-sm text-on-surface-variant/90 leading-relaxed mb-4">{t('reminderPrompt.body')}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={accept}
              disabled={busy}
              className="px-4 py-2 bg-primary rounded-full font-label text-xs uppercase tracking-wider text-on-primary font-semibold disabled:opacity-50 active:scale-95 transition-all"
            >
              {t('reminderPrompt.enable')}
            </button>
            <button
              onClick={dismiss}
              disabled={busy}
              className="px-4 py-2 font-label text-xs uppercase tracking-wider text-on-surface-variant/70 disabled:opacity-50 active:scale-95 transition-all"
            >
              {t('reminderPrompt.notNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
