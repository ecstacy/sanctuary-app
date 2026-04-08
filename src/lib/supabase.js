import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    // PKCE flow: code verifier is stored in WebView localStorage before
    // opening system browser. Redirect returns ?code=xxx (query param),
    // which Android preserves (unlike #fragment which gets stripped).
    flowType: 'pkce',
  }
})