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
import { createPortal } from 'react-dom'
import { Capacitor } from '@capacitor/core'
import { registerPlugin } from '@capacitor/core'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { track, EVENTS } from '../lib/track'
import { getCoarseRegion } from '../lib/region'
import { getPurchaseBlockReason } from '../lib/monetization'

const ExternalBrowser = registerPlugin('ExternalBrowser', {
  web: { async open({ url }) { window.open(url, '_blank') } }
})

// Pricing display data. Prices/cadence are presentation strings (numbers
// stay as-is across locales); label/savings/sub resolve via i18n keys.
const PLANS = [
  {
    id:         'annual',
    price:      '€59',
    cadenceKey: 'paywall.cadenceYear',
    labelKey:   'paywall.planAnnual',
    savingsKey: 'paywall.annualSavings',
    subKey:     'paywall.annualSub',
    envKey:     'VITE_STRIPE_CHECKOUT_ANNUAL',
    highlight:  true,
  },
  {
    id:         'monthly',
    price:      '€8.99',
    cadenceKey: 'paywall.cadenceMonth',
    labelKey:   'paywall.planMonthly',
    subKey:     'paywall.monthlySub',
    envKey:     'VITE_STRIPE_CHECKOUT_MONTHLY',
  },
]

const BENEFITS = [
  { icon: 'library_books',    key: 'paywall.benefits.library' },
  { icon: 'self_improvement', key: 'paywall.benefits.routine' },
  { icon: 'menu_book',        key: 'paywall.benefits.charaka' },
  { icon: 'restaurant_menu',  key: 'paywall.benefits.diet' },
  { icon: 'graphic_eq',       key: 'paywall.benefits.voice' },
]

