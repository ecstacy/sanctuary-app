import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth'
import GoogleIcon from '../components/GoogleIcon'
import ErrorAlert from '../components/ErrorAlert'

export default function LoginPage() {
  const navigate = useNavigate()
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
        setError('Biometric authentication is not available on this device.')
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
        setError('No saved credentials found. Please sign in with email and password first.')
        return
      }

      setLoading(true)
      const { error } = await signIn({ email: savedEmail, password: savedPassword })
      if (error) {
        setError(error.message)
        setLoading(false)
      }

    } catch (err) {
      // User cancelled or biometric failed
      if (err.message !== 'Cancel') {
        setError('Biometric authentication failed. Please use email and password.')
      }
    }
  }

  async function handleLoginWithSave(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Save credentials for future biometric login
    localStorage.setItem('sanctuary_email', email)
    localStorage.setItem('sanctuary_password', password)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <button
          onClick={() => navigate('/')}
          className="text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <span className="font-headline italic text-primary text-base">The Sanctuary</span>
        <div className="w-6" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-12">

        {/* Heading */}
        <div className="mb-10 stagger-1">
          <p className="font-label text-xs text-primary uppercase tracking-widest mb-2">Welcome back</p>
          <h1 className="font-headline text-4xl text-on-surface leading-tight">
            Return to your <span className="italic font-normal">practice.</span>
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginWithSave} className="flex flex-col gap-5 stagger-2">

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="bg-surface-container-low rounded-lg px-4 py-4 text-on-surface font-body text-sm outline-none focus:bg-surface-container transition-colors placeholder:text-on-surface-variant/40"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-surface-container-low rounded-lg px-4 py-4 text-on-surface font-body text-sm outline-none focus:bg-surface-container transition-colors placeholder:text-on-surface-variant/40"
            />
          </div>

         <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-primary font-label text-right tracking-wide"
            >
               Forgot password?
        </button>

          <ErrorAlert message={error} />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8 stagger-3">
          <div className="flex-1 h-px bg-outline-variant/30" />
          <span className="font-label text-xs text-on-surface-variant/50 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-outline-variant/30" />
        </div>

        {/* Google sign-in button */}
        <button
          onClick={async () => {
            setError('')
            const { error } = await signInWithGoogle()
            if (error) setError(error.message)
          }}
          className="w-full py-4 bg-surface-container flex items-center justify-center gap-3 rounded-full font-label text-sm text-on-surface tracking-wide active:scale-95 transition-all"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Biometric button */}
        <button
          onClick={handleBiometric}
          className="w-full py-4 bg-surface-container flex items-center justify-center gap-3 rounded-full font-label text-sm text-on-surface-variant tracking-wide mt-3 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-xl text-primary">fingerprint</span>
          Use Biometric Login
        </button>

        {/* Reset password entry point */}
        <button
          onClick={() => navigate('/reset-password')}
          className="w-full py-4 bg-surface-container-low flex items-center justify-center gap-3 rounded-full font-label text-sm text-on-surface-variant tracking-wide mt-3 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-xl text-primary">lock_reset</span>
          I have a reset link
        </button>

        <p className="text-center text-xs text-on-surface-variant/60 font-label mt-10">
          New here?{' '}
          <button
            onClick={() => navigate('/discover')}
            className="text-primary font-semibold"
          >
            Start your journey
          </button>
        </p>

      </div>
    </div>
  )
}