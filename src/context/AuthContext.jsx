import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Capacitor } from '@capacitor/core'
import { registerPlugin } from '@capacitor/core'

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
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
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

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)