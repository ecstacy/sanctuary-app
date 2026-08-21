// ─────────────────────────────────────────────────────────────────────────────
//  doshaDetailSections — the heavy deep-dive blocks of the dosha profile,
//  extracted so they can live on their OWN pages (reached from preview tiles on
//  the profile) instead of stacking into one long scroll at tiny font sizes.
//
//  Three groups, each self-contained (computes its own localized data from the
//  primary dosha) and each usable in two places:
//    • embedded inline on the anonymous quiz result (sections="all") — collapsed
//      by default, exactly as before;
//    • as a full page (defaultOpen) surfaced from a tile on the logged-in profile.
//
//  NatureSections    — body + mind
//  ImbalanceSections — signs + triggers + how to rebalance
//  LifestyleSections — daily habits + yoga + meditation
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DOSHAS } from '../data/ayurveda/dosha-prakriti'
import { localizeDoshaDisplay, localizeDosha } from '../i18n/contentI18n'
import {
  DOSHA_DATA, ExpandableSection, LabelValueRow, BulletList,
} from './doshaProfilePrimitives'

// Localized data for a dosha — mirrors the computation in DoshaProfileContent.
function useDoshaData(primary) {
  const { t, i18n } = useTranslation()
  void i18n.language // re-localize on language switch
  return {
    t,
    primaryData: localizeDoshaDisplay(primary, DOSHA_DATA[primary]),
    richDosha: localizeDosha(DOSHAS[primary] || null),
  }
}

