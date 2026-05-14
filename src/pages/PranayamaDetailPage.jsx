import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { PRANAYAMAS } from '../data/pranayamas'
import { ASANAS } from '../data/asanas'
import useScrollDepth from '../hooks/useScrollDepth'
import { track, EVENTS } from '../lib/track'
import PranayamaPracticeOverlay from '../components/PranayamaPractice'
import PoseFigure, { hasPoseImage } from '../components/PoseFigure'

// ─────────────────────────────────────────────────────────────────────────────
//  PranayamaDetailPage — mirrors AsanaDetailPage but for breath techniques.
//
//  Differences from AsanaDetailPage:
//   • No video / PoseFigure — pranayama is internal; we use the icon
//   • Stats strip shows duration, practiceSeat, level (instead of body parts)
//   • New "Breath Pattern" card shows the structured pattern (paced vs rate)
//   • Safety section is rendered more prominently — pranayama
//     contraindications are heavier than most asana contraindications
//   • Source-citation pill identical to AsanaDetailPage
//   • Sticky CTA — Guided practice flow lands in a separate chunk; for
//     now the CTA opens an inline self-paced timer.
// ─────────────────────────────────────────────────────────────────────────────

const DOSHA_INFO = {
  vata:  { label: 'Vata',  icon: 'air',                     color: 'text-[#7b93a8]', bg: 'bg-[#7b93a8]/10' },
  pitta: { label: 'Pitta', icon: 'local_fire_department',   color: 'text-[#c47a3a]', bg: 'bg-[#c47a3a]/10' },
  kapha: { label: 'Kapha', icon: 'water_drop',              color: 'text-[#6b8f5e]', bg: 'bg-[#6b8f5e]/10' },
}

// Pranayama-specific level visuals (same idea as asana levels).
const LEVELS = {
  beginner:     { label: 'Beginner',     icon: 'eco' },
  intermediate: { label: 'Intermediate', icon: 'trending_up' },
  advanced:     { label: 'Advanced',     icon: 'military_tech' },
}

// ─── Bottom-sheet modal ────────────────────────────────────────────────
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
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] p-0 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative w-full sm:max-w-md bg-surface text-on-surface rounded-t-3xl sm:rounded-3xl shadow-2xl px-5 pt-5 pb-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base text-on-surface-variant">close</span>
        </button>
        <p className="font-headline text-base text-on-surface mb-3 pr-8">{title}</p>
        {children}
      </div>
    </div>,
    document.body,
  )
}

// ─── Breath Pattern formatter ──────────────────────────────────────────
function PatternCard({ pattern, breathPattern }) {
  if (!pattern) return null

  // Two pattern shapes: paced (counts) vs rate (bpm)
  if (breathPattern === 'rate') {
    return (
      <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
        <p className="font-label text-[10px] text-primary uppercase tracking-widest mb-3">Breath Pattern</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Rate</p>
            <p className="font-body text-sm font-semibold text-on-surface">{pattern.rate} breaths / min</p>
          </div>
          <div>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Round duration</p>
            <p className="font-body text-sm font-semibold text-on-surface">{pattern.roundSeconds}s</p>
          </div>
          <div>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Rounds</p>
            <p className="font-body text-sm font-semibold text-on-surface">{pattern.rounds}</p>
          </div>
          <div>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Rest between</p>
            <p className="font-body text-sm font-semibold text-on-surface">{pattern.restBetweenRounds}s</p>
          </div>
        </div>
        {pattern.notes && (
          <p className="font-body text-xs text-on-surface-variant leading-relaxed mt-4 pt-4 border-t border-outline-variant/15">
            {pattern.notes}
          </p>
        )}
      </div>
    )
  }

  // Default: paced pattern
  return (
    <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
      <p className="font-label text-[10px] text-primary uppercase tracking-widest mb-3">Breath Pattern</p>
      <div className="flex items-center justify-around mb-3">
        <div className="text-center">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Inhale</p>
          <p className="font-headline text-3xl text-primary tabular-nums">{pattern.inhale ?? '—'}</p>
        </div>
        {pattern.holdAfterIn ? (
          <div className="text-center">
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Hold</p>
            <p className="font-headline text-3xl text-on-surface-variant tabular-nums">{pattern.holdAfterIn}</p>
          </div>
        ) : null}
        <div className="text-center">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Exhale</p>
          <p className="font-headline text-3xl text-primary tabular-nums">{pattern.exhale ?? '—'}</p>
        </div>
        {pattern.holdAfterEx ? (
          <div className="text-center">
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Hold</p>
            <p className="font-headline text-3xl text-on-surface-variant tabular-nums">{pattern.holdAfterEx}</p>
          </div>
        ) : null}
      </div>
      {pattern.ratio && (
        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest text-center mb-3">Ratio · {pattern.ratio}</p>
      )}
      {pattern.notes && (
        <p className="font-body text-xs text-on-surface-variant leading-relaxed pt-3 border-t border-outline-variant/15">
          {pattern.notes}
        </p>
      )}
    </div>
  )
}

