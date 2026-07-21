// ─────────────────────────────────────────────────────────────────────────────
//  IngredientDetailPage — one food, its classical properties, and what it
//  means for THIS user.
//
//  Everything on this page is read from the curated dataset via
//  lib/ingredients.js. Nothing is generated, and the accessors only ever
//  return `reviewStatus: 'reviewed'` rows — so an unreviewed food renders the
//  coverage-miss state, exactly as an unknown one does. That is the whole
//  anti-hallucination design (diet-feature-plan.md §2) reaching the screen.
//
//  Three things are deliberately non-negotiable in this layout:
//    • The CONFIDENCE badge sits next to the guidance, not buried at the
//      bottom. "Derived, not classically cited" is only useful where the claim
//      it qualifies is being read.
//    • An EXCLUSION (allergen / dietary pattern) outranks the dosha verdict
//      visually. Telling someone their allergen is "not ideal for your dosha"
//      would be a dangerous understatement.
//    • Dosha effects go through `suitabilityFor`, never raw numbers — foods
//      and asanas use opposite sign conventions. See doshaSemantics.js.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { getIngredient, describeForUser, suitabilityFor } from '../lib/ingredients'
import { SUITABILITY } from '../lib/doshaSemantics'
import { resolveDietTarget, shouldExplainTarget } from '../lib/dietTarget'
import { useVikritiSignal } from '../hooks/useVikritiSignal'
import { DIET_DISCLAIMER } from '../lib/dietSafety'
import MedicalDisclaimer from '../components/MedicalDisclaimer'
import { track, EVENTS } from '../lib/track'
import useScrollDepth from '../hooks/useScrollDepth'

const DOSHAS = ['vata', 'pitta', 'kapha']

const DOSHA_INFO = {
  vata:  { label: 'Vata',  icon: 'air' },
  pitta: { label: 'Pitta', icon: 'local_fire_department' },
  kapha: { label: 'Kapha', icon: 'water_drop' },
}

// Suitability → visual treatment. Balancing and caution must be
// distinguishable without relying on colour alone (WCAG 1.4.1), so each
// carries an icon and a text label as well as a tint.
const SUITABILITY_STYLE = {
  [SUITABILITY.BALANCING]: { icon: 'trending_down', tint: 'bg-[#6b8f5e]/12 text-[#4e6b45]' },
  [SUITABILITY.NEUTRAL]:   { icon: 'remove',        tint: 'bg-surface-container-high text-on-surface-variant' },
  [SUITABILITY.CAUTION]:   { icon: 'trending_up',   tint: 'bg-[#c47a3a]/12 text-[#96551f]' },
}

