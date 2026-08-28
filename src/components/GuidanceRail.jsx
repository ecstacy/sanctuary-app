// ─────────────────────────────────────────────────────────────────────────────
//  GuidanceRail — Home's "to favour" / "to ease off" guidance as a swipeable
//  rail (built on CardCarousel).
//
//  The lead card carries the CONTEXT — what this rail is (To favour / What to
//  avoid), the dosha or time-of-day it's keyed to, and the one-line "why". Each
//  of the guidance points then gets its own slide, so a dense bullet list
//  becomes a set of glanceable cards. Reused for both tones via `accent`.
// ─────────────────────────────────────────────────────────────────────────────

import CardCarousel from './CardCarousel'

const ACCENT = {
  // Solid accent-container fills (not low-opacity tints) so the point cards
  // float clearly above the oat ground instead of blending into it.
  primary:   { icon: 'text-primary',   tipBg: 'var(--color-pine-container)', dot: 'bg-primary-container text-on-primary-container' },
  secondary: { icon: 'text-secondary', tipBg: 'var(--color-clay-container)', dot: 'bg-secondary-container text-on-secondary-container' },
}
const CARD = 'w-[262px] h-full rounded-2xl border border-outline-variant/30 card-elev p-5 flex flex-col'

export default function GuidanceRail({
  title,
  icon,                 // leading material-symbol on the context card
  accent = 'primary',   // 'primary' | 'secondary'
  badge = null,         // { text, className?, style? }
  context,              // the one-line "why"
  note = null,          // optional { icon, text } — e.g. the goal note
  tips = [],            // [{ icon?, text }]
  ariaLabel,
  className = '',
}) {
  const a = ACCENT[accent] || ACCENT.primary
  const items = (Array.isArray(tips) ? tips : []).filter(Boolean)

  return (
    <CardCarousel className={className} ariaLabel={ariaLabel || title}>
      {/* Context / lead card */}
      <div className={`${CARD} bg-surface-container-low`}>
        <div className="flex items-center gap-2.5 mb-2">
          <span aria-hidden="true" className={`material-symbols-outlined text-lg ${a.icon}`}>{icon}</span>
          {badge && (
            <span
              className={`ml-auto font-label text-[11px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full ${badge.className || ''}`}
              style={badge.style}
            >
              {badge.text}
            </span>
          )}
        </div>
        <h3 className="font-headline text-lg text-on-surface">{title}</h3>
        {context && <p className="font-body text-[13px] text-on-surface-variant/80 leading-relaxed mt-1.5">{context}</p>}
        {note && (
          <p className="flex items-center gap-1.5 font-body text-[12px] text-primary/85 mt-auto pt-3">
            {note.icon && <span aria-hidden="true" className="material-symbols-outlined text-[14px]">{note.icon}</span>}
            {note.text}
          </p>
        )}
      </div>

      {/* One card per guidance point */}
      {items.map((tip, i) => (
        <div key={i} className={`${CARD} justify-center gap-3`} style={{ backgroundColor: a.tipBg }}>
          <span className={`w-9 h-9 rounded-full flex items-center justify-center ${a.dot}`}>
            <span aria-hidden="true" className="material-symbols-outlined text-xl">{tip.icon || 'check'}</span>
          </span>
          <p className="font-body text-[15px] text-on-surface leading-snug">{tip.text}</p>
        </div>
      ))}
    </CardCarousel>
  )
}
