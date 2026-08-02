// ─────────────────────────────────────────────────────────────────────────────
//  IngredientDetailPage — what this food means FOR YOU
//
//  Everything here is read from the curated dataset via lib/ingredients.js.
//  Nothing is generated, and the accessors only return `reviewStatus:
//  'reviewed'` rows — so an unreviewed food renders the coverage-miss state
//  exactly as an unknown one does. That is the anti-hallucination design
//  (diet-feature-plan.md §2) reaching the screen.
//
//  ── THE PAGE ANSWERS BEFORE IT EXPLAINS ────────────────────────────────────
//  The first version led with a three-dosha chip row and a properties table,
//  which made it read as an encyclopaedia entry that happened to know your
//  dosha. The order is now:
//
//      1. FOR YOU   — the verdict, in a sentence, and why
//      2. IN PRACTICE — when to eat it, how to prepare it, what to pair it with
//      3. REFERENCE — all three doshas, classical properties, provenance
//
//  Reference material is still there in full: it is what makes the app
//  trustworthy, and hiding it would be its own kind of dishonesty. But a user
//  arrives asking "should I eat this?", and that question is now answered
//  above the fold rather than assembled by the reader from a chip row.
//
//  ── LEGIBILITY ─────────────────────────────────────────────────────────────
//  Body copy is 15px/relaxed rather than 13px, and section labels are 11px at
//  full variant colour rather than 9px at 50% opacity. The old labels were
//  decorative — technically present, practically unreadable.
//
//  Three things stay non-negotiable:
//    • An EXCLUSION (allergen / pattern) outranks everything, including the
//      personal verdict. Telling someone their allergen is "not ideal for your
//      dosha" would be a dangerous understatement.
//    • The CONFIDENCE badge sits with the guidance it qualifies.
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
import FoodIcon from '../components/FoodIcon'
import { track, EVENTS } from '../lib/track'
import useScrollDepth from '../hooks/useScrollDepth'

const DOSHAS = ['vata', 'pitta', 'kapha']
const DOSHA_ICON = { vata: 'air', pitta: 'local_fire_department', kapha: 'water_drop' }

// Suitability → visual treatment. Never colour alone (WCAG 1.4.1): each
// carries an icon and a word as well as a tint.
const VERDICT = {
  [SUITABILITY.BALANCING]: {
    icon: 'check_circle',
    card: 'bg-pine/[0.10] border-pine/25',
    text: 'text-pine',
  },
  [SUITABILITY.NEUTRAL]: {
    icon: 'remove_circle_outline',
    card: 'bg-surface-container-high border-outline-variant/20',
    text: 'text-on-surface-variant',
  },
  [SUITABILITY.CAUTION]: {
    icon: 'error_outline',
    card: 'bg-clay/[0.10] border-clay/25',
    text: 'text-clay',
  },
}

/** Section heading. 11px at full colour — the old 9px/50% was unreadable. */
function Section({ title, children, className = '' }) {
  return (
    <section className={`mt-8 ${className}`}>
      <h2 className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-2.5">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface-container-low rounded-2xl p-4 ${className}`}>{children}</div>
  )
}

function Chip({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-full bg-surface-container-low">
      <span aria-hidden="true" className="material-symbols-outlined text-base text-on-surface-variant/60">{icon}</span>
      <span className="font-body text-sm text-on-surface">{label}</span>
    </span>
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
          className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center mb-6"
          aria-label={t('common.back')}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">arrow_back</span>
        </button>
        <Card className="p-5">
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-3xl">search_off</span>
          <h1 className="font-headline text-xl text-on-surface mt-2">{t('diet.miss.title')}</h1>
          <p className="font-body text-[15px] text-on-surface-variant mt-2 leading-relaxed">
            {t('diet.miss.body')}
          </p>
        </Card>
      </div>
    )
  }

  const explain   = shouldExplainTarget(target, profile)
  const excluded  = view.exclusion.excluded
  const verdict   = VERDICT[view.suitability] || VERDICT[SUITABILITY.NEUTRAL]
  const doshaName = target.dosha ? t(`diet.dosha.${target.dosha}`) : null

  // Which of the two prose fields actually answers THIS user's question. A
  // balancing verdict leads with why to favour it; a caution leads with why
  // not. Showing both in the old undifferentiated grey pair left the reader to
  // work out which half applied to them.
  const leadWhy = view.suitability === SUITABILITY.CAUTION
    ? (ingredient.whyAvoid || ingredient.whyFavor)
    : (ingredient.whyFavor || ingredient.whyAvoid)
  const otherWhy = leadWhy === ingredient.whyFavor ? ingredient.whyAvoid : ingredient.whyFavor

  const hasPractice = ingredient.bestTime?.length || ingredient.bestSeason?.length
    || ingredient.preparation || ingredient.balancedBy?.length
    || ingredient.combosToAvoid?.length || ingredient.cautions?.length || ingredient.cautionNote

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

        {/* ── Title ───────────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 mt-5">
          <span className="text-primary flex-shrink-0 mt-1"><FoodIcon ingredient={ingredient} size={34} /></span>
          <div className="min-w-0">
            <h1 className="font-headline text-3xl text-on-surface leading-tight">{ingredient.name}</h1>
            {ingredient.sanskrit && (
              <p className="font-body text-sm text-on-surface-variant mt-1">
                {ingredient.sanskrit}
                {ingredient.devanagari ? ` · ${ingredient.devanagari}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* ── Exclusion ───────────────────────────────────────────────────
            Outranks the personal verdict: an allergy is a safety constraint,
            not a dosha preference, and is never softened into dosha language. */}
        {excluded && (
          <div
            role="alert"
            className={`mt-5 rounded-2xl p-4 flex gap-3 ${
              view.exclusion.reason === 'allergen'
                ? 'bg-error-container/60 text-on-error-container'
                : 'bg-surface-container-high text-on-surface'
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-xl flex-shrink-0">
              {view.exclusion.reason === 'allergen' ? 'warning' : 'block'}
            </span>
            <p className="font-body text-[15px] leading-relaxed">
              {view.exclusion.reason === 'allergen'
                ? t('diet.excluded.allergen', { key: t(`diet.allergens.${view.exclusion.key}`, view.exclusion.key) })
                : ['halal', 'kosher'].includes(view.exclusion.key)
                  ? t('diet.excluded.uncertified', { key: t(`diet.patterns.${view.exclusion.key}`, view.exclusion.key) })
                  : t('diet.excluded.pattern',     { key: t(`diet.patterns.${view.exclusion.key}`, view.exclusion.key) })}
            </p>
          </div>
        )}

        {/* ══ 1. FOR YOU ═══════════════════════════════════════════════════
            The answer, first. Without a dosha we say what we can't do and
            offer the quiz, rather than showing a verdict-shaped blank. */}
        {target.dosha ? (
          <div className={`mt-5 rounded-2xl border p-5 ${verdict.card}`}>
            <div className={`flex items-center gap-2 ${verdict.text}`}>
              <span aria-hidden="true" className="material-symbols-outlined text-xl">{verdict.icon}</span>
              <p className="font-body text-lg font-semibold">
                {t(`diet.verdict.${view.suitability}`, { dosha: doshaName })}
              </p>
            </div>

            {leadWhy && (
              <p className="font-body text-[15px] text-on-surface mt-3 leading-relaxed">{leadWhy}</p>
            )}

            {/* Why we're reading against THIS dosha. Only shown when vikriti
                and prakriti disagree — otherwise it's noise. */}
            <p className="font-body text-[13px] text-on-surface-variant mt-3 leading-relaxed">
              {explain
                ? t('diet.targetExplained', {
                    prakriti: t(`diet.dosha.${String(profile?.dosha_details?.primary || profile?.dosha).toLowerCase()}`),
                    vikriti:  doshaName,
                  })
                : t('diet.targetSimple', { dosha: doshaName })}
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-outline-variant/25 bg-surface-container-low p-5">
            <p className="font-body text-[15px] text-on-surface leading-relaxed">{t('diet.noTarget')}</p>
            <button
              onClick={() => {
                track(EVENTS.CTA_CLICKED, { cta_id: 'ingredient_to_quiz', route_name: 'ingredient_detail' })
                navigate('/quiz')
              }}
              className="mt-3 min-h-11 px-5 inline-flex items-center rounded-full bg-primary text-on-primary font-body text-sm active:scale-95 transition-all"
            >
              {t('diet.takeQuiz')}
            </button>
          </div>
        )}

        {/* The counterweight — kept, but clearly secondary to the verdict. */}
        {otherWhy && target.dosha && (
          <p className="font-body text-[15px] text-on-surface-variant mt-4 leading-relaxed">{otherWhy}</p>
        )}
        {!target.dosha && leadWhy && (
          <p className="font-body text-[15px] text-on-surface mt-4 leading-relaxed">{leadWhy}</p>
        )}

        {/* ══ 2. IN PRACTICE ══════════════════════════════════════════════ */}
        {hasPractice && (
          <Section title={t('diet.inPractice')}>
            <div className="flex flex-col gap-3">
              {(ingredient.bestTime?.length > 0 || ingredient.bestSeason?.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {(ingredient.bestTime || []).map((x) => <Chip key={x} icon="schedule" label={t(`diet.times.${x}`)} />)}
                  {(ingredient.bestSeason || []).map((x) => <Chip key={x} icon="eco" label={t(`diet.seasons.${x}`)} />)}
                </div>
              )}

              {ingredient.preparation && (
                <Card>
                  <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider mb-1.5">{t('diet.preparation')}</p>
                  <p className="font-body text-[15px] text-on-surface leading-relaxed">{ingredient.preparation}</p>
                </Card>
              )}

              {ingredient.balancedBy?.length > 0 && (
                <Card>
                  <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">{t('diet.balancedBy')}</p>
                  <div className="flex flex-wrap gap-2">
                    {ingredient.balancedBy.map((bid) => getIngredient(bid)).filter(Boolean).map((b) => (
                      <button
                        key={b.id}
                        onClick={() => navigate(`/ingredient/${b.id}`)}
                        className="min-h-11 px-4 inline-flex items-center gap-2 rounded-full bg-surface-container-high font-body text-sm text-on-surface active:scale-95 transition-all"
                      >
                        <span className="text-primary"><FoodIcon ingredient={b} size={18} /></span>
                        {b.name}
                      </button>
                    ))}
                  </div>
                  <p className="font-body text-[13px] text-on-surface-variant leading-relaxed mt-2.5">
                    {t('diet.balancedByHelp')}
                  </p>
                </Card>
              )}

              {ingredient.combosToAvoid?.length > 0 && (
                <Card>
                  <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">{t('diet.combosToAvoid')}</p>
                  <ul className="flex flex-col gap-2">
                    {ingredient.combosToAvoid.map((c) => (
                      <li key={c} className="font-body text-[15px] text-on-surface flex gap-2 leading-relaxed">
                        <span aria-hidden="true" className="material-symbols-outlined text-base text-on-surface-variant/50 mt-0.5">close</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Flags, never diagnoses. `cautionNote` says whether a flag is a
                  classical contraindication or a practical caution. */}
              {(ingredient.cautions?.length > 0 || ingredient.cautionNote) && (
                <Card>
                  <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">{t('diet.cautions')}</p>
                  {ingredient.cautions?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {ingredient.cautions.map((c) => (
                        <span key={c} className="px-3 py-1.5 rounded-full bg-surface-container-high font-body text-[13px] text-on-surface">
                          {t(`diet.cautionFlags.${c}`, c.replace(/_/g, ' '))}
                        </span>
                      ))}
                    </div>
                  )}
                  {ingredient.cautionNote && (
                    <p className="font-body text-[13px] text-on-surface-variant leading-relaxed mt-2.5">{ingredient.cautionNote}</p>
                  )}
                </Card>
              )}
            </div>
          </Section>
        )}

        {/* ══ 3. REFERENCE ════════════════════════════════════════════════
            Kept in full — it is what makes the app trustworthy — but placed
            after the answer rather than in front of it. */}
        <div className="mt-10 pt-2 border-t border-outline-variant/20">
          <Section title={t('diet.reference')} className="mt-5">
            <Card>
              <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider mb-2.5">{t('diet.doshaEffect')}</p>
              <div className="flex flex-col gap-2">
                {DOSHAS.map((d) => {
                  const s = suitabilityFor(ingredient, d)
                  const v = VERDICT[s]
                  const isTarget = target.dosha === d
                  return (
                    <div
                      key={d}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${isTarget ? 'bg-surface-container-high' : ''}`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base text-on-surface-variant">{DOSHA_ICON[d]}</span>
                      <span className={`font-body text-[15px] flex-1 ${isTarget ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>
                        {t(`diet.dosha.${d}`)}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 ${v.text}`}>
                        <span aria-hidden="true" className="material-symbols-outlined text-base">{v.icon}</span>
                        <span className="font-body text-sm">{t(`diet.suitability.${s}`)}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="mt-3">
              <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider mb-2.5">{t('diet.properties')}</p>
              <dl className="flex flex-col gap-3">
                {[
                  [t('diet.rasa'),   ingredient.rasa.map((r) => t(`diet.tastes.${r}`)).join(' · ')],
                  [t('diet.virya'),  t(`diet.viryas.${ingredient.virya}`)],
                  [t('diet.vipaka'), t(`diet.tastes.${ingredient.vipaka}`)],
                  [t('diet.guna'),   ingredient.guna.map((g) => t(`diet.gunas.${g}`, g.replace(/_/g, ' '))).join(' · ')],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-4">
                    <dt className="font-body text-sm text-on-surface-variant flex-shrink-0">{label}</dt>
                    <dd className="font-body text-[15px] text-on-surface text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            {/* The confidence badge is the honest core of the feature: whether
                this is attested or our derivation. */}
            <Card className="mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full font-label text-[11px] uppercase tracking-wide ${
                    view.isDerived
                      ? 'bg-surface-container-high text-on-surface-variant'
                      : 'bg-primary-container text-on-primary-container'
                  }`}
                >
                  {view.isDerived ? t('diet.confidence.medium') : t('diet.confidence.high')}
                </span>
                <span className="font-body text-sm text-on-surface-variant">
                  {ingredient.source.text === 'CS'
                    ? t('diet.citedAs', { verse: ingredient.source.verse })
                    : t('diet.derived')}
                </span>
              </div>
              {ingredient.source.note && (
                <p className="font-body text-[13px] text-on-surface-variant leading-relaxed mt-3">{ingredient.source.note}</p>
              )}
            </Card>
          </Section>
        </div>

        <p className="font-body text-[12px] text-on-surface-variant leading-relaxed mt-8">{DIET_DISCLAIMER}</p>
        <MedicalDisclaimer variant="inline" className="mt-2" />
      </div>
    </div>
  )
}