// ─── Steps composition (instructions[] + voice phases) ─────────────────
function getSteps(p) {
  const setupSteps = Array.isArray(p.instructions) && p.instructions.length
    ? p.instructions.map((text, i) => ({
        phase: i === 0 ? 'Setup' : '',
        icon:  i === 0 ? 'login' : 'arrow_right',
        text,
      }))
    : [{ phase: 'Setup', icon: 'login', text: p.voiceCues?.enter ?? '' }]

  return [
    ...setupSteps,
    p.voiceCues?.hold    && { phase: 'Hold',    icon: 'timer',   text: p.voiceCues.hold },
    p.voiceCues?.breathe && { phase: 'Breathe', icon: 'airwave', text: p.voiceCues.breathe },
    p.voiceCues?.exit    && { phase: 'Release', icon: 'logout',  text: p.voiceCues.exit },
  ].filter(Boolean)
}

// ─── Main page ────────────────────────────────────────────────────────
export default function PranayamaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const pranayama = PRANAYAMAS[id]
  useScrollDepth('pranayama_detail')

  const [practicing, setPracticing] = useState(false)
  const [sheet, setSheet] = useState(null) // 'pattern' | 'safety' | null
  const [sticky, setSticky] = useState(false)
  const heroRef = useRef(null)

  // Sticky mini-header on scroll past hero
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setSticky(!entry.isIntersecting),
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!pranayama) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <span aria-hidden="true" className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">search_off</span>
          <h2 className="font-headline text-xl text-on-surface mb-2">Pranayama not found</h2>
          <p className="font-body text-sm text-on-surface-variant mb-6">The breath technique you're looking for doesn't exist.</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-primary text-on-primary rounded-full font-label text-xs tracking-wide">Go Back</button>
        </div>
      </div>
    )
  }

  const steps = getSteps(pranayama)
  const seatAsana = pranayama.practiceSeat ? ASANAS[pranayama.practiceSeat] : null
  const levelInfo = LEVELS[pranayama.level] || LEVELS.beginner
  const minutes = Math.round((pranayama.durationSeconds || 0) / 60)

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-32">
      {/* ── Sticky mini-header ─────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 z-30 bg-background/85 backdrop-blur-xl border-b border-outline-variant/10"
        style={{
          transform: sticky ? 'translateY(0)' : 'translateY(-100%)',
          opacity:   sticky ? 1 : 0,
          pointerEvents: sticky ? 'auto' : 'none',
          transition: 'transform 200ms ease, opacity 200ms ease',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-xl">arrow_back</span>
          </button>
          <p className="font-headline text-base text-on-surface flex-1 truncate">{pranayama.sanskrit}</p>
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">{minutes} min</p>
        </div>
      </div>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-xl">arrow_back</span>
        </button>
        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Pranayama</p>
        <div className="w-9" />
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="px-6 pt-2 pb-4">
        <div className="flex justify-center mb-5">
          {/* Real figure when registered (showing the practiceSeat + mudra);
              icon fallback while the still hasn't been generated yet. */}
          {pranayama.poseKey && hasPoseImage(pranayama.poseKey) ? (
            <PoseFigure poseKey={pranayama.poseKey} size="lg" breathing={false} objectPosition="center" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-primary-container/30 flex items-center justify-center">
              <span aria-hidden="true" className="material-symbols-outlined text-primary text-6xl">{pranayama.icon || 'air'}</span>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="font-label text-[10px] text-primary uppercase tracking-widest mb-1">Pranayama</p>
          <h1 className="font-headline text-3xl text-on-surface mb-1">{pranayama.sanskrit}</h1>
          {(pranayama.devanagari || pranayama.iast) && (
            <p className="font-body text-[13px] text-on-surface-variant/70 mb-1" lang="sa">
              {pranayama.devanagari}
              {pranayama.devanagari && pranayama.iast && <span className="mx-1.5 text-on-surface-variant/40">·</span>}
              {pranayama.iast && <span className="italic">{pranayama.iast}</span>}
            </p>
          )}
          <p className="font-body text-sm text-on-surface-variant">{pranayama.english}</p>
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div className="px-6 mb-5">
        <div className="bg-surface-container rounded-2xl p-4 grid grid-cols-3 gap-2 text-center">
          <button
            onClick={() => setSheet('pattern')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl active:bg-surface-container-high/50 transition-colors"
            aria-label="Show breath pattern details"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">timer</span>
            <p className="font-headline text-base text-on-surface">{minutes} min</p>
            <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Duration</p>
          </button>

          {seatAsana ? (
            <button
              onClick={() => navigate(`/asana/${seatAsana.id}`)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl active:bg-surface-container-high/50 transition-colors"
              aria-label={`Recommended seat: ${seatAsana.sanskrit}`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">self_care</span>
              <p className="font-headline text-base text-on-surface line-clamp-1">{seatAsana.sanskrit}</p>
              <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Seat</p>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-1 p-2">
              <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">self_care</span>
              <p className="font-headline text-base text-on-surface">Any seat</p>
              <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Seat</p>
            </div>
          )}

          <div className="flex flex-col items-center gap-1 p-2">
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">{levelInfo.icon}</span>
            <p className="font-headline text-base text-on-surface">{levelInfo.label}</p>
            <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Level</p>
          </div>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-5">
        {/* ── Why This Practice ──────────────────────────────────────────── */}
        <div>
          <h3 className="font-headline text-lg text-on-surface mb-2 flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-base">psychology</span>
            Why This Practice
          </h3>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">{pranayama.reasoning}</p>
        </div>

        {/* ── Breath Pattern card ─────────────────────────────────────────── */}
        {pranayama.pattern && (
          <PatternCard pattern={pranayama.pattern} breathPattern={pranayama.breathPattern} />
        )}

        {/* ── How to Perform ─────────────────────────────────────────────── */}
        <div>
          <h3 className="font-headline text-lg text-on-surface mb-3 flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-base">format_list_numbered</span>
            How to Perform
          </h3>
          <ol className="space-y-2.5">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-primary-container/40 flex items-center justify-center">
                    <span aria-hidden="true" className="material-symbols-outlined text-primary text-sm">{step.icon}</span>
                  </div>
                  {i < steps.length - 1 && <div className="w-px flex-1 bg-primary/10 mt-1 min-h-[8px]" />}
                </div>
                <div className="flex-1 pt-0.5 pb-3">
                  {step.phase && (
                    <p className="font-label text-[10px] text-primary uppercase tracking-widest mb-1">{step.phase}</p>
                  )}
                  <p className="font-body text-sm text-on-surface leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ── Benefits ────────────────────────────────────────────────────── */}
        {pranayama.benefits && pranayama.benefits.length > 0 && (
          <div>
            <h3 className="font-headline text-lg text-on-surface mb-3 flex items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-primary text-base">check_circle</span>
              Benefits
            </h3>
            <ul className="space-y-2">
              {pranayama.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-primary text-base flex-shrink-0 mt-0.5">spa</span>
                  <span className="font-body text-sm text-on-surface leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Modifications ───────────────────────────────────────────────── */}
        {pranayama.modifications && pranayama.modifications.length > 0 && (
          <div>
            <h3 className="font-headline text-lg text-on-surface mb-3 flex items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-primary text-base">tune</span>
              Modifications
            </h3>
            <ul className="space-y-2">
              {pranayama.modifications.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/60 text-base flex-shrink-0 mt-0.5">arrow_right</span>
                  <span className="font-body text-sm text-on-surface-variant leading-relaxed">{m}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Important Safety Considerations ─────────────────────────────── */}
        {pranayama.contraindications && pranayama.contraindications.length > 0 && (
          <section
            role="region"
            aria-label="Safety considerations"
            className="bg-error/5 border border-error/20 rounded-2xl p-5"
          >
            <h3 className="font-headline text-lg text-on-surface mb-3 flex items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-error text-base">health_and_safety</span>
              Important Safety Considerations
            </h3>
            <ul className="space-y-2">
              {pranayama.contraindications.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-error text-base flex-shrink-0 mt-0.5">warning</span>
                  <span className="font-body text-sm text-on-surface leading-relaxed">{c}</span>
                </li>
              ))}
            </ul>
            <p className="font-body text-xs text-on-surface-variant/80 leading-relaxed mt-4 pt-3 border-t border-error/15">
              Pranayama is potent. If a technique produces dizziness, lightheadedness, or breathlessness, stop immediately and breathe naturally. Consult a yoga teacher or healthcare provider before regular practice if you have medical conditions.
            </p>
          </section>
        )}

        {/* ── Source citation ──────────────────────────────────────────────── */}
        {pranayama.source && (
          <div className="flex items-start gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-base flex-shrink-0 mt-0.5">menu_book</span>
            <p className="font-body text-xs text-on-surface-variant/70 leading-relaxed">
              <span className="font-label uppercase tracking-widest text-[10px]">Source · </span>
              {pranayama.source.text === 'HYP'    ? 'Hatha Yoga Pradipika'
               : pranayama.source.text === 'CS'   ? 'Charaka Samhita'
               : pranayama.source.text === 'GS'   ? 'Gheranda Samhita'
                                                  : 'Modern hatha tradition'}
              {pranayama.source.verse && <span> · verse {pranayama.source.verse}</span>}
              {pranayama.source.note && (
                <span className="block mt-1 italic">{pranayama.source.note}</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* ── Sticky CTA ──────────────────────────────────────────────────── */}
      {createPortal(
        <div
          className="fixed bottom-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-xl border-t border-outline-variant/10 px-6 pt-3 pb-2"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={() => {
              track(EVENTS.CTA_CLICKED, {
                cta_id: 'pranayama_detail_practice',
                route_name: 'pranayama_detail',
                pranayama_id: pranayama.id,
                label: 'Start Practice',
              })
              setPracticing(true)
            }}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label text-sm font-semibold tracking-wide active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(78,99,85,0.15)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-lg">play_arrow</span>
            Start Practice · {minutes} min
          </button>
        </div>,
        document.body,
      )}

      {/* ── Bottom-sheet: full pattern explanation ───────────────────────── */}
      <BottomSheet open={sheet === 'pattern'} onClose={() => setSheet(null)} title="Breath Pattern">
        <PatternCard pattern={pranayama.pattern} breathPattern={pranayama.breathPattern} />
        {pranayama.breathCues?.notes && (
          <p className="font-body text-sm text-on-surface-variant leading-relaxed mt-4">
            {pranayama.breathCues.notes}
          </p>
        )}
      </BottomSheet>

      {/* ── Voice-guided practice overlay ───────────────────────────────── */}
      {practicing && (
        <PranayamaPracticeOverlay
          pranayama={pranayama}
          onClose={() => setPracticing(false)}
        />
      )}
    </div>
  )
}
