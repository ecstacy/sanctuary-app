import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { ASANAS, getDoshaTag } from '../data/asanas'
import PoseFigure from '../components/PoseFigure'
import useScrollDepth from '../hooks/useScrollDepth'
import { track, EVENTS } from '../lib/track'

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

// ── Body-part → icon map for the Areas sheet ──
const BODY_PART_ICONS = {
  'Spine': 'airline_seat_recline_extra',
  'Legs': 'directions_walk',
  'Core': 'fitness_center',
  'Hips': 'accessibility_new',
  'Shoulders': 'accessibility',
  'Arms': 'sports_martial_arts',
  'Ankles': 'footprint',
  'Hamstrings': 'directions_run',
  'Calves': 'directions_run',
  'Lower Back': 'airline_seat_recline_normal',
  'Chest': 'favorite',
  'Glutes': 'airline_seat_legroom_extra',
  'Thighs': 'directions_walk',
  'Psoas': 'accessibility_new',
  'Knees': 'accessible',
  'Obliques': 'rotate_right',
  'Full Body': 'self_care',
  'Nervous System': 'neurology',
  'Neck': 'face',
}
function iconForBodyPart(part) { return BODY_PART_ICONS[part] || 'radio_button_unchecked' }

// ── Level presets for the modals ──
const LEVELS = [
  { name: 'Beginner', range: '20–45s', mid: 32 },
  { name: 'Intermediate', range: '45–75s', mid: 60 },
  { name: 'Advanced', range: '75–120s', mid: 100 },
]

// Scale positioning for the Hold modal (0–120s mapped to 0–100%)
function holdScalePct(seconds) {
  const clamped = Math.max(10, Math.min(120, seconds))
  return ((clamped - 10) / (120 - 10)) * 100
}

