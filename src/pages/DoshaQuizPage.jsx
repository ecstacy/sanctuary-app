import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// ─── Quiz Data ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'body', label: 'Body', icon: 'accessibility_new' },
  { id: 'mind', label: 'Mind', icon: 'psychology' },
  { id: 'energy', label: 'Energy', icon: 'bolt' },
  { id: 'lifestyle', label: 'Lifestyle', icon: 'spa' },
]

const QUESTIONS = [
  // ── Body (3 questions) ──
  {
    category: 'body',
    question: 'When you look in the mirror, your frame is...',
    subtitle: 'Be honest. The mirror never lies.',
    icon: 'straighten',
    options: [
      { label: 'Light & lean', desc: 'Narrow shoulders, visible bones, limbs for days', dosha: 'vata', icon: 'expand' },
      { label: 'Medium & athletic', desc: 'Proportioned build, muscle comes easily', dosha: 'pitta', icon: 'fitness_center' },
      { label: 'Solid & sturdy', desc: 'Broad frame, naturally strong, curves in the right places', dosha: 'kapha', icon: 'shield' },
    ],
  },
  {
    category: 'body',
    question: 'Your skin tends to be...',
    subtitle: 'Your skin tells your constitution\'s story.',
    icon: 'dermatology',
    options: [
      { label: 'Dry & cool', desc: 'Craves moisture, rough patches, feels the cold', dosha: 'vata', icon: 'ac_unit' },
      { label: 'Warm & sensitive', desc: 'Flushes easily, prone to redness, sunburn-prone', dosha: 'pitta', icon: 'local_fire_department' },
      { label: 'Smooth & supple', desc: 'Naturally moisturised, thick, glowing', dosha: 'kapha', icon: 'water_drop' },
    ],
  },
  {
    category: 'body',
    question: 'Your appetite is...',
    subtitle: 'The belly knows what the belly wants.',
    icon: 'restaurant',
    options: [
      { label: 'Irregular & unpredictable', desc: 'Sometimes starving, sometimes forgetting to eat entirely', dosha: 'vata', icon: 'shuffle' },
      { label: 'Strong & punctual', desc: 'Hangry is a real state of emergency. Do not skip meals.', dosha: 'pitta', icon: 'alarm' },
      { label: 'Steady & moderate', desc: 'Can skip meals without drama, slow to get hungry', dosha: 'kapha', icon: 'timelapse' },
    ],
  },

  // ── Mind (3 questions) ──
  {
    category: 'mind',
    question: 'Under stress, you typically...',
    subtitle: 'We all have our signature stress move.',
    icon: 'psychology_alt',
    options: [
      { label: 'Worry & overthink', desc: 'Mind races at 3am, anxiety spirals, "what if" on repeat', dosha: 'vata', icon: 'cloud' },
      { label: 'Get irritable & sharp', desc: 'Short fuse, frustrated, need to fix everything NOW', dosha: 'pitta', icon: 'flash_on' },
      { label: 'Withdraw & shut down', desc: 'Go quiet, comfort eat, resist any change', dosha: 'kapha', icon: 'do_not_disturb' },
    ],
  },
  {
    category: 'mind',
    question: 'Your mind works like a...',
    subtitle: 'Every brain has its own operating system.',
    icon: 'memory',
    options: [
      { label: 'Hummingbird', desc: 'Quick, darting, creative bursts — a thousand tabs open', dosha: 'vata', icon: 'flutter_dash' },
      { label: 'Laser beam', desc: 'Focused, sharp, strategic — one goal at a time', dosha: 'pitta', icon: 'track_changes' },
      { label: 'Deep lake', desc: 'Calm, reflective, steady — slow to start, never forgets', dosha: 'kapha', icon: 'water' },
    ],
  },
  {
    category: 'mind',
    question: 'Your sleep pattern is...',
    subtitle: 'The night reveals what the day conceals.',
    icon: 'bedtime',
    options: [
      { label: 'Light & interrupted', desc: 'Takes forever to fall asleep, wakes at every creak', dosha: 'vata', icon: 'visibility' },
      { label: 'Moderate & efficient', desc: 'Falls asleep on schedule, 6-7 hours does the job', dosha: 'pitta', icon: 'schedule' },
      { label: 'Deep & heavy', desc: 'Sleeps through earthquakes, needs two alarms minimum', dosha: 'kapha', icon: 'snooze' },
    ],
  },

  // ── Energy (2 questions) ──
  {
    category: 'energy',
    question: 'Your natural energy pattern is...',
    subtitle: 'Are you a sparkler or a slow-burning candle?',
    icon: 'electric_bolt',
    options: [
      { label: 'Bursts & crashes', desc: 'Quick surges of energy followed by "I need a nap"', dosha: 'vata', icon: 'show_chart' },
      { label: 'Intense & driven', desc: 'High-octane all day, sometimes burns too hot', dosha: 'pitta', icon: 'trending_up' },
      { label: 'Slow & enduring', desc: 'Takes time to warm up, but keeps going like a diesel', dosha: 'kapha', icon: 'horizontal_rule' },
    ],
  },
  {
    category: 'energy',
    question: 'In cold weather, you...',
    subtitle: 'Your relationship with winter says a lot.',
    icon: 'thermostat',
    options: [
      { label: 'Freeze instantly', desc: 'Cold hands, cold feet, cold soul. Layer everything.', dosha: 'vata', icon: 'severe_cold' },
      { label: 'Handle it fine', desc: 'Actually prefer cool weather, built-in radiator', dosha: 'pitta', icon: 'thermostat_auto' },
      { label: 'Tolerate it well', desc: 'Don\'t love it, but rarely shiver. Natural insulation.', dosha: 'kapha', icon: 'cloudy' },
    ],
  },

  // ── Lifestyle (2 questions) ──
  {
    category: 'lifestyle',
    question: 'Your ideal weekend looks like...',
    subtitle: 'Guilty pleasures reveal constitutional truths.',
    icon: 'weekend',
    options: [
      { label: 'Adventure & spontaneity', desc: 'New places, new experiences, can\'t sit still', dosha: 'vata', icon: 'paragliding' },
      { label: 'Goals & projects', desc: 'Productive brunch, workout, maybe conquer a side hustle', dosha: 'pitta', icon: 'emoji_events' },
      { label: 'Rest & comfort', desc: 'Couch, blanket, home-cooked food, maybe a nap or three', dosha: 'kapha', icon: 'self_care' },
    ],
  },
  {
    category: 'lifestyle',
    question: 'Friends would describe you as...',
    subtitle: 'The final piece of the puzzle.',
    icon: 'groups',
    options: [
      { label: 'Creative & unpredictable', desc: 'The spontaneous one, always full of wild ideas', dosha: 'vata', icon: 'palette' },
      { label: 'Ambitious & charismatic', desc: 'The natural leader, inspiring but occasionally intense', dosha: 'pitta', icon: 'star' },
      { label: 'Loyal & grounding', desc: 'The rock. The one everyone calls when things go wrong.', dosha: 'kapha', icon: 'favorite' },
    ],
  },
]

