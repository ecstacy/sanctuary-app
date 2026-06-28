// ─────────────────────────────────────────────────────────────────────────────
//  MedicalDisclaimer — "this is not medical advice" notice
//
//  Sanctuary gives yoga + Ayurveda guidance: dosha readings, lifestyle
//  protocols, dietary suggestions, pranayama. None of it is medical advice,
//  and saying so plainly does two things:
//    1. Protects against "I followed the app and got hurt" liability.
//    2. Keeps us cleanly on the no-health-permit side of German trade law
//       (the Gewerbe was registered as software, not a health practice).
//
//  Placed on the surfaces that actually give guidance (dosha profile,
//  protocols) rather than globally — a disclaimer the user sees in context,
//  next to the advice it qualifies, is both more honest and more legally
//  meaningful than one buried in a settings page.
//
//  VARIANTS
//  --------
//  • "card"   (default) — bordered block, for the foot of a content page.
//  • "inline" — compact muted line, for tighter spots.
//
//  The copy intentionally calls out pregnancy + existing conditions, the
//  two highest-risk cases (esp. for pranayama like Kapalabhati/Bhastrika).
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslation } from 'react-i18next'

export default function MedicalDisclaimer({ variant = 'card', className = '' }) {
  const { t } = useTranslation()
  const COPY = t('disclaimer.body')

  if (variant === 'inline') {
    return (
      <p
        role="note"
        className={`font-body text-[11px] text-on-surface-variant/60 leading-relaxed ${className}`}
      >
        {COPY}
      </p>
    )
  }

  return (
    <div
      role="note"
      className={`bg-surface-container-low rounded-lg p-4 flex items-start gap-3 ${className}`}
    >
      <span
        aria-hidden="true"
        className="material-symbols-outlined text-on-surface-variant/50 text-base mt-0.5 flex-shrink-0"
      >
        info
      </span>
      <p className="font-body text-[11px] text-on-surface-variant/70 leading-relaxed">
        {COPY}
      </p>
    </div>
  )
}
