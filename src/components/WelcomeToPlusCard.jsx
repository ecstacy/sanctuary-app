// ─────────────────────────────────────────────────────────────────────────────
//  WelcomeToPlusCard — the moment-of-joining experience
//
//  Shown ONCE per user, on home, the first session after isPremium flips
//  to true. Replaces the previous "the locks just vanish silently"
//  experience with an actual celebratory acknowledgement of what just
//  happened.
//
//  WHY HOME, NOT A FULL-SCREEN TAKEOVER
//  ─────────────────────────────────────
//  A modal blocking the entire screen the next time you open the app
//  would feel intrusive — the user wants to USE the thing they just
//  unlocked, not click through a tour. An inline card at the top of
//  home lets them dismiss with one tap, or skim past to the rest of
//  their day. Same payoff (acknowledgement + suggested next step)
//  without holding them hostage.
//
//  PERSISTENCE
//  ───────────
//  localStorage flag keyed by user id. Per-device — if they sign in on
//  a second device they'll see the welcome again, which is actually the
//  desired UX (each device is a fresh introduction to the unlocked
//  experience). If we ever want strict cross-device once-only, switch
//  to a `welcomed_at` column on profiles.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useIsPremium } from '../hooks/useIsPremium'
import { track, EVENTS } from '../lib/track'
import Confetti from './Confetti'

const STORAGE_KEY = (userId) => `sanctuary.welcomedToPlus.${userId}`

// Three CTAs the user can tap from the welcome — each maps to one of the
// surfaces that newly unlocked. Order = priority. We deep-link with a
// hash anchor where helpful so they land in the right spot.
const CTAS = [
  {
    id:       'explore_library',
    labelKey: 'welcomePlus.ctas.exploreLabel',
    subKey:   'welcomePlus.ctas.exploreSub',
    icon:     'library_books',
    route:    '/discover',
  },
  {
    id:       'open_dosha',
    labelKey: 'welcomePlus.ctas.doshaLabel',
    subKey:   'welcomePlus.ctas.doshaSub',
    icon:     'auto_awesome',
    route:    '/dosha',
  },
  {
    id:       'set_reminder',
    labelKey: 'welcomePlus.ctas.reminderLabel',
    subKey:   'welcomePlus.ctas.reminderSub',
    icon:     'notifications',
    route:    '/profile',  // Notifications section lives here
  },
]

