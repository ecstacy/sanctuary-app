// ─────────────────────────────────────────────────────────────────────────────
//  VikritiCard — home-page "today's reading" card
//
//  The contextual nudge surface. Shown when `useVikritiSignal()` detects a
//  pattern in the user's last 14 days of checkins. The card is dosha-themed
//  (Vata = cool blue, Pitta = warm orange, Kapha = sage green) so the
//  visual itself communicates which dosha is elevated before the user
//  reads a word.
//
//  TWO ACTIONS, ONE CARD
//  ─────────────────────
//  Free action — always tappable, always free content. The user gets real
//  value immediately, building trust that the app isn't just a paywall
//  funnel.
//
//  Plus action — for non-Plus users, opens the paywall (the full protocol
//  is the Plus value-prop demo). For Plus users, ideally deep-links into
//  the full protocol (Phase 2 work — for now we link to the dosha profile).
//
//  This split is the heart of the "free is complete, Plus is rich" pact:
//  every nudge has a real free path AND a richer paid path.
//
//  DISMISSIBLE BUT NOT SUPPRESSED
//  ──────────────────────────────
//  The dismiss button hides the card for the current session. We don't
//  persist dismissals server-side because the next vikriti reading (a
//  few days from now) might be different and equally important. Users who
//  truly don't want this card can disable it from Settings (future).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { track, EVENTS } from '../lib/track'
import { useProtocolProgress } from '../hooks/useProtocolProgress'

