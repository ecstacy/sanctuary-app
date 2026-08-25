// ─────────────────────────────────────────────────────────────────────────────
//  MealGuidancePage — "what should I eat right now" (Plus)
//
//  Renders whatever lib/mealComposer.js returns and nothing else. The page has
//  no opinions of its own: it does not re-derive a dosha verdict, does not
//  re-apply the safety filter, and does not fill an empty result.
//
//  THE EMPTY STATES ARE THE IMPORTANT PART OF THIS SCREEN.
//  There are three, and collapsing them into one "nothing here" would hide the
//  only information the user can act on:
//    • unreviewed  — our content isn't signed off yet. Our problem, not theirs.
//    • filtered    — we had ideas; their own allergens removed all of them.
//                    Points at the preferences screen.
//    • no target   — we can suggest, but not personalise. Points at the quiz.
//
//  Each idea shows its verdict WITH its inputs ("settles Vata: ghee, rice"),
//  because a derived conclusion that hides its derivation is indistinguishable
//  from an asserted one.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useIsPremium } from '../hooks/useIsPremium'
import { useVikritiSignal } from '../hooks/useVikritiSignal'
import { useDietPrefs } from '../hooks/useDietPrefs'
import { resolveDietTarget, shouldExplainTarget } from '../lib/dietTarget'
import { composeMeals, deriveMealById } from '../lib/mealComposer'
import { useMealFavourites } from '../hooks/useMealFavourites'
import { mealVisual } from '../lib/mealVisual'
import { DIET_DISCLAIMER } from '../lib/dietSafety'
import MealIdeaCard from '../components/MealIdeaCard'
import PaywallSheet from '../components/PaywallSheet'
import MedicalDisclaimer from '../components/MedicalDisclaimer'
import useScrollDepth from '../hooks/useScrollDepth'
import { track, EVENTS } from '../lib/track'

