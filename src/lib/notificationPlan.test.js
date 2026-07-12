import { describe, it, expect } from 'vitest'
import { buildDesiredNotifications, REMINDER_WINDOW_DAYS, STREAK_MIN } from './notificationPlan'

const ALL_ON = {
  practice_reminder: { enabled: true, time: '07:00' },
  streak_save: { enabled: true },
  wind_down: { enabled: true },
  vikriti_due: { enabled: true },
}
// A fixed "now" at 08:00 so 07:00 today has already passed.
const now = () => new Date('2026-07-12T08:00:00')
const base = (over = {}) => ({
  prefs: ALL_ON, practicedDates: new Set(), streak: 0, doneSlotsToday: [], vikritiDue: false, now: now(), ...over,
})
const kinds = (plan) => plan.map(p => p.kind)

describe('reminder window', () => {
  it('schedules the next N days of reminders, none in the past', () => {
    const plan = buildDesiredNotifications(base())
    const reminders = plan.filter(p => p.kind === 'practice_reminder')
    // today's 07:00 already passed → first reminder is tomorrow; N days ahead.
    expect(reminders.length).toBe(REMINDER_WINDOW_DAYS)
    for (const r of reminders) expect(r.at.getTime()).toBeGreaterThan(now().getTime())
  })

  it('skips days the user already practiced', () => {
    const tomorrow = '2026-07-13'
    const plan = buildDesiredNotifications(base({ practicedDates: new Set([tomorrow]) }))
    const days = plan.filter(p => p.kind === 'practice_reminder').map(p => p.at.toISOString().slice(0, 10))
    expect(days).not.toContain(tomorrow)
  })

  it('emits nothing for the reminder when disabled', () => {
    const plan = buildDesiredNotifications(base({ prefs: { ...ALL_ON, practice_reminder: { enabled: false, time: '07:00' } } }))
    expect(kinds(plan)).not.toContain('practice_reminder')
  })
})

describe('streak save', () => {
  it('fires tonight when streak >= min and not practiced today', () => {
    const plan = buildDesiredNotifications(base({ streak: STREAK_MIN }))
    expect(kinds(plan)).toContain('streak_save')
  })
  it('does not fire below the streak threshold', () => {
    const plan = buildDesiredNotifications(base({ streak: STREAK_MIN - 1 }))
    expect(kinds(plan)).not.toContain('streak_save')
  })
  it('does not fire once practiced today', () => {
    const plan = buildDesiredNotifications(base({ streak: 10, practicedDates: new Set(['2026-07-12']) }))
    expect(kinds(plan)).not.toContain('streak_save')
  })
})

describe('wind down', () => {
  it('fires when a morning session is done but not evening', () => {
    const plan = buildDesiredNotifications(base({ doneSlotsToday: ['morning'] }))
    expect(kinds(plan)).toContain('wind_down')
  })
  it('does not fire if evening already done', () => {
    const plan = buildDesiredNotifications(base({ doneSlotsToday: ['morning', 'evening'] }))
    expect(kinds(plan)).not.toContain('wind_down')
  })
})

describe('arbitration — one per day, priority streak_save > wind_down > reminder', () => {
  it('streak_save wins tonight over a same-day reminder', () => {
    // Reminder at 20:00 today (still ahead of 08:00 now), streak save at 19:30.
    const plan = buildDesiredNotifications(base({
      prefs: { ...ALL_ON, practice_reminder: { enabled: true, time: '20:00' } },
      streak: 5,
    }))
    const today = plan.filter(p => p.at.toISOString().slice(0, 10) === '2026-07-12')
    expect(today).toHaveLength(1)
    expect(today[0].kind).toBe('streak_save')
  })

  it('wind_down beats a reminder on the same evening', () => {
    const plan = buildDesiredNotifications(base({
      prefs: { ...ALL_ON, practice_reminder: { enabled: true, time: '20:00' } },
      doneSlotsToday: ['morning'],
    }))
    const today = plan.filter(p => p.at.toISOString().slice(0, 10) === '2026-07-12')
    expect(today).toHaveLength(1)
    expect(today[0].kind).toBe('wind_down')
  })
})

describe('quiet hours', () => {
  it('drops a reminder set outside 07:00–21:30', () => {
    const plan = buildDesiredNotifications(base({ prefs: { ...ALL_ON, practice_reminder: { enabled: true, time: '23:00' } } }))
    expect(kinds(plan)).not.toContain('practice_reminder')
  })
})

describe('vikriti due', () => {
  it('fires once when due', () => {
    const plan = buildDesiredNotifications(base({ vikritiDue: true, doneSlotsToday: [] }))
    expect(kinds(plan)).toContain('vikriti_due')
  })
})
