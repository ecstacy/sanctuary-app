// ─────────────────────────────────────────────────────────────────────────────
//  NavRow — a full-width navigation/entry row: a generous accent-tinted icon
//  badge, a bold title, a real one/two-line description, and a chevron. The
//  shared "tap to go deeper" affordance across the app's detail pages (dosha
//  profile, dietary guidance, daily routine…), so entry points read as one
//  system instead of a patchwork of cramped boxes.
//
//  `accentHex` tints the badge (defaults to the app primary); pass the user's
//  dosha accent on dosha-themed surfaces so the row feels of a piece.
// ─────────────────────────────────────────────────────────────────────────────

export default function NavRow({ icon, title, summary, onClick, accentHex = 'var(--color-primary)', ariaLabel }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="w-full flex items-center gap-4 bg-surface-container-low border border-outline-variant/50 rounded-2xl p-4 text-left active:scale-[0.99] transition-all"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: `color-mix(in srgb, ${accentHex} 14%, transparent)` }}
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[22px]" style={{ color: accentHex }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body font-semibold text-[15px] text-on-surface leading-tight">{title}</p>
        {summary && <p className="font-body text-[13px] text-on-surface-variant leading-snug mt-1">{summary}</p>}
      </div>
      <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-xl flex-shrink-0">chevron_right</span>
    </button>
  )
}
