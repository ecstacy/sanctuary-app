import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useVoiceGuidance } from '../hooks/useVoiceGuidance'
import { useAudio } from '../hooks/useAudio'
import { track, EVENTS } from '../lib/track'

// ─────────────────────────────────────────────────────────────────────────────
//  PranayamaPracticeOverlay — voice-guided breath practice
//
//  Two practice modes driven by `pranayama.breathPattern`:
//
//   1. paced — count-based breath cycles (inhale 4 / exhale 6, etc.)
//      State machine cycles through phases (inhale → hold → exhale → hold).
//      Voice cues each phase start. Breathing circle scales with phase.
//      Used by Nadi Shodhana, Ujjayi, Bhramari, Sheetali.
//
//   2. rate — round-based vigorous breathing (Bhastrika, Kapalabhati).
//      Pattern: roundActive (30s) → restBetween (30s) → next round.
//      Voice announces round transitions; no per-breath cues (too fast).
//      Visual is a simple round counter + remaining-seconds tile.
//
//  Voice + audio are gated by the existing useVoiceGuidance / useAudio
//  hooks. If the user has voice off, the overlay still works — silent.
//
//  Analytics: PRACTICE_STARTED / PRACTICE_COMPLETED / PRACTICE_ABANDONED
//  fire with `kind: 'pranayama'` and `pranayama_id` for funnel analysis.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Phase generation ────────────────────────────────────────────────────

function buildPacedPhases(pattern, pranayamaId) {
  const phases = []
  if (pattern.inhale) phases.push({ name: 'inhale', label: 'Inhale', duration: pattern.inhale })
  if (pattern.holdAfterIn) phases.push({ name: 'hold-in', label: 'Hold', duration: pattern.holdAfterIn })
  if (pattern.exhale) phases.push({ name: 'exhale', label: 'Exhale', duration: pattern.exhale })
  if (pattern.holdAfterEx) phases.push({ name: 'hold-out', label: 'Hold', duration: pattern.holdAfterEx })

  // Nadi Shodhana alternates nostrils — annotate the labels so the voice
  // coach can announce side. Other paced practices use both nostrils.
  if (pranayamaId === 'nadiShodhana') {
    // We'll handle the nostril alternation in the side-aware label getter
    return phases.map(p => ({ ...p, alternates: true }))
  }
  return phases
}

function buildRateRounds(pattern) {
  const rounds = []
  for (let i = 0; i < pattern.rounds; i++) {
    rounds.push({ kind: 'active', duration: pattern.roundSeconds, index: i + 1 })
    if (i < pattern.rounds - 1) {
      rounds.push({ kind: 'rest', duration: pattern.restBetweenRounds })
    }
  }
  return rounds
}

// ─── Side-aware label for Nadi Shodhana ──────────────────────────────────
// Cycle: in-LEFT → out-RIGHT → in-RIGHT → out-LEFT (one full nadi shodhana round)
function nadiShodhanaSideLabel(phaseIndex, halfRoundIndex, basePhaseName, baseLabel) {
  // halfRoundIndex 0 = left-side half, 1 = right-side half
  // basePhaseName ∈ {'inhale','exhale'}
  const startsLeft = halfRoundIndex === 0
  if (basePhaseName === 'inhale')  return startsLeft ? 'Inhale through the left' : 'Inhale through the right'
  if (basePhaseName === 'exhale')  return startsLeft ? 'Exhale through the right' : 'Exhale through the left'
  return baseLabel
}

// ─── Main overlay ───────────────────────────────────────────────────────

