// ─────────────────────────────────────────────────────────────────────────────
//  Icon — the single place icons are rendered.
//
//  Pilot for BACKLOG #64: today the app renders Material Symbols Outlined inline
//  (`<span className="material-symbols-outlined">glyph</span>`) in ~370 places.
//  This wrapper centralises that one render so a future swap to a warmer set
//  (Lucide, Phosphor, …) is a change to THIS FILE ONLY — no call-site edits.
//
//  `name` is the Material Symbols glyph name (unchanged from today), so adopting
//  <Icon> anywhere is a mechanical, risk-free replacement. When we choose a set
//  to migrate to, the swap is:
//    1. `npm i lucide-react` (tree-shakable — only imported icons ship).
//    2. Add a map here: { home_max: Home, explore: Compass, self_care: HeartHandshake, … }.
//    3. Flip ICON_SET and render the mapped component when it's not 'material'.
//  Everything already using <Icon> flips at once; anything still on a raw <span>
//  keeps working, so migration can be incremental.
//
//  Piloted on: BottomNav (the 4 tab icons). Extend to primary CTAs next.
// ─────────────────────────────────────────────────────────────────────────────

// The active icon set. Only 'material' is wired today; the seam above is where a
// warmer set plugs in once chosen.
export const ICON_SET = 'material'

/**
 * @param {object} props
 * @param {string} props.name      Material Symbols glyph name (e.g. 'home_max').
 * @param {boolean} [props.filled] Use the filled variant (Material FILL axis).
 * @param {string} [props.className]
 * @param {number|string} [props.size] Font-size override (px number or CSS size).
 * @param {object} [props.style]
 */
export default function Icon({ name, filled = false, className = '', size, style = {}, ...rest }) {
  const sizeStyle = size != null ? { fontSize: typeof size === 'number' ? `${size}px` : size } : {}
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${className}`.trim()}
      style={{ ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}), ...sizeStyle, ...style }}
      {...rest}
    >
      {name}
    </span>
  )
}
