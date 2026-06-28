import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth'
import GoogleIcon from '../components/GoogleIcon'
import ErrorAlert from '../components/ErrorAlert'
import { track, identify, EVENTS } from '../lib/track'

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { signIn, signInWithGoogle } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  async function handleBiometric() {
    setError('')
    try {
      // Check if biometrics are available on this device
      const info = await BiometricAuth.checkBiometry()

      if (!info.isAvailable) {
        setError(t('login.biometricUnavailable'))
        return
      }

      // Prompt the biometric dialog
      await BiometricAuth.authenticate({
        reason: 'Sign in to The Sanctuary',
        cancelTitle: 'Cancel',
        allowDeviceCredential: true,
        iosFallbackTitle: 'Use passcode',
        androidTitle: 'The Sanctuary',
        androidSubtitle: 'Confirm your identity',
        androidConfirmationRequired: false,
      })

      // Biometric succeeded — retrieve stored credentials
      const savedEmail = localStorage.getItem('sanctuary_email')
      const savedPassword = localStorage.getItem('sanctuary_password')

      if (!savedEmail || !savedPassword) {
        setError(t('login.noSavedCreds'))
        return
      }

      setLoading(true)
      const { error, data } = await signIn({ email: savedEmail, password: savedPassword })
      if (error) {
        setError(error.message)
        track(EVENTS.LOGIN_FAILED, { method: 'biometric', reason: 'credentials_invalid' })
        setLoading(false)
      } else {
        const userId = data?.user?.id
        if (userId) identify(userId)
        track(EVENTS.LOGIN_SUCCEEDED, { method: 'biometric' })
      }

    } catch (err) {
      // User cancelled or biometric failed
      if (err.message !== 'Cancel') {
        setError(t('login.biometricFailed'))
      }
    }
  }

  async function handleLoginWithSave(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error, data } = await signIn({ email, password })
    if (error) {
      setError(error.message)
      track(EVENTS.LOGIN_FAILED, { method: 'email', reason: 'invalid_credentials' })
      setLoading(false)
      return
    }

    const userId = data?.user?.id
    if (userId) identify(userId)
    track(EVENTS.LOGIN_SUCCEEDED, { method: 'email' })

    // Save credentials for future biometric login
    localStorage.setItem('sanctuary_email', email)
    localStorage.setItem('sanctuary_password', password)
    setLoading(false)
  }

  return (
    // Scrollable-middle layout: on tight viewports (small phones, Android
    // gesture bar, keyboard open), the form + sign-in button always stay
    // reachable via scroll. On tall viewports, min-h-full + justify-center
    // preserves the centered-hero look.
    <div className="h-[100dvh] bg-background text-on-surface font-body flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-on-surface-variant"
          aria-label={t('login.goBack')}
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <span className="font-headline italic text-primary text-base">The Sanctuary</span>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-10 flex flex-col">
        <div className="min-h-full flex flex-col justify-center py-6">

        {/* Heading */}
        <div className="mb-10 stagger-1">
          <p className="font-label text-xs text-primary uppercase tracking-widest mb-2">{t('login.title')}</p>
          <h1 className="font-headline text-4xl text-on-surface leading-tight">
            {t('login.heading1')} <span className="italic font-normal">{t('login.headingAccent')}</span>
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginWithSave} className="flex flex-col gap-5 stagger-2">

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
              {t('login.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('login.emailPlaceholder')}
              required
              className="bg-surface-container-low rounded-lg px-4 py-4 text-on-surface font-body text-sm outline-none focus:bg-surface-container transition-colors placeholder:text-on-surface-variant/40"
              aria-label={t('login.emailAria')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
              {t('login.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('login.passwordPlaceholder')}
              required
              className="bg-surface-container-low rounded-lg px-4 py-4 text-on-surface font-body text-sm outline-none focus:bg-surface-container transition-colors placeholder:text-on-surface-variant/40"
              aria-label={t('login.passwordAria')}
            />
          </div>

         <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-primary font-label text-right tracking-wide"
            >
               {t('login.forgotPassword')}
        </button>

          <ErrorAlert message={error} />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? t('login.ctaLoading') : t('login.cta')}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8 stagger-3">
          <div className="flex-1 h-px bg-outline-variant/30" />
          <span className="font-label text-xs text-on-surface-variant/50 uppercase tracking-widest">{t('common.or')}</span>
          <div className="flex-1 h-px bg-outline-variant/30" />
        </div>

        {/* Google sign-in button */}
        <button
          onClick={async () => {
            setError('')
            const { error } = await signInWithGoogle()
            if (error) {
              setError(error.message)
              track(EVENTS.LOGIN_FAILED, { method: 'google', reason: 'oauth_error' })
            } else {
              track(EVENTS.LOGIN_SUCCEEDED, { method: 'google' })
            }
          }}
          className="w-full py-4 bg-surface-container flex items-center justify-center gap-3 rounded-full font-label text-sm text-on-surface tracking-wide active:scale-95 transition-all"
        >
          <GoogleIcon />
          {t('login.continueWithGoogle')}
        </button>

        {/* Biometric button */}
        <button
          onClick={handleBiometric}
          className="w-full py-4 bg-surface-container flex items-center justify-center gap-3 rounded-full font-label text-sm text-on-surface-variant tracking-wide mt-3 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-xl text-primary">fingerprint</span>
          {t('login.biometric')}
        </button>

        {/* Reset password entry point */}
        <button
          onClick={() => navigate('/reset-password')}
          className="w-full py-4 bg-surface-container-low flex items-center justify-center gap-3 rounded-full font-label text-sm text-on-surface-variant tracking-wide mt-3 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-xl text-primary">lock_reset</span>
          {t('login.haveResetLink')}
        </button>

        <p className="text-center text-xs text-on-surface-variant/60 font-label mt-10">
          {t('login.newHere')}{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-primary font-semibold"
          >
            {t('login.startJourney')}
          </button>
        </p>

        </div>
      </div>
    </div>
  )
}