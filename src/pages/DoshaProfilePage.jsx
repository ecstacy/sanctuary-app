import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import DoshaProfileContent from '../components/DoshaProfileContent'

export default function DoshaProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { profile } = useAuth()

  const doshaLabel = profile?.dosha || null
  const details    = profile?.dosha_details || null

  const primary     = details?.primary    || doshaLabel?.toLowerCase() || null
  const secondary   = details?.secondary  || null
  const tertiary    = details?.tertiary   || null
  const percentages = details?.percentages || null

  // If no dosha saved, prompt the user to take the quiz
  if (!doshaLabel || !primary) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-8 stagger-1">
          <span className="material-symbols-outlined text-primary text-4xl">spa</span>
        </div>
        <h2 className="font-headline text-2xl text-on-surface text-center mb-3 stagger-2">
          {t('doshaProfile.awaitTitle')}
        </h2>
        <p className="font-body text-sm text-on-surface-variant text-center leading-relaxed mb-8 max-w-xs stagger-3">
          {t('doshaProfile.awaitBody')}
        </p>
        <button
          onClick={() => navigate('/quiz')}
          className="w-full max-w-xs py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all stagger-4"
        >
          {t('doshaProfile.takeQuiz')}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-xs text-on-surface-variant/50 font-label uppercase tracking-widest stagger-5"
        >
          {t('doshaProfile.goBack')}
        </button>
      </div>
    )
  }

  return (
    <DoshaProfileContent
      doshaLabel={doshaLabel}
      primary={primary}
      secondary={secondary}
      tertiary={tertiary}
      percentages={percentages}
      onBack={() => navigate(-1)}
      footerSlot={
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <button
            onClick={() => navigate('/quiz')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-container rounded-full font-label text-xs text-on-surface-variant uppercase tracking-widest active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">refresh</span>
            {t('doshaProfile.retakeQuiz')}
          </button>
          {/* TEMP (design review): direct /dietary entry while the page is
              still Plus-gated. Remove once the dietary redesign is signed off
              or a permanent free entry is decided. */}
          <button
            onClick={() => navigate('/dietary')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-label text-xs uppercase tracking-widest active:scale-95 transition-all"
          >
            TEMP → Dietary guidance
          </button>
        </div>
      }
    />
  )
}
