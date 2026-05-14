import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DOSHAS } from '../data/ayurveda/dosha-prakriti'
import { track, EVENTS } from '../lib/track'


// ─── Dosha Data ─────────────────────────────────────────────────────────────

const DOSHA_DATA = {
  vata: {
    name: 'Vata',
    element: 'Air + Ether',
    emoji: 'wind_power',
    gradient: 'from-[#7b93a8] to-[#b8d4e8]',
    bgColor: 'bg-[#e8f0f6]',
    textColor: 'text-[#3d5a73]',
    barColor: 'bg-[#7b93a8]',
    accentHex: '#3d5a73',
    tagline: 'The Creative Whirlwind',
    description: 'You are movement itself — quick-thinking, imaginative, and beautifully spontaneous. Like the wind, you bring change and inspiration wherever you go.',
    strengths: ['Creative & artistic', 'Quick learner', 'Adaptable & flexible', 'Enthusiastic spirit'],
    balanceTips: ['Ground yourself with warm, cooked foods', 'Establish a calming daily routine', 'Prioritize warmth and rest', 'Practice slow, grounding yoga'],
    qualities: ['Light', 'Dry', 'Cold', 'Mobile', 'Subtle'],
    season: 'Autumn & Early Winter',
    timeOfDay: '2 AM – 6 AM & 2 PM – 6 PM',
    taste: 'Sweet, Sour & Salty foods pacify Vata',
    yoga: 'Slow, grounding flows — Tadasana, Warrior I & II, Child\'s Pose, Savasana',
    meditation: 'Body scan & grounding visualizations to anchor the restless mind',
  },
  pitta: {
    name: 'Pitta',
    element: 'Fire + Water',
    emoji: 'local_fire_department',
    gradient: 'from-[#c47a3a] to-[#f0c987]',
    bgColor: 'bg-[#fef3e2]',
    textColor: 'text-[#8b5a2b]',
    barColor: 'bg-[#c47a3a]',
    accentHex: '#8b5a2b',
    tagline: 'The Fierce Transformer',
    description: 'You are fire incarnate — sharp, determined, and brilliantly focused. Your intensity transforms everything it touches.',
    strengths: ['Natural leader', 'Sharp intellect', 'Courageous & bold', 'Strong digestion'],
    balanceTips: ['Cool down with fresh, sweet foods', 'Avoid overworking — rest is not weakness', 'Spend time near water', 'Practice cooling breathwork'],
    qualities: ['Hot', 'Sharp', 'Light', 'Oily', 'Liquid'],
    season: 'Summer & Late Spring',
    timeOfDay: '10 AM – 2 PM & 10 PM – 2 AM',
    taste: 'Sweet, Bitter & Astringent foods pacify Pitta',
    yoga: 'Cooling, non-competitive flows — Moon Salutation, Forward Folds, Twists, Pigeon Pose',
    meditation: 'Loving-kindness & cooling breath (Sheetali) to calm the inner fire',
  },
  kapha: {
    name: 'Kapha',
    element: 'Earth + Water',
    emoji: 'landscape',
    gradient: 'from-[#6b8f5e] to-[#b8d4a8]',
    bgColor: 'bg-[#edf5e8]',
    textColor: 'text-[#3d5e34]',
    barColor: 'bg-[#6b8f5e]',
    accentHex: '#3d5e34',
    tagline: 'The Steady Mountain',
    description: 'You are earth embodied — steady, nurturing, and deeply resilient. Your calm presence is a sanctuary for everyone around you.',
    strengths: ['Loyal & compassionate', 'Incredible endurance', 'Strong memory', 'Natural caretaker'],
    balanceTips: ['Embrace variety and stimulation', 'Move daily — even gentle walks count', 'Favor warm, spiced foods', 'Wake early and resist oversleeping'],
    qualities: ['Heavy', 'Slow', 'Cool', 'Oily', 'Smooth'],
    season: 'Late Winter & Spring',
    timeOfDay: '6 AM – 10 AM & 6 PM – 10 PM',
    taste: 'Pungent, Bitter & Astringent foods pacify Kapha',
    yoga: 'Vigorous, energizing flows — Sun Salutation, Backbends, Warrior III, Camel Pose',
    meditation: 'Energizing breathwork (Kapalabhati) & walking meditation to spark vitality',
  },
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── ExpandableSection ─────────────────────────────────────────────────
// Tap-to-expand card. Lets us layer deeper content (body type, mind
// type, imbalance signs, etc.) under the surface so the page stays
// scannable for users who don't want the full Charaka digest.
function ExpandableSection({ id, icon, label, summary, accentClass = 'text-on-surface-variant', isOpen, onToggle, children }) {
  return (
    <div className="bg-surface-container-low rounded-lg overflow-hidden mb-3">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-3 text-left active:bg-surface-container/50"
        aria-expanded={isOpen}
        aria-controls={`exp-${id}`}
      >
        <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
          <span aria-hidden="true" className={`material-symbols-outlined text-base ${accentClass}`}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-sm text-on-surface leading-tight">{label}</p>
          {summary && (
            <p className="font-body text-xs text-on-surface-variant/70 mt-0.5 leading-snug">{summary}</p>
          )}
        </div>
        <span
          aria-hidden="true"
          className={`material-symbols-outlined text-on-surface-variant/40 text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>
      {isOpen && (
        <div id={`exp-${id}`} className="px-5 pb-5 pt-1 border-t border-outline-variant/10">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Section renderers — small reusable building blocks ──────────────
// Label stacks ABOVE the value so long values don't wrap awkwardly
// against a narrow label column. Each block reads like a glossary
// entry rather than a squished 2-column grid.
function LabelValueRow({ label, value }) {
  return (
    <div className="py-3 border-b border-outline-variant/10 last:border-0 last:pb-0 first:pt-1">
      <p className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/60 mb-1">{label}</p>
      <p className="font-body text-sm text-on-surface leading-relaxed">{value}</p>
    </div>
  )
}

function BulletList({ items, iconName = 'check_circle', iconClass = 'text-primary' }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span aria-hidden="true" className={`material-symbols-outlined text-[14px] mt-0.5 ${iconClass}`}>{iconName}</span>
          <span className="font-body text-sm text-on-surface leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}

// ─── ThemeSection ─────────────────────────────────────────────────────
// Top-level chapter heading for the dosha profile page. Establishes
// clear "chapters" so the page reads as a guided progression instead
// of a flat stack of cards. Generous top padding gives breathing
// room between themes.
function ThemeSection({ kicker, title, lede, children }) {
  return (
    <section className="mb-10">
      <div className="px-1 mb-5 mt-6">
        {kicker && (
          <p className="font-label text-[10px] font-semibold uppercase tracking-[0.22em] text-primary mb-2">{kicker}</p>
        )}
        <h2 className="font-headline text-[28px] text-on-surface leading-tight mb-2">{title}</h2>
        {lede && (
          <p className="font-body text-[15px] text-on-surface-variant/90 leading-relaxed max-w-prose">{lede}</p>
        )}
      </div>
      {children}
    </section>
  )
}


// ─── Component ──────────────────────────────────────────────────────────────

export default function DoshaProfilePage() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const doshaLabel = profile?.dosha || null
  const details = profile?.dosha_details || null

  // Parse dosha info from profile
  const primary = details?.primary || doshaLabel?.toLowerCase() || null
  const secondary = details?.secondary || null
  const tertiary = details?.tertiary || null
  const percentages = details?.percentages || null

  // If no dosha saved, show discovery prompt
  if (!doshaLabel || !primary) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-8 stagger-1">
          <span className="material-symbols-outlined text-primary text-4xl">spa</span>
        </div>
        <h2 className="font-headline text-2xl text-on-surface text-center mb-3 stagger-2">
          Your Dosha Awaits
        </h2>
        <p className="font-body text-sm text-on-surface-variant text-center leading-relaxed mb-8 max-w-xs stagger-3">
          Discover your unique Ayurvedic constitution through our guided quiz and unlock personalized wellness insights.
        </p>
        <button
          onClick={() => navigate('/quiz')}
          className="w-full max-w-xs py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all stagger-4"
        >
          Take the Dosha Quiz
        </button>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-xs text-on-surface-variant/50 font-label uppercase tracking-widest stagger-5"
        >
          Go back
        </button>
      </div>
    )
  }

  const primaryData = DOSHA_DATA[primary]
  const secondaryData = secondary ? DOSHA_DATA[secondary] : null
  const tertiaryData = tertiary ? DOSHA_DATA[tertiary] : null
  const isTridoshic = doshaLabel === 'Tridoshic'
  const isDual = doshaLabel.includes('-')

  // Rich Charaka-sourced data for the primary dosha. Provides the
  // Sanskrit gunas, body type, mind characteristics, imbalance signs,
  // triggers, and pacification approach that the local DOSHA_DATA
  // didn't capture. Falls back to null for Tridoshic prakriti
  // (which doesn't map to a single dosha in DOSHAS).
  const richDosha = DOSHAS[primary] || null

  // Expandable section state — Set of section ids currently open.
  // Tracking it as a Set lets multiple sections stay open if the
  // user wants to compare body + mind side by side.
  const [expanded, setExpanded] = useState(new Set())
  function toggle(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else {
        next.add(id)
        track(EVENTS.CONTENT_IMPRESSION, {
          surface:      'dosha_profile',
          content_type: 'deep_dive',
          content_id:   id,
          primary_dosha: primary,
        })
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-20">

      {/* Gradient Hero */}
      <div className={`relative bg-gradient-to-b ${primaryData.gradient} px-6 pt-12 pb-16 overflow-hidden`}>

        {/* Decorative elements */}
        <div className="absolute top-10 right-6 w-28 h-28 rounded-full bg-white/8 animate-quiz-float" />
        <div className="absolute bottom-16 left-4 w-16 h-16 rounded-full bg-white/8 animate-quiz-float-delay" />
        <div className="absolute top-1/2 right-1/3 w-10 h-10 rounded-full bg-white/5 animate-quiz-float" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-5 z-20 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined text-white text-lg">arrow_back</span>
        </button>

        <div className="relative z-10 text-center mt-4 stagger-1">
          <p className="font-label text-[10px] text-white/60 uppercase tracking-widest mb-2">
            Your Dosha Type
          </p>
          <h1 className="font-headline text-5xl text-white leading-none mb-2">
            {doshaLabel}
          </h1>
          <p className="font-headline italic text-lg text-white/80 mb-5">
            {isTridoshic ? 'The Rare Equilibrium' : primaryData.tagline}
          </p>
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="material-symbols-outlined text-white text-sm">{primaryData.emoji}</span>
            <span className="font-label text-xs text-white/90 uppercase tracking-wider">
              {isTridoshic ? 'All Five Elements' : primaryData.element}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8">

        {/* ═══════════════════════════════════════════════════════════
            THEME 1 — WHO YOU ARE
            Identity content: composition, primary description, secondary
            description, qualities, body, mind, natural strengths.
            ═══════════════════════════════════════════════════════════ */}
        <ThemeSection
          kicker="Chapter 1"
          title="Who you are"
          lede="The elements, qualities, and patterns that shape your constitution."
        >

        {/* Dosha Composition Card */}
        {percentages && (
          <div className="bg-surface rounded-lg p-6 shadow-md mb-5 stagger-2">
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-5">
              Your Dosha Composition
            </p>

            {[
              { key: primary, data: primaryData, pct: percentages[primary] },
              ...(secondaryData ? [{ key: secondary, data: secondaryData, pct: percentages[secondary] }] : []),
              ...(tertiaryData ? [{ key: tertiary, data: tertiaryData, pct: percentages[tertiary] }] : []),
            ].map(({ key, data, pct }, i) => (
              <div key={key} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ color: data.accentHex }}>
                      {data.emoji}
                    </span>
                    <span className="font-body font-semibold text-sm text-on-surface">
                      {data.name}
                    </span>
                    <span className="font-label text-[9px] text-on-surface-variant/50 uppercase">
                      {data.element}
                    </span>
                  </div>
                  <span className="font-headline text-lg text-on-surface">{pct}%</span>
                </div>
                <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${data.barColor} transition-all duration-1000 ease-out`}
                    style={{ width: `${pct}%`, transitionDelay: `${i * 200}ms` }}
                  />
                </div>
              </div>
            ))}

            <p className="font-body text-xs text-on-surface-variant/50 italic mt-4 leading-relaxed">
              {isTridoshic
                ? 'A rare and balanced constitution. All three doshas are equally expressed in your nature.'
                : isDual
                ? `You express ${capitalize(primary)} and ${capitalize(secondary)} almost equally. Your constitution shifts with seasons and lifestyle.`
                : (() => {
                    const pPct = percentages?.[primary] || 0
                    const sPct = percentages?.[secondary] || 0
                    const gap = pPct - sPct
                    if (gap >= 40) return `${capitalize(primary)} is overwhelmingly dominant in your constitution. The other doshas play a minor supporting role.`
                    if (gap >= 20) return `${capitalize(primary)} is clearly your leading dosha. ${capitalize(secondary)} (${sPct}%) plays a moderate background role.`
                    return `${capitalize(primary)} leads your constitution, with ${capitalize(secondary)} (${sPct}%) as a notable secondary influence.`
                  })()
              }
            </p>
          </div>
        )}

        {/* Primary Dosha Deep Dive */}
        <div className={`${primaryData.bgColor} rounded-lg p-6 mb-5 stagger-3`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>{primaryData.emoji}</span>
            <p className="font-label text-[10px] uppercase tracking-widest" style={{ color: primaryData.accentHex }}>
              {isTridoshic ? 'Your Balanced Nature' : `Dominant: ${primaryData.name}`}
            </p>
          </div>
          <p className="font-body text-sm text-on-surface leading-relaxed">
            {primaryData.description}
          </p>
        </div>

        {/* Secondary Dosha */}
        {secondaryData && !isTridoshic && (
          <div className="bg-surface-container rounded-lg p-6 mb-5 stagger-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">{secondaryData.emoji}</span>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
                Secondary: {secondaryData.name}
              </p>
            </div>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              {secondaryData.description}
            </p>
          </div>
        )}

        {/* ── Qualities (Gunas) — Sanskrit + English + meaning ─────────
            Rich source data lives in DOSHAS[primary].qualities.
            Each guna is a foundational Ayurvedic concept; showing the
            Sanskrit name + the translated meaning helps users build
            real vocabulary instead of just memorizing English
            adjectives. Falls back to the legacy chips for Tridoshic. */}
        <div className="bg-surface-container rounded-lg p-6 mb-5 stagger-4">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
            {primaryData.name} Qualities (Gunas)
          </p>
          {richDosha?.qualities ? (
            // Glossary-style list: Sanskrit and English on one line,
            // brief note underneath. Each entry separated by a thin
            // divider — feels like reading a definition list, not 7
            // stacked tiles. Much lighter visual weight.
            <div className="divide-y divide-outline-variant/10">
              {richDosha.qualities.map((q, i) => (
                <div key={i} className="py-3 first:pt-1 last:pb-1">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <p className={`font-body font-semibold text-sm ${primaryData.textColor}`}>
                      {capitalize(q.english)}
                    </p>
                    <span className="font-label text-[10px] text-on-surface-variant/40">·</span>
                    <p className="font-body text-xs italic text-on-surface-variant/70">
                      {q.sanskrit}
                    </p>
                  </div>
                  {q.note && (
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">{q.note}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {primaryData.qualities.map((q, i) => (
                <span key={i} className={`${primaryData.bgColor} ${primaryData.textColor} px-3 py-1.5 rounded-full font-label text-xs font-medium`}>
                  {q}
                </span>
              ))}
            </div>
          )}
          {richDosha?.source?.verse && (
            <p className="font-label text-[10px] text-on-surface-variant/50 leading-relaxed mt-4 pt-3 border-t border-outline-variant/10">
              Source: Charaka Samhita {richDosha.source.verse}
            </p>
          )}
        </div>

        {/* ── Deep dive — tap to learn more about your nature ────────
            Three expandable cards layered under one heading. The
            top-level page stays scannable; users who want the full
            picture can open any/all of these. Each renders Charaka-
            sourced content from src/data/ayurveda/dosha-prakriti.js. */}
        {/* ── Body + Mind expandables (still part of Chapter 1) ─── */}
        {richDosha && !isTridoshic && (
          <div className="mb-5 stagger-5">
            <ExpandableSection
              id="body"
              icon="accessibility_new"
              label={`Your ${primaryData.name} body`}
              summary="Build, skin, hair, digestion, sleep, energy"
              accentClass={primaryData.textColor}
              isOpen={expanded.has('body')}
              onToggle={() => toggle('body')}
            >
              <div className="pt-3">
                {richDosha.body && (
                  <>
                    {richDosha.body.build      && <LabelValueRow label="Build"     value={richDosha.body.build} />}
                    {richDosha.body.skin       && <LabelValueRow label="Skin"      value={richDosha.body.skin} />}
                    {richDosha.body.hair       && <LabelValueRow label="Hair"      value={richDosha.body.hair} />}
                    {richDosha.body.face       && <LabelValueRow label="Face"      value={richDosha.body.face} />}
                    {richDosha.body.digestion  && <LabelValueRow label="Digestion" value={richDosha.body.digestion} />}
                    {richDosha.body.sleep      && <LabelValueRow label="Sleep"     value={richDosha.body.sleep} />}
                    {richDosha.body.energy     && <LabelValueRow label="Energy"    value={richDosha.body.energy} />}
                  </>
                )}
              </div>
            </ExpandableSection>

            <ExpandableSection
              id="mind"
              icon="psychology"
              label={`Your ${primaryData.name} mind`}
              summary="How you show up — at your best and when you're off"
              accentClass={primaryData.textColor}
              isOpen={expanded.has('mind')}
              onToggle={() => toggle('mind')}
            >
              <div className="pt-3 space-y-4">
                <div>
                  <p className={`font-label text-[10px] uppercase tracking-wider mb-2 ${primaryData.textColor}`}>In balance</p>
                  <BulletList items={richDosha.mind.balanced} iconName="check_circle" iconClass={primaryData.textColor} />
                </div>
                <div>
                  <p className="font-label text-[10px] uppercase tracking-wider mb-2 text-on-surface-variant/60">When out of balance</p>
                  <BulletList items={richDosha.mind.imbalanced} iconName="error" iconClass="text-on-surface-variant/40" />
                </div>
              </div>
            </ExpandableSection>
          </div>
        )}

        {/* Natural Strengths — closes out "Who you are" with the
            inspirational identity list. */}
        <div className="bg-surface-container rounded-lg p-6 mb-5 stagger-5">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
            Your natural strengths
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ...primaryData.strengths,
              ...(secondaryData && isDual ? secondaryData.strengths.slice(0, 2) : []),
            ].map((strength, i) => (
              <div key={i} className="flex items-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-primary text-sm">check_circle</span>
                <span className="font-body text-xs text-on-surface">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        </ThemeSection>
        {/* ═══════════════════════════════════════════════════════════
            THEME 2 — STAYING IN BALANCE
            What to watch for, what aggravates, and how to find the
            balanced state. The actionable arc of the page.
            ═══════════════════════════════════════════════════════════ */}
        <ThemeSection
          kicker="Chapter 2"
          title="Staying in balance"
          lede="Early signs of imbalance, common triggers, and Charaka's guidance for returning to centre."
        >

        {richDosha && !isTridoshic && (
          <div className="mb-5">
            <ExpandableSection
              id="signs"
              icon="health_and_safety"
              label="Signs to watch for"
              summary={`Common ${primaryData.name} imbalance symptoms`}
              accentClass={primaryData.textColor}
              isOpen={expanded.has('signs')}
              onToggle={() => toggle('signs')}
            >
              <div className="pt-3">
                <p className="font-body text-xs text-on-surface-variant leading-relaxed mb-3">
                  When your dominant dosha runs high, these are the early signals. None require alarm — they're invitations to lean into the balancing practices below.
                </p>
                <BulletList items={richDosha.imbalanceSigns} iconName="circle" iconClass="text-on-surface-variant/40" />
              </div>
            </ExpandableSection>

            <ExpandableSection
              id="triggers"
              icon="warning"
              label="What aggravates you"
              summary="Habits and seasons that push you out of balance"
              accentClass={primaryData.textColor}
              isOpen={expanded.has('triggers')}
              onToggle={() => toggle('triggers')}
            >
              <div className="pt-3">
                <BulletList items={richDosha.triggers} iconName="trending_up" iconClass="text-on-surface-variant/50" />
              </div>
            </ExpandableSection>

            <ExpandableSection
              id="pacify"
              icon="spa"
              label="How to find balance"
              summary={richDosha.pacification?.principle ? richDosha.pacification.principle.split('.')[0] + '.' : 'Lifestyle adjustments to pacify your dosha'}
              accentClass={primaryData.textColor}
              isOpen={expanded.has('pacify')}
              onToggle={() => toggle('pacify')}
            >
              <div className="pt-3 space-y-3">
                {richDosha.pacification?.principle && (
                  <div className={`rounded-xl px-4 py-3 ${primaryData.bgColor}`}>
                    <p className={`font-body text-sm leading-relaxed ${primaryData.textColor}`}>
                      {richDosha.pacification.principle}
                    </p>
                  </div>
                )}
                {richDosha.pacification?.lifestyle && (
                  <BulletList items={richDosha.pacification.lifestyle} iconName="check_circle" iconClass={primaryData.textColor} />
                )}
              </div>
            </ExpandableSection>
          </div>
        )}

        {/* Stay In Balance */}
        <div className="bg-surface-container-low rounded-lg p-6 mb-5 stagger-5">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
            Stay In Balance
          </p>
          <div className="flex flex-col gap-3">
            {primaryData.balanceTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`material-symbols-outlined text-base mt-0.5 ${primaryData.textColor}`}>spa</span>
                <p className="font-body text-xs text-on-surface leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Yoga & Movement — practice prescription, still in Chapter 2 */}
        <div className={`${primaryData.bgColor} rounded-lg p-6 mb-5`}>
          <div className="flex items-center gap-2 mb-3">
            <span aria-hidden="true" className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>self_care</span>
            <p className="font-label text-[10px] uppercase tracking-widest" style={{ color: primaryData.accentHex }}>
              Yoga & Movement
            </p>
          </div>
          <p className="font-body text-sm text-on-surface leading-relaxed">
            {primaryData.yoga}
          </p>
        </div>

        {/* Meditation & Breathwork — closes Chapter 2 */}
        <div className="bg-surface-container rounded-lg p-6 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">air</span>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
              Meditation & Breathwork
            </p>
          </div>
          <p className="font-body text-sm text-on-surface leading-relaxed">
            {primaryData.meditation}
          </p>
        </div>

        </ThemeSection>
        {/* ═══════════════════════════════════════════════════════════
            THEME 3 — LIVE BY YOUR DOSHA
            Daily integration: lifestyle guide + deep-dive pages.
            ═══════════════════════════════════════════════════════════ */}
        <ThemeSection
          kicker="Chapter 3"
          title="Live by your dosha"
          lede="Translate this knowledge into daily life — the season, the hour of the day, the food on your plate."
        >

        {/* Ayurvedic Lifestyle — Season, Time, Taste */}
        <div className="bg-surface-container rounded-lg overflow-hidden mb-5">
          <div className="flex items-start gap-4 px-6 py-4">
            <div className={`w-10 h-10 rounded-full ${primaryData.bgColor} flex items-center justify-center flex-shrink-0`}>
              <span aria-hidden="true" className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>calendar_month</span>
            </div>
            <div>
              <p className="font-body font-semibold text-sm text-on-surface mb-0.5">Peak Season</p>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                {primaryData.season} — {primaryData.name} is naturally elevated during this time. Extra care is needed to stay balanced.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 px-6 py-4 border-t border-surface-container-high">
            <div className={`w-10 h-10 rounded-full ${primaryData.bgColor} flex items-center justify-center flex-shrink-0`}>
              <span aria-hidden="true" className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>schedule</span>
            </div>
            <div>
              <p className="font-body font-semibold text-sm text-on-surface mb-0.5">{primaryData.name} Hours</p>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                {primaryData.timeOfDay} — These are the hours when {primaryData.name} energy peaks in the body.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 px-6 py-4 border-t border-surface-container-high">
            <div className={`w-10 h-10 rounded-full ${primaryData.bgColor} flex items-center justify-center flex-shrink-0`}>
              <span aria-hidden="true" className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>restaurant</span>
            </div>
            <div>
              <p className="font-body font-semibold text-sm text-on-surface mb-0.5">Balancing Tastes</p>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                {primaryData.taste}
              </p>
            </div>
          </div>
        </div>

        {/* Diet + Daily Routine deep-dive CTAs.
            Chevron in the top-right reinforces that these tiles navigate,
            not just decorative cards. Tap target spans the whole tile via
            <button>, but the affordance was easy to miss without the arrow. */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/dietary')}
            aria-label="Open dietary guidance"
            className="bg-surface-container-low rounded-2xl p-4 text-left active:scale-[0.98] transition-all flex flex-col gap-2 relative"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/60 text-base absolute top-3 right-3">chevron_right</span>
            <div className="w-10 h-10 rounded-full bg-primary-container/50 flex items-center justify-center">
              <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">restaurant</span>
            </div>
            <p className="font-body font-semibold text-sm text-on-surface leading-tight">Your diet</p>
            <p className="font-body text-xs text-on-surface-variant/70 leading-snug">Foods to favor and avoid, by the six tastes</p>
          </button>
          <button
            onClick={() => navigate('/dinacharya')}
            aria-label="Open daily routine"
            className="bg-surface-container-low rounded-2xl p-4 text-left active:scale-[0.98] transition-all flex flex-col gap-2 relative"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/60 text-base absolute top-3 right-3">chevron_right</span>
            <div className="w-10 h-10 rounded-full bg-primary-container/50 flex items-center justify-center">
              <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">schedule</span>
            </div>
            <p className="font-body font-semibold text-sm text-on-surface leading-tight">Daily routine</p>
            <p className="font-body text-xs text-on-surface-variant/70 leading-snug">Charaka's 13 practices — align the day with the body's rhythm</p>
          </button>
        </div>

        </ThemeSection>

        {/* ── Footer — meta context + retake ─────────────────────── */}
        {/* About Prakriti */}
        <div className="bg-surface-container-low rounded-lg p-5 mb-5 flex items-start gap-3">
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-base mt-0.5">auto_awesome</span>
          <div>
            <p className="font-body font-semibold text-sm text-on-surface mb-1">
              Understanding Prakriti
            </p>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              In Ayurveda, your Prakriti is your birth constitution — the unique ratio of Vata, Pitta, and Kapha you were born with. It remains stable throughout life. When doshas shift due to diet, stress, or seasons, that temporary state is called Vikriti. The goal of Ayurveda is to bring Vikriti back in alignment with Prakriti.
            </p>
          </div>
        </div>

        {/* Retake quiz */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/quiz')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-container rounded-full font-label text-xs text-on-surface-variant uppercase tracking-widest active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Retake the Quiz
          </button>
        </div>

      </div>

    </div>
  )
}
