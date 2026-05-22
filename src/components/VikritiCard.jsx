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
import { track, EVENTS } from '../lib/track'
import { useProtocolProgress } from '../hooks/useProtocolProgress'

export default function VikritiCard({ signal, isPremium, onOpenPaywall }) {
  const navigate = useNavigate()
  const { vikriti, evidence, recommendations: r } = signal
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
        aria-label="Dismiss reading"
        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center active:scale-95 transition-all"
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
          className="font-label text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: r.accentHex }}
        >
          Today's Reading
        </p>
      </div>

      <h3
        id="vikriti-headline"
        className="font-headline text-xl text-on-surface leading-tight mb-2 pr-6"
      >
        {r.headline}
      </h3>

      <p className="font-body text-sm text-on-surface-variant/90 leading-relaxed mb-3 pr-6">
        {r.summary}
      </p>

      {/* Evidence line — small, honest. Tells the user WHY we're saying
          this. "We're not guessing — you told us." This factual back-up
          is what separates a teacher's nudge from a horoscope. */}
      <p className="font-label text-[11px] text-on-surface-variant/60 mb-5">
        Based on {evidence.matchingDays} of your last {evidence.totalDays} check-in
        {evidence.totalDays === 1 ? '' : ' days'}.
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
              className="font-label text-[10px] font-semibold uppercase tracking-[0.18em] mb-2"
              style={{ color: r.accentHex }}
            >
              Picking it back up · {ordinal(nextAttemptNumber)} time
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
                ? `Continue your ${capitalize(vikriti)} protocol`
                : `Start your ${capitalize(vikriti)} protocol`}
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
            Or just {r.free.label.replace(/^Tonight: |^Try /, '').toLowerCase()}
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
              {r.free.label}
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
                {r.plus.label}
              </p>
              <p className="font-label text-[11px] text-on-surface-variant/70 mt-0.5 truncate">
                {r.plus.sub}
              </p>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-surface rounded-full ml-3 flex-shrink-0">
              <span
                aria-hidden="true"
                className={`material-symbols-outlined text-[11px] ${r.textColor}`}
              >
                lock
              </span>
              <span
                className={`font-label text-[9px] font-semibold uppercase tracking-wide ${r.textColor}`}
              >
                Plus
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

// English ordinal suffix — 1st, 2nd, 3rd, 4th, … 11th, 12th, 13th, … 21st.
// Used only on this surface so kept inline rather than promoted to a util.
// If we need ordinals elsewhere (Journey page, etc.) extract then.
function ordinal(n) {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`
  const mod10 = n % 10
  if (mod10 === 1) return `${n}st`
  if (mod10 === 2) return `${n}nd`
  if (mod10 === 3) return `${n}rd`
  return `${n}th`
}