// ─── Dosha Results Data ──────────────────────────────────────────────────────

const DOSHA_RESULTS = {
  vata: {
    name: 'Vata',
    element: 'Air + Ether',
    emoji: 'wind_power',
    color: 'from-[#7b93a8] to-[#b8d4e8]',
    bgColor: 'bg-[#e8f0f6]',
    textColor: 'text-[#3d5a73]',
    tagline: 'The Creative Whirlwind',
    description: 'You are movement itself \u2014 quick-thinking, imaginative, and beautifully spontaneous. Like the wind, you bring change and inspiration wherever you go.',
    strengths: ['Creative & artistic', 'Quick learner', 'Adaptable & flexible', 'Enthusiastic spirit'],
    balanceTips: ['Ground yourself with warm, cooked foods', 'Establish a calming daily routine', 'Prioritise warmth and rest', 'Practice slow, grounding yoga'],
  },
  pitta: {
    name: 'Pitta',
    element: 'Fire + Water',
    emoji: 'local_fire_department',
    color: 'from-[#c47a3a] to-[#f0c987]',
    bgColor: 'bg-[#fef3e2]',
    textColor: 'text-[#8b5a2b]',
    tagline: 'The Fierce Transformer',
    description: 'You are fire incarnate \u2014 sharp, determined, and brilliantly focused. Your intensity transforms everything it touches.',
    strengths: ['Natural leader', 'Sharp intellect', 'Courageous & bold', 'Strong digestion'],
    balanceTips: ['Cool down with fresh, sweet foods', 'Avoid overworking \u2014 rest is not weakness', 'Spend time near water', 'Practice cooling breathwork'],
  },
  kapha: {
    name: 'Kapha',
    element: 'Earth + Water',
    emoji: 'landscape',
    color: 'from-[#6b8f5e] to-[#b8d4a8]',
    bgColor: 'bg-[#edf5e8]',
    textColor: 'text-[#3d5e34]',
    tagline: 'The Steady Mountain',
    description: 'You are earth embodied \u2014 steady, nurturing, and deeply resilient. Your calm presence is a sanctuary for everyone around you.',
    strengths: ['Loyal & compassionate', 'Incredible endurance', 'Strong memory', 'Natural caretaker'],
    balanceTips: ['Embrace variety and stimulation', 'Move daily \u2014 even gentle walks count', 'Favour warm, spiced foods', 'Wake early and resist oversleeping'],
  },
}

