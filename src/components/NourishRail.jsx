// ─────────────────────────────────────────────────────────────────────────────
//  NourishRail — Home's "to nourish" section.
//
//  Replaces the single MealOfTheDayCard. The meal composer already returns
//  several ideas for the slot that's due RIGHT NOW (morning → breakfast, midday
//  → lunch, evening → dinner, via mealSlotFor), and re-rolls as the day moves —
//  so instead of showing one idea and discarding the rest, this surfaces them as
//  a swipeable rail titled by the occasion, with a "View all" into /meals.
//
//  Keeps MealOfTheDayCard's two rules:
//   • RENDERS NOTHING when the composer has no ideas (Home never carries an empty
//     apology card).
//   • The rail is the free hook (dish names + fit); the why / prep / alternatives
//     stay behind /meals + the meal detail, where the paywall already lives.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useIsPremium } from '../hooks/useIsPremium'
import { useVikritiSignal } from '../hooks/useVikritiSignal'
import { useDietPrefs } from '../hooks/useDietPrefs'
import { resolveDietTarget } from '../lib/dietTarget'
import { composeMeals } from '../lib/mealComposer'
import { SUITABILITY } from '../lib/doshaSemantics'
import useImpression from '../hooks/useImpression'
import { track, EVENTS } from '../lib/track'
import CardCarousel from './CardCarousel'
import MealMiniCard from './MealMiniCard'

const RAIL_COUNT = 4   // a handful is plenty on Home; the full set lives in /meals

export default function NourishRail({ className = '' }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const { isPremium } = useIsPremium()
  const vikriti = useVikritiSignal()
  const { prefs: dietPrefs } = useDietPrefs()

  const target = useMemo(() => resolveDietTarget({ vikriti, profile }), [vikriti, profile])

  const result = useMemo(() => composeMeals({
    userId:      user?.id,
    targetDosha: target.dosha,
    doshaSource: target.source,
    season:      target.season,
    dietPrefs,
    count:       RAIL_COUNT,
  }), [user?.id, target.dosha, target.source, target.season, dietPrefs])

  const ideas = result.ideas
  // Impression on the section, keyed by slot so a slot change re-logs.
  const ref = useImpression({
    surface:     'home_nourish_rail',
    contentType: 'meal_rail',
    contentId:   result.slot || 'none',
  })

  if (ideas.length === 0) return null

  // Free users get a taste — a couple of ideas and a Plus tile — so the rail is
  // a hook, not the whole list. Plus members get the full swipeable set.
  const FREE_VISIBLE = 2
  const shown = isPremium ? ideas : ideas.slice(0, FREE_VISIBLE)
  const hasMore = isPremium || ideas.length > shown.length

  const goMeals = () => {
    track(EVENTS.CTA_CLICKED, { cta_id: 'nourish_view_all', route_name: 'home', slot: result.slot, is_premium: isPremium })
    navigate('/meals')
  }
  const tapMeal = (idea) => {
    track(EVENTS.MEAL_IDEA_TAPPED, {
      meal_id: idea.id, target_dosha: target.dosha, source: 'home_nourish_rail', is_premium: isPremium,
    })
    navigate(`/meal/${idea.id}`)
  }

  return (
    <div ref={ref} className={className}>
      <CardCarousel
        label={t(`meals.heading.${result.slot}`)}
        action={{ label: t('home.nourish.viewAll'), onClick: goMeals }}
        ariaLabel={t(`meals.heading.${result.slot}`)}
      >
        {shown.map((idea) => (
          <MealMiniCard
            key={idea.id}
            meal={idea}
            fitLabel={target.dosha && idea.suitability === SUITABILITY.BALANCING
              ? t('meals.balances', { dosha: t(`diet.dosha.${target.dosha}`) })
              : null}
            onTap={() => tapMeal(idea)}
          />
        ))}
        {/* Trailing tile → the full meal guidance. For Plus it's a neutral "more
            ideas"; for free it's the Plus unlock, since the rail was capped. */}
        {hasMore && (
          <button
            type="button"
            onClick={goMeals}
            className={`w-32 h-full min-h-[124px] rounded-2xl border border-dashed flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform ${
              isPremium ? 'border-outline-variant text-on-surface-variant' : 'border-plus/50 text-plus'
            }`}
          >
            <span aria-hidden="true" className={`material-symbols-outlined text-2xl ${isPremium ? 'text-primary' : 'text-plus'}`}>
              {isPremium ? 'grid_view' : 'lock'}
            </span>
            <span className="font-body text-[12px] font-medium text-center leading-tight px-1">
              {isPremium ? t('home.nourish.moreIdeas') : t('home.nourish.unlockAll')}
            </span>
          </button>
        )}
      </CardCarousel>
    </div>
  )
}