// A small accordion group with its own open-state. defaultOpen expands every
// panel (dedicated pages), otherwise they start collapsed (inline on the quiz).
function useAccordion(ids, defaultOpen) {
  const [open, setOpen] = useState(() => new Set(defaultOpen ? ids : []))
  const isOpen = (id) => open.has(id)
  const toggle = (id) => setOpen((prev) => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
  return { isOpen, toggle }
}

// Whether a dosha has the rich (Charaka) content the nature/imbalance pages need.
export function hasRichDetail(primary, isTridoshic) {
  return !isTridoshic && !!localizeDosha(DOSHAS[primary] || null)
}

// ── Body + Mind ──────────────────────────────────────────────────────────────
export function NatureSections({ primary, isTridoshic = false, defaultOpen = false }) {
  const { t, primaryData, richDosha } = useDoshaData(primary)
  const { isOpen, toggle } = useAccordion(['body', 'mind'], defaultOpen)
  if (!richDosha || isTridoshic || !primaryData) return null
  return (
    <div className="mb-2">
      <ExpandableSection
        id="body" icon="accessibility_new"
        label={t('doshaProfile.yourBody', { name: primaryData.name })}
        summary={t('doshaProfile.bodySummary')}
        accentClass={primaryData.textColor}
        isOpen={isOpen('body')} onToggle={() => toggle('body')}
      >
        <div className="pt-3">
          {richDosha.body && (
            <>
              {richDosha.body.build     && <LabelValueRow label={t('doshaProfile.labelBuild')}     value={richDosha.body.build} />}
              {richDosha.body.skin      && <LabelValueRow label={t('doshaProfile.labelSkin')}      value={richDosha.body.skin} />}
              {richDosha.body.hair      && <LabelValueRow label={t('doshaProfile.labelHair')}      value={richDosha.body.hair} />}
              {richDosha.body.face      && <LabelValueRow label={t('doshaProfile.labelFace')}      value={richDosha.body.face} />}
              {richDosha.body.digestion && <LabelValueRow label={t('doshaProfile.labelDigestion')} value={richDosha.body.digestion} />}
              {richDosha.body.sleep     && <LabelValueRow label={t('doshaProfile.labelSleep')}     value={richDosha.body.sleep} />}
              {richDosha.body.energy    && <LabelValueRow label={t('doshaProfile.labelEnergy')}    value={richDosha.body.energy} />}
            </>
          )}
        </div>
      </ExpandableSection>

      <ExpandableSection
        id="mind" icon="psychology"
        label={t('doshaProfile.yourMind', { name: primaryData.name })}
        summary={t('doshaProfile.mindSummary')}
        accentClass={primaryData.textColor}
        isOpen={isOpen('mind')} onToggle={() => toggle('mind')}
      >
        <div className="pt-3 space-y-4">
          <div>
            <p className={`font-label text-[11px] uppercase tracking-wider mb-2 ${primaryData.textColor}`}>{t('doshaProfile.inBalance')}</p>
            <BulletList items={richDosha.mind.balanced} iconName="check_circle" iconClass={primaryData.textColor} />
          </div>
          <div>
            <p className="font-label text-[11px] uppercase tracking-wider mb-2 text-on-surface-variant">{t('doshaProfile.outOfBalance')}</p>
            <BulletList items={richDosha.mind.imbalanced} iconName="error" iconClass="text-on-surface-variant/40" />
          </div>
        </div>
      </ExpandableSection>
    </div>
  )
}

// ── Signs + Triggers + Pacification ──────────────────────────────────────────
export function ImbalanceSections({ primary, isTridoshic = false, defaultOpen = false }) {
  const { t, primaryData, richDosha } = useDoshaData(primary)
  const { isOpen, toggle } = useAccordion(['signs', 'triggers', 'pacify'], defaultOpen)
  if (!richDosha || isTridoshic || !primaryData) return null
  return (
    <div className="mb-2">
      <ExpandableSection
        id="signs" icon="health_and_safety"
        label={t('doshaProfile.signsLabel')}
        summary={t('doshaProfile.signsSummary', { name: primaryData.name })}
        accentClass={primaryData.textColor}
        isOpen={isOpen('signs')} onToggle={() => toggle('signs')}
      >
        <div className="pt-3">
          <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-3">{t('doshaProfile.signsIntro')}</p>
          <BulletList items={richDosha.imbalanceSigns} iconName="circle" iconClass="text-on-surface-variant/40" />
        </div>
      </ExpandableSection>

      <ExpandableSection
        id="triggers" icon="warning"
        label={t('doshaProfile.triggersLabel')}
        summary={t('doshaProfile.triggersSummary')}
        accentClass={primaryData.textColor}
        isOpen={isOpen('triggers')} onToggle={() => toggle('triggers')}
      >
        <div className="pt-3">
          <BulletList items={richDosha.triggers} iconName="trending_up" iconClass="text-on-surface-variant/50" />
        </div>
      </ExpandableSection>

      <ExpandableSection
        id="pacify" icon="spa"
        label={t('doshaProfile.pacifyLabel')}
        summary={richDosha.pacification?.principle ? richDosha.pacification.principle.split('.')[0] + '.' : t('doshaProfile.pacifySummaryFallback')}
        accentClass={primaryData.textColor}
        isOpen={isOpen('pacify')} onToggle={() => toggle('pacify')}
      >
        <div className="pt-3 space-y-3">
          {richDosha.pacification?.principle && (
            <div className={`rounded-xl px-4 py-3 ${primaryData.bgColor}`}>
              <p className={`font-body text-sm leading-relaxed ${primaryData.textColor}`}>{richDosha.pacification.principle}</p>
            </div>
          )}
          {richDosha.pacification?.lifestyle && (
            <BulletList items={richDosha.pacification.lifestyle} iconName="check_circle" iconClass={primaryData.textColor} />
          )}
        </div>
      </ExpandableSection>
    </div>
  )
}

// ── Stay-in-balance + Yoga + Meditation ──────────────────────────────────────
// Always available (built from DOSHA_DATA, so it works for tridoshic too).
export function LifestyleSections({ primary }) {
  const { t, primaryData } = useDoshaData(primary)
  if (!primaryData) return null
  return (
    <>
      <div className="bg-surface-container-low rounded-2xl p-6 mb-5">
        <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-4">{t('doshaProfile.stayInBalance')}</p>
        <div className="flex flex-col gap-3">
          {primaryData.balanceTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <span aria-hidden="true" className={`material-symbols-outlined text-base mt-0.5 ${primaryData.textColor}`}>spa</span>
              <p className="font-body text-sm text-on-surface leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`${primaryData.bgColor} rounded-2xl p-6 mb-5`}>
        <div className="flex items-center gap-2 mb-3">
          <span aria-hidden="true" className={`material-symbols-outlined text-lg ${primaryData.textColor}`}>self_care</span>
          <p className="font-label text-[11px] uppercase tracking-widest" style={{ color: primaryData.accentHex }}>{t('doshaProfile.yogaMovement')}</p>
        </div>
        <p className="font-body text-sm text-on-surface leading-relaxed">{primaryData.yoga}</p>
      </div>

      <div className="bg-surface-container rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">air</span>
          <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest">{t('doshaProfile.meditationBreathwork')}</p>
        </div>
        <p className="font-body text-sm text-on-surface leading-relaxed">{primaryData.meditation}</p>
      </div>
    </>
  )
}