export default function PaywallSheet({ open, onClose, surface, headline, subhead }) {
  const { user, refreshProfile } = useAuth()
  const { t } = useTranslation()

  // Two-pane sheet: 'plans' (default) and 'promo' (when user taps "Have a code").
  const [pane, setPane]               = useState('plans')
  const [promoCode, setPromoCode]     = useState('')
  const [promoBusy, setPromoBusy]     = useState(false)
  const [promoError, setPromoError]   = useState(null)
  const [promoSuccess, setPromoSuccess] = useState(null)

  const shownRef = useRef(false)

  // Purchase gate — don't offer paid plans where we may not sell: on iOS
  // (Apple requires IAP; Plus is Stripe — see lib/monetization.js) or in a
  // region we're not registered for yet (India / OIDAR for v1). Promo
  // redemption stays available in both cases, so a gated user can still be
  // granted Plus via a code. Cheap; computed once per render.
  const blockReason = getPurchaseBlockReason()   // 'ios' | 'region' | null
  const purchaseRestricted = blockReason !== null

  // Fire PAYWALL_SHOWN once per open. Reset on close so the next open
  // counts as a new impression.
  useEffect(() => {
    if (open && !shownRef.current) {
      shownRef.current = true
      track(EVENTS.PAYWALL_SHOWN, {
        surface,
        anonymous: !user,
        region: getCoarseRegion(),
        purchase_restricted: purchaseRestricted,
        // 'ios' | 'region' | null — separates the Apple-policy gate from the
        // jurisdictional one in Dashboard D.
        block_reason: blockReason,
      })
    }
    if (!open) {
      shownRef.current = false
      // Reset pane state on close so the next open starts clean.
      setPane('plans')
      setPromoCode('')
      setPromoError(null)
      setPromoSuccess(null)
    }
  }, [open, surface, user, blockReason, purchaseRestricted])

  if (!open) return null

  // ── Handlers ────────────────────────────────────────────────────────────
  function handleDismiss() {
    track(EVENTS.PAYWALL_DISMISSED, { surface, pane })
    onClose?.()
  }

  async function handlePlan(plan) {
    // Defence in depth: the plan buttons don't render when a gate is active,
    // so this is unreachable — but opening Stripe on iOS would be an Apple
    // 3.1.1 violation, and that's not a thing to leave to render logic alone.
    if (purchaseRestricted) return

    track(EVENTS.PAYWALL_PLAN_SELECTED, { surface, plan: plan.id })

    const baseUrl = import.meta.env[plan.envKey]
    if (!baseUrl) {
      // Stripe not wired yet — show the stub.
      alert(t('paywall.comingSoon'))
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
      alert(t('paywall.signInToSubscribe'))
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
      setPromoError(t('paywall.promo.errEmpty'))
      return
    }
    if (!user) {
      setPromoError(t('paywall.promo.errNeedAccount'))
      return
    }

    setPromoBusy(true)
    track(EVENTS.PROMO_CODE_SUBMITTED, { surface, code_length: code.length })

    try {
      const { data, error } = await supabase.rpc('redeem_promo_code', { input_code: code })
      if (error) {
        setPromoError(t('paywall.promo.errGeneric'))
        track(EVENTS.PROMO_CODE_FAILED, { surface, reason: 'rpc_error', message: error.message })
        return
      }
      if (!data?.ok) {
        const key = ERROR_KEYS[data?.error] || 'paywall.promo.errDefault'
        setPromoError(t(key))
        track(EVENTS.PROMO_CODE_FAILED, { surface, reason: data?.error || 'unknown' })
        return
      }
      // Success — show confirmation, then refresh the profile in-place
      // so is_premium flips for every consumer of useAuth() / useIsPremium()
      // without a jarring full-page reload.
      setPromoSuccess({
        grantedUntil: data.granted_until,
        code:         data.code,
      })
      track(EVENTS.PROMO_CODE_REDEEMED, {
        surface,
        code:          data.code,
        granted_until: data.granted_until,
      })
      // refreshProfile() updates AuthContext state synchronously after
      // the supabase fetch resolves. All downstream useIsPremium()
      // consumers re-render with isPremium=true. No window.reload(),
      // no flash of unlocked content — the locks just disappear.
      await refreshProfile()
    } finally {
      setPromoBusy(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  // z-index above BottomNav (which is z=50). The BottomNav otherwise paints
  // over the modal's Apply/Continue CTAs on phones where the modal is
  // tall, since the nav is rendered later in the tree and the two share
  // a z-index. Bumping to 60 keeps the modal CTA always reachable.
  // Portaled to document.body so it escapes the page's PageTransition transform
  // (a stacking context). Without this, a page-level sticky CTA that is ALSO
  // portaled to body (e.g. RoutinePage's "Unlock with Plus" bar) would render
  // ABOVE this sheet even at a higher z-index, because the sheet was trapped
  // inside the transformed page context. z-[70] keeps it over that bar (z-50).
  return createPortal((
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm"
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
          className="absolute top-3 right-3 w-11 h-11 rounded-full bg-surface-container flex items-center justify-center active:scale-95 transition-all"
          aria-label={t('common.cancel')}
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
              <p className="font-label text-[11px] font-semibold text-plus uppercase tracking-[0.22em] mb-3">
                {t('paywall.kicker')}
              </p>
              <h2 id="paywall-title" className="font-headline text-3xl text-on-surface leading-tight mb-3">
                {headline || t('paywall.defaultHeadline')}
              </h2>
              <p className="font-body text-sm text-on-surface-variant/80 leading-relaxed max-w-xs mx-auto">
                {subhead || t('paywall.defaultSubhead')}
              </p>
            </div>

            {/* Benefits */}
            <ul className="mb-7 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b.icon} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-plus text-base mt-0.5 flex-shrink-0"
                  >{b.icon}</span>
                  <span className="font-body text-sm text-on-surface leading-snug">{t(b.key)}</span>
                </li>
              ))}
            </ul>

            {/* Plans — OR a not-available notice. We don't surface paid plans
                on iOS (Apple requires IAP; Plus is Stripe) or in gated regions
                (India / OIDAR for v1). Either way the copy stays factual and
                links nowhere — steering to an external purchase is the same
                Apple violation as selling. The user can still redeem a code
                below in both cases. */}
            {purchaseRestricted ? (
              <div className="bg-surface-container rounded-2xl p-5 mb-5 text-center">
                <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/60 text-2xl mb-2">
                  {blockReason === 'ios' ? 'lock' : 'public'}
                </span>
                <p className="font-body font-semibold text-sm text-on-surface mb-1">
                  {blockReason === 'ios' ? t('paywall.iosTitle') : t('paywall.regionTitle')}
                </p>
                <p className="font-body text-xs text-on-surface-variant/70 leading-relaxed">
                  {blockReason === 'ios' ? t('paywall.iosBody') : t('paywall.regionBody')}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-5">
                  {PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => handlePlan(plan)}
                      className={`w-full rounded-2xl p-4 text-left relative active:scale-[0.98] transition-all ${
                        plan.highlight
                          ? 'bg-plus-container border-2 border-plus'
                          : 'bg-surface-container border-2 border-transparent'
                      }`}
                      aria-label={t(plan.labelKey)}
                    >
                      {plan.savingsKey && (
                        <span className="absolute -top-2 right-4 bg-plus text-white font-label text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          {t(plan.savingsKey)}
                        </span>
                      )}
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-body font-semibold text-base text-on-surface">{t(plan.labelKey)}</span>
                        <span className="font-headline text-2xl text-on-surface tabular-nums">
                          {plan.price}
                          <span className="font-body text-xs text-on-surface-variant ml-0.5">{t(plan.cadenceKey)}</span>
                        </span>
                      </div>
                      <p className="font-body text-xs text-on-surface-variant/70 leading-snug">{t(plan.subKey)}</p>
                    </button>
                  ))}
                </div>

                <p className="font-body text-[10px] text-on-surface-variant/50 text-center leading-relaxed mb-5">
                  {t('paywall.renewNote')}
                </p>
              </>
            )}

            {/* Promo code entry */}
            <button
              onClick={() => {
                track(EVENTS.PROMO_CODE_OPENED, { surface })
                setPane('promo')
              }}
              className="w-full py-3 text-center font-label text-xs text-on-surface-variant/70 uppercase tracking-widest active:scale-95 transition-all"
            >
              {t('paywall.haveCode')}
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
              <div className="relative w-24 h-24 rounded-full bg-plus-container flex items-center justify-center">
                {/* Subtle pulse ring for a celebratory feel without
                    becoming animated noise. The animation is keyframed
                    in the global stylesheet (animate-quiz-pulse). */}
                <div className="absolute inset-0 rounded-full bg-plus/20 animate-quiz-pulse" />
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-plus text-5xl relative z-10"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
              </div>
            </div>

            <p className="font-label text-[11px] font-semibold text-plus uppercase tracking-[0.22em] mb-3">
              {t('paywall.promo.successKicker')}
            </p>
            <h2 className="font-headline text-3xl text-on-surface leading-tight mb-3">
              {t('paywall.promo.successTitle')}
            </h2>
            <p className="font-body text-sm text-on-surface-variant/80 leading-relaxed max-w-xs mx-auto mb-2">
              {promoSuccess.grantedUntil
                ? t('paywall.promo.successUntil', { date: new Date(promoSuccess.grantedUntil).toLocaleDateString() })
                : t('paywall.promo.successLifetime')}
            </p>
            <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider mb-8 tabular-nums">
              {promoSuccess.code}
            </p>

            <button
              type="button"
              onClick={() => onClose?.()}
              className="w-full py-4 btn-plus text-white rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all"
            >
              {t('paywall.promo.startExploring')}
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
                className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center active:scale-95"
                aria-label={t('common.back')}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">arrow_back</span>
              </button>
              <p className="font-label text-[11px] font-semibold text-plus uppercase tracking-[0.22em]">
                {t('paywall.promo.kicker')}
              </p>
            </div>

            <h2 className="font-headline text-2xl text-on-surface leading-tight mb-2">
              {t('paywall.promo.title')}
            </h2>
            <p className="font-body text-sm text-on-surface-variant/80 leading-relaxed mb-6">
              {t('paywall.promo.body')}
            </p>

            <form onSubmit={handlePromoSubmit} className="space-y-4">
              <label htmlFor="promo-input" className="sr-only">{t('paywall.promo.kicker')}</label>
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
                placeholder={t('paywall.promo.placeholder')}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck="false"
                disabled={promoBusy || !!promoSuccess}
                className="w-full px-4 py-3 rounded-xl bg-surface-container font-body text-base text-on-surface placeholder:text-on-surface-variant/40 tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-plus"
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
                className="w-full py-4 btn-plus text-white rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all disabled:opacity-50"
              >
                {promoBusy ? t('paywall.promo.checking') : t('paywall.promo.apply')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  ), document.body)
}

// Map server-side RPC error codes to i18n keys (resolved at render via t()).
const ERROR_KEYS = {
  not_authenticated:  'paywall.promo.errNeedAccount',
  not_found:          'paywall.promo.errNotFound',
  inactive:           'paywall.promo.errInactive',
  expired:            'paywall.promo.errExpired',
  not_yet_valid:      'paywall.promo.errNotYetValid',
  exhausted:          'paywall.promo.errExhausted',
  already_redeemed:   'paywall.promo.errAlreadyRedeemed',
  kind_not_supported: 'paywall.promo.errKindUnsupported',
  // Brute-force guard tripped (migration 013): too many failed attempts in the
  // rolling window. Message stays vague on purpose — telling an attacker the
  // exact budget and window is free intel.
  rate_limited:       'paywall.promo.errRateLimited',
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

// (refreshProfileCache removed — we now call useAuth().refreshProfile()
// directly, which updates AuthContext state in-place. The old localStorage-
// poke-then-window-reload pattern was a workaround for not wiring the
// proper refresh; the cleaner path is just to use the context API.)
