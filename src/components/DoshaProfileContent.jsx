// ─────────────────────────────────────────────────────────────────────────────
//  DoshaProfileContent — shared dosha profile UI used by both the logged-in
//  DoshaProfilePage and the anonymous quiz result screen in DoshaQuizPage.
//
//  Props
//  ─────
//  doshaLabel   string    e.g. "Vata", "Pitta-Kapha", "Tridoshic"
//  primary      string    e.g. "vata"
//  secondary    string|null
//  tertiary     string|null
//  percentages  object|null  { vata, pitta, kapha }
//  onBack       fn|null   called when the back button in the hero is tapped
//  footerSlot   ReactNode rendered below the "Understanding Prakriti" block
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DOSHAS } from '../data/ayurveda/dosha-prakriti'
import { localizeDoshaDisplay, localizeDosha } from '../i18n/contentI18n'
import { track, EVENTS } from '../lib/track'
import { useIsPremium } from '../hooks/useIsPremium'
import PaywallSheet from './PaywallSheet'
import MedicalDisclaimer from './MedicalDisclaimer'
import { NatureSections, ImbalanceSections, LifestyleSections, hasRichDetail } from './doshaDetailSections'
import { DOSHA_DATA, capitalize } from './doshaProfilePrimitives'
import NavRow from './NavRow'


// ── Sub-components ───────────────────────────────────────────────────────────

