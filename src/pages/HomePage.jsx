import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { doshaDisplayName } from '../i18n/contentI18n'
import { composeDailySession } from '../lib/dailySession'
import usePracticeStats from '../hooks/usePracticeStats'
import useScrollDepth from '../hooks/useScrollDepth'
import useImpression from '../hooks/useImpression'
import useVikritiSchedule from '../hooks/useVikritiSchedule'
import { useVikritiSignal } from '../hooks/useVikritiSignal'
import { useIsPremium } from '../hooks/useIsPremium'
import VikritiCard from '../components/VikritiCard'
import PaywallSheet from '../components/PaywallSheet'
import WelcomeToPlusCard from '../components/WelcomeToPlusCard'
import * as analytics from '../lib/analytics'
import AnalyticsConsentCard from '../components/AnalyticsConsentCard'
import { track, screen, setSuperProps, EVENTS } from '../lib/track'

// Mirror of YOGI_LEVELS in JourneyPage; kept tiny here to avoid a cross-page
// import for a 7-row lookup. If this list ever changes there, update both.
const LEVEL_THRESHOLDS = [
  { level: 1, minMinutes: 0 },
  { level: 2, minMinutes: 60 },
  { level: 3, minMinutes: 300 },
  { level: 4, minMinutes: 900 },
  { level: 5, minMinutes: 1800 },
  { level: 6, minMinutes: 3600 },
  { level: 7, minMinutes: 7200 },
]
function levelFor(totalMinutes) {
  let lvl = 1
  for (const t of LEVEL_THRESHOLDS) if (totalMinutes >= t.minMinutes) lvl = t.level
  return lvl
}


