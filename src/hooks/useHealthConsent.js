// ─────────────────────────────────────────────────────────────────────────────
//  useHealthConsent — React binding for the health-data consent module
//
//  Subscribes to the healthConsent store so components re-render when the
//  decision changes, and exposes a `grant()` that does the full job:
//    1. records consent locally (works for anonymous quiz-takers)
//    2. if signed in, writes the durable record to profiles.health_data_consent
//    3. fires the analytics event
//
//  Anonymous grants live in localStorage and get migrated to the profile on
//  signup by AuthContext (same pattern as the pending-dosha migration).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react'
import {
  getHealthConsent,
  hasHealthConsent,
  grantHealthConsent,
  revokeHealthConsent,
  subscribe,
  CONSENT_VERSION,
} from '../lib/healthConsent'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { track, EVENTS } from '../lib/track'

export function useHealthConsent() {
  const { user } = useAuth()
  const [state, setState] = useState(getHealthConsent())

  useEffect(() => subscribe(setState), [])

  const grant = useCallback(async ({ surface } = {}) => {
    const next = grantHealthConsent()  // localStorage + in-memory, synchronous

    track(EVENTS.HEALTH_CONSENT_GRANTED, {
      surface:  surface || 'dosha_quiz',
      version:  CONSENT_VERSION,
      anonymous: !user,
    })

    // Durable server record for signed-in users (GDPR: must be able to
    // demonstrate consent). Anonymous users' grant rides in localStorage
    // and migrates on signup.
    if (user?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({ health_data_consent: next })
        .eq('id', user.id)
      if (error) console.error('[healthConsent] profile write failed:', error.message)
    }

    return next
  }, [user])

  // Withdrawal — GDPR requires this be as easy as giving consent. Stops the
  // basis for further processing; does NOT delete already-collected data
  // (that's the separate account-deletion / export path). Mirrors grant():
  // localStorage + profile + analytics.
  const revoke = useCallback(async () => {
    const next = revokeHealthConsent()

    track(EVENTS.HEALTH_CONSENT_REVOKED, { anonymous: !user })

    if (user?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({ health_data_consent: next })
        .eq('id', user.id)
      if (error) console.error('[healthConsent] revoke write failed:', error.message)
    }
    return next
  }, [user])

  return {
    consent:    state,
    hasConsent: hasHealthConsent(),
    grant,
    revoke,
  }
}
