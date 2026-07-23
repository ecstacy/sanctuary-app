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
import { composeMeals } from '../lib/mealComposer'
import { SUITABILITY } from '../lib/doshaSemantics'
import { DIET_DISCLAIMER } from '../lib/dietSafety'
import PaywallSheet from '../components/PaywallSheet'
import MedicalDisclaimer from '../components/MedicalDisclaimer'
import useScrollDepth from '../hooks/useScrollDepth'
import { track, EVENTS } from '../lib/track'

const SUITABILITY_STYLE = {
  [SUITABILITY.BALANCING]: { icon: 'trending_down', tint: 'text-pine' },
  [SUITABILITY.NEUTRAL]:   { icon: 'remove',        tint: 'text-on-surface-variant' },
  [SUITABILITY.CAUTION]:   { icon: 'trending_up',   tint: 'text-clay' },
}

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
          className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center"
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
          className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center"
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

        {/* ── Ideas ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 mt-5">
          {result.ideas.map((idea) => {
            const style = SUITABILITY_STYLE[idea.suitability]
            return (
              <button
                key={idea.id}
                onClick={() => {
                  track(EVENTS.MEAL_IDEA_TAPPED, { meal_id: idea.id, target_dosha: target.dosha })
                  navigate(`/ingredient/${idea.core[0].id}`)
                }}
                className="bg-surface-container-low rounded-2xl p-4 text-left active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-body text-base font-semibold text-on-surface">{idea.name}</p>
                  {/* A component, not a full meal — said rather than implied. */}
                  {idea.kind === 'preparation' && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label text-[8px] uppercase tracking-wide text-on-surface-variant">
                      {t('meals.kind.preparation')}
                    </span>
                  )}
                </div>

                {/* Verdict shown WITH its inputs — a derived conclusion that
                    hides its derivation looks exactly like an asserted one. */}
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

                <p className="font-body text-xs text-on-surface-variant mt-2">
                  {idea.core.map((c) => c.name).join(' · ')}
                  {idea.optional.length > 0 && (
                    <span className="text-on-surface-variant/60">
                      {' + '}{idea.optional.map((o) => o.name).join(', ')}
                    </span>
                  )}
                </p>

                {idea.prep && (
                  <p className="font-body text-xs text-on-surface-variant/70 mt-2 leading-relaxed">{idea.prep}</p>
                )}

                {/* Traditional companions. Never presented as required — the
                    rule that every spice stays optional is the whole reason
                    this field exists rather than a core-ingredient exception. */}
                {idea.balancedBy.length > 0 && (
                  <p className="font-body text-xs text-on-surface-variant/70 mt-2 leading-relaxed">
                    {t('meals.balancedBy', { list: idea.balancedBy.map((b) => b.name).join(', ') })}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {idea.isDerived && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label text-[8px] uppercase tracking-wide text-on-surface-variant">
                      {t('diet.confidence.medium')}
                    </span>
                  )}
                  {idea.citations.map((v) => (
                    <span key={v} className="px-2 py-0.5 rounded-full bg-primary-container font-label text-[8px] uppercase tracking-wide text-on-primary-container">
                      {v}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
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
