// ─────────────────────────────────────────────────────────────────────────────
//  MealIdeaCard — a meal idea, presented like a dish (not a paragraph).
//
//  A food-delivery-style tile: a themed visual header (a real image when a
//  template carries one, else the generated on-palette tile from mealVisual),
//  a positive "Balances X" badge, then title, an appetising line, the
//  ingredients, and — kept from the old design because it is the whole point of
//  this feature — the verdict shown WITH its inputs. A derived conclusion that
//  hides its derivation is indistinguishable from an asserted one.
//
//  Tapping opens the lead ingredient today; this is the seam the ingredient →
//  recipe flow grows from.
// ─────────────────────────────────────────────────────────────────────────────

import { SUITABILITY } from '../lib/doshaSemantics'
import { mealVisual } from '../lib/mealVisual'

const SUITABILITY_STYLE = {
  [SUITABILITY.BALANCING]: { icon: 'trending_down', tint: 'text-pine' },
  [SUITABILITY.NEUTRAL]:   { icon: 'remove',        tint: 'text-on-surface-variant' },
  [SUITABILITY.CAUTION]:   { icon: 'trending_up',   tint: 'text-clay' },
}

export default function MealIdeaCard({ idea, targetDosha, doshaLabel, t, onTap }) {
  const vis = mealVisual(idea)
  const style = SUITABILITY_STYLE[idea.suitability]
  const balances = targetDosha && idea.suitability === SUITABILITY.BALANCING
  const hasVerdict = targetDosha && idea.contributions.length > 0

  return (
    <button
      onClick={onTap}
      className="group w-full text-left rounded-3xl overflow-hidden bg-surface-container-low border border-outline-variant/40 shadow-sm active:scale-[0.99] transition-transform"
    >
      {/* ── Visual header — the "photo". ─────────────────────────────────── */}
      <div className="relative h-28 w-full overflow-hidden">
        {idea.image ? (
          <img src={idea.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full flex items-center justify-center"
            style={{ backgroundImage: `linear-gradient(135deg, ${vis.from} 0%, ${vis.to} 100%)` }}
          >
            {/* soft top-light for a little depth */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 100% at 50% -20%, rgba(255,255,255,0.45), transparent 60%)' }} />
            <span className="material-symbols-outlined relative text-[46px]" style={{ color: vis.ink, opacity: 0.72 }}>
              {vis.icon}
            </span>
          </div>
        )}

        {/* Positive highlight, delivery-app style. Only the good news rides the
            hero; the full verdict (incl. cautions) lives in the body. */}
        {balances && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-surface-container-low/90 backdrop-blur-sm pl-1.5 pr-2.5 py-1 shadow-sm">
            <span aria-hidden="true" className="material-symbols-outlined text-pine text-[15px]">spa</span>
            <span className="font-label text-[10px] uppercase tracking-wide text-pine">
              {t('meals.balances', { dosha: doshaLabel })}
            </span>
          </span>
        )}

        {idea.kind === 'preparation' && (
          <span className="absolute top-3 right-3 rounded-full bg-surface-container-low/90 backdrop-blur-sm px-2.5 py-1 font-label text-[9px] uppercase tracking-wide text-on-surface-variant shadow-sm">
            {t('meals.kind.preparation')}
          </span>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-body text-[17px] font-semibold text-on-surface leading-tight">{idea.name}</p>
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-xl flex-shrink-0 mt-0.5 group-active:translate-x-0.5 transition-transform">
            chevron_right
          </span>
        </div>

        {idea.prep && (
          <p className="font-body text-sm text-on-surface-variant mt-1.5 leading-relaxed">{idea.prep}</p>
        )}

        {/* Ingredients — the make-up of the dish, kept secondary and light. */}
        <p className="font-body text-[13px] text-on-surface-variant/90 mt-3 leading-relaxed">
          {idea.core.map((c) => c.name).join(' · ')}
          {idea.optional.length > 0 && (
            <span className="text-on-surface-variant/55">{' + '}{idea.optional.map((o) => o.name).join(', ')}</span>
          )}
        </p>

        {/* Verdict WITH its inputs — the trust invariant, restyled as an inset
            row rather than a loose sentence. */}
        {hasVerdict && (
          <div className={`flex items-start gap-1.5 mt-3 rounded-xl bg-surface-container/60 px-3 py-2 ${style.tint}`}>
            <span aria-hidden="true" className="material-symbols-outlined text-[17px] flex-shrink-0">{style.icon}</span>
            <span className="font-body text-xs leading-relaxed">
              {t(`meals.verdict.${idea.suitability}`, { dosha: doshaLabel })}
              {' — '}
              <span className="text-on-surface-variant">{idea.contributions.map((c) => c.name).join(', ')}</span>
            </span>
          </div>
        )}

        {idea.balancedBy.length > 0 && (
          <p className="font-body text-xs text-on-surface-variant/70 mt-2.5 leading-relaxed">
            {t('meals.balancedBy', { list: idea.balancedBy.map((b) => b.name).join(', ') })}
          </p>
        )}

        {(idea.isDerived || idea.citations.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
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
        )}
      </div>
    </button>
  )
}
