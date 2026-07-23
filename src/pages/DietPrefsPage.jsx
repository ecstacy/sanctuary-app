// ─────────────────────────────────────────────────────────────────────────────
//  DietPrefsPage — tell the app what to keep off your plate
//
//  Small screen, high stakes: what the user records here becomes a HARD filter
//  over every food suggestion (lib/dietSafety.js). Design decisions that follow
//  from that:
//
//  • ALLERGENS AND PREFERENCES ARE VISUALLY SEPARATE. An allergy is a safety
//    constraint; a pattern is a choice. Presenting them as one list would
//    invite the UI to describe them in one voice, and "excluded (your diet)"
//    is a dangerous way to describe an allergen.
//
//  • CONSENT GATES THE WRITE, NOT THE SCREEN. The user can read and explore
//    before agreeing. Nothing about their health leaves the device until they
//    have granted health-data consent whose text mentions dietary
//    restrictions (v2 — see lib/healthConsent.js).
//
//  • A FAILED SYNC IS NOT A CLEARED PREFERENCE. If the network write fails the
//    local value stands and we say sync failed. Forgetting a declared allergy
//    because a round-trip failed is the worst outcome this screen has.
//
//  • EMPTY ≠ "NO RESTRICTIONS". We never present an untouched profile as a
//    confirmed all-clear; the copy says what it means.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDietPrefs } from '../hooks/useDietPrefs'
import { useHealthConsent } from '../hooks/useHealthConsent'
import { ALLERGEN_KEYS, PATTERN_KEYS, DIET_DISCLAIMER } from '../lib/dietSafety'
import MedicalDisclaimer from '../components/MedicalDisclaimer'
import useScrollDepth from '../hooks/useScrollDepth'

function Chip({ selected, label, onClick, tone = 'neutral' }) {
  const base = 'min-h-11 px-4 inline-flex items-center rounded-full font-body text-sm transition-all active:scale-95 border'
  const styles = selected
    ? tone === 'alert'
      ? 'bg-error-container/70 text-on-error-container border-transparent'
      : 'bg-primary-container text-on-primary-container border-transparent'
    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={selected}
      onClick={onClick}
      className={`${base} ${styles}`}
    >
      {/* Icon + state, never colour alone (WCAG 1.4.1). */}
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="material-symbols-outlined text-sm">
          {selected ? 'check_circle' : 'add_circle'}
        </span>
        {label}
      </span>
    </button>
  )
}

export default function DietPrefsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { prefs, toggle, saving, error, needsConsent, hasAnswered } = useDietPrefs()
  const { grant } = useHealthConsent()
  useScrollDepth('diet_prefs')

  const syncFailed     = error && error !== 'health_consent_required'
  // The consent gate correctly refuses the write, but a tap that silently
  // does nothing reads as a broken button. Say why, and point at the card.
  const blockedByConsent = error === 'health_consent_required'

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-24">
      <div className="px-6 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center"
          aria-label={t('common.back')}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">arrow_back</span>
        </button>

        <h1 className="font-headline text-3xl text-on-surface mt-4">{t('dietPrefs.title')}</h1>
        <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">
          {t('dietPrefs.intro')}
        </p>

        {/* ── Consent gate ────────────────────────────────────────────────
            Shown rather than hidden: the user can see exactly what they'd be
            agreeing to before agreeing to it. */}
        {needsConsent && (
          <div className="mt-5 bg-surface-container-low rounded-2xl p-4" role="region" aria-label={t('dietPrefs.consentTitle')}>
            <p className="font-body text-sm font-semibold text-on-surface">{t('dietPrefs.consentTitle')}</p>
            <p className="font-body text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              {t('doshaQuiz.consentText')}
            </p>
            <button
              onClick={() => grant({ surface: 'diet_prefs' })}
              className="mt-3 px-4 py-2.5 rounded-full bg-primary text-on-primary font-body text-sm active:scale-95 transition-all"
            >
              {t('dietPrefs.consentCta')}
            </button>
            {blockedByConsent && (
              <p role="alert" className="font-body text-xs text-on-surface mt-2.5 leading-relaxed">
                {t('dietPrefs.consentNeededHint')}
              </p>
            )}
          </div>
        )}

        {syncFailed && (
          <div role="alert" className="mt-5 bg-error-container/60 text-on-error-container rounded-2xl p-4">
            <p className="font-body text-sm leading-relaxed">{t('dietPrefs.syncFailed')}</p>
          </div>
        )}

        {/* ── Allergens ───────────────────────────────────────────────────*/}
        <section className="mt-7">
          <h2 className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-1">
            {t('dietPrefs.allergensTitle')}
          </h2>
          <p className="font-body text-xs text-on-surface-variant/70 mb-3 leading-relaxed">
            {t('dietPrefs.allergensHelp')}
          </p>
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_KEYS.map((key) => (
              <Chip
                key={key}
                tone="alert"
                selected={prefs.allergens.includes(key)}
                label={t(`diet.allergens.${key}`, key)}
                onClick={() => toggle('allergens', key)}
              />
            ))}
          </div>
        </section>

        {/* ── Patterns ────────────────────────────────────────────────────*/}
        <section className="mt-7">
          <h2 className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-1">
            {t('dietPrefs.patternsTitle')}
          </h2>
          <p className="font-body text-xs text-on-surface-variant/70 mb-3 leading-relaxed">
            {t('dietPrefs.patternsHelp')}
          </p>
          <div className="flex flex-wrap gap-2">
            {PATTERN_KEYS.map((key) => (
              <Chip
                key={key}
                selected={prefs.patterns.includes(key)}
                label={t(`diet.patterns.${key}`, key)}
                onClick={() => toggle('patterns', key)}
              />
            ))}
          </div>
        </section>

        <p aria-live="polite" className="font-body text-xs text-on-surface-variant/60 mt-6">
          {saving
            ? t('dietPrefs.saving')
            : hasAnswered
              ? t('dietPrefs.savedSummary', {
                  allergens: prefs.allergens.length,
                  patterns:  prefs.patterns.length,
                })
              : t('dietPrefs.notSetYet')}
        </p>

        <p className="font-body text-[11px] text-on-surface-variant/60 leading-relaxed mt-5">
          {t('dietPrefs.notExhaustive')}
        </p>
        <p className="font-body text-[11px] text-on-surface-variant/60 leading-relaxed mt-2">
          {DIET_DISCLAIMER}
        </p>
        <MedicalDisclaimer variant="inline" className="mt-2" />
      </div>
    </div>
  )
}
