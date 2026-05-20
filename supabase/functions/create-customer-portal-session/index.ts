// ─────────────────────────────────────────────────────────────────────────────
//  create-customer-portal-session — server-side Stripe Customer Portal link
//
//  The client calls this Edge Function when a Plus user taps "Manage
//  subscription" in Settings. We:
//    1. Verify the caller is authenticated
//    2. Look up their `profiles.stripe_customer_id`
//    3. Create a fresh Customer Portal session
//    4. Return the one-time URL
//
//  WHY SERVER-SIDE
//  ───────────────
//  Customer Portal sessions are minted with the Stripe secret key — that
//  can't be embedded in the client. The session URL is short-lived (~1h)
//  and one-time, so we generate fresh per click rather than caching.
//
//  WHY NOT TRUST CLIENT-SUPPLIED customer_id
//  ─────────────────────────────────────────
//  We look up the customer id from the auth user's profile, NOT from a
//  request body field. Otherwise any signed-in user could pass someone
//  else's customer id and gain control of their billing settings.
//
//  ENVIRONMENT
//  ───────────
//  • SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — auto-provided
//  • STRIPE_SECRET_KEY  — sk_live_... or sk_test_...
//  • PORTAL_RETURN_URL  — where Stripe sends the user when they're done
//                         (e.g. https://sanctuary.com/profile). Falls back
//                         to the request origin if unset.
//
//  CALLED FROM CLIENT VIA
//    const { data } = await supabase.functions.invoke('create-customer-portal-session')
//    window.location.href = data.url
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@17'

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const STRIPE_SECRET_KEY     = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
const PORTAL_RETURN_URL_ENV = Deno.env.get('PORTAL_RETURN_URL') ?? ''

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
  httpClient: Stripe.createFetchHttpClient(),
})

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const CORS = {
  'access-control-allow-origin':  '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS })
  }

  // ── Authenticate the caller ─────────────────────────────────────────────
  // verify_jwt = true in config.toml means Supabase has already validated
  // the bearer JWT, but it doesn't surface the user object — we have to
  // pull it from the Authorization header ourselves.
  const authHeader = req.headers.get('authorization') ?? ''
  const jwt = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!jwt) {
    return json({ ok: false, error: 'not_authenticated' }, 401)
  }

  const { data: userData, error: userErr } = await db.auth.getUser(jwt)
  if (userErr || !userData?.user) {
    return json({ ok: false, error: 'not_authenticated' }, 401)
  }
  const userId = userData.user.id

  // ── Resolve their Stripe customer ───────────────────────────────────────
  const { data: profile, error: profErr } = await db
    .from('profiles')
    .select('stripe_customer_id, premium_source')
    .eq('id', userId)
    .single()

  if (profErr || !profile?.stripe_customer_id) {
    // Two reasons this happens:
    //   1. The user has never had a Stripe subscription (promo-only or
    //      grant-only premium). They have nothing to "manage" — there's
    //      no Stripe customer record.
    //   2. The user is genuinely free.
    // Either way, the right client UX is to NOT show "Manage subscription"
    // in the first place; this 404 is the safety net.
    return json({ ok: false, error: 'no_stripe_customer' }, 404)
  }

  // ── Mint the portal session ─────────────────────────────────────────────
  // The return_url is where Stripe sends the user when they finish. We
  // prefer the env var (so each environment has a stable URL); if
  // unset, fall back to the request's Origin header — works in dev
  // where the env var isn't configured.
  const origin = req.headers.get('origin') ?? ''
  const returnUrl = PORTAL_RETURN_URL_ENV
                 || (origin ? `${origin}/profile` : 'https://sanctuary.com/profile')

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer:   profile.stripe_customer_id,
      return_url: returnUrl,
    })
    return json({ ok: true, url: session.url }, 200)
  } catch (err) {
    console.error('Portal session create failed:', err)
    return json({ ok: false, error: 'stripe_error', message: (err as Error).message }, 500)
  }
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  })
}
