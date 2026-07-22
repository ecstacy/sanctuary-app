import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DINACHARYA_PRACTICES, DOSHA_TIMES } from '../data/ayurveda/dinacharya'
import { localizeDinacharyaPractice, localizeDoshaTimeNote } from '../i18n/contentI18n'
import { track, screen, EVENTS } from '../lib/track'
import useScrollDepth from '../hooks/useScrollDepth'
import { useDietPrefs } from '../hooks/useDietPrefs'
import { dailyPractices } from '../lib/mealComposer'

// ─────────────────────────────────────────────────────────────────────────────
//  DinacharyaPage — `/dinacharya`
//
//  Surfaces Charaka's daily routine (Sutrasthana 5) as a checklist-style
//  page. Each of the 13 practices expands to show details — time window,
//  benefits, step-by-step howTo, tools needed, contraindications, source.
//
//  Sticky dosha-clock chip at the top shows which dosha is currently
//  governing the time of day, so users connect the practice's timing
//  recommendation to the natural energy cycle.
// ─────────────────────────────────────────────────────────────────────────────

const DOSHA_ICON = { vata: 'air', pitta: 'local_fire_department', kapha: 'landscape' }
const DOSHA_COLORS = {
  vata:  'bg-[#e6eef5] text-[#3d5a73]',
  pitta: 'bg-[#fef3e2] text-[#8b5a2b]',
  kapha: 'bg-[#edf5e8] text-[#3d5e34]',
}

// Map the current hour to the governing dosha, mirroring DOSHA_TIMES in
// the source data module so the chip never disagrees with the body content.
function currentDoshaPeriod() {
  const h = new Date().getHours()
  if (h >= 6  && h < 10) return { dosha: 'kapha', window: '6 AM–10 AM' }
  if (h >= 10 && h < 14) return { dosha: 'pitta', window: '10 AM–2 PM' }
  if (h >= 14 && h < 18) return { dosha: 'vata',  window: '2 PM–6 PM' }
  if (h >= 18 && h < 22) return { dosha: 'kapha', window: '6 PM–10 PM' }
  if (h >= 22 || h < 2)  return { dosha: 'pitta', window: '10 PM–2 AM' }
  return                       { dosha: 'vata',  window: '2 AM–6 AM' }
}

