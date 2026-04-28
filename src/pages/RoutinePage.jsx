import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { getRoutine, getDoshaTag } from '../data/asanas'
import PoseFigure from '../components/PoseFigure'
import { track, EVENTS } from '../lib/track'


function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`
}

// Outcomes shown as gamified "rewards" the user unlocks by completing the
// routine. Pulled per-routine so the user understands what the practice
// is *for* before committing to it. (One-line each — these are reward
// chips, not paragraphs.)
const ROUTINE_OUTCOMES = {
  stress:      ['Calmer mind', 'Lower cortisol', 'Released shoulders', 'Steadier breath'],
  sleep:       ['Quieter mind', 'Slower heart rate', 'Loosened spine', 'Deeper rest'],
  energy:      ['Awakened body', 'Sharper focus', 'Open chest', 'Lifted mood'],
  flexibility: ['Open hips', 'Mobile spine', 'Eased tightness', 'Better range'],
}

export default function RoutinePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()

  const routineKey = location.state?.routineKey || 'stress'
  const routine = getRoutine(routineKey)
  const userDosha = profile?.dosha_details?.primary || profile?.dosha?.toLowerCase() || null

  const [expanded, setExpanded] = useState(null)

  const firstAsana = routine.asanas[0]
  const outcomes = ROUTINE_OUTCOMES[routineKey] || ROUTINE_OUTCOMES.stress
  const totalPoses = routine.asanas.length

  return (
    <div
      className="min-h-screen bg-background text-on-surface font-body"
      style={{ paddingBottom: 'calc(110px + env(safe-area-inset-bottom))' }}
    >

      {/* ── Hero ── */}
      <div className={`relative bg-gradient-to-b ${routine.gradient} px-6 pt-12 pb-12 overflow-hidden`}>
        <div className="absolute top-8 right-6 w-24 h-24 rounded-full bg-white/8 animate-quiz-float" />
        <div className="absolute bottom-10 left-4 w-14 h-14 rounded-full bg-white/8 animate-quiz-float-delay" />

        {/* Top row — back + switch routine */}
        <div className="relative z-20 flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-white text-lg">arrow_back</span>
          </button>
          <button
            onClick={() => {
              track(EVENTS.ROUTINE_SWITCHED, { from_routine: routineKey })
              navigate('/discover')
            }}
            className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-white/20 backdrop-blur-sm text-white active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-base">swap_horiz</span>
            <span className="font-label text-[11px] uppercase tracking-wider font-semibold">Switch routine</span>
          </button>
        </div>

        <div className="relative z-10 text-center stagger-1">
          <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-white text-2xl">{routine.icon}</span>
          </div>
          <h1 className="font-headline text-3xl text-white leading-tight mb-2">
            {routine.label}
          </h1>
          <p className="font-body text-sm text-white/80 leading-relaxed max-w-xs mx-auto">
            {routine.description}
          </p>
        </div>
      </div>

      <div className="px-6 -mt-7 relative z-10">

        {/* ── Goal card — Duolingo-style daily target ── */}
        <div className="bg-surface rounded-2xl p-4 shadow-lg border border-outline-variant/20 stagger-2 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-base">flag</span>
            <p className="font-label text-[10px] text-primary uppercase tracking-widest font-semibold">Today's Goal</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="font-headline text-2xl text-on-surface leading-none">{totalPoses}</p>
              <p className="font-label text-[9px] text-on-surface-variant/60 uppercase tracking-wider mt-1">Poses</p>
            </div>
            <div className="text-center border-x border-outline-variant/20">
              <p className="font-headline text-2xl text-on-surface leading-none">{Math.round(routine.totalDuration / 60)}</p>
              <p className="font-label text-[9px] text-on-surface-variant/60 uppercase tracking-wider mt-1">Minutes</p>
            </div>
            <div className="text-center">
              <p className="font-headline text-2xl text-on-surface leading-none">+1</p>
              <p className="font-label text-[9px] text-on-surface-variant/60 uppercase tracking-wider mt-1">Streak day</p>
            </div>
          </div>
        </div>

        {/* ── Up Next — the first asana, hero treatment so the user knows
             exactly what's coming and feels ready to begin. ── */}
        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 px-1 stagger-2">
          Up Next
        </p>
        <button
          onClick={() => {
            track(EVENTS.CTA_CLICKED, {
              cta_id:      'routine_up_next',
              route_name:  'routine',
              routine_key: routineKey,
              label:       'Up Next',
            })
            navigate(`/practice/${routineKey}`)
          }}
          className="w-full bg-primary-container/40 border border-primary/20 rounded-2xl p-4 mb-6 flex items-center gap-4 text-left active:scale-[0.98] transition-all stagger-2"
        >
          <div className="w-20 h-20 rounded-xl bg-surface-container/60 flex items-center justify-center flex-shrink-0 overflow-hidden pointer-events-none">
            <PoseFigure poseKey={firstAsana.poseKey} size={80} breathing={false} objectPosition="top" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label text-[9px] text-primary uppercase tracking-widest font-semibold mb-0.5">Pose 1 of {totalPoses}</p>
            <p className="font-body font-semibold text-base text-on-surface leading-tight">{firstAsana.sanskrit}</p>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">{firstAsana.english} · {formatDuration(firstAsana.durationSeconds)}</p>
          </div>
          <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">play_circle</span>
        </button>

        {/* ── Path — gamified vertical timeline of poses ── */}
        <div className="flex items-center justify-between mb-3 px-1 stagger-3">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Your Path</p>
          <span className="font-label text-[10px] text-on-surface-variant/50 tracking-wider">Tap to preview</span>
        </div>

        <div className="relative stagger-3">
          {/* Vertical path line (drawn behind the dots) */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-surface-container-high" />

          {routine.asanas.map((asana, i) => {
            const isExpanded = expanded === i
            const isFirst = i === 0
            const doshaTag = userDosha ? getDoshaTag(asana.doshaAffinity[userDosha]) : null

            return (
              <button
                key={asana.id + i}
                onClick={() => setExpanded(isExpanded ? null : i)}
                className="relative flex gap-4 mb-3 last:mb-0 w-full text-left"
              >
                {/* Path node — first one is "active" (filled primary),
                    others are sequenced steps along the journey */}
                <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isFirst
                    ? 'bg-primary text-on-primary shadow-md ring-4 ring-primary/15'
                    : 'bg-surface-container border-2 border-surface-container-high text-on-surface-variant'
                }`}>
                  {isFirst ? (
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  ) : (
                    <span className="font-label text-xs font-semibold">{i + 1}</span>
                  )}
                </div>

                {/* Card */}
                <div className={`flex-1 bg-surface-container rounded-xl p-3.5 transition-all ${
                  isFirst ? 'border border-primary/15' : ''
                } ${isExpanded ? 'shadow-md' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-sm text-on-surface leading-tight">{asana.sanskrit}</p>
                      <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">
                        {asana.english} · {formatDuration(asana.durationSeconds)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {doshaTag && (
                        <span className={`font-label text-[9px] px-2 py-0.5 rounded-full ${doshaTag.color}`}>
                          {doshaTag.label}
                        </span>
                      )}
                      <span className={`material-symbols-outlined text-on-surface-variant/40 text-sm transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Expanded content */}
                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[600px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex justify-center py-3 bg-surface-container-low rounded-lg mb-3">
                      <PoseFigure poseKey={asana.poseKey} size="sm" expandable />
                    </div>

                    <p className="font-body text-xs text-on-surface-variant leading-relaxed mb-3">
                      {asana.reasoning}
                    </p>

                    <div className="mb-3">
                      <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-2">Benefits</p>
                      <div className="flex flex-wrap gap-1.5">
                        {asana.benefits.map((b, j) => (
                          <span key={j} className="bg-primary-container text-on-primary-container font-label text-[10px] px-2.5 py-1 rounded-full">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-2">Body Focus</p>
                      <div className="flex flex-wrap gap-1.5">
                        {asana.bodyParts.map((bp, j) => (
                          <span key={j} className="bg-surface-container-high text-on-surface-variant font-label text-[10px] px-2.5 py-1 rounded-full">
                            {bp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}

          {/* Finish flag — visual reward at the end of the path */}
          <div className="relative flex gap-4 mt-3">
            <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg">emoji_events</span>
            </div>
            <div className="flex-1 bg-primary-container/30 rounded-xl p-3.5 border border-primary/15">
              <p className="font-body font-semibold text-sm text-primary leading-tight">Finish line</p>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">
                Practice complete · +1 day on streak
              </p>
            </div>
          </div>
        </div>

        {/* ── Outcomes — "rewards" the user unlocks ── */}
        <div className="mt-7 stagger-4">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="material-symbols-outlined text-primary text-base">favorite</span>
            <p className="font-label text-[10px] text-primary uppercase tracking-widest font-semibold">What you'll feel after</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {outcomes.map((o, i) => (
              <span key={i} className="bg-surface-container rounded-full px-3.5 py-2 font-body text-xs text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                {o}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* ── Sticky CTA — single source of truth for the start action.
           Portaled to body so PageTransition's transform doesn't break
           position:fixed. ── */}
      {createPortal(
        <div
          className="px-6 pt-3 bg-background/80 backdrop-blur-xl border-t border-outline-variant/10"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))',
          }}
        >
          <button
            onClick={() => {
              track(EVENTS.CTA_CLICKED, {
                cta_id:      'routine_start',
                route_name:  'routine',
                routine_key: routineKey,
                label:       'Start Practice',
              })
              navigate(`/practice/${routineKey}`)
            }}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-lg">play_arrow</span>
            Start Practice · {Math.round(routine.totalDuration / 60)} min
          </button>
        </div>,
        document.body
      )}

    </div>
  )
}