// ── Bottom-sheet modal ──
function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="animate-page-enter"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 70 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px]" />

      {/* Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute left-0 right-0 bottom-0 bg-surface rounded-t-3xl shadow-2xl animate-quiz-slide-up"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* Grabber */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-on-surface-variant/25" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-2 pb-3">
          <h3 className="font-headline text-lg text-on-surface">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-sm">close</span>
          </button>
        </div>
        <div className="px-6 pb-2">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
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
  useScrollDepth('asana_detail')

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

  const [sticky, setSticky] = useState(false)
  const [sheet, setSheet] = useState(null) // 'hold' | 'level' | 'areas' | null
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
    <div className="min-h-screen bg-background text-on-surface font-body pb-28">

      {/* ── Sticky mini player — always portaled, animates in on scroll ── */}
      {createPortal(
        <div
          className="bg-background/95 backdrop-blur-sm border-b border-outline-variant/10 px-4 py-2 flex items-center gap-3"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 40,
            paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
            transform: sticky ? 'translateY(0)' : 'translateY(-100%)',
            opacity: sticky ? 1 : 0,
            pointerEvents: sticky ? 'auto' : 'none',
            transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease-out',
            willChange: 'transform, opacity',
          }}
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex-shrink-0 active:scale-90 transition-all rounded-xl overflow-hidden"
            aria-label="Scroll to top"
          >
            <PoseFigure poseKey={asana.poseKey} size={44} breathing={false} objectPosition="top" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm font-semibold text-on-surface truncate">{asana.sanskrit}</p>
            <p className="font-body text-xs text-on-surface-variant truncate">{asana.english}</p>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0"
            aria-label="Scroll to top"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-sm">expand_less</span>
          </button>
        </div>,
        document.body
      )}

      {/* ── Hero Section ── */}
      <div ref={heroRef} className="relative bg-primary-container/20 pb-6">
        {/* Back button */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-surface/80 flex items-center justify-center active:scale-90 transition-all" aria-label="Go back">
            <span className="material-symbols-outlined text-on-surface text-lg">arrow_back</span>
          </button>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-surface-container-high rounded-full font-label text-[10px] text-on-surface-variant uppercase tracking-widest shadow-sm border border-outline-variant/20">
              {CATEGORY_LABELS[asana.category] || asana.category}
            </span>
            <span className="px-3 py-1 bg-primary text-on-primary rounded-full font-label text-[10px] uppercase tracking-widest shadow-sm">
              {asana.level}
            </span>
          </div>
        </div>

        {/* Pose figure — tap to expand, with option to play video */}
        <div className="w-full flex justify-center py-6">
          <PoseFigure poseKey={asana.poseKey} size="lg" breathing expandable />
        </div>

        {/* Name */}
        <div className="px-6 text-center">
          <p className="font-label text-[10px] text-primary uppercase tracking-widest mb-1">{asana.category}</p>
          <h1 className="font-headline text-3xl text-on-surface mb-1">{asana.sanskrit}</h1>
          {/* Devanagari + IAST — only render when the schema-rich fields
              are present. Subtle styling so the romanized title still reads
              as the primary heading. */}
          {(asana.devanagari || asana.iast) && (
            <p className="font-body text-[13px] text-on-surface-variant/70 mb-1" lang="sa">
              {asana.devanagari}
              {asana.devanagari && asana.iast && <span className="mx-1.5 text-on-surface-variant/40">·</span>}
              {asana.iast && <span className="italic">{asana.iast}</span>}
            </p>
          )}
          <p className="font-body text-sm text-on-surface-variant">{asana.english}</p>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-5 mt-5">

        {/* ── Quick Info Bar — each tile opens a bottom sheet with context ── */}
        <div className="flex gap-3">
          <button
            onClick={() => setSheet('hold')}
            className="flex-1 bg-surface-container-low rounded-xl p-3 text-center active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-primary text-lg mb-1 block">timer</span>
            <p className="font-headline text-lg text-on-surface">{asana.durationSeconds >= 60 ? `${Math.ceil(asana.durationSeconds / 60)}m` : `${asana.durationSeconds}s`}</p>
            <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Hold</p>
          </button>
          <button
            onClick={() => setSheet('level')}
            className="flex-1 bg-surface-container-low rounded-xl p-3 text-center active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-primary text-lg mb-1 block">fitness_center</span>
            <p className="font-headline text-lg text-on-surface">{asana.level}</p>
            <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Level</p>
          </button>
          <button
            onClick={() => setSheet('areas')}
            className="flex-1 bg-surface-container-low rounded-xl p-3 text-center active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-primary text-lg mb-1 block">body_system</span>
            <p className="font-headline text-lg text-on-surface">{asana.bodyParts.length}</p>
            <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Areas</p>
          </button>
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
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">body_system</span>
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

        {/* ── Modifications — only renders for new-schema entries ── */}
        {asana.modifications && asana.modifications.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">tune</span>
              <h3 className="font-headline text-lg text-on-surface">Modifications</h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {asana.modifications.map((mod, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/60 text-sm mt-0.5">circle</span>
                  <p className="font-body text-sm text-on-surface-variant">{mod}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Contraindications — safety surface, prominent styling ── */}
        {asana.contraindications && asana.contraindications.length > 0 && (
          <div className="bg-error-container/30 border border-error/20 rounded-xl p-5" role="region" aria-label="Safety considerations">
            <div className="flex items-center gap-2 mb-3">
              <span aria-hidden="true" className="material-symbols-outlined text-error text-lg">health_and_safety</span>
              <h3 className="font-headline text-lg text-on-surface">Important Safety Considerations</h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {asana.contraindications.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="material-symbols-outlined text-error/80 text-sm mt-0.5">warning</span>
                  <p className="font-body text-sm text-on-surface-variant">{item}</p>
                </div>
              ))}
            </div>
            <p className="font-body text-[11px] text-on-surface-variant/60 italic mt-3 pt-3 border-t border-error/15">
              Consult a teacher or healthcare provider if any of the above apply to you.
            </p>
          </div>
        )}

        {/* ── Source citation — "HYP 1.32" pill, only when source.text is set ── */}
        {asana.source && (
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg">
            <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/60 text-base">menu_book</span>
            <p className="font-body text-xs text-on-surface-variant">
              <span className="font-semibold">
                {asana.source.text === 'HYP'    ? 'Hatha Yoga Pradipika'
                 : asana.source.text === 'GS'   ? 'Gheranda Samhita'
                 : 'Modern hatha tradition'}
              </span>
              {asana.source.verse && <span> · verse {asana.source.verse}</span>}
              {asana.source.note && <span className="block mt-1 text-[11px] text-on-surface-variant/70 italic">{asana.source.note}</span>}
            </p>
          </div>
        )}

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

      </div>

      {/* ── Hold Sheet ── */}
      <BottomSheet open={sheet === 'hold'} onClose={() => setSheet(null)} title="Hold Duration">
        <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-5">
          This pose is held for <span className="text-on-surface font-semibold">{asana.durationSeconds}s</span>. Here's where that sits on the beginner-to-expert scale.
        </p>

        <div className="relative mb-3 pt-8">
          {/* Marker */}
          <div
            className="absolute top-0 flex flex-col items-center -translate-x-1/2"
            style={{ left: `${holdScalePct(asana.durationSeconds)}%` }}
          >
            <span className="font-label text-[10px] text-primary font-semibold mb-1">{asana.durationSeconds}s</span>
            <span className="material-symbols-outlined text-primary text-base -mb-1">arrow_drop_down</span>
          </div>
          {/* Track */}
          <div className="h-2 rounded-full bg-gradient-to-r from-primary-container via-primary/50 to-primary" />
        </div>

        <div className="flex justify-between font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-5">
          <span>Beginner</span>
          <span>Intermediate</span>
          <span>Expert</span>
        </div>

        <div className="bg-surface-container-low rounded-xl p-4">
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">
            Longer holds build deeper stillness and strength — but only when the shorter ones feel natural. Don't rush the scale.
          </p>
        </div>
      </BottomSheet>

      {/* ── Level Sheet ── */}
      <BottomSheet open={sheet === 'level'} onClose={() => setSheet(null)} title="Practice Level">
        <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-4">
          This pose is rated <span className="text-on-surface font-semibold">{asana.level}</span>. Hold times grow as you progress.
        </p>
        <div className="flex flex-col gap-2.5 mb-2">
          {LEVELS.map((lvl) => {
            // New schema uses lowercase ('beginner'); legacy uses 'Beginner'.
            // Normalize both sides for the comparison so the highlight works
            // for entries from either era.
            const isCurrent = lvl.name.toLowerCase() === String(asana.level || '').toLowerCase()
            return (
              <div
                key={lvl.name}
                className={`flex items-center gap-3 p-3 rounded-xl ${isCurrent ? 'bg-primary-container/30 ring-1 ring-primary/20' : 'bg-surface-container-low'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrent ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-base">
                    {lvl.name === 'Beginner' ? 'eco' : lvl.name === 'Intermediate' ? 'trending_up' : 'military_tech'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-body text-sm font-semibold text-on-surface">{lvl.name}</p>
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-primary/10 rounded-full font-label text-[8px] text-primary uppercase tracking-widest">This Pose</span>
                    )}
                  </div>
                  <p className="font-body text-xs text-on-surface-variant mt-0.5">Typical hold · {lvl.range}</p>
                </div>
              </div>
            )
          })}
        </div>
      </BottomSheet>

      {/* ── Areas Sheet ── */}
      <BottomSheet open={sheet === 'areas'} onClose={() => setSheet(null)} title="Areas Worked">
        <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-4">
          This pose engages <span className="text-on-surface font-semibold">{asana.bodyParts.length}</span> areas of your body.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {asana.bodyParts.map((part, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
              <div className="w-10 h-10 rounded-full bg-primary-container/40 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-base">{iconForBodyPart(part)}</span>
              </div>
              <p className="font-body text-sm text-on-surface font-medium">{part}</p>
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* ── Sticky Practice CTA (portaled to bypass PageTransition transform ancestor) ── */}
      {createPortal(
        <div
          className="px-6 pb-2 pt-3 bg-background/80 backdrop-blur-xl border-t border-outline-variant/10"
          style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={() => {
              track(EVENTS.CTA_CLICKED, {
                cta_id:     'asana_detail_practice',
                route_name: 'asana_detail',
                asana_id:   asana.id,
                label:      'Practice',
              })
              navigate(`/practice/asana/${asana.id}`)
            }}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-label text-sm font-semibold tracking-wide active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(78,99,85,0.15)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-lg">play_arrow</span>
            Practice {asana.sanskrit}
          </button>
        </div>,
        document.body
      )}

    </div>
  )
}
