// ─── Pose Figure ────────────────────────────────────────────────────────────
// Renders a pose as: (a) image by default, (b) video in live-practice contexts,
// (c) SVG fallback when no media exists. When `expandable` is set, tapping the
// figure opens a fullscreen overlay with a "Play video" toggle.

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// ─── Asset maps ──────────────────────────────────────────────────────────────
// Keys include both the data poseKey AND the disk filename, in case those
// drifted historically (e.g. `forwardBend` in data, `paschimottanasana.png`
// on disk; `legsUpWall` in data, `legUpWall.png` on disk).

const POSE_IMAGES = {
  tadasana: '/poses/tadasana.png',
  warrior1: '/poses/warrior1.png',
  warrior2: '/poses/warrior2.png',
  tree: '/poses/tree.png',
  sukhasana: '/poses/sukhasana.png',
  seatedTwist: '/poses/seatedTwist.png',
  uttanasana: '/poses/uttanasana.png',
  forwardBend: '/poses/paschimottanasana.png',
  paschimottanasana: '/poses/paschimottanasana.png',
  balasana: '/poses/balasana.png',
  supineTwist: '/poses/supinetwist.png',
  supinetwist: '/poses/supinetwist.png',
  savasana: '/poses/savasana.png',
  cobra: '/poses/Cobra.png',
  Cobra: '/poses/Cobra.png',
  bridge: '/poses/bridge.png',
  pigeon: '/poses/pigeon.png',
  suryaNamaskar: '/poses/suryaNamaskar.png',
  downwardDog: '/poses/downwardDog.png',
  legsUpWall: '/poses/legUpWall.png',
  legUpWall: '/poses/legUpWall.png',
  trikonasana: '/poses/trikonasana.png',
}

const POSE_VIDEOS = {
  tadasana: '/poses/tadasana.mp4',
  warrior1: '/poses/warrior1.mp4',
  warrior2: '/poses/warrior2.mp4',
  tree: '/poses/tree.mp4',
  sukhasana: '/poses/sukhasana.mp4',
  seatedTwist: '/poses/seatedTwist.mp4',
  uttanasana: '/poses/uttanasana.mp4',
  forwardBend: '/poses/paschimottanasana.mp4',
  paschimottanasana: '/poses/paschimottanasana.mp4',
  balasana: '/poses/balasana.mp4',
  supineTwist: '/poses/supinetwist.mp4',
  supinetwist: '/poses/supinetwist.mp4',
  savasana: '/poses/savasana.mp4',
  cobra: '/poses/Cobra.mp4',
  Cobra: '/poses/Cobra.mp4',
  bridge: '/poses/bridge.mp4',
  pigeon: '/poses/pigeon.mp4',
  suryaNamaskar: '/poses/suryaNamaskar.mp4',
  downwardDog: '/poses/downwardDog.mp4',
  legsUpWall: '/poses/legUpWall.mp4',
  legUpWall: '/poses/legUpWall.mp4',
}

// ─── SVG fallback (used only if a pose has no image on disk) ────────────────
function PoseIllustration({ poseKey }) {
  const poses = {
    tadasana: (
      <g>
        <circle cx="100" cy="28" r="14" fill="currentColor" opacity="0.85" />
        <path d="M100 42 L100 110" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        <path d="M100 55 L78 85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M100 55 L122 85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M100 110 L88 165" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        <path d="M100 110 L112 165" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
      </g>
    ),
  }
  return poses[poseKey] || poses.tadasana
}

// ─── Size map ───────────────────────────────────────────────────────────────
function dimensionFor(size) {
  if (typeof size === 'number') return size
  if (size === 'xl') return 320
  if (size === 'lg') return 220
  if (size === 'sm') return 80
  if (size === 'xs') return 56
  return 140 // md default
}

