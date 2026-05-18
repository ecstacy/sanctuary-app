// ─────────────────────────────────────────────────────────────────────────────
//  DoshaQuizPage — atomic-trait dosha questionnaire (Approach A+B)
//
//  Phases
//  ──────
//  intro       — landing screen, honesty primer, CTA to start
//  quiz        — 15 dosha-blind trait statements, one per screen, 3-point
//                Likert (Yes / Somewhat / Not really), auto-advance on tap
//  calculating — 5s ambient animation while the score settles
//  tiebreaker  — CONDITIONAL: only if top two doshas are within 10 pts.
//                Shows 2-3 forced-choice questions targeted at the close
//                pair specifically. Makes the close-call experience feel
//                like a real practitioner asking follow-ups.
//  result      — DoshaProfileContent renders the full magazine-style page.
//
//  Why no category transitions any more — the legacy quiz had 4 category
//  sections (Body / Mind / Energy / Lifestyle) with transition cards. With
//  15 questions it's overkill; a single progress bar + "n / 15" counter is
//  enough and removes drop-off friction.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { track, EVENTS } from '../lib/track'
import DoshaProfileContent from '../components/DoshaProfileContent'
import {
  TRAIT_QUESTIONS,
  ANSWER_OPTIONS,
  scoreQuiz,
  needsTiebreaker,
  tiebreakersFor,
  labelFor,
} from '../data/doshaQuiz'

// localStorage key for pending dosha when user is anonymous. Picked
// up by SignupPage during signup and migrated to the profile.
const PENDING_DOSHA_KEY = 'sanctuary.pending.dosha'

