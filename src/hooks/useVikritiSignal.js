// ─────────────────────────────────────────────────────────────────────────────
//  useVikritiSignal — detect dosha imbalance from recent self-reports
//
//  The "magical" personalization moment for Sanctuary: read the last 14
//  days of `user_state_checkins` (energy + stress scores from the pre/post
//  practice flow), map the pattern to a vikriti dosha (temporary
//  imbalance), and surface a recommendation.
//
//  THE 2-D MAPPING
//  ───────────────
//  Self-report energy + stress collapse cleanly onto the classical
//  dosha-aggravation quadrants:
//
//                           Energy
//                       Low         High
//          High        Vata        Pitta
//   Stress              ↑           ↑
//                   anxious      intense
//                   depleted     irritated
//
//                       Kapha     (balanced)
//          Low           ↑
//                    lethargic
//                    withdrawn
//
//  This isn't a clinical diagnosis — it's pattern-matching on what the
//  classical texts already say. The user gets a meaningful, dosha-specific
//  nudge instead of a generic "you seem stressed" prompt.
//
//  CONSERVATIVE BY DESIGN
//  ──────────────────────
//  We require ≥3 valid checkins across ≥3 distinct days before
//  surfacing a signal. Below that threshold the hook returns null and
//  the home card stays hidden — no signal beats a noisy one. A user who
//  practices once and tells us they're tired isn't a vikriti reading,
//  it's a sample of one.
//
//  RETURN SHAPE
//  ────────────
//    { isLoading, hasSignal, vikriti, evidence, recommendations }
//
//    hasSignal === false: don't render the card.
//    vikriti: 'vata' | 'pitta' | 'kapha'
//    evidence: { matchingDays, totalDays, avgEnergy, avgStress }
//    recommendations: { free: { ... }, plus: { ... } }
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// Window over which we look for a signal. 14 days catches a real shift
// without drowning it in older noise; the half-life of a vikriti pattern
// in self-report data is roughly a week.
const WINDOW_DAYS = 14

// Detection thresholds on the 1-5 self-report scale. Centered around 3
// (neutral); ≥3.5 reads as "elevated", ≤2.5 reads as "depressed". The
// gap of 1.0 between thresholds keeps us out of the noisy middle band.
const HIGH = 3.5
const LOW  = 2.5

// Minimums. The same user reporting the same low/high day five times
// in a row is one data point in disguise; we want at least 3 distinct
// days AND at least 3 valid samples before we'll trust the pattern.
const MIN_SAMPLES = 3
const MIN_DAYS    = 3

