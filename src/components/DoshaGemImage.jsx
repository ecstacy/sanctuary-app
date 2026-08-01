// ─────────────────────────────────────────────────────────────────────────────
//  DoshaGemImage — the state gem as a pre-rendered liquid-glass image.
//
//  Picks /dosha-gems/<outcome>.png for the current dosha split (see
//  lib/doshaOutcome) and keeps it feeling alive with a slow "breath" and a
//  light shimmer masked to the gem's own silhouette. If the image is missing
//  (not yet delivered, or a bad key) it falls back to the real-time WebGL gem,
//  so the card is never empty. prefers-reduced-motion freezes both via the
//  global rule in index.css.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import DoshaGem from './DoshaGem'
import { gemImageKey } from '../lib/doshaOutcome'

export default function DoshaGemImage({ percentages, dominant = null, size = 172 }) {
  const pct = percentages || (dominant ? { [dominant]: 68, ...zeros(dominant) } : { vata: 34, pitta: 33, kapha: 33 })
  const key = gemImageKey(pct)
  const src = `/dosha-gems/${key}.png`
  const [failed, setFailed] = useState(false)

  if (failed) return <DoshaGem percentages={pct} size={size} />

  const w = Math.round(size * 0.82)
  return (
    <div className="dosha-gem-img" style={{ width: w, height: size, '--gem-src': `url("${src}")` }}>
      <img
        className="dosha-gem-img__png animate-gem-breath"
        src={src} alt="" aria-hidden="true" draggable="false"
        width={w} height={size} onError={() => setFailed(true)}
      />
      <span className="dosha-gem-img__shimmer" aria-hidden="true" />
    </div>
  )
}

function zeros(except) {
  const o = { vata: 16, pitta: 16, kapha: 16 }
  delete o[except]
  return o
}