function ThemeSection({ kicker, title, lede, children }) {
  return (
    <section className="mb-10">
      <div className="px-1 mb-5 mt-6">
        {kicker && (
          <p className="font-label text-[11px] font-semibold uppercase tracking-[0.22em] text-primary mb-2">{kicker}</p>
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



// ── Main export ──────────────────────────────────────────────────────────────

export default function DoshaProfileContent({
  doshaLabel,
  primary,
  secondary,
  tertiary,
  percentages,
  onBack,
  footerSlot,
  leadSlot,
  // 'all'      — everything inline (anonymous quiz result; unchanged).
  // 'overview' — slimmed: constitution + strengths + preview tiles + Ch3, with
  //              the deep dives moved behind their own pages (logged-in profile).
  sections = 'all',
}) {
  const overview = sections === 'overview'
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  // Re-localize on language change: i18n.language in the dep keeps these
  // memo-free reads fresh when the user switches languages mid-screen.
  void i18n.language
  const primaryData   = localizeDoshaDisplay(primary, DOSHA_DATA[primary])
  const secondaryData = secondary ? localizeDoshaDisplay(secondary, DOSHA_DATA[secondary]) : null
  const tertiaryData  = tertiary  ? localizeDoshaDisplay(tertiary, DOSHA_DATA[tertiary])  : null
  const isTridoshic   = doshaLabel === 'Tridoshic'
  const isDual        = doshaLabel?.includes('-') ?? false

  const richDosha = localizeDosha(DOSHAS[primary] || null)

  // ── Paywall: Chapter 3 ("Live by your dosha") is Plus-gated. Free users
  // see the kicker + lede as a teaser, then a single CTA tile that opens
  // the paywall sheet. The Charaka deep dives (body/mind/signs/triggers/
  // pacify) and the headline composition stay free — Plus unlocks the daily
  // lifestyle integration layer.
  const { isPremium } = useIsPremium()
  const [paywallOpen, setPaywallOpen] = useState(false)
  function openPaywall() {
    setPaywallOpen(true)
  }

  // Deep-dive tile → its page, with the entry-point click tracked (pairs with
  // the CONTENT_IMPRESSION the destination page fires) so tile→view CTR is
  // measurable. See analytics-events.md.
  function openSection(sectionId) {
    track(EVENTS.CTA_CLICKED, { cta_id: `dosha_tile_${sectionId}`, primary_dosha: primary })
    navigate(`/dosha/${sectionId}`)
  }

  if (!primaryData) return null

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-20">

      {/* Optional lead — e.g. the "this week / current state" section, shown
          above the constitution so the page continues the story the Home card
          started (current state first, then the stable baseline below). */}
      {leadSlot}

      {/* ── Gradient Hero ── */}
      <div className={`relative bg-gradient-to-b ${primaryData.gradient} px-6 pt-12 pb-16 overflow-hidden`}>
        <div className="absolute top-10 right-6 w-28 h-28 rounded-full bg-white/8 animate-quiz-float" aria-hidden="true" />
        <div className="absolute bottom-16 left-4 w-16 h-16 rounded-full bg-white/8 animate-quiz-float-delay" aria-hidden="true" />
        <div className="absolute top-1/2 right-1/3 w-10 h-10 rounded-full bg-white/5 animate-quiz-float" aria-hidden="true" />

        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-5 left-5 z-20 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center"
            aria-label={t('doshaProfile.goBack')}
          >
            <span className="material-symbols-outlined text-white text-lg">arrow_back</span>
          </button>
        )}

        <div className="relative z-10 text-center mt-4">
          <p className="font-label text-[11px] text-white/60 uppercase tracking-widest mb-2">
            {t('doshaProfile.yourDoshaType')}
          </p>
          <h1 className="font-headline text-5xl text-white leading-none mb-2">
            {doshaLabel}
          </h1>
          <p className="font-headline italic text-lg text-white/80 mb-5">
            {isTridoshic ? t('doshaProfile.rareEquilibrium') : primaryData.tagline}
          </p>
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="material-symbols-outlined text-white text-sm" aria-hidden="true">{primaryData.emoji}</span>
            <span className="font-label text-xs text-white/90 uppercase tracking-wider">
              {isTridoshic ? t('doshaProfile.allFiveElements') : primaryData.element}
            </span>
          </div>
        </div>
      </div>

      {/* No negative top margin: the first thing in here is the Chapter 1
          kicker, not a card, so pulling it up only lands the text on the
          gradient. It starts below the hero and the section's own `mt-6`
          gives it breathing room.

          `relative z-10` stays: the hero is `position: relative`, so an
          unpositioned block here would paint *behind* it if anything ever
          overlaps again. The hero's back button is z-20 and still wins. */}
      <div className="relative z-10 px-6">

        {/* ═══════════════════════════════════════════════════════════
            CHAPTER 1 — WHO YOU ARE
            ═══════════════════════════════════════════════════════════ */}
        <ThemeSection
          kicker={t('doshaProfile.ch1Kicker')}
          title={t('doshaProfile.ch1Title')}
          lede={t('doshaProfile.ch1Lede')}
        >

          {/* Dosha Composition
              ─────────────────
              Redesigned: a single horizontal segmented bar (Strava-style)
              for instant proportional reading, then a clean three-row
              legend with large tabular-nums percentages. Replaces three
              stacked progress bars which read as repetitive and made the
              card feel "rudimentary." */}
          {percentages && (
            <div className="bg-surface rounded-2xl p-6 shadow-md mb-5 stagger-2">
              <div className="flex items-baseline justify-between mb-6">
                <p className="font-label text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.22em]">
                  {t('doshaProfile.yourConstitution')}
                </p>
                <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
                  {t('doshaProfile.vpkShort')}
                </p>
              </div>

              {/* Segmented bar — proportional split across all three doshas.
                  Renders in dominance order so the primary color sits left.
                  A tiny gap between segments (gap-px) lets each band breathe
                  visually without losing the "stacked total = 100%" read. */}
              <div className="h-3 rounded-full overflow-hidden flex gap-px mb-6 bg-surface-container-high">
                {[
                  { key: primary, data: primaryData, pct: percentages[primary] },
                  ...(secondaryData ? [{ key: secondary, data: secondaryData, pct: percentages[secondary] }] : []),
                  ...(tertiaryData  ? [{ key: tertiary,  data: tertiaryData,  pct: percentages[tertiary]  }] : []),
                ].map(({ key, data, pct }, i) => (
                  <div
                    key={key}
                    className={`h-full ${data.barColor} transition-all duration-1000 ease-out`}
                    style={{ width: `${pct}%`, transitionDelay: `${i * 150}ms` }}
                    role="img"
                    aria-label={t('doshaProfile.pctAria', { name: data.name, pct })}
                  />
                ))}
              </div>

              {/* Legend — dot · name · element on the left, big % on the right.
                  Tabular-nums + large headline weight gives the numbers
                  presence; the secondary/tertiary rows fade slightly so the
                  dominant dosha reads first. */}
              <div className="space-y-3.5">
                {[
                  { key: primary, data: primaryData, pct: percentages[primary], opacity: 1 },
                  ...(secondaryData ? [{ key: secondary, data: secondaryData, pct: percentages[secondary], opacity: 0.85 }] : []),
                  ...(tertiaryData  ? [{ key: tertiary,  data: tertiaryData,  pct: percentages[tertiary],  opacity: 0.6  }] : []),
                ].map(({ key, data, pct, opacity }) => (
                  <div key={key} className="flex items-baseline justify-between gap-4" style={{ opacity }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        aria-hidden="true"
                        className={`w-2.5 h-2.5 rounded-full ${data.barColor} flex-shrink-0`}
                      />
                      <span className="font-body font-semibold text-sm text-on-surface">{data.name}</span>
                      <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider truncate">
                        {data.element}
                      </span>
                    </div>
                    <span className="font-headline text-2xl text-on-surface tabular-nums leading-none">
                      {pct}
                      <span className="font-body text-sm text-on-surface-variant/60 ml-0.5">%</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Footnote — interpretation. Separated by a hairline so the
                  composition reads as the headline and the prose as context. */}
              <p className="font-body text-xs text-on-surface-variant/60 italic mt-6 pt-5 border-t border-outline-variant/15 leading-relaxed">
                {isTridoshic
                  ? t('doshaProfile.footnoteTridoshic')
                  : isDual
                  ? t('doshaProfile.footnoteDual', { primary: capitalize(primary), secondary: capitalize(secondary) })
                  : (() => {
                      const pPct = percentages?.[primary] || 0
                      const sPct = percentages?.[secondary] || 0
                      const gap = pPct - sPct
                      if (gap >= 40) return t('doshaProfile.footnoteGapHigh', { primary: capitalize(primary) })
                      if (gap >= 20) return t('doshaProfile.footnoteGapMid', { primary: capitalize(primary), secondary: capitalize(secondary), pct: sPct })
                      return t('doshaProfile.footnoteGapLow', { primary: capitalize(primary), secondary: capitalize(secondary), pct: sPct })
                    })()
                }
              </p>
            </div>
          )}

          {/* Primary Dosha */}
          <div className={`${primaryData.bgColor} rounded-lg p-6 mb-5 stagger-3`}>
            <div className="flex items-center gap-2 mb-3">
              <span aria-hidden="true" className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>{primaryData.emoji}</span>
              <p className="font-label text-[11px] uppercase tracking-widest" style={{ color: primaryData.accentHex }}>
                {isTridoshic ? t('doshaProfile.balancedNature') : t('doshaProfile.dominant', { name: primaryData.name })}
              </p>
            </div>
            <p className="font-body text-sm text-on-surface leading-relaxed">{primaryData.description}</p>
          </div>

          {/* Secondary Dosha */}
          {secondaryData && !isTridoshic && (
            <div className="bg-surface-container rounded-lg p-6 mb-5 stagger-4">
              <div className="flex items-center gap-2 mb-3">
                <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">{secondaryData.emoji}</span>
                <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest">
                  {t('doshaProfile.secondary', { name: secondaryData.name })}
                </p>
              </div>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">{secondaryData.description}</p>
            </div>
          )}

          {/* Qualities (Gunas) */}
          <div className="bg-surface-container rounded-lg p-6 mb-5 stagger-4">
            <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-4">
              {t('doshaProfile.qualitiesGunas', { name: primaryData.name })}
            </p>
            {richDosha?.qualities ? (
              <div className="divide-y divide-outline-variant/10">
                {richDosha.qualities.map((q, i) => (
                  <div key={i} className="py-3 first:pt-1 last:pb-1">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <p className={`font-body font-semibold text-sm ${primaryData.textColor}`}>
                        {capitalize(q.english)}
                      </p>
                      <span className="font-label text-[10px] text-on-surface-variant/40">·</span>
                      <p className="font-body text-xs italic text-on-surface-variant/70">{q.sanskrit}</p>
                    </div>
                    {q.note && (
                      <p className="font-body text-sm text-on-surface-variant leading-relaxed">{q.note}</p>
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
                {t('doshaProfile.sourceCharaka', { verse: richDosha.source.verse })}
              </p>
            )}
          </div>

          {/* Body + Mind — inline on the anonymous quiz result; on the logged-in
              profile it lives behind the "Body & Mind" tile below. */}
          {sections === 'all' && (
            <div className="mb-5">
              <NatureSections primary={primary} isTridoshic={isTridoshic} />
            </div>
          )}

          {/* Natural Strengths */}
          <div className="bg-surface-container rounded-lg p-6 mb-5 stagger-5">
            <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-4">
              {t('doshaProfile.naturalStrengths')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ...primaryData.strengths,
                ...(secondaryData && isDual ? secondaryData.strengths.slice(0, 2) : []),
              ].map((strength, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  <span className="font-body text-sm text-on-surface">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Go deeper into "who you are" — the full body & mind reading on its
              own page. Overview only; the quiz result ('all') shows it inline
              above. Belongs to Chapter 1: it's about your nature, not balance. */}
          {overview && hasRichDetail(primary, isTridoshic) && (
            <NavRow
              icon="self_improvement"
              accentHex={primaryData.accentHex}
              title={t('doshaProfile.tileNature')}
              summary={t('doshaProfile.tileNatureSummary', { name: primaryData.name })}
              onClick={() => openSection('nature')}
            />
          )}

        </ThemeSection>

        {/* ═══════════════════════════════════════════════════════════
            CHAPTER 2 — STAYING IN BALANCE. Always a real chapter (so the
            numbering never skips): on the profile it's two entry rows; on the
            quiz result it's the sections inline.
            ═══════════════════════════════════════════════════════════ */}
        <ThemeSection
          kicker={t('doshaProfile.ch2Kicker')}
          title={t('doshaProfile.ch2Title')}
          lede={t('doshaProfile.ch2Lede')}
        >
          {overview ? (
            <div className="flex flex-col gap-2.5">
              {hasRichDetail(primary, isTridoshic) && (
                <NavRow
                  icon="healing"
                  accentHex={primaryData.accentHex}
                  title={t('doshaProfile.tileImbalance')}
                  summary={t('doshaProfile.tileImbalanceSummary')}
                  onClick={() => openSection('imbalance')}
                />
              )}
              <NavRow
                icon="spa"
                accentHex={primaryData.accentHex}
                title={t('doshaProfile.tileLifestyle')}
                summary={t('doshaProfile.tileLifestyleSummary')}
                onClick={() => openSection('lifestyle')}
              />
            </div>
          ) : (
            <>
              <div className="mb-5">
                <ImbalanceSections primary={primary} isTridoshic={isTridoshic} />
              </div>
              <LifestyleSections primary={primary} />
            </>
          )}
        </ThemeSection>

        {/* ═══════════════════════════════════════════════════════════
            CHAPTER 3 — LIVE BY YOUR DOSHA  (Plus-gated)
            ═══════════════════════════════════════════════════════════ */}
        <ThemeSection
          kicker={t('doshaProfile.ch3Kicker')}
          title={t('doshaProfile.ch3Title')}
          lede={t('doshaProfile.ch3Lede')}
        >

          {/* Free users see a single teaser tile here instead of the full
              chapter. Designed to feel like a polished invitation, not a
              cold paywall — same accent color as the dosha, a brief list
              of what's behind it, one CTA. */}
          {!isPremium && (
            <button
              onClick={() => {
                track(EVENTS.CTA_CLICKED, {
                  cta_id:        'dosha_chapter3_unlock',
                  primary_dosha: primary,
                })
                openPaywall()
              }}
              className="block w-full text-left rounded-2xl p-6 mb-5 bg-plus-container border border-plus/25 active:scale-[0.99] transition-all"
              aria-label={t('doshaProfile.unlockChapter3Aria')}
            >
              <div className="flex items-center gap-2 mb-3">
                <span aria-hidden="true" className="material-symbols-outlined text-base text-plus">auto_awesome</span>
                <span className="font-label text-[11px] font-semibold uppercase tracking-[0.22em] text-plus">
                  {t('doshaProfile.plusBadge')}
                </span>
              </div>
              <p className="font-headline text-xl text-on-surface leading-tight mb-2">
                {t('doshaProfile.teaserHeadline', { primary: capitalize(primary) })}
              </p>
              <p className="font-body text-sm text-on-surface-variant/85 leading-relaxed mb-4">
                {t('doshaProfile.teaserBody')}
              </p>
              <ul className="space-y-1.5 mb-5">
                {[t('doshaProfile.teaserBullet1'), t('doshaProfile.teaserBullet2'), t('doshaProfile.teaserBullet3')].map((line) => (
                  <li key={line} className="flex items-center gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-plus">check_circle</span>
                    <span className="font-body text-sm text-on-surface">{line}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <span className="font-label text-xs font-semibold uppercase tracking-wider text-plus">
                  {t('doshaProfile.unlockChapter3')}
                </span>
                <span aria-hidden="true" className="material-symbols-outlined text-base text-plus">arrow_forward</span>
              </div>
            </button>
          )}

          {/* Value-first entry to the dietary teaser: free users get the verdict
              + tastes for their dosha, then the paywall for the full guide. This
              is the soft path into Chapter 3. */}
          {!isPremium && (
            <button
              onClick={() => {
                track(EVENTS.CTA_CLICKED, { cta_id: 'dosha_diet_preview', primary_dosha: primary })
                navigate('/dietary')
              }}
              className="w-full flex items-center justify-center gap-1.5 mb-5 py-2 font-body text-[13px] font-medium text-plus active:opacity-70 transition-opacity"
            >
              {t('doshaProfile.dietPreview')}
              <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}

          {/* ── Below: the full chapter, only rendered for Plus members ── */}
          {isPremium && (
          <>
          {/* Ayurvedic Lifestyle — Season, Time, Taste */}
          <div className="bg-surface-container rounded-lg overflow-hidden mb-5">
            <div className="flex items-start gap-4 px-6 py-4">
              <div className={`w-10 h-10 rounded-full ${primaryData.bgColor} flex items-center justify-center flex-shrink-0`}>
                <span aria-hidden="true" className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>calendar_month</span>
              </div>
              <div>
                <p className="font-body font-semibold text-sm text-on-surface mb-0.5">{t('doshaProfile.peakSeason')}</p>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  {t('doshaProfile.peakSeasonBody', { season: primaryData.season, name: primaryData.name })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 px-6 py-4 border-t border-surface-container-high">
              <div className={`w-10 h-10 rounded-full ${primaryData.bgColor} flex items-center justify-center flex-shrink-0`}>
                <span aria-hidden="true" className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>schedule</span>
              </div>
              <div>
                <p className="font-body font-semibold text-sm text-on-surface mb-0.5">{t('doshaProfile.doshaHours', { name: primaryData.name })}</p>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  {t('doshaProfile.doshaHoursBody', { timeOfDay: primaryData.timeOfDay, name: primaryData.name })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 px-6 py-4 border-t border-surface-container-high">
              <div className={`w-10 h-10 rounded-full ${primaryData.bgColor} flex items-center justify-center flex-shrink-0`}>
                <span aria-hidden="true" className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>restaurant</span>
              </div>
              <div>
                <p className="font-body font-semibold text-sm text-on-surface mb-0.5">{t('doshaProfile.balancingTastes')}</p>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">{primaryData.taste}</p>
              </div>
            </div>
          </div>

          {/* Pacifying protocol — surfaced for non-Tridoshic Plus users.
              Lands on the 3-day plan for the user's primary dosha; most
              useful when their current vikriti matches their prakriti
              (the common "I am Vata and I'm feeling like a worse Vata"
              case). Doesn't overlap with Diet/Dinacharya — those are
              evergreen reference; this is acute pacification. */}
          {!isTridoshic && (
            <button
              onClick={() => {
                track(EVENTS.CTA_CLICKED, {
                  cta_id:         'dosha_chapter3_protocol',
                  primary_dosha:  primary,
                })
                navigate(`/protocol/${primary}`)
              }}
              className={`block w-full text-left rounded-2xl p-5 mb-6 ${primaryData.bgColor} active:scale-[0.99] transition-all`}
              aria-label={t('doshaProfile.protocolAria', { name: primaryData.name })}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  aria-hidden="true"
                  className={`material-symbols-outlined text-base ${primaryData.textColor}`}
                >
                  {primaryData.emoji}
                </span>
                <p
                  className="font-label text-[11px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: primaryData.accentHex }}
                >
                  {t('doshaProfile.protocolKicker', { name: primaryData.name })}
                </p>
              </div>
              <p className="font-headline text-lg text-on-surface leading-tight mb-1">
                {t('doshaProfile.protocolHeadline', { name: primaryData.name })}
              </p>
              <p className="font-body text-xs text-on-surface-variant/80 leading-snug">
                {t('doshaProfile.protocolBody')}
              </p>
            </button>
          )}

          {/* Diet + Daily Routine deep-dive CTAs */}
          <div className="flex flex-col gap-2.5 mb-6">
            <NavRow
              icon="restaurant"
              accentHex={primaryData.accentHex}
              title={t('doshaProfile.dietTitle')}
              summary={t('doshaProfile.dietSummary')}
              ariaLabel={t('doshaProfile.dietAria')}
              onClick={() => navigate('/dietary')}
            />
            <NavRow
              icon="schedule"
              accentHex={primaryData.accentHex}
              title={t('doshaProfile.routineTitle')}
              summary={t('doshaProfile.routineSummary')}
              ariaLabel={t('doshaProfile.routineAria')}
              onClick={() => navigate('/dinacharya')}
            />
          </div>
          </>
          )}

        </ThemeSection>

        {/* Understanding Prakriti */}
        <div className="bg-surface-container-low rounded-lg p-5 mb-5 flex items-start gap-3">
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-base mt-0.5">auto_awesome</span>
          <div>
            <p className="font-body font-semibold text-sm text-on-surface mb-1">{t('doshaProfile.understandingTitle')}</p>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              {t('doshaProfile.understandingBody')}
            </p>
          </div>
        </div>

        {/* Page-specific footer slot (save CTA, retake button, etc.) */}
        {footerSlot}

        {/* Not-medical-advice notice — this page gives dosha-based lifestyle
            guidance, so the disclaimer sits in context at the foot of it. */}
        <MedicalDisclaimer className="mb-6" />

      </div>

      {/* Paywall sheet — opens from the Chapter 3 teaser tile. Re-uses the
          same component as DiscoverPage so the upgrade experience is one
          consistent surface no matter where the user enters from. */}
      <PaywallSheet
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        surface="dosha_chapter3"
        headline={t('doshaProfile.paywallHeadline', { primary: capitalize(primary) })}
        subhead={t('doshaProfile.paywallSubhead')}
      />
    </div>
  )
}
