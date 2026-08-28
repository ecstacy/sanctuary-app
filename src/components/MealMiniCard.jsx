// ─────────────────────────────────────────────────────────────────────────────
//  MealMiniCard — a compact meal card sized for a horizontal rail.
//
//  The rail counterpart to the full MealIdeaCard: image (or the mealVisual
//  gradient fallback) + name, plus an optional fit chip ("Balances Pitta"). Used
//  by Home's nourish rail and anywhere meals appear in a CardCarousel. Width is
//  set by the caller (defaults to a rail-friendly w-40) so one card fits several
//  to a screen with a peek of the next.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { mealVisual } from '../lib/mealVisual'

export default function MealMiniCard({ meal, fitLabel = null, onTap, className = 'w-40' }) {
  const vis = mealVisual(meal)
  const [failed, setFailed] = useState(false)
  const showImage = meal.image && !failed

  return (
    <button
      type="button"
      onClick={onTap}
      className={`group text-left rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/25 card-elev active:scale-[0.98] transition-transform ${className}`}
    >
      <div className="relative h-24 w-full overflow-hidden">
        {showImage ? (
          <img
            src={meal.image}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full flex items-center justify-center"
            style={{ backgroundImage: `linear-gradient(135deg, ${vis.from} 0%, ${vis.to} 100%)` }}
          >
            <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 100% at 50% -20%, rgba(255,255,255,0.4), transparent 60%)' }} />
            <span className="material-symbols-outlined relative text-[34px]" style={{ color: vis.ink, opacity: 0.72 }}>
              {vis.icon}
            </span>
          </div>
        )}
        {fitLabel && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-surface-container-low pl-1.5 pr-2 py-0.5 shadow-sm">
            <span aria-hidden="true" className="material-symbols-outlined text-pine text-[13px]">spa</span>
            <span className="font-label text-[9px] uppercase tracking-wide text-pine">{fitLabel}</span>
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="font-body text-[13px] font-semibold text-on-surface leading-snug line-clamp-2">{meal.name}</p>
      </div>
    </button>
  )
}