function Section({ title, children }) {
  return (
    <section className="mt-6">
      <h2 className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-2">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function IngredientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { profile } = useAuth()
  const vikriti = useVikritiSignal()
  useScrollDepth('ingredient_detail')

  const ingredient = getIngredient(id)

  const target = useMemo(
    () => resolveDietTarget({ vikriti, profile }),
    [vikriti, profile],
  )

  const view = useMemo(
    () => describeForUser(ingredient, target.dosha, profile?.diet_prefs || {}),
    [ingredient, target.dosha, profile],
  )

  // Property names follow analytics-events.md §5.14 exactly — the doc is the
  // contract the dashboards are built against.
  useEffect(() => {
    if (!ingredient || !view) return
    track(EVENTS.INGREDIENT_VIEWED, {
      ingredient_id:   ingredient.id,
      confidence:      ingredient.confidence,
      category:        ingredient.category,
      suitability:     view.suitability,
      target_dosha:    target.dosha,
      dosha_source:    target.source,
      excluded_reason: view.exclusion.reason,
    })
  }, [ingredient, view, target.dosha, target.source])

  // ── Coverage miss ───────────────────────────────────────────────────────
  // An unknown id and an unreviewed one land here identically, by design.
  if (!ingredient) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body pb-20 px-6 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center mb-6"
          aria-label={t('common.back')}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">arrow_back</span>
        </button>
        <div className="bg-surface-container-low rounded-2xl p-5">
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-3xl">search_off</span>
          <h1 className="font-headline text-xl text-on-surface mt-2">{t('diet.miss.title')}</h1>
          <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">
            {t('diet.miss.body')}
          </p>
        </div>
      </div>
    )
  }

  const explain = shouldExplainTarget(target, profile)
  const excluded = view.exclusion.excluded

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

        <h1 className="font-headline text-3xl text-on-surface mt-4">{ingredient.name}</h1>
        {ingredient.sanskrit && (
          <p className="font-body text-sm text-on-surface-variant/70 mt-0.5">
            {ingredient.sanskrit}
            {ingredient.devanagari ? ` · ${ingredient.devanagari}` : ''}
          </p>
        )}

        {/* ── Exclusion banner ──────────────────────────────────────────────
            First thing after the name when it applies. An allergy is a safety
            constraint, not a preference, so it is worded differently from a
            dietary pattern and never softened into dosha language. */}
        {excluded && (
          <div
            role="alert"
            className={`mt-4 rounded-2xl p-4 flex gap-3 ${
              view.exclusion.reason === 'allergen'
                ? 'bg-error-container/60 text-on-error-container'
                : 'bg-surface-container-high text-on-surface'
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-xl flex-shrink-0">
              {view.exclusion.reason === 'allergen' ? 'warning' : 'block'}
            </span>
            <p className="font-body text-sm leading-relaxed">
              {view.exclusion.reason === 'allergen'
                ? t('diet.excluded.allergen', { key: t(`diet.allergens.${view.exclusion.key}`, view.exclusion.key) })
                /* halal/kosher get their own wording: we cannot certify
                   anything, so the message must say we can't confirm it —
                   never imply we checked and approved. */
                : ['halal', 'kosher'].includes(view.exclusion.key)
                  ? t('diet.excluded.uncertified', { key: t(`diet.patterns.${view.exclusion.key}`, view.exclusion.key) })
                  : t('diet.excluded.pattern',     { key: t(`diet.patterns.${view.exclusion.key}`, view.exclusion.key) })}
            </p>
          </div>
        )}

        {/* ── Dosha effect ─────────────────────────────────────────────────*/}
        <Section title={t('diet.doshaEffect')}>
          <div className="flex gap-2">
            {DOSHAS.map((d) => {
              const s = suitabilityFor(ingredient, d)
              const style = SUITABILITY_STYLE[s]
              const isTarget = target.dosha === d
              return (
                <div
                  key={d}
                  className={`flex-1 rounded-2xl p-3 ${style.tint} ${
                    isTarget ? 'ring-2 ring-primary/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">{DOSHA_INFO[d].icon}</span>
                    <span className="font-label text-[10px] uppercase tracking-wide">{DOSHA_INFO[d].label}</span>
                  </div>
                  {/* Icon + word, never colour alone. */}
                  <div className="flex items-center gap-1 mt-1">
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">{style.icon}</span>
                    <span className="font-body text-xs">{t(`diet.suitability.${s}`)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {target.dosha ? (
            <p className="font-body text-xs text-on-surface-variant mt-2.5 leading-relaxed">
              {explain
                ? t('diet.targetExplained', {
                    prakriti: t(`diet.dosha.${String(profile?.dosha_details?.primary || profile?.dosha).toLowerCase()}`),
                    vikriti:  t(`diet.dosha.${target.dosha}`),
                  })
                : t('diet.targetSimple', { dosha: t(`diet.dosha.${target.dosha}`) })}
            </p>
          ) : (
            <p className="font-body text-xs text-on-surface-variant/70 mt-2.5 leading-relaxed">
              {t('diet.noTarget')}
            </p>
          )}
        </Section>

        {/* ── Why ──────────────────────────────────────────────────────────*/}
        {(ingredient.whyFavor || ingredient.whyAvoid) && (
          <Section title={t('diet.why')}>
            <div className="flex flex-col gap-2">
              {ingredient.whyFavor && (
                <p className="font-body text-sm text-on-surface leading-relaxed bg-surface-container-low rounded-2xl p-4">
                  {ingredient.whyFavor}
                </p>
              )}
              {ingredient.whyAvoid && (
                <p className="font-body text-sm text-on-surface leading-relaxed bg-surface-container-low rounded-2xl p-4">
                  {ingredient.whyAvoid}
                </p>
              )}
            </div>
          </Section>
        )}

        {/* ── Classical properties ─────────────────────────────────────────*/}
        <Section title={t('diet.properties')}>
          <dl className="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-2.5">
            <Prop label={t('diet.rasa')} value={ingredient.rasa.map((r) => t(`diet.tastes.${r}`)).join(' · ')} />
            <Prop label={t('diet.virya')} value={t(`diet.viryas.${ingredient.virya}`)} />
            <Prop label={t('diet.vipaka')} value={t(`diet.tastes.${ingredient.vipaka}`)} />
            <Prop label={t('diet.guna')} value={ingredient.guna.map((g) => t(`diet.gunas.${g}`, g.replace(/_/g, ' '))).join(' · ')} />
          </dl>
        </Section>

        {/* ── Preparation / timing ─────────────────────────────────────────*/}
        {ingredient.preparation && (
          <Section title={t('diet.preparation')}>
            <p className="font-body text-sm text-on-surface leading-relaxed bg-surface-container-low rounded-2xl p-4">
              {ingredient.preparation}
            </p>
          </Section>
        )}

        {(ingredient.bestTime?.length || ingredient.bestSeason?.length) && (
          <Section title={t('diet.bestEnjoyed')}>
            <div className="flex flex-wrap gap-2">
              {(ingredient.bestTime || []).map((x) => (
                <Chip key={x} icon="schedule" label={t(`diet.times.${x}`)} />
              ))}
              {(ingredient.bestSeason || []).map((x) => (
                <Chip key={x} icon="eco" label={t(`diet.seasons.${x}`)} />
              ))}
            </div>
          </Section>
        )}

        {/* ── Combinations to avoid ────────────────────────────────────────*/}
        {ingredient.combosToAvoid?.length > 0 && (
          <Section title={t('diet.combosToAvoid')}>
            <ul className="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-1.5">
              {ingredient.combosToAvoid.map((c) => (
                <li key={c} className="font-body text-sm text-on-surface flex gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm text-on-surface-variant/50">close</span>
                  {c}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── Cautions ─────────────────────────────────────────────────────
            Flags, never diagnoses. `cautionNote` exists precisely so we can
            say whether a flag is a classical contraindication or a practical,
            symptom-based caution — conflating them overstates the tradition. */}
        {(ingredient.cautions?.length || ingredient.cautionNote) && (
          <Section title={t('diet.cautions')}>
            <div className="bg-surface-container-low rounded-2xl p-4">
              {ingredient.cautions?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ingredient.cautions.map((c) => (
                    <span key={c} className="px-2.5 py-1 rounded-full bg-surface-container-high font-label text-[10px] uppercase tracking-wide text-on-surface-variant">
                      {t(`diet.cautionFlags.${c}`, c.replace(/_/g, ' '))}
                    </span>
                  ))}
                </div>
              )}
              {ingredient.cautionNote && (
                <p className="font-body text-xs text-on-surface-variant leading-relaxed mt-2.5">
                  {ingredient.cautionNote}
                </p>
              )}
            </div>
          </Section>
        )}

        {/* ── Provenance ───────────────────────────────────────────────────
            The confidence badge is the honest core of the feature: it tells
            the user whether they are reading an attested classical fact or our
            property-based derivation. */}
        <Section title={t('diet.source')}>
          <div className="bg-surface-container-low rounded-2xl p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-1 rounded-full font-label text-[10px] uppercase tracking-wide ${
                  view.isDerived ? 'bg-surface-container-high text-on-surface-variant' : 'bg-primary-fixed text-primary'
                }`}
              >
                {view.isDerived ? t('diet.confidence.medium') : t('diet.confidence.high')}
              </span>
              <span className="font-body text-xs text-on-surface-variant">
                {ingredient.source.text === 'CS'
                  ? t('diet.citedAs', { verse: ingredient.source.verse })
                  : t('diet.derived')}
              </span>
            </div>
            {ingredient.source.note && (
              <p className="font-body text-xs text-on-surface-variant/80 leading-relaxed mt-2.5">
                {ingredient.source.note}
              </p>
            )}
          </div>
        </Section>

        <p className="font-body text-[11px] text-on-surface-variant/60 leading-relaxed mt-6">
          {DIET_DISCLAIMER}
        </p>
        <MedicalDisclaimer variant="inline" className="mt-2" />
      </div>
    </div>
  )
}

function Prop({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="font-label text-[10px] text-on-surface-variant/60 uppercase tracking-wide flex-shrink-0">{label}</dt>
      <dd className="font-body text-sm text-on-surface text-right">{value}</dd>
    </div>
  )
}

function Chip({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low">
      <span aria-hidden="true" className="material-symbols-outlined text-sm text-on-surface-variant/50">{icon}</span>
      <span className="font-body text-xs text-on-surface">{label}</span>
    </span>
  )
}
