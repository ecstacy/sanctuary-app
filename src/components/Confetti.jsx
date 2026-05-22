// ─────────────────────────────────────────────────────────────────────────────
//  Confetti — one-shot CSS celebration burst
//
//  A pure-CSS, pure-React celebration overlay. No external library — just
//  ~30 colored dots animating from above the viewport down past the
//  bottom, each with a randomized horizontal drift + rotation + delay.
//  Self-unmounts after `durationMs` so it doesn't sit in the DOM after
//  the moment is over.
//
//  WHY NO LIBRARY
//  ──────────────
//  Libraries like canvas-confetti are 8-15kb gzipped for a one-time
//  effect we use in exactly one place. The cost-benefit doesn't pencil
//  out. CSS handles it fine; the user sees the same outcome.
//
//  ACCESSIBILITY
//  ─────────────
//  Honors `prefers-reduced-motion` — users with that flag see no
//  animation at all. The component returns null instead of rendering.
//  The Welcome card is still legible and dismissible regardless.
//
//  USAGE
//  ─────
//    <Confetti durationMs={3000} />
//
//  Always mounted unconditionally inside a parent that itself only
//  mounts on the celebration moment (e.g. WelcomeToPlusCard). Don't
//  gate Confetti on a state flag — just gate its parent.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'

// Dosha color palette — pulls from the three dosha accents so the
// celebration ties visually to the rest of the app. Plus the primary
// brand teal as a neutral.
const COLORS = [
  '#7b93a8',  // Vata blue
  '#c47a3a',  // Pitta amber
  '#6b8f5e',  // Kapha sage
  '#cbb681',  // Primary warm
  '#e8d5b7',  // Primary light
]

const PIECE_COUNT = 32

export default function Confetti({ durationMs = 3000 }) {
  const [alive, setAlive]     = useState(true)
  const [reduceMotion, setRM] = useState(false)

  // Honor the OS-level reduced-motion preference.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setRM(mq.matches)
    const onChange = (e) => setRM(e.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  // Self-unmount after the animation completes — no leftover DOM nodes
  // floating around invisibly after the celebration ends.
  useEffect(() => {
    if (reduceMotion) return
    const handle = setTimeout(() => setAlive(false), durationMs + 200)
    return () => clearTimeout(handle)
  }, [durationMs, reduceMotion])

  if (!alive || reduceMotion) return null

  // Generate pieces once per mount. Each has stable randomized props for
  // its lifetime, so the animation doesn't reseed mid-fall.
  const pieces = Array.from({ length: PIECE_COUNT }, (_, i) => {
    const leftPct       = Math.random() * 100
    const horizDrift    = (Math.random() - 0.5) * 60          // -30vw .. +30vw
    const startRotation = Math.floor(Math.random() * 360)
    const endRotation   = startRotation + (Math.random() * 720 - 360)
    const delay         = Math.random() * 600                  // ms
    const duration      = 2400 + Math.random() * 1200          // ms
    const color         = COLORS[i % COLORS.length]
    const size          = 6 + Math.random() * 6                // px
    const isRect        = Math.random() > 0.4                  // mix of strips + dots
    return {
      key: i, leftPct, horizDrift, startRotation, endRotation,
      delay, duration, color, size, isRect,
    }
  })

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[55] overflow-hidden"
    >
      {pieces.map((p) => (
        <span
          key={p.key}
          className="absolute block"
          style={{
            top:               '-2vh',
            left:              `${p.leftPct}%`,
            width:             `${p.isRect ? p.size * 1.4 : p.size}px`,
            height:            `${p.isRect ? p.size * 0.7 : p.size}px`,
            backgroundColor:   p.color,
            borderRadius:      p.isRect ? '1px' : '50%',
            opacity:           0.95,
            animation:         `sanctuary-confetti-fall ${p.duration}ms cubic-bezier(0.2, 0.6, 0.4, 1) ${p.delay}ms forwards`,
            // CSS variables carry the per-piece randomization into the
            // keyframes — declared inline so each particle has unique
            // motion without spawning a stylesheet per piece.
            '--confetti-drift':    `${p.horizDrift}vw`,
            '--confetti-rot-from': `${p.startRotation}deg`,
            '--confetti-rot-to':   `${p.endRotation}deg`,
          }}
        />
      ))}

      {/* Keyframes are scoped per-mount via a <style> tag here so the
          confetti is fully self-contained — no global stylesheet edits,
          no Tailwind config additions. Cheaper than carrying an animation
          dependency for a feature used once. */}
      <style>{`
        @keyframes sanctuary-confetti-fall {
          0% {
            transform: translate(0, 0) rotate(var(--confetti-rot-from));
            opacity: 0.95;
          }
          80% {
            opacity: 0.9;
          }
          100% {
            transform: translate(var(--confetti-drift), 110vh) rotate(var(--confetti-rot-to));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
