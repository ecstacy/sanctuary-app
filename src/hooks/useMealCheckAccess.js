// Live gating for the Meal Check feature. Composes the entitlement bit
// (useIsPremium) with the profile's trial anchor and the pure computeMealAccess
// rule. Returns { allowed, state, trialDaysLeft, trialEndsAt } — see mealAccess.js.

import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useIsPremium } from './useIsPremium'
import { computeMealAccess } from '../lib/mealAccess'

export function useMealCheckAccess() {
  const { profile } = useAuth()
  const { isPremium, isLoading } = useIsPremium()

  const trialStartedAt = profile?.meal_check_trial_started_at || null

  return useMemo(
    () => computeMealAccess({ isPremium, isLoading, trialStartedAt }),
    [isPremium, isLoading, trialStartedAt],
  )
}
