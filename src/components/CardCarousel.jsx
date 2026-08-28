// ─────────────────────────────────────────────────────────────────────────────
//  CardCarousel — a horizontal, snap-scrolling rail of cards.
//
//  The reusable primitive behind the app's many horizontal rows (Home's meal
//  ideas, meal favourites, Discover shelves…), which had each re-implemented the
//  same `flex gap overflow-x-auto snap-x` by hand. One place to get the scroll
//  mechanics, edge-bleed, snap, hidden scrollbar and header right.
//
//  It owns ONLY layout — the cards are whatever you pass as children. Each child
//  becomes a snap item; the child sets its own width (or pass `itemClassName`).
//  An optional header shows a label on the left and a single action link on the
//  right (e.g. "View all"). `null`/falsey children are skipped, so callers can
//  inline conditional items (like a trailing "view more" tile).
// ─────────────────────────────────────────────────────────────────────────────

import { Children } from 'react'

export default function CardCarousel({
  label,
  action,               // { label, onClick }
  ariaLabel,
  children,
  className = '',
  itemClassName = '',
}) {
  const items = Children.toArray(children).filter(Boolean)
  if (items.length === 0) return null

  return (
    <div className={className}>
      {(label || action) && (
        <div className="flex items-baseline justify-between gap-3 mb-2 px-1">
          {label && (
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">{label}</p>
          )}
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="shrink-0 font-body text-xs font-medium text-primary active:opacity-70 flex items-center gap-0.5"
            >
              {action.label}
              <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          )}
        </div>
      )}

      {/* Edge-bleed to the screen gutter (-mx-6 px-6) so the first/last card can
          sit flush while the row still scrolls under the 24px page padding. */}
      <div
        role="region"
        aria-label={ariaLabel || label}
        className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-px-6 -mx-6 px-6 pb-1"
      >
        {items.map((child, i) => (
          <div key={i} className={`flex-shrink-0 snap-start ${itemClassName}`}>{child}</div>
        ))}
      </div>
    </div>
  )
}