export default function VikritiCard({ signal, isPremium, onOpenPaywall }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { vikriti, evidence, recommendations: r } = signal
  // Localized signal copy (headline/summary/free/plus text). Colors, emoji,
  // and routes still come from the hook's recommendations object.
  const sig = (k) => t(`vikritiSignal.${vikriti}.${k}`)
  const [dismissed, setDismissed] = useState(false)
  const impressionFiredRef = useRef(false)

  // ── Returning-user context ──────────────────────────────────────────────
  // If the user has run this protocol before, the Plus tile gains a
  // "Returning · 3rd time" kicker so the card acknowledges them. Stronger
  // identity hook than starting from scratch every reading.
  //
  // For non-Plus users this is always 0 (they can't access the protocol
  // to begin with), so the kicker only shows up for Plus members anyway.
  // The hook is safe to call even when vikriti is null — it short-circuits.
  const { totalAttempts } = useProtocolProgress(vikriti)
  const nextAttemptNumber = totalAttempts + 1  // i.e. "what would this attempt count as"
  const isReturning = isPremium && totalAttempts >= 1

  // Fire SHOWN once per (mount, vikriti, dismissed=false) — guarded so a
  // re-render from parent state doesn't double-count an impression. This
  // is the denominator for everything downstream.
  useEffect(() => {
    if (dismissed || impressionFiredRef.current) return
    impressionFiredRef.current = true
    track(EVENTS.VIKRITI_SIGNAL_SHOWN, {
      vikriti,
      matching_days:          evidence?.matchingDays,
      total_days:             evidence?.totalDays,
      avg_energy:             evidence?.avgEnergy,
      avg_stress:             evidence?.avgStress,
      is_premium:             isPremium,
      // Attempt context — lets us segment "first-time vs returning" in
      // the conversion funnel without an extra join. Returning Plus users
      // are the most valuable cohort to study (they got value once, are
      // they coming back to repeat?).
      total_protocol_attempts: totalAttempts,
      is_returning:            isReturning,
    })
  }, [vikriti, evidence, isPremium, dismissed, totalAttempts, isReturning])

  if (dismissed) return null

  function handleFreeAction() {
    track(EVENTS.VIKRITI_FREE_ACTION_TAPPED, {
      vikriti,
      destination: r.free.route,
      is_premium:  isPremium,
    })
    navigate(r.free.route)
  }

  function handlePlusAction() {
    track(EVENTS.VIKRITI_PLUS_ACTION_TAPPED, {
      vikriti,
      is_premium:             isPremium,
      total_protocol_attempts: totalAttempts,
      is_returning:            isReturning,
    })
    if (isPremium) {
      // Plus users land directly on the full 3-day protocol for their
      // current vikriti. The page itself also enforces the Plus gate as
      // a safety net for deep-links.
      navigate(`/protocol/${vikriti}`)
    } else {
      onOpenPaywall?.()
    }
  }

  function handleDismiss() {
    track(EVENTS.VIKRITI_SIGNAL_DISMISSED, { vikriti, is_premium: isPremium })
    setDismissed(true)
  }

  return (
    <section
      className={`${r.bgColor} rounded-2xl p-5 mb-5 stagger-2 relative`}
      role="region"
      aria-labelledby="vikriti-headline"
    >
      {/* Dismiss — small, top-right. Doesn't compete with the actions. */}
      <button
        onClick={handleDismiss}
        aria-label={t('vikritiCard.dismiss')}
        className="absolute top-1 right-1 w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-all"
      >
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-on-surface-variant/50 text-base"
        >
          close
        </span>
      </button>

      {/* Header — dosha icon + kicker + headline. The colored emoji is the
          visual anchor; users with multiple cards stacked over time will
          come to associate the color/icon with their pattern. */}
      <div className="flex items-center gap-2 mb-2">
        <span
          aria-hidden="true"
          className={`material-symbols-outlined text-lg ${r.textColor}`}
        >
          {r.emoji}
        </span>
        <p
          className="font-label text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: r.accentHex }}
        >
          {t('vikritiCard.todaysReading')}
        </p>
      </div>

      <h3
        id="vikriti-headline"
        className="font-headline text-xl text-on-surface leading-tight mb-2 pr-6"
      >
        {sig('headline')}
      </h3>

      <p className="font-body text-sm text-on-surface-variant/90 leading-relaxed mb-3 pr-6">
        {sig('summary')}
      </p>

      {/* Evidence line — small, honest. Tells the user WHY we're saying
          this. "We're not guessing — you told us." This factual back-up
          is what separates a teacher's nudge from a horoscope. */}
      <p className="font-label text-[11px] text-on-surface-variant/60 mb-5">
        {t('vikritiCard.evidence', {
          count:    evidence.totalDays,
          matching: evidence.matchingDays,
          total:    evidence.totalDays,
        })}
      </p>

      {/* Action area — branches on entitlement.
          ─────────────────────────────────────────────────────────────
          FREE USERS (default below):
            • Primary  : free single-asana action (immediate value)
            • Secondary: locked Plus tile (upsell to the protocol)
          PLUS USERS:
            • Primary  : protocol page (the deeper experience they paid for)
            • Secondary: free single-asana as a quick alternative
              ("only have 5 min today? do this")
          The protocol page IS the value-prop they purchased; surfacing
          the single asana as the primary call to action for Plus would
          waste the upgrade. */}

      {isPremium ? (
        <>
          {/* Returning-user kicker — sits ABOVE the primary CTA now, so
              it reads as a header rather than an ornament on a tile. */}
          {isReturning && (
            <p
              className="font-label text-[11px] font-semibold uppercase tracking-[0.18em] mb-2"
              style={{ color: r.accentHex }}
            >
              {t('vikritiCard.returningKicker', { n: nextAttemptNumber })}
            </p>
          )}

          {/* Primary CTA — the protocol. Full-width primary styling,
              same visual weight a free user's free-action CTA gets,
              so the page composition stays balanced regardless of
              entitlement. */}
          <button
            onClick={handlePlusAction}
            className="w-full px-4 py-3 rounded-full text-left flex items-center justify-between bg-surface active:scale-[0.98] transition-all mb-2"
          >
            <span className={`font-body text-sm font-semibold ${r.textColor}`}>
              {isReturning
                ? t('vikritiCard.continueProtocol', { dosha: capitalize(vikriti) })
                : t('vikritiCard.startProtocol', { dosha: capitalize(vikriti) })}
            </span>
            <span
              aria-hidden="true"
              className={`material-symbols-outlined text-base ${r.textColor}`}
            >
              arrow_forward
            </span>
          </button>

          {/* Secondary — the single-asana quick option. Plain text link
              styling so it doesn't compete with the primary CTA. Useful
              for "I only have 5 minutes tonight" days. */}
          <button
            onClick={handleFreeAction}
            className="w-full px-2 py-2 text-center font-body text-xs text-on-surface-variant/70 active:scale-95 transition-all"
          >
            {t('vikritiCard.orJust', { action: sig('freeLabel').replace(/^Tonight: |^Try /, '').toLowerCase() })}
          </button>
        </>
      ) : (
        <>
          {/* Free user — primary CTA is the free single-asana action.
              Real, immediate, no paywall trap. */}
          <button
            onClick={handleFreeAction}
            className={`w-full px-4 py-3 rounded-full text-left flex items-center justify-between bg-surface active:scale-[0.98] transition-all mb-3`}
          >
            <span className={`font-body text-sm font-semibold ${r.textColor}`}>
              {sig('freeLabel')}
            </span>
            <span
              aria-hidden="true"
              className={`material-symbols-outlined text-base ${r.textColor}`}
            >
              arrow_forward
            </span>
          </button>

          {/* Free user — secondary is the locked Plus tile. The paywall
              hook, with the 🔒 Plus badge for clear affordance. */}
          <button
            onClick={handlePlusAction}
            className="w-full px-4 py-3 rounded-2xl text-left flex items-center justify-between bg-surface/50 active:scale-[0.98] transition-all"
          >
            <div className="min-w-0">
              <p className="font-body text-sm text-on-surface leading-tight truncate">
                {sig('plusLabel')}
              </p>
              <p className="font-label text-[11px] text-on-surface-variant/70 mt-0.5 truncate">
                {sig('plusSub')}
              </p>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-plus-container rounded-full ml-3 flex-shrink-0">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[11px] text-plus"
              >
                lock
              </span>
              <span
                className="font-label text-[11px] font-semibold uppercase tracking-wide text-plus"
              >
                {t('vikritiCard.plusBadge')}
              </span>
            </div>
          </button>
        </>
      )}
    </section>
  )
}

// Capitalize first letter — used for inline dosha names in CTA copy
// ("Continue your Vata protocol"). Inlined since it's only used here.
function capitalize(s) {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
