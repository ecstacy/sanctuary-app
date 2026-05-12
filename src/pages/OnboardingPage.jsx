import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { track, EVENTS } from '../lib/track'

// ─────────────────────────────────────────────────────────────────────────────
//  OnboardingPage — first-time visitor's value-proposition tour
//
//  4 slides, swipeable + tap-next:
//   1. The promise (personalized practice for your dosha)
//   2. Yoga + breathwork (HYP-rooted, modern packaging)
//   3. Daily ritual (Charaka's dinacharya — diet, routine, practice)
//   4. CTA — "Find your dosha" → /quiz (anonymous-friendly)
//
//  Sets `sanctuary.onboarding.seen=true` on completion OR skip so the
//  user doesn't see it again. WelcomePage checks this flag.
//
//  Public route. Analytics: ONBOARDING_STARTED on mount,
//  ONBOARDING_SLIDE_VIEWED on each slide change, ONBOARDING_COMPLETED
//  on final CTA, ONBOARDING_SKIPPED on skip button or back-out.
// ─────────────────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    icon: 'spa',
    eyebrow: 'Welcome to The Sanctuary',
    title: 'A practice as unique as you',
    body: 'We blend ancient yogic tradition with Ayurvedic wisdom — then tailor it to your body, your day, and your goals.',
    accent: 'from-[#6b8f5e] to-[#b8d4a8]',
  },
  {
    icon: 'self_improvement',
    eyebrow: 'Step 1 of 3',
    title: 'Yoga that meets you where you are',
    body: 'Hatha Yoga Pradipika postures, voice-guided so you can practice eyes-closed. Pranayama, asanas, and full routines — all paced to your level.',
    accent: 'from-[#7b93a8] to-[#b8d4e8]',
  },
  {
    icon: 'restaurant',
    eyebrow: 'Step 2 of 3',
    title: 'Eat and live by your nature',
    body: 'Foods to favour, daily routines, seasonal guidance — drawn directly from Charaka Samhita and made practical for modern life.',
    accent: 'from-[#c47a3a] to-[#f0c987]',
  },
  {
    icon: 'auto_awesome',
    eyebrow: 'Step 3 of 3',
    title: 'Let\'s find your dosha',
    body: 'A short 8-question quiz reveals your Ayurvedic constitution — the foundation everything else builds on. Takes about 3 minutes.',
    accent: 'from-[#5c4e8a] to-[#9b8fd4]',
    isFinal: true,
  },
]

const SEEN_KEY = 'sanctuary.onboarding.seen'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [idx, setIdx] = useState(0)
  const startRef = useRef(false)
  const touchStartX = useRef(null)

  // Already authenticated users skip onboarding entirely — they've
  // already made the trust decision; show them /home directly.
  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true })
      return
    }
    if (!startRef.current) {
      startRef.current = true
      track(EVENTS.ONBOARDING_STARTED, {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    track(EVENTS.ONBOARDING_SLIDE_VIEWED, { slide_index: idx, total_slides: SLIDES.length })
  }, [idx])

  function markSeen() {
    try { localStorage.setItem(SEEN_KEY, '1') } catch { /* storage unavailable */ }
  }

  function complete() {
    markSeen()
    track(EVENTS.ONBOARDING_COMPLETED, {})
    navigate('/quiz')
  }

  function skip() {
    markSeen()
    track(EVENTS.ONBOARDING_SKIPPED, { last_slide_index: idx })
    navigate('/')
  }

  function next() {
    if (idx < SLIDES.length - 1) setIdx(idx + 1)
    else complete()
  }

  function prev() {
    if (idx > 0) setIdx(idx - 1)
  }

  // Touch-swipe support — horizontal swipe ≥40px to advance
  function onTouchStart(e) { touchStartX.current = e.changedTouches[0].clientX }
  function onTouchEnd(e) {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) < 40) return
    if (dx < 0) next()
    else prev()
    touchStartX.current = null
  }

  const slide = SLIDES[idx]

  return (
    <div
      className="h-[100dvh] bg-background text-on-surface font-body flex flex-col overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar — skip button only, no back (intentional one-way flow) */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1 flex-shrink-0">
        <button
          onClick={prev}
          disabled={idx === 0}
          aria-label="Previous slide"
          className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-90 ${
            idx === 0 ? 'opacity-0 pointer-events-none' : 'text-on-surface-variant'
          }`}
        >
          <span aria-hidden="true" className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="font-headline italic text-primary text-base">The Sanctuary</span>
        <button
          onClick={skip}
          className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant px-3 py-1"
          aria-label="Skip onboarding"
        >
          Skip
        </button>
      </div>

      {/* Hero — full-bleed colored block per slide */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
        <div className={`relative w-44 h-44 rounded-full bg-gradient-to-br ${slide.accent} flex items-center justify-center mb-10 stagger-1`}>
          <span aria-hidden="true" className="material-symbols-outlined text-white text-6xl">
            {slide.icon}
          </span>
          {/* Decorative breathing ring */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${slide.accent} opacity-20 animate-ritual-glow`} />
        </div>

        <p className="font-label text-[10px] text-primary uppercase tracking-widest mb-2 stagger-2">
          {slide.eyebrow}
        </p>
        <h1 className="font-headline text-3xl text-on-surface text-center leading-tight mb-4 px-2 stagger-3 max-w-sm">
          {slide.title}
        </h1>
        <p className="font-body text-sm text-on-surface-variant text-center leading-relaxed max-w-xs stagger-4">
          {slide.body}
        </p>
      </div>

      {/* Dots + CTA */}
      <div className="px-6 pb-8 flex-shrink-0" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-5" aria-label={`Slide ${idx + 1} of ${SLIDES.length}`}>
          {SLIDES.map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? 'w-6 bg-primary' : 'w-1.5 bg-on-surface-variant/30'
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={next}
          className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-[0.98] transition-all"
        >
          {slide.isFinal ? 'Find My Dosha' : 'Next'}
        </button>

        {/* Already-have-account link on final slide */}
        {slide.isFinal && (
          <button
            onClick={() => { markSeen(); navigate('/login') }}
            className="w-full mt-3 py-3 font-label text-[11px] text-on-surface-variant uppercase tracking-wider"
          >
            I already have an account
          </button>
        )}
      </div>
    </div>
  )
}
