// ─────────────────────────────────────────────────────────────────────────────
//  notificationPlan.js — the reconciler's brain (pure, testable)
//
//  Local notifications can't check app state when they fire, so we can't
//  "skip today if the user already practiced" at fire time. Instead we
//  compute, from current state, the exact set of one-shot notifications that
//  SHOULD be scheduled over the next few days, and the hook diff-applies it
//  (cancel-all-managed → schedule desired). Re-run whenever state changes
//  (app open, practice completed, prefs/language change) and the window keeps
//  rolling forward.
//
//  buildDesiredNotifications(ctx) → [{ kind, at: Date, args }]  (already
//  arbitrated to one per calendar day and filtered to quiet hours).
// ─────────────────────────────────────────────────────────────────────────────

// How many days ahead we pre-schedule the daily reminder. A user who never
// reopens the app still gets reminders for this many days; each open rolls
// the window forward.
export const REMINDER_WINDOW_DAYS = 4
export const STREAK_MIN = 3               // only nudge a streak worth saving
export const STREAK_SAVE_TIME = '19:30'
export const WIND_DOWN_TIME = '19:00'
// Quiet hours: nothing fires before 07:00 or after 21:30 local.
const QUIET_START_MIN = 7 * 60
const QUIET_END_MIN = 21 * 60 + 30

// One notification per day max. Higher wins a same-day collision.
const PRIORITY = { streak_save: 3, wind_down: 2, practice_reminder: 1, vikriti_due: 1 }

export function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function atClock(baseDate, hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number)
  const d = new Date(baseDate)
  d.setHours(h || 0, m || 0, 0, 0)
  return d
}
function withinQuietHours(d) {
  const mins = d.getHours() * 60 + d.getMinutes()
  return mins >= QUIET_START_MIN && mins <= QUIET_END_MIN
}

/**
 * @param {object} ctx
 * @param {object}   ctx.prefs          normalized prefs (see useNotifications)
 * @param {Set}      ctx.practicedDates Set<'YYYY-MM-DD'> — any session that day
 * @param {number}   ctx.streak         current streak (days)
 * @param {string[]} ctx.doneSlotsToday ['morning'] etc. — completed daily slots today
 * @param {boolean}  ctx.vikritiDue     is a vikriti check-in due
 * @param {Date}     ctx.now
 * @returns {Array<{kind, at, args}>}
 */
export function buildDesiredNotifications({ prefs, practicedDates, streak, doneSlotsToday, vikritiDue, now }) {
  const perDay = {} // 'YYYY-MM-DD' -> { kind, at, args }
  const consider = (kind, at, args) => {
    if (at <= now || !withinQuietHours(at)) return
    const key = ymd(at)
    const cur = perDay[key]
    if (!cur || PRIORITY[kind] > PRIORITY[cur.kind]) perDay[key] = { kind, at, args }
  }

  // Daily reminder — the next N days at the chosen time, skipping any day the
  // user has already practiced (today) or that already has a session logged.
  if (prefs.practice_reminder?.enabled) {
    let added = 0
    // Collect the next REMINDER_WINDOW_DAYS *future* reminders, skipping days
    // already practiced and today's slot if its time has passed. Scan a few
    // extra days so a passed/skipped today still yields a full window.
    for (let d = 0; d < REMINDER_WINDOW_DAYS + 4 && added < REMINDER_WINDOW_DAYS; d++) {
      const day = new Date(now); day.setDate(now.getDate() + d)
      if (practicedDates.has(ymd(day))) continue
      const at = atClock(day, prefs.practice_reminder.time)
      if (at <= now || !withinQuietHours(at)) continue
      consider('practice_reminder', at, {})
      added++
    }
  }

  // Streak save — tonight only, if a streak worth keeping is at risk.
  if (prefs.streak_save?.enabled && streak >= STREAK_MIN && !practicedDates.has(ymd(now))) {
    consider('streak_save', atClock(now, STREAK_SAVE_TIME), { days: streak })
  }

  // Evening wind-down — tonight only, if they did a morning session but not evening.
  if (prefs.wind_down?.enabled && doneSlotsToday.includes('morning') && !doneSlotsToday.includes('evening')) {
    consider('wind_down', atClock(now, WIND_DOWN_TIME), {})
  }

  // Vikriti check-in due — tonight, once.
  if (prefs.vikriti_due?.enabled && vikritiDue) {
    consider('vikriti_due', atClock(now, WIND_DOWN_TIME), {})
  }

  return Object.values(perDay).sort((a, b) => a.at - b.at)
}
