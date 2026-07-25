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
import ReminderPrompt from '../components/ReminderPrompt'
import PaywallSheet from '../components/PaywallSheet'
import WelcomeToPlusCard from '../components/WelcomeToPlusCard'
import AnalyticsConsentCard from '../components/AnalyticsConsentCard'
import MealOfTheDayCard from '../components/MealOfTheDayCard'
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

// ── Dosha accent hexes ──
// Mirror the canonical dosha tokens (--color-vata/pitta/kapha in index.css) so
// the balance triangle + state pill match the dosha colour used everywhere
// else (Dosha profile, vikriti chart, tags). Kept literal here because the
// triangle draws all THREE at once — the single dosha-adaptive
// --color-primary can't paint a three-way shape. INK is a darkened pair for
// text/edges on the oat ground.
const DOSHA_HEX  = { vata: '#35708f', pitta: '#9e5720', kapha: '#467539' }
const DOSHA_INK  = { vata: '#2c5f79', pitta: '#83471a', kapha: '#3a6130' }

// ── Balance shape geometry ──
// The three dosha vertices of the ternary triangle (viewBox 300×168) and its
// centroid. buildBalanceShape places one "level point" per dosha along the
// line from centre → vertex: the dominant dosha stretches out toward its
// corner, the others sit lower. We only know WHICH dosha is elevated (the
// signal returns a single dosha, not per-dosha scores), so this is an honest
// "shape of you" at a glance — not a measurement. No dominant ⇒ balanced.
const TRI      = { vata: [150, 12], pitta: [288, 158], kapha: [12, 158] }
const TRI_C    = [150, 109.33]
function levelPoint(dosha, level) {
  const [vx, vy] = TRI[dosha]
  const [cx, cy] = TRI_C
  return [cx + level * (vx - cx), cy + level * (vy - cy)]
}
function buildBalanceShape({ dominant, percentages, elevated } = {}) {
  let levels
  if (percentages && !elevated) {
    // Real quiz numbers → an accurate shape. Scale % into a readable
    // level (a 45% dosha stretches most of the way out; a 20% dosha sits
    // close to centre), clamped so the polygon never collapses or clips.
    const lv = p => Math.max(0.24, Math.min(0.88, (Number(p) || 0) / 100 * 1.55))
    levels = { vata: lv(percentages.vata), pitta: lv(percentages.pitta), kapha: lv(percentages.kapha) }
  } else if (dominant) {
    // Acute vikriti signal (or no percentages) → skew hard toward the
    // elevated dosha.
    levels = { vata: 0.34, pitta: 0.34, kapha: 0.34 }
    levels[dominant] = 0.82
  } else {
    levels = { vata: 0.5, pitta: 0.5, kapha: 0.5 }
  }
  const dots = {
    vata:  levelPoint('vata',  levels.vata),
    pitta: levelPoint('pitta', levels.pitta),
    kapha: levelPoint('kapha', levels.kapha),
  }
  const fmt = p => `${p[0].toFixed(0)},${p[1].toFixed(0)}`
  return { inner: [dots.vata, dots.pitta, dots.kapha].map(fmt).join(' '), dots, levels }
}

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { profile, user } = useAuth()
  // checkin is still fed to the composer (null = no explicit mood); the home
  // no longer exposes a mood picker, so there's no setter.
  const [checkedIn] = useState(null)

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

  // ── Current dosha state — drives the pill, the balance shape, and the
  // favour list. We ALWAYS have a state when the user has taken the quiz:
  //   acute vikriti signal  →  "High Pitta"  (elevated, a temporary flare)
  //   otherwise constitution →  "Pitta"       (their baseline from the quiz)
  // Only a user with no dosha at all falls through to the quiz CTA. ───────────
  const vikritiFresh   = vikriti.lastVikritiAt && vikriti.daysSinceLast <= 14
  const signalDosha    = vikritiSignal.hasSignal
    ? vikritiSignal.vikriti
    : (vikritiFresh ? vikriti.lastVikritiPrimary : null)
  const prakriti       = (profile?.dosha_details?.primary || profile?.dosha || '').toLowerCase()
  const prakritiValid  = ['vata', 'pitta', 'kapha'].includes(prakriti)
  const isElevated     = !!signalDosha
  const currentDosha   = signalDosha || (prakritiValid ? prakriti : null)
  const currentDoshaName = currentDosha ? doshaDisplayName(currentDosha) : null
  const doshaPercentages = profile?.dosha_details?.percentages || null
  // Favour list follows the current state (or constitution; balanced fallback).
  const favourDosha    = currentDosha
  const favourTips     = t(`home.favour.${favourDosha || 'balanced'}`, { returnObjects: true })
  const balanceShape   = buildBalanceShape({
    dominant:    currentDosha,
    percentages: doshaPercentages,
    elevated:    isElevated,
  })

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

      {/* ── First viewport — the greeting sits at the top, the single focus is
           centred in the space below it, and the whole thing fills the screen
           so nothing else shows above the fold. Everything else is a scroll
           away. ── */}
      <div className="px-6 flex flex-col min-h-[calc(100dvh-8rem)]">

        {/* ── Greeting + current-state pill ── */}
        <div className="stagger-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-label text-xs text-primary uppercase tracking-widest mb-1">
                {t('home.namaste')}
              </p>
              {/* Punctuation lives in the locale string (Latin period vs. bare
                  name in Devanagari). */}
              <h1 className="font-headline text-4xl text-on-surface leading-tight">
                {t('home.greetingName', { name: firstName })}
              </h1>
            </div>
            {currentDosha && (
              <span
                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-xs font-semibold mt-1"
                style={{ backgroundColor: `${DOSHA_HEX[currentDosha]}1f`, color: DOSHA_INK[currentDosha] }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: DOSHA_HEX[currentDosha] }} />
                {isElevated ? t('home.state.pill', { dosha: currentDoshaName }) : currentDoshaName}
              </span>
            )}
          </div>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            {subtitle}
          </p>
        </div>

        {/* ── The focus — today's composed session. Not a card: the practice
             fills the page's attention, with a single round Begin. This is the
             one thing the home is for. Centred in the viewport's spare space. ── */}
        <div className="flex-1 flex flex-col justify-center py-6">
        {!dailyDone ? (
          <div ref={dailyImpressionRef} className="stagger-2 flex flex-col items-center text-center">
            <p className="font-label text-[11px] uppercase tracking-[0.16em] text-on-surface-variant/70 font-semibold mb-2.5">
              {t('home.daily.eyebrow')}
            </p>
            <h2 className="font-headline text-[2.75rem] leading-[1.02] tracking-tight text-on-surface">
              {t(dailyTitleKey)}
            </h2>
            <p className="font-body text-sm text-on-surface-variant mt-3">
              {t('home.daily.meta', { min: dailyDurationMin, count: dailySession.asanaIds.length })}
            </p>
            {dailyReasonChips.length > 0 && (
              <p className="font-body text-[13px] text-on-surface-variant/90 mt-2 max-w-[26ch] leading-relaxed">
                {dailyReasonChips.join(' · ')}
              </p>
            )}
            <button
              onClick={handleStartDaily}
              aria-label={t('home.daily.start')}
              className="mt-7 w-[116px] h-[116px] rounded-full flex flex-col items-center justify-center text-white shadow-lg active:scale-95 transition-all"
              style={{ background: 'radial-gradient(120% 120% at 50% 12%, #3f7659, var(--color-pine, #2b5a42) 74%)' }}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              <span className="font-body text-[15px] font-medium mt-0.5">{t('home.daily.start')}</span>
            </button>
            <button
              onClick={() => navigate('/discover/practices')}
              className="mt-4 font-body text-[13px] text-primary border-b border-primary/30 pb-0.5"
            >
              {t('home.focus.another', 'choose another practice')}
            </button>
          </div>
        ) : (
          <div ref={dailyImpressionRef} className="stagger-2 flex flex-col items-center text-center">
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-4xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <h2 className="font-headline text-2xl text-on-surface leading-tight">
              {t('home.daily.doneTitle', { title: t(dailyTitleKey) })}
            </h2>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed mt-2 max-w-[28ch]">
              {dailyNextSlot ? t('home.daily.doneEveningTeaser') : t('home.daily.doneAllBody')}
            </p>
          </div>
        )}
        </div>
      </div>

      {/* ── Below the fold — the depth. ── */}
      <div className="px-6 flex flex-col gap-6 pt-2">

        {/* ── Vikriti re-check prompt — only when due, after the schedule hook
             has resolved so it doesn't pop in late. ── */}
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
                <p className="font-label text-[11px] text-primary uppercase tracking-widest mb-0.5">
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

        {/* ── Your day — practices only. Honest rows: the composed session
             (now) and the daily breath ritual. No meals, no "anytime". ── */}
        <div className="stagger-3">
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2 px-1">
            {t('home.day.title')}
          </p>
          <div className="flex flex-col">
            <button
              onClick={handleStartDaily}
              className="flex items-center gap-3.5 rounded-xl px-3 py-3.5 text-left bg-primary-container/30 active:scale-[0.99] transition-all"
            >
              <span className="font-headline italic text-[13px] text-primary w-16 flex-shrink-0">
                {t(`home.day.when.${timeOfDay}`)}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-body text-[15px] font-medium text-on-surface leading-snug">{t(dailyTitleKey)}</span>
                <span className="block font-body text-xs text-on-surface-variant mt-0.5">
                  {t('home.daily.meta', { min: dailyDurationMin, count: dailySession.asanaIds.length })}
                </span>
              </span>
              <span className="flex-shrink-0 font-label text-[10px] font-semibold uppercase tracking-wide text-on-primary bg-primary rounded-full px-2.5 py-1">
                {t('home.day.now')}
              </span>
            </button>
            <button
              onClick={() => {
                track(EVENTS.CTA_CLICKED, { cta_id: 'home_day_breath', asana_id: 'mindfulRespiration' })
                navigate('/practice/asana/mindfulRespiration')
              }}
              className="flex items-center gap-3.5 rounded-xl px-3 py-3.5 text-left border-t border-outline-variant/40 active:bg-surface-container-low transition-all"
            >
              <span className="font-headline italic text-[13px] text-on-surface-variant w-16 flex-shrink-0">
                {t('home.day.breathWhen')}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-body text-[15px] font-medium text-on-surface leading-snug">{t('home.mindfulRespiration')}</span>
                <span className="block font-body text-xs text-on-surface-variant mt-0.5">{t('home.inhaleHoldExhale')}</span>
              </span>
              <span className="material-symbols-outlined text-outline text-lg flex-shrink-0">chevron_right</span>
            </button>
          </div>
        </div>

        {/* ── Analytics consent — only after ≥1 completed practice. ── */}
        {stats.hasSessions && <AnalyticsConsentCard />}

        {/* ── Welcome-to-Plus — the moment-of-joining card (once per device). ── */}
        <WelcomeToPlusCard />

        {/* ── Your state this week — the balance shape. Renders only with a
             current-state signal; otherwise the constitution/quiz card below
             takes its place. Tapping opens the full dosha reading. ── */}
        {currentDosha ? (
          <button
            onClick={() => navigate('/dosha')}
            className="w-full text-left rounded-2xl p-5 stagger-4 bg-surface-container-low border border-outline-variant/40 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">{t('home.state.title')}</p>
              <span className="inline-flex items-center gap-0.5 font-body text-xs font-semibold text-primary">
                {t('home.state.details')}
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </span>
            </div>
            <div className="flex justify-center my-1">
              <svg viewBox="0 0 300 168" width="300" height="168" className="max-w-full" aria-hidden="true">
                <polygon points="150,12 288,158 12,158" fill="none" stroke="var(--color-outline-variant)" strokeWidth="1.4" />
                <line x1="150" y1="12" x2="150" y2="111" stroke="var(--color-outline-variant)" strokeOpacity="0.5" strokeWidth="1" />
                <line x1="288" y1="158" x2="81" y2="85" stroke="var(--color-outline-variant)" strokeOpacity="0.5" strokeWidth="1" />
                <line x1="12" y1="158" x2="219" y2="85" stroke="var(--color-outline-variant)" strokeOpacity="0.5" strokeWidth="1" />
                <polygon
                  points={balanceShape.inner}
                  fill={DOSHA_HEX[currentDosha]} fillOpacity="0.18"
                  stroke={DOSHA_HEX[currentDosha]} strokeWidth="1.6" strokeLinejoin="round"
                />
                <circle cx={balanceShape.dots.vata[0]}  cy={balanceShape.dots.vata[1]}  r="4" fill={DOSHA_HEX.vata} />
                <circle cx={balanceShape.dots.pitta[0]} cy={balanceShape.dots.pitta[1]} r="4" fill={DOSHA_HEX.pitta} />
                <circle cx={balanceShape.dots.kapha[0]} cy={balanceShape.dots.kapha[1]} r="4" fill={DOSHA_HEX.kapha} />
                <text x="150" y="8"   textAnchor="middle" fontSize="11" fontWeight="700" fill={DOSHA_INK.vata}>{doshaDisplayName('vata').toUpperCase()}</text>
                <text x="292" y="168" textAnchor="end"    fontSize="11" fontWeight="700" fill={DOSHA_INK.pitta}>{doshaDisplayName('pitta').toUpperCase()}</text>
                <text x="8"   y="168"                      fontSize="11" fontWeight="700" fill={DOSHA_INK.kapha}>{doshaDisplayName('kapha').toUpperCase()}</text>
              </svg>
            </div>
            <p className="font-body text-[13px] text-on-surface-variant leading-relaxed">
              {isElevated ? t(`home.state.say.${currentDosha}`) : t(`home.state.base.${currentDosha}`)}
            </p>
          </button>
        ) : (
          // ── No dosha yet — the quiz entry. Once taken, the triangle above
          // takes over permanently. ──
          <button
            onClick={() => navigate('/quiz')}
            className="rounded-xl p-6 text-left relative overflow-hidden stagger-4 active:scale-[0.98] transition-all w-full bg-primary text-on-primary"
          >
            <div className="absolute -right-8 -bottom-8 opacity-10"><span className="material-symbols-outlined text-[8rem]">spa</span></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-sm opacity-70">spa</span>
                <p className="font-label text-[11px] uppercase tracking-widest opacity-70">{t('home.dosha.type')}</p>
              </div>
              <h3 className="font-headline text-2xl mb-1">{t('home.dosha.undiscovered')}</h3>
              <p className="font-body text-xs leading-relaxed opacity-70 mb-4">{t('home.dosha.quizPrompt')}</p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full font-label text-xs tracking-wide">
                {t('home.dosha.takeQuiz')}
                <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
              </span>
            </div>
          </button>
        )}

        {/* ── Vikriti drift reading — the actionable nudge + Plus teaser. Only
              fires on a clear 14-day signal (same gate as the state card). ── */}
        {vikritiSignal.hasSignal && (
          <VikritiCard
            signal={vikritiSignal}
            isPremium={isPremium}
            onOpenPaywall={() => setVikritiPaywallOpen(true)}
          />
        )}

        {/* ── To nourish — the meal composer's idea. Renders nothing when it
             has none, so Home never carries an empty apology card. ── */}
        <div className="stagger-5">
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2 px-1">
            {t('home.nourish.title')}
          </p>
          <MealOfTheDayCard />
        </div>

        {/* ── To favour / ease off — always on, keyed to current state (or
             constitution) for favour and to time-of-day for what to ease. ── */}
        <div className="grid grid-cols-1 gap-3 stagger-5">
          <div className="bg-primary-container/20 rounded-xl p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="material-symbols-outlined text-primary text-lg">eco</span>
              <h3 className="font-headline text-lg text-on-surface">{t('home.favour.title')}</h3>
              {favourDosha && (
                <span className="ml-auto font-label text-[11px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${DOSHA_HEX[favourDosha]}22`, color: DOSHA_INK[favourDosha] }}>
                  {doshaDisplayName(favourDosha)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              {(Array.isArray(favourTips) ? favourTips : []).map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary/70 text-base mt-0.5 flex-shrink-0">check</span>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary-container/15 rounded-xl p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="material-symbols-outlined text-secondary text-lg">block</span>
              <h3 className="font-headline text-lg text-on-surface">{t('home.favour.avoidTitle')}</h3>
              <span className="ml-auto font-label text-[11px] text-on-secondary-container uppercase tracking-widest font-semibold bg-secondary-container px-2.5 py-1 rounded-full">
                {t(`home.avoid.badge.${timeOfDay}`)}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {avoidTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary/70 text-base mt-0.5 flex-shrink-0">{tip.icon}</span>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
            <p className="font-label text-[11px] text-secondary/60 uppercase tracking-widest text-center italic mt-4 pt-3 border-t border-secondary-container/20">
              {t('home.avoid.reminder')}
            </p>
          </div>
        </div>

        {/* One-time nudge to enable the daily reminder (after 2 daily sessions). */}
        <ReminderPrompt />

        {/* ── Your practice — the journey card. Three numbers, tappable. Skeleton
             while stats hydrate so the page below doesn't jump. ── */}
        {stats.hasSessions ? (
          <div className="stagger-6">
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2 px-1">
              {t('home.journey.section')}
            </p>
            <button
              onClick={() => navigate('/journey')}
              className="w-full text-left bg-surface-container-low rounded-2xl p-5 border border-outline-variant/40 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-headline text-lg text-on-surface">{t('home.journey.title')}</span>
                <span className="inline-flex items-center gap-0.5 font-body text-xs font-semibold text-primary">
                  {t('home.journey.seeAll')}
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </span>
              </div>
              <div className="flex justify-between">
                <div>
                  <div className="font-headline text-3xl text-on-surface leading-none tabular-nums">{stats.streak}</div>
                  <div className="font-body text-[11px] text-on-surface-variant mt-1.5">{t('home.journey.streak')}</div>
                </div>
                <div>
                  <div className="font-headline text-3xl text-on-surface leading-none tabular-nums">{stats.weekMinutes}</div>
                  <div className="font-body text-[11px] text-on-surface-variant mt-1.5">{t('home.journey.week')}</div>
                </div>
                <div>
                  <div className="font-headline text-3xl text-on-surface leading-none tabular-nums">{stats.totalSessions}</div>
                  <div className="font-body text-[11px] text-on-surface-variant mt-1.5">{t('home.journey.sessions')}</div>
                </div>
              </div>
            </button>
          </div>
        ) : stats.loading ? (
          <div className="stagger-6 bg-surface-container-low rounded-2xl p-5 border border-outline-variant/30 animate-pulse" aria-hidden="true">
            <div className="h-4 w-28 bg-on-surface-variant/10 rounded mb-5" />
            <div className="flex justify-between">
              {[0, 1, 2].map(i => (
                <div key={i}>
                  <div className="h-8 w-10 bg-on-surface-variant/15 rounded mb-2" />
                  <div className="h-2.5 w-16 bg-on-surface-variant/10 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ── Verse — the day's line, in full, with attribution. ── */}
        <div className="bg-surface-container-low rounded-xl p-6 text-center stagger-7">
          <span className="material-symbols-outlined text-outline-variant text-3xl mb-3 block">format_quote</span>
          <p className="font-headline italic text-lg text-on-surface-variant leading-relaxed mb-3">
            "{t(`home.quotes.${quoteIndex}`, quote.text)}"
          </p>
          <p className="font-label text-[11px] uppercase tracking-widest text-primary">
            {quote.author}
          </p>
        </div>

      </div>

      {/* Paywall sheet for the Vikriti card's Plus action. Dosha-tagged so
          PostHog can compare conversion across vikriti types. */}
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
