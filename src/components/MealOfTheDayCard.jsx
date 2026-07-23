// ─────────────────────────────────────────────────────────────────────────────
//  MealOfTheDayCard — the Home nudge for the diet feature
//
//  One idea, from the same composer as /meals, stable for the whole slot.
//
//  IT RENDERS NOTHING RATHER THAN RENDERING EMPTY.
//  Home is the app's most-seen screen and every card on it costs attention. A
//  "no meal ideas available" card would be a permanent apology occupying prime
//  space, so when the composer has nothing — templates unreviewed, or the
//  user's own restrictions filtered everything — this returns null and Home is
//  simply one card shorter. The honest empty states live on /meals, where the
//  user went specifically to ask.
//
//  FREE USERS SEE THE DISH NAME, NOT NOTHING.
//  The name and its dosha fit are the hook; the full list, the why, the
//  preparation and the alternatives are Plus. Showing a locked card with no
//  content asks the user to buy an unknown, which converts badly and reads as
//  a tease. Showing one real answer and stopping is a fair trade.
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

const STYLE = {
  [SUITABILITY.BALANCING]: { icon: 'trending_down', tint: 'text-pine' },
  [SUITABILITY.NEUTRAL]:   { icon: 'remove',        tint: 'text-on-surface-variant' },
  [SUITABILITY.CAUTION]:   { icon: 'trending_up',   tint: 'text-clay' },
}

export default function MealOfTheDayCard() {
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
    count:       1,
  }), [user?.id, target.dosha, target.source, target.season, dietPrefs])

  const idea = result.ideas[0] || null

  // Hook order must not depend on `idea`, so the impression ref is created
  // unconditionally and simply goes unused when we render nothing.
  const ref = useImpression({
    surface:     'home_meal_of_day',
    contentType: 'meal',
    contentId:   idea?.id || 'none',
  })

  if (!idea) return null

  const style = STYLE[idea.suitability]

  return (
    <button
      ref={ref}
      onClick={() => {
        track(EVENTS.MEAL_IDEA_TAPPED, {
          meal_id:      idea.id,
          target_dosha: target.dosha,
          source:       'home_meal_of_day',
          is_premium:   isPremium,
        })
        navigate('/meals')
      }}
      className="w-full text-left bg-surface-container-low rounded-2xl p-5 stagger-4 active:scale-[0.98] transition-all"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">restaurant_menu</span>
        <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest">
          {t(`meals.heading.${result.slot}`)}
        </span>
      </div>

      <p className="font-body text-base font-semibold text-on-surface mt-2">{idea.name}</p>

      {/* The verdict shown with its inputs, exactly as on /meals — a derived
          conclusion that hides its derivation reads as an asserted one. */}
      {target.dosha && idea.contributions.length > 0 && (
        <p className={`font-body text-xs mt-1.5 flex items-start gap-1.5 ${style.tint}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-sm flex-shrink-0">{style.icon}</span>
          <span>
            {t(`meals.verdict.${idea.suitability}`, { dosha: t(`diet.dosha.${target.dosha}`) })}
            {' — '}
            {idea.contributions.map((c) => c.name).join(', ')}
          </span>
        </p>
      )}

      <p className="font-body text-xs text-on-surface-variant/70 mt-2.5 flex items-center gap-1">
        {isPremium ? t('meals.card.seeMore') : t('meals.card.seeMorePlus')}
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
      </p>
    </button>
  )
}
