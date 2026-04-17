import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRoutine, ASANAS } from '../data/asanas'
import usePracticeStats from '../hooks/usePracticeStats'
import useVikritiSchedule from '../hooks/useVikritiSchedule'
import PoseFigure from '../components/PoseFigure'
import * as analytics from '../lib/analytics'


const CHECKIN_OPTIONS = [
  { id: 'stress', label: 'Stressed', icon: 'psychiatry' },
  { id: 'sleep', label: 'Tired', icon: 'bedtime' },
  { id: 'energy', label: 'Low energy', icon: 'bolt' },
  { id: 'flexibility', label: 'Stiff', icon: 'self_care' },
]

const QUOTES = [
  // Yoga & Ayurveda Masters
  { text: 'Health is a state of complete harmony of the body, mind, and spirit.', author: 'B.K.S. Iyengar' },
  { text: 'Yoga is not about touching your toes. It is about what you learn on the way down.', author: 'Jigar Gor' },
  { text: 'The rhythm of the body, the melody of the mind, and the harmony of the soul create the symphony of life.', author: 'B.K.S. Iyengar' },
  { text: 'When the breath wanders, the mind is also unsteady. But when the breath is calmed, the mind too will be still.', author: 'Hatha Yoga Pradipika' },
  { text: 'Yoga does not just change the way we see things, it transforms the person who sees.', author: 'B.K.S. Iyengar' },
  { text: 'The body is your temple. Keep it pure and clean for the soul to reside in.', author: 'B.K.S. Iyengar' },
  { text: 'An ounce of practice is worth more than tons of preaching.', author: 'Mahatma Gandhi' },

  // Vedic & Ayurvedic Wisdom
  { text: 'When diet is wrong, medicine is of no use. When diet is correct, medicine is of no need.', author: 'Ayurvedic Proverb' },
  { text: 'The part can never be well unless the whole is well.', author: 'Plato, on Holistic Healing' },
  { text: 'Every human being is the author of his own health or disease.', author: 'The Buddha' },
  { text: 'The natural healing force within each of us is the greatest force in getting well.', author: 'Hippocrates' },
  { text: 'True peace is not the absence of movement, but the stillness at the heart of it.', author: 'Ancient Vedic Teaching' },
  { text: 'He who has health has hope, and he who has hope has everything.', author: 'Ancient Proverb' },
  { text: 'The soul is the same in all living creatures, although the body of each is different.', author: 'Hippocrates' },

  // Patanjali & Sutras
  { text: 'Yoga is the cessation of the movements of the mind. Then there is abiding in the Seer\'s own form.', author: 'Patanjali, Yoga Sutras' },
  { text: 'With your practice as the foundation, you can move mountains within.', author: 'Patanjali' },
  { text: 'Undisturbed calmness of mind is attained by cultivating friendliness toward the happy, compassion for the unhappy, delight in the virtuous, and indifference toward the wicked.', author: 'Patanjali, Yoga Sutras' },

  // Swami Vivekananda & Vedanta
  { text: 'Arise, awake, and stop not until the goal is reached.', author: 'Swami Vivekananda' },
  { text: 'In a conflict between the heart and the brain, follow your heart.', author: 'Swami Vivekananda' },
  { text: 'All the powers in the universe are already ours. It is we who have put our hands before our eyes and cry that it is dark.', author: 'Swami Vivekananda' },
  { text: 'The greatest sin is to think that you are weak.', author: 'Swami Vivekananda' },

  // Bhagavad Gita
  { text: 'You have the right to work, but never to the fruit of the work. Be not attached to inaction.', author: 'Bhagavad Gita' },
  { text: 'Reshape yourself through the power of your will. Those who have conquered themselves live in peace, alike in cold and heat, pleasure and pain.', author: 'Bhagavad Gita' },
  { text: 'The mind is restless and difficult to restrain, but it is subdued by practice.', author: 'Bhagavad Gita' },
  { text: 'When meditation is mastered, the mind is unwavering like the flame of a candle in a windless place.', author: 'Bhagavad Gita' },

  // Modern Wellness & Mindfulness
  { text: 'Almost everything will work again if you unplug it for a few minutes, including you.', author: 'Anne Lamott' },
  { text: 'Silence is not empty, it is full of answers.', author: 'Ancient Wisdom' },
  { text: 'The wound is the place where the light enters you.', author: 'Rumi' },
  { text: 'What you seek is seeking you.', author: 'Rumi' },
  { text: 'The quieter you become, the more you are able to hear.', author: 'Rumi' },
  { text: 'Do not feel lonely; the entire universe is inside you.', author: 'Rumi' },

  // Charaka Samhita & Ayurveda
  { text: 'A person whose doshas are in balance, whose appetite is good, whose tissues are functioning normally, and whose mind and senses remain full of bliss, is called a healthy person.', author: 'Sushruta Samhita' },
  { text: 'The three pillars of life are food, sleep, and the observance of celibacy. Being supported by these three, the body is endowed with strength.', author: 'Charaka Samhita' },
  { text: 'He whose doshas are in equilibrium, whose digestion is good, who acts virtuously — he is said to be healthy.', author: 'Charaka Samhita' },
  { text: 'Prevention is better than cure. The wise man adapts himself before illness arrives.', author: 'Ayurvedic Wisdom' },
  { text: 'The food you eat can be either the safest and most powerful form of medicine, or the slowest form of poison.', author: 'Ann Wigmore' },

  // Upanishads & Deep Philosophy
  { text: 'You are what your deep, driving desire is. As your desire is, so is your will. As your will is, so is your deed. As your deed is, so is your destiny.', author: 'Brihadaranyaka Upanishad' },
  { text: 'From the unreal, lead me to the real. From darkness, lead me to light. From death, lead me to immortality.', author: 'Brihadaranyaka Upanishad' },
  { text: 'As the rivers flowing east and west merge in the sea and become one with it, forgetting they were ever separate rivers, so do all creatures lose their separateness when they merge into pure being.', author: 'Chandogya Upanishad' },

  // Thich Nhat Hanh & Mindful Living
  { text: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.', author: 'Thich Nhat Hanh' },
  { text: 'Smile, breathe, and go slowly.', author: 'Thich Nhat Hanh' },
  { text: 'Walk as if you are kissing the Earth with your feet.', author: 'Thich Nhat Hanh' },

  // Nature of Healing
  { text: 'Look deep into nature, and then you will understand everything better.', author: 'Albert Einstein' },
  { text: 'The doctor of the future will give no medicine, but will interest his patients in the care of the human frame, diet, and the cause and prevention of disease.', author: 'Thomas Edison' },
  { text: 'Rest is not idleness, and to lie sometimes on the grass under trees on a summer\'s day is by no means a waste of time.', author: 'John Lubbock' },

  // Seasonal & Cyclical
  { text: 'Nature does not hurry, yet everything is accomplished.', author: 'Lao Tzu' },
  { text: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'To keep the body in good health is a duty, otherwise we shall not be able to keep our mind strong and clear.', author: 'The Buddha' },
  { text: 'Peace comes from within. Do not seek it without.', author: 'The Buddha' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
]

// ── What to avoid — rotates based on time of day ──
const AVOID_TIPS = {
  morning: [
    { text: 'Checking your phone before getting out of bed', icon: 'smartphone' },
    { text: 'Skipping breakfast or drinking coffee on an empty stomach', icon: 'coffee' },
    { text: 'Intense cardio without warming up first', icon: 'directions_run' },
  ],
  afternoon: [
    { text: 'Heavy meals that cause afternoon sluggishness', icon: 'restaurant' },
    { text: 'Stressful work emails during your break', icon: 'mail' },
    { text: 'Sitting without moving for more than 90 minutes', icon: 'event_seat' },
  ],
  evening: [
    { text: 'Strenuous exercise after 7 PM', icon: 'fitness_center' },
    { text: 'Screen time and blue light before sleep', icon: 'screen_lock_portrait' },
    { text: 'Caffeine or processed sugars in the late afternoon', icon: 'no_drinks' },
    { text: 'Heavy meals within 3 hours of sleep', icon: 'dinner_dining' },
  ],
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function getSubtitle() {
  const h = new Date().getHours()
  if (h < 12) return 'The morning is still. Your practice awaits.'
  if (h < 17) return 'The afternoon calls for stillness.'
  return 'The evening is here. Time to restore.'
}

export default function HomePage() {
  const navigate = useNavigate()
  const { profile, user } = useAuth()
  const [checkedIn, setCheckedIn] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  // Recommendation id for the currently-shown suggested asana card.
  // Refreshed whenever the asana/context changes so clicks link to the right row.
  const [suggestedAsanaRecId, setSuggestedAsanaRecId] = useState(null)
  const lastLoggedKeyRef = useRef(null)

  const firstName = profile?.full_name?.split(' ')[0] || 'Friend'
  // Rotate quote daily using day-of-year so all quotes cycle through
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now - startOfYear) / 86400000)
  const quote = QUOTES[dayOfYear % QUOTES.length]
  const timeOfDay = getTimeOfDay()
  const avoidTips = AVOID_TIPS[timeOfDay]
  const stats = usePracticeStats()
  const vikriti = useVikritiSchedule()

  const routineKey = checkedIn || 'stress'
  const routine = getRoutine(routineKey)

  // Pick a single contextual asana based on time of day, check-in, and dosha.
  // Returns both the asana and the reasoning (which rules fired) so the
  // recommendation log can answer "why did we suggest this?".
  const pickAsana = () => {
    const h = new Date().getHours()
    const userDosha = profile?.dosha_details?.primary || null
    const rules = []

    // Morning: energizing poses
    if (h < 12) {
      rules.push('slot:morning')
      if (checkedIn === 'energy')       { rules.push('checkin:energy');       return { asana: ASANAS.suryaNamaskar, rules, userDosha } }
      if (checkedIn === 'flexibility')  { rules.push('checkin:flexibility');  return { asana: ASANAS.downwardDog,   rules, userDosha } }
      if (userDosha === 'kapha')        { rules.push('dosha:kapha');          return { asana: ASANAS.suryaNamaskar, rules, userDosha } }
      rules.push('default:morning')
      return { asana: ASANAS.tadasana, rules, userDosha }
    }
    // Afternoon: grounding and focus
    if (h < 17) {
      rules.push('slot:afternoon')
      if (checkedIn === 'stress')       { rules.push('checkin:stress');       return { asana: ASANAS.uttanasana, rules, userDosha } }
      if (checkedIn === 'flexibility')  { rules.push('checkin:flexibility');  return { asana: ASANAS.pigeon,     rules, userDosha } }
      if (userDosha === 'pitta')        { rules.push('dosha:pitta');          return { asana: ASANAS.tree,       rules, userDosha } }
      rules.push('default:afternoon')
      return { asana: ASANAS.warrior2, rules, userDosha }
    }
    // Evening: restorative and calming
    rules.push('slot:evening')
    if (checkedIn === 'sleep')   { rules.push('checkin:sleep');   return { asana: ASANAS.legUpWall,  rules, userDosha } }
    if (checkedIn === 'stress')  { rules.push('checkin:stress');  return { asana: ASANAS.balasana,   rules, userDosha } }
    if (userDosha === 'vata')    { rules.push('dosha:vata');      return { asana: ASANAS.sukhasana,  rules, userDosha } }
    rules.push('default:evening')
    return { asana: ASANAS.supinetwist, rules, userDosha }
  }
  const { asana: suggestedAsana, rules: suggestedAsanaRules, userDosha: suggestedAsanaUserDosha } = pickAsana()

  const ASANA_CONTEXT = {
    morning: 'Start your day grounded',
    afternoon: 'Reset your afternoon',
    evening: 'Wind down gently',
  }
  const asanaContext = ASANA_CONTEXT[timeOfDay]

  // ── Log recommendation when the suggested asana card renders ──
  // Guarded by a ref so we only write one row per unique
  // (asana, time_of_day, checkedIn) combination within this session.
  useEffect(() => {
    if (!user?.id || !suggestedAsana?.id) return
    const key = `${suggestedAsana.id}|${timeOfDay}|${checkedIn || 'none'}`
    if (lastLoggedKeyRef.current === key) return
    lastLoggedKeyRef.current = key

    let cancelled = false
    ;(async () => {
      const recId = await analytics.logRecommendation({
        userId: user.id,
        surface: analytics.SURFACES.HOME_SUGGESTED_ASANA,
        contentType: analytics.CONTENT_TYPES.ASANA,
        contentId: suggestedAsana.id,
        reasoning: {
          rules_fired: suggestedAsanaRules,
          time_of_day: timeOfDay,
          checked_in: checkedIn,
          user_dosha: suggestedAsanaUserDosha,
        },
      })
      if (!cancelled) setSuggestedAsanaRecId(recId)
    })()
    return () => { cancelled = true }
  }, [user?.id, suggestedAsana?.id, timeOfDay, checkedIn, suggestedAsanaRules, suggestedAsanaUserDosha])

  // ── Handler for tapping the suggested asana card ──
  const handleSuggestedAsanaClick = () => {
    if (user?.id && suggestedAsana?.id) {
      analytics.logContentEvent({
        userId: user.id,
        eventType: analytics.EVENT_TYPES.CLICKED,
        contentType: analytics.CONTENT_TYPES.ASANA,
        contentId: suggestedAsana.id,
        surface: analytics.SURFACES.HOME_SUGGESTED_ASANA,
        recommendationId: suggestedAsanaRecId,
      })
    }
    navigate(`/asana/${suggestedAsana.id}`)
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-20">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">spa</span>
          <span className="font-headline italic text-primary text-base">The Sanctuary</span>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-lg">person</span>
        </button>
      </div>

      <div className="px-6 flex flex-col gap-6">

        {/* ── Greeting ── */}
        <div className="stagger-1">
          <p className="font-label text-xs text-primary uppercase tracking-widest mb-1">
            Namaste
          </p>
          <h1 className="font-headline text-4xl text-on-surface leading-tight">
            {firstName}.
          </h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            {getSubtitle()}
          </p>
        </div>

        {/* ── Streak & Minutes Tiles — only shown after first practice ── */}
        {stats.hasSessions && (
          <div className="grid grid-cols-2 gap-3 stagger-2">
            <button
              onClick={() => navigate('/journey')}
              className="bg-primary-container/30 rounded-xl p-4 text-left active:scale-[0.97] transition-all relative overflow-hidden border border-primary/[0.08]"
            >
              <div className="absolute -right-3 -bottom-3 opacity-[0.08]">
                <span className="material-symbols-outlined text-5xl text-primary">local_fire_department</span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-primary text-sm">local_fire_department</span>
                <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Day Streak</p>
              </div>
              <p className="font-headline text-3xl text-primary leading-none">{stats.streak}</p>
              <p className="font-body text-[10px] text-on-surface-variant/50 mt-1">
                {stats.streak === 1 ? '1 day so far' : 'consecutive days'}
              </p>
            </button>
            <button
              onClick={() => navigate('/journey')}
              className="bg-secondary-container/25 rounded-xl p-4 text-left active:scale-[0.97] transition-all relative overflow-hidden border border-secondary/[0.08]"
            >
              <div className="absolute -right-3 -bottom-3 opacity-[0.08]">
                <span className="material-symbols-outlined text-5xl text-secondary">schedule</span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-secondary text-sm">schedule</span>
                <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">This Week</p>
              </div>
              <p className="font-headline text-3xl text-secondary leading-none">{stats.weekMinutes}</p>
              <p className="font-body text-[10px] text-on-surface-variant/50 mt-1">minutes practiced</p>
            </button>
          </div>
        )}

        {/* ── Vikriti re-check prompt — only when due ── */}
        {vikriti.isDue && vikriti.hasPrakriti && (
          <button
            onClick={() => navigate('/vikriti')}
            className="relative w-full text-left rounded-xl p-4 bg-primary-container/40 border border-primary/15 active:scale-[0.98] transition-all stagger-2 overflow-hidden"
          >
            <div className="absolute -right-3 -bottom-3 opacity-[0.08]">
              <span className="material-symbols-outlined text-5xl text-primary">waving_hand</span>
            </div>
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-lg">waving_hand</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-label text-[9px] text-primary uppercase tracking-widest mb-0.5">
                  {vikriti.vikritiCount === 0 ? 'First Check-in' : 'Weekly Check-in'}
                </p>
                <p className="font-body font-semibold text-sm text-on-surface leading-tight">
                  {vikriti.vikritiCount === 0
                    ? 'How have you been lately?'
                    : `It's been ${vikriti.daysSinceLast} days — how are you now?`}
                </p>
                <p className="font-body text-[11px] text-on-surface-variant mt-0.5">5 questions · 60 seconds</p>
              </div>
              <span className="material-symbols-outlined text-primary text-lg flex-shrink-0">arrow_forward</span>
            </div>
          </button>
        )}

        {/* ── Daily Check-in ── */}
        <div className="bg-surface-container-low rounded-xl p-5 stagger-3">
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-4">
            How are you feeling today?
          </p>

          {/* Search */}
          <div className="relative mb-4">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
                  navigate('/recommendations', { state: { query: searchQuery.trim(), source: analytics.SEARCH_SOURCES.HOME_SEARCH } })
                }
              }}
              placeholder="Lower back pain, headache..."
              className="w-full bg-background rounded-full pl-10 pr-10 py-3 text-on-surface font-body text-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/35"
            />
            {searchQuery.length > 0 && (
              <button
                onClick={() => {
                  if (searchQuery.trim().length >= 2) navigate('/recommendations', { state: { query: searchQuery.trim(), source: analytics.SEARCH_SOURCES.HOME_SEARCH } })
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined text-on-primary text-sm">arrow_forward</span>
              </button>
            )}
          </div>

          {/* Quick-pick chips */}
          <div className="grid grid-cols-2 gap-2.5">
            {CHECKIN_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => setCheckedIn(option.id)}
                className={`flex items-center gap-2.5 p-3 rounded-xl transition-all duration-200 ${
                  checkedIn === option.id
                    ? 'bg-primary-fixed text-on-primary-container'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-lg ${
                  checkedIn === option.id ? 'text-primary' : 'text-on-surface-variant'
                }`}>
                  {option.icon}
                </span>
                <span className="font-body text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
          {checkedIn && (
            <button
              onClick={() => navigate('/routine', { state: { routineKey } })}
              className="w-full mt-4 py-3 bg-primary text-on-primary rounded-full font-label text-xs font-semibold tracking-wide active:scale-95 transition-all"
            >
              Get My Practice
            </button>
          )}
        </div>

        {/* ── Suggested Asana — single contextual card ── */}
        <button
          onClick={handleSuggestedAsanaClick}
          className="bg-surface-container rounded-xl p-5 flex items-center gap-4 active:scale-[0.98] transition-all stagger-3 w-full text-left"
        >
          <div className="w-16 h-16 rounded-xl bg-primary-container/40 flex items-center justify-center flex-shrink-0">
            <PoseFigure poseKey={suggestedAsana.poseKey} size="xs" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label text-[9px] text-primary uppercase tracking-widest mb-1">{asanaContext}</p>
            <p className="font-body font-semibold text-sm text-on-surface">{suggestedAsana.sanskrit}</p>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">{suggestedAsana.english} · {Math.ceil(suggestedAsana.durationSeconds / 60)} min</p>
          </div>
          <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">arrow_forward</span>
        </button>

        {/* ── Daily Ritual — Breathing ── */}
        <button
          onClick={() => navigate('/routine', { state: { routineKey: 'stress' } })}
          className="bg-surface-container-low rounded-2xl p-5 stagger-4 active:scale-[0.98] transition-all w-full text-left"
        >
          <div className="flex items-center gap-4">
            {/* Icon circle with subtle breathing animation */}
            <div className="relative w-16 h-16 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-primary-container/40 animate-ritual-glow" />
              <div className="absolute inset-0 rounded-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">air</span>
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <p className="font-label text-[9px] text-primary uppercase tracking-widest mb-1">Daily Ritual</p>
              <h3 className="font-headline text-xl text-on-surface leading-snug">Mindful Respiration</h3>
              <p className="font-body text-xs text-on-surface-variant mt-0.5">Find your center...</p>
            </div>

            {/* Start pill */}
            <div className="px-5 py-2.5 bg-primary rounded-full flex-shrink-0">
              <span className="font-label text-[10px] text-on-primary uppercase tracking-widest font-semibold">Start</span>
            </div>
          </div>
        </button>

        {/* ── What to Avoid ── */}
        <div className="bg-secondary-container/15 rounded-xl p-5 stagger-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="material-symbols-outlined text-secondary text-lg">block</span>
            <h3 className="font-headline text-lg text-on-surface">What to avoid</h3>
            <span className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest ml-auto">{timeOfDay}</span>
          </div>
          <div className="flex flex-col gap-3">
            {avoidTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary-container/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-secondary text-sm">{tip.icon}</span>
                </div>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-secondary-container/20">
            <p className="font-label text-[9px] text-secondary/60 uppercase tracking-widest text-center italic">
              Gentle reminder: Balance is a practice, not a destination.
            </p>
          </div>
        </div>

        {/* ── Dosha Card — themed per user's dosha, with vikriti delta overlay ── */}
        {(() => {
          const userDosha = (profile?.dosha_details?.primary || profile?.dosha || '').toLowerCase()
          const DOSHA_LABELS = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' }
          // Delta vs. most recent vikriti check-in. Only meaningful when both
          // prakriti exists AND user has done at least one vikriti recently.
          // "Recently" = last 14 days — beyond that the signal is stale.
          const vikritiFresh = vikriti.lastVikritiAt && vikriti.daysSinceLast <= 14
          const vikritiPrimary = vikritiFresh ? vikriti.lastVikritiPrimary : null
          const hasShifted = vikritiPrimary && userDosha && vikritiPrimary !== userDosha
          const DOSHA_THEMES = {
            vata: {
              gradient: 'from-[#567b91] to-[#7ba3be]',
              icon: 'wind_power',
              element: 'Air + Ether',
              tagline: 'Creative, quick-thinking, and adaptable',
              bgIcon: 'air',
            },
            pitta: {
              gradient: 'from-[#8b6a3e] to-[#c49a5c]',
              icon: 'local_fire_department',
              element: 'Fire + Water',
              tagline: 'Focused, driven, and naturally radiant',
              bgIcon: 'local_fire_department',
            },
            kapha: {
              gradient: 'from-[#5a7a52] to-[#8aad7e]',
              icon: 'landscape',
              element: 'Earth + Water',
              tagline: 'Grounded, nurturing, and steady',
              bgIcon: 'water_drop',
            },
          }
          const theme = DOSHA_THEMES[userDosha]
          const hasDosha = !!theme

          return (
            <button
              onClick={() => navigate(hasDosha ? '/dosha' : '/quiz')}
              className={`rounded-xl p-6 text-left relative overflow-hidden stagger-6 active:scale-[0.98] transition-all w-full ${
                hasDosha
                  ? `bg-gradient-to-br ${theme.gradient} text-white`
                  : 'bg-primary text-on-primary'
              }`}
            >
              {/* Background decorative elements */}
              {hasDosha ? (
                <>
                  <div className="absolute -right-6 -top-6 opacity-[0.12]">
                    <span className="material-symbols-outlined text-[7rem]">{theme.bgIcon}</span>
                  </div>
                  <div className="absolute -left-4 -bottom-4 opacity-[0.08]">
                    <span className="material-symbols-outlined text-[5rem]">spa</span>
                  </div>
                </>
              ) : (
                <div className="absolute -right-8 -bottom-8 opacity-10">
                  <span className="material-symbols-outlined text-[8rem]">spa</span>
                </div>
              )}

              {/* Content */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-sm opacity-70">
                    {hasDosha ? theme.icon : 'spa'}
                  </span>
                  <p className="font-label text-[10px] uppercase tracking-widest opacity-70">
                    {hasDosha ? theme.element : 'Dosha Type'}
                  </p>
                </div>

                <h3 className="font-headline text-2xl mb-1">
                  {hasDosha ? `${userDosha.charAt(0).toUpperCase() + userDosha.slice(1)} Dosha` : 'Undiscovered'}
                </h3>

                {hasDosha ? (
                  <p className="font-body text-xs opacity-80 leading-relaxed mb-3">
                    {theme.tagline}
                  </p>
                ) : (
                  <p className="font-body text-xs opacity-70 leading-relaxed mb-4">
                    Take the Dosha quiz to unlock personalized recommendations and theme your app.
                  </p>
                )}

                {/* Vikriti delta — subtle pill that reads "This week: elevated Vata" or "In rhythm" */}
                {hasDosha && vikritiPrimary && (
                  <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 bg-white/15 backdrop-blur-sm rounded-full">
                    <span className="material-symbols-outlined text-[12px] opacity-80">
                      {hasShifted ? 'trending_up' : 'check_circle'}
                    </span>
                    <span className="font-label text-[10px] tracking-wide opacity-90">
                      {hasShifted
                        ? `This week: elevated ${DOSHA_LABELS[vikritiPrimary]}`
                        : 'In rhythm this week'}
                    </span>
                  </div>
                )}

                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full font-label text-xs tracking-wide">
                  {hasDosha
                    ? (hasShifted ? 'See how to rebalance' : 'Explore my Dosha')
                    : 'Take the quiz'}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </button>
          )
        })()}

        {/* ── Quote ── */}
        <div className="bg-surface-container-low rounded-xl p-6 text-center stagger-7">
          <span className="material-symbols-outlined text-outline-variant text-3xl mb-3 block">format_quote</span>
          <p className="font-headline italic text-lg text-on-surface-variant leading-relaxed mb-3">
            "{quote.text}"
          </p>
          <p className="font-label text-[10px] uppercase tracking-widest text-primary">
            {quote.author}
          </p>
        </div>

      </div>

    </div>
  )
}
