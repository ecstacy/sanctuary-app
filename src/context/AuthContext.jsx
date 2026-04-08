import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Capacitor } from '@capacitor/core'
import { registerPlugin } from '@capacitor/core'

// Minimal plugin to open URLs in the actual system browser (not Custom Chrome Tab)
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
    const redirectTo = Capacitor.isNativePlatform()
      ? 'com.sanctuary.app://login'
      : window.location.origin

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: Capacitor.isNativePlatform(),
      },
    })

    if (error) return { error }

    // On native, open in the actual system browser (not Custom Chrome Tab).
    // Custom Chrome Tabs swallow custom-scheme redirects — they never reach
    // the app's intent filter. The system browser properly fires the intent.
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