// ─── Dosha Calculation ───────────────────────────────────────────────────────

function calculateDosha(answers) {
  const scores = { vata: 0, pitta: 0, kapha: 0 }
  Object.values(answers).forEach(dosha => {
    scores[dosha] += 1
  })

  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const percentages = {
    vata: Math.round((scores.vata / total) * 100),
    pitta: Math.round((scores.pitta / total) * 100),
    kapha: Math.round((scores.kapha / total) * 100),
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])

  // Determine the dosha type label
  let label
  const allEqual = sorted[0][1] === sorted[1][1] && sorted[1][1] === sorted[2][1]
  const topTwoEqual = sorted[0][1] === sorted[1][1]
  const topTwoClose = sorted[0][1] - sorted[1][1] <= 1

  if (allEqual) {
    label = 'Tridoshic'
  } else if (topTwoEqual || (topTwoClose && sorted[1][1] > sorted[2][1])) {
    label = `${capitalize(sorted[0][0])}-${capitalize(sorted[1][0])}`
  } else {
    label = capitalize(sorted[0][0])
  }

  return {
    label,
    scores,
    percentages,
    primary: sorted[0][0],
    secondary: sorted[1][0],
    tertiary: sorted[2][0],
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DoshaQuizPage() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()

  const [phase, setPhase] = useState('intro') // intro | quiz | calculating | result
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selectedOption, setSelectedOption] = useState(null)
  const [animating, setAnimating] = useState(false)
  const [doshaResult, setDoshaResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [calcStep, setCalcStep] = useState(0)

  const question = QUESTIONS[currentQ]
  const totalQuestions = QUESTIONS.length
  const progress = (currentQ / totalQuestions) * 100
  const currentCategory = CATEGORIES.find(c => c.id === question?.category)

  // Check if entering a new category
  const isNewCategory = currentQ === 0 || QUESTIONS[currentQ - 1]?.category !== question?.category

  const handleSelect = useCallback((dosha) => {
    if (animating) return
    setSelectedOption(dosha)
    setAnimating(true)

    // Store answer
    const newAnswers = { ...answers, [currentQ]: dosha }
    setAnswers(newAnswers)

    setTimeout(() => {
      if (currentQ < totalQuestions - 1) {
        setCurrentQ(prev => prev + 1)
        setSelectedOption(null)
        setAnimating(false)
      } else {
        // Quiz complete — calculate and show animation
        const calcResult = calculateDosha(newAnswers)
        setDoshaResult(calcResult)
        setPhase('calculating')
        setAnimating(false)
      }
    }, 500)
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

  // Calculation animation sequence
  useEffect(() => {
    if (phase !== 'calculating') return
    const steps = [
      { delay: 600, step: 1 },
      { delay: 1800, step: 2 },
      { delay: 3000, step: 3 },
      { delay: 4200, step: 4 },
    ]
    steps.forEach(({ delay, step }) => {
      setTimeout(() => setCalcStep(step), delay)
    })
    setTimeout(() => setPhase('result'), 5000)
  }, [phase])

  // Save dosha to database
  async function saveDosha() {
    if (!user || !doshaResult) return
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        dosha: doshaResult.label,
        dosha_details: {
          percentages: doshaResult.percentages,
          primary: doshaResult.primary,
          secondary: doshaResult.secondary,
          tertiary: doshaResult.tertiary,
        },
      })
      .eq('id', user.id)

    if (error) {
      console.error('Failed to save dosha:', error.message)
      alert('Failed to save: ' + error.message)
    } else {
      await refreshProfile()
      navigate('/dosha', { replace: true })
    }
    setSaving(false)
  }

  // ── Intro Screen ──────────────────────────────────────────────────────────

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5">
          <button onClick={() => navigate(-1)} className="text-on-surface-variant">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <span className="font-headline italic text-primary text-base">The Sanctuary</span>
          <div className="w-6" />
        </div>

        <div className="flex-1 flex flex-col px-6 pb-12">

          {/* Hero */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">

            {/* Animated mandala */}
            <div className="relative w-36 h-36 mb-10">
              <div className="absolute inset-0 rounded-full bg-primary-container animate-quiz-pulse" />
              <div className="absolute inset-3 rounded-full bg-primary-fixed-dim animate-quiz-pulse-delay" />
              <div className="absolute inset-6 rounded-full bg-primary/20 animate-quiz-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-5xl">spa</span>
              </div>
            </div>

            <p className="font-label text-xs text-primary uppercase tracking-widest mb-3">
              Dosha Discovery
            </p>
            <h1 className="font-headline text-4xl text-on-surface leading-tight mb-4">
              Who are you,<br />
              <span className="italic font-normal text-primary">really?</span>
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs mb-2">
              In Ayurveda, your Dosha is your unique blueprint — the elemental forces that shape your body, mind, and spirit.
            </p>
            <p className="text-on-surface-variant/60 text-xs leading-relaxed max-w-xs">
              10 questions. 2 minutes. A lifetime of self-knowledge.
            </p>
          </div>

          {/* Category preview */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="flex flex-col items-center gap-2 bg-surface-container rounded-lg p-3">
                <span className="material-symbols-outlined text-primary text-lg">{cat.icon}</span>
                <span className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">{cat.label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => setPhase('quiz')}
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

  // ── Calculating Screen ────────────────────────────────────────────────────

  if (phase === 'calculating') {
    const CALC_MESSAGES = [
      { icon: 'auto_awesome', text: 'Reading your elemental signature...' },
      { icon: 'air', text: 'Weighing the winds of Vata...' },
      { icon: 'local_fire_department', text: 'Measuring the fire of Pitta...' },
      { icon: 'landscape', text: 'Grounding into Kapha earth...' },
    ]

    return (
      <div className="min-h-screen bg-background text-on-surface font-body flex flex-col items-center justify-center px-6">

        {/* Orbiting elements */}
        <div className="relative w-40 h-40 mb-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-spin-slow" />
          <div className="absolute inset-4 rounded-full border-2 border-primary/20 animate-spin-slow-reverse" />
          <div className="absolute inset-8 rounded-full bg-primary-container animate-quiz-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-4xl animate-quiz-pulse">
              {CALC_MESSAGES[Math.min(calcStep, 3)]?.icon || 'auto_awesome'}
            </span>
          </div>

          {/* Orbiting dots */}
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

        {/* Messages */}
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

        {/* Progress dots */}
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

  // ── Result Screen ─────────────────────────────────────────────────────────

  if (phase === 'result' && doshaResult) {
    const { label, percentages, primary, secondary, tertiary } = doshaResult
    const primaryData = DOSHA_RESULTS[primary]
    const secondaryData = DOSHA_RESULTS[secondary]
    const tertiaryData = DOSHA_RESULTS[tertiary]
    const isTridoshic = label === 'Tridoshic'
    const isDual = label.includes('-')

    const DOSHA_BAR_COLORS = {
      vata: 'bg-[#7b93a8]',
      pitta: 'bg-[#c47a3a]',
      kapha: 'bg-[#6b8f5e]',
    }

    return (
      <div className="min-h-screen bg-background text-on-surface font-body">

        {/* Gradient hero */}
        <div className={`relative bg-gradient-to-b ${primaryData.color} px-6 pt-12 pb-16 overflow-hidden`}>

          {/* Decorative circles */}
          <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-white/10 animate-quiz-float" />
          <div className="absolute bottom-12 left-4 w-20 h-20 rounded-full bg-white/10 animate-quiz-float-delay" />

          <div className="relative z-10 text-center">
            <div className="animate-quiz-reveal">
              <p className="font-label text-xs text-white/70 uppercase tracking-widest mb-3">
                Your Prakriti Is
              </p>
              <h1 className="font-headline text-5xl text-white leading-none mb-2">
                {label}
              </h1>
              <p className="font-headline italic text-lg text-white/80 mb-4">
                {isTridoshic ? 'The Rare Equilibrium' : primaryData.tagline}
              </p>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="material-symbols-outlined text-white text-sm">{primaryData.emoji}</span>
                <span className="font-label text-xs text-white/90 uppercase tracking-wider">
                  {isTridoshic ? 'All Five Elements' : primaryData.element}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 -mt-6">

          {/* Dosha Breakdown — the centrepiece */}
          <div className="bg-surface rounded-lg p-6 shadow-md mb-5 animate-quiz-slide-up">
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-5">
              Your Dosha Composition
            </p>

            {[
              { key: primary, data: primaryData, pct: percentages[primary] },
              { key: secondary, data: secondaryData, pct: percentages[secondary] },
              { key: tertiary, data: tertiaryData, pct: percentages[tertiary] },
            ].map(({ key, data, pct }, i) => (
              <div key={key} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ color: DOSHA_BAR_COLORS[key].replace('bg-[', '').replace(']', '') }}>
                      {data.emoji}
                    </span>
                    <span className="font-body font-semibold text-sm text-on-surface">
                      {data.name}
                    </span>
                    <span className="font-label text-[9px] text-on-surface-variant/50 uppercase">
                      {data.element}
                    </span>
                  </div>
                  <span className="font-headline text-lg text-on-surface">{pct}%</span>
                </div>
                <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${DOSHA_BAR_COLORS[key]} transition-all duration-1000 ease-out`}
                    style={{ width: `${pct}%`, transitionDelay: `${i * 200}ms` }}
                  />
                </div>
              </div>
            ))}

            <p className="font-body text-xs text-on-surface-variant/50 italic mt-4 leading-relaxed">
              {isTridoshic
                ? 'A rare and balanced constitution. All three doshas are equally expressed in your nature.'
                : isDual
                ? `You express ${capitalize(primary)} and ${capitalize(secondary)} almost equally. Your constitution shifts with seasons and lifestyle.`
                : `${capitalize(primary)} is your dominant dosha, with ${capitalize(secondary)} as a strong secondary influence.`
              }
            </p>
          </div>

          {/* Primary dosha description */}
          <div className={`${primaryData.bgColor} rounded-lg p-6 mb-5 animate-quiz-slide-up`} style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>{primaryData.emoji}</span>
              <p className="font-label text-[10px] uppercase tracking-widest" style={{ color: primaryData.textColor.replace('text-[', '').replace(']', '') }}>
                {isTridoshic ? 'Your Balanced Nature' : `Dominant: ${primaryData.name}`}
              </p>
            </div>
            <p className="font-body text-sm text-on-surface leading-relaxed">
              {primaryData.description}
            </p>
          </div>

          {/* Secondary dosha — always shown */}
          <div className="bg-surface-container rounded-lg p-6 mb-5 animate-quiz-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">{secondaryData.emoji}</span>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
                Secondary: {secondaryData.name}
              </p>
            </div>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              {secondaryData.description}
            </p>
          </div>

          {/* Strengths from primary + secondary */}
          <div className="bg-surface-container rounded-lg p-6 mb-5 animate-quiz-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
              Your Natural Strengths
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[...primaryData.strengths.slice(0, 3), ...secondaryData.strengths.slice(0, 1)].map((strength, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  <span className="font-body text-xs text-on-surface">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Balance tips from primary */}
          <div className="bg-surface-container-low rounded-lg p-6 mb-5 animate-quiz-slide-up" style={{ animationDelay: '0.25s' }}>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
              Stay In Balance
            </p>
            <div className="flex flex-col gap-3">
              {primaryData.balanceTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`material-symbols-outlined text-base mt-0.5 ${primaryData.textColor}`}>spa</span>
                  <p className="font-body text-xs text-on-surface leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ayurvedic context */}
          <div className="bg-surface-container-low rounded-lg p-5 mb-5 flex items-start gap-3 animate-quiz-slide-up" style={{ animationDelay: '0.3s' }}>
            <span className="material-symbols-outlined text-primary text-base mt-0.5">auto_awesome</span>
            <div>
              <p className="font-body font-semibold text-sm text-on-surface mb-1">
                About Your Prakriti
              </p>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                In Ayurveda, everyone carries all three doshas. Your Prakriti (natural constitution) reflects their unique ratio — set at birth and stable throughout life. When your doshas shift out of balance (Vikriti), symptoms arise. This quiz reflects your Prakriti. Seasonal changes, diet, and lifestyle all influence your current state.
              </p>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={saveDosha}
            disabled={saving}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all disabled:opacity-50 mb-3 animate-quiz-slide-up"
            style={{ animationDelay: '0.35s' }}
          >
            {saving ? 'Saving...' : 'Save My Dosha Profile'}
          </button>

          <button
            onClick={() => {
              setPhase('intro')
              setCurrentQ(0)
              setAnswers({})
              setSelectedOption(null)
              setDoshaResult(null)
              setCalcStep(0)
            }}
            className="w-full py-3 text-center text-xs text-on-surface-variant/50 font-label uppercase tracking-widest mb-8"
          >
            Retake the quiz
          </button>
        </div>
      </div>
    )
  }

  // ── Quiz Screen ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-on-surface font-body flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={handleBack} className="text-on-surface-variant">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">{currentCategory?.icon}</span>
          <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
            {currentCategory?.label}
          </span>
        </div>
        <span className="font-label text-xs text-on-surface-variant/50">
          {currentQ + 1}/{totalQuestions}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-6 mb-1">
        <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Category transition */}
      {isNewCategory && (
        <div className="px-6 pt-3 pb-1">
          <div className="flex items-center gap-2">
            {CATEGORIES.map((cat, i) => (
              <div
                key={cat.id}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  cat.id === question.category
                    ? 'bg-primary'
                    : CATEGORIES.indexOf(CATEGORIES.find(c => c.id === question.category)) > i
                    ? 'bg-primary/30'
                    : 'bg-surface-container-high'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Question */}
      <div
        key={currentQ}
        className="flex-1 flex flex-col px-6 pt-3 pb-5 animate-quiz-enter"
      >
        {/* Question icon + text */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">{question.icon}</span>
          </div>
          <p className="font-body text-[11px] text-on-surface-variant/60 italic flex-1">
            {question.subtitle}
          </p>
        </div>

        <h2 className="font-headline text-xl text-on-surface leading-snug mb-4">
          {question.question}
        </h2>

        {/* Options */}
        <div className="flex flex-col gap-2.5 mt-auto">
          {question.options.map((option, i) => {
            const isSelected = selectedOption === option.dosha
            return (
              <button
                key={i}
                onClick={() => handleSelect(option.dosha)}
                disabled={animating}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-left transition-all duration-300 ${
                  isSelected
                    ? 'bg-primary text-on-primary scale-[0.98]'
                    : animating
                    ? 'bg-surface-container-low opacity-40 scale-[0.97]'
                    : 'bg-surface-container active:scale-[0.98]'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected
                    ? 'bg-on-primary/15'
                    : 'bg-surface-container-high'
                }`}>
                  <span className={`material-symbols-outlined text-base ${
                    isSelected ? 'text-on-primary' : 'text-on-surface-variant'
                  }`}>
                    {option.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-body font-semibold text-sm leading-tight ${
                    isSelected ? 'text-on-primary' : 'text-on-surface'
                  }`}>
                    {option.label}
                  </p>
                  <p className={`font-label text-[10px] mt-0.5 leading-snug ${
                    isSelected ? 'text-on-primary/70' : 'text-on-surface-variant'
                  }`}>
                    {option.desc}
                  </p>
                </div>
                {isSelected && (
                  <span className="material-symbols-outlined text-on-primary text-base flex-shrink-0">
                    check_circle
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
