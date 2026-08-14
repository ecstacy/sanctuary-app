import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Icons stay in code (not user-facing); all copy comes from the `preview`
// i18n namespace (en/de/hi).
const STRUGGLE_ICONS = { stress: 'psychiatry', sleep: 'bedtime', energy: 'bolt', flexibility: 'self_care' }
const WHY_ICONS = ['bookmark', 'energy_savings_leaf', 'lock']

export default function PreviewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { struggles = [], notes = '' } = location.state || {}

  // Pick first selected struggle for preview, fallback to stress.
  const primaryStruggle = STRUGGLE_ICONS[struggles[0]] ? struggles[0] : 'stress'
  const label = t(`preview.struggles.${primaryStruggle}.label`)
  const sequence = t(`preview.struggles.${primaryStruggle}.sequence`, { returnObjects: true }) || []
  const tip = t(`preview.struggles.${primaryStruggle}.tip`)
  const why = t('preview.why', { returnObjects: true }) || []

  return (
    <div className="h-[100dvh] bg-background text-on-surface font-body flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 flex-shrink-0">
        <button
          onClick={() => navigate('/discover')}
          className="text-on-surface-variant"
          aria-label={t('common.back')}
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <span className="font-headline italic text-primary text-base">{t('app.name')}</span>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col px-6 pb-10">

        {/* Heading */}
        <div className="mb-8">
          <p className="font-label text-xs text-primary uppercase tracking-widest mb-2">
            {t('preview.eyebrow')}
          </p>
          <h1 className="font-headline text-4xl text-on-surface leading-tight">
            {t('preview.title', { label })}
          </h1>
          <p className="text-on-surface-variant text-sm mt-3 leading-relaxed">
            {t('preview.subtitle')}
          </p>
        </div>

        {/* Prescription preview card */}
        <div className="bg-surface-container rounded-lg p-6 mb-5 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg">{STRUGGLE_ICONS[primaryStruggle]}</span>
            </div>
            <div>
              <p className="font-body font-semibold text-on-surface text-sm">{t('preview.sequenceLabel', { label })}</p>
              <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest">
                {t('preview.personalized')}{struggles.length > 1 ? t('preview.plusMore', { count: struggles.length - 1 }) : ''}
              </p>
            </div>
          </div>

          {/* Sequence steps */}
          <div className="flex flex-col gap-3 mb-5">
            {sequence.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-fixed-dim flex items-center justify-center flex-shrink-0">
                  <span className="font-label text-[10px] text-primary font-semibold">{i + 1}</span>
                </div>
                <p className="font-body text-sm text-on-surface">{step}</p>
              </div>
            ))}
          </div>

          {/* Ayurvedic tip */}
          <div className="bg-surface-container-low rounded-lg p-4 flex gap-3">
            <span className="material-symbols-outlined text-primary text-base flex-shrink-0 mt-0.5">spa</span>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed italic">
              {tip}
            </p>
          </div>

          {/* Blurred overlay — locked content teaser */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-container to-transparent" />
        </div>

        {/* Locked content teaser */}
        <div className="bg-surface-container-low rounded-lg p-5 mb-8 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-[2px] bg-background/40" />
          <div className="relative z-10 w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant">lock</span>
          </div>
          <div className="relative z-10">
            <p className="font-body font-semibold text-sm text-on-surface">
              {t('preview.lockedTitle')}
            </p>
            <p className="font-label text-xs text-on-surface-variant mt-0.5">
              {t('preview.lockedSub')}
            </p>
          </div>
        </div>

        {/* Why create an account */}
        <div className="mb-8">
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-5">
            {t('preview.whyTitle')}
          </p>
          <div className="flex flex-col gap-4">
            {why.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">{WHY_ICONS[i]}</span>
                </div>
                <div>
                  <p className="font-body font-semibold text-sm text-on-surface">{item.title}</p>
                  <p className="font-label text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/signup', { state: { struggles, notes } })}
          className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all"
        >
          {t('preview.cta')}
        </button>

        <button
          onClick={() => navigate('/login')}
          className="mt-4 text-center text-xs text-on-surface-variant/50 font-label uppercase tracking-widest"
        >
          {t('preview.haveAccount')}
        </button>

      </div>
    </div>
  )
}