function EmptyState({ icon, title, body, ctaLabel, onCta }) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-5 mt-5" role="status">
      <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-3xl">{icon}</span>
      <p className="font-body text-sm font-semibold text-on-surface mt-2">{title}</p>
      <p className="font-body text-xs text-on-surface-variant mt-1.5 leading-relaxed">{body}</p>
      {ctaLabel && (
        <button
          onClick={onCta}
          className="mt-3 px-4 py-2.5 rounded-full bg-primary text-on-primary font-body text-sm active:scale-95 transition-all"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}

export default function MealGuidancePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const { isPremium } = useIsPremium()
  const vikriti = useVikritiSignal()
  const { prefs: dietPrefs } = useDietPrefs()
  const [paywallOpen, setPaywallOpen] = useState(!isPremium)
  useScrollDepth('meal_guidance')

  const target = useMemo(
    () => resolveDietTarget({ vikriti, profile }),
    [vikriti, profile],
  )

  const result = useMemo(() => composeMeals({
    userId:      user?.id,
    targetDosha: target.dosha,
    doshaSource: target.source,
    season:      target.season,
    dietPrefs,
  }), [user?.id, target.dosha, target.source, target.season, dietPrefs])

  // Favourited meals, resolved against the current target so their verdict is
  // right too. Only those that still resolve (reviewed) are shown.
  const { favourites } = useMealFavourites()
  const favMeals = useMemo(
    () => favourites.map((id) => deriveMealById(id, { targetDosha: target.dosha, dietPrefs })).filter(Boolean),
    [favourites, target.dosha, dietPrefs],
  )

  useEffect(() => {
    if (!isPremium) return
    track(EVENTS.MEAL_COMPOSED, {
      slot:          result.slot,
      idea_count:    result.ideas.length,
      target_dosha:  target.dosha,
      dosha_source:  target.source,
      // Counts only — never which allergens. See analytics-events.md §5.14.
      filtered_out:  result.coverage.filteredOut,
      gated_out:     result.coverage.gatedOut,
    })
  }, [isPremium, result, target.dosha, target.source])

  // ── Plus gate ──────────────────────────────────────────────────────────
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body pb-24 px-6 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center"
          aria-label={t('common.back')}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">arrow_back</span>
        </button>
        <h1 className="font-headline text-3xl text-on-surface mt-4">{t('meals.title')}</h1>
        <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">{t('meals.plusPitch')}</p>
        <PaywallSheet
          open={paywallOpen}
          onClose={() => { setPaywallOpen(false); navigate(-1) }}
          surface="diet_planner"
          headline={t('meals.paywallHeadline')}
          subhead={t('meals.paywallSubhead')}
        />
      </div>
    )
  }

  const { coverage } = result
  const explain = shouldExplainTarget(target, profile)

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-24">
      <div className="px-6 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center"
          aria-label={t('common.back')}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">arrow_back</span>
        </button>

        <h1 className="font-headline text-3xl text-on-surface mt-4">{t(`meals.heading.${result.slot}`)}</h1>

        {target.dosha ? (
          <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">
            {explain
              ? t('diet.targetExplained', {
                  prakriti: t(`diet.dosha.${String(profile?.dosha_details?.primary || profile?.dosha).toLowerCase()}`),
                  vikriti:  t(`diet.dosha.${target.dosha}`),
                })
              : t('meals.forDosha', { dosha: t(`diet.dosha.${target.dosha}`) })}
          </p>
        ) : target.source === 'balanced' ? (
          <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">{t('meals.balancedTarget')}</p>
        ) : (
          <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">{t('meals.noTarget')}</p>
        )}

        {/* ── Empty states, kept distinct ───────────────────────────────── */}
        {result.ideas.length === 0 && coverage.emptyBecauseFiltered && (
          <EmptyState
            icon="filter_alt_off"
            title={t('meals.empty.filtered.title')}
            body={t('meals.empty.filtered.body')}
            ctaLabel={t('meals.empty.filtered.cta')}
            onCta={() => navigate('/diet-preferences')}
          />
        )}
        {result.ideas.length === 0 && !coverage.emptyBecauseFiltered && (
          <EmptyState
            icon="hourglass_empty"
            title={t('meals.empty.unreviewed.title')}
            body={t('meals.empty.unreviewed.body')}
          />
        )}

        {/* ── Your favourites — the loop closure for meals you keep. ──────── */}
        {favMeals.length > 0 && (
          <div className="mt-6">
            <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-2 px-1">{t('meals.yourFavourites')}</p>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-6 px-6 snap-x">
              {favMeals.map((m) => {
                const fv = mealVisual(m)
                return (
                  <button
                    key={m.id}
                    onClick={() => { track(EVENTS.MEAL_IDEA_TAPPED, { meal_id: m.id, target_dosha: target.dosha, source: 'favourites' }); navigate(`/meal/${m.id}`) }}
                    className="flex-shrink-0 w-28 snap-start text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="relative h-24 w-full rounded-2xl overflow-hidden">
                      {m.image ? (
                        <img src={m.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div aria-hidden="true" className="h-full w-full flex items-center justify-center" style={{ backgroundImage: `linear-gradient(135deg, ${fv.from} 0%, ${fv.to} 100%)` }}>
                          <span className="material-symbols-outlined text-[30px]" style={{ color: fv.ink, opacity: 0.72 }}>{fv.icon}</span>
                        </div>
                      )}
                      <span aria-hidden="true" className="material-symbols-outlined absolute top-1.5 right-1.5 text-clay text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </div>
                    <p className="font-body text-[12px] text-on-surface mt-1.5 leading-tight line-clamp-2">{m.name}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Ideas ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 mt-5">
          {result.ideas.map((idea) => (
            <MealIdeaCard
              key={idea.id}
              idea={idea}
              targetDosha={target.dosha}
              doshaLabel={target.dosha ? t(`diet.dosha.${target.dosha}`) : ''}
              t={t}
              onTap={() => {
                track(EVENTS.MEAL_IDEA_TAPPED, { meal_id: idea.id, target_dosha: target.dosha })
                navigate(`/meal/${idea.id}`)
              }}
            />
          ))}
        </div>

        {/* Ideas, not recipes — said plainly rather than left to be inferred. */}
        {result.ideas.length > 0 && (
          <p className="font-body text-[11px] text-on-surface-variant/60 leading-relaxed mt-5">
            {t('meals.notRecipes')}
          </p>
        )}

        <p className="font-body text-[11px] text-on-surface-variant/60 leading-relaxed mt-3">
          {DIET_DISCLAIMER}
        </p>
        <MedicalDisclaimer variant="inline" className="mt-2" />
      </div>
    </div>
  )
}
