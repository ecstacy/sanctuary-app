// ─────────────────────────────────────────────────────────────────────────────
//  PaywallSheet — the upgrade surface
//
//  A bottom sheet (full-height on mobile) that explains Sanctuary Plus and
//  collects the upgrade intent. Two paths:
//
//    1. Pick a plan → Stripe Checkout (web URL, opens in system browser on
//       native to satisfy Apple/Google policies on external purchase).
//    2. Have a code → redeem promo via Supabase RPC. Promo path bypasses
//       payment entirely (full grants, internal/marketing flow).
//
//  WHY A SHARED SHEET, NOT PER-SURFACE SCREENS
//  ───────────────────────────────────────────
//  Every lock in the app (library card 🔒, dosha chapter 3, post-practice
//  prompt, settings) routes through this one component. The `surface` prop
//  tags every analytics event so we can see which placement converts best
//  in PostHog without instrumenting separately at each site.
//
//  ENVIRONMENT
//  ───────────
//  VITE_STRIPE_CHECKOUT_MONTHLY — URL of pre-built Stripe Checkout session
//  VITE_STRIPE_CHECKOUT_ANNUAL  — same for annual plan
//  Both unset → "Coming soon" stub shown on tap; promo path still works.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { registerPlugin } from '@capacitor/core'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { track, EVENTS } from '../lib/track'

const ExternalBrowser = registerPlugin('ExternalBrowser', {
  web: { async open({ url }) { window.open(url, '_blank') } }
})

// Pricing display data. Source of truth is Stripe; these are presentation
// strings only so the sheet renders without hitting Stripe on open.
const PLANS = [
  {
    id:        'annual',
    label:     'Annual',
    price:     '€59',
    cadence:   '/ year',
    savings:   'Save 45%',
    sub:       'About €4.92 / month, billed yearly',
    envKey:    'VITE_STRIPE_CHECKOUT_ANNUAL',
    highlight: true,
  },
  {
    id:        'monthly',
    label:     'Monthly',
    price:     '€8.99',
    cadence:   '/ month',
    sub:       'Cancel anytime',
    envKey:    'VITE_STRIPE_CHECKOUT_MONTHLY',
  },
]

const BENEFITS = [
  { icon: 'library_books',  text: 'The full asana & pranayama library' },
  { icon: 'self_improvement', text: 'Your personalized routine, tuned to dosha + season' },
  { icon: 'menu_book',      text: 'Charaka deep-dives + Chapter 3: Live by your dosha' },
  { icon: 'restaurant_menu',text: 'Full 6-taste dietary protocol & all 13 Dinacharya practices' },
  { icon: 'graphic_eq',     text: 'Multiple HD voices + offline downloads' },
]

