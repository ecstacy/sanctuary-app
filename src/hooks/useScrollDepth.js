import { useEffect, useRef } from 'react'
import { track, EVENTS } from '../lib/track'

// ─────────────────────────────────────────────────────────────────────────────
//  useScrollDepth — fire `scroll_depth_reached` at 25/50/75/100 thresholds
//
//  Drop into any scrollable page (HomePage, DiscoverPage, AsanaDetailPage…)
//  and you get four events max per visit, each with `seconds_to_reach` so
//  PostHog can plot how quickly users move down the page.
//
//  Why thresholds and not "report every N pixels"?
//  ----------------------------------------------------
//  Continuous scroll telemetry blows up event volume and produces noisy
//  histograms. Four discrete thresholds is the industry standard — they
//  map cleanly to "saw the fold", "saw the hero", "engaged with body
//  content", "read to the end" — which is what we actually want.
//
//  Pairs with `screen_left.max_scroll_depth_pct` (already wired in
//  ScreenTracker) for the "how far did they get total" denominator.
//
//  Usage:
//      function HomePage() {
//        useScrollDepth('home')
//        return <div>...</div>
//      }
// ─────────────────────────────────────────────────────────────────────────────

const THRESHOLDS = [25, 50, 75, 100]

export default function useScrollDepth(routeName) {
  const firedRef = useRef(new Set())
  const enteredAtRef = useRef(0)

  useEffect(() => {
    firedRef.current = new Set()
    enteredAtRef.current = Date.now()

    const onScroll = () => {
      const doc = document.documentElement
      const scrollable = Math.max(1, doc.scrollHeight - doc.clientHeight)
      const pct = Math.min(100, Math.round((doc.scrollTop / scrollable) * 100))
      for (const t of THRESHOLDS) {
        if (pct >= t && !firedRef.current.has(t)) {
          firedRef.current.add(t)
          track(EVENTS.SCROLL_DEPTH_REACHED, {
            route_name:        routeName,
            depth_pct:         t,
            seconds_to_reach:  Math.round((Date.now() - enteredAtRef.current) / 1000),
          })
        }
      }
    }

    // Initial check — pages short enough to not need scrolling immediately
    // hit 100% so dashboards don't dramatically under-count "fully read".
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [routeName])
}
