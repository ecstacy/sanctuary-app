import { useTranslation } from 'react-i18next'
import useConsent from '../hooks/useConsent'

// ─────────────────────────────────────────────────────────────────────────────
//  AnalyticsConsentCard
//
//  A subtle inline card — not a modal, not a toast — that appears on the
//  home page *after* the user has felt value from the product (e.g. after
//  the first completed practice). The design philosophy:
//
//    • Ask once, later. Never on first launch.
//    • Plain language. No "cookies", no "trackers".
//    • Equal-weight options. "Allow" is primary-tinted but not tricky; the
//      "Not now" button has the same hit area and same affordance.
//    • Explicit data promise on-card: no name, email, or location.
//    • "Not now" defers for 90 days; we don't ask again until then.
//    • If user has already decided either way, the card is not rendered.
//
//  The card is parent-controlled on visibility — HomePage decides *when*
//  to render it based on practice stats — but the card itself still
//  double-checks `shouldAsk` so stale parents can't force it open.
// ─────────────────────────────────────────────────────────────────────────────
export default function AnalyticsConsentCard() {
  const { t } = useTranslation()
  const { shouldAsk, grant, defer, decline } = useConsent()

  if (!shouldAsk) return null

  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 stagger-3">
      <div className="flex items-start gap-3 mb-3">
        <span className="material-symbols-outlined text-primary text-lg mt-0.5">insights</span>
        <div className="flex-1">
          <h3 className="font-headline text-base text-on-surface leading-snug">
            {t('consent.card.title')}
          </h3>
          <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
            {t('consent.card.body')}
          </p>
        </div>
      </div>

      {/* Data promise — small, inline, visible before the buttons */}
      <div className="flex items-center gap-2 mb-4 pl-8">
        <span className="material-symbols-outlined text-primary/70 text-[14px]">lock</span>
        <p className="font-label text-[11px] text-on-surface-variant/80 leading-snug">
          {t('consent.card.promise')}
        </p>
      </div>

      {/* Actions — equal-weight, no dark pattern */}
      <div className="flex gap-2 pl-8">
        <button
          onClick={grant}
          className="flex-1 py-2.5 bg-primary text-on-primary rounded-full font-label text-xs font-semibold tracking-wide active:scale-[0.97] transition-all"
        >
          {t('consent.card.allow')}
        </button>
        <button
          onClick={defer}
          className="flex-1 py-2.5 bg-surface-container text-on-surface rounded-full font-label text-xs tracking-wide active:scale-[0.97] transition-all"
        >
          {t('consent.card.notNow')}
        </button>
      </div>

      {/* Secondary text link — less prominent, for people who know what
          they want and want to say no without being asked again */}
      <div className="flex justify-center mt-3">
        <button
          onClick={decline}
          className="font-label text-[11px] text-on-surface-variant/60 underline-offset-2 hover:underline active:scale-95 transition-all"
        >
          {t('consent.card.neverAsk')}
        </button>
      </div>
    </div>
  )
}
