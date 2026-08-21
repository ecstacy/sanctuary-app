// ─────────────────────────────────────────────────────────────────────────────
//  InfoRow — the non-tappable sibling of NavRow: the same accent-tinted squircle
//  icon badge + title + body, but no chevron and no button. For displaying a
//  labelled fact (season, hours, tastes…), so info and entry points share one
//  badge language across the app.
//
//  Renders one row; the parent supplies any grouped-card container + dividers
//  via `className` (e.g. "px-6 py-4 border-t border-surface-container-high").
// ─────────────────────────────────────────────────────────────────────────────

export default function InfoRow({ icon, title, children, accentHex = 'var(--color-primary)', className = '' }) {
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: `color-mix(in srgb, ${accentHex} 14%, transparent)` }}
      >
        <span aria-hidden="true" className="material-symbols-outlined text-xl" style={{ color: accentHex }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body font-semibold text-sm text-on-surface mb-0.5">{title}</p>
        <div className="font-body text-sm text-on-surface-variant leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
