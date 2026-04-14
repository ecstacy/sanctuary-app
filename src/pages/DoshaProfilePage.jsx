import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

// ─── Dosha Data ─────────────────────────────────────────────────────────────

const DOSHA_DATA = {
  vata: {
    name: 'Vata',
    element: 'Air + Ether',
    emoji: 'wind_power',
    gradient: 'from-[#7b93a8] to-[#b8d4e8]',
    bgColor: 'bg-[#e8f0f6]',
    textColor: 'text-[#3d5a73]',
    barColor: 'bg-[#7b93a8]',
    accentHex: '#3d5a73',
    tagline: 'The Creative Whirlwind',
    description: 'You are movement itself — quick-thinking, imaginative, and beautifully spontaneous. Like the wind, you bring change and inspiration wherever you go.',
    strengths: ['Creative & artistic', 'Quick learner', 'Adaptable & flexible', 'Enthusiastic spirit'],
    balanceTips: ['Ground yourself with warm, cooked foods', 'Establish a calming daily routine', 'Prioritise warmth and rest', 'Practice slow, grounding yoga'],
    qualities: ['Light', 'Dry', 'Cold', 'Mobile', 'Subtle'],
    season: 'Autumn & Early Winter',
    timeOfDay: '2 AM – 6 AM & 2 PM – 6 PM',
    taste: 'Sweet, Sour & Salty foods pacify Vata',
    yoga: 'Slow, grounding flows — Tadasana, Warrior I & II, Child\'s Pose, Savasana',
    meditation: 'Body scan & grounding visualisations to anchor the restless mind',
  },
  pitta: {
    name: 'Pitta',
    element: 'Fire + Water',
    emoji: 'local_fire_department',
    gradient: 'from-[#c47a3a] to-[#f0c987]',
    bgColor: 'bg-[#fef3e2]',
    textColor: 'text-[#8b5a2b]',
    barColor: 'bg-[#c47a3a]',
    accentHex: '#8b5a2b',
    tagline: 'The Fierce Transformer',
    description: 'You are fire incarnate — sharp, determined, and brilliantly focused. Your intensity transforms everything it touches.',
    strengths: ['Natural leader', 'Sharp intellect', 'Courageous & bold', 'Strong digestion'],
    balanceTips: ['Cool down with fresh, sweet foods', 'Avoid overworking — rest is not weakness', 'Spend time near water', 'Practice cooling breathwork'],
    qualities: ['Hot', 'Sharp', 'Light', 'Oily', 'Liquid'],
    season: 'Summer & Late Spring',
    timeOfDay: '10 AM – 2 PM & 10 PM – 2 AM',
    taste: 'Sweet, Bitter & Astringent foods pacify Pitta',
    yoga: 'Cooling, non-competitive flows — Moon Salutation, Forward Folds, Twists, Pigeon Pose',
    meditation: 'Loving-kindness & cooling breath (Sheetali) to calm the inner fire',
  },
  kapha: {
    name: 'Kapha',
    element: 'Earth + Water',
    emoji: 'landscape',
    gradient: 'from-[#6b8f5e] to-[#b8d4a8]',
    bgColor: 'bg-[#edf5e8]',
    textColor: 'text-[#3d5e34]',
    barColor: 'bg-[#6b8f5e]',
    accentHex: '#3d5e34',
    tagline: 'The Steady Mountain',
    description: 'You are earth embodied — steady, nurturing, and deeply resilient. Your calm presence is a sanctuary for everyone around you.',
    strengths: ['Loyal & compassionate', 'Incredible endurance', 'Strong memory', 'Natural caretaker'],
    balanceTips: ['Embrace variety and stimulation', 'Move daily — even gentle walks count', 'Favour warm, spiced foods', 'Wake early and resist oversleeping'],
    qualities: ['Heavy', 'Slow', 'Cool', 'Oily', 'Smooth'],
    season: 'Late Winter & Spring',
    timeOfDay: '6 AM – 10 AM & 6 PM – 10 PM',
    taste: 'Pungent, Bitter & Astringent foods pacify Kapha',
    yoga: 'Vigorous, energising flows — Sun Salutation, Backbends, Warrior III, Camel Pose',
    meditation: 'Energising breathwork (Kapalabhati) & walking meditation to spark vitality',
  },
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function DoshaProfilePage() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const doshaLabel = profile?.dosha || null
  const details = profile?.dosha_details || null

  // Parse dosha info from profile
  const primary = details?.primary || doshaLabel?.toLowerCase() || null
  const secondary = details?.secondary || null
  const tertiary = details?.tertiary || null
  const percentages = details?.percentages || null

  // If no dosha saved, show discovery prompt
  if (!doshaLabel || !primary) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body flex flex-col items-center justify-center px-6 pb-28">
        <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-8 stagger-1">
          <span className="material-symbols-outlined text-primary text-4xl">spa</span>
        </div>
        <h2 className="font-headline text-2xl text-on-surface text-center mb-3 stagger-2">
          Your Dosha Awaits
        </h2>
        <p className="font-body text-sm text-on-surface-variant text-center leading-relaxed mb-8 max-w-xs stagger-3">
          Discover your unique Ayurvedic constitution through our guided quiz and unlock personalised wellness insights.
        </p>
        <button
          onClick={() => navigate('/quiz')}
          className="w-full max-w-xs py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all stagger-4"
        >
          Take the Dosha Quiz
        </button>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-xs text-on-surface-variant/50 font-label uppercase tracking-widest stagger-5"
        >
          Go back
        </button>
        <BottomNav />
      </div>
    )
  }

  const primaryData = DOSHA_DATA[primary]
  const secondaryData = secondary ? DOSHA_DATA[secondary] : null
  const tertiaryData = tertiary ? DOSHA_DATA[tertiary] : null
  const isTridoshic = doshaLabel === 'Tridoshic'
  const isDual = doshaLabel.includes('-')

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-28">

      {/* Gradient Hero */}
      <div className={`relative bg-gradient-to-b ${primaryData.gradient} px-6 pt-12 pb-16 overflow-hidden`}>

        {/* Decorative elements */}
        <div className="absolute top-10 right-6 w-28 h-28 rounded-full bg-white/8 animate-quiz-float" />
        <div className="absolute bottom-16 left-4 w-16 h-16 rounded-full bg-white/8 animate-quiz-float-delay" />
        <div className="absolute top-1/2 right-1/3 w-10 h-10 rounded-full bg-white/5 animate-quiz-float" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-5 z-20 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-white text-lg">arrow_back</span>
        </button>

        <div className="relative z-10 text-center mt-4 stagger-1">
          <p className="font-label text-[10px] text-white/60 uppercase tracking-widest mb-2">
            Your Prakriti
          </p>
          <h1 className="font-headline text-5xl text-white leading-none mb-2">
            {doshaLabel}
          </h1>
          <p className="font-headline italic text-lg text-white/80 mb-5">
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

      <div className="px-6 -mt-8">

        {/* Dosha Composition Card */}
        {percentages && (
          <div className="bg-surface rounded-lg p-6 shadow-md mb-5 stagger-2">
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-5">
              Your Dosha Composition
            </p>

            {[
              { key: primary, data: primaryData, pct: percentages[primary] },
              ...(secondaryData ? [{ key: secondary, data: secondaryData, pct: percentages[secondary] }] : []),
              ...(tertiaryData ? [{ key: tertiary, data: tertiaryData, pct: percentages[tertiary] }] : []),
            ].map(({ key, data, pct }, i) => (
              <div key={key} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ color: data.accentHex }}>
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
                    className={`h-full rounded-full ${data.barColor} transition-all duration-1000 ease-out`}
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
                : (() => {
                    const pPct = percentages?.[primary] || 0
                    const sPct = percentages?.[secondary] || 0
                    const gap = pPct - sPct
                    if (gap >= 40) return `${capitalize(primary)} is overwhelmingly dominant in your constitution. The other doshas play a minor supporting role.`
                    if (gap >= 20) return `${capitalize(primary)} is clearly your leading dosha. ${capitalize(secondary)} (${sPct}%) plays a moderate background role.`
                    return `${capitalize(primary)} leads your constitution, with ${capitalize(secondary)} (${sPct}%) as a notable secondary influence.`
                  })()
              }
            </p>
          </div>
        )}

        {/* Primary Dosha Deep Dive */}
        <div className={`${primaryData.bgColor} rounded-lg p-6 mb-5 stagger-3`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>{primaryData.emoji}</span>
            <p className="font-label text-[10px] uppercase tracking-widest" style={{ color: primaryData.accentHex }}>
              {isTridoshic ? 'Your Balanced Nature' : `Dominant: ${primaryData.name}`}
            </p>
          </div>
          <p className="font-body text-sm text-on-surface leading-relaxed">
            {primaryData.description}
          </p>
        </div>

        {/* Secondary Dosha */}
        {secondaryData && !isTridoshic && (
          <div className="bg-surface-container rounded-lg p-6 mb-5 stagger-4">
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
        )}

        {/* Qualities */}
        <div className="bg-surface-container rounded-lg p-6 mb-5 stagger-4">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
            {primaryData.name} Qualities (Gunas)
          </p>
          <div className="flex flex-wrap gap-2">
            {primaryData.qualities.map((q, i) => (
              <span
                key={i}
                className={`${primaryData.bgColor} ${primaryData.textColor} px-3 py-1.5 rounded-full font-label text-xs font-medium`}
              >
                {q}
              </span>
            ))}
          </div>
        </div>

        {/* Natural Strengths */}
        <div className="bg-surface-container rounded-lg p-6 mb-5 stagger-5">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
            Your Natural Strengths
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ...primaryData.strengths,
              ...(secondaryData && isDual ? secondaryData.strengths.slice(0, 2) : []),
            ].map((strength, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                <span className="font-body text-xs text-on-surface">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stay In Balance */}
        <div className="bg-surface-container-low rounded-lg p-6 mb-5 stagger-5">
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

        {/* Ayurvedic Lifestyle — Season, Time, Taste */}
        <div className="bg-surface-container rounded-lg overflow-hidden mb-5 stagger-6">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest px-6 pt-6 pb-4">
            Ayurvedic Lifestyle Guide
          </p>

          <div className="flex items-start gap-4 px-6 py-4 border-t border-surface-container-high">
            <div className={`w-10 h-10 rounded-full ${primaryData.bgColor} flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>calendar_month</span>
            </div>
            <div>
              <p className="font-body font-semibold text-sm text-on-surface mb-0.5">Peak Season</p>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                {primaryData.season} — {primaryData.name} is naturally elevated during this time. Extra care is needed to stay balanced.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 px-6 py-4 border-t border-surface-container-high">
            <div className={`w-10 h-10 rounded-full ${primaryData.bgColor} flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>schedule</span>
            </div>
            <div>
              <p className="font-body font-semibold text-sm text-on-surface mb-0.5">{primaryData.name} Hours</p>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                {primaryData.timeOfDay} — These are the hours when {primaryData.name} energy peaks in the body.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 px-6 py-4 border-t border-surface-container-high">
            <div className={`w-10 h-10 rounded-full ${primaryData.bgColor} flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>restaurant</span>
            </div>
            <div>
              <p className="font-body font-semibold text-sm text-on-surface mb-0.5">Balancing Tastes</p>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                {primaryData.taste}
              </p>
            </div>
          </div>
        </div>

        {/* Yoga & Movement */}
        <div className={`${primaryData.bgColor} rounded-lg p-6 mb-5 stagger-6`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>self_care</span>
            <p className="font-label text-[10px] uppercase tracking-widest" style={{ color: primaryData.accentHex }}>
              Yoga & Movement
            </p>
          </div>
          <p className="font-body text-sm text-on-surface leading-relaxed">
            {primaryData.yoga}
          </p>
        </div>

        {/* Meditation & Breathwork */}
        <div className="bg-surface-container rounded-lg p-6 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-lg">air</span>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
              Meditation & Breathwork
            </p>
          </div>
          <p className="font-body text-sm text-on-surface leading-relaxed">
            {primaryData.meditation}
          </p>
        </div>

        {/* About Prakriti */}
        <div className="bg-surface-container-low rounded-lg p-5 mb-5 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-base mt-0.5">auto_awesome</span>
          <div>
            <p className="font-body font-semibold text-sm text-on-surface mb-1">
              Understanding Prakriti
            </p>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              In Ayurveda, your Prakriti is your birth constitution — the unique ratio of Vata, Pitta, and Kapha you were born with. It remains stable throughout life. When doshas shift due to diet, stress, or seasons, that temporary state is called Vikriti. The goal of Ayurveda is to bring Vikriti back in alignment with Prakriti.
            </p>
          </div>
        </div>

        {/* Retake quiz */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/quiz')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-container rounded-full font-label text-xs text-on-surface-variant uppercase tracking-widest active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Retake the Quiz
          </button>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}
