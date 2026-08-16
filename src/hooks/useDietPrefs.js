// ─────────────────────────────────────────────────────────────────────────────
//  useDietPrefs — the user's allergens and dietary patterns
//
//  Owns the single read/write path for `profiles.diet_prefs` (migration 017),
//  so no surface re-implements the shape and no surface can skip the rules
//  below. Mirrors useNotifications' prefs handling.
//
//  THREE THINGS THIS HOOK IS RESPONSIBLE FOR
//  ─────────────────────────────────────────
//  1. CONSENT. Allergies are GDPR Art. 9 data. Nothing is written without
//     current health-data consent (v2+, whose text actually mentions dietary
//     restrictions). `save` refuses rather than writing and asking later.
//
//  2. OPTIMISTIC LOCAL STATE. The filter must reflect what the user just told
//     us even if the network write is still in flight or has failed. A user
//     who ticks "peanuts" and immediately searches must not be shown peanuts
//     because a round-trip was slow. Local state leads; the server catches up.
//
//  3. NORMALISATION AND VALIDATION. Only canonical keys are stored. An unknown
//     key would round-trip through the database and then silently match no
//     rule — the exact fail-open shape dietSafety.js exists to prevent.
//
//  ⚠ NEVER pass these values to analytics. Counts only. See §5.14 of
//  docs/analytics-events.md and the header of migration 017.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useHealthConsent } from './useHealthConsent'
import { normalizeDietPrefs } from '../lib/dietPrefs'
import { track, EVENTS } from '../lib/track'

export function useDietPrefs() {
  const { user, profile, refreshProfile } = useAuth()
  const { hasConsent } = useHealthConsent()

  const serverPrefs = useMemo(
    () => normalizeDietPrefs(profile?.diet_prefs),
    [profile?.diet_prefs],
  )

  // Local copy leads. Seeded from the server value and re-seeded whenever the
  // profile changes (login, another device), but a pending local edit is what
  // the filter reads until the write lands.
  const [prefs, setPrefs] = useState(serverPrefs)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { setPrefs(serverPrefs) }, [serverPrefs])

  /**
   * Persist a new set of preferences.
   * @param {{allergens?: string[], patterns?: string[]}} next
   * @param {{surface?: string}} [meta]
   */
  const save = useCallback(async (next, meta = {}) => {
    const clean = normalizeDietPrefs(next)

    // Consent gates the WRITE, not the UI: the picker can be explored, but
    // nothing about a person's health leaves the device without it.
    if (!hasConsent) {
      setError('health_consent_required')
      return { ok: false, reason: 'health_consent_required' }
    }

    setPrefs(clean)          // optimistic — the filter uses this immediately
    setError(null)

    // Counts only. The keys themselves are health data and must never be sent.
    track(EVENTS.DIET_PREFS_SET, {
      allergen_count: clean.allergens.length,
      pattern_count:  clean.patterns.length,
      surface:        meta.surface || 'diet_prefs',
    })

    if (!user) return { ok: true, persisted: false }   // anonymous: local only

    setSaving(true)
    const { error: err } = await supabase
      .from('profiles')
      .update({ diet_prefs: { ...clean, updated_at: new Date().toISOString() } })
      .eq('id', user.id)
    setSaving(false)

    if (err) {
      // Deliberately does NOT roll back the local value. The user told us
      // about an allergy; forgetting it because a network call failed is the
      // worse outcome. The UI surfaces the sync failure instead.
      setError(err.message)
      return { ok: false, reason: 'network', message: err.message }
    }
    // Refresh the shared profile so AuthContext.diet_prefs matches what we just
    // wrote. Without this the write lands in the DB but the in-memory profile
    // stays stale, and the next time this page mounts it re-seeds local state
    // from the stale value — silently dropping the just-saved preference.
    await refreshProfile?.()
    return { ok: true, persisted: true }
  }, [user, hasConsent, refreshProfile])

  const toggle = useCallback((kind, key) => {
    const list = prefs[kind] || []
    const next = list.includes(key) ? list.filter((k) => k !== key) : [...list, key]
    return save({ ...prefs, [kind]: next })
  }, [prefs, save])

  return {
    prefs,
    /** True once the user has actually made a choice — distinct from "no restrictions". */
    hasAnswered: (profile?.diet_prefs?.updated_at ?? null) !== null,
    saving,
    error,
    save,
    toggle,
    needsConsent: !hasConsent,
  }
}
