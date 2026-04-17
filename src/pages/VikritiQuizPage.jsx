import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  VikritiQuizPage — the 5-question, 60-second "how are you THIS week?" check.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Prakriti (the long quiz at /quiz) captures the user's constitutional
 *  baseline ONCE. Vikriti captures their *current* imbalance — it shifts with
 *  seasons, diet, stress, sleep. We re-ask this short version on a cadence
 *  (useVikritiSchedule) so the app can personalize based on the current state
 *  rather than a stale baseline from months ago.
 *
 *  Writes:
 *    • dosha_assessments  (assessment_type='vikriti', quiz_version='v1-short')
 *  Does NOT touch:
 *    • profiles.dosha     (that's the prakriti cache — never overwritten here)
 */

// ─── 5 short questions, framed around "this week" / "lately" ────────────────
// Each option carries a vata/pitta/kapha weight. Same scoring as prakriti
// (1 point per answer) so results are directly comparable.

const VIKRITI_QUESTIONS = [
  {
    question: 'Your body has felt...',
    subtitle: 'Think about the past few days.',
    icon: 'accessibility_new',
    options: [
      { label: 'Dry, cold, or achy',       desc: 'Stiff joints, dry skin, feeling the cold more than usual',   dosha: 'vata',  icon: 'ac_unit' },
      { label: 'Warm or inflamed',         desc: 'Running hot, irritation, maybe some skin sensitivity',       dosha: 'pitta', icon: 'local_fire_department' },
      { label: 'Heavy, sluggish, congested', desc: 'Slower movement, puffiness, thicker sinuses',              dosha: 'kapha', icon: 'weight' },
    ],
  },
  {
    question: 'Your mind has been...',
    subtitle: 'How has your head felt in the last few days?',
    icon: 'psychology',
    options: [
      { label: 'Racing or anxious',   desc: 'Many thoughts, hard to settle, overthinking',                  dosha: 'vata',  icon: 'cloud' },
      { label: 'Sharp but irritable', desc: 'Focused, productive — but short fuse',                         dosha: 'pitta', icon: 'flash_on' },
      { label: 'Dull or foggy',       desc: 'Slow-starting, low motivation, a little checked-out',          dosha: 'kapha', icon: 'do_not_disturb' },
    ],
  },
  {
    question: 'Your sleep this week has been...',
    subtitle: 'Quality, not quantity.',
    icon: 'bedtime',
    options: [
      { label: 'Restless & broken',       desc: 'Trouble falling or staying asleep',                    dosha: 'vata',  icon: 'visibility' },
      { label: 'Short & intense',         desc: 'Falling asleep late, waking early, feeling wired',      dosha: 'pitta', icon: 'schedule' },
      { label: 'Heavy & hard to leave',   desc: 'Sleeping long and still feeling groggy',                dosha: 'kapha', icon: 'snooze' },
    ],
  },
  {
    question: 'Your energy pattern has been...',
    subtitle: 'How does your day actually feel?',
    icon: 'bolt',
    options: [
      { label: 'Spiky — peaks and crashes', desc: 'Quick bursts followed by sudden fatigue',  dosha: 'vata',  icon: 'show_chart' },
      { label: 'Hot-burning',               desc: 'Strong drive all day, risking burnout',     dosha: 'pitta', icon: 'trending_up' },
      { label: 'Low and slow',              desc: 'Hard to get going, prefers to stay still',  dosha: 'kapha', icon: 'horizontal_rule' },
    ],
  },
  {
    question: 'Your appetite lately has been...',
    subtitle: 'Digestion is the dashboard of dosha balance.',
    icon: 'restaurant',
    options: [
      { label: 'Unpredictable or low', desc: 'Forgetting meals, bloating, gas',               dosha: 'vata',  icon: 'shuffle' },
      { label: 'Very strong & urgent', desc: '"Hangry" if meals are late, strong cravings',    dosha: 'pitta', icon: 'alarm' },
      { label: 'Heavy or dull',        desc: 'Rarely hungry, feels weighed down after meals',  dosha: 'kapha', icon: 'timelapse' },
    ],
  },
]

const DOSHA_META = {
  vata:  { name: 'Vata',  hex: '#7b93a8', bg: 'bg-[#e8f0f6]', text: 'text-[#3d5a73]', icon: 'wind_power',         element: 'Air + Ether'  },
  pitta: { name: 'Pitta', hex: '#c47a3a', bg: 'bg-[#fef3e2]', text: 'text-[#8b5a2b]', icon: 'local_fire_department', element: 'Fire + Water' },
  kapha: { name: 'Kapha', hex: '#6b8f5e', bg: 'bg-[#edf5e8]', text: 'text-[#3d5e34]', icon: 'landscape',          element: 'Earth + Water' },
}

function calculateVikriti(answers) {
  const scores = { vata: 0, pitta: 0, kapha: 0 }
  Object.values(answers).forEach(dosha => { scores[dosha] += 1 })

  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1
  const percentages = {
    vata:  Math.round((scores.vata  / total) * 100),
    pitta: Math.round((scores.pitta / total) * 100),
    kapha: Math.round((scores.kapha / total) * 100),
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return {
    scores,
    percentages,
    primary:   sorted[0][0],
    secondary: sorted[1][0],
    tertiary:  sorted[2][0],
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function VikritiQuizPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [phase, setPhase] = useState('intro') // intro | quiz | result
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selectedOption, setSelectedOption] = useState(null)
  const [animating, setAnimating] = useState(false)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)

  const question = VIKRITI_QUESTIONS[currentQ]
  const total = VIKRITI_QUESTIONS.length
  const progress = (currentQ / total) * 100

  const prakritiPrimary = profile?.dosha_details?.primary || null

  const handleSelect = useCallback((dosha) => {
    if (animating) return
    setSelectedOption(dosha)
    setAnimating(true)
    const nextAnswers = { ...answers, [currentQ]: dosha }
    setAnswers(nextAnswers)

    setTimeout(() => {
      if (currentQ < total - 1) {
        setCurrentQ(q => q + 1)
        setSelectedOption(null)
        setAnimating(false)
      } else {
        setResult(calculateVikriti(nextAnswers))
        setPhase('result')
        setAnimating(false)
      }
    }, 400)
  }, [animating, answers, currentQ, total])

  const handleBack = useCallback(() => {
    if (animating) return
    if (currentQ > 0) { setCurrentQ(q => q - 1); setSelectedOption(null) }
    else navigate(-1)
  }, [animating, currentQ, navigate])

  async function saveVikriti() {
    if (!user || !result) return
    setSaving(true)
    const { error } = await supabase.from('dosha_assessments').insert({
      user_id:         user.id,
      assessment_type: 'vikriti',
      primary_dosha:   result.primary,
      secondary_dosha: result.secondary,
      vata_score:      result.scores.vata,
      pitta_score:     result.scores.pitta,
      kapha_score:     result.scores.kapha,
      quiz_version:    'v1-short',
      raw_details: {
        percentages: result.percentages,
        primary:     result.primary,
        secondary:   result.secondary,
        tertiary:    result.tertiary,
        prakriti_primary_at_time: prakritiPrimary,
      },
    })
    if (error) {
      console.error('Failed to save vikriti:', error.message)
      alert('Failed to save: ' + error.message)
      setSaving(false)
      return
    }
    navigate('/home', { replace: true })
    setSaving(false)
  }

  // ── Intro ────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body flex flex-col">
        <div className="flex items-center justify-between px-6 py-5">
          <button onClick={() => navigate(-1)} className="text-on-surface-variant">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <span className="font-headline italic text-primary text-base">The Sanctuary</span>
          <div className="w-6" />
        </div>

        <div className="flex-1 flex flex-col px-6 pb-12">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative w-28 h-28 mb-8">
              <div className="absolute inset-0 rounded-full bg-primary-container animate-quiz-pulse" />
              <div className="absolute inset-3 rounded-full bg-primary/15 animate-quiz-pulse-delay" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl">waving_hand</span>
              </div>
            </div>

            <p className="font-label text-xs text-primary uppercase tracking-widest mb-3">Weekly Check-in</p>
            <h1 className="font-headline text-3xl text-on-surface leading-tight mb-4">
              How have you<br /><span className="italic font-normal text-primary">been lately?</span>
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs mb-2">
              Vikriti is your current state — how your doshas have shifted this week.
              {prakritiPrimary && <> Your baseline is <b className="capitalize text-primary">{prakritiPrimary}</b>.</>}
            </p>
            <p className="text-on-surface-variant/60 text-xs leading-relaxed max-w-xs">
              5 questions · 60 seconds.
            </p>
          </div>

          <button
            onClick={() => setPhase('quiz')}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all"
          >
            Begin Check-in
          </button>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-center text-xs text-on-surface-variant/50 font-label uppercase tracking-widest"
          >
            Not now
          </button>
        </div>
      </div>
    )
  }

  // ── Result ───────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const currentMeta = DOSHA_META[result.primary]
    const baselineMeta = prakritiPrimary ? DOSHA_META[prakritiPrimary] : null
    const shifted = prakritiPrimary && prakritiPrimary !== result.primary

    return (
      <div className="min-h-screen bg-background text-on-surface font-body">
        <div className="flex items-center justify-between px-6 py-5">
          <button onClick={() => navigate(-1)} className="text-on-surface-variant">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
          <span className="font-headline italic text-primary text-base">The Sanctuary</span>
          <div className="w-6" />
        </div>

        <div className="px-6 pb-10">
          <p className="font-label text-xs text-primary uppercase tracking-widest mb-2">This Week</p>
          <h1 className="font-headline text-3xl text-on-surface leading-tight mb-6">
            Your current state
          </h1>

          {/* Composition bars */}
          <div className="bg-surface-container rounded-lg p-5 mb-5">
            {['vata', 'pitta', 'kapha'].map(key => {
              const m = DOSHA_META[key]
              const pct = result.percentages[key]
              return (
                <div key={key} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" style={{ color: m.hex }}>{m.icon}</span>
                      <span className="font-body font-semibold text-sm">{m.name}</span>
                    </div>
                    <span className="font-headline text-lg">{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: m.hex }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Delta narrative */}
          <div className={`${currentMeta.bg} rounded-lg p-5 mb-5`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined ${currentMeta.text} text-lg`}>{currentMeta.icon}</span>
              <p className="font-label text-[10px] uppercase tracking-widest" style={{ color: currentMeta.hex }}>
                Currently trending {currentMeta.name}
              </p>
            </div>
            <p className="font-body text-sm text-on-surface leading-relaxed">
              {shifted ? (
                <>Your baseline is <b className="capitalize">{baselineMeta.name}</b>, but this week {currentMeta.name} is elevated. Consider practices that pacify {currentMeta.name}.</>
              ) : prakritiPrimary ? (
                <>You're in rhythm with your <b className="capitalize">{baselineMeta.name}</b> baseline. Keep doing what's working.</>
              ) : (
                <>Your {currentMeta.name} is currently dominant.</>
              )}
            </p>
          </div>

          <button
            onClick={saveVikriti}
            disabled={saving}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all disabled:opacity-50 mb-3"
          >
            {saving ? 'Saving...' : 'Save Check-in'}
          </button>
          <button
            onClick={() => { setPhase('intro'); setCurrentQ(0); setAnswers({}); setResult(null); setSelectedOption(null) }}
            className="w-full py-3 text-center text-xs text-on-surface-variant/50 font-label uppercase tracking-widest"
          >
            Retake
          </button>
        </div>
      </div>
    )
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-on-surface font-body flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={handleBack} className="text-on-surface-variant">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
          Weekly Check-in
        </span>
        <span className="font-label text-xs text-on-surface-variant/50">{currentQ + 1}/{total}</span>
      </div>

      <div className="px-6 mb-1">
        <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div key={currentQ} className="flex-1 flex flex-col px-6 pt-3 pb-5 animate-quiz-enter">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">{question.icon}</span>
          </div>
          <p className="font-body text-[11px] text-on-surface-variant/60 italic flex-1">{question.subtitle}</p>
        </div>

        <h2 className="font-headline text-xl text-on-surface leading-snug mb-4">{question.question}</h2>

        <div className="flex flex-col gap-2.5 mt-auto">
          {question.options.map((option, i) => {
            const isSelected = selectedOption === option.dosha
            return (
              <button
                key={i}
                onClick={() => handleSelect(option.dosha)}
                disabled={animating}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-left transition-all duration-300 ${
                  isSelected ? 'bg-primary text-on-primary scale-[0.98]'
                  : animating ? 'bg-surface-container-low opacity-40 scale-[0.97]'
                  : 'bg-surface-container active:scale-[0.98]'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected ? 'bg-on-primary/15' : 'bg-surface-container-high'
                }`}>
                  <span className={`material-symbols-outlined text-base ${isSelected ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                    {option.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-body font-semibold text-sm leading-tight ${isSelected ? 'text-on-primary' : 'text-on-surface'}`}>
                    {option.label}
                  </p>
                  <p className={`font-label text-[10px] mt-0.5 leading-snug ${isSelected ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                    {option.desc}
                  </p>
                </div>
                {isSelected && (
                  <span className="material-symbols-outlined text-on-primary text-base flex-shrink-0">check_circle</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
