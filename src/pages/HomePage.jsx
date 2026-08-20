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
import { useMealCheckAccess } from '../hooks/useMealCheckAccess'
import VikritiCard from '../components/VikritiCard'
import ReminderPrompt from '../components/ReminderPrompt'
import PaywallSheet from '../components/PaywallSheet'
import WelcomeToPlusCard from '../components/WelcomeToPlusCard'
import AnalyticsConsentCard from '../components/AnalyticsConsentCard'
import MealOfTheDayCard from '../components/MealOfTheDayCard'
import DoshaGem, { GEM_HUE, gemRadiusAtU } from '../components/DoshaGem'
import { track, screen, setSuperProps, EVENTS } from '../lib/track'
import { saveDoshaSelfReport, doshaSelfReport } from '../lib/doshaSelfReport'
import { deriveCurrentDoshaState } from '../lib/currentDoshaState'
import { getIntent } from '../lib/intent'
import { getRefine } from '../lib/refine'
import { computeFamiliarity } from '../lib/familiarity'

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

// Gem legend geometry. The WebGL gem (DoshaGem) stacks its colour bands
// BOTTOM→TOP in descending-% order (largest dosha at the bottom), with the
// band boundaries at the cumulative fractions. So each dosha's label + leader
// line is positioned dynamically at the vertical CENTRE of its own band —
// the line always lands on the matching colour, for any split. Coords are in
// the overlay's 300×180 viewBox (stretched to the card, preserveAspectRatio
// none), so y maps 1:1 to the container height.
const GEM_TOP_VY = 22    // viewBox-y of the liquid's visible top (the tip)
const GEM_BOT_VY = 164   // viewBox-y of the liquid's visible bottom
const GEM_CX = 150       // gem centre-x in the 300-wide viewBox
const GEM_EDGE_VX = 80   // half-width (viewBox units) of the gem at its widest
// Build the per-dosha legend rows from an already-sorted (descending) order.
// Each row carries the leader line's endpoints: the outer end sits by the
// label, the inner end lands exactly on the gem's edge at that band's height
// (narrow near the tip, wide low), so no line floats short of the teardrop.
function gemLegendRows(order, pct) {
  const total = order.reduce((s, d) => s + (pct[d] || 0), 0) || 1
  let acc = 0
  return order.map((d, i) => {
    const f = (pct[d] || 0) / total
    const uCentre = acc + f / 2   // 0 = gem bottom, 1 = gem top
    acc += f
    const vy = GEM_BOT_VY - uCentre * (GEM_BOT_VY - GEM_TOP_VY)
    // Middle band sits on the left; top & bottom bands on the right. Keeps the
    // three rows from colliding and mirrors the original around-the-gem look.
    const side = i === 1 ? 'left' : 'right'
    const edge = gemRadiusAtU(uCentre) * GEM_EDGE_VX
    const x1 = side === 'right' ? 236 : 64                       // by the label
    const x2 = side === 'right' ? GEM_CX + edge : GEM_CX - edge  // on the gem edge
    return { dosha: d, vy, side, x1, x2 }
  })
}

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { profile, user, refreshProfile } = useAuth()
  const mealAccess = useMealCheckAccess()
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
  // Today's completed 'daily' sessions, oldest-first — the source of both the
  // done-slot set and the "Your day" timeline.
  // ⚠ stats.sessions are NORMALISED to camelCase (routineKey, timestamp). This
  // read used routine_key/created_at, which are always undefined on the
  // normalised rows, so it matched nothing and the home never showed a
  // completed state after a session. Use the normalised field names.
  // One row per completed slot (a slot repeated in a day collapses to a single
  // timeline entry, keeping the earliest completion time).
  const todaysDaily = useMemo(() => {
    const d = new Date()
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const bySlot = new Map()
    for (const s of stats.sessions || []) {
      if (s?.date !== todayStr || s?.routineKey !== 'daily') continue
      const at = s.timestamp ? new Date(s.timestamp) : null
      const slot = (at ? at.getHours() : 12) >= 17 ? 'evening' : 'morning'
      const existing = bySlot.get(slot)
      if (!existing || (s.timestamp || 0) < (existing.timestamp || 0)) bySlot.set(slot, { ...s, at, slot })
    }
    return [...bySlot.values()].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
  }, [stats.sessions])

  const doneSlotsToday = useMemo(
    () => todaysDaily.map((s) => s.slot),
    [todaysDaily],
  )

  // Which slot is due RIGHT NOW. The composer will roll an afternoon to evening
  // once morning is done, but prescribing "Evening Wind-Down" at midday reads as
  // a bug — so the home only treats a slot as active when its time has actually
  // come: morning (or an unfinished morning through the afternoon), and evening
  // only from the evening. When nothing is due, the day reads as done-for-now.
  const nowHour = new Date().getHours()
  const activeSlot = nowHour >= 17
    ? (doneSlotsToday.includes('evening') ? null : 'evening')
    : (doneSlotsToday.includes('morning') ? null : 'morning')
  const dailyDone = activeSlot === null
  // Softly point to the evening session when the morning is done and it isn't
  // evening yet — a teaser, never an active "now".
  const dailyNextSlot = (dailyDone && nowHour < 17 && !doneSlotsToday.includes('evening')) ? 'evening' : null
  const shownSlot = activeSlot || (nowHour >= 17 ? 'evening' : 'morning')
  const dailyTitleKey = shownSlot === 'evening' ? 'practice.dailyEveningTitle' : 'practice.dailyMorningTitle'

  // Compose the session for the slot that's actually due (forceSlot), so Begin
  // starts the right arc. Deterministic per (user, date, slot).
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
      forceSlot: shownSlot,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, vikritiSignal.hasSignal, vikritiSignal.vikriti, checkedIn, stats.sessions, doneSlotsToday, user?.id, shownSlot])

  const dailyDurationMin = Math.max(1, Math.round(dailySession.totalSeconds / 60))

  // The next slot still ahead today, shown in Your day as a muted "Later" row
  // (never an active "now"). Compose it so the row can show its length and start
  // it early if the user wants.
  const upcomingSlot = (!doneSlotsToday.includes('evening') && shownSlot !== 'evening') ? 'evening' : null
  const upcomingSession = useMemo(() => {
    if (!upcomingSlot) return null
    const history = [...(stats.sessions || [])].sort((a, b) =>
      String(b.created_at || b.date).localeCompare(String(a.created_at || a.date)))
    return composeDailySession({
      profile, vikriti: vikritiSignal, checkin: checkedIn, history,
      doneSlotsToday, userId: user?.id, now: new Date(), forceSlot: upcomingSlot,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcomingSlot, profile, vikritiSignal.hasSignal, vikritiSignal.vikriti, checkedIn, stats.sessions, doneSlotsToday, user?.id])

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

  const handleStartUpcoming = () => {
    if (!upcomingSession) return
    track(EVENTS.DAILY_SESSION_CTA_TAPPED, {
      slot: upcomingSession.slot, pose_count: upcomingSession.asanaIds.length,
      duration_s: upcomingSession.totalSeconds, reason_codes: upcomingSession.reasons.map(r => r.code),
      early: true,
    })
    navigate('/practice/daily', { state: { session: upcomingSession } })
  }

  // ── Current dosha state — ONE derivation drives the pill, the gem, and the
  // favour list, so they can never disagree (a class of bug #65 fixed).
  //
  // A vikriti reading (an acute check-in signal, or the vikriti quiz) reflects
  // the CURRENT state — but only relative to the CURRENT constitution. Anything
  // recorded BEFORE the latest prakriti assessment is stale: a new constitution
  // invalidates old deviations from the previous one. So re-taking the quiz
  // cleanly resets the reading instead of leaving a phantom "High Pitta". Only
  // vikriti that is both fresh (≤14 days) AND newer than the baseline counts;
  // otherwise the constitution IS the reading.
  // ONE derivation, shared with the Dosha profile page (lib/currentDoshaState.js)
  // so the "state this week" card here and the page it links to can never show
  // different readings. Home already holds the two vikriti reads + profile, so we
  // pass them straight in (no extra fetch).
  const {
    currentDosha, isElevated, balanced, prakritiValid,
    currentPercentages: doshaPercentages,
  } = deriveCurrentDoshaState({ profile, signal: vikritiSignal, schedule: vikriti })
  const currentDoshaName = currentDosha ? doshaDisplayName(currentDosha) : null
  // Favour list follows the current state (or constitution; balanced when tridoshic).
  const intent         = getIntent()
  // The qualitative "getting to know you" progression (#55) — folds the
  // self-knowledge signals we've gathered into a warm stage phrase.
  const familiarity    = computeFamiliarity({
    hasPrakriti:  prakritiValid,
    intent:       !!intent,
    refine:       !!getRefine(),
    selfReport:   !!doshaSelfReport(profile),
    vikritiCount: vikriti.vikritiCount,
  })
  // A balanced (tridoshic, un-elevated) reading favours the balanced tips, not
  // the arbitrary sort-order primary.
  const favourDosha    = balanced ? null : currentDosha
  const favourTips     = t(`home.favour.${favourDosha || 'balanced'}`, { returnObjects: true })

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
          className={`relative w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center ${
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
                style={balanced
                  ? { backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface-variant)' }
                  : { backgroundColor: `${DOSHA_HEX[currentDosha]}1f`, color: DOSHA_INK[currentDosha] }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: balanced ? 'var(--color-on-surface-variant)' : DOSHA_HEX[currentDosha] }} />
                {isElevated ? t('home.state.pill', { dosha: currentDoshaName }) : (balanced ? t('home.state.balancedName') : currentDoshaName)}
              </span>
            )}
          </div>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            {subtitle}
          </p>
        </div>

        {/* ── The focus — today's composed session. Not a card: the practice
             fills the page's attention, left-aligned with a single round Begin
             (the v9 layout). The one thing the home is for, vertically centred
             in the viewport's spare space. ── */}
        <div className="flex-1 flex flex-col justify-center py-6">
        {!dailyDone ? (
          <div ref={dailyImpressionRef} className="stagger-2 flex flex-col items-start text-left">
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
          <div ref={dailyImpressionRef} className="stagger-2 flex flex-col items-start text-left">
            {/* A filled tick that echoes the round Begin — the "done" twin of
                the start button, so the completed state has the same weight. */}
            <span
              aria-hidden="true"
              className="w-[84px] h-[84px] rounded-full flex items-center justify-center shadow-lg mb-6"
              style={{ background: 'radial-gradient(120% 120% at 50% 12%, #3f7659, var(--color-pine, #2b5a42) 74%)' }}
            >
              <span className="material-symbols-outlined text-white text-[46px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>check</span>
            </span>
            <h2 className="font-headline text-[2.5rem] leading-[1.04] tracking-tight text-on-surface">
              {t('home.daily.doneTitle', { title: t(dailyTitleKey) })}
            </h2>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed mt-3 max-w-[28ch]">
              {dailyNextSlot ? t('home.daily.doneEveningTeaser') : t('home.daily.doneAllBody')}
            </p>
            <button
              onClick={() => {
                track(EVENTS.CTA_CLICKED, { cta_id: 'home_daily_done_explore', route_name: 'home' })
                navigate('/discover/practices')
              }}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary-container text-on-primary-container font-body text-sm font-medium px-5 py-2.5 active:scale-95 transition-all"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-lg">explore</span>
              {t('home.daily.exploreMore', 'Explore more practices')}
            </button>
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

        {/* ── Your day — a timeline of the day's prescribed practice: what's
             already done (with the time), then what's next. No breath ritual
             (that lives in Discover), no meals, no "anytime". ── */}
        <div className="stagger-3">
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2 px-1">
            {t('home.day.title')}
          </p>
          <div className="flex flex-col">
            {/* Completed sessions today — so finishing one visibly changes the day. */}
            {todaysDaily.map((s, i) => (
              <div
                key={s.id || i}
                className={`flex items-center gap-3.5 rounded-xl px-3 py-3.5 text-left ${i > 0 ? 'border-t border-outline-variant/40' : ''}`}
              >
                <span className="font-headline italic text-[13px] text-on-surface-variant/60 w-16 flex-shrink-0 tabular-nums">
                  {s.at ? s.at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-body text-[15px] text-on-surface-variant leading-snug">
                    {t(s.slot === 'evening' ? 'practice.dailyEveningTitle' : 'practice.dailyMorningTitle')}
                  </span>
                </span>
                <span className="flex-shrink-0 inline-flex items-center gap-1 font-label text-[10px] font-semibold uppercase tracking-wide text-primary">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {t('home.day.done', 'Done')}
                </span>
              </div>
            ))}

            {/* What's next — only when the current composed slot isn't done. */}
            {!dailyDone && (
              <button
                onClick={handleStartDaily}
                className={`flex items-center gap-3.5 rounded-xl px-3 py-3.5 text-left bg-primary-container/30 active:scale-[0.99] transition-all ${todaysDaily.length > 0 ? 'border-t border-outline-variant/40' : ''}`}
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
            )}

            {/* Still ahead today — the evening session as a muted "Later" row
                (not an active "now"). Tappable to start early if they want. */}
            {upcomingSlot && upcomingSession && (
              <button
                onClick={handleStartUpcoming}
                className={`flex items-center gap-3.5 rounded-xl px-3 py-3.5 text-left active:bg-surface-container-low transition-all ${(todaysDaily.length > 0 || !dailyDone) ? 'border-t border-outline-variant/40' : ''}`}
              >
                <span className="font-headline italic text-[13px] text-on-surface-variant/60 w-16 flex-shrink-0">
                  {t('home.day.when.evening')}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-body text-[15px] font-medium text-on-surface leading-snug">{t('practice.dailyEveningTitle')}</span>
                  <span className="block font-body text-xs text-on-surface-variant mt-0.5">
                    {t('home.daily.meta', { min: Math.max(1, Math.round(upcomingSession.totalSeconds / 60)), count: upcomingSession.asanaIds.length })}
                  </span>
                </span>
                <span className="flex-shrink-0 font-label text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant bg-surface-container-high rounded-full px-2.5 py-1">
                  {t('home.day.later', 'Later')}
                </span>
              </button>
            )}

            {/* Everything for today is done and nothing left to tease. */}
            {dailyDone && !upcomingSlot && (
              <p className="font-body text-[13px] text-on-surface-variant/80 leading-relaxed px-3 py-3.5 border-t border-outline-variant/40">
                {t('home.day.allDone', 'That’s your prescribed practice for today. Anything more is exploration — enjoy it.')}
              </p>
            )}
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
            {/* The constitution as a glass vessel with a leader-line legend:
                the WebGL gem's colour zones are sized to the real percentages
                (proportional — all three doshas show), and the labels point to
                each dosha's zone. A pre-rendered exact-match gem set is backlogged
                (see docs/TODO.md — categorical PNGs omitted the third dosha). */}
            {(() => {
              const order = doshaPercentages
                ? ['vata', 'pitta', 'kapha'].filter(d => (doshaPercentages[d] || 0) > 0).sort((a, b) => doshaPercentages[b] - doshaPercentages[a])
                : []
              if (!order.length) return null
              const rows = gemLegendRows(order, doshaPercentages)
              return (
                <div className="relative mx-auto my-3" style={{ width: '100%', maxWidth: 320, height: 208 }}>
                  <svg viewBox="0 0 300 180" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    {rows.map(({ dosha, vy, x1, x2 }) => (
                      <line key={dosha}
                        x1={x1} y1={vy} x2={x2} y2={vy}
                        stroke="var(--color-outline-variant)" strokeWidth="1" />
                    ))}
                  </svg>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <DoshaGem percentages={doshaPercentages} dominant={currentDosha} size={200} />
                  </div>
                  {rows.map(({ dosha, vy, side }) => (
                    <div key={dosha} className="absolute" style={{
                      [side]: 0,
                      top: `${(vy / 180) * 100}%`,
                      transform: 'translateY(-50%)',
                      width: 84,
                      textAlign: side === 'right' ? 'left' : 'right',
                    }}>
                      <p className="font-headline text-xl text-on-surface leading-none tabular-nums">{Math.round(doshaPercentages[dosha])}%</p>
                      <p className="font-label text-[11px] uppercase tracking-wide mt-0.5" style={{ color: GEM_HUE[dosha].base }}>{doshaDisplayName(dosha)}</p>
                    </div>
                  ))}
                </div>
              )
            })()}
            <p className="font-body text-[13px] text-on-surface-variant leading-relaxed">
              {isElevated
                ? t(`home.state.say.${currentDosha}`)
                : (balanced ? t('home.state.base.balanced') : t(`home.state.base.${currentDosha}`))}
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

        {/* ── "Does this sound like you?" — a one-tap confirm/correct on the
             reading. Co-creation builds trust when a short quiz didn't quite
             land, and the correction (an explicit self-report) overrides the
             quiz-derived primary app-wide. Shown only for the baseline read,
             not a transient vikriti flare. (#52) ── */}
        {currentDosha && !isElevated && (
          <DoshaFitCheck
            t={t}
            dosha={currentDosha}
            report={doshaSelfReport(profile)}
            onSave={async (fit, primary) => {
              if (!user?.id) return
              track('dosha_fit_feedback', { fit, primary: primary || null, shown_dosha: currentDosha })
              await saveDoshaSelfReport(user.id, profile?.dosha_details, primary ? { fit, primary } : { fit })
              refreshProfile?.()
            }}
          />
        )}

        {/* "Getting to know you" — a qualitative read that deepens with
            engagement (never a numeric % that would read as "barely knows me").
            (#55) */}
        {familiarity && (
          <div className="flex items-center gap-2 px-1 mt-2">
            <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/50 text-[15px]">psychology</span>
            <p className="font-body text-[12px] text-on-surface-variant/80 leading-snug">
              {t(`home.familiarity.${familiarity.key}`)}
            </p>
          </div>
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
          <button
            onClick={() => navigate('/meal-check')}
            className="w-full mt-3 bg-surface-container-low rounded-2xl p-4 border border-outline-variant/40 flex items-center gap-3 text-left"
          >
            <span className="material-symbols-outlined text-primary">query_stats</span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-2">
                <span className="font-headline text-base text-on-surface">{t('mealCheck.title')}</span>
                {(mealAccess.state === 'trial' || mealAccess.state === 'trial_fresh') && (
                  <span className="shrink-0 font-label text-[10px] uppercase tracking-wide text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-full">
                    {t('mealCheck.homeBadge', { count: mealAccess.trialDaysLeft })}
                  </span>
                )}
              </span>
              <span className="block text-sm text-on-surface-variant truncate">{t('mealCheck.inputHelp')}</span>
            </span>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </button>
        </div>

        {/* ── To favour / ease off — always on, keyed to current state (or
             constitution) for favour and to time-of-day for what to ease. ── */}
        <div className="grid grid-cols-1 gap-3 stagger-5">
          <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/40">
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
            {/* Why these, in the user's own terms — a current flare vs their
                baseline constitution. Turns a generic list into an earned one. */}
            <p className="font-body text-[13px] text-on-surface-variant/80 leading-relaxed mb-3">
              {favourDosha
                ? (isElevated
                    ? t('home.favour.whyElevated', { dosha: doshaDisplayName(favourDosha) })
                    : t('home.favour.whyBase', { dosha: doshaDisplayName(favourDosha) }))
                : t('home.favour.whyBalanced')}
            </p>
            {/* Second personal anchor: the goal the user told us at onboarding
                (#53). Makes the list feel aimed at what they came for. */}
            {intent && (
              <p className="flex items-center gap-1.5 font-body text-[12px] text-primary/85 -mt-1.5 mb-3">
                <span aria-hidden="true" className="material-symbols-outlined text-[14px]">flag</span>
                {t('home.favour.goalNote', { goal: t(`onboarding.intent.options.${intent}`) })}
              </p>
            )}
            <div className="flex flex-col gap-2.5">
              {(Array.isArray(favourTips) ? favourTips : []).map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary/70 text-base mt-0.5 flex-shrink-0">check</span>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/40">
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

// "Does this sound like you?" — confirm / correct the dosha reading in one tap.
// Three states: ask → (confirmed | adjusting → picker) → acknowledged. A prior
// answer (from `report`) shows the acknowledged state with a way back in.
const FIT_DOSHAS = ['vata', 'pitta', 'kapha']
function DoshaFitCheck({ t, dosha, report, onSave }) {
  const [mode, setMode] = useState('ask')       // ask | picking
  // Seed from any durable answer on the profile; updated optimistically on tap.
  const [saved, setSaved] = useState(report)    // {fit, primary} once answered

  async function confirm() { setSaved({ fit: 'confirmed' }); await onSave('confirmed') }
  async function adjust(primary) { setMode('ask'); setSaved({ fit: 'adjusted', primary }); await onSave('adjusted', primary) }

  if (saved) {
    const ack = saved.fit === 'adjusted'
      ? t('home.fit.adjustedAck', { dosha: doshaDisplayName(saved.primary || dosha) })
      : t('home.fit.confirmedAck')
    return (
      <div className="flex items-center gap-2 px-1 mt-2.5 mb-1">
        <span aria-hidden="true" className="material-symbols-outlined text-primary text-base">check_circle</span>
        <p className="font-body text-[13px] text-on-surface-variant">{ack}</p>
        <button onClick={() => { setSaved(null); setMode('picking') }} className="ml-auto font-label text-[11px] uppercase tracking-wide text-primary">
          {t('home.fit.change')}
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-surface-container-low border border-outline-variant/40 p-4 mt-2.5 mb-1">
      {mode === 'ask' ? (
        <div className="flex items-center gap-3 flex-wrap">
          <p className="font-body text-sm text-on-surface">{t('home.fit.prompt')}</p>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={confirm} className="font-label text-xs px-3.5 py-1.5 rounded-full bg-primary text-on-primary">
              {t('home.fit.yes')}
            </button>
            <button onClick={() => setMode('picking')} className="font-label text-xs px-3.5 py-1.5 rounded-full bg-surface-container text-on-surface">
              {t('home.fit.notQuite')}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="font-body text-sm text-on-surface mb-3">{t('home.fit.pickPrompt')}</p>
          <div className="flex gap-2">
            {FIT_DOSHAS.map((d) => (
              <button
                key={d}
                onClick={() => adjust(d)}
                className="flex-1 font-label text-xs py-2 rounded-full border"
                style={{ borderColor: `${DOSHA_HEX[d]}55`, color: DOSHA_INK[d], background: `${DOSHA_HEX[d]}12` }}
              >
                {doshaDisplayName(d)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
