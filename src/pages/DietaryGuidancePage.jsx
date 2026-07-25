import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { DIETARY_GUIDANCE, RASAS } from '../data/ayurveda/dietary'
import { localizeDietaryGuidance, localizeRasa, localizeDietCategory } from '../i18n/contentI18n'
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

// Colours mirror the canonical dosha tokens. `ink` is the darkened pair used
// for the identity accents (eyebrow, rule, category labels) on the oat ground;
// `tint` backs the rule + seasonal callouts.
const DOSHA_COLORS = {
  vata:  { gradient: 'from-[#35708f] to-[#6fa0b8]', accent: 'text-vata',  bg: 'bg-[#e7eff3]', ink: '#2c5f79', tint: '#e7eff3', ruleIcon: 'schedule' },
  pitta: { gradient: 'from-[#9e5720] to-[#c98a4e]', accent: 'text-pitta', bg: 'bg-[#f4e9db]', ink: '#83471a', tint: '#f4e9db', ruleIcon: 'schedule' },
  kapha: { gradient: 'from-[#467539] to-[#7ba86b]', accent: 'text-kapha', bg: 'bg-[#e9f0e5]', ink: '#3a6130', tint: '#e9f0e5', ruleIcon: 'restaurant' },
}

const DOSHA_LABELS = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' }