// ─────────────────────────────────────────────────────────────────────────────
//  Per-dosha nudge content
// ─────────────────────────────────────────────────────────────────────────────
//
// Free path: one specific, immediate action (always linkable to existing
// free content — no broken-link "Plus required" trap). Plus path: the
// teaser for the full protocol, gated by the paywall sheet.
//
// Asana / pranayama ids must match the items kept FREE in
// src/lib/premiumTiers.js — otherwise tapping the free recommendation
// would itself open the paywall, which would feel like a bait-and-switch.
const NUDGE_BY_VIKRITI = {
  vata: {
    headline:   'Your Vata is running high.',
    summary:    'Anxiety, scattered focus, light sleep — your week reads as Vata aggravation. Grounding helps.',
    accentHex:  '#3d5a73',
    barColor:   'bg-[#7b93a8]',
    bgColor:    'bg-[#e8f0f6]',
    textColor:  'text-[#3d5a73]',
    emoji:      'wind_power',
    free: {
      label:    "Tonight: 5 minutes in Child's Pose",
      route:    '/asana/balasana',
      action:   'Start now',
    },
    plus: {
      label:    'Your 3-day Vata-pacifying protocol',
      sub:      'Warm food, slow stretches, screens off by 9pm.',
    },
  },
  pitta: {
    headline:   'Your Pitta is running high.',
    summary:    'Irritability, intensity, heat — your week reads as Pitta aggravation. Cool it down.',
    accentHex:  '#8b5a2b',
    barColor:   'bg-[#c47a3a]',
    bgColor:    'bg-[#fef3e2]',
    textColor:  'text-[#8b5a2b]',
    emoji:      'local_fire_department',
    free: {
      // Nadi Shodhana is in the free pranayama tier — alternate-nostril
      // breath is the classical Pitta-cooling practice.
      label:    'Try 5 minutes of Nadi Shodhana',
      route:    '/pranayama/nadiShodhana',
      action:   'Begin breath',
    },
    plus: {
      label:    'Your 3-day Pitta-cooling protocol',
      sub:      'Cooling foods, moon-salutation flows, evening Sheetali breath.',
    },
  },
  kapha: {
    headline:   'Your Kapha is running high.',
    summary:    'Heaviness, slow starts, withdrawal — your week reads as Kapha aggravation. Spark some heat.',
    accentHex:  '#3d5e34',
    barColor:   'bg-[#6b8f5e]',
    bgColor:    'bg-[#edf5e8]',
    textColor:  'text-[#3d5e34]',
    emoji:      'landscape',
    free: {
      // Tadasana is free; standing energizing pose is the right entry
      // point for Kapha aggravation.
      label:    'Stand in Tadasana — wake the body',
      route:    '/asana/tadasana',
      action:   'Start now',
    },
    plus: {
      label:    'Your 3-day Kapha-energizing protocol',
      sub:      'Sun salutations, pungent spices, early wake, no daytime naps.',
    },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useVikritiSignal() {
  const { user } = useAuth()
  const [state, setState] = useState({
    isLoading:       true,
    hasSignal:       false,
    vikriti:         null,
    evidence:        null,
    recommendations: null,
  })

  useEffect(() => {
    let cancelled = false
    if (!user?.id) {
      setState({ isLoading: false, hasSignal: false, vikriti: null, evidence: null, recommendations: null })
      return
    }

    async function load() {
      const since = new Date()
      since.setDate(since.getDate() - WINDOW_DAYS)

      const { data, error } = await supabase
        .from('user_state_checkins')
        .select('stress_level, energy_level, created_at')
        .eq('user_id', user.id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })

      if (cancelled) return
      if (error) {
        console.error('[vikriti] checkin fetch failed:', error.message)
        setState({ isLoading: false, hasSignal: false, vikriti: null, evidence: null, recommendations: null })
        return
      }

      const signal = detectVikriti(data || [])
      if (!signal) {
        setState({ isLoading: false, hasSignal: false, vikriti: null, evidence: null, recommendations: null })
        return
      }

      setState({
        isLoading:       false,
        hasSignal:       true,
        vikriti:         signal.vikriti,
        evidence:        signal.evidence,
        recommendations: NUDGE_BY_VIKRITI[signal.vikriti],
      })
    }

    load()
    return () => { cancelled = true }
  }, [user?.id])

  return state
}

// ── Pure detection ──────────────────────────────────────────────────────────
// Separated from the hook so tests + the generator script can call it
// directly with fixture data.
export function detectVikriti(checkins) {
  // Keep only rows that have BOTH stress and energy — those are the only
  // rows the 2-D mapping can use. (pre_practice rows usually have both;
  // post_practice rows often have energy only and are dropped here.)
  const valid = checkins.filter(
    c => c.stress_level != null && c.energy_level != null
  )
  if (valid.length < MIN_SAMPLES) return null

  // Distinct calendar days, not just sample count — a user binge-checking
  // five times in one afternoon is still one day's worth of state.
  const distinctDays = new Set(
    valid.map(c => (c.created_at || '').slice(0, 10))
  )
  if (distinctDays.size < MIN_DAYS) return null

  const avgEnergy = mean(valid.map(c => c.energy_level))
  const avgStress = mean(valid.map(c => c.stress_level))

  // ── 2-D quadrant assignment ──
  let vikriti = null
  if (avgEnergy <= LOW  && avgStress >= HIGH) vikriti = 'vata'
  else if (avgEnergy >= HIGH && avgStress >= HIGH) vikriti = 'pitta'
  else if (avgEnergy <= LOW  && avgStress <= LOW)  vikriti = 'kapha'

  if (!vikriti) return null

  // Evidence: how many of the distinct days actually matched the pattern?
  // Used in the card copy ("4 of the last 7 days") so the user sees the
  // pattern, not just our verdict.
  const matchingDays = countMatchingDays(valid, vikriti)

  return {
    vikriti,
    evidence: {
      matchingDays,
      totalDays:  distinctDays.size,
      avgEnergy:  round1(avgEnergy),
      avgStress:  round1(avgStress),
    },
  }
}

function mean(arr) {
  if (!arr.length) return 0
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function round1(n) {
  return Math.round(n * 10) / 10
}

// Group checkins by calendar day, then count days whose average matches
// the inferred vikriti quadrant. More honest evidence than just counting
// rows (which double-counts a binge-checking day).
function countMatchingDays(checkins, vikriti) {
  const byDay = {}
  for (const c of checkins) {
    const day = (c.created_at || '').slice(0, 10)
    if (!byDay[day]) byDay[day] = { e: [], s: [] }
    byDay[day].e.push(c.energy_level)
    byDay[day].s.push(c.stress_level)
  }

  let count = 0
  for (const day of Object.values(byDay)) {
    const e = mean(day.e)
    const s = mean(day.s)
    if (vikriti === 'vata'  && e <= LOW  && s >= HIGH) count++
    if (vikriti === 'pitta' && e >= HIGH && s >= HIGH) count++
    if (vikriti === 'kapha' && e <= LOW  && s <= LOW ) count++
  }
  return count
}