export default function DoshaQuizPage() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()

  // ── Phase machine ──────────────────────────────────────────────────────
  const [phase, setPhase] = useState('intro')

  // ── Trait quiz state ───────────────────────────────────────────────────
  const [currentQ, setCurrentQ]               = useState(0)
  const [answers, setAnswers]                 = useState({})
  const [selectedOption, setSelectedOption]   = useState(null)
  const [animating, setAnimating]             = useState(false)

  // ── Tiebreaker state ───────────────────────────────────────────────────
  const [tiebreakers, setTiebreakers]               = useState([])
  const [currentTb, setCurrentTb]                   = useState(0)
  const [tiebreakerAnswers, setTiebreakerAnswers]   = useState({})
  const [tbSelected, setTbSelected]                 = useState(null)

  // ── Result + save state ────────────────────────────────────────────────
  const [doshaResult, setDoshaResult] = useState(null)
  const [saving, setSaving]           = useState(false)
  const [calcStep, setCalcStep]       = useState(0)

  const totalQuestions = TRAIT_QUESTIONS.length
  const question       = TRAIT_QUESTIONS[currentQ]
  // Progress includes the tiebreaker pass if one is queued, so the bar
  // doesn't snap back to 0 when the user enters tiebreakers.
  const progress = phase === 'tiebreaker'
    ? 100  // visually pinned; the tiebreaker screen has its own indicator
    : (currentQ / totalQuestions) * 100

  // ── Abandonment tracking ───────────────────────────────────────────────
  // Fires `dosha_quiz_abandoned` on unmount if the user bailed mid-quiz.
  const phaseRef     = useRef(phase)
  const currentQRef  = useRef(currentQ)
  const startedAtRef = useRef(null)
  useEffect(() => { phaseRef.current = phase },       [phase])
  useEffect(() => { currentQRef.current = currentQ }, [currentQ])

  // Fire signup-nudge impression once on the anonymous result.
  const nudgeShownRef = useRef(false)
  useEffect(() => {
    if (phase === 'result' && !user && doshaResult && !nudgeShownRef.current) {
      nudgeShownRef.current = true
      track(EVENTS.SIGNUP_NUDGE_SHOWN, {
        source:          'dosha_quiz_result',
        primary_dosha:   doshaResult.primary,
        secondary_dosha: doshaResult.secondary,
      })
    }
  }, [phase, user, doshaResult])

  useEffect(() => {
    startedAtRef.current = Date.now()
    return () => {
      const lastPhase = phaseRef.current
      if (lastPhase === 'quiz' || lastPhase === 'tiebreaker') {
        const startedAt = startedAtRef.current ?? Date.now()
        track(EVENTS.DOSHA_QUIZ_ABANDONED, {
          last_question_index: currentQRef.current,
          progress_pct:        Math.round((currentQRef.current / totalQuestions) * 100),
          seconds_in:          Math.round((Date.now() - startedAt) / 1000),
          last_phase:          lastPhase,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Quiz interactions ──────────────────────────────────────────────────
  const handleSelect = useCallback((answerValue) => {
    if (animating) return
    setSelectedOption(answerValue)
    setAnimating(true)

    const q = TRAIT_QUESTIONS[currentQ]
    const newAnswers = { ...answers, [q.id]: answerValue }
    setAnswers(newAnswers)

    track(EVENTS.DOSHA_QUIZ_QUESTION_ANSWERED, {
      question_index: currentQ,
      question_id:    q.id,
      category:       q.category,
      answer:         answerValue,
    })

    setTimeout(() => {
      if (currentQ < totalQuestions - 1) {
        setCurrentQ(prev => prev + 1)
        setSelectedOption(null)
        setAnimating(false)
      } else {
        // Score with the trait inventory only — tiebreakers (if needed)
        // get layered on after.
        const preliminary = scoreQuiz(newAnswers)
        setDoshaResult(preliminary)

        track(EVENTS.DOSHA_QUIZ_COMPLETED, {
          primary_dosha: preliminary.primary,
          vata_pct:      preliminary.percentages.vata,
          pitta_pct:     preliminary.percentages.pitta,
          kapha_pct:     preliminary.percentages.kapha,
          top_gap_pct:   preliminary.topGapPct,
          needs_tiebreaker: needsTiebreaker(preliminary),
        })

        // Stage the tiebreaker set so it's ready by the time we exit
        // the calculating animation. If empty, the phase transition
        // below will skip straight to result.
        setTiebreakers(needsTiebreaker(preliminary) ? tiebreakersFor(preliminary) : [])
        setPhase('calculating')
        setAnimating(false)
      }
    }, 350)
  }, [animating, answers, currentQ, totalQuestions])

  const handleBack = useCallback(() => {
    if (animating) return
    if (currentQ > 0) {
      setCurrentQ(prev => prev - 1)
      setSelectedOption(null)
    } else {
      setPhase('intro')
    }
  }, [animating, currentQ])

  // ── Tiebreaker interactions ────────────────────────────────────────────
  const handleTbSelect = useCallback((dosha) => {
    if (animating) return
    const tb = tiebreakers[currentTb]
    setTbSelected(dosha)
    setAnimating(true)

    const next = { ...tiebreakerAnswers, [tb.id]: dosha }
    setTiebreakerAnswers(next)

    track(EVENTS.DOSHA_QUIZ_QUESTION_ANSWERED, {
      question_index: totalQuestions + currentTb,
      question_id:    tb.id,
      category:       'tiebreaker',
      answer:         dosha,
    })

    setTimeout(() => {
      if (currentTb < tiebreakers.length - 1) {
        setCurrentTb(prev => prev + 1)
        setTbSelected(null)
        setAnimating(false)
      } else {
        // Re-score with tiebreaker bonuses applied.
        const final = scoreQuiz(answers, next)
        setDoshaResult(final)
        setPhase('result')
        setAnimating(false)
      }
    }, 350)
  }, [animating, currentTb, tiebreakerAnswers, tiebreakers, answers, totalQuestions])

  // ── Calculating animation ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'calculating') return
    const steps = [
      { delay: 600,  step: 1 },
      { delay: 1800, step: 2 },
      { delay: 3000, step: 3 },
      { delay: 4200, step: 4 },
    ]
    const handles = steps.map(({ delay, step }) =>
      setTimeout(() => setCalcStep(step), delay)
    )
    const exit = setTimeout(() => {
      // If tiebreakers are queued, hop to that phase; otherwise straight
      // to result. doshaResult is already populated with the preliminary
      // (no-tiebreaker) scoring.
      setPhase(tiebreakers.length > 0 ? 'tiebreaker' : 'result')
    }, 5000)
    return () => {
      handles.forEach(clearTimeout)
      clearTimeout(exit)
    }
  }, [phase, tiebreakers.length])

  // ── Save flow ──────────────────────────────────────────────────────────
  async function saveDosha() {
    if (!doshaResult) return

    const label = labelFor(doshaResult)

    // ── Anonymous path ── stash to localStorage + redirect to signup.
    if (!user) {
      setSaving(true)
      try {
        localStorage.setItem(PENDING_DOSHA_KEY, JSON.stringify({
          label,
          percentages: doshaResult.percentages,
          primary:     doshaResult.primary,
          secondary:   doshaResult.secondary,
          tertiary:    doshaResult.tertiary,
          scores:      doshaResult.scores,
          completed_at: new Date().toISOString(),
        }))
      } catch (err) {
        console.error('Failed to stash pending dosha:', err?.message || err)
      }
      track(EVENTS.ANONYMOUS_DOSHA_SAVED, { primary: doshaResult.primary, secondary: doshaResult.secondary })
      track(EVENTS.SIGNUP_NUDGE_TAPPED,   { source: 'dosha_quiz_result', primary: doshaResult.primary })
      navigate('/signup', { replace: true })
      return
    }

    setSaving(true)

    // 1) Denormalized cache on profiles
    const { error } = await supabase
      .from('profiles')
      .update({
        dosha: label,
        dosha_details: {
          percentages: doshaResult.percentages,
          primary:     doshaResult.primary,
          secondary:   doshaResult.secondary,
          tertiary:    doshaResult.tertiary,
        },
      })
      .eq('id', user.id)

    if (error) {
      console.error('Failed to save dosha:', error.message)
      alert('Failed to save: ' + error.message)
      setSaving(false)
      return
    }

    // 2) Immutable assessment row
    const { error: assessErr } = await supabase
      .from('dosha_assessments')
      .insert({
        user_id:         user.id,
        assessment_type: 'prakriti',
        primary_dosha:   doshaResult.primary,
        secondary_dosha: doshaResult.secondary,
        vata_score:      doshaResult.scores.vata,
        pitta_score:     doshaResult.scores.pitta,
        kapha_score:     doshaResult.scores.kapha,
        quiz_version:    'v2',  // bumped: trait inventory + tiebreaker
        raw_details: {
          label,
          percentages:       doshaResult.percentages,
          primary:           doshaResult.primary,
          secondary:         doshaResult.secondary,
          tertiary:          doshaResult.tertiary,
          answers,
          tiebreakerAnswers,
        },
      })
    if (assessErr) console.error('Failed to log dosha assessment:', assessErr.message)

    await refreshProfile()
    navigate('/dosha', { replace: true })
    setSaving(false)
  }

  // ── Reset helper (Retake) ──────────────────────────────────────────────
  function resetQuiz() {
    setPhase('intro')
    setCurrentQ(0)
    setAnswers({})
    setSelectedOption(null)
    setAnimating(false)
    setTiebreakers([])
    setCurrentTb(0)
    setTiebreakerAnswers({})
    setTbSelected(null)
    setDoshaResult(null)
    setCalcStep(0)
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INTRO
  // ═══════════════════════════════════════════════════════════════════════
  if (phase === 'intro') {
    return (
      <div className="h-[100dvh] bg-background text-on-surface font-body flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0">
          <button onClick={() => navigate(-1)} className="text-on-surface-variant" aria-label="Go back">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <span className="font-headline italic text-primary text-base">The Sanctuary</span>
          <div className="w-6" />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col px-6 pb-10">

          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative w-36 h-36 mb-10">
              <div className="absolute inset-0 rounded-full bg-primary-container animate-quiz-pulse" />
              <div className="absolute inset-3 rounded-full bg-primary-fixed-dim animate-quiz-pulse-delay" />
              <div className="absolute inset-6 rounded-full bg-primary/20 animate-quiz-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span aria-hidden="true" className="material-symbols-outlined text-primary text-5xl">spa</span>
              </div>
            </div>

            <p className="font-label text-xs text-primary uppercase tracking-widest mb-3">
              Dosha Discovery
            </p>
            <h1 className="font-headline text-4xl text-on-surface leading-tight mb-4">
              Who are you,<br />
              <span className="italic font-normal text-primary">really?</span>
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs mb-3">
              In Ayurveda, your Dosha is your unique blueprint — the elemental forces that shape your body, mind, and spirit.
            </p>
            {/* Honesty primer: anchors the user to prakriti (lifelong) not
                vikriti (this week's stress). Single line, soft. */}
            <p className="text-on-surface-variant/70 text-[11px] italic leading-relaxed max-w-xs mb-2">
              Answer based on how you've been most of your life — not how you feel this week.
            </p>
            <p className="text-on-surface-variant/50 text-xs leading-relaxed max-w-xs">
              15 questions · about 90 seconds
            </p>
          </div>

          <button
            onClick={() => {
              track(EVENTS.DOSHA_QUIZ_STARTED, { version: 'v2' })
              setPhase('quiz')
            }}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all"
          >
            Discover My Dosha
          </button>

          {profile?.dosha && (
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-center text-xs text-on-surface-variant/50 font-label uppercase tracking-widest"
            >
              Keep current result: {profile.dosha}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CALCULATING
  // ═══════════════════════════════════════════════════════════════════════
  if (phase === 'calculating') {
    const CALC_MESSAGES = [
      { icon: 'auto_awesome',           text: 'Reading your elemental signature...' },
      { icon: 'air',                    text: 'Weighing the winds of Vata...' },
      { icon: 'local_fire_department',  text: 'Measuring the fire of Pitta...' },
      { icon: 'landscape',              text: 'Grounding into Kapha earth...' },
    ]
    return (
      <div className="min-h-screen bg-background text-on-surface font-body flex flex-col items-center justify-center px-6">
        <div className="relative w-40 h-40 mb-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-spin-slow" />
          <div className="absolute inset-4 rounded-full border-2 border-primary/20 animate-spin-slow-reverse" />
          <div className="absolute inset-8 rounded-full bg-primary-container animate-quiz-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-4xl animate-quiz-pulse">
              {CALC_MESSAGES[Math.min(calcStep, 3)]?.icon || 'auto_awesome'}
            </span>
          </div>
          <div className="absolute inset-0 animate-spin-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#7b93a8]" />
          </div>
          <div className="absolute inset-0 animate-spin-slow-reverse">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#c47a3a]" />
          </div>
          <div className="absolute inset-0 animate-spin-slow" style={{ animationDelay: '1s' }}>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#6b8f5e]" />
          </div>
        </div>

        <div className="h-16 flex items-center justify-center">
          {CALC_MESSAGES.map((msg, i) => (
            <p
              key={i}
              className={`font-body text-sm text-on-surface-variant text-center absolute transition-all duration-500 ${
                calcStep === i + 1
                  ? 'opacity-100 translate-y-0'
                  : calcStep > i + 1
                  ? 'opacity-0 -translate-y-4'
                  : 'opacity-0 translate-y-4'
              }`}
            >
              {msg.text}
            </p>
          ))}
        </div>

        <div className="flex gap-2 mt-6">
          {CALC_MESSAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                calcStep > i ? 'w-6 bg-primary' : 'w-1.5 bg-surface-container-high'
              }`}
            />
          ))}
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TIEBREAKER — adaptive disambiguation when the top two doshas are close.
  // Framed as a "quick check" so the user understands why it's happening.
  // ═══════════════════════════════════════════════════════════════════════
  if (phase === 'tiebreaker' && tiebreakers.length > 0) {
    const tb     = tiebreakers[currentTb]
    const tbTotal = tiebreakers.length

    return (
      <div className="h-[100dvh] bg-background text-on-surface font-body flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
          <div className="w-6" />
          <span className="font-label text-[10px] text-primary uppercase tracking-widest">
            Quick Check
          </span>
          <span className="font-label text-xs text-on-surface-variant/50 tabular-nums">
            {currentTb + 1} / {tbTotal}
          </span>
        </div>

        {/* Progress bar — completed quiz portion + tiebreaker progression */}
        <div className="px-6 mb-1 flex-shrink-0">
          <div className="h-1 bg-surface-container-high rounded-full overflow-hidden flex">
            <div className="h-full bg-primary/40 rounded-l-full" style={{ width: '80%' }} />
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((currentTb + 1) / tbTotal) * 20}%` }}
            />
          </div>
        </div>

        <div
          key={currentTb}
          className="flex-1 overflow-y-auto min-h-0 flex flex-col px-6 pt-8 pb-8 animate-quiz-enter"
        >
          {/* Context: only show on the first tiebreaker */}
          {currentTb === 0 && (
            <p className="font-body text-[12px] text-on-surface-variant/70 italic mb-5 max-w-prose leading-relaxed">
              Your top two doshas are close. A few more questions to dial it in.
            </p>
          )}

          <h2 className="font-headline text-2xl text-on-surface leading-snug mb-10 max-w-prose">
            {tb.prompt}
          </h2>

          <div className="mt-auto flex flex-col gap-3">
            {tb.options.map((option) => {
              const isSelected = tbSelected === option.dosha
              return (
                <button
                  key={option.dosha}
                  onClick={() => handleTbSelect(option.dosha)}
                  disabled={animating}
                  className={`w-full py-4 px-5 rounded-2xl text-left font-body text-sm leading-snug transition-all duration-300 ${
                    isSelected
                      ? 'bg-primary text-on-primary scale-[0.98]'
                      : animating
                      ? 'bg-surface-container-low opacity-40 scale-[0.97]'
                      : 'bg-surface-container active:scale-[0.98]'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RESULT — delegates to DoshaProfileContent (the same component used by
  // the logged-in DoshaProfilePage).
  // ═══════════════════════════════════════════════════════════════════════
  if (phase === 'result' && doshaResult) {
    const label = labelFor(doshaResult)
    const { percentages, primary, secondary, tertiary } = doshaResult

    const resultFooter = (
      <div className="pb-2">
        {!user && (
          <div className="bg-primary-container/40 border border-primary/15 rounded-xl px-4 py-3 mb-3">
            <p className="font-label text-[10px] uppercase tracking-wider text-primary mb-1">Save your result</p>
            <p className="font-body text-xs text-on-surface leading-relaxed">
              Create a free account to keep your dosha, track your practice, and personalize every recommendation.
            </p>
          </div>
        )}
        <button
          onClick={() => {
            track(EVENTS.CTA_CLICKED, {
              cta_id:        user ? 'dosha_save' : 'dosha_signup_to_save',
              primary_dosha: doshaResult?.primary,
              anonymous:     !user,
            })
            saveDosha()
          }}
          disabled={saving}
          className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all disabled:opacity-50 mb-3"
        >
          {saving ? 'Saving...' : (user ? 'Save My Dosha Profile' : 'Create Account to Save')}
        </button>
        <button
          onClick={resetQuiz}
          className="w-full py-3 text-center text-xs text-on-surface-variant/50 font-label uppercase tracking-widest mb-8"
        >
          Retake the quiz
        </button>
      </div>
    )

    return (
      <DoshaProfileContent
        doshaLabel={label}
        primary={primary}
        secondary={secondary}
        tertiary={tertiary}
        percentages={percentages}
        onBack={() => setPhase('intro')}
        footerSlot={resultFooter}
      />
    )
  }

  // ═══════════════════════════════════════════════════════════════════════
  // QUIZ — one trait statement per screen, three answer buttons
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="h-[100dvh] bg-background text-on-surface font-body flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <button onClick={handleBack} className="text-on-surface-variant" aria-label="Previous question">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
          Discovery
        </span>
        <span className="font-label text-xs text-on-surface-variant/50 tabular-nums" aria-live="polite">
          {currentQ + 1} / {totalQuestions}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-6 mb-1 flex-shrink-0">
        <div
          className="h-1 bg-surface-container-high rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question content */}
      <div
        key={currentQ}
        className="flex-1 overflow-y-auto min-h-0 flex flex-col px-6 pt-10 pb-8 animate-quiz-enter"
      >
        {/* Honesty primer on first question — same line as intro, reinforces
            "answer for your lifelong tendency, not this week". After question
            1 it disappears so the rapid-tap flow isn't slowed down. */}
        {currentQ === 0 && (
          <p className="font-body text-[11px] text-on-surface-variant/60 italic mb-5 max-w-prose leading-relaxed">
            Lifelong tendency, not this week.
          </p>
        )}

        {/* The statement */}
        <h2 className="font-headline text-2xl text-on-surface leading-snug mb-10 max-w-prose">
          {question.text}
        </h2>

        {/* Three answer buttons, big & tappable, auto-advance on tap.
            Yes / Somewhat / Not really — 'Somewhat' is the critical
            middle ground the legacy 1-of-3 quiz lacked. */}
        <div className="mt-auto flex flex-col gap-3">
          {ANSWER_OPTIONS.map((option) => {
            const isSelected = selectedOption === option.value
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                disabled={animating}
                aria-label={option.label}
                className={`w-full py-4 rounded-full font-label font-semibold text-sm tracking-wide transition-all duration-300 ${
                  isSelected
                    ? 'bg-primary text-on-primary scale-[0.98]'
                    : animating
                    ? 'bg-surface-container-low opacity-40 scale-[0.97]'
                    : 'bg-surface-container active:scale-[0.98]'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
