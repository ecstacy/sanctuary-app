import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { ASANAS, getDoshaTag } from '../data/asanas'
import PoseFigure from '../components/PoseFigure'

const DOSHA_INFO = {
  vata: { label: 'Vata', icon: 'air', color: 'text-[#7b93a8]', bg: 'bg-[#7b93a8]/10' },
  pitta: { label: 'Pitta', icon: 'local_fire_department', color: 'text-[#c47a3a]', bg: 'bg-[#c47a3a]/10' },
  kapha: { label: 'Kapha', icon: 'water_drop', color: 'text-[#6b8f5e]', bg: 'bg-[#6b8f5e]/10' },
}

const CATEGORY_LABELS = {
  standing: 'Standing',
  seated: 'Seated',
  supine: 'Supine',
  prone: 'Prone',
  restorative: 'Restorative',
  inversion: 'Inversion',
}

// Precautions per asana — keyed by asana id
const PRECAUTIONS = {
  tadasana: ['Avoid locking your knees — keep a micro-bend', 'If you feel dizzy, widen your stance slightly', 'Those with low blood pressure should be mindful when holding still'],
  warrior1: ['Keep your front knee directly over your ankle, not beyond', 'Avoid this pose if you have a hip or knee injury', 'Those with shoulder issues can keep hands on hips instead of overhead', 'Do not let your back knee cave inward'],
  warrior2: ['Front knee should track over your second toe', 'Avoid if you have severe knee or hip injury', 'Keep your torso centered — do not lean over the front leg', 'Relax your shoulders away from your ears'],
  tree: ['Never place your foot on the knee joint — above or below only', 'Use a wall for support if balance is difficult', 'Avoid if you have ankle or knee injuries', 'Keep your standing leg slightly bent if needed'],
  sukhasana: ['Place a cushion under your hips if your knees are above your hips', 'Avoid if you have a knee injury — try sitting on a chair instead', 'Do not force your knees down', 'Keep your spine tall, not collapsed'],
  seatedTwist: ['Never force the twist — let your breath guide the depth', 'Avoid during pregnancy', 'Those with herniated discs should be cautious', 'Always lengthen the spine before twisting'],
  uttanasana: ['Bend your knees generously if your hamstrings are tight', 'Avoid if you have a lower back injury — try half fold instead', 'Do not bounce to go deeper', 'Rise slowly to avoid dizziness'],
  paschimottanasana: ['Use a strap around your feet if you cannot reach', 'Never pull yourself forcefully into the fold', 'Avoid with acute lower back pain or herniated disc', 'Keep a micro-bend in your knees if hamstrings are very tight'],
  balasana: ['Place a pillow between your thighs and calves if knees are sensitive', 'Avoid if you have a knee injury or are pregnant (use wide-knee variation)', 'If your head does not reach the floor, rest it on stacked fists or a block'],
  supinetwist: ['Keep both shoulders on the floor — the twist comes from the spine', 'Avoid if you have a spinal disc condition', 'Move slowly and never force the knees to the floor', 'Use a pillow between or under your knees for support'],
  savasana: ['Place a bolster under your knees if your lower back is uncomfortable', 'Cover yourself with a blanket — body temperature drops during rest', 'If lying flat is difficult, try a reclined position with props', 'Pregnant practitioners should lie on their left side'],
  cobra: ['Do not straighten your arms fully — keep elbows slightly bent', 'Avoid if you have a wrist injury or carpal tunnel', 'Do not throw your head back — keep your gaze forward', 'Press the tops of your feet into the mat to protect your lower back'],
  bridge: ['Keep your knees hip-width apart — do not let them splay', 'Avoid if you have a neck injury', 'Do not turn your head while in the pose', 'Press evenly through both feet'],
  pigeon: ['Use a block or pillow under your hip if it does not reach the floor', 'Avoid if you have a knee injury — try reclined pigeon instead', 'Never force the stretch — intensity should be manageable', 'Keep your back leg straight and hip points facing forward'],
  suryaNamaskar: ['Warm up your wrists before beginning', 'Modify chaturanga to knees-down if upper body strength is limited', 'Those with back injuries should skip the deep backbend', 'Move with your breath — never rush the sequence'],
  downwardDog: ['Bend your knees if your hamstrings are tight', 'Avoid if you have carpal tunnel or wrist pain', 'Do not let your head hang below your heart if you have high blood pressure', 'Spread your fingers wide to distribute weight evenly'],
  legUpWall: ['Avoid if you have glaucoma or uncontrolled high blood pressure', 'Scoot away from the wall if you feel tingling in your legs', 'Place a folded blanket under your hips for comfort', 'Avoid during menstruation if it causes discomfort'],
}

