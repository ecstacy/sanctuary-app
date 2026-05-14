import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Capacitor } from '@capacitor/core'
import { registerPlugin } from '@capacitor/core'
import { syncLanguageFromProfile } from '../i18n'
import { hydrateFromProfile as hydrateConsentFromProfile } from '../lib/consent'
import { identify, setSuperProps, reset as resetAnalytics, track, EVENTS } from '../lib/track'
import { setUserId as crashSetUserId, setCustomKey as crashSetCustomKey, reset as resetCrash } from '../lib/crash'

// Opens URLs in the actual system browser (not Custom Chrome Tab)
// CCTs on some Android devices block custom-scheme redirects entirely.
const ExternalBrowser = registerPlugin('ExternalBrowser', {
  web: {
    async open({ url }) { window.open(url, '_blank') }
  }
})

const AuthContext = createContext({})

// ─── Profile cache ────────────────────────────────────────────────────
// Persists the most-recent profile snapshot per user so the next app
// open hydrates the dosha-theme + display name + stats SYNCHRONOUSLY
// instead of flashing the default sage palette + missing name for
// 500-1500ms while the background fetch resolves. Same pattern as
// useVikritiSchedule / usePracticeStats.
const PROFILE_CACHE_KEY = 'sanctuary.profile.v1'

function readProfileCache(userId) {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (cached?.userId !== userId) return null   // different user → don't leak
    return cached.profile || null
  } catch { return null }
}

function writeProfileCache(userId, profile) {
  if (!userId || !profile) return
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ userId, profile }))
  } catch { /* quota — non-fatal */ }
}

