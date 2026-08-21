// ─────────────────────────────────────────────────────────────────────────────
//  DoshaSectionPage — one deep-dive topic of the dosha profile on its own page,
//  reached from a preview tile on the profile. Keeps the profile scannable while
//  losing none of the content: the full section just lives one tap away, at a
//  comfortable reading size, expanded by default.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { NatureSections, ImbalanceSections, LifestyleSections } from '../components/doshaDetailSections'
import MedicalDisclaimer from '../components/MedicalDisclaimer'

const SECTIONS = {
  nature:    { titleKey: 'doshaProfile.tileNature',    Comp: NatureSections },
  imbalance: { titleKey: 'doshaProfile.tileImbalance', Comp: ImbalanceSections },
  lifestyle: { titleKey: 'doshaProfile.tileLifestyle', Comp: LifestyleSections },
}

export default function DoshaSectionPage({ section }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { profile } = useAuth()

  const meta = SECTIONS[section]
  const primary = profile?.dosha_details?.primary || profile?.dosha?.toLowerCase() || null
  const isTridoshic = profile?.dosha === 'Tridoshic'

  // No constitution yet, or an unknown section — send them to the profile.
  if (!meta || !primary) {
    navigate('/dosha', { replace: true })
    return null
  }

  const Comp = meta.Comp

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-24 px-6">
      <header className="flex items-center py-4">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center"
          aria-label={t('common.back', 'Back')}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">arrow_back</span>
        </button>
      </header>

      <h1 className="font-headline text-2xl leading-tight mb-5">{t(meta.titleKey)}</h1>

      <Comp primary={primary} isTridoshic={isTridoshic} defaultOpen />

      {/* Nature/Imbalance are empty for a balanced constitution — say so rather
          than showing a blank page. */}
      {section !== 'lifestyle' && isTridoshic && (
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
          {t('doshaProfile.tridoshicNoDeepDive', 'A balanced constitution has no single dominant dosha, so this deep dive doesn’t apply. See your constitution and daily balance instead.')}
        </p>
      )}

      <MedicalDisclaimer className="mt-8 mb-6" />
    </div>
  )
}
