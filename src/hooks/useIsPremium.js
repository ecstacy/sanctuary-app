// ─────────────────────────────────────────────────────────────────────────────
//  useIsPremium — single source of truth for Sanctuary Plus entitlement
//
//  Reads the cached `profile` from AuthContext (which already hydrates from
//  localStorage + Supabase). Returns a small object so gating code stays
//  consistent across surfaces:
//
//    const { isPremium, isLoading, source, expiresAt, daysRemaining } = useIsPremium()
//    if (!isPremium) return <PaywallTeaser surface="library_card" />
//
//  DESIGN NOTES
//  ────────────
//  • The hook does NOT make its own Supabase call. AuthContext is the single
//    fetch path for profile data; this keeps cache invalidation simple and
//    avoids N requests-per-surface when ten cards each gate their content.
//
//  • `is_premium` on the profile is the LIVE bit. A nightly Supabase cron
//    flips it to false when `premium_expires_at` passes. Until that runs,
//    we apply a client-side grace check too (expiresAt < now → treat as
//    free) so a user whose subscription lapses at 2am doesn't keep premium
//    until the cron sweeps at 3am.
//
//  • Anonymous users (no profile) are always treated as free. The dosha
//    quiz result page renders for them but with the locked Chapter 3 etc.
//
//  • While the profile is still loading (no cache, first paint), the hook
//    returns `isLoading: true` and `isPremium: false`. Gates should render
//    a quiet skeleton or just the free view; flashing "locked" to a user
//    who is actually premium is the worst UX outcome here.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'

export function useIsPremium() {
  const { profile, loading } = useAuth()

  return useMemo(() => {
    // Loading state — don't lock anything yet, but don't claim premium
    // either. The first paint shows free content (or a skeleton); the
    // moment the profile arrives we re-render with the real answer.
    if (loading && !profile) {
      return {
        isPremium:      false,
        isLoading:      true,
        source:         null,
        expiresAt:      null,
        daysRemaining:  null,
      }
    }

    const flag      = profile?.is_premium === true
    const expiresAt = profile?.premium_expires_at
      ? new Date(profile.premium_expires_at)
      : null
    const startedAt = profile?.premium_started_at
      ? new Date(profile.premium_started_at)
      : null

    // Client-side expiry guard. Server cron is canonical, this just covers
    // the gap between actual expiry and the sweep.
    const stillValid = !expiresAt || expiresAt.getTime() > Date.now()

    const isPremium = flag && stillValid

    const daysRemaining = expiresAt
      ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000))
      : null

    // Dunning state: Stripe couldn't charge the renewal. We don't flip
    // is_premium yet (Stripe is still retrying) but surface the flag so
    // UI can prompt the user to update their payment method.
    const paymentFailedAt = profile?.premium_payment_failed_at
      ? new Date(profile.premium_payment_failed_at)
      : null
    const inDunning = isPremium && !!paymentFailedAt

    // Cancel-at-period-end: user has cancelled but still has paid access.
    // Useful for surfacing "Resubscribe?" UI without making them feel
    // already-locked-out.
    const cancelAtPeriodEnd = profile?.premium_cancel_at_period_end === true

    return {
      isPremium,
      isLoading:           false,
      source:              isPremium ? (profile?.premium_source || null) : null,
      startedAt,            // when Plus first activated — for "Member since" UI
      expiresAt,
      daysRemaining,
      paymentFailedAt,
      inDunning,
      cancelAtPeriodEnd,
    }
  }, [profile, loading])
}
