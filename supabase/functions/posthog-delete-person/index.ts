// ─────────────────────────────────────────────────────────────────────────────
//  posthog-delete-person — server-side GDPR Article 17 right-to-erasure
//  for product-analytics events stored in PostHog.
//
//  Why server-side?
//  ----------------
//  The browser-side `posthog.reset()` we call in ProfilePage only forgets
//  the device — events already shipped to PostHog still belong to that
//  user's distinct_id. To honor a real deletion request we must ask
//  PostHog itself to erase the person + all linked events. That call
//  needs a Personal API Key, which we cannot expose to the client. So
//  it lives here, behind the user's own auth token.
//
//  Contract
//  --------
//   • Auth: caller must be signed in. We extract the user id from the
//     JWT and that's the ONLY id we ever ask PostHog to delete.
//     Callers cannot pass an arbitrary distinct_id — this protects
//     against malicious deletion of someone else's data.
//   • Idempotent: PostHog's delete-person endpoint is fine to call
//     multiple times; missing persons return 404 which we treat as ok.
//   • Fail-open from the user's POV: client-side data is already gone
//     before this is invoked, so even if PostHog is unreachable, the
//     user's account is removed. We surface the error so an operator
//     can retry or run the deletion manually.
//
//  Required env vars (set via `supabase secrets set`):
//   • POSTHOG_PROJECT_ID     — numeric project id (e.g. 12345)
//   • POSTHOG_PERSONAL_API_KEY — phx_... (NOT the project capture key).
//        Required scope: `person:write` only — the delete endpoint
//        doesn't need read access. Get it from
//        PostHog → Settings → Personal API Keys → New key.
//   • POSTHOG_HOST           — defaults to https://eu.posthog.com
//
//  Deploy:
//   supabase functions deploy posthog-delete-person --no-verify-jwt=false
//
//  Call from the client after the local deletion finishes:
//   await supabase.functions.invoke('posthog-delete-person')
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed' }, 405)
  }

  // ── Auth: resolve the caller from the JWT ──────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    return json({ ok: false, error: 'missing_auth' }, 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey     = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  if (!supabaseUrl || !anonKey) {
    return json({ ok: false, error: 'server_misconfigured' }, 500)
  }
  // Use the caller's token so getUser() resolves THEIR id, not a service
  // account. This is the integrity check that prevents deleting other
  // users' data.
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user?.id) {
    return json({ ok: false, error: 'invalid_token' }, 401)
  }

  // ── PostHog: hit the delete-person-by-distinct-id endpoint ─────────────
  const projectId = Deno.env.get('POSTHOG_PROJECT_ID')
  const apiKey    = Deno.env.get('POSTHOG_PERSONAL_API_KEY')
  const host      = Deno.env.get('POSTHOG_HOST') ?? 'https://eu.posthog.com'
  if (!projectId || !apiKey) {
    return json({ ok: false, error: 'posthog_not_configured' }, 500)
  }

  // PostHog's "delete person" endpoint takes the distinct_id (which we set
  // to the Supabase user.id on identify(), see src/context/AuthContext.jsx).
  // Sending `delete_events=true` removes both the person row AND every
  // event tied to them — full erasure.
  const url = `${host}/api/projects/${projectId}/persons/delete_bulk/?delete_events=true`
  const phRes = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ distinct_ids: [user.id] }),
  }).catch(err => ({ ok: false, status: 0, _err: err?.message ?? String(err) } as Response))

  if (!('ok' in phRes) || !phRes.ok) {
    // 404 is fine — the person never existed in PostHog (e.g. user signed
    // up but never granted analytics consent). Anything else is a real
    // failure that an operator should investigate.
    const status = (phRes as Response).status ?? 0
    if (status !== 404) {
      const body = await safeText(phRes as Response)
      return json({ ok: false, error: 'posthog_delete_failed', status, body }, 502)
    }
  }

  return json({ ok: true })
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function safeText(res: Response): Promise<string> {
  try { return (await res.text()).slice(0, 500) } catch { return '' }
}
