// ─────────────────────────────────────────────────────────────────────────────
//  ProtocolPage — the destination behind the Vikriti card's Plus action
//
//  When a Plus user's last 14 days of self-reports indicate elevated Vata,
//  Pitta, or Kapha, the VikritiCard surfaces a teaser. Tapping it lands
//  here: the full 3-day pacifying protocol for their specific imbalance.
//
//  ROUTING
//  ───────
//    /protocol/vata
//    /protocol/pitta
//    /protocol/kapha
//
//  PLUS GATING
//  ───────────
//  Protocols are Plus-only. Non-Plus users who reach this route (deep link,
//  URL bar, etc.) see a paywall takeover instead of the content. The
//  VikritiCard already opens the paywall sheet for non-Plus users so they
//  shouldn't normally arrive here directly, but the route-level guard is
//  the safety net.
//
//  LAYOUT
//  ──────
//  Same magazine-style design language as DoshaProfileContent:
//    1. Dosha-themed gradient hero (matches VikritiCard's accent)
//    2. "Why this protocol" prose block grounded in Charaka source
//    3. Three day-tabs at top (sticky on scroll)
//    4. Within each day: lede + 5-6 sections (Eat / Move / Breathe / Rest /
//       Mindset / Notice), each with a colored chip icon, title, bullet
//       list, optional inline note
//
//  Day state lives in the URL (?day=1) so deep-links can land on a
//  specific day and back/forward navigation works.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { getProtocol, SECTION_ICONS } from '../data/protocols'
import { useIsPremium } from '../hooks/useIsPremium'
import { track, EVENTS } from '../lib/track'
import PaywallSheet from '../components/PaywallSheet'

// Dosha visual identity — kept in sync with DoshaProfileContent.DOSHA_DATA
// so the user lands on a page that feels visually continuous with the
// VikritiCard they tapped from.
const DOSHA_THEME = {
  vata: {
    name:      'Vata',
    emoji:     'wind_power',
    gradient:  'from-[#7b93a8] to-[#b8d4e8]',
    bgColor:   'bg-[#e8f0f6]',
    textColor: 'text-[#3d5a73]',
    accentHex: '#3d5a73',
  },
  pitta: {
    name:      'Pitta',
    emoji:     'local_fire_department',
    gradient:  'from-[#c47a3a] to-[#f0c987]',
    bgColor:   'bg-[#fef3e2]',
    textColor: 'text-[#8b5a2b]',
    accentHex: '#8b5a2b',
  },
  kapha: {
    name:      'Kapha',
    emoji:     'landscape',
    gradient:  'from-[#6b8f5e] to-[#b8d4a8]',
    bgColor:   'bg-[#edf5e8]',
    textColor: 'text-[#3d5e34]',
    accentHex: '#3d5e34',
  },
}

