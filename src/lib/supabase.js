import { createClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    // Native apps use system browser for OAuth — PKCE code verifier
    // can't be shared between WebView and browser, so use implicit flow
    flowType: Capacitor.isNativePlatform() ? 'implicit' : 'pkce',
  }
})