// Step-by-step instructions derived from voice cues with more detail
function getSteps(asana) {
  return [
    { phase: 'Setup', icon: 'login', text: asana.voiceCues.enter },
    { phase: 'Hold', icon: 'timer', text: asana.voiceCues.hold },
    { phase: 'Breathe', icon: 'airwave', text: asana.voiceCues.breathe },
    { phase: 'Release', icon: 'logout', text: asana.voiceCues.exit },
  ]
}

export default function AsanaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const asana = ASANAS[id]

  if (!asana) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">search_off</span>
          <h2 className="font-headline text-xl text-on-surface mb-2">Asana not found</h2>
          <p className="font-body text-sm text-on-surface-variant mb-6">The pose you're looking for doesn't exist.</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-primary text-on-primary rounded-full font-label text-xs tracking-wide">Go Back</button>
        </div>
      </div>
    )
  }

  const userDosha = profile?.dosha?.toLowerCase()
  const precautions = PRECAUTIONS[asana.id] || []
  const steps = getSteps(asana)

  const [expanded, setExpanded] = useState(false)
  const [sticky, setSticky] = useState(false)
  const heroRef = useRef(null)

  // Track when hero scrolls out of view to show sticky mini player
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setSticky(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-12">

      {/* ── Expanded overlay ── */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-on-surface/90 flex items-center justify-center animate-page-enter"
          onClick={() => setExpanded(false)}
        >
          <button
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface/20 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-white text-lg">close</span>
          </button>
          <div className="w-[85vw] max-w-sm aspect-square flex items-center justify-center">
            <PoseFigure poseKey={asana.poseKey} size="xl" breathing />
          </div>
          <div className="absolute bottom-12 left-0 right-0 text-center">
            <p className="font-headline text-xl text-white">{asana.sanskrit}</p>
            <p className="font-body text-sm text-white/60">{asana.english}</p>
          </div>
        </div>
      )}

      {/* ── Sticky mini player ── */}
      {sticky && !expanded && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-outline-variant/10 px-4 py-2 flex items-center gap-3 animate-page-enter">
          <button onClick={() => setExpanded(true)} className="w-11 h-11 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0 overflow-hidden active:scale-90 transition-all">
            <PoseFigure poseKey={asana.poseKey} size="sm" breathing={false} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm font-semibold text-on-surface truncate">{asana.sanskrit}</p>
            <p className="font-body text-xs text-on-surface-variant truncate">{asana.english}</p>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-sm">expand_less</span>
          </button>
        </div>
      )}

      {/* ── Hero Section ── */}
      <div ref={heroRef} className="relative bg-primary-container/20 pb-6">
        {/* Back button */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-surface/80 flex items-center justify-center active:scale-90 transition-all">
            <span className="material-symbols-outlined text-on-surface text-lg">arrow_back</span>
          </button>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-surface/80 rounded-full font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
              {CATEGORY_LABELS[asana.category] || asana.category}
            </span>
            <span className="px-3 py-1 bg-surface/80 rounded-full font-label text-[10px] text-primary uppercase tracking-widest">
              {asana.level}
            </span>
          </div>
        </div>

        {/* Pose figure — tap to expand */}
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex justify-center py-6 active:scale-95 transition-all outline-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="relative">
            <PoseFigure poseKey={asana.poseKey} size="lg" breathing />
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-surface/80 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-on-surface-variant text-xs">fullscreen</span>
            </div>
          </div>
        </button>

        {/* Name */}
        <div className="px-6 text-center">
          <p className="font-label text-[10px] text-primary uppercase tracking-widest mb-1">{asana.category}</p>
          <h1 className="font-headline text-3xl text-on-surface mb-1">{asana.sanskrit}</h1>
          <p className="font-body text-sm text-on-surface-variant">{asana.english}</p>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-5 mt-5">

        {/* ── Quick Info Bar ── */}
        <div className="flex gap-3">
          <div className="flex-1 bg-surface-container-low rounded-xl p-3 text-center">
            <span className="material-symbols-outlined text-primary text-lg mb-1 block">timer</span>
            <p className="font-headline text-lg text-on-surface">{asana.durationSeconds >= 60 ? `${Math.ceil(asana.durationSeconds / 60)}m` : `${asana.durationSeconds}s`}</p>
            <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Hold</p>
          </div>
          <div className="flex-1 bg-surface-container-low rounded-xl p-3 text-center">
            <span className="material-symbols-outlined text-primary text-lg mb-1 block">fitness_center</span>
            <p className="font-headline text-lg text-on-surface">{asana.level}</p>
            <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Level</p>
          </div>
          <div className="flex-1 bg-surface-container-low rounded-xl p-3 text-center">
            <span className="material-symbols-outlined text-primary text-lg mb-1 block">body_system</span>
            <p className="font-headline text-lg text-on-surface">{asana.bodyParts.length}</p>
            <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Areas</p>
          </div>
        </div>

        {/* ── About / Reasoning ── */}
        <div className="bg-surface-container-low rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-lg">auto_stories</span>
            <h3 className="font-headline text-lg text-on-surface">About this Asana</h3>
          </div>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">{asana.reasoning}</p>
        </div>

        {/* ── How to Perform ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-lg">school</span>
            <h3 className="font-headline text-lg text-on-surface">How to Perform</h3>
          </div>
          <div className="flex flex-col gap-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-primary-container/40 flex items-center justify-center flex-shrink-0">
                    <span className="font-label text-xs text-primary font-semibold">{i + 1}</span>
                  </div>
                  {i < steps.length - 1 && <div className="w-px flex-1 bg-primary/10 mt-1" />}
                </div>
                <div className="pb-4 flex-1">
                  <p className="font-label text-[10px] text-primary uppercase tracking-widest mb-1">{step.phase}</p>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Benefits ── */}
        <div className="bg-primary-container/15 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-lg">favorite</span>
            <h3 className="font-headline text-lg text-on-surface">Benefits</h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {asana.benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                <p className="font-body text-sm text-on-surface-variant">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body Focus ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-lg">body_system</span>
            <h3 className="font-headline text-lg text-on-surface">Body Focus</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {asana.bodyParts.map((part, i) => (
              <span key={i} className="px-3.5 py-2 bg-surface-container-low rounded-full font-label text-xs text-on-surface-variant">
                {part}
              </span>
            ))}
          </div>
        </div>

        {/* ── Dosha Compatibility ── */}
        <div className="bg-surface-container-low rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-lg">spa</span>
            <h3 className="font-headline text-lg text-on-surface">Dosha Compatibility</h3>
          </div>

          <div className="flex flex-col gap-3">
            {Object.entries(asana.doshaAffinity).map(([dosha, affinity]) => {
              const info = DOSHA_INFO[dosha]
              const tag = getDoshaTag(affinity)
              const isUser = userDosha === dosha

              return (
                <div key={dosha} className={`flex items-center gap-3 p-3 rounded-xl ${isUser ? 'bg-primary-container/20 ring-1 ring-primary/15' : ''}`}>
                  <div className={`w-10 h-10 rounded-full ${info.bg} flex items-center justify-center flex-shrink-0`}>
                    <span className={`material-symbols-outlined text-lg ${info.color}`}>{info.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-body text-sm font-semibold text-on-surface">{info.label}</p>
                      {isUser && (
                        <span className="px-2 py-0.5 bg-primary/10 rounded-full font-label text-[8px] text-primary uppercase tracking-widest">Your Dosha</span>
                      )}
                    </div>
                    <p className="font-body text-xs text-on-surface-variant mt-0.5">
                      {affinity === 'balancing' && `This asana is excellent for balancing ${info.label} energy. It helps bring ${info.label} dosha into harmony.`}
                      {affinity === 'neutral' && `This asana has a neutral effect on ${info.label} energy. Safe to practice without significant impact.`}
                      {affinity === 'aggravating' && `This asana may aggravate ${info.label} energy. Practice with caution and shorter holds.`}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-label text-[9px] ${tag.color}`}>{tag.label}</span>
                </div>
              )
            })}
          </div>

          {!userDosha && (
            <button
              onClick={() => navigate('/quiz')}
              className="w-full mt-4 py-3 bg-primary/10 text-primary rounded-full font-label text-xs tracking-wide active:scale-95 transition-all"
            >
              Take the Dosha Quiz for personalized insights
            </button>
          )}
        </div>

        {/* ── Precautions ── */}
        {precautions.length > 0 && (
          <div className="bg-secondary-container/15 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary text-lg">warning</span>
              <h3 className="font-headline text-lg text-on-surface">Things to Take Care Of</h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {precautions.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-sm mt-0.5">priority_high</span>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Practice CTA ── */}
        <div className="pt-2 pb-4">
          <button
            onClick={() => {
              // Find a routine containing this asana, or default to stress
              const routineKey = Object.entries({
                stress: ['sukhasana', 'balasana', 'uttanasana', 'pigeon', 'supinetwist', 'legUpWall', 'savasana'],
                sleep: ['sukhasana', 'paschimottanasana', 'supinetwist', 'legUpWall', 'balasana', 'savasana'],
                energy: ['tadasana', 'suryaNamaskar', 'warrior1', 'warrior2', 'cobra', 'downwardDog', 'tree', 'savasana'],
                flexibility: ['suryaNamaskar', 'downwardDog', 'uttanasana', 'pigeon', 'seatedTwist', 'paschimottanasana', 'bridge', 'supinetwist', 'savasana'],
              }).find(([, ids]) => ids.includes(asana.id))?.[0] || 'stress'
              navigate(`/practice/${routineKey}`)
            }}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-label text-sm font-semibold tracking-wide active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(78,99,85,0.15)]"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            Practice {asana.sanskrit}
          </button>
        </div>

      </div>
    </div>
  )
}