export default function WelcomeToPlusCard() {
  const navigate                          = useNavigate()
  const { t }                             = useTranslation()
  const { user }                          = useAuth()
  const { isPremium }                     = useIsPremium()
  const [searchParams, setSearchParams]   = useSearchParams()
  const [show, setShow]                   = useState(false)
  const impressionRef                     = useRef(false)
  const decidedRef                        = useRef(false)

  // Stripe success-redirects can target `/home?welcome=1` so the welcome
  // shows even if the user opens the app from a fresh device (or the
  // localStorage flag is stale for any reason). The query param is the
  // belt-and-suspenders trigger; once handled we strip it from the URL
  // so a refresh doesn't repeat the welcome on every reload.
  const welcomeForced = searchParams.get('welcome') === '1'

  // ── Eligibility ─────────────────────────────────────────────────────────
  // Decide show/hide ONCE per mount, keyed on auth + premium only. We
  // deliberately don't depend on searchParams: stripping `?welcome=1`
  // below mutates it, and re-running this effect would re-read the
  // (now-written) seen flag and hide a card we just chose to show. The
  // `decidedRef` guard makes the decision sticky for the session.
  useEffect(() => {
    if (!user?.id || !isPremium) {
      setShow(false)
      decidedRef.current = false   // re-evaluate if they later become Plus
      return
    }
    if (decidedRef.current) return
    decidedRef.current = true

    if (welcomeForced) {
      setShow(true)
      // Strip the param so a reload doesn't re-trigger the welcome.
      const next = new URLSearchParams(searchParams)
      next.delete('welcome')
      setSearchParams(next, { replace: true })
      return
    }
    try {
      setShow(!localStorage.getItem(STORAGE_KEY(user.id)))
    } catch {
      setShow(false)   // storage unavailable — fail closed (don't spam)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isPremium])

  // Fire SHOWN once per (mount, eligible) pair so impressions match
  // unique-user-day, not re-render count. The `triggered_by` prop lets
  // us split the funnel by entry path — Stripe-redirect welcomes
  // (?welcome=1) typically convert higher because the user just
  // finished a payment flow vs. seeing it the next time they open the app.
  useEffect(() => {
    if (!show || impressionRef.current) return
    impressionRef.current = true
    track(EVENTS.WELCOME_TO_PLUS_SHOWN, {
      triggered_by: welcomeForced ? 'stripe_redirect' : 'first_open',
    })
    // Mark seen the instant it shows — NOT only on dismiss. Otherwise a
    // user who never taps dismiss/CTA (just scrolls past or closes the
    // app) never sets the flag, and the card + confetti replay on every
    // launch. One display = welcomed for good.
    markSeen()
  }, [show, welcomeForced])

  // Persist the once-per-device flag. Separate from hiding so we can mark
  // seen on first show while the card stays visible for the session.
  function markSeen() {
    if (!user?.id) return
    try {
      localStorage.setItem(STORAGE_KEY(user.id), new Date().toISOString())
    } catch { /* non-fatal */ }
  }

  function persistDismissed() {
    markSeen()
    setShow(false)
  }

  function handleDismiss() {
    track(EVENTS.WELCOME_TO_PLUS_DISMISSED, {})
    persistDismissed()
  }

  function handleCta(cta) {
    track(EVENTS.WELCOME_TO_PLUS_CTA_TAPPED, { cta_id: cta.id })
    persistDismissed()  // user took action → consider welcomed
    navigate(cta.route)
  }

  if (!show) return null

  return (
    <>
      {/* One-shot confetti — mounts alongside the welcome card the first
          time a user lands in Plus, self-unmounts after ~3s. Reduced-
          motion users see no animation at all (Confetti returns null
          when matchMedia signals 'reduce'). */}
      <Confetti durationMs={3000} />

      <section
        className="relative rounded-2xl p-6 mb-5 stagger-1 overflow-hidden"
        role="region"
        aria-labelledby="welcome-to-plus-headline"
      >
      {/* Premium gradient backdrop — gold-warmth to communicate "this is
          the special tier" without crossing into kitsch. Layered with a
          subtle pulse ring behind the icon. */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary-container to-primary-fixed"
        aria-hidden="true"
      />
      <div
        className="absolute top-4 right-4 w-28 h-28 rounded-full bg-white/8 animate-quiz-float pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative">
        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          aria-label={t('welcomePlus.dismiss')}
          className="absolute -top-1 -right-1 w-11 h-11 rounded-full flex items-center justify-center active:scale-95"
        >
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-on-surface-variant/60 text-base"
          >
            close
          </span>
        </button>

        {/* Premium icon — filled variant for visual weight */}
        <div className="w-14 h-14 rounded-full bg-surface/50 backdrop-blur-sm flex items-center justify-center mb-4">
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            workspace_premium
          </span>
        </div>

        <p className="font-label text-[11px] font-semibold uppercase tracking-[0.22em] text-primary mb-2">
          {t('welcomePlus.kicker')}
        </p>
        <h2
          id="welcome-to-plus-headline"
          className="font-headline text-2xl text-on-surface leading-tight mb-2 pr-8"
        >
          {t('welcomePlus.title')}
        </h2>
        <p className="font-body text-sm text-on-surface-variant/85 leading-relaxed mb-5 pr-2">
          {t('welcomePlus.body')}
        </p>

        {/* Three CTAs — pick one or all. Each is a tap-to-explore. */}
        <ul className="space-y-2">
          {CTAS.map((cta) => (
            <li key={cta.id}>
              <button
                onClick={() => handleCta(cta)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface/70 backdrop-blur-sm active:scale-[0.98] transition-all text-left"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-primary text-base"
                  >
                    {cta.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-sm text-on-surface leading-tight">{t(cta.labelKey)}</p>
                  <p className="font-label text-[11px] text-on-surface-variant/70 mt-0.5 leading-snug">{t(cta.subKey)}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-on-surface-variant/40 text-sm flex-shrink-0"
                >
                  chevron_right
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      </section>
    </>
  )
}
