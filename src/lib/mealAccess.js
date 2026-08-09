// Gating for the Meal Check feature: Plus-only, with a one-time 7-day FULL
// trial for free users, anchored to their first use (profiles
// .meal_check_trial_started_at — set once, survives history deletion). Pure so
// it can be unit-tested; the hook (useMealCheckAccess) just feeds it live state.

export const MEAL_TRIAL_DAYS = 7
const DAY_MS = 86_400_000

/**
 * @param {object} p
 * @param {boolean} p.isPremium
 * @param {boolean} p.isLoading      entitlement still resolving
 * @param {string|Date|null} p.trialStartedAt  null = never used it
 * @param {number} [p.now]
 * @returns {{ allowed:boolean, state:'loading'|'premium'|'trial_fresh'|'trial'|'locked',
 *            trialDaysLeft:number|null, trialEndsAt:Date|null }}
 */
export function computeMealAccess({ isPremium, isLoading, trialStartedAt, now = Date.now() }) {
  if (isLoading) return { allowed: false, state: 'loading', trialDaysLeft: null, trialEndsAt: null }
  if (isPremium) return { allowed: true, state: 'premium', trialDaysLeft: null, trialEndsAt: null }

  const start = trialStartedAt ? new Date(trialStartedAt).getTime() : null
  if (!start || Number.isNaN(start)) {
    // Never used — the first check is free and starts the trial clock.
    return { allowed: true, state: 'trial_fresh', trialDaysLeft: MEAL_TRIAL_DAYS, trialEndsAt: null }
  }

  const endsAt = start + MEAL_TRIAL_DAYS * DAY_MS
  if (now < endsAt) {
    return {
      allowed: true,
      state: 'trial',
      trialDaysLeft: Math.max(0, Math.ceil((endsAt - now) / DAY_MS)),
      trialEndsAt: new Date(endsAt),
    }
  }
  return { allowed: false, state: 'locked', trialDaysLeft: 0, trialEndsAt: new Date(endsAt) }
}
