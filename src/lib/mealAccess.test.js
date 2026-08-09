import { describe, it, expect } from 'vitest'
import { computeMealAccess, MEAL_TRIAL_DAYS } from './mealAccess'

const DAY = 86_400_000
const now = Date.parse('2026-08-09T12:00:00Z')

describe('computeMealAccess', () => {
  it('locks nothing while entitlement is loading, but does not claim access', () => {
    const a = computeMealAccess({ isLoading: true, isPremium: false, trialStartedAt: null, now })
    expect(a).toMatchObject({ allowed: false, state: 'loading' })
  })

  it('always allows Plus members', () => {
    const a = computeMealAccess({ isPremium: true, isLoading: false, trialStartedAt: null, now })
    expect(a).toMatchObject({ allowed: true, state: 'premium' })
  })

  it('allows a free user who has never used it (starts the trial)', () => {
    const a = computeMealAccess({ isPremium: false, isLoading: false, trialStartedAt: null, now })
    expect(a).toMatchObject({ allowed: true, state: 'trial_fresh', trialDaysLeft: MEAL_TRIAL_DAYS })
  })

  it('allows a free user inside the 7-day window, counting days down', () => {
    const startedAt = new Date(now - 2 * DAY).toISOString()
    const a = computeMealAccess({ isPremium: false, isLoading: false, trialStartedAt: startedAt, now })
    expect(a.allowed).toBe(true)
    expect(a.state).toBe('trial')
    expect(a.trialDaysLeft).toBe(5)
  })

  it('locks a free user once the window has passed', () => {
    const startedAt = new Date(now - 8 * DAY).toISOString()
    const a = computeMealAccess({ isPremium: false, isLoading: false, trialStartedAt: startedAt, now })
    expect(a).toMatchObject({ allowed: false, state: 'locked', trialDaysLeft: 0 })
  })

  it('treats a garbage trial timestamp as never-started, not locked', () => {
    const a = computeMealAccess({ isPremium: false, isLoading: false, trialStartedAt: 'not-a-date', now })
    expect(a.allowed).toBe(true)
    expect(a.state).toBe('trial_fresh')
  })
})
