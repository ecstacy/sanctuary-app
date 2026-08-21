// ─────────────────────────────────────────────────────────────────────────────
//  doshaProfilePrimitives — the small, dependency-free pieces shared by the
//  dosha profile and its deep-dive section pages. Kept in their own module so
//  DoshaProfileContent and doshaDetailSections can both import them WITHOUT
//  importing each other (which would be a circular dependency).
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared dosha display data ────────────────────────────────────────────────
export const DOSHA_DATA = {
  vata: {
    name: 'Vata',
    element: 'Air + Ether',
    emoji: 'wind_power',
    gradient: 'from-[#35708f] to-[#6fa0b8]',
    bgColor: 'bg-[#e7eff3]',
    textColor: 'text-vata',
    barColor: 'bg-vata',
    accentHex: '#2c5f79',
    tagline: 'The Creative Whirlwind',
    description: 'You are movement itself — quick-thinking, imaginative, and beautifully spontaneous. Like the wind, you bring change and inspiration wherever you go.',
    strengths: ['Creative & artistic', 'Quick learner', 'Adaptable & flexible', 'Enthusiastic spirit'],
    balanceTips: ['Ground yourself with warm, cooked foods', 'Establish a calming daily routine', 'Prioritize warmth and rest', 'Practice slow, grounding yoga'],
    qualities: ['Light', 'Dry', 'Cold', 'Mobile', 'Subtle'],
    season: 'Autumn & Early Winter',
    timeOfDay: '2 AM – 6 AM & 2 PM – 6 PM',
    taste: 'Sweet, Sour & Salty foods pacify Vata',
    yoga: "Slow, grounding flows — Tadasana, Warrior I & II, Child's Pose, Savasana",
    meditation: 'Body scan & grounding visualizations to anchor the restless mind',
  },
  pitta: {
    name: 'Pitta',
    element: 'Fire + Water',
    emoji: 'local_fire_department',
    gradient: 'from-[#9e5720] to-[#c98a4e]',
    bgColor: 'bg-[#f4e9db]',
    textColor: 'text-pitta',
    barColor: 'bg-pitta',
    accentHex: '#83471a',
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
    gradient: 'from-[#467539] to-[#7ba86b]',
    bgColor: 'bg-[#e9f0e5]',
    textColor: 'text-kapha',
    barColor: 'bg-kapha',
    accentHex: '#3a6130',
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

export function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// A collapsible section — header (icon + label + one-line summary) reveals its
// body on tap. The progressive-disclosure primitive of the dosha deep dives.
export function ExpandableSection({ id, icon, label, summary, accentClass = 'text-on-surface-variant', isOpen, onToggle, children }) {
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

// A stacked label + value row (label above value, never a fixed side column —
// long localized labels can't overflow into the value).
export function LabelValueRow({ label, value }) {
  return (
    <div className="py-3 border-b border-outline-variant/10 last:border-0 last:pb-0 first:pt-1">
      <p className="font-label text-[11px] uppercase tracking-[0.15em] text-on-surface-variant mb-1">{label}</p>
      <p className="font-body text-sm text-on-surface leading-relaxed">{value}</p>
    </div>
  )
}

export function BulletList({ items, iconName = 'check_circle', iconClass = 'text-primary' }) {
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