export default function PaywallSheet({ open, onClose, surface, headline, subhead }) {
  const { user } = useAuth()

  // Two-pane sheet: 'plans' (default) and 'promo' (when user taps "Have a code").
  const [pane, setPane]               = useState('plans')
  const [promoCode, setPromoCode]     = useState('')
  const [promoBusy, setPromoBusy]     = useState(false)
  const [promoError, setPromoError]   = useState(null)
  const [promoSuccess, setPromoSuccess] = useState(null)

  const shownRef = useRef(false)

  // Fire PAYWALL_SHOWN once per open. Reset on close so the next open
  // counts as a new impression.
  useEffect(() => {
    if (open && !shownRef.current) {
      shownRef.current = true
      track(EVENTS.PAYWALL_SHOWN, { surface, anonymous: !user })
    }
    if (!open) {
      shownRef.current = false
      // Reset pane state on close so the next open starts clean.
      setPane('plans')
      setPromoCode('')
      setPromoError(null)
      setPromoSuccess(null)
    }
  }, [open, surface, user])

  if (!open) return null

  // ── Handlers ────────────────────────────────────────────────────────────
  function handleDismiss() {
    track(EVENTS.PAYWALL_DISMISSED, { surface, pane })
    onClose?.()
  }

  async function handlePlan(plan) {
    track(EVENTS.PAYWALL_PLAN_SELECTED, { surface, plan: plan.id })

    const baseUrl = import.meta.env[plan.envKey]
    if (!baseUrl) {
      // Stripe not wired yet — show the stub.
      alert('Sanctuary Plus is launching soon. We\'ll send you an invite — meanwhile, internal codes work via "Have a code?".')
      return
    }

    // ── Attach user attribution to the Payment Link ─────────────────
    // Stripe Payment Links accept ?client_reference_id=… and
    // ?prefilled_email=… query params. The webhook reads
    // client_reference_id off the resulting Checkout Session to map the
    // purchase back to a Sanctuary profile. Without this, an anonymous
    // checkout would land with no user_id and the entitlement wouldn't
    // unlock.
    //
    // Anonymous users CAN'T buy directly — we send them to signup first
    // (the paywall already nudges this in the empty-state for anon users
    // via the promo pane). For signed-in users we hit the
    // get_checkout_attribution RPC, which returns their id + email from
    // a security-definer function so we don't trust client-set values.
    if (!user) {
      alert('Please sign in or create an account to subscribe.')
      return
    }

    let attribution = { client_reference_id: user.id, prefilled_email: user.email }
    try {
      const { data } = await supabase.rpc('get_checkout_attribution')
      if (data?.ok) {
        attribution = {
          client_reference_id: data.client_reference_id,
          prefilled_email:     data.prefilled_email,
        }
      }
    } catch {
      // Fall through with the optimistic values from session.user — the
      // webhook will still resolve correctly as long as client_reference_id
      // matches a real profile id.
    }

    const url = appendQuery(baseUrl, {
      client_reference_id: attribution.client_reference_id,
      prefilled_email:     attribution.prefilled_email,
    })

    track(EVENTS.PAYWALL_CHECKOUT_STARTED, { surface, plan: plan.id })

    // On native, route through the system browser so the user can complete
    // Stripe checkout outside the WebView (faster, more trusted).
    if (Capacitor.isNativePlatform()) {
      await ExternalBrowser.open({ url })
    } else {
      window.location.href = url
    }
  }

  async function handlePromoSubmit(e) {
    e?.preventDefault?.()
    setPromoError(null)
    setPromoSuccess(null)

    const code = promoCode.trim()
    if (!code) {
      setPromoError('Enter your code to continue.')
      return
    }
    if (!user) {
      setPromoError('Please sign in or create an account first.')
      return
    }

    setPromoBusy(true)
    track(EVENTS.PROMO_CODE_SUBMITTED, { surface, code_length: code.length })

    try {
      const { data, error } = await supabase.rpc('redeem_promo_code', { input_code: code })
      if (error) {
        setPromoError('Something went wrong. Please try again.')
        track(EVENTS.PROMO_CODE_FAILED, { surface, reason: 'rpc_error', message: error.message })
        return
      }
      if (!data?.ok) {
        const friendly = ERROR_MESSAGES[data?.error] || 'That code couldn\'t be redeemed.'
        setPromoError(friendly)
        track(EVENTS.PROMO_CODE_FAILED, { surface, reason: data?.error || 'unknown' })
        return
      }
      // Success — show confirmation, refresh the profile so is_premium
      // flips immediately everywhere in the app.
      setPromoSuccess({
        grantedUntil: data.granted_until,
        code:         data.code,
      })
      track(EVENTS.PROMO_CODE_REDEEMED, {
        surface,
        code:          data.code,
        granted_until: data.granted_until,
      })
      // Force a profile re-fetch by calling getSession → AuthContext
      // doesn't expose refreshProfile via context for the sheet directly,
      // so we hit Supabase from here. The fetchProfile in AuthContext
      // also re-runs when the SIGNED_IN event fires on token refresh,
      // but here we just do a silent select and write the cache too.
      await refreshProfileCache(user.id)
    } finally {
      setPromoBusy(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  // z-index above BottomNav (which is z=50). The BottomNav otherwise paints
  // over the modal's Apply/Continue CTAs on phones where the modal is
  // tall, since the nav is rendered later in the tree and the two share
  // a z-index. Bumping to 60 keeps the modal CTA always reachable.
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface rounded-t-3xl shadow-2xl max-h-[92dvh] overflow-y-auto animate-quiz-slide-up"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1.5 rounded-full bg-on-surface-variant/20" aria-hidden="true" />
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container flex items-center justify-center active:scale-95 transition-all"
          aria-label="Close"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">close</span>
        </button>

        {pane === 'plans' && (
          <div
            className="px-6 pb-8"
            // Honor the home indicator inset on iPhone — otherwise the
            // "Have a code?" link at the bottom of this pane lands under
            // the home-bar swipe area on tall iPhones.
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
          >
            {/* Hero */}
            <div className="text-center mt-2 mb-8">
              <p className="font-label text-[10px] font-semibold text-primary uppercase tracking-[0.22em] mb-3">
                Sanctuary Plus
              </p>
              <h2 id="paywall-title" className="font-headline text-3xl text-on-surface leading-tight mb-3">
                {headline || 'A practice that knows you'}
              </h2>
              <p className="font-body text-sm text-on-surface-variant/80 leading-relaxed max-w-xs mx-auto">
                {subhead || 'Unlock the full library, your personalized protocol, and the wisdom of Charaka.'}
              </p>
            </div>

            {/* Benefits */}
            <ul className="mb-7 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b.icon} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-primary text-base mt-0.5 flex-shrink-0"
                  >{b.icon}</span>
                  <span className="font-body text-sm text-on-surface leading-snug">{b.text}</span>
                </li>
              ))}
            </ul>

            {/* Plans */}
            <div className="space-y-3 mb-5">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handlePlan(plan)}
                  className={`w-full rounded-2xl p-4 text-left relative active:scale-[0.98] transition-all ${
                    plan.highlight
                      ? 'bg-primary-container border-2 border-primary'
                      : 'bg-surface-container border-2 border-transparent'
                  }`}
                  aria-label={`Choose ${plan.label} plan`}
                >
                  {plan.savings && (
                    <span className="absolute -top-2 right-4 bg-primary text-on-primary font-label text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {plan.savings}
                    </span>
                  )}
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-body font-semibold text-base text-on-surface">{plan.label}</span>
                    <span className="font-headline text-2xl text-on-surface tabular-nums">
                      {plan.price}
                      <span className="font-body text-xs text-on-surface-variant ml-0.5">{plan.cadence}</span>
                    </span>
                  </div>
                  <p className="font-body text-xs text-on-surface-variant/70 leading-snug">{plan.sub}</p>
                </button>
              ))}
            </div>

            <p className="font-body text-[10px] text-on-surface-variant/50 text-center leading-relaxed mb-5">
              Renews automatically. Cancel anytime in your account settings.
            </p>

            {/* Promo code entry */}
            <button
              onClick={() => {
                track(EVENTS.PROMO_CODE_OPENED, { surface })
                setPane('promo')
              }}
              className="w-full py-3 text-center font-label text-xs text-on-surface-variant/70 uppercase tracking-widest active:scale-95 transition-all"
            >
              Have a code?
            </button>
          </div>
        )}

        {/* Success pane — full takeover after a code is redeemed.
            Replaces the prior subtle inline tile (which users missed
            entirely on small screens). Larger icon, clearer copy,
            single prominent Continue CTA. */}
        {pane === 'promo' && promoSuccess && (
          <div
            className="px-6 pb-8 text-center"
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
          >
            <div className="mt-6 mb-6 inline-flex items-center justify-center">
              <div className="relative w-24 h-24 rounded-full bg-primary-container flex items-center justify-center">
                {/* Subtle pulse ring for a celebratory feel without
                    becoming animated noise. The animation is keyframed
                    in the global stylesheet (animate-quiz-pulse). */}
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-quiz-pulse" />
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-primary text-5xl relative z-10"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
              </div>
            </div>

            <p className="font-label text-[10px] font-semibold text-primary uppercase tracking-[0.22em] mb-3">
              Code Applied
            </p>
            <h2 className="font-headline text-3xl text-on-surface leading-tight mb-3">
              Welcome to Sanctuary Plus
            </h2>
            <p className="font-body text-sm text-on-surface-variant/80 leading-relaxed max-w-xs mx-auto mb-2">
              {promoSuccess.grantedUntil
                ? `Your premium access is active until ${new Date(promoSuccess.grantedUntil).toLocaleDateString()}.`
                : 'Your premium access is granted for life.'}
            </p>
            <p className="font-label text-[10px] text-on-surface-variant/50 uppercase tracking-wider mb-8 tabular-nums">
              {promoSuccess.code}
            </p>

            <button
              type="button"
              onClick={() => {
                onClose?.()
                // Soft refresh — reload so every gated surface re-reads
                // the updated profile. Cheaper than threading a global
                // entitlement-changed event through the React tree.
                window.location.reload()
              }}
              className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all"
            >
              Continue
            </button>
          </div>
        )}

        {pane === 'promo' && !promoSuccess && (
          <div
            className="px-6 pb-8"
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center gap-3 mt-2 mb-6">
              <button
                onClick={() => setPane('plans')}
                className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center active:scale-95"
                aria-label="Back to plans"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">arrow_back</span>
              </button>
              <p className="font-label text-[10px] font-semibold text-primary uppercase tracking-[0.22em]">
                Redeem a code
              </p>
            </div>

            <h2 className="font-headline text-2xl text-on-surface leading-tight mb-2">
              Enter your invite code
            </h2>
            <p className="font-body text-sm text-on-surface-variant/80 leading-relaxed mb-6">
              Got an invite from a campaign, a teacher, or our team? Enter it below.
            </p>

            <form onSubmit={handlePromoSubmit} className="space-y-4">
              <label htmlFor="promo-input" className="sr-only">Promo code</label>
              <input
                id="promo-input"
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value)
                  setPromoError(null)
                  setPromoSuccess(null)
                }}
                // Neutral placeholder — we used to echo "SANCTUARY-TEAM"
                // which was the seeded internal lifetime grant. Showing it
                // to every user effectively published it.
                placeholder="Enter your code"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck="false"
                disabled={promoBusy || !!promoSuccess}
                className="w-full px-4 py-3 rounded-xl bg-surface-container font-body text-base text-on-surface placeholder:text-on-surface-variant/40 tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-primary"
              />

              {promoError && (
                <p
                  className="font-body text-xs text-error leading-relaxed"
                  role="alert"
                  aria-live="polite"
                >
                  {promoError}
                </p>
              )}

              <button
                type="submit"
                disabled={promoBusy || !promoCode.trim()}
                className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all disabled:opacity-50"
              >
                {promoBusy ? 'Checking...' : 'Apply code'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

// Map server-side RPC error codes to user-friendly strings.
const ERROR_MESSAGES = {
  not_authenticated:  'Please sign in or create an account first.',
  not_found:          "We couldn't find that code.",
  inactive:           'That code is no longer active.',
  expired:            'That code has expired.',
  not_yet_valid:      "That code isn't active yet — try again later.",
  exhausted:          'That code has reached its redemption limit.',
  already_redeemed:   "You've already redeemed this code.",
  kind_not_supported: "That code can't be redeemed here yet.",
}

// Append query params to a URL, preserving any existing query string the
// Stripe Payment Link template might already carry (e.g. UTMs from the
// dashboard config). URL constructor handles encoding correctly.
function appendQuery(url, params) {
  try {
    const u = new URL(url)
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') u.searchParams.set(k, String(v))
    })
    return u.toString()
  } catch {
    // Fallback for non-standard URLs — naive append.
    const sep = url.includes('?') ? '&' : '?'
    const qs = Object.entries(params)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    return qs ? `${url}${sep}${qs}` : url
  }
}

// Quick profile re-fetch for the in-flight promo redemption flow. We can't
// import refreshProfile from AuthContext cleanly without a hook reorg, so
// this fetches + writes the localStorage cache that AuthContext reads on
// next render. Plus the window.location.reload() below ensures the rest
// of the app sees the change without subtle ordering bugs.
async function refreshProfileCache(userId) {
  try {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      localStorage.setItem(
        'sanctuary.profile.v1',
        JSON.stringify({ userId, profile: data })
      )
    }
  } catch {
    // Non-fatal — reload below will fetch fresh anyway.
  }
}