export default function PranayamaPracticeOverlay({ pranayama, onClose }) {
  const voice = useVoiceGuidance()
  const audio = useAudio()

  const isPaced = pranayama.breathPattern === 'paced'
  const isRate  = pranayama.breathPattern === 'rate'

  const totalSeconds = pranayama.durationSeconds || 300
  const [remaining, setRemaining] = useState(totalSeconds)
  const [paused, setPaused]       = useState(false)
  const [started, setStarted]     = useState(false)

  // For paced mode
  const phases = useMemo(() => isPaced ? buildPacedPhases(pranayama.pattern || {}, pranayama.id) : [], [isPaced, pranayama])
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [phaseRemaining, setPhaseRemaining] = useState(phases[0]?.duration || 0)
  const phaseAdvanceRef = useRef(false) // guard so we don't double-advance on tick

  // For rate mode
  const rateRounds = useMemo(() => isRate ? buildRateRounds(pranayama.pattern || {}) : [], [isRate, pranayama])
  const [roundIndex, setRoundIndex] = useState(0)
  const [roundRemaining, setRoundRemaining] = useState(rateRounds[0]?.duration || 0)
  const lastRoundCueRef = useRef(-1)

  // Track full breath-cycle completions for nadi shodhana side-alternation.
  // A full nadi shodhana ROUND = 4 phases (in-L, out-R, in-R, out-L) when
  // hold phases aren't used. With holds, it's still 4 active phases per
  // full round; we use phaseIndex modulo phases.length to know which.
  const halfRoundRef = useRef(0) // 0 = left-side half, 1 = right-side half

  // ── Mount: track + speak intro ──────────────────────────────────────
  useEffect(() => {
    track(EVENTS.PRACTICE_STARTED, {
      kind:             'pranayama',
      pranayama_id:     pranayama.id,
      duration_seconds: totalSeconds,
      breath_pattern:   pranayama.breathPattern,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Start the practice (after a brief countdown to settle) ──────────
  useEffect(() => {
    if (started) return
    let cancelled = false
    voice.speak(`Begin ${pranayama.english}. Find a comfortable seat.`)
    const settle = setTimeout(() => {
      if (cancelled) return
      setStarted(true)
      if (isPaced && phases[0]) {
        speakPhase(phases[0], 0)
        audio.bell()
      } else if (isRate && rateRounds[0]) {
        speakRoundCue(rateRounds[0], 0)
        audio.bell()
      }
    }, 3500) // 3.5s settle window — long enough for the intro to finish
    return () => { cancelled = true; clearTimeout(settle) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Total countdown tick ────────────────────────────────────────────
  useEffect(() => {
    if (paused || !started) return
    const id = setInterval(() => {
      setRemaining(s => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [paused, started])

  // ── Auto-close when total time runs out ─────────────────────────────
  useEffect(() => {
    if (remaining === 0 && started) handleClose('completed')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, started])

  // ── Paced: phase tick ───────────────────────────────────────────────
  useEffect(() => {
    if (!isPaced || paused || !started) return
    const id = setInterval(() => {
      setPhaseRemaining(t => {
        if (t > 1) return t - 1
        // phase complete — transition
        if (phaseAdvanceRef.current) return 0
        phaseAdvanceRef.current = true
        return 0
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isPaced, paused, started])

  // When phase hits 0, advance to next phase
  useEffect(() => {
    if (!isPaced || phaseRemaining !== 0 || !started) return
    if (!phaseAdvanceRef.current) return
    phaseAdvanceRef.current = false

    // Track half-rounds for nadi shodhana side alternation
    const nextIndex = (phaseIndex + 1) % phases.length
    if (nextIndex === 0) {
      // Just completed a full inhale-exhale cycle (one half round)
      halfRoundRef.current = (halfRoundRef.current + 1) % 2
    }

    setPhaseIndex(nextIndex)
    setPhaseRemaining(phases[nextIndex].duration)
    speakPhase(phases[nextIndex], nextIndex)
    audio.bell()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseRemaining, isPaced, started])

  // ── Rate: round tick ────────────────────────────────────────────────
  useEffect(() => {
    if (!isRate || paused || !started) return
    const id = setInterval(() => {
      setRoundRemaining(t => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [isRate, paused, started])

  useEffect(() => {
    if (!isRate || roundRemaining !== 0 || !started) return
    if (lastRoundCueRef.current === roundIndex) return
    lastRoundCueRef.current = roundIndex

    const nextIndex = roundIndex + 1
    if (nextIndex >= rateRounds.length) return // all rounds done; total countdown will close us

    const nextRound = rateRounds[nextIndex]
    setRoundIndex(nextIndex)
    setRoundRemaining(nextRound.duration)
    speakRoundCue(nextRound, nextIndex)
    audio.bell()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundRemaining, isRate, started])

  // ── Voice helpers ──────────────────────────────────────────────────
  function speakPhase(phase, idx) {
    let label = phase.label
    if (phase.alternates && pranayama.id === 'nadiShodhana') {
      label = nadiShodhanaSideLabel(idx, halfRoundRef.current, phase.name, label)
    }
    voice.speak(label)
  }

  function speakRoundCue(round, idx) {
    if (round.kind === 'active') {
      const isLast = idx === rateRounds.length - 1
      if (isLast) voice.speak(`Final round. Begin.`)
      else        voice.speak(`Round ${round.index}. Begin.`)
    } else {
      voice.speak('Slow down. Rest naturally.')
    }
  }

  // ── Close handler ──────────────────────────────────────────────────
  function handleClose(reason) {
    voice.stop()
    if (reason === 'completed') {
      audio.bell()
      voice.speak('Practice complete.')
      track(EVENTS.PRACTICE_COMPLETED, { kind: 'pranayama', pranayama_id: pranayama.id })
      // Give the closing speech a moment, then close.
      setTimeout(onClose, 1500)
      return
    }
    track(EVENTS.PRACTICE_ABANDONED, {
      kind: 'pranayama',
      pranayama_id: pranayama.id,
      time_remaining_seconds: remaining,
    })
    onClose()
  }

  // ── Visuals ────────────────────────────────────────────────────────

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const totalPct = ((totalSeconds - remaining) / totalSeconds) * 100

  // Breathing-circle scale: expands during inhale, contracts during exhale
  const currentPhase = isPaced ? phases[phaseIndex] : null
  let circleScale = 1
  if (currentPhase) {
    const phaseDuration = currentPhase.duration
    const phaseElapsed  = phaseDuration - phaseRemaining
    const phaseProgress = phaseDuration > 0 ? phaseElapsed / phaseDuration : 0
    if (currentPhase.name === 'inhale')      circleScale = 0.7 + 0.3 * phaseProgress      // 0.7 → 1.0
    else if (currentPhase.name === 'exhale') circleScale = 1.0 - 0.3 * phaseProgress      // 1.0 → 0.7
    else                                      circleScale = currentPhase.name === 'hold-in' ? 1.0 : 0.7
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] bg-background flex flex-col">
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <button
          onClick={() => handleClose('abandoned')}
          aria-label="End practice"
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant active:scale-90"
        >
          <span aria-hidden="true" className="material-symbols-outlined">close</span>
        </button>
        <p className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant">{pranayama.sanskrit}</p>
        <div className="flex items-center gap-1">
          <button
            onClick={voice.toggle}
            aria-label={voice.enabled ? 'Mute voice' : 'Unmute voice'}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant active:scale-90"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-lg">{voice.enabled ? 'volume_up' : 'volume_off'}</span>
          </button>
          <button
            onClick={() => setPaused(p => !p)}
            aria-label={paused ? 'Resume' : 'Pause'}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant active:scale-90"
          >
            <span aria-hidden="true" className="material-symbols-outlined">{paused ? 'play_arrow' : 'pause'}</span>
          </button>
        </div>
      </div>

      {/* ── Hero — circular total countdown + breath circle / round info ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Total-time ring */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="4" fill="none" className="text-surface-container-high" />
            <circle
              cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="4" fill="none"
              className="text-primary"
              strokeDasharray={`${(2 * Math.PI * 92).toFixed(0)} ${(2 * Math.PI * 92).toFixed(0)}`}
              strokeDashoffset={`${((2 * Math.PI * 92) * (1 - totalPct / 100)).toFixed(0)}`}
              strokeLinecap="round"
            />
          </svg>

          {/* Breathing circle (paced only) */}
          {isPaced && (
            <div
              className="absolute w-44 h-44 rounded-full bg-primary-container/40 transition-transform ease-in-out"
              style={{
                transform: `scale(${circleScale})`,
                transitionDuration: `${currentPhase?.duration || 1}s`,
              }}
            />
          )}

          {/* Center label */}
          <div className="relative flex flex-col items-center justify-center text-center px-4">
            {!started ? (
              <>
                <p className="font-headline text-2xl text-on-surface mb-1">Get ready</p>
                <p className="font-body text-xs text-on-surface-variant">Find your seat</p>
              </>
            ) : isPaced ? (
              <>
                <p className="font-headline text-3xl text-on-surface mb-1">
                  {currentPhase?.alternates && pranayama.id === 'nadiShodhana'
                    ? nadiShodhanaSideLabel(phaseIndex, halfRoundRef.current, currentPhase.name, currentPhase.label)
                    : currentPhase?.label || ''}
                </p>
                <p className="font-headline text-5xl text-primary tabular-nums">{phaseRemaining}</p>
              </>
            ) : isRate ? (
              <>
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
                  {rateRounds[roundIndex]?.kind === 'active' ? `Round ${rateRounds[roundIndex].index} of ${pranayama.pattern.rounds}` : 'Rest'}
                </p>
                <p className="font-headline text-5xl text-primary tabular-nums">{roundRemaining}s</p>
                <p className="font-body text-xs text-on-surface-variant mt-2">
                  {rateRounds[roundIndex]?.kind === 'active' ? 'Vigorous breathing' : 'Breathe naturally'}
                </p>
              </>
            ) : null}
          </div>
        </div>

        {/* Total time remaining strip */}
        <div className="mt-8 flex items-baseline gap-2">
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Total</p>
          <p className="font-headline text-2xl text-on-surface tabular-nums">
            {mins}:{secs.toString().padStart(2, '0')}
          </p>
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{paused ? '(Paused)' : 'remaining'}</p>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────── */}
      <div
        className="px-6 pb-6 pt-2 flex-shrink-0"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => handleClose('abandoned')}
          className="w-full py-4 rounded-full bg-surface-container text-on-surface-variant font-label text-sm font-semibold tracking-wide"
        >
          End Practice Early
        </button>
      </div>
    </div>,
    document.body,
  )
}
