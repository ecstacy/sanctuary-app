import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ErrorAlert from '../components/ErrorAlert'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
        return
      }
      setError('Please tap the reset link in your email first, then return here.')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
          setSessionReady(true)
          setError('')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function handleReset(e) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
    setTimeout(() => navigate('/home'), 2000)
  }

  return (
    <div className="h-[100dvh] bg-background text-on-surface font-body flex flex-col overflow-hidden">

      <div className="flex items-center justify-between px-6 py-5 flex-shrink-0">
        <div className="w-6" />
        <span className="font-headline italic text-primary text-base">The Sanctuary</span>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-10 flex flex-col">
        <div className="min-h-full flex flex-col justify-center py-6">

        {!sessionReady ? (
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-2xl text-primary">mark_email_read</span>
            </div>
            <p className="font-label text-xs text-primary uppercase tracking-widest mb-3">
              One more step
            </p>
            <h2 className="font-headline text-3xl text-on-surface mb-4">
              Check your email first.
            </h2>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-8">
              Tap the reset link in your email. It will open in your browser and verify your identity. Then come back here.
            </p>
            {error && (
              <div className="bg-surface-container-low rounded-lg px-4 py-3 w-full">
                <p className="text-xs text-on-surface-variant font-label">{error}</p>
              </div>
            )}
            <button
              onClick={() => navigate('/login')}
              className="mt-6 text-xs text-primary font-label uppercase tracking-widest"
            >
              Back to sign in
            </button>
          </div>

        ) : !done ? (
          <>
            <div className="mb-10">
              <p className="font-label text-xs text-primary uppercase tracking-widest mb-2">
                New Password
              </p>
              <h1 className="font-headline text-4xl text-on-surface leading-tight">
                Choose a new <span className="italic font-normal">password.</span>
              </h1>
              <p className="text-on-surface-variant text-sm mt-3 leading-relaxed">
                Make it strong and something you'll remember.
              </p>
            </div>

            <form onSubmit={handleReset} className="flex flex-col gap-5">

              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                  className="bg-surface-container-low rounded-lg px-4 py-4 text-on-surface font-body text-sm outline-none focus:bg-surface-container transition-colors placeholder:text-on-surface-variant/40"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  minLength={8}
                  required
                  className="bg-surface-container-low rounded-lg px-4 py-4 text-on-surface font-body text-sm outline-none focus:bg-surface-container transition-colors placeholder:text-on-surface-variant/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { check: password.length >= 8, label: 'At least 8 characters' },
                  { check: /[A-Z]/.test(password), label: 'One uppercase letter' },
                  { check: /[0-9]/.test(password), label: 'One number' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-sm ${
                      item.check ? 'text-primary' : 'text-on-surface-variant/30'
                    }`}>
                      {item.check ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={`font-label text-xs ${
                      item.check ? 'text-on-surface' : 'text-on-surface-variant/50'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <ErrorAlert message={error} />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Updating...' : 'Set New Password'}
              </button>
            </form>
          </>

        ) : (
          <div className="flex flex-col items-center text-center">
            <div
              className="w-20 h-20 mb-8 flex items-center justify-center text-on-primary"
              style={{
                background: 'linear-gradient(135deg, #50644b, #d2e9c9)',
                borderRadius: '63% 37% 54% 46% / 45% 48% 52% 55%',
              }}
            >
              <span className="material-symbols-outlined text-2xl">check</span>
            </div>
            <h2 className="font-headline text-3xl text-on-surface mb-3">Password updated.</h2>
            <p className="text-on-surface-variant text-sm">Taking you home...</p>
          </div>
        )}

        </div>
      </div>
    </div>
  )
}