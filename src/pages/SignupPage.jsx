import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signUp, signInWithGoogle } = useAuth()

  // Struggles passed from DiscoverPage → PreviewPage → here
  const { struggles = [], notes = '' } = location.state || {}

  const [step, setStep] = useState(1)
  const [language, setLanguage] = useState('en')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  setLoading(false)
}

  return (
    <div className="h-screen bg-background text-on-surface font-body flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/preview', { state: { struggles, notes } })}
          className="text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <span className="font-headline italic text-primary text-base">The Sanctuary</span>
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
                Almost there
              </p>
              <h1 className="font-headline text-4xl text-on-surface leading-tight">
                Choose your{' '}
                <span className="italic font-normal">language.</span>
              </h1>
              <p className="text-on-surface-variant text-sm mt-3 leading-relaxed">
                The Sanctuary is available in English and German.
              </p>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              {[
                { code: 'en', label: 'English', sublabel: 'Continue in English', flag: '🇬🇧' },
                { code: 'de', label: 'Deutsch', sublabel: 'Auf Deutsch fortfahren', flag: '🇩🇪' },
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-4 p-5 rounded-lg transition-all ${
                    language === lang.code
                      ? 'bg-primary-container'
                      : 'bg-surface-container'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="font-body font-semibold text-base text-on-surface">{lang.label}</p>
                    <p className="font-label text-xs text-on-surface-variant mt-0.5">{lang.sublabel}</p>
                  </div>
                  {language === lang.code && (
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  )}
                </button>
              ))}
            </div>

            {/* Show selected struggles as confirmation */}
            {struggles.length > 0 && (
              <div className="bg-surface-container-low rounded-lg p-4 mb-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">check_circle</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  We've noted your focus areas:{' '}
                  <span className="text-on-surface font-semibold capitalize">
                    {struggles.join(', ')}
                  </span>
                  . These will shape your practice from day one.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all flex-shrink-0 mt-4"
          >
            Continue
          </button>
        </div>
      )}

      {/* ── Step 2: Name + Email + Password ── */}
      {step === 2 && (
        <div className="flex-1 flex flex-col px-6 pb-8 min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="mb-8">
              <p className="font-label text-xs text-primary uppercase tracking-widest mb-2">
                Create your account
              </p>
              <h1 className="font-headline text-4xl text-on-surface leading-tight">
                Your sanctuary{' '}
                <span className="italic font-normal">awaits.</span>
              </h1>
              <p className="text-on-surface-variant text-sm mt-3 leading-relaxed">
                Free forever. No credit card needed.
              </p>
            </div>

            <div className="flex flex-col gap-5 mb-6">

              {/* Full name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Elena Rossi"
                  className="bg-surface-container-low rounded-lg px-4 py-4 text-on-surface font-body text-sm outline-none focus:bg-surface-container transition-colors placeholder:text-on-surface-variant/40"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-surface-container-low rounded-lg px-4 py-4 text-on-surface font-body text-sm outline-none focus:bg-surface-container transition-colors placeholder:text-on-surface-variant/40"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  className="bg-surface-container-low rounded-lg px-4 py-4 text-on-surface font-body text-sm outline-none focus:bg-surface-container transition-colors placeholder:text-on-surface-variant/40"
                />
              </div>

              {/* Privacy note */}
              <div className="flex items-start gap-3 bg-surface-container-low rounded-lg p-4">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">lock</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your data is encrypted and never shared with third parties. You can delete your account and all data at any time.
                </p>
              </div>

            </div>

            {error && (
              <div className="bg-[#fde8e0] text-[#a73b21] text-xs font-label px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (!fullName || !email || password.length < 8) {
                setError('Please fill in all fields. Password must be at least 8 characters.')
                return
              }
              setError('')
              handleSignup()
            }}
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all disabled:opacity-50 flex-shrink-0 mt-4"
          >
            {loading ? 'Creating your sanctuary...' : 'Begin My Journey'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-4 flex-shrink-0">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="font-label text-xs text-on-surface-variant/50 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          {/* Google sign-up button */}
          <button
            onClick={async () => {
              setError('')
              const { error } = await signInWithGoogle()
              if (error) setError(error.message)
            }}
            className="w-full py-4 bg-surface-container flex items-center justify-center gap-3 rounded-full font-label text-sm text-on-surface tracking-wide active:scale-95 transition-all flex-shrink-0"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <p className="text-center text-xs text-on-surface-variant/60 font-label mt-4 flex-shrink-0">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-semibold"
            >
              Sign in
            </button>
          </p>

        </div>
      )}

    </div>
  )
}