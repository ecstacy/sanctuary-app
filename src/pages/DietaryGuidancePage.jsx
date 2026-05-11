import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DIETARY_GUIDANCE, RASAS } from '../data/ayurveda/dietary'
import { track, screen, EVENTS } from '../lib/track'
import useScrollDepth from '../hooks/useScrollDepth'

// ─────────────────────────────────────────────────────────────────────────────
//  DietaryGuidancePage — `/dietary`
//
//  Surfaces the dietary guidance data drafted in src/data/ayurveda/dietary.js
//  on a single scrollable page. Defaults to the user's primary dosha from
//  their profile; tabs at top let them browse the other two (and the user's
//  partner/dual dosha if relevant).
//
//  Source: Charaka Samhita Sutrasthana 26-27 + Vimanasthana 1.21. We
//  paraphrase only — never lift modern commentary.
// ─────────────────────────────────────────────────────────────────────────────

const DOSHA_COLORS = {
  vata:  { gradient: 'from-[#7b93a8] to-[#b8d4e8]', accent: 'text-[#3d5a73]', bg: 'bg-[#e6eef5]' },
  pitta: { gradient: 'from-[#c47a3a] to-[#f0c987]', accent: 'text-[#8b5a2b]', bg: 'bg-[#fef3e2]' },
  kapha: { gradient: 'from-[#6b8f5e] to-[#b8d4a8]', accent: 'text-[#3d5e34]', bg: 'bg-[#edf5e8]' },
}

const DOSHA_LABELS = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' }

function CategoryList({ items, accent }) {
  return (
    <div className="space-y-2">
      {Object.entries(items).map(([category, text]) => (
        <div key={category} className="flex gap-3">
          <p className={`font-label text-[10px] uppercase tracking-wider min-w-[78px] flex-shrink-0 mt-0.5 ${accent}`}>
            {category}
          </p>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed flex-1">{text}</p>
        </div>
      ))}
    </div>
  )
}

export default function DietaryGuidancePage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  useScrollDepth('dietary_guidance')

  const userDosha = profile?.dosha_details?.primary || profile?.dosha?.toLowerCase() || 'vata'
  const [activeDosha, setActiveDosha] = useState(userDosha)
  const guide = DIETARY_GUIDANCE[activeDosha]

  useEffect(() => {
    screen('dietary_guidance', { dosha_primary: userDosha })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!guide) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <p className="font-body text-on-surface-variant">Unknown dosha: {activeDosha}</p>
      </div>
    )
  }

  const colors = DOSHA_COLORS[activeDosha]

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-20">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant active:scale-90"
        >
          <span aria-hidden="true" className="material-symbols-outlined">arrow_back</span>
        </button>
        <p className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant">Dietary Guidance</p>
        <div className="w-9 h-9" />
      </div>

      {/* Hero */}
      <div className={`mx-5 mt-2 rounded-2xl bg-gradient-to-br ${colors.gradient} px-5 py-6 text-white stagger-1`}>
        <p className="font-label text-[10px] uppercase tracking-widest opacity-80 mb-1">For your {DOSHA_LABELS[activeDosha]} constitution</p>
        <h1 className="font-headline text-2xl leading-tight mb-2">Eat to balance</h1>
        <p className="font-body text-sm opacity-95 leading-relaxed">{guide.principle}</p>
      </div>

      {/* Dosha tabs */}
      <div className="px-5 mt-4 flex gap-2 stagger-2">
        {['vata', 'pitta', 'kapha'].map(d => (
          <button
            key={d}
            onClick={() => {
              track(EVENTS.CTA_CLICKED, {
                cta_id:      'dietary_dosha_tab',
                route_name:  'dietary_guidance',
                target_dosha: d,
              })
              setActiveDosha(d)
            }}
            className={`flex-1 py-2 rounded-full font-label text-[11px] uppercase tracking-wider transition-all ${
              activeDosha === d
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant'
            }`}
            aria-pressed={activeDosha === d}
          >
            {DOSHA_LABELS[d]}
          </button>
        ))}
      </div>

      {/* Tastes */}
      <div className="px-5 mt-6 stagger-3">
        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Tastes (Rasa)</p>
        <div className="bg-surface-container-low rounded-2xl p-5">
          <div className="mb-4">
            <p className={`font-label text-[10px] uppercase tracking-wider mb-2 ${colors.accent}`}>Favor</p>
            <div className="flex flex-wrap gap-2">
              {guide.tastes.favor.map(t => (
                <span key={t} className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.accent} font-medium`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-label text-[10px] uppercase tracking-wider mb-2 text-on-surface-variant/60">Avoid in excess</p>
            <div className="flex flex-wrap gap-2">
              {guide.tastes.avoid.map(t => (
                <span key={t} className="px-3 py-1 rounded-full text-xs bg-surface-container text-on-surface-variant">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Foods to Favor */}
      <div className="px-5 mt-6 stagger-4">
        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Foods to Favor</p>
        <div className="bg-surface-container-low rounded-2xl p-5">
          <CategoryList items={guide.favor} accent={colors.accent} />
        </div>
      </div>

      {/* Foods to Avoid */}
      <div className="px-5 mt-6 stagger-4">
        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Foods to Avoid</p>
        <div className="bg-surface-container-low rounded-2xl p-5 space-y-3">
          <p className="font-body text-sm text-on-surface-variant leading-relaxed italic">{guide.avoid.generally}</p>
          <ul className="space-y-1.5">
            {guide.avoid.specific.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-[14px] mt-0.5">close</span>
                <span className="font-body text-sm text-on-surface-variant leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Eating habits */}
      <div className="px-5 mt-6 stagger-5">
        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">How to Eat</p>
        <div className="bg-surface-container-low rounded-2xl p-5">
          <ul className="space-y-2">
            {guide.eatingHabits.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span aria-hidden="true" className={`material-symbols-outlined text-[14px] mt-0.5 ${colors.accent}`}>check_circle</span>
                <span className="font-body text-sm text-on-surface-variant leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Seasonal note */}
      <div className="px-5 mt-6 stagger-5">
        <div className={`rounded-2xl p-5 ${colors.bg}`}>
          <p className={`font-label text-[10px] uppercase tracking-widest mb-2 ${colors.accent}`}>Seasonal Note</p>
          <p className="font-body text-sm text-on-surface leading-relaxed">{guide.seasonal}</p>
        </div>
      </div>

      {/* Six tastes reference */}
      <div className="px-5 mt-6 stagger-5">
        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">The Six Tastes (Charaka Reference)</p>
        <div className="bg-surface-container-low rounded-2xl p-5 space-y-3">
          {Object.entries(RASAS).map(([key, r]) => (
            <div key={key} className="border-b border-outline-variant/15 last:border-0 pb-3 last:pb-0">
              <div className="flex items-baseline justify-between mb-1">
                <p className="font-body font-semibold text-sm text-on-surface">
                  {r.sanskrit} <span className="text-on-surface-variant/70 font-normal italic">({r.iast})</span>
                </p>
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider capitalize">{key}</p>
              </div>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">{r.examples}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Source citation */}
      <div className="px-5 mt-6 mb-2">
        <p className="font-label text-[10px] text-on-surface-variant/60 leading-relaxed">
          Source: {guide.source.text} {guide.source.verse}. {guide.source.note}
        </p>
      </div>
    </div>
  )
}
