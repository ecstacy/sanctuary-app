import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRoutine, getDoshaTag } from '../data/asanas'
import PoseFigure from '../components/PoseFigure'


function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`
}

export default function RoutinePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()

  const routineKey = location.state?.routineKey || 'stress'
  const routine = getRoutine(routineKey)
  const userDosha = profile?.dosha_details?.primary || profile?.dosha?.toLowerCase() || null

  const [expanded, setExpanded] = useState(null)

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-20">

      {/* Hero */}
      <div className={`relative bg-gradient-to-b ${routine.gradient} px-6 pt-12 pb-16 overflow-hidden`}>
        <div className="absolute top-8 right-6 w-24 h-24 rounded-full bg-white/8 animate-quiz-float" />
        <div className="absolute bottom-14 left-4 w-14 h-14 rounded-full bg-white/8 animate-quiz-float-delay" />

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-white text-lg">arrow_back</span>
        </button>

        <div className="relative z-10 text-center mt-4 stagger-1">
          <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white text-2xl">{routine.icon}</span>
          </div>
          <h1 className="font-headline text-3xl text-white leading-tight mb-2">
            {routine.label}
          </h1>
          <p className="font-body text-sm text-white/75 leading-relaxed max-w-xs mx-auto mb-5">
            {routine.description}
          </p>
          <div className="flex items-center justify-center gap-4 text-white/60">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">timer</span>
              <span className="font-label text-xs uppercase tracking-wider">{formatDuration(routine.totalDuration)}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">self_care</span>
              <span className="font-label text-xs uppercase tracking-wider">{routine.asanas.length} poses</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
              <span className="font-label text-xs uppercase tracking-wider">Beginner</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6">

        {/* Begin Practice CTA */}
        <button
          onClick={() => navigate(`/practice/${routineKey}`)}
          className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all shadow-lg mb-6 stagger-2 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">play_arrow</span>
          Begin Practice
        </button>

        {/* Timeline */}
        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-5 stagger-3">
          Practice Sequence
        </p>

        <div className="relative stagger-3">
          {/* Vertical timeline line */}
          <div className="absolute left-5 top-3 bottom-3 w-px bg-surface-container-high" />

          {routine.asanas.map((asana, i) => {
            const isExpanded = expanded === i
            const doshaTag = userDosha ? getDoshaTag(asana.doshaAffinity[userDosha]) : null

            return (
              <button
                key={asana.id + i}
                onClick={() => setExpanded(isExpanded ? null : i)}
                className="relative flex gap-4 mb-4 last:mb-0 w-full text-left"
              >
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border-2 border-surface-container-high">
                  <span className="font-label text-xs text-on-surface-variant font-semibold">{i + 1}</span>
                </div>

                {/* Card */}
                <div className={`flex-1 bg-surface-container rounded-lg p-4 transition-all ${isExpanded ? 'shadow-md' : ''}`}>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <p className="font-body font-semibold text-sm text-on-surface">{asana.sanskrit}</p>
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
                      <span className={`material-symbols-outlined text-on-surface-variant/30 text-sm transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Expanded content */}
                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {/* Pose figure */}
                    <div className="flex justify-center py-4 bg-surface-container-low rounded-lg mb-3">
                      <PoseFigure poseKey={asana.poseKey} size="sm" />
                    </div>

                    {/* Reasoning */}
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed mb-3">
                      {asana.reasoning}
                    </p>

                    {/* Benefits */}
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

                    {/* Body parts */}
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

                    {/* Dosha affinity */}
                    <div>
                      <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-2">Dosha Compatibility</p>
                      <div className="flex gap-2">
                        {Object.entries(asana.doshaAffinity).map(([dosha, affinity]) => {
                          const tag = getDoshaTag(affinity)
                          return (
                            <span key={dosha} className={`font-label text-[10px] px-2.5 py-1 rounded-full ${tag.color}`}>
                              {dosha.charAt(0).toUpperCase() + dosha.slice(1)}: {tag.label}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <button
          onClick={() => navigate(`/practice/${routineKey}`)}
          className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all mt-6 mb-4 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">play_arrow</span>
          Start Practice
        </button>

      </div>

    </div>
  )
}
