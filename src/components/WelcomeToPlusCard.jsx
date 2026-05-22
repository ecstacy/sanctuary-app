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
    label:    'Explore the full library',
    sub:      '60+ asanas, advanced pranayama',
    icon:     'library_books',
    route:    '/discover',
  },
  {
    id:       'open_dosha',
    label:    'Read Chapter 3 of your dosha',
    sub:      'Live by your nature — season, hour, plate',
    icon:     'auto_awesome',
    route:    '/dosha',
  },
  {
    id:       'set_reminder',
    label:    'Set a daily practice reminder',
    sub:      'A gentle nudge at your chosen time',
    icon:     'notifications',
    route:    '/profile',  // Notifications section lives here
  },
]

export default function WelcomeToPlusCard() {
  const navigate                          = useNavigate()
  const { user }                          = useAuth()
  const { isPremium }                     = useIsPremium()
  const [searchParams, setSearchParams]   = useSearchParams()
  const [show, setShow]                   = useState(false)
  const impressionRef                     = useRef(false)

  // Stripe success-redirects can target `/home?welcome=1` so the welcome
  // shows even if the user opens the app from a fresh device (or the
  // localStorage flag is stale for any reason). The query param is the
  // belt-and-suspenders trigger; once handled we strip it from the URL
  // so a refresh doesn't repeat the welcome on every reload.
  const welcomeForced = searchParams.get('welcome') === '1'

  // ── Eligibility ─────────────────────────────────────────────────────────
  // Show iff: signed in + Plus active + (forced by query param OR we
  // haven't shown this device yet). The localStorage read is synchronous
  // so we don't get a flash of the card before the dismiss-state catches up.
  useEffect(() => {
    if (!user?.id || !isPremium) {
      setShow(false)
      return
    }
    if (welcomeForced) {
      setShow(true)
      // Strip the param immediately so a reload doesn't keep re-triggering
      // the welcome — once it's shown, it should follow normal dismiss
      // rules (localStorage flag set on close).
      const next = new URLSearchParams(searchParams)
      next.delete('welcome')
      setSearchParams(next, { replace: true })
      return
    }
    try {
      const seen = localStorage.getItem(STORAGE_KEY(user.id))
      setShow(!seen)
    } catch {
      // Storage unavailable (Safari private mode etc.) — don't show, but
      // also don't crash. Better than spamming the user with the welcome
      // on every page load.
      setShow(false)
    }
  }, [user?.id, isPremium, welcomeForced, searchParams, setSearchParams])

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
  }, [show, welcomeForced])

  function persistDismissed() {
    if (!user?.id) return
    try {
      localStorage.setItem(STORAGE_KEY(user.id), new Date().toISOString())
    } catch { /* non-fatal */ }
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
          aria-label="Dismiss welcome"
          className="absolute top-0 right-0 w-7 h-7 rounded-full flex items-center justify-center active:scale-95"
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

        <p className="font-label text-[10px] font-semibold uppercase tracking-[0.22em] text-primary mb-2">
          You&apos;re in
        </p>
        <h2
          id="welcome-to-plus-headline"
          className="font-headline text-2xl text-on-surface leading-tight mb-2 pr-8"
        >
          Welcome to Sanctuary Plus
        </h2>
        <p className="font-body text-sm text-on-surface-variant/85 leading-relaxed mb-5 pr-2">
          The full library, your personalized protocols, and the wisdom of Charaka — all yours now.
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
                  <p className="font-body font-semibold text-sm text-on-surface leading-tight">{cta.label}</p>
                  <p className="font-label text-[11px] text-on-surface-variant/70 mt-0.5 leading-snug">{cta.sub}</p>
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
