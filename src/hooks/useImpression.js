import { useEffect, useRef } from 'react'
import { track, EVENTS } from '../lib/track'

// ─────────────────────────────────────────────────────────────────────────────
//  useImpression — fire `content_impression` once a card actually scrolls
//  into view, gated by visibility threshold + minimum dwell.
//
//  This is the **denominator for CTR**. Pair with the corresponding
//  `*_card_tapped` event (asana_card_tapped, routine_card_tapped, …) and
//  CTR for any surface = clicks / impressions.
//
//  Why dwell-gating?
//  -----------------
//  An IntersectionObserver naively fires every time any pixel enters the
//  viewport. That counts cards the user blew past as "seen", inflating
//  impressions and deflating CTR. We require ≥50% visibility *and* ≥1
//  second of dwell before firing — a card the user actually had a chance
//  to read. Tunable per-call via `threshold` / `dwellMs`.
//
//  Once fired, an impression is sticky for the lifetime of the
//  observed element — re-scrolling past the same card on the same page
//  visit does not double-count. (`screen_viewed` resetting to a new
//  route remounts the components, so a fresh impression is allowed.)
//
//  Usage:
//      function HomeSuggestedAsana({ asana }) {
//        const ref = useImpression({
//          surface:     'home_suggested_asana',
//          contentType: 'asana',
//          contentId:   asana.id,
//        })
//        return <button ref={ref}>...</button>
//      }
// ─────────────────────────────────────────────────────────────────────────────

export default function useImpression({
  surface,
  contentType,
  contentId,
  position,
  threshold = 0.5,
  dwellMs = 1000,
  enabled = true,
}) {
  const ref = useRef(null)
  const firedRef = useRef(false)
  const enteredAtRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!enabled) return
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return

    const fire = (visiblePct) => {
      if (firedRef.current) return
      firedRef.current = true
      const dwell = enteredAtRef.current ? Date.now() - enteredAtRef.current : dwellMs
      track(EVENTS.CONTENT_IMPRESSION, {
        surface:      surface,
        content_type: contentType,
        content_id:   contentId != null ? String(contentId) : null,
        position:     position ?? null,
        visible_pct:  visiblePct,
        dwell_ms:     dwell,
      })
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
        if (enteredAtRef.current == null) enteredAtRef.current = Date.now()
        // Schedule the fire after dwell — clear if user scrolls away first.
        timerRef.current = setTimeout(
          () => fire(Math.round(entry.intersectionRatio * 100)),
          dwellMs,
        )
      } else {
        // Left the viewport before dwell completed — cancel.
        clearTimeout(timerRef.current)
        timerRef.current = null
        enteredAtRef.current = null
      }
    }, { threshold: [threshold, 0.75, 1] })

    observer.observe(node)
    return () => {
      observer.disconnect()
      clearTimeout(timerRef.current)
    }
  }, [enabled, surface, contentType, contentId, position, threshold, dwellMs])

  return ref
}