const CHECKIN_OPTIONS = [
  { id: 'stress', labelKey: 'home.checkinOptions.stress', icon: 'psychiatry' },
  { id: 'sleep', labelKey: 'home.checkinOptions.sleep', icon: 'bedtime' },
  { id: 'energy', labelKey: 'home.checkinOptions.energy', icon: 'bolt' },
  { id: 'flexibility', labelKey: 'home.checkinOptions.flexibility', icon: 'self_care' },
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

// ── What to avoid — rotates based on time of day. Icons live here; the
// tip copy is localized (home.avoid.tips.<slot>) and zipped by index. ──
const AVOID_ICONS = {
  morning:   ['smartphone', 'coffee', 'directions_run'],
  afternoon: ['restaurant', 'mail', 'event_seat'],
  evening:   ['fitness_center', 'screen_lock_portrait', 'no_drinks', 'dinner_dining'],
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { profile, user } = useAuth()
  const [checkedIn, setCheckedIn] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const firstName = profile?.full_name?.split(' ')[0] || t('home.defaultFirstName')
  // Rotate quote daily using day-of-year so all quotes cycle through
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now - startOfYear) / 86400000)
  // QUOTES stays the English source of truth (and owns the author attribution).
  // The text is looked up by index in the locale files so it can be translated;
  // the English entry doubles as the fallback.
  const quoteIndex = dayOfYear % QUOTES.length
  const quote = QUOTES[quoteIndex]
  const timeOfDay = getTimeOfDay()
  const subtitle = t(`home.subtitle${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}`)
  // Zip localized tip copy with the static icon list by index.
  const avoidTipTexts = t(`home.avoid.tips.${timeOfDay}`, { returnObjects: true })
  const avoidTips = (Array.isArray(avoidTipTexts) ? avoidTipTexts : []).map((text, i) => ({
    text,
    icon: AVOID_ICONS[timeOfDay][i],
  }))
  const stats = usePracticeStats()
  const vikriti = useVikritiSchedule()

  useEffect(() => {
    screen('home', { time_of_day: getTimeOfDay() })
  }, [])

  useScrollDepth('home')

  // ── Push practice stats into PostHog super-properties ────────────────
  // AuthContext sets identity-level props (dosha, platform). Stats live
  // behind usePracticeStats which we already mount here, so HomePage is
  // the natural home for refreshing experience_minutes / streak / level
  // on every fresh stats load. Rounding minutes to the nearest 5 keeps
  // the value cardinality low for cohort analysis.
  useEffect(() => {
    if (stats.loading) return
    const totalMinutes = stats.totalMinutes ?? 0
    setSuperProps({
      experience_minutes: Math.round(totalMinutes / 5) * 5,
      streak_days:        stats.streak ?? 0,
      experience_level:   levelFor(totalMinutes),
    })
  }, [stats.loading, stats.totalMinutes, stats.streak])

  // ── Vikriti prompt impression ─────────────────────────────────────────
  // Fires `vikriti_prompt_shown` once per HomePage visit when the prompt
  // card is rendered. Pair with `vikriti_started` from the quiz to compute
  // prompt-to-quiz CTR; pair with `vikriti_completed` for end-to-end.
  const vikritiPromptShownRef = useRef(false)
  useEffect(() => {
    if (vikritiPromptShownRef.current) return
    if (vikriti.loading || !vikriti.isDue || !vikriti.hasPrakriti) return
    vikritiPromptShownRef.current = true
    track(EVENTS.VIKRITI_PROMPT_SHOWN, {
      days_since_last: vikriti.daysSinceLast === Infinity ? null : vikriti.daysSinceLast,
      vikriti_count:   vikriti.vikritiCount,
    })
  }, [vikriti.loading, vikriti.isDue, vikriti.hasPrakriti, vikriti.daysSinceLast, vikriti.vikritiCount])

  // When we return from /vikriti after a save, the schedule hook's cached
  // state is still pre-save (no row yet → isDue=true) so the prompt card
  // sticks on screen. The quiz page passes location.state.vikritiSavedAt
  // as a signal for us to refresh. Clear the state after handling so a
  // browser-back doesn't re-trigger the refetch on every return.
  useEffect(() => {
    if (location.state?.vikritiSavedAt) {
      vikriti.refetch()
      navigate('.', { replace: true, state: null })
    }
  }, [location.state?.vikritiSavedAt])

  const routineKey = checkedIn || 'stress'

  // ── Vikriti drift + entitlement (kept — used by the VikritiCard + paywall) ──
  const vikritiSignal = useVikritiSignal()
  const { isPremium } = useIsPremium()
  const [vikritiPaywallOpen, setVikritiPaywallOpen] = useState(false)

  // ── Today's Practice — the composed daily session (the DAU hero) ─────────
  // Replaces the old single-asana "pick up where you left off" card. Instead
  // of surfacing one pose, we compose a full session (see lib/dailySession)
  // from the signals we already have and let the user start it in one tap.

  // Which daily slots are already done today — inferred from today's saved
  // 'daily' sessions by their timestamp. Feeds slot resolution (morning done →
  // afternoon rolls to evening) and the card's completed state.
  const doneSlotsToday = useMemo(() => {
    const d = new Date()
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const done = new Set()
    for (const s of stats.sessions || []) {
      if (s?.date !== todayStr || s?.routine_key !== 'daily') continue
      const hr = s.created_at ? new Date(s.created_at).getHours() : 12
      done.add(hr >= 17 ? 'evening' : 'morning')
    }
    return Array.from(done)
  }, [stats.sessions])

  // Compose for right now. Deterministic per (user, date, slot) — stable all
  // day and the exact arc the practice runs (we hand it over via router state).
  const dailySession = useMemo(() => {
    const history = [...(stats.sessions || [])].sort((a, b) =>
      String(b.created_at || b.date).localeCompare(String(a.created_at || a.date)))
    return composeDailySession({
      profile,
      vikriti: vikritiSignal,
      checkin: checkedIn,
      history,
      doneSlotsToday,
      userId: user?.id,
      now: new Date(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, vikritiSignal.hasSignal, vikritiSignal.vikriti, checkedIn, stats.sessions, doneSlotsToday, user?.id])

  const dailyDurationMin = Math.max(1, Math.round(dailySession.totalSeconds / 60))
  const dailyDone = doneSlotsToday.includes(dailySession.slot)
  const dailyNextSlot = (dailyDone && dailySession.slot === 'morning' && !doneSlotsToday.includes('evening')) ? 'evening' : null
  const dailyTitleKey = dailySession.slot === 'evening' ? 'practice.dailyEveningTitle' : 'practice.dailyMorningTitle'

  // Localized reason chips (skip the slot reason — that's the headline).
  const dailyReasonChips = dailySession.reasons
    .filter(r => !r.code.startsWith('slot:'))
    .map(r => {
      const [kind, arg] = r.code.split(':')
      if (kind === 'pacify')  return t('home.daily.reasonPacify', { dosha: doshaDisplayName(arg) })
      if (kind === 'dosha')   return t('home.daily.reasonDosha', { dosha: doshaDisplayName(arg) })
      if (kind === 'checkin') return t('home.daily.reasonCheckin', { mood: t(`home.checkinOptions.${arg}`, arg) })
      return r.label
    })

  // Log the composed recipe once per unique session (seed) so we can tune the
  // composer from real usage without a duplicate every render.
  const composedLoggedRef = useRef(null)
  useEffect(() => {
    if (!user?.id || composedLoggedRef.current === dailySession.seed) return
    composedLoggedRef.current = dailySession.seed
    track(EVENTS.DAILY_SESSION_COMPOSED, {
      surface: 'home',
      slot: dailySession.slot,
      pose_count: dailySession.asanaIds.length,
      duration_s: dailySession.totalSeconds,
      target_dosha: dailySession.meta.targetDosha,
      dosha_source: dailySession.meta.doshaSource,
      checkin: dailySession.meta.checkin,
      reason_codes: dailySession.reasons.map(r => r.code),
      seed: dailySession.seed,
    })
  }, [user?.id, dailySession])

  // Viewport impression = CTR denominator (same content_impression pattern as
  // every other card).
  const dailyImpressionRef = useImpression({
    surface:     'home_daily_session',
    contentType: 'daily_session',
    contentId:   dailySession.slot,
  })

  const handleStartDaily = () => {
    track(EVENTS.DAILY_SESSION_CTA_TAPPED, {
      slot: dailySession.slot,
      pose_count: dailySession.asanaIds.length,
      duration_s: dailySession.totalSeconds,
      reason_codes: dailySession.reasons.map(r => r.code),
    })
    navigate('/practice/daily', { state: { session: dailySession } })
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-20">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">spa</span>
          <span className="font-headline italic text-primary text-base">The Sanctuary</span>
        </div>
        {/* Profile button — gains a subtle Plus identity marker when the
            user is a Plus member. A 2px ring around the avatar, plus a
            small filled workspace_premium star in the corner. Every time
            the user opens the app they see "I'm Plus" without reading a
            single word. That's the identity-as-asset retention play. */}
        <button
          onClick={() => navigate('/profile')}
          className={`relative w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center ${
            isPremium ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
          }`}
          aria-label={isPremium ? t('home.profileAriaPlus') : t('home.profileAria')}
        >
          <span className="material-symbols-outlined text-on-surface-variant text-lg">person</span>
          {isPremium && (
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-sm"
            >
              <span
                className="material-symbols-outlined text-on-primary text-[10px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                workspace_premium
              </span>
            </span>
          )}
        </button>
      </div>

      <div className="px-6 flex flex-col gap-6">

        {/* ── Greeting ── */}
        <div className="stagger-1">
          <p className="font-label text-xs text-primary uppercase tracking-widest mb-1">
            {t('home.namaste')}
          </p>
          {/* Punctuation lives in the locale string: the trailing period is a
              Latin typographic flourish. Devanagari ends sentences with a
              danda (।), and a bare name takes no terminal mark at all — so
              Hindi renders the name on its own. */}
          <h1 className="font-headline text-4xl text-on-surface leading-tight">
            {t('home.greetingName', { name: firstName })}
          </h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            {subtitle}
          </p>
        </div>

        {/* ── Streak & Minutes Tiles ──
            Three-state render to avoid layout shift:
              1. have cached/real sessions → show real tiles immediately
              2. still loading, no cache   → show same-shape skeleton so the
                                             page below doesn't jump when
                                             data arrives
              3. loaded + no sessions      → render nothing (user hasn't
                                             started practicing yet) */}
        {stats.hasSessions ? (
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
                <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">{t('home.dayStreak')}</p>
              </div>
              <p className="font-headline text-3xl text-primary leading-none">{stats.streak}</p>
              <p className="font-body text-[10px] text-on-surface-variant/50 mt-1">
                {stats.streak === 1 ? t('home.streakOneDay') : t('home.streakDays')}
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
                <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">{t('home.thisWeek')}</p>
              </div>
              <p className="font-headline text-3xl text-secondary leading-none">{stats.weekMinutes}</p>
              <p className="font-body text-[10px] text-on-surface-variant/50 mt-1">{t('home.minutesPracticed')}</p>
            </button>
          </div>
        ) : stats.loading ? (
          // Matches the real tiles' dimensions exactly (p-4 + 2 text lines +
          // headline + sublabel). The `animate-pulse` comes from Tailwind.
          <div className="grid grid-cols-2 gap-3 stagger-2" aria-hidden="true">
            <div className="rounded-xl p-4 bg-primary-container/20 border border-primary/[0.05] animate-pulse">
              <div className="h-3 w-16 bg-on-surface-variant/10 rounded mb-3" />
              <div className="h-8 w-10 bg-on-surface-variant/15 rounded mb-2" />
              <div className="h-2.5 w-24 bg-on-surface-variant/10 rounded" />
            </div>
            <div className="rounded-xl p-4 bg-secondary-container/20 border border-secondary/[0.05] animate-pulse">
              <div className="h-3 w-16 bg-on-surface-variant/10 rounded mb-3" />
              <div className="h-8 w-10 bg-on-surface-variant/15 rounded mb-2" />
              <div className="h-2.5 w-24 bg-on-surface-variant/10 rounded" />
            </div>
          </div>
        ) : null}

        {/* ── Vikriti re-check prompt — only when due, and only after the
             schedule hook has resolved so it doesn't pop in late. */}
        {!vikriti.loading && vikriti.isDue && vikriti.hasPrakriti && (
          <button
            onClick={() => {
              track(EVENTS.CTA_CLICKED, {
                cta_id:          'home_vikriti_take',
                route_name:      'home',
                days_since_last: vikriti.daysSinceLast === Infinity ? null : vikriti.daysSinceLast,
              })
              navigate('/vikriti')
            }}
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
                  {vikriti.vikritiCount === 0 ? t('home.checkinFirstKicker') : t('home.checkinWeeklyKicker')}
                </p>
                <p className="font-body font-semibold text-sm text-on-surface leading-tight">
                  {vikriti.vikritiCount === 0
                    ? t('home.checkinFirstPrompt')
                    : t('home.checkinWeeklyPrompt', { days: vikriti.daysSinceLast })}
                </p>
                <p className="font-body text-[11px] text-on-surface-variant mt-0.5">{t('home.checkinMeta')}</p>
              </div>
              <span className="material-symbols-outlined text-primary text-lg flex-shrink-0">arrow_forward</span>
            </div>
          </button>
        )}

        {/* ── Analytics consent card ──
            Shown only after the user has at least one completed practice
            (so we've earned enough trust to ask) and only if the consent
            module says to ask now (i.e. no prior decision, not in cool-off). */}
        {stats.hasSessions && <AnalyticsConsentCard />}

        {/* ── Daily Check-in ── */}
        <div className="bg-surface-container-low rounded-xl p-5 stagger-3">
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-4">
            {t('home.feelingToday')}
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
              placeholder={t('home.searchPlaceholder')}
              className="w-full bg-background rounded-full pl-10 pr-10 py-3 text-on-surface font-body text-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/35"
              aria-label={t('home.searchAria')}
            />
            {searchQuery.length > 0 && (
              <button
                onClick={() => {
                  if (searchQuery.trim().length >= 2) navigate('/recommendations', { state: { query: searchQuery.trim(), source: analytics.SEARCH_SOURCES.HOME_SEARCH } })
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-all"
                aria-label={t('home.searchAria')}
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
                <span className="font-body text-sm font-medium">{t(option.labelKey)}</span>
              </button>
            ))}
          </div>
          {checkedIn && (
            <button
              onClick={() => {
                track(EVENTS.CTA_CLICKED, { cta_id: 'home_get_practice', routine_key: routineKey, checkin: checkedIn })
                navigate('/routine', { state: { routineKey } })
              }}
              className="w-full mt-4 py-3 bg-primary text-on-primary rounded-full font-label text-xs font-semibold tracking-wide active:scale-95 transition-all"
            >
              {t('home.getMyPractice')}
            </button>
          )}
        </div>

        {/* ── Welcome-to-Plus — the moment-of-joining card. Shown once
              per device after isPremium activates, then permanently
              dismissed via localStorage. Renders ABOVE the Vikriti card
              because a brand-new Plus user's first job is to discover
              what they just unlocked, not to read a vikriti reading
              (which will still be there tomorrow). */}
        <WelcomeToPlusCard />

        {/* ── Vikriti drift reading — only renders when the last 14 days
              of checkins produce a clear signal. Conservative thresholds
              keep this off most users' screens most of the time, which
              is the point — when it DOES fire, it should feel meaningful. */}
        {vikritiSignal.hasSignal && (
          <VikritiCard
            signal={vikritiSignal}
            isPremium={isPremium}
            onOpenPaywall={() => setVikritiPaywallOpen(true)}
          />
        )}

        {/* ── Today's Practice — the composed daily-session hero (DAU CTA) ── */}
        {!dailyDone ? (
          <button
            ref={dailyImpressionRef}
            onClick={handleStartDaily}
            className="relative overflow-hidden w-full text-left rounded-2xl p-6 stagger-3 bg-gradient-to-br from-primary to-primary-container active:scale-[0.98] transition-all shadow-md"
          >
            {/* soft decorative rings echoing the breathwork card */}
            <div aria-hidden="true" className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-on-primary/5" />
            <div aria-hidden="true" className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-on-primary/5" />
            <div className="relative">
              <p className="font-label text-[10px] uppercase tracking-widest text-on-primary/70 mb-1.5 font-semibold">
                {t('home.daily.eyebrow')}
              </p>
              <h3 className="font-headline text-2xl text-on-primary leading-tight mb-1">
                {t(dailyTitleKey)}
              </h3>
              <p className="font-body text-sm text-on-primary/85 mb-4">
                {t('home.daily.meta', { min: dailyDurationMin, count: dailySession.asanaIds.length })}
              </p>
              {dailyReasonChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {dailyReasonChips.map((chip, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-on-primary/15 font-label text-[10px] text-on-primary/90 tracking-wide">
                      {chip}
                    </span>
                  ))}
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-surface rounded-full shadow-sm">
                <span aria-hidden="true" className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                <span className="font-label text-xs uppercase tracking-wider text-primary font-semibold">{t('home.daily.start')}</span>
              </div>
            </div>
          </button>
        ) : (
          <div ref={dailyImpressionRef} className="rounded-2xl p-6 stagger-3 bg-surface-container border border-primary-container/40">
            <div className="flex items-center gap-2 mb-1.5">
              <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="font-headline text-lg text-on-surface leading-tight">
                {t('home.daily.doneTitle', { title: t(dailyTitleKey) })}
              </p>
            </div>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              {dailyNextSlot ? t('home.daily.doneEveningTeaser') : t('home.daily.doneAllBody')}
            </p>
          </div>
        )}

        {/* ── Daily Ritual — Breathing (redesigned with staggered breath rings) ── */}
        <button
          onClick={() => {
            track(EVENTS.CTA_CLICKED, { cta_id: 'home_breathwork', asana_id: 'mindfulRespiration' })
            navigate('/practice/asana/mindfulRespiration')
          }}
          className="relative overflow-hidden bg-gradient-to-br from-primary-container/60 via-surface-container-low to-primary-container/30 rounded-2xl p-5 stagger-4 active:scale-[0.98] transition-all w-full text-left border border-primary-container/50"
        >
          <div className="flex items-center gap-4">
            {/* Breathing rings — 3 staggered concentric circles */}
            <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-breath-ring" />
              <div className="absolute inset-1.5 rounded-full bg-primary/25 animate-breath-ring-delay-1" />
              <div className="absolute inset-3 rounded-full bg-primary/30 animate-breath-ring-delay-2" />
              <div className="relative w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-on-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <p className="font-label text-[9px] text-primary uppercase tracking-widest mb-1 font-semibold">{t('home.dailyRitual')}</p>
              <h3 className="font-headline text-xl text-on-surface leading-snug">{t('home.mindfulRespiration')}</h3>
              <p className="font-body text-xs text-on-surface-variant mt-1">{t('home.inhaleHoldExhale')}</p>
            </div>

            {/* Begin CTA */}
            <div className="flex items-center gap-1 px-4 py-2.5 bg-primary rounded-full flex-shrink-0 shadow-sm">
              <span className="font-label text-[11px] text-on-primary uppercase tracking-wider font-semibold">{t('home.begin')}</span>
              <span className="material-symbols-outlined text-on-primary text-sm">arrow_forward</span>
            </div>
          </div>
        </button>

        {/* ── What to Avoid ── */}
        <div className="bg-secondary-container/15 rounded-xl p-5 stagger-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="material-symbols-outlined text-secondary text-lg">block</span>
            <h3 className="font-headline text-lg text-on-surface">{t('home.avoid.title')}</h3>
            <span className="ml-auto font-label text-[10px] text-on-secondary-container uppercase tracking-widest font-semibold bg-secondary-container px-2.5 py-1 rounded-full">{t(`home.avoid.badge.${timeOfDay}`)}</span>
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
              {t('home.avoid.reminder')}
            </p>
          </div>
        </div>

        {/* ── Dosha Card — themed per user's dosha, with vikriti delta overlay ── */}
        {(() => {
          const userDosha = (profile?.dosha_details?.primary || profile?.dosha || '').toLowerCase()
          // Dosha proper nouns stay literal across locales.
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
              element: t('home.dosha.vata.element'),
              tagline: t('home.dosha.vata.tagline'),
              bgIcon: 'air',
            },
            pitta: {
              gradient: 'from-[#8b6a3e] to-[#c49a5c]',
              icon: 'local_fire_department',
              element: t('home.dosha.pitta.element'),
              tagline: t('home.dosha.pitta.tagline'),
              bgIcon: 'local_fire_department',
            },
            kapha: {
              gradient: 'from-[#5a7a52] to-[#8aad7e]',
              icon: 'landscape',
              element: t('home.dosha.kapha.element'),
              tagline: t('home.dosha.kapha.tagline'),
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
                    {hasDosha ? theme.element : t('home.dosha.type')}
                  </p>
                </div>

                <h3 className="font-headline text-2xl mb-1">
                  {hasDosha
                    ? t('home.dosha.suffix', { dosha: doshaDisplayName(userDosha) })
                    : t('home.dosha.undiscovered')}
                </h3>

                {hasDosha ? (
                  <p className="font-body text-xs opacity-80 leading-relaxed mb-3">
                    {theme.tagline}
                  </p>
                ) : (
                  <p className="font-body text-xs opacity-70 leading-relaxed mb-4">
                    {t('home.dosha.quizPrompt')}
                  </p>
                )}

                {/* Pill row — status badge + CTA. Wrap in a flex container
                    with explicit gap so they never touch on narrow screens
                    and align consistently when both are present. */}
                <div className="flex flex-wrap items-center gap-2">
                  {hasDosha && vikritiPrimary && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 backdrop-blur-sm rounded-full">
                      <span className="material-symbols-outlined text-[12px] opacity-80" aria-hidden="true">
                        {hasShifted ? 'trending_up' : 'check_circle'}
                      </span>
                      <span className="font-label text-[10px] tracking-wide opacity-90">
                        {hasShifted
                          ? t('home.dosha.elevatedThisWeek', { dosha: DOSHA_LABELS[vikritiPrimary] })
                          : t('home.dosha.inRhythm')}
                      </span>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full font-label text-xs tracking-wide">
                    {hasDosha
                      ? (hasShifted ? t('home.dosha.seeRebalance') : t('home.dosha.exploreDosha'))
                      : t('home.dosha.takeQuiz')}
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                  </span>
                </div>
              </div>
            </button>
          )
        })()}

        {/* ── Quote ── */}
        <div className="bg-surface-container-low rounded-xl p-6 text-center stagger-7">
          <span className="material-symbols-outlined text-outline-variant text-3xl mb-3 block">format_quote</span>
          <p className="font-headline italic text-lg text-on-surface-variant leading-relaxed mb-3">
            "{t(`home.quotes.${quoteIndex}`, quote.text)}"
          </p>
          <p className="font-label text-[10px] uppercase tracking-widest text-primary">
            {quote.author}
          </p>
        </div>

      </div>

      {/* Paywall sheet for the Vikriti card's Plus action. Surface is
          dosha-tagged so PostHog can compare conversion across vikriti
          types — useful for tuning recommendation depth per dosha. */}
      <PaywallSheet
        open={vikritiPaywallOpen}
        onClose={() => setVikritiPaywallOpen(false)}
        surface={`vikriti_${vikritiSignal.vikriti || 'unknown'}`}
        headline={t('home.paywallHeadline')}
        subhead={t('home.paywallSubhead')}
      />

    </div>
  )
}
