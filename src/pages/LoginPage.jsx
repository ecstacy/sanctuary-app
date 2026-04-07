import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BiometricAuth, BiometryType } from '@aparajita/capacitor-biometric-auth'

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
        <div className="mb-10">
          <p className="font-label text-xs text-primary uppercase tracking-widest mb-2">Welcome back</p>
          <h1 className="font-headline text-4xl text-on-surface leading-tight">
            Return to your <span className="italic font-normal">practice.</span>
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginWithSave} className="flex flex-col gap-5">

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

          {error && (
            <div className="bg-[#fde8e0] text-[#a73b21] text-xs font-label px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
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
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
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