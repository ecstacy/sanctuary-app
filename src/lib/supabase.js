import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    // Implicit flow: tokens come in the URL fragment. The oauth-redirect
    // edge function captures them client-side (JS) and presents a button
    // with tokens as query params for the deep link back to the app.
    flowType: 'implicit',
  }
})