function clearProfileCache() {
  try { localStorage.removeItem(PROFILE_CACHE_KEY) } catch { /* ignore */ }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authTransitioning, setAuthTransitioning] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        // ── Synchronous hydration ────────────────────────────────────
        // Read the cached profile snapshot for THIS user and apply it
        // before the network fetch runs. The DoshaThemeProvider and
        // HomePage now render with real data on first paint — no flash
        // from default sage palette to dosha palette, no missing name
        // for half a second. Fresh data overrides this once it arrives.
        const cached = readProfileCache(sessionUser.id)
        if (cached) {
          setProfile(cached)
          setLoading(false)
        }
        fetchProfile(sessionUser.id)
      }
      else setLoading(false)
    })

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUser = session?.user ?? null
        setUser(newUser)
        setAuthTransitioning(false)
        if (newUser) {
          // Same hydration pattern for token-refresh / SIGNED_IN events
          const cached = readProfileCache(newUser.id)
          if (cached) {
            setProfile(cached)
            setLoading(false)
          }
          fetchProfile(newUser.id)
          // Surface real-auth events to the product analytics layer.
          // SIGNED_IN fires on every page load with a valid token, so we
          // gate by event to avoid double-counting; PostHog itself dedupes
          // person identification but we still want a clean signal.
          if (event === 'SIGNED_IN') {
            track(EVENTS.LOGIN_SUCCEEDED, { method: session.user.app_metadata?.provider || 'email' })
          }
        }
        else {
          setProfile(null)
          setLoading(false)
          // Logout — clear the analytics identity so the next anon session
          // can't be back-joined to the prior user.
          if (event === 'SIGNED_OUT') {
            clearProfileCache()
            resetAnalytics()
            resetCrash()
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    // Unblock the UI as soon as we know the user is authenticated.
    // The profile network call below proceeds in the background; pages
    // like HomePage gracefully render skeletons until `profile` arrives.
    // This is the primary fix for the multi-second "loading…" delay
    // after Google OAuth — we used to block on this query.
    setLoading(false)

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) console.error('Failed to fetch profile:', error.message)
    setProfile(data)
    // Cache the fresh profile so the next app open hydrates instantly
    // — no theme flash, no missing-name flash. Cleared on signOut.
    if (data) writeProfileCache(userId, data)
    // Apply the account-level language preference if one is stored on the
    // profile. Falls through silently when the column isn't present yet
    // (the migration is optional — see docs/i18n.md).
    if (data?.language) syncLanguageFromProfile(data.language)
    // Merge the per-account consent state with the local one. The consent
    // module keeps whichever decision is newer — safe if the column
    // doesn't exist yet (undefined → no-op).
    if (data?.analytics_consent) hydrateConsentFromProfile(data.analytics_consent)

    // ── Migrate anonymous dosha quiz result, if present ──────────────
    // The Dosha Quiz is publicly accessible; first-time users can take
    // it before creating an account. The result is stashed in
    // localStorage under `sanctuary.pending.dosha`. Once they sign in
    // (any method — email, Google, Apple), pull it into their profile
    // here. Only migrate if the profile doesn't already have a dosha,
    // so this is safe to call on every fetch.
    if (data && !data.dosha) {
      try {
        const raw = localStorage.getItem('sanctuary.pending.dosha')
        if (raw) {
          const pending = JSON.parse(raw)
          if (pending?.primary) {
            const { error: doshaErr } = await supabase
              .from('profiles')
              .update({
                dosha: pending.label,
                dosha_details: {
                  percentages: pending.percentages,
                  primary:     pending.primary,
                  secondary:   pending.secondary,
                  tertiary:    pending.tertiary,
                },
              })
              .eq('id', userId)
            if (doshaErr) console.error('Pending dosha migrate failed:', doshaErr.message)
            else {
              // Mutate the cached `data` so the rest of fetchProfile
              // (analytics identify, super-props) sees the fresh values
              // without an extra round-trip.
              data.dosha = pending.label
              data.dosha_details = {
                percentages: pending.percentages,
                primary:     pending.primary,
                secondary:   pending.secondary,
                tertiary:    pending.tertiary,
              }
            }

            // Append the historical assessment row so the user's quiz
            // history shows the date they actually took it (not signup).
            const { error: assessErr } = await supabase
              .from('dosha_assessments')
              .insert({
                user_id:         userId,
                assessment_type: 'prakriti',
                primary_dosha:   pending.primary,
                secondary_dosha: pending.secondary,
                vata_score:      pending.scores?.vata,
                pitta_score:     pending.scores?.pitta,
                kapha_score:     pending.scores?.kapha,
                quiz_version:    'v1',
                raw_details:     pending,
              })
            if (assessErr) console.error('Pending assessment insert failed:', assessErr.message)
          }
          localStorage.removeItem('sanctuary.pending.dosha')
        }
      } catch (err) {
        console.error('Pending dosha migrate threw:', err?.message || err)
      }
    }

    // ── Bind product analytics identity ────────────────────────────────
    // Identify aliases the prior anonymous distinct_id to the user's id,
    // so events fired before login (e.g. signup_started) get attributed
    // to the correct person. Super-props travel on every subsequent event.
    // Stats-derived props (experience_minutes, streak_days, experience_level)
    // are added later from the surfaces that already load them
    // (HomePage / JourneyPage), to keep AuthContext free of stat queries.
    if (userId) {
      try {
        const dosha = data?.dosha_details || {}
        identify(userId, {
          dosha_primary:    dosha.primary || data?.dosha?.toLowerCase() || null,
          dosha_secondary:  dosha.secondary || null,
          vikriti_primary:  data?.vikriti_details?.primary || null,
        })
        setSuperProps({
          platform:         Capacitor.getPlatform(),       // 'web' | 'android' | 'ios'
          app_version:      import.meta.env.VITE_APP_VERSION || 'dev',
          dosha_primary:    dosha.primary || data?.dosha?.toLowerCase() || null,
          dosha_secondary:  dosha.secondary || null,
          vikriti_primary:  data?.vikriti_details?.primary || null,
          consent_aggregate: true,                          // identify only fires when consent is on
        })
        // Crashlytics — independently consent-gated (crash flag, not
        // aggregate). Internal calls no-op if the user hasn't opted in.
        crashSetUserId(userId)
        crashSetCustomKey('dosha_primary',   dosha.primary || data?.dosha?.toLowerCase() || 'none')
        crashSetCustomKey('app_version',     import.meta.env.VITE_APP_VERSION || 'dev')
        crashSetCustomKey('platform',        Capacitor.getPlatform())
      } catch (err) {
        // Never let analytics break auth.
        console.error('analytics identify failed:', err?.message || err)
      }
    }
    // Loading was cleared at the top of fetchProfile so the UI shows
    // immediately on session — no need to flip it again here.
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
    // PKCE flow: Supabase redirects the OAuth response directly back to
    // the app via the custom scheme (declared in AndroidManifest.xml).
    // No GitHub-Pages middleman, no user-tap-to-continue. DeepLinkHandler
    // catches the `?code=…` param and calls exchangeCodeForSession.
    const redirectTo = Capacitor.isNativePlatform()
      ? 'com.sanctuary.app://auth-callback'
      : `${window.location.origin}/auth-callback`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: Capacitor.isNativePlatform(),
      },
    })

    if (error) return { error }

    // On native, open Google's OAuth page in the system browser. Custom
    // Chrome Tabs (CCT) used to block custom-scheme redirects on some
    // Android 12+ devices; modern WebView versions handle it, but the
    // external browser is still the most reliable surface.
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