import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import i18n from '../i18n'
import {
  orderLanguagesForRegion,
  detectDefaultLanguage,
  writeStoredLanguage,
} from '../i18n/detect'
import GoogleIcon from '../components/GoogleIcon'
import ErrorAlert from '../components/ErrorAlert'
import { track, identify, EVENTS } from '../lib/track'

export default function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signUp, signInWithGoogle } = useAuth()
  const { t } = useTranslation()

  // Struggles passed from DiscoverPage → PreviewPage → here
  const { struggles = [], notes = '' } = location.state || {}

  const [step, setStep] = useState(1)
  // Pre-fill with whatever detection already set on i18n (which either
  // came from a sticky localStorage choice or the device locale heuristic).
  // Falls back to 'en' defensively.
  const [language, setLanguage] = useState(
    () => i18n.language || detectDefaultLanguage() || 'en'
  )
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Mount-only: capture signup funnel entry once per page load.
    // struggles comes from location.state which is stable after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    track(EVENTS.SIGNUP_STARTED, { has_struggles: struggles.length > 0 })
  }, [])

  // Region-ordered list so an Indian-region device sees Hindi first, a DACH
  // device sees Deutsch first, English is always present as a fallback.
  const orderedLanguages = useMemo(() => orderLanguagesForRegion(), [])

  // Switch UI preview as the user clicks options — they see the app flip
  // language in real time before committing. Persist to localStorage so the
  // choice sticks even if they back out and restart.
  function handlePickLanguage(code) {
    setLanguage(code)
    i18n.changeLanguage(code)
    writeStoredLanguage(code)
  }

  async function handleSignup() {
    setError('')
    setLoading(true)

    const { data, error: signUpError } = await signUp({
      email,
      password,
      fullName,
      language,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Save struggles using the user id from signup response
    const userId = data?.user?.id
    if (struggles.length > 0 && userId) {
      const { error: struggleError } = await supabase
        .from('user_struggles')
        .insert(
          struggles.map(s => ({
            user_id: userId,
            struggle_type: s,
          }))
        )
      if (struggleError) console.error('Struggles save failed:', struggleError.message)
    }

    if (userId) identify(userId, { language })
    track(EVENTS.SIGNUP_COMPLETED, {
      method: 'email',
      language,
      has_struggles: struggles.length > 0,
      struggle_count: struggles.length,
    })

    setLoading(false)
  }

  return (
    <div className="h-screen bg-background text-on-surface font-body flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/preview', { state: { struggles, notes } })}
          className="text-on-surface-variant"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <span className="font-headline italic text-primary text-base">{t('app.name')}</span>
        <div className="w-6" />
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pb-6">
        {[1, 2].map(i => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === step
                ? 'w-6 h-2 bg-primary'
                : i < step
                ? 'w-2 h-2 bg-primary/40'
                : 'w-2 h-2 bg-surface-container-high'
            }`}
          />
        ))}
      </div>

      {/* ── Step 1: Language ── */}
      {step === 1 && (
        <div className="flex-1 flex flex-col px-6 pb-8 min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="mb-8">
              <p className="font-label text-xs text-primary uppercase tracking-widest mb-2">
                {t('signup.step1.kicker')}
              </p>
              <h1 className="font-headline text-4xl text-on-surface leading-tight">
                {t('signup.step1.title')}{' '}
                <span className="italic font-normal">{t('signup.step1.titleItalic')}</span>
              </h1>
              <p className="text-on-surface-variant text-sm mt-3 leading-relaxed">
                {t('signup.step1.subtitle')}
              </p>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              {orderedLanguages.map(code => {
                const meta = t(`languages.${code}`, { returnObjects: true }) || {}
                return (
                  <button
                    key={code}
                    onClick={() => handlePickLanguage(code)}
                    className={`flex items-center gap-4 p-5 rounded-lg transition-all ${
                      language === code
                        ? 'bg-primary-container'
                        : 'bg-surface-container'
                    }`}
                  >
                    <span className="text-2xl">{meta.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="font-body font-semibold text-base text-on-surface">{meta.label}</p>
                      <p className="font-label text-xs text-on-surface-variant mt-0.5">{meta.sublabel}</p>
                    </div>
                    {language === code && (
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Show selected struggles as confirmation */}
            {struggles.length > 0 && (
              <div className="bg-surface-container-low rounded-lg p-4 mb-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">check_circle</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {t('signup.step1.strugglesNote')}{' '}
                  <span className="text-on-surface font-semibold capitalize">
                    {struggles.join(', ')}
                  </span>
                  {t('signup.step1.strugglesNoteTail')}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              track(EVENTS.SIGNUP_STEP_COMPLETED, { step: 1, language })
              setStep(2)
            }}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all flex-shrink-0 mt-4"
          >
            {t('common.continue')}
          </button>
        </div>
      )}

      {/* ── Step 2: Name + Email + Password ── */}
      {step === 2 && (
        <div className="flex-1 flex flex-col px-6 pb-8 min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="mb-8">
              <p className="font-label text-xs text-primary uppercase tracking-widest mb-2">
                {t('signup.step2.kicker')}
              </p>
              <h1 className="font-headline text-4xl text-on-surface leading-tight">
                {t('signup.step2.title')}{' '}
                <span className="italic font-normal">{t('signup.step2.titleItalic')}</span>
              </h1>
              <p className="text-on-surface-variant text-sm mt-3 leading-relaxed">
                {t('signup.step2.subtitle')}
              </p>
            </div>

            <div className="flex flex-col gap-5 mb-6">

              {/* Full name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                  {t('signup.step2.fullName')}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder={t('signup.step2.fullNamePlaceholder')}
                  className="bg-surface-container-low rounded-lg px-4 py-4 text-on-surface font-body text-sm outline-none focus:bg-surface-container transition-colors placeholder:text-on-surface-variant/40"
                  aria-label="Full name"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                  {t('signup.step2.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('signup.step2.emailPlaceholder')}
                  className="bg-surface-container-low rounded-lg px-4 py-4 text-on-surface font-body text-sm outline-none focus:bg-surface-container transition-colors placeholder:text-on-surface-variant/40"
                  aria-label="Email address"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                  {t('signup.step2.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('signup.step2.passwordPlaceholder')}
                  minLength={8}
                  className="bg-surface-container-low rounded-lg px-4 py-4 text-on-surface font-body text-sm outline-none focus:bg-surface-container transition-colors placeholder:text-on-surface-variant/40"
                  aria-label="Password"
                />
              </div>

              {/* Privacy note */}
              <div className="flex items-start gap-3 bg-surface-container-low rounded-lg p-4">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">lock</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {t('signup.step2.privacy')}
                </p>
              </div>

            </div>

            <ErrorAlert message={error} />
          </div>

          <button
            onClick={() => {
              if (!fullName || !email || password.length < 8) {
                setError(t('signup.step2.validationError'))
                return
              }
              setError('')
              handleSignup()
            }}
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all disabled:opacity-50 flex-shrink-0 mt-4"
          >
            {loading ? t('signup.step2.ctaLoading') : t('signup.step2.cta')}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-4 flex-shrink-0">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="font-label text-xs text-on-surface-variant/50 uppercase tracking-widest">{t('common.or')}</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          {/* Google sign-up button */}
          <button
            onClick={async () => {
              setError('')
              const { error } = await signInWithGoogle()
              if (error) {
                setError(error.message)
              } else {
                track(EVENTS.SIGNUP_COMPLETED, { method: 'google', language })
              }
            }}
            className="w-full py-4 bg-surface-container flex items-center justify-center gap-3 rounded-full font-label text-sm text-on-surface tracking-wide active:scale-95 transition-all flex-shrink-0"
          >
            <GoogleIcon />
            {t('signup.step2.googleCta')}
          </button>

          <p className="text-center text-xs text-on-surface-variant/60 font-label mt-4 flex-shrink-0">
            {t('signup.step2.haveAccount')}{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-semibold"
            >
              {t('signup.step2.signIn')}
            </button>
          </p>

        </div>
      )}

    </div>
  )
}
