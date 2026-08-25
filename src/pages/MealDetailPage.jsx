// ─────────────────────────────────────────────────────────────────────────────
//  MealDetailPage — the dish itself, not one of its ingredients.
//
//  Tapping a meal idea used to open the lead ingredient's page (tap "Rajma
//  chawal" → land on rajma), which reads as a bug. This is the dish: its image,
//  its impact on the user's dosha (the personalization surface — shown WITH its
//  contributing ingredients, never asserted), and its ingredients as rows the
//  user can drill into. Handles both meal TEMPLATES and derived RECIPE foods.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useVikritiSignal } from '../hooks/useVikritiSignal'
import { useDietPrefs } from '../hooks/useDietPrefs'
import { resolveDietTarget } from '../lib/dietTarget'
import { deriveMealById } from '../lib/mealComposer'
import { getIngredient, suitabilityFor } from '../lib/ingredients'
import { useMealFavourites } from '../hooks/useMealFavourites'
import { SUITABILITY } from '../lib/doshaSemantics'
import { mealVisual } from '../lib/mealVisual'
import { DIET_DISCLAIMER } from '../lib/dietSafety'
import MedicalDisclaimer from '../components/MedicalDisclaimer'
import useScrollDepth from '../hooks/useScrollDepth'
import { track, EVENTS } from '../lib/track'

const SUIT_STYLE = {
  [SUITABILITY.BALANCING]: { icon: 'trending_down', tint: 'text-pine', dot: 'bg-pine' },
  [SUITABILITY.NEUTRAL]:   { icon: 'remove',        tint: 'text-on-surface-variant', dot: 'bg-outline-variant' },
  [SUITABILITY.CAUTION]:   { icon: 'trending_up',   tint: 'text-clay', dot: 'bg-clay' },
}

function IngredientRow({ id, name, targetDosha, onTap }) {
  const ing = getIngredient(id)
  const suit = targetDosha && ing ? suitabilityFor(ing, targetDosha) : null
  const dot = suit ? SUIT_STYLE[suit].dot : 'bg-outline-variant'
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3 py-3 px-1 text-left active:opacity-70 transition-opacity"
    >
      {targetDosha && <span aria-hidden="true" className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />}
      <span className="font-body text-[15px] text-on-surface flex-1 min-w-0">{name}</span>
      <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-lg">chevron_right</span>
    </button>
  )
}

export default function MealDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { profile } = useAuth()
  const vikriti = useVikritiSignal()
  const { prefs: dietPrefs } = useDietPrefs()
  const { isFavourite, toggle } = useMealFavourites()
  useScrollDepth('meal_detail')

  const target = useMemo(() => resolveDietTarget({ vikriti, profile }), [vikriti, profile])
  const meal = useMemo(
    () => deriveMealById(id, { targetDosha: target.dosha, dietPrefs }),
    [id, target.dosha, dietPrefs],
  )

  useEffect(() => {
    if (!meal) return
    track(EVENTS.MEAL_DETAIL_VIEWED, {
      meal_id:      meal.id,
      kind:         meal.kind || 'meal',
      suitability:  meal.suitability,
      target_dosha: target.dosha,
      dosha_source: target.source,
    })
  }, [meal, target.dosha, target.source])

  if (!meal) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body pb-20 px-6 pt-4">
        <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center mb-6" aria-label={t('common.back')}>
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">arrow_back</span>
        </button>
        <div className="bg-surface-container-low rounded-2xl p-5">
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-3xl">search_off</span>
          <h1 className="font-headline text-xl text-on-surface mt-2">{t('diet.miss.title')}</h1>
          <p className="font-body text-[15px] text-on-surface-variant mt-2 leading-relaxed">{t('diet.miss.body')}</p>
        </div>
      </div>
    )
  }

  const vis = mealVisual(meal)
  const showImage = !!meal.image
  const style = SUIT_STYLE[meal.suitability]
  const doshaLabel = target.dosha ? t(`diet.dosha.${target.dosha}`) : null
  const hasVerdict = target.dosha && meal.contributions.length > 0

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-24">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative h-56 w-full overflow-hidden">
        {showImage ? (
          <img src={meal.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div aria-hidden="true" className="h-full w-full flex items-center justify-center" style={{ backgroundImage: `linear-gradient(135deg, ${vis.from} 0%, ${vis.to} 100%)` }}>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 100% at 50% -20%, rgba(255,255,255,0.45), transparent 60%)' }} />
            <span className="material-symbols-outlined relative text-[72px]" style={{ color: vis.ink, opacity: 0.72 }}>{vis.icon}</span>
          </div>
        )}
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-11 h-11 rounded-full bg-surface-container-low/90 backdrop-blur-sm flex items-center justify-center shadow-sm" aria-label={t('common.back')}>
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface text-lg">arrow_back</span>
        </button>
        <button
          onClick={() => {
            const now = toggle(meal.id)
            track(EVENTS.MEAL_FAVOURITED, { meal_id: meal.id, favourited: now })
          }}
          className="absolute top-4 right-4 w-11 h-11 rounded-full bg-surface-container-low/90 backdrop-blur-sm flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          aria-label={isFavourite(meal.id) ? t('mealDetail.unfavourite') : t('mealDetail.favourite')}
          aria-pressed={isFavourite(meal.id)}
        >
          <span aria-hidden="true" className={`material-symbols-outlined text-lg ${isFavourite(meal.id) ? 'text-clay' : 'text-on-surface-variant'}`} style={isFavourite(meal.id) ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            favorite
          </span>
        </button>
      </div>

      <div className="px-6 pt-5">
        <h1 className="font-headline text-3xl text-on-surface leading-tight">{meal.name}</h1>

        {meal.prep && <p className="font-body text-[15px] text-on-surface-variant mt-2 leading-relaxed">{meal.prep}</p>}
        {meal.whyFavor && <p className="font-body text-[15px] text-on-surface-variant mt-2 leading-relaxed">{meal.whyFavor}</p>}

        {/* ── Dosha impact — the personalization surface, shown with inputs. ── */}
        {hasVerdict && (
          <div className={`flex items-start gap-2 mt-4 rounded-2xl bg-surface-container/60 px-4 py-3 ${style.tint}`}>
            <span aria-hidden="true" className="material-symbols-outlined text-xl flex-shrink-0">{style.icon}</span>
            <div>
              <p className="font-body text-[15px] font-semibold">{t(`meals.verdict.${meal.suitability}`, { dosha: doshaLabel })}</p>
              <p className="font-body text-[13px] text-on-surface-variant mt-0.5 leading-relaxed">{meal.contributions.map((c) => c.name).join(', ')}</p>
            </div>
          </div>
        )}
        {meal.whyAvoid && !hasVerdict && (
          <p className="font-body text-[13px] text-on-surface-variant/80 mt-3 leading-relaxed">{meal.whyAvoid}</p>
        )}

        {/* ── Ingredients — drill into any one. ────────────────────────────── */}
        <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mt-7 mb-1">{t('mealDetail.ingredients')}</p>
        <div className="divide-y divide-outline-variant/40">
          {meal.core.map((c) => (
            <IngredientRow key={c.id} id={c.id} name={c.name} targetDosha={target.dosha}
              onTap={() => { track(EVENTS.MEAL_INGREDIENT_TAPPED, { meal_id: meal.id, ingredient_id: c.id }); navigate(`/ingredient/${c.id}`) }} />
          ))}
        </div>

        {meal.optional.length > 0 && (
          <>
            <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mt-6 mb-1">{t('mealDetail.optional')}</p>
            <div className="divide-y divide-outline-variant/40">
              {meal.optional.map((o) => (
                <IngredientRow key={o.id} id={o.id} name={o.name} targetDosha={target.dosha}
                  onTap={() => { track(EVENTS.MEAL_INGREDIENT_TAPPED, { meal_id: meal.id, ingredient_id: o.id }); navigate(`/ingredient/${o.id}`) }} />
              ))}
            </div>
          </>
        )}

        {meal.balancedBy.length > 0 && (
          <p className="font-body text-[13px] text-on-surface-variant/70 mt-5 leading-relaxed">
            {t('meals.balancedBy', { list: meal.balancedBy.map((b) => b.name).join(', ') })}
          </p>
        )}

        {(meal.isDerived || meal.citations.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-5">
            {meal.isDerived && (
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label text-[8px] uppercase tracking-wide text-on-surface-variant">{t('diet.confidence.medium')}</span>
            )}
            {meal.citations.map((v) => (
              <span key={v} className="px-2 py-0.5 rounded-full bg-primary-container font-label text-[8px] uppercase tracking-wide text-on-primary-container">{v}</span>
            ))}
          </div>
        )}

        <p className="font-body text-[11px] text-on-surface-variant/60 leading-relaxed mt-6">{t('meals.notRecipes')}</p>
        <p className="font-body text-[11px] text-on-surface-variant/60 leading-relaxed mt-3">{DIET_DISCLAIMER}</p>
        <MedicalDisclaimer variant="inline" className="mt-2" />
      </div>
    </div>
  )
}