export default function ProtocolPage() {
  const navigate = useNavigate()
  const { vikriti } = useParams()
  const protocol    = getProtocol(vikriti)
  const theme       = DOSHA_THEME[vikriti]

  const { isPremium, isLoading } = useIsPremium()
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  // Active day — URL-backed so back/forward + deep links work.
  // Clamp to [1, days.length] to defang weird query strings.
  const dayParam = parseInt(searchParams.get('day') || '1', 10)
  const activeDay = Math.min(
    Math.max(1, isNaN(dayParam) ? 1 : dayParam),
    protocol?.days?.length || 1,
  )

  function setActiveDay(d) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('day', String(d))
      return next
    }, { replace: true })
    track(EVENTS.CTA_CLICKED, {
      cta_id:  'protocol_day_tab',
      vikriti,
      day:     d,
    })
  }

  // Unknown vikriti slug — back to the home card. Shouldn't happen via
  // normal navigation; this is the deep-link / typo safety net.
  if (!protocol || !theme) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <p className="font-body text-sm text-on-surface-variant mb-4">
          Protocol not found.
        </p>
        <button
          onClick={() => navigate('/home')}
          className="px-5 py-2.5 bg-primary text-on-primary rounded-full font-label text-xs uppercase tracking-widest"
        >
          Back to home
        </button>
      </div>
    )
  }

  // ── Premium gate ────────────────────────────────────────────────────────
  // Render a paywall takeover for non-Plus users. We don't redirect away —
  // showing the teaser inline keeps the URL stable (analytics + back-button
  // friendly) and gives the user a clear path forward.
  if (!isLoading && !isPremium) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body">
        <div className={`relative bg-gradient-to-b ${theme.gradient} px-6 pt-12 pb-16 overflow-hidden`}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="absolute top-5 left-5 z-20 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-white text-lg">arrow_back</span>
          </button>
          <div className="relative z-10 text-center mt-4">
            <p className="font-label text-[10px] text-white/60 uppercase tracking-widest mb-2">
              Sanctuary Plus
            </p>
            <h1 className="font-headline text-4xl text-white leading-tight mb-2">
              {protocol.title}
            </h1>
            <p className="font-headline italic text-base text-white/80 mb-4">
              {protocol.subtitle}
            </p>
          </div>
        </div>

        <div className="px-6 -mt-8">
          <div className={`${theme.bgColor} rounded-2xl p-6 mb-5`}>
            <p className="font-body text-sm text-on-surface leading-relaxed">
              {protocol.why}
            </p>
          </div>

          <button
            onClick={() => {
              track(EVENTS.CTA_CLICKED, {
                cta_id:  'protocol_unlock',
                vikriti,
              })
              setPaywallOpen(true)
            }}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all mb-3"
          >
            Unlock with Plus
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 text-center font-label text-xs text-on-surface-variant/60 uppercase tracking-widest"
          >
            Go back
          </button>
        </div>

        <PaywallSheet
          open={paywallOpen}
          onClose={() => setPaywallOpen(false)}
          surface={`protocol_${vikriti}`}
          headline={`Unlock your ${theme.name} protocol`}
          subhead="Three days of food, movement, breath, and rest to bring your dosha back to centre."
        />
      </div>
    )
  }

  // ── Premium content ─────────────────────────────────────────────────────
  const day = protocol.days[activeDay - 1]

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-20">

      {/* Gradient hero — same visual language as DoshaProfilePage so a
          Plus user moving between the two screens feels continuity. */}
      <div className={`relative bg-gradient-to-b ${theme.gradient} px-6 pt-12 pb-16 overflow-hidden`}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="absolute top-5 left-5 z-20 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-white text-lg">arrow_back</span>
        </button>

        <div className="relative z-10 text-center mt-4">
          <p className="font-label text-[10px] text-white/60 uppercase tracking-widest mb-2">
            Sanctuary Plus · 3-day protocol
          </p>
          <h1 className="font-headline text-4xl text-white leading-tight mb-2">
            {protocol.title}
          </h1>
          <p className="font-headline italic text-base text-white/80">
            {protocol.subtitle}
          </p>
        </div>
      </div>

      <div className="px-6 -mt-8">

        {/* Why this protocol — anchored prose, Charaka-sourced */}
        <div className={`${theme.bgColor} rounded-2xl p-6 mb-5`}>
          <p className="font-body text-sm text-on-surface leading-relaxed">
            {protocol.why}
          </p>
          {protocol.source && (
            <p className="font-label text-[10px] text-on-surface-variant/50 mt-3 pt-3 border-t border-outline-variant/15">
              Source: {protocol.source}
            </p>
          )}
        </div>

        {/* Day tabs — sticky on scroll so the user can switch days at any
            depth in the page. The accent line under the active tab uses
            the dosha's barColor so the navigation IS the visual identity. */}
        <div className="sticky top-0 z-10 bg-background -mx-6 px-6 pt-3 pb-2 mb-4">
          <div className="flex gap-2" role="tablist" aria-label="Protocol days">
            {protocol.days.map((d) => {
              const active = d.day === activeDay
              return (
                <button
                  key={d.day}
                  onClick={() => setActiveDay(d.day)}
                  role="tab"
                  aria-selected={active}
                  className={`flex-1 py-2.5 rounded-full font-label text-xs font-semibold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant active:scale-[0.97]'
                  }`}
                >
                  Day {d.day}
                </button>
              )
            })}
          </div>
        </div>

        {/* Active day header */}
        <div className="mb-5 px-1">
          <p
            className="font-label text-[10px] font-semibold uppercase tracking-[0.22em] mb-2"
            style={{ color: theme.accentHex }}
          >
            Day {day.day} · {day.title}
          </p>
          <p className="font-body text-[15px] text-on-surface-variant/90 leading-relaxed max-w-prose">
            {day.lede}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {day.sections.map((section, i) => (
            <ProtocolSection key={i} section={section} theme={theme} />
          ))}
        </div>

        {/* Day-end nav — primary "next day" CTA + secondary "back to today's
            reading" link. Keeps users in the protocol, not bounced back
            to home where the same VikritiCard would re-tease them. */}
        <div className="mt-8 mb-4 flex flex-col gap-3">
          {activeDay < protocol.days.length && (
            <button
              onClick={() => setActiveDay(activeDay + 1)}
              className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all"
            >
              Continue to Day {activeDay + 1}
            </button>
          )}
          {activeDay === protocol.days.length && (
            <button
              onClick={() => navigate('/home')}
              className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all"
            >
              Back to home
            </button>
          )}
          {activeDay > 1 && (
            <button
              onClick={() => setActiveDay(activeDay - 1)}
              className="w-full py-3 text-center font-label text-xs text-on-surface-variant/60 uppercase tracking-widest active:scale-95"
            >
              Back to Day {activeDay - 1}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

// ── Section renderer ─────────────────────────────────────────────────────────
// Five kinds (food / move / breath / rest / mindset / notice) all share the
// same layout — iconographic chip, title, bullet list, optional inline
// note. The icon comes from SECTION_ICONS, color tone from the dosha theme.
function ProtocolSection({ section, theme }) {
  const icon = SECTION_ICONS[section.kind] || 'circle'

  return (
    <div className="bg-surface-container rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-full ${theme.bgColor} flex items-center justify-center flex-shrink-0`}>
          <span
            aria-hidden="true"
            className={`material-symbols-outlined text-base ${theme.textColor}`}
          >
            {icon}
          </span>
        </div>
        <h3 className="font-body font-semibold text-base text-on-surface leading-tight">
          {section.title}
        </h3>
      </div>

      <ul className="space-y-2 mb-3">
        {section.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className={`material-symbols-outlined text-[14px] mt-0.5 ${theme.textColor}`}
            >
              check_circle
            </span>
            <span className="font-body text-sm text-on-surface leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>

      {section.note && (
        <p className="font-body text-xs text-on-surface-variant/70 italic leading-relaxed pt-3 border-t border-outline-variant/15">
          {section.note}
        </p>
      )}
    </div>
  )
}
