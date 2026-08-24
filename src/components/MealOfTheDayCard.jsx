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

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useIsPremium } from '../hooks/useIsPremium'
import { useVikritiSignal } from '../hooks/useVikritiSignal'
import { useDietPrefs } from '../hooks/useDietPrefs'
import { resolveDietTarget } from '../lib/dietTarget'
import { composeMeals } from '../lib/mealComposer'
import { SUITABILITY } from '../lib/doshaSemantics'
import { mealVisual } from '../lib/mealVisual'
import useImpression from '../hooks/useImpression'
import { track, EVENTS } from '../lib/track'

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
  const [imgFailed, setImgFailed] = useState(false)

  if (!idea) return null

  const vis = mealVisual(idea)
  const balances = target.dosha && idea.suitability === SUITABILITY.BALANCING
  const showImage = idea.image && !imgFailed

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
        navigate(`/meal/${idea.id}`)
      }}
      className="group w-full text-left rounded-3xl overflow-hidden bg-surface-container-low border border-outline-variant/40 shadow-sm stagger-4 active:scale-[0.99] transition-transform"
    >
      {/* ── Visual header — the "photo", same language as /meals. ────────── */}
      <div className="relative h-28 w-full overflow-hidden">
        {showImage ? (
          <img
            src={idea.image}
            alt=""
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full flex items-center justify-center"
            style={{ backgroundImage: `linear-gradient(135deg, ${vis.from} 0%, ${vis.to} 100%)` }}
          >
            <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 100% at 50% -20%, rgba(255,255,255,0.45), transparent 60%)' }} />
            <span className="material-symbols-outlined relative text-[46px]" style={{ color: vis.ink, opacity: 0.72 }}>
              {vis.icon}
            </span>
          </div>
        )}

        {/* Slot label — this is the Home nudge, so it names the occasion.
            Opaque (not translucent) so it stays legible over any image. */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-surface-container-low pl-1.5 pr-2.5 py-1 shadow-md">
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-[15px]">restaurant_menu</span>
          <span className="font-label text-[10px] uppercase tracking-wide text-on-surface-variant">
            {t(`meals.heading.${result.slot}`)}
          </span>
        </span>

        {/* Personalization cue — always present so the card reads as "chosen
            for you". Upgrades to the specific "Balances X" when the dish is a
            clear win for the user's current dosha. */}
        {balances ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-surface-container-low pl-1.5 pr-2.5 py-1 shadow-md">
            <span aria-hidden="true" className="material-symbols-outlined text-pine text-[15px]">spa</span>
            <span className="font-label text-[10px] uppercase tracking-wide text-pine">
              {t('meals.balances', { dosha: t(`diet.dosha.${target.dosha}`) })}
            </span>
          </span>
        ) : (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-surface-container-low pl-1.5 pr-2.5 py-1 shadow-md">
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-[15px]">favorite</span>
            <span className="font-label text-[10px] uppercase tracking-wide text-primary">
              {t('meals.forYou')}
            </span>
          </span>
        )}
      </div>

      {/* ── Body — name + the see-more (or Plus) affordance. ──────────────── */}
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-body text-[17px] font-semibold text-on-surface leading-tight">{idea.name}</p>
          <p className={`font-body text-xs mt-1 flex items-center gap-1 ${isPremium ? 'text-on-surface-variant/70' : 'text-plus font-medium'}`}>
            {!isPremium && <span aria-hidden="true" className="material-symbols-outlined text-sm">auto_awesome</span>}
            {isPremium ? t('meals.card.seeMore') : t('meals.card.seeMorePlus')}
          </p>
        </div>
        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-xl flex-shrink-0 group-active:translate-x-0.5 transition-transform">
          chevron_right
        </span>
      </div>
    </button>
  )
}