function PracticeCard({ practice, index, isOpen, onToggle }) {
  const { t } = useTranslation()
  const colorClass = DOSHA_COLORS[practice.doshaTime] || 'bg-surface-container text-on-surface-variant'
  return (
    <div className="bg-surface-container-low rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center gap-3 text-left active:bg-surface-container-high/40"
        aria-expanded={isOpen}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          <span aria-hidden="true" className="font-headline text-sm">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-sm text-on-surface leading-tight">{practice.name}</p>
          <p className="font-label text-[10px] text-on-surface-variant/70 uppercase tracking-wider mt-0.5">
            {practice.sanskrit} · {practice.timeWindow}
          </p>
        </div>
        <span
          aria-hidden="true"
          className={`material-symbols-outlined text-on-surface-variant/40 text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-outline-variant/10">
          {/* Meta strip */}
          <div className="flex flex-wrap gap-2 pt-3">
            <span className={`px-2 py-1 rounded-full font-label text-[10px] uppercase tracking-wider ${DOSHA_COLORS[practice.doshaTime]}`}>
              {t('dinacharya.doshaTimeLabel', { dosha: practice.doshaTime })}
            </span>
            <span className="px-2 py-1 rounded-full font-label text-[10px] uppercase tracking-wider bg-surface-container-high text-on-surface-variant">
              {practice.duration}
            </span>
          </div>

          {/* Benefits */}
          <div>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">{t('dinacharya.why')}</p>
            <ul className="space-y-1.5">
              {practice.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-primary text-[14px] mt-0.5">check_circle</span>
                  <span className="font-body text-sm text-on-surface-variant leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How to */}
          <div>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">{t('dinacharya.how')}</p>
            <ol className="space-y-1.5">
              {practice.howTo.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-label text-[10px] text-primary font-semibold mt-1 min-w-[14px]">{i + 1}</span>
                  <span className="font-body text-sm text-on-surface-variant leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tools */}
          {practice.tools?.length > 0 && (
            <div>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">{t('dinacharya.tools')}</p>
              <ul className="space-y-1">
                {practice.tools.map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-[14px] mt-0.5">circle</span>
                    <span className="font-body text-xs text-on-surface-variant leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contraindications */}
          {practice.contraindications?.length > 0 && (
            <div
              role="region"
              aria-label={t('dinacharya.safetyAria')}
              className="rounded-xl bg-error-container/30 border border-error/20 px-4 py-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span aria-hidden="true" className="material-symbols-outlined text-error text-base">health_and_safety</span>
                <p className="font-label text-[10px] text-error uppercase tracking-wider">{t('dinacharya.caution')}</p>
              </div>
              <ul className="space-y-1">
                {practice.contraindications.map((c, i) => (
                  <li key={i} className="font-body text-xs text-on-surface leading-relaxed">• {c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Source */}
          <p className="font-label text-[10px] text-on-surface-variant/60 leading-relaxed">
            {t('dinacharya.sourceLabel')} {practice.source.text}
            {practice.source.verse ? ` ${practice.source.verse}` : ''}
            {practice.source.note ? ` — ${practice.source.note}` : ''}
          </p>
        </div>
      )}
    </div>
  )
}

export default function DinacharyaPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [openId, setOpenId] = useState(null)
  const { prefs: dietPrefs } = useDietPrefs()
  // Safety filter applies here too: a traditional practice is not offered to
  // someone who has excluded its ingredient, however classical it is.
  const foodPractices = useMemo(() => dailyPractices({ dietPrefs }), [dietPrefs])
  useScrollDepth('dinacharya')

  const period = currentDoshaPeriod()

  useEffect(() => {
    screen('dinacharya', { current_dosha_time: period.dosha })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggle(id) {
    if (openId !== id) {
      track(EVENTS.CONTENT_IMPRESSION, {
        surface:      'dinacharya',
        content_type: 'practice',
        content_id:   id,
        action:       'expand',
      })
    }
    setOpenId(prev => (prev === id ? null : id))
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-20">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1">
        <button
          onClick={() => navigate(-1)}
          aria-label={t('dinacharya.goBack')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant active:scale-90"
        >
          <span aria-hidden="true" className="material-symbols-outlined">arrow_back</span>
        </button>
        <p className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant">{t('dinacharya.title')}</p>
        <div className="w-9 h-9" />
      </div>

      {/* Hero */}
      <div className="px-5 mt-2 stagger-1">
        <h1 className="font-headline text-3xl text-on-surface leading-tight">{t('dinacharya.heading')}</h1>
        <p className="font-body text-sm text-on-surface-variant mt-1 leading-relaxed">
          {t('dinacharya.subtitle')}
        </p>
      </div>

      {/* Dosha clock chip */}
      <div className="px-5 mt-5 stagger-2">
        <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${DOSHA_COLORS[period.dosha]}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-2xl">{DOSHA_ICON[period.dosha]}</span>
          <div className="flex-1">
            <p className="font-label text-[10px] uppercase tracking-wider opacity-70">{t('dinacharya.rightNow')}</p>
            <p className="font-body text-sm font-semibold capitalize">{t('dinacharya.doshaTimeLabel', { dosha: period.dosha })} · {period.window}</p>
          </div>
          <button
            onClick={() => track(EVENTS.CTA_CLICKED, { cta_id: 'dosha_clock_explain', route_name: 'dinacharya' })}
            aria-label={t('dinacharya.learnClock')}
            className="w-7 h-7 rounded-full bg-white/40 flex items-center justify-center"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">info</span>
          </button>
        </div>
      </div>

      {/* ── Food practices ───────────────────────────────────────────────
          Templates marked `kind: 'practice'` in the diet dataset — dinacharya
          observances rather than meals, which is exactly why they are excluded
          from /meals and surfaced here instead. Renders nothing when there are
          none (they are all draft today), so this page is unchanged until the
          content is reviewed. */}
      {foodPractices.length > 0 && (
        <div className="px-5 mt-6">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">
            {t('dinacharya.foodPractices')}
          </p>
          <div className="flex flex-col gap-2.5">
            {foodPractices.map((fp) => (
              <button
                key={fp.id}
                onClick={() => {
                  track(EVENTS.CTA_CLICKED, { cta_id: 'dinacharya_food_practice', route_name: 'dinacharya', meal_id: fp.id })
                  navigate(`/ingredient/${fp.core[0].id}`)
                }}
                className="bg-surface-container-low rounded-2xl p-4 text-left active:scale-[0.99] transition-all"
              >
                <p className="font-body text-sm font-semibold text-on-surface">{fp.name}</p>
                {fp.prep && (
                  <p className="font-body text-xs text-on-surface-variant/70 mt-1.5 leading-relaxed">{fp.prep}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section label */}
      <div className="px-5 mt-6 mb-3 flex items-baseline justify-between">
        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">{t('dinacharya.thePractices')}</p>
        <p className="font-label text-[10px] text-on-surface-variant/60">{t('dinacharya.total', { count: DINACHARYA_PRACTICES.length })}</p>
      </div>

      {/* Practices list */}
      <div className="px-5 space-y-2.5">
        {DINACHARYA_PRACTICES.map((p, i) => (
          <PracticeCard
            key={p.id}
            practice={localizeDinacharyaPractice(p)}
            index={i}
            isOpen={openId === p.id}
            onToggle={() => toggle(p.id)}
          />
        ))}
      </div>

      {/* Dosha clock reference */}
      <div className="px-5 mt-8">
        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">{t('dinacharya.doshaClock')}</p>
        <div className="bg-surface-container-low rounded-2xl p-5 space-y-3">
          {[...DOSHA_TIMES.morning, ...DOSHA_TIMES.afternoon, ...DOSHA_TIMES.evening].map((slot, i) => (
            <div key={i} className="flex items-baseline gap-3">
              <span className={`material-symbols-outlined text-base ${DOSHA_COLORS[slot.dosha].split(' ')[1]}`} aria-hidden="true">{DOSHA_ICON[slot.dosha]}</span>
              <div className="flex-1">
                <p className="font-body font-semibold text-sm text-on-surface capitalize">{slot.dosha} · {slot.window}</p>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed mt-0.5">{localizeDoshaTimeNote(slot.window, slot.note)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="font-label text-[10px] text-on-surface-variant/60 leading-relaxed px-5 mt-6">
        {t('dinacharya.clockSource')}
      </p>
    </div>
  )
}