// ─── Inline media (image / video / svg) ─────────────────────────────────────
function PoseMedia({ poseKey, width, height, variant, breathing, rounded = true, objectFit = 'cover', objectPosition = 'center' }) {
  const imageSrc = POSE_IMAGES[poseKey]
  const videoSrc = POSE_VIDEOS[poseKey]
  const [imgBroken, setImgBroken] = useState(false)

  // Reset broken flag if poseKey changes
  useEffect(() => { setImgBroken(false) }, [poseKey])

  const boxStyle = { width, height }
  const roundedCls = rounded ? 'rounded-2xl' : ''

  if (variant === 'video' && videoSrc) {
    return (
      <div className={`${roundedCls} overflow-hidden bg-surface-container shadow-lg`} style={boxStyle}>
        <video
          key={videoSrc}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className={`w-full h-full outline-none`}
          style={{ objectFit, objectPosition, pointerEvents: 'none', WebkitTapHighlightColor: 'transparent' }}
          tabIndex={-1}
        />
      </div>
    )
  }

  if (imageSrc && !imgBroken) {
    return (
      <div className={`${roundedCls} overflow-hidden bg-surface-container shadow-sm`} style={boxStyle}>
        <img
          src={imageSrc}
          alt={poseKey}
          draggable={false}
          className="w-full h-full"
          style={{ objectFit, objectPosition }}
          onError={() => setImgBroken(true)}
        />
      </div>
    )
  }

  // SVG fallback
  const svgDim = Math.min(width, height) * 0.85
  return (
    <div
      className={`flex items-center justify-center ${breathing ? 'animate-pose-breathe' : ''}`}
      style={boxStyle}
    >
      <svg
        width={svgDim}
        height={svgDim}
        viewBox="0 0 200 185"
        fill="none"
        className="text-primary outline-none"
        style={{ transition: 'all 0.6s ease', WebkitTapHighlightColor: 'transparent' }}
        focusable="false"
      >
        <PoseIllustration poseKey={poseKey} />
      </svg>
    </div>
  )
}

// ─── Expanded overlay (image + "Play video" toggle) ─────────────────────────
// Portaled to document.body so `position: fixed` is viewport-relative even
// when an ancestor (e.g. PageTransition) creates a transform containing block.
function PoseExpandedOverlay({ poseKey, onClose }) {
  const [playing, setPlaying] = useState(false)
  const hasVideo = !!POSE_VIDEOS[poseKey]
  const imageSrc = POSE_IMAGES[poseKey]
  const videoSrc = POSE_VIDEOS[poseKey]

  // Escape key + body scroll lock
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const overlay = (
    <div
      className="animate-page-enter"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: 'max(1rem, env(safe-area-inset-top))',
          right: '1rem',
          width: 40,
          height: 40,
          borderRadius: 9999,
          background: 'rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 20 }}>close</span>
      </button>

      {/* Media stage — explicit pixel sizing for reliable layout */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(88vw, 480px)',
          height: 'min(88vw, 480px)',
          maxHeight: '70vh',
          borderRadius: 24,
          overflow: 'hidden',
          background: '#111',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {playing && hasVideo ? (
          <video
            key={videoSrc}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#111' }}
          />
        ) : imageSrc ? (
          <img
            src={imageSrc}
            alt={poseKey}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#111' }}
          />
        ) : (
          <span style={{ color: 'white', fontFamily: 'sans-serif', fontSize: 14 }}>No media</span>
        )}
      </div>

      {/* Toggle */}
      {hasVideo && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 'max(2rem, calc(env(safe-area-inset-bottom) + 1.25rem))',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setPlaying((p) => !p)}
            className="active:scale-95 transition-transform"
            style={{
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.95)',
              color: '#222',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {playing ? 'image' : 'play_arrow'}
            </span>
            {playing ? 'Show image' : 'Play video'}
          </button>
        </div>
      )}
    </div>
  )

  return createPortal(overlay, document.body)
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function PoseFigure({
  poseKey,
  size = 'lg',
  breathing = true,
  variant = 'image', // 'image' | 'video'
  expandable = false,
  objectPosition = 'center',
}) {
  const dim = dimensionFor(size)
  const [expanded, setExpanded] = useState(false)

  const inline = (
    <PoseMedia
      poseKey={poseKey}
      width={dim}
      height={dim}
      variant={variant}
      breathing={breathing}
      objectPosition={objectPosition}
    />
  )

  if (!expandable) {
    return <div className="flex items-center justify-center">{inline}</div>
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="relative inline-flex items-center justify-center active:scale-95 transition-transform outline-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label={`Expand ${poseKey}`}
      >
        {inline}
        <span
          className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-surface/85 flex items-center justify-center shadow-sm pointer-events-none"
          aria-hidden
        >
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '14px' }}>fullscreen</span>
        </span>
      </button>
      {expanded && <PoseExpandedOverlay poseKey={poseKey} onClose={() => setExpanded(false)} />}
    </>
  )
}
