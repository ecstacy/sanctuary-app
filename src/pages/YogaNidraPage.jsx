// ─────────────────────────────────────────────────────────────────────────────
//  YogaNidraPage — the guided Yoga Nidra practice (not an asana page).
//
//  A calm, full-screen guided relaxation that steps through the Nidra stages
//  (data/yogaNidra.js) on a gentle timer: each stage shows its cues, a soft
//  progress bar advances, and it auto-moves to the next. Pause/resume, and a
//  quiet finish. Text-guided for now (eyes can rest between cues); audio can
//  layer on later without changing the structure.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { YOGA_NIDRA } from '../data/yogaNidra'
import useScrollDepth from '../hooks/useScrollDepth'
import { track, EVENTS } from '../lib/track'

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function YogaNidraPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  useScrollDepth('yoga_nidra')

  const stages = YOGA_NIDRA.stages
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)
  const [stageIdx, setStageIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0) // seconds into the current stage
  const startedAtRef = useRef(false)

  const stage = stages[stageIdx]
  const totalElapsed = stages.slice(0, stageIdx).reduce((a, s) => a + s.seconds, 0) + elapsed
  const stageProgress = stage ? Math.min(1, elapsed / stage.seconds) : 0

  // Tick every second while running.
  useEffect(() => {
    if (!started || paused || done) return
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [started, paused, done])

  // Advance stages when a stage's time is up.
  useEffect(() => {
    if (!started || done || !stage) return
    if (elapsed < stage.seconds) return
    if (stageIdx < stages.length - 1) {
      setStageIdx((i) => i + 1)
      setElapsed(0)
    } else {
      setDone(true)
      track(EVENTS.CTA_CLICKED, { cta_id: 'yoga_nidra_complete', route_name: 'yoga_nidra' })
    }
  }, [elapsed, stage, started, done, stageIdx, stages.length])

  function begin() {
    setStarted(true)
    if (!startedAtRef.current) {
      startedAtRef.current = true
      track(EVENTS.CTA_CLICKED, { cta_id: 'yoga_nidra_start', route_name: 'yoga_nidra' })
    }
  }

  return (
    <div className="min-h-screen text-white font-body flex flex-col"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundImage: 'linear-gradient(to bottom, #4a2f66 0%, #5d3f7a 45%, #6d4a86 100%)',
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-4">
        <button
          onClick={() => navigate(-1)}
          aria-label={t('common.back')}
          className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-all"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-white text-lg">arrow_back</span>
        </button>
        {started && !done && (
          <span className="font-label text-[12px] tabular-nums text-white/80 tracking-wider">
            {fmt(totalElapsed)} / {fmt(YOGA_NIDRA.totalSeconds)}
          </span>
        )}
      </div>

      {/* ── Intro ── */}
      {!started && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <span aria-hidden="true" className="material-symbols-outlined text-white/90 text-5xl mb-4">bedtime</span>
          <h1 className="font-headline text-4xl leading-tight mb-2">{YOGA_NIDRA.name}</h1>
          <p className="font-body italic text-white/70 mb-6">{YOGA_NIDRA.sanskrit}</p>
          <p className="font-body text-[15px] text-white/85 leading-relaxed max-w-sm mb-2">
            {t('yogaNidra.intro')}
          </p>
          <p className="font-label text-[12px] text-white/60 uppercase tracking-widest mt-4">
            {t('yogaNidra.lengthMin', { min: Math.round(YOGA_NIDRA.totalSeconds / 60) })}
          </p>
        </div>
      )}

      {/* ── Guided ── */}
      {started && !done && stage && (
        <div className="flex-1 flex flex-col justify-center px-8">
          <p className="font-label text-[12px] text-white/60 uppercase tracking-widest text-center mb-2">
            {t('yogaNidra.stageProgress', { n: stageIdx + 1, total: stages.length })}
          </p>
          <h2 className="font-headline text-3xl text-center leading-tight mb-8">{stage.title}</h2>
          <ul className="space-y-5 max-w-md mx-auto">
            {stage.cues.map((cue, i) => (
              <li key={i} className="font-body text-[17px] text-white/90 leading-relaxed text-center">{cue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Done ── */}
      {done && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <span aria-hidden="true" className="material-symbols-outlined text-white text-5xl mb-4">self_care</span>
          <h1 className="font-headline text-3xl leading-tight mb-2">{t('yogaNidra.doneTitle')}</h1>
          <p className="font-body text-[15px] text-white/85 leading-relaxed max-w-sm">{t('yogaNidra.doneBody')}</p>
        </div>
      )}

      {/* ── Controls ── */}
      <div className="px-6 pb-5">
        {started && !done && (
          <div className="h-1 rounded-full bg-white/20 mb-4 overflow-hidden">
            <div className="h-full bg-white/70 transition-all duration-1000 ease-linear" style={{ width: `${stageProgress * 100}%` }} />
          </div>
        )}
        {!started ? (
          <button onClick={begin} className="w-full py-4 rounded-full bg-white text-plus font-label font-semibold tracking-wide text-sm active:scale-95 transition-all flex items-center justify-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-lg">play_arrow</span>
            {t('yogaNidra.begin')}
          </button>
        ) : done ? (
          <button onClick={() => navigate(-1)} className="w-full py-4 rounded-full bg-white text-plus font-label font-semibold tracking-wide text-sm active:scale-95 transition-all">
            {t('yogaNidra.finish')}
          </button>
        ) : (
          <button onClick={() => setPaused((p) => !p)} className="w-full py-4 rounded-full bg-white/15 backdrop-blur-sm text-white font-label font-semibold tracking-wide text-sm active:scale-95 transition-all flex items-center justify-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-lg">{paused ? 'play_arrow' : 'pause'}</span>
            {paused ? t('yogaNidra.resume') : t('yogaNidra.pause')}
          </button>
        )}
      </div>
    </div>
  )
}