// Section header: a hairline + an 11px label + a serif title. Air between
// sections instead of a nested card — the Daylight "answer, then detail" move.
function SectionHead({ label, title, hairline = true }) {
  return (
    <div className={`px-5 ${hairline ? 'mt-7 pt-6 border-t border-outline-variant/40' : 'mt-6'}`}>
      {label && <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest">{label}</p>}
      <h2 className={`font-headline text-xl text-on-surface leading-tight ${label ? 'mt-1' : ''}`}>{title}</h2>
    </div>
  )
}

// Hairline rows, not a card-in-card: category label + text separated by a rule.
function CategoryRows({ items, ink }) {
  return (
    <div className="mt-1">
      {Object.entries(items).map(([category, text]) => (
        <div key={category} className="flex gap-3.5 py-2.5 border-t border-outline-variant/30 first:border-t-0">
          <p className="font-label text-[11px] uppercase tracking-wider w-[78px] flex-shrink-0 pt-0.5" style={{ color: ink }}>
            {localizeDietCategory(category)}
          </p>
          <p className="font-body text-[13.5px] text-on-surface-variant leading-relaxed flex-1">{text}</p>
        </div>
      ))}
    </div>
  )
}

// Collapsible section — the depth is one tap away, so the default page stays
// scannable instead of a wall of prose. Header = icon + label + a one-line
// summary; body reveals on tap. Same progressive-disclosure pattern as the
// Dosha profile's deep dives.
function Accordion({ icon, label, summary, ink, isOpen, onToggle, children }) {
  return (
    <div className="border-t border-outline-variant/40">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-3 py-4 text-left active:opacity-70 transition-opacity"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-lg flex-shrink-0" style={{ color: ink }}>{icon}</span>
        <span className="flex-1 min-w-0">
          <span className="block font-body text-[15px] font-medium text-on-surface leading-tight">{label}</span>
          {summary && <span className="block font-body text-xs text-on-surface-variant/70 mt-0.5 truncate">{summary}</span>}
        </span>
        <span
          aria-hidden="true"
          className={`material-symbols-outlined text-on-surface-variant/40 text-xl flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>
      {isOpen && <div className="pb-5 pl-9 pr-1">{children}</div>}
    </div>
  )
}

export default function DietaryGuidancePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { profile } = useAuth()
  useScrollDepth('dietary_guidance')

  const userDosha = profile?.dosha_details?.primary || profile?.dosha?.toLowerCase() || 'vata'
  const [activeDosha, setActiveDosha] = useState(userDosha)
  const guide = localizeDietaryGuidance(DIETARY_GUIDANCE[activeDosha])

  // Which deep-dive sections are open. Reset when the dosha changes so a new
  // tab starts clean (scannable) rather than inheriting the last one's state.
  const [open, setOpen] = useState(() => new Set())
  const toggle = id => setOpen(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  useEffect(() => {
    screen('dietary_guidance', { dosha_primary: userDosha })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!guide) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <p className="font-body text-on-surface-variant">{t('dietary.unknownDosha', { dosha: activeDosha })}</p>
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
          aria-label={t('dietary.goBack')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant active:scale-90"
        >
          <span aria-hidden="true" className="material-symbols-outlined">arrow_back</span>
        </button>
        <p className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant">{t('dietary.title')}</p>
        <div className="w-9 h-9" />
      </div>

      {/* ── Answer — the verdict, then the one rule that matters. Type-led,
           not a big gradient card. ── */}
      <div className="px-5 pt-3 stagger-1">
        <p className="font-label text-[11px] uppercase tracking-widest mb-2" style={{ color: colors.ink }}>
          {t('dietary.forConstitution', { dosha: DOSHA_LABELS[activeDosha] })}
        </p>
        <h1 className="font-headline text-[2rem] leading-[1.05] tracking-tight text-on-surface">
          {t(`dietary.answer.${activeDosha}.headline`)}
        </h1>
        <p className="font-body text-[15px] text-on-surface-variant leading-relaxed mt-3">
          {guide.principle}
        </p>
        <div className="flex items-start gap-3 mt-4 rounded-2xl px-4 py-3" style={{ backgroundColor: colors.tint }}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg flex-shrink-0" style={{ color: colors.ink }}>{colors.ruleIcon}</span>
          <p className="font-body text-sm leading-relaxed" style={{ color: colors.ink }}>{t(`dietary.answer.${activeDosha}.rule`)}</p>
        </div>
      </div>

      {/* Dosha switch */}
      <div className="px-5 mt-5 flex gap-2 stagger-2">
        {['vata', 'pitta', 'kapha'].map(d => (
          <button
            key={d}
            onClick={() => {
              track(EVENTS.CTA_CLICKED, { cta_id: 'dietary_dosha_tab', route_name: 'dietary_guidance', target_dosha: d })
              setActiveDosha(d)
              setOpen(new Set())
            }}
            className={`flex-1 py-2 rounded-full font-label text-[11px] uppercase tracking-wider transition-all ${
              activeDosha === d ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
            }`}
            aria-pressed={activeDosha === d}
          >
            {DOSHA_LABELS[d]}
          </button>
        ))}
      </div>

      {/* ── At a glance — favour / ease off. One genuinely-bounded object,
           split pine (favour) / clay (ease off). ── */}
      <SectionHead label={t('dietary.atAGlance')} title={t('dietary.favourEaseOff')} hairline={false} />
      <div className="px-5 mt-3 stagger-3">
        <div className="grid grid-cols-2 rounded-2xl border border-outline-variant/40 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <span aria-hidden="true" className="material-symbols-outlined text-pine text-base">eco</span>
              <p className="font-label text-[11px] font-semibold uppercase tracking-wider text-pine">{t('dietary.favourShort')}</p>
            </div>
            <ul className="flex flex-col gap-2">
              {guide.tastes.favor.map(taste => (
                <li key={taste} className="flex items-start gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-pine text-[15px] mt-0.5">check</span>
                  <span className="font-body text-[13px] text-on-surface-variant leading-snug first-letter:uppercase">{taste}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 border-l border-outline-variant/40">
            <div className="flex items-center gap-1.5 mb-3">
              <span aria-hidden="true" className="material-symbols-outlined text-clay text-base">block</span>
              <p className="font-label text-[11px] font-semibold uppercase tracking-wider text-clay">{t('dietary.easeOff')}</p>
            </div>
            <ul className="flex flex-col gap-2">
              {guide.tastes.avoid.map(taste => (
                <li key={taste} className="flex items-start gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-clay text-[15px] mt-0.5">close</span>
                  <span className="font-body text-[13px] text-on-surface-variant leading-snug first-letter:uppercase">{taste}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="font-label text-[11px] text-on-surface-variant/70 uppercase tracking-wider mt-3 text-center">
          {t('dietary.tastesPacify', { dosha: DOSHA_LABELS[activeDosha] })}
        </p>
      </div>

      {/* Right now — seasonal. Short & timely, kept in the open. */}
      <div className="px-5 mt-6">
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ backgroundColor: colors.tint }}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg flex-shrink-0" style={{ color: colors.ink }}>wb_sunny</span>
          <div>
            <p className="font-label text-[11px] uppercase tracking-widest mb-1" style={{ color: colors.ink }}>{t('dietary.rightNow')}</p>
            <p className="font-body text-[13.5px] text-on-surface leading-relaxed">{guide.seasonal}</p>
          </div>
        </div>
      </div>

      {/* ── The detail — collapsed by default so the page stays scannable
           instead of a wall of prose. Tap a row to reveal it. ── */}
      <div className="px-5 mt-7">
        <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-1">{t('dietary.theDetail')}</p>

        <Accordion
          icon="eco" ink={colors.ink}
          label={t('dietary.foodsToFavor')}
          summary={Object.keys(guide.favor).map(localizeDietCategory).join(' · ')}
          isOpen={open.has('favor')} onToggle={() => toggle('favor')}
        >
          <CategoryRows items={guide.favor} ink={colors.ink} />
        </Accordion>

        <Accordion
          icon="block" ink={colors.ink}
          label={t('dietary.foodsToAvoid')}
          summary={t('dietary.foodsAvoidSummary')}
          isOpen={open.has('avoid')} onToggle={() => toggle('avoid')}
        >
          <p className="font-body text-[13.5px] text-on-surface-variant leading-relaxed italic mb-2.5">{guide.avoid.generally}</p>
          <ul className="flex flex-col">
            {guide.avoid.specific.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 py-1">
                <span aria-hidden="true" className="material-symbols-outlined text-clay text-[15px] mt-0.5">close</span>
                <span className="font-body text-[13.5px] text-on-surface-variant leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </Accordion>

        <Accordion
          icon="restaurant" ink={colors.ink}
          label={t('dietary.howToEat')}
          summary={t('dietary.habitsCount', { count: guide.eatingHabits.length })}
          isOpen={open.has('how')} onToggle={() => toggle('how')}
        >
          <ul className="flex flex-col">
            {guide.eatingHabits.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 py-1">
                <span aria-hidden="true" className="material-symbols-outlined text-pine text-base mt-0.5">check_circle</span>
                <span className="font-body text-[13.5px] text-on-surface-variant leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </Accordion>

        <Accordion
          icon="menu_book" ink={colors.ink}
          label={t('dietary.sixTastes')}
          summary={t('dietary.referenceLabel')}
          isOpen={open.has('rasas')} onToggle={() => toggle('rasas')}
        >
          <p className="font-body text-[13px] text-on-surface-variant/70 leading-relaxed mb-2">{t('dietary.sixTastesSub')}</p>
          {Object.entries(RASAS).map(([key, r]) => {
            const lr = localizeRasa(key, r)
            return (
              <div key={key} className="flex items-baseline justify-between gap-4 py-2 border-t border-outline-variant/30 first:border-t-0">
                <p className="font-body text-[13px] text-on-surface flex-shrink-0">
                  {r.sanskrit} <span className="text-on-surface-variant/60 italic capitalize">({key})</span>
                </p>
                <p className="font-body text-xs text-on-surface-variant/70 text-right leading-snug">{lr.examples}</p>
              </div>
            )
          })}
        </Accordion>
      </div>

      {/* Bridges to the reviewed food database + meals */}
      <div className="px-5 mt-6 flex flex-col gap-2">
        <button
          onClick={() => {
            track(EVENTS.CTA_CLICKED, { cta_id: 'dietary_to_food_search', route_name: 'dietary_guidance' })
            navigate('/discover')
          }}
          className="flex items-center gap-3 bg-surface-container-low rounded-2xl p-3.5 text-left active:scale-[0.99] transition-all border border-outline-variant/30"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-xl">search</span>
          <span className="flex-1 min-w-0">
            <span className="block font-body text-sm font-semibold text-on-surface">{t('diet.sectionTitle')}</span>
            <span className="block font-body text-xs text-on-surface-variant/70">{t('dietary.lookUpFood')}</span>
          </span>
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
        </button>
        <button
          onClick={() => {
            track(EVENTS.CTA_CLICKED, { cta_id: 'dietary_to_meals', route_name: 'dietary_guidance' })
            navigate('/meals')
          }}
          className="flex items-center gap-3 bg-surface-container-low rounded-2xl p-3.5 text-left active:scale-[0.99] transition-all border border-outline-variant/30"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-xl">restaurant_menu</span>
          <span className="flex-1 min-w-0">
            <span className="block font-body text-sm font-semibold text-on-surface">{t('meals.title')}</span>
            <span className="block font-body text-xs text-on-surface-variant/70">{t('meals.entryHelp')}</span>
          </span>
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
        </button>
      </div>

      {/* Source citation */}
      <div className="px-5 mt-6 mb-2">
        <p className="font-label text-[10px] text-on-surface-variant/60 leading-relaxed">
          {t('dietary.sourceLabel')} {guide.source.text} {guide.source.verse}. {guide.source.note}
        </p>
      </div>
    </div>
  )
}
