import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Capacitor } from '@capacitor/core'
import { registerPlugin } from '@capacitor/core'
import { syncLanguageFromProfile } from '../i18n'
import { hydrateFromProfile as hydrateConsentFromProfile } from '../lib/consent'

// Opens URLs in the actual system browser (not Custom Chrome Tab)
// CCTs on some Android devices block custom-scheme redirects entirely.
const ExternalBrowser = registerPlugin('ExternalBrowser', {
  web: {
    async open({ url }) { window.open(url, '_blank') }
  }
})

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authTransitioning, setAuthTransitioning] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        setAuthTransitioning(false)
        if (session?.user) fetchProfile(session.user.id)
        else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) console.error('Failed to fetch profile:', error.message)
    setProfile(data)
    // Apply the account-level language preference if one is stored on the
    // profile. Falls through silently when the column isn't present yet
    // (the migration is optional — see docs/i18n.md).
    if (data?.language) syncLanguageFromProfile(data.language)
    // Merge the per-account consent state with the local one. The consent
    // module keeps whichever decision is newer — safe if the column
    // doesn't exist yet (undefined → no-op).
    if (data?.analytics_consent) hydrateConsentFromProfile(data.analytics_consent)
    setLoading(false)
  }

  async function signUp({ email, password, fullName, language }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, language }
      }
    })
    return { data, error }
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  async function signInWithGoogle() {
    // On native, redirect through a static page hosted on GitHub Pages.
    // This page reads the implicit flow tokens from the URL fragment,
    // then shows a button linking to the app with tokens as query params.
    // (Supabase Edge Functions can't serve HTML; Android 12+ requires
    //  user-tapped links for custom scheme navigation)
    const redirectTo = Capacitor.isNativePlatform()
      ? 'https://ecstacy.github.io/sanctuary-app/oauth-callback.html'
      : window.location.origin

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: Capacitor.isNativePlatform(),
      },
    })

    if (error) return { error }

    // On native, open in the system browser (not CCT).
    // CCTs block custom-scheme redirects on some Android devices.
    if (Capacitor.isNativePlatform() && data?.url) {
      await ExternalBrowser.open({ url: data.url })
    }

    return { data, error: null }
  }

  async function refreshProfile() {
    // Fetch userId dynamically to avoid stale closure issues
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.id) await fetchProfile(session.user.id)
  }

  // Signal that an auth transition is in progress (e.g. OAuth callback)
  // so the app shows the loading screen instead of flashing the login page
  function setTransitioning(value) {
    setAuthTransitioning(value)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading: loading || authTransitioning,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      refreshProfile,
      setTransitioning
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)