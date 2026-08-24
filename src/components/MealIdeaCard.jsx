// ─────────────────────────────────────────────────────────────────────────────
//  MealIdeaCard — a meal idea as a tap-through tile, not a paragraph.
//
//  A food-delivery-style teaser: a themed visual (a real image when a template
//  carries one, else the generated mealVisual tile), a "Balances X" badge, the
//  dish name, and a one-line ingredient read. Everything else — the
//  verdict-with-inputs, traditional companions, citations — lives on the detail
//  the tap opens, so the list stays scannable. Tapping opens the lead
//  ingredient today; this is the seam the ingredient → recipe flow grows from.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { SUITABILITY } from '../lib/doshaSemantics'
import { mealVisual } from '../lib/mealVisual'

export default function MealIdeaCard({ idea, targetDosha, doshaLabel, t, onTap }) {
  const vis = mealVisual(idea)
  const balances = targetDosha && idea.suitability === SUITABILITY.BALANCING

  // A bundled illustration when one exists, else the generated tile. onError
  // drops back to the tile so a missing/broken file never shows a broken image.
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = idea.image && !imgFailed

  const ingredients = idea.core.map((c) => c.name).join(' · ')

  return (
    <button
      onClick={onTap}
      className="group w-full text-left rounded-3xl overflow-hidden bg-surface-container-low border border-outline-variant/40 shadow-sm active:scale-[0.99] transition-transform"
    >
      {/* ── Visual header — the "photo". ─────────────────────────────────── */}
      <div className="relative h-32 w-full overflow-hidden">
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

        {/* The one glanceable teaser that earns the tap. */}
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

      {/* ── Body — name + a single ingredient read, then a tap affordance. ── */}
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-body text-[17px] font-semibold text-on-surface leading-tight">{idea.name}</p>
          <p className="font-body text-[13px] text-on-surface-variant/80 mt-1 truncate">{ingredients}</p>
        </div>
        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-xl flex-shrink-0 group-active:translate-x-0.5 transition-transform">
          chevron_right
        </span>
      </div>
    </button>
  )
}
