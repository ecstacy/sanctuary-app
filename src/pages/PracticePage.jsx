import { useReducer, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRoutine, getDoshaTag } from '../data/asanas'
import { useVoiceGuidance } from '../hooks/useVoiceGuidance'
import { useAudio } from '../hooks/useAudio'
import { useWakeLock } from '../hooks/useWakeLock'
import { savePracticeSession } from '../hooks/usePracticeStats'
import PoseFigure from '../components/PoseFigure'
import CircularTimer from '../components/CircularTimer'

// ─── State Machine ──────────────────────────────────────────────────────────

const INITIAL_STATE = {
  status: 'ready',
  currentIndex: 0,
  timeRemaining: 0,
  restTime: 0,
  totalElapsed: 0,
  completedAsanas: [],
  isPaused: false,
  showInfo: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...state, status: 'active', timeRemaining: action.duration, isPaused: false }
    case 'TICK':
      if (state.isPaused) return state
      return {
        ...state,
        timeRemaining: Math.max(0, state.timeRemaining - 1),
        restTime: state.status === 'resting' ? Math.max(0, state.restTime - 1) : 0,
        totalElapsed: state.totalElapsed + 1,
      }
    case 'PAUSE':
      return { ...state, isPaused: !state.isPaused }
    case 'COMPLETE_ASANA': {
      const completed = [
        ...state.completedAsanas,
        { id: action.id, actualDuration: action.actualDuration, skipped: false },
      ]
      if (action.isLast) return { ...state, status: 'complete', completedAsanas: completed }
      return { ...state, status: 'resting', restTime: 15, timeRemaining: 0, completedAsanas: completed }
    }
    case 'SKIP_ASANA': {
      const completed = [
        ...state.completedAsanas,
        { id: action.id, actualDuration: 0, skipped: true },
      ]
      if (action.isLast) return { ...state, status: 'complete', completedAsanas: completed }
      return { ...state, status: 'resting', restTime: 10, timeRemaining: 0, completedAsanas: completed }
    }
    case 'NEXT_ASANA':
      return { ...state, status: 'active', currentIndex: state.currentIndex + 1, timeRemaining: action.duration, restTime: 0, isPaused: false, showInfo: false }
    case 'REPEAT':
      return { ...state, timeRemaining: action.duration, isPaused: false }
    case 'TOGGLE_INFO':
      return { ...state, showInfo: !state.showInfo }
    case 'SKIP_REST':
      return { ...state, status: 'active', currentIndex: state.currentIndex + 1, timeRemaining: action.duration, restTime: 0, isPaused: false, showInfo: false }
    default:
      return state
  }
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PracticePage() {
  const navigate = useNavigate()
  const { id: routineKey } = useParams()
  const { profile } = useAuth()
  const voice = useVoiceGuidance()
  const audio = useAudio()
  useWakeLock()

  const routine = getRoutine(routineKey || 'stress')
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const timerRef = useRef(null)
  const voicePlayedRef = useRef({})
  const userDosha = profile?.dosha_details?.primary || profile?.dosha?.toLowerCase() || null

  const { status, currentIndex, timeRemaining, restTime, totalElapsed, completedAsanas, isPaused, showInfo } = state
  const currentAsana = routine.asanas[currentIndex]
  const isLast = currentIndex >= routine.asanas.length - 1
  const nextAsana = !isLast ? routine.asanas[currentIndex + 1] : null

  // ── Timer ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'active' || status === 'resting') {
      timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [status])

  // ── Audio ticks during active ───────────────────────────────────────────
  useEffect(() => {
    if (status !== 'active' || isPaused) return

    // Tick sound every second
    if (timeRemaining > 0 && timeRemaining < currentAsana.durationSeconds) {
      audio.tick()
    }

    // Countdown beeps for last 5 seconds
    if (timeRemaining > 0 && timeRemaining <= 5) {
      audio.countdown()
    }
  }, [timeRemaining, status, isPaused])

  // ── Auto-advance when timer hits 0 ──────────────────────────────────────
  useEffect(() => {
    if (status === 'active' && timeRemaining === 0 && currentAsana) {
      audio.bell()
      dispatch({
        type: 'COMPLETE_ASANA',
        id: currentAsana.id,
        actualDuration: currentAsana.durationSeconds,
        isLast,
      })
    }
  }, [status, timeRemaining])

  useEffect(() => {
    if (status === 'resting' && restTime === 0 && nextAsana) {
      audio.chime()
      dispatch({ type: 'NEXT_ASANA', duration: nextAsana.durationSeconds })
    }
  }, [status, restTime])

  // ── Voice cues ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'active' || !currentAsana) return
    const key = `${currentIndex}`

    if (!voicePlayedRef.current[key + '-enter']) {
      voicePlayedRef.current[key + '-enter'] = true
      voice.speak(`${currentAsana.english}. ${currentAsana.voiceCues.enter}`)
    }

    const holdMark = Math.floor(currentAsana.durationSeconds * 0.75)
    if (timeRemaining === holdMark && !voicePlayedRef.current[key + '-hold']) {
      voicePlayedRef.current[key + '-hold'] = true
      voice.speak(currentAsana.voiceCues.hold)
    }

    const breatheMark = Math.floor(currentAsana.durationSeconds * 0.5)
    if (timeRemaining === breatheMark && !voicePlayedRef.current[key + '-breathe']) {
      voicePlayedRef.current[key + '-breathe'] = true
      voice.speak(currentAsana.voiceCues.breathe)
    }

    if (timeRemaining === 8 && !voicePlayedRef.current[key + '-exit']) {
      voicePlayedRef.current[key + '-exit'] = true
      voice.speak(currentAsana.voiceCues.exit)
    }
  }, [status, timeRemaining, currentIndex])

  // ── Completion sound ────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'complete') {
      audio.complete()
      voice.speak('Practice complete. Namaste. Your body and mind thank you.')
    }
  }, [status])

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleStart = useCallback(() => {
    audio.init()
    audio.bell()
    dispatch({ type: 'START', duration: currentAsana.durationSeconds })
  }, [currentAsana, audio])

  const handleDone = useCallback(() => {
    voice.stop()
    audio.bell()
    dispatch({
      type: 'COMPLETE_ASANA',
      id: currentAsana.id,
      actualDuration: currentAsana.durationSeconds - timeRemaining,
      isLast,
    })
  }, [currentAsana, timeRemaining, isLast, voice, audio])

  const handleSkip = useCallback(() => {
    voice.stop()
    dispatch({ type: 'SKIP_ASANA', id: currentAsana.id, isLast })
  }, [currentAsana, isLast, voice])

  const handleRepeat = useCallback(() => {
    voicePlayedRef.current = {}
    audio.chime()
    dispatch({ type: 'REPEAT', duration: currentAsana.durationSeconds })
  }, [currentAsana, audio])

  const handleExit = useCallback(() => {
    voice.stop()
    navigate(-1)
  }, [navigate, voice])

  // ═════════════════════════════════════════════════════════════════════════
  // READY STATE
  // ═════════════════════════════════════════════════════════════════════════
  if (status === 'ready') {
    return (
      <div className="h-[100dvh] bg-background text-on-surface font-body flex flex-col">
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <button onClick={handleExit} className="text-on-surface-variant">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
          <span className="font-headline italic text-primary text-base">{routine.label}</span>
          <button onClick={voice.toggle} className="text-on-surface-variant">
            <span className="material-symbols-outlined text-xl">{voice.enabled ? 'volume_up' : 'volume_off'}</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
          <div className="mb-4 stagger-1">
            <PoseFigure poseKey={currentAsana.poseKey} size="lg" breathing />
          </div>
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 stagger-2">Ready to Begin</p>
          <h1 className="font-headline text-2xl text-on-surface text-center mb-1 stagger-2">{routine.label}</h1>
          <p className="font-body text-sm text-on-surface-variant text-center mb-1 stagger-3">
            {routine.asanas.length} poses · {formatDuration(routine.totalDuration)}
          </p>
          <p className="font-body text-xs text-on-surface-variant/50 text-center mb-4 stagger-3">
            Starting with: {currentAsana.english}
          </p>

          <div className="flex items-center gap-2 bg-surface-container rounded-full px-4 py-2 mb-4 stagger-4">
            <span className="material-symbols-outlined text-primary text-sm">{voice.enabled ? 'volume_up' : 'volume_off'}</span>
            <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">
              Voice guidance {voice.enabled ? 'on' : 'off'}
            </span>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={handleStart}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all flex items-center justify-center gap-2 stagger-5"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            Start Practice
          </button>
        </div>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════════════════
  // COMPLETE STATE
  // ═════════════════════════════════════════════════════════════════════════
  if (status === 'complete') {
    const completedCount = completedAsanas.filter(a => !a.skipped).length
    const skippedCount = completedAsanas.filter(a => a.skipped).length
    const totalTime = completedAsanas.reduce((sum, a) => sum + a.actualDuration, 0)

    // Save session to practice history (runs once via useEffect-like pattern)
    if (!window.__sanctuarySaved?.[routineKey + totalTime]) {
      if (!window.__sanctuarySaved) window.__sanctuarySaved = {}
      window.__sanctuarySaved[routineKey + totalTime] = true
      savePracticeSession({
        routineKey,
        routineLabel: routine.label,
        durationSeconds: totalTime,
        completedCount,
        skippedCount,
        totalPoses: routine.asanas.length,
        asanas: completedAsanas.map((ca, i) => ({
          id: routine.asanas[i]?.id,
          sanskrit: routine.asanas[i]?.sanskrit,
          actualDuration: ca.actualDuration,
          skipped: ca.skipped,
        })),
      })
    }

    return (
      <div className="min-h-screen bg-background text-on-surface font-body pb-12">
        <div className={`relative bg-gradient-to-b ${routine.gradient} px-6 pt-14 pb-16 overflow-hidden text-center`}>
          <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-white/8 animate-quiz-float" />
          <div className="relative z-10">
            <div className="w-18 h-18 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 stagger-1" style={{ width: 72, height: 72 }}>
              <span className="material-symbols-outlined text-white text-3xl">self_improvement</span>
            </div>
            <p className="font-label text-[10px] text-white/60 uppercase tracking-widest mb-1 stagger-2">Practice Complete</p>
            <h1 className="font-headline text-3xl text-white mb-2 stagger-2">Namaste</h1>
            <p className="font-body text-sm text-white/75 stagger-3">
              You completed your {routine.label.toLowerCase()} practice.
            </p>
          </div>
        </div>

        <div className="px-6 -mt-5">
          <div className="grid grid-cols-3 gap-3 mb-5 stagger-4">
            <div className="bg-surface rounded-lg p-3 text-center shadow-sm">
              <p className="font-headline text-xl text-on-surface">{formatDuration(totalTime)}</p>
              <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest mt-0.5">Duration</p>
            </div>
            <div className="bg-surface rounded-lg p-3 text-center shadow-sm">
              <p className="font-headline text-xl text-on-surface">{completedCount}</p>
              <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest mt-0.5">Completed</p>
            </div>
            <div className="bg-surface rounded-lg p-3 text-center shadow-sm">
              <p className="font-headline text-xl text-on-surface">{skippedCount}</p>
              <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest mt-0.5">Skipped</p>
            </div>
          </div>

          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-3 stagger-5">Summary</p>
          <div className="flex flex-col gap-1.5 mb-6 stagger-5">
            {completedAsanas.map((ca, i) => {
              const asana = routine.asanas[i]
              return (
                <div key={i} className="flex items-center gap-3 bg-surface-container rounded-lg px-4 py-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${ca.skipped ? 'bg-surface-container-high text-on-surface-variant/40' : 'bg-primary text-on-primary'}`}>
                    <span className="material-symbols-outlined text-xs">{ca.skipped ? 'skip_next' : 'check'}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`font-body text-sm ${ca.skipped ? 'text-on-surface-variant/50' : 'text-on-surface'}`}>{asana?.sanskrit}</p>
                  </div>
                  <p className="font-label text-[10px] text-on-surface-variant/50 uppercase">
                    {ca.skipped ? 'Skipped' : formatDuration(ca.actualDuration)}
                  </p>
                </div>
              )
            })}
          </div>

          <button onClick={() => navigate('/home', { replace: true })} className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all mb-3 stagger-6">
            Back to Home
          </button>
          <button onClick={() => { window.location.href = `/practice/${routineKey}` }} className="w-full py-3 text-center text-xs text-on-surface-variant/50 font-label uppercase tracking-widest">
            Repeat Practice
          </button>
        </div>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════════════════
  // RESTING STATE
  // ═════════════════════════════════════════════════════════════════════════
  if (status === 'resting') {
    return (
      <div className="h-[100dvh] bg-background text-on-surface font-body flex flex-col items-center justify-center px-6">
        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">Rest</p>
        <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-6">
          <span className="font-headline text-3xl text-on-surface">{restTime}</span>
        </div>

        {nextAsana && (
          <div className="bg-surface-container rounded-lg p-4 max-w-xs w-full mx-auto mb-6">
            <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-3 text-center">Next Up</p>
            <div className="flex justify-center mb-2">
              <PoseFigure poseKey={nextAsana.poseKey} size="sm" breathing={false} />
            </div>
            <p className="font-body font-semibold text-sm text-on-surface text-center">{nextAsana.sanskrit}</p>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5 text-center">
              {nextAsana.english} · {formatDuration(nextAsana.durationSeconds)}
            </p>
          </div>
        )}

        <button
          onClick={() => {
            const next = routine.asanas[currentIndex + 1]
            if (next) {
              audio.chime()
              dispatch({ type: 'SKIP_REST', duration: next.durationSeconds })
            }
          }}
          className="px-8 py-3 bg-surface-container rounded-full font-label text-xs text-on-surface-variant uppercase tracking-widest active:scale-95 transition-all"
        >
          Skip Rest
        </button>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════════════════
  // ACTIVE STATE — The main workout screen
  // ═════════════════════════════════════════════════════════════════════════
  const doshaTag = userDosha ? getDoshaTag(currentAsana.doshaAffinity[userDosha]) : null

  return (
    <div className="h-[100dvh] bg-background text-on-surface font-body flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 pt-2 pb-1 flex-shrink-0">
        <button onClick={handleExit} className="text-on-surface-variant">
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
        <span className="font-label text-xs text-on-surface-variant">{currentIndex + 1} / {routine.asanas.length}</span>
        <div className="flex items-center gap-3">
          <button onClick={voice.toggle} className="text-on-surface-variant">
            <span className="material-symbols-outlined text-xl">{voice.enabled ? 'volume_up' : 'volume_off'}</span>
          </button>
          <button onClick={() => dispatch({ type: 'PAUSE' })} className="text-on-surface-variant">
            <span className="material-symbols-outlined text-xl">{isPaused ? 'play_arrow' : 'pause'}</span>
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="flex gap-1 px-5 mb-2 flex-shrink-0">
        {routine.asanas.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{
                width: i < currentIndex ? '100%'
                  : i === currentIndex ? `${Math.max(2, (1 - timeRemaining / currentAsana.durationSeconds) * 100)}%`
                  : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0 overflow-y-auto">
        {!showInfo ? (
          <>
            <div className="mb-3">
              <PoseFigure poseKey={currentAsana.poseKey} size="lg" breathing={!isPaused} />
            </div>
            <h2 className="font-headline text-xl text-on-surface text-center mb-0.5">{currentAsana.sanskrit}</h2>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">{currentAsana.english}</p>
            <CircularTimer duration={currentAsana.durationSeconds} remaining={timeRemaining} isPaused={isPaused} size={120} />
          </>
        ) : (
          <div className="w-full max-w-sm overflow-y-auto px-1 py-2" style={{ maxHeight: '55vh' }}>
            <div className="bg-surface-container rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Why This Pose</p>
              </div>
              <p className="font-body text-xs text-on-surface leading-relaxed">{currentAsana.reasoning}</p>
            </div>

            {doshaTag && (
              <div className="bg-surface-container rounded-lg p-4 mb-2">
                <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest mb-2">Dosha Compatibility</p>
                <div className="flex gap-2">
                  {Object.entries(currentAsana.doshaAffinity).map(([d, a]) => {
                    const t = getDoshaTag(a)
                    return (
                      <span key={d} className={`font-label text-[9px] px-2 py-0.5 rounded-full ${t.color} ${d === userDosha ? 'ring-1 ring-primary' : ''}`}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="bg-surface-container rounded-lg p-4 mb-2">
              <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest mb-2">Benefits</p>
              {currentAsana.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                  <span className="material-symbols-outlined text-primary text-xs">check_circle</span>
                  <span className="font-body text-xs text-on-surface">{b}</span>
                </div>
              ))}
            </div>

            <div className="bg-surface-container rounded-lg p-4 mb-2">
              <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest mb-2">Body Focus</p>
              <div className="flex flex-wrap gap-1.5">
                {currentAsana.bodyParts.map((bp, i) => (
                  <span key={i} className="bg-primary-container text-on-primary-container font-label text-[10px] px-2 py-0.5 rounded-full">{bp}</span>
                ))}
              </div>
            </div>

            <div className="text-center py-1">
              <span className="font-headline text-lg text-on-surface">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
              <span className="font-label text-[10px] text-on-surface-variant ml-2">remaining</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom controls — pinned ── */}
      <div className="px-5 pt-2 pb-5 flex-shrink-0 bg-background">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_INFO' })}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 mb-2"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-sm">{showInfo ? 'visibility_off' : 'info'}</span>
          <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
            {showInfo ? 'Show Pose' : 'Why This Pose'}
          </span>
        </button>

        <div className="flex gap-3">
          <button onClick={handleSkip} className="flex-1 py-3 bg-surface-container rounded-full font-label text-xs text-on-surface-variant uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">skip_next</span>
            Skip
          </button>
          <button onClick={handleRepeat} className="py-3 px-4 bg-surface-container rounded-full active:scale-95 transition-all flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-sm">replay</span>
          </button>
          <button onClick={handleDone} className="flex-1 py-3 bg-primary text-on-primary rounded-full font-label text-xs font-semibold uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">check</span>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
