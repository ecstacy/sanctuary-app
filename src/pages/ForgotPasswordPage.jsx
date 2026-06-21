import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import ErrorAlert from '../components/ErrorAlert'
import { track, EVENTS } from '../lib/track'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleReset(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Email is intentionally NOT included — PII scrubbing in track.js
    // would drop it anyway, but better to never put it on the wire.
    track(EVENTS.PASSWORD_RESET_REQUESTED)
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="h-[100dvh] bg-background text-on-surface font-body flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 flex-shrink-0">
        <button
          onClick={() => navigate('/login')}
          className="text-on-surface-variant"
          aria-label={t('auth.forgot.backToLogin')}
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <span className="font-headline italic text-primary text-base">The Sanctuary</span>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-10 flex flex-col">
        <div className="min-h-full flex flex-col justify-center py-6">

        {!sent ? (
          <>
            {/* Heading */}
            <div className="mb-10">
              <p className="font-label text-xs text-primary uppercase tracking-widest mb-2">
                {t('auth.forgot.kicker')}
              </p>
              <h1 className="font-headline text-4xl text-on-surface leading-tight">
                {t('auth.forgot.heading1')} <span className="italic font-normal">{t('auth.forgot.headingAccent')}</span>
              </h1>
              <p className="text-on-surface-variant text-sm mt-3 leading-relaxed">
                {t('auth.forgot.subtitle')}
              </p>
            </div>

            <form onSubmit={handleReset} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                  {t('auth.forgot.emailLabel')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('auth.forgot.emailPlaceholder')}
                  required
                  className="bg-surface-container-low rounded-lg px-4 py-4 text-on-surface font-body text-sm outline-none focus:bg-surface-container transition-colors placeholder:text-on-surface-variant/40"
                  aria-label={t('auth.forgot.emailAria')}
                />
              </div>

              {/* Security note */}
              <div className="flex items-start gap-3 bg-surface-container-low rounded-lg p-4">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">lock</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {t('auth.forgot.securityNote')}
                </p>
              </div>

              <ErrorAlert message={error} />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? t('auth.forgot.sending') : t('auth.forgot.sendLink')}
              </button>
            </form>
          </>
        ) : (
          /* Success state */
          <div className="flex flex-col items-center text-center">
            <div
              className="w-20 h-20 mb-8 flex items-center justify-center text-on-primary"
              style={{
                background: 'linear-gradient(135deg, #50644b, #d2e9c9)',
                borderRadius: '63% 37% 54% 46% / 45% 48% 52% 55%',
              }}
            >
              <span className="material-symbols-outlined text-2xl">mark_email_read</span>
            </div>

            <p className="font-label text-xs text-primary uppercase tracking-widest mb-3">
              {t('auth.forgot.checkInbox')}
            </p>
            <h2 className="font-headline text-3xl text-on-surface mb-4">
              {t('auth.forgot.sentTitle')}
            </h2>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-2">
              {t('auth.forgot.sentTo')}
            </p>
            <p className="font-body font-semibold text-on-surface text-sm mb-6">
              {email}
            </p>
            <p className="text-on-surface-variant text-xs leading-relaxed mb-10 max-w-xs">
                {t('auth.forgot.sentInstr')}
                </p>

            {/* Resend option */}
            <button
              onClick={() => setSent(false)}
              className="text-xs text-primary font-label uppercase tracking-widest"
            >
              {t('auth.forgot.tryAgain')}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full py-4 bg-surface-container text-on-surface rounded-full font-label text-sm tracking-wide"
            >
              {t('auth.forgot.backToSignIn')}
            </button>
          </div>
        )}

        </div>
      </div>
    </div>
  )
}