// ─────────────────────────────────────────────────────────────────────────────
//  MealCheckPromo — the Home entry for Meal Check, dressed up.
//
//  Meal Check is one of the app's most distinctive features ("tell me what you
//  ate → see how it moves your doshas"), but on Home it was a plain nav row.
//  This promotes it: a soft, warm gradient card with a meal-native graphic — a
//  bowl with steam gently rising — and a filled CTA. The steam drifts up and
//  fades; frozen under prefers-reduced-motion (handled globally in index.css).
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMealCheckAccess } from '../hooks/useMealCheckAccess'
import { track, EVENTS } from '../lib/track'

const STEAM = ['0s', '0.5s', '1s']

export default function MealCheckPromo({ className = '' }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const mealAccess = useMealCheckAccess()
  const onTrial = mealAccess.state === 'trial' || mealAccess.state === 'trial_fresh'

  const go = () => {
    track(EVENTS.CTA_CLICKED, { cta_id: 'meal_check_promo', route_name: 'home' })
    navigate('/meal-check')
  }

  return (
    <button
      type="button"
      onClick={go}
      aria-label={t('mealCheck.title')}
      className={`group relative w-full text-left rounded-2xl overflow-hidden p-4
        bg-surface-container-low border border-outline-variant/30 card-elev
        active:scale-[0.99] transition-transform ${className}`}
    >
      {/* Warm tint over the solid card base — floats above the ground, still has
          a hint of the dosha gradient. */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-secondary-container/45 via-transparent to-primary-container/35" />
      <div className="relative flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-headline text-lg text-on-surface">{t('mealCheck.title')}</h3>
            {onTrial && (
              <span className="shrink-0 font-label text-[10px] uppercase tracking-wide text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-full">
                {t('mealCheck.homeBadge', { count: mealAccess.trialDaysLeft })}
              </span>
            )}
          </div>
          <p className="font-body text-[13px] text-on-surface-variant leading-relaxed mt-1">
            {t('mealCheck.inputHelp')}
          </p>
          <span className="inline-flex items-center gap-1 mt-3 pl-4 pr-3 py-2 rounded-full bg-primary text-on-primary font-body text-[13px] font-semibold shadow-sm group-active:brightness-95 transition">
            {t('mealCheck.homeCta')}
            <span aria-hidden="true" className="material-symbols-outlined text-base group-active:translate-x-0.5 transition-transform">arrow_forward</span>
          </span>
        </div>

        {/* Meal-native graphic — a warm bowl with steam rising. */}
        <div aria-hidden="true" className="shrink-0 relative w-[76px] h-[68px] flex items-end justify-center">
          <div className="absolute top-1 flex gap-[7px]">
            {STEAM.map((delay, i) => (
              <span
                key={i}
                className="meal-steam block w-[3px] h-3.5 rounded-full bg-on-surface/25"
                style={{ animationDelay: delay }}
              />
            ))}
          </div>
          <span className="material-symbols-outlined text-[46px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            ramen_dining
          </span>
        </div>
      </div>
    </button>
  )
}
