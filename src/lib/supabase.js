import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage,
    autoRefreshToken: true,
    // We handle the deep-link OAuth callback ourselves in DeepLinkHandler,
    // so Supabase shouldn't try to auto-detect from the URL on initial
    // load (which would error on a bare custom-scheme launch).
    detectSessionInUrl: false,
    // PKCE flow — modern OAuth 2.0 best practice. Replaces the legacy
    // implicit flow that required tokens in the URL fragment + a
    // GitHub-Pages-hosted middleman page. With PKCE the OAuth provider
    // redirects directly to `com.sanctuary.app://auth-callback?code=…`
    // and DeepLinkHandler calls supabase.auth.exchangeCodeForSession(code).
    // The PKCE code_verifier persists in localStorage between
    // signInWithOAuth() and the redirect back into the app.
    flowType: 'pkce',
  }
})