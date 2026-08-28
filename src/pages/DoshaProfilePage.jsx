import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import DoshaProfileContent from '../components/DoshaProfileContent'
import DoshaGem from '../components/DoshaGem'
import VikritiHistoryChart from '../components/VikritiHistoryChart'
import { useCurrentDoshaState } from '../hooks/useCurrentDoshaState'
import { useVikritiHistory } from '../hooks/useVikritiHistory'
import { doshaDisplayName, doshaDisplayNames } from '../i18n/contentI18n'

// The "this week / current state" lead — the SAME reading the Home state card
// shows, so tapping the card continues the story instead of contradicting it.
// Shown only when today's reading is a live imbalance that differs from the
// baseline; otherwise the constitution stands on its own below.
function ThisWeekLead({ t, onBack, state, history }) {
  const name = state.currentDoshas?.length ? doshaDisplayNames(state.currentDoshas) : doshaDisplayName(state.currentDosha)
  return (
    <div className="px-6 pt-3">
      <header className="flex items-center py-2 -ml-1">
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center"
          aria-label={t('common.back', 'Back')}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">arrow_back</span>
        </button>
      </header>

      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 mt-1">
        <p className="font-label text-xs uppercase tracking-widest text-primary mb-1">
          {t('doshaProfile.thisWeekTitle', 'This week — your current state')}
        </p>
        <h1 className="font-headline text-2xl leading-snug mb-3">
          {t('doshaProfile.thisWeekLean', { dosha: name, defaultValue: 'You’re running {{dosha}}-high right now.' })}
        </h1>

        {state.currentPercentages && (
          <div className="flex justify-center my-2">
            <DoshaGem percentages={state.currentPercentages} dominant={state.currentDosha} size={148} />
          </div>
        )}

        {history?.daysTracked > 0 && (
          <div className="mt-3">
            <p className="font-label text-[11px] uppercase tracking-wide text-on-surface-variant mb-2">
              {t('doshaProfile.thisWeekTrend', 'Recent trend')}
            </p>
            <VikritiHistoryChart history={history} />
          </div>
        )}

        {/* The bridge: name the relationship so the two numbers stop reading as
            a contradiction. */}
        <p className="font-body text-[13px] text-on-surface-variant leading-relaxed mt-4">
          {t('doshaProfile.thisWeekBridge', 'Your constitution below is your baseline. This is how you’re leaning today, read against it.')}
        </p>
      </div>

      <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-7 mb-1 px-1">
        {t('doshaProfile.yourConstitution', 'Your constitution')}
      </p>
    </div>
  )
}

export default function DoshaProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { profile } = useAuth()
  const state = useCurrentDoshaState()
  const history = useVikritiHistory(30)

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

  // Lead with the current-state section only when today's reading is a live
  // imbalance that differs from the baseline. When it matches the constitution
  // (or there's no signal), the constitution stands alone — no duplicate.
  const showThisWeek = state.isElevated && !state.matchesPrakriti

  return (
    <DoshaProfileContent
      sections="overview"
      doshaLabel={doshaLabel}
      primary={primary}
      secondary={secondary}
      tertiary={tertiary}
      percentages={percentages}
      // When the lead is shown it owns the back button; otherwise the hero does.
      onBack={showThisWeek ? null : () => navigate(-1)}
      leadSlot={showThisWeek
        ? <ThisWeekLead t={t} onBack={() => navigate(-1)} state={state} history={history} />
        : null}
      footerSlot={
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/quiz')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-container rounded-full font-label text-xs text-on-surface-variant uppercase tracking-widest active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">refresh</span>
            {t('doshaProfile.retakeQuiz')}
          </button>
        </div>
      }
    />
  )
}
