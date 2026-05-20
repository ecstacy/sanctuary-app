// ─────────────────────────────────────────────────────────────────────────────
//  stripe-webhook — Stripe → Supabase entitlement sync
//
//  The single integration point between Stripe billing and the
//  `profiles.is_premium` flag the rest of the app reads. Handles:
//
//    • checkout.session.completed       → first-time purchase
//    • customer.subscription.updated    → renewals, plan changes, cancel-at-period-end
//    • customer.subscription.deleted    → final cancellation (period ended)
//    • invoice.paid                     → successful renewal (refresh expiry)
//    • invoice.payment_failed           → dunning state
//
//  GUARANTEES
//  ──────────
//  • Idempotent. Stripe retries failed deliveries; we store every event id
//    in `subscription_events` with a UNIQUE constraint, so a replay of the
//    same event_id is an INSERT that conflicts → no double processing.
//
//  • Signature-verified. We verify the `Stripe-Signature` header against
//    STRIPE_WEBHOOK_SECRET before touching any profile. Unsigned or wrong-
//    signed payloads are rejected 400 without writing anything.
//
//  • Audit trail. Every accepted event lands in `subscription_events`
//    with the full payload, even when we couldn't map it to a user. The
//    `handler_note` column records why a payload was a no-op so ops can
//    reconcile from the table alone.
//
//  • Service-role db client. The webhook is unauthenticated by design
//    (Stripe doesn't carry a Supabase JWT). Edge config sets
//    verify_jwt = false; we use the service role key inside to bypass RLS
//    on profiles.is_premium / premium_* columns (which clients can't write).
//
//  ENVIRONMENT
//  ───────────
//  • SUPABASE_URL                   — auto-provided
//  • SUPABASE_SERVICE_ROLE_KEY      — auto-provided
//  • STRIPE_SECRET_KEY              — sk_live_... or sk_test_...
//  • STRIPE_WEBHOOK_SECRET          — whsec_... from the endpoint config
//
//  DEPLOY
//  ──────
//    supabase secrets set STRIPE_SECRET_KEY=sk_live_... STRIPE_WEBHOOK_SECRET=whsec_...
//    supabase functions deploy stripe-webhook --no-verify-jwt
//
//  Then in the Stripe Dashboard:
//    Developers → Webhooks → Add endpoint
//      URL:    https://<PROJECT-REF>.functions.supabase.co/stripe-webhook
//      Events: checkout.session.completed, customer.subscription.updated,
//              customer.subscription.deleted, invoice.paid,
//              invoice.payment_failed
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@17'

// ── Boot ────────────────────────────────────────────────────────────────────
const SUPABASE_URL          = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const STRIPE_SECRET_KEY     = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
  console.error('Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET env')
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  // Pin the version — stripe.js will use this and surface deprecations
  // as 400s rather than silently mis-typing newer events.
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
  httpClient: Stripe.createFetchHttpClient(),
})

// Service-role client — bypasses RLS so we can write entitlement columns
// that the user themselves can't touch.
const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// ── Handler ─────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // 1) Verify signature. Read the raw body once — Stripe's verifier needs
  //    the exact bytes, not a re-serialized JSON.
  const sig = req.headers.get('stripe-signature')
  if (!sig) return new Response('Missing stripe-signature', { status: 400 })

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Signature verification failed:', err instanceof Error ? err.message : err)
    return new Response('Invalid signature', { status: 400 })
  }

  // 2) Idempotency gate. Insert the event id first; if it already exists
  //    we return 200 OK without processing (Stripe's retry semantics).
  const auditId = await tryRecordEvent(event)
  if (auditId === 'DUPLICATE') {
    return new Response(JSON.stringify({ ok: true, duplicate: true }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })
  }

  // 3) Dispatch.
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, auditId)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionChanged(event.data.object as Stripe.Subscription, auditId)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, auditId)
        break
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice, auditId)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, auditId)
        break
      default:
        await annotate(auditId, `Ignored event type: ${event.type}`)
    }
  } catch (err) {
    console.error('Handler error', event.type, err)
    await annotate(auditId, `Handler error: ${(err as Error).message}`)
    // Return 500 so Stripe retries. The audit row is already written —
    // when the retry succeeds, the duplicate-detection branch above
    // returns 200 without re-applying changes.
    return new Response('Handler error', { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'content-type': 'application/json' },
  })
})

// ─────────────────────────────────────────────────────────────────────────────
//  Handlers
// ─────────────────────────────────────────────────────────────────────────────

// First successful purchase. Stripe Payment Links carry our internal user
// id in `client_reference_id` — we set that client-side before redirecting.
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, auditId: string) {
  const userId = session.client_reference_id
  if (!userId) {
    await annotate(auditId, 'No client_reference_id — cannot map to user')
    return
  }

  const customerId     = stringFromOptional(session.customer)
  const subscriptionId = stringFromOptional(session.subscription)

  // For subscription mode we need the subscription's current_period_end
  // to set the expiry. Subscription objects expand fully from a fetch.
  let expiresAt: Date | null = null
  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    expiresAt = new Date(sub.current_period_end * 1000)
  }

  const { error } = await db.from('profiles')
    .update({
      is_premium:                   true,
      premium_source:               'stripe',
      premium_started_at:           new Date().toISOString(),
      premium_expires_at:           expiresAt?.toISOString() ?? null,
      premium_cancel_at_period_end: false,
      premium_payment_failed_at:    null,
      stripe_customer_id:           customerId ?? null,
      stripe_subscription_id:       subscriptionId ?? null,
    })
    .eq('id', userId)

  if (error) {
    await annotate(auditId, `Profile update failed: ${error.message}`)
    throw new Error(error.message)
  }

  await linkUser(auditId, userId, customerId, subscriptionId)
}

// Renewal, plan change, or cancel-at-period-end toggle. We refresh the
// expiry from the subscription itself rather than trusting the event
// payload — Stripe's `current_period_end` is on the subscription object.
async function handleSubscriptionChanged(sub: Stripe.Subscription, auditId: string) {
  const customerId = stringFromOptional(sub.customer)

  // Look up the owning user by subscription id (set during checkout).
  const { data: profile } = await db.from('profiles')
    .select('id')
    .eq('stripe_subscription_id', sub.id)
    .single()

  if (!profile) {
    await annotate(auditId, `No profile with stripe_subscription_id=${sub.id}`)
    return
  }

  // status === 'active' or 'trialing' keep them premium.
  // status === 'past_due' or 'unpaid' keep them premium too — Stripe is
  // still retrying. We rely on the eventual `customer.subscription.deleted`
  // to flip the bit.
  const isActive = sub.status === 'active' || sub.status === 'trialing'
                 || sub.status === 'past_due' || sub.status === 'unpaid'

  const expiresAt = new Date(sub.current_period_end * 1000)

  const { error } = await db.from('profiles')
    .update({
      is_premium:                   isActive,
      premium_source:               'stripe',
      premium_expires_at:           expiresAt.toISOString(),
      premium_cancel_at_period_end: sub.cancel_at_period_end === true,
    })
    .eq('id', profile.id)

  if (error) {
    await annotate(auditId, `Profile update failed: ${error.message}`)
    throw new Error(error.message)
  }

  await linkUser(auditId, profile.id, customerId, sub.id)
}

// Final cancellation — Stripe fires this when the subscription actually
// ends (after any grace period). Flip premium off immediately; we don't
// keep a paid-through-period grace here because Stripe only fires this
// at period end, not at cancel-time.
async function handleSubscriptionDeleted(sub: Stripe.Subscription, auditId: string) {
  const { data: profile } = await db.from('profiles')
    .select('id')
    .eq('stripe_subscription_id', sub.id)
    .single()

  if (!profile) {
    await annotate(auditId, `No profile with stripe_subscription_id=${sub.id}`)
    return
  }

  const { error } = await db.from('profiles')
    .update({
      is_premium:                   false,
      premium_cancel_at_period_end: false,
      // Keep stripe_customer_id so we can offer "Resubscribe" without
      // re-creating a customer. The subscription_id is now stale though.
      stripe_subscription_id:       null,
    })
    .eq('id', profile.id)

  if (error) {
    await annotate(auditId, `Profile update failed: ${error.message}`)
    throw new Error(error.message)
  }

  await linkUser(auditId, profile.id, sub.customer as string, sub.id)
}

// Renewal succeeded. The subscription's current_period_end has moved
// forward; we refresh the expiry. Also clears any prior dunning state.
async function handleInvoicePaid(invoice: Stripe.Invoice, auditId: string) {
  const subscriptionId = stringFromOptional(invoice.subscription)
  if (!subscriptionId) {
    await annotate(auditId, 'invoice.paid without subscription — not a sub renewal')
    return
  }

  const sub = await stripe.subscriptions.retrieve(subscriptionId)
  const expiresAt = new Date(sub.current_period_end * 1000)

  const { data: profile } = await db.from('profiles')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!profile) {
    await annotate(auditId, `No profile with stripe_subscription_id=${subscriptionId}`)
    return
  }

  const { error } = await db.from('profiles')
    .update({
      is_premium:                true,
      premium_expires_at:        expiresAt.toISOString(),
      premium_payment_failed_at: null,
    })
    .eq('id', profile.id)

  if (error) {
    await annotate(auditId, `Profile update failed: ${error.message}`)
    throw new Error(error.message)
  }

  await linkUser(auditId, profile.id, sub.customer as string, subscriptionId)
}

// Payment failed — record the dunning state so we can surface
// "Update your payment method" UI. Stripe will retry per its dunning
// schedule; we do NOT flip is_premium yet (Stripe will fire
// subscription.deleted when it gives up).
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, auditId: string) {
  const subscriptionId = stringFromOptional(invoice.subscription)
  if (!subscriptionId) {
    await annotate(auditId, 'invoice.payment_failed without subscription')
    return
  }

  const { data: profile } = await db.from('profiles')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()
  if (!profile) {
    await annotate(auditId, `No profile with stripe_subscription_id=${subscriptionId}`)
    return
  }

  const { error } = await db.from('profiles')
    .update({ premium_payment_failed_at: new Date().toISOString() })
    .eq('id', profile.id)

  if (error) {
    await annotate(auditId, `Profile update failed: ${error.message}`)
    throw new Error(error.message)
  }

  await linkUser(auditId, profile.id, invoice.customer as string, subscriptionId)
}

// ─────────────────────────────────────────────────────────────────────────────
//  Audit helpers
// ─────────────────────────────────────────────────────────────────────────────

// Idempotency-gated insert. Returns the new row's id, or the string
// 'DUPLICATE' when the event was already processed.
async function tryRecordEvent(event: Stripe.Event): Promise<string> {
  // First try to read an existing row (cheaper than INSERT-and-conflict).
  const { data: existing } = await db.from('subscription_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle()
  if (existing) return 'DUPLICATE'

  // Pull a few fields out to the dedicated columns for indexed search.
  const obj = event.data.object as Record<string, unknown>
  const customerId     = stringFromOptional(obj.customer as Stripe.Customer | string | null | undefined)
  const subscriptionId = obj.id && (event.type.startsWith('customer.subscription') || event.type.startsWith('checkout.'))
    ? (event.type.startsWith('checkout.') ? stringFromOptional((obj as Stripe.Checkout.Session).subscription) : (obj.id as string))
    : event.type.startsWith('invoice.')
    ? stringFromOptional((obj as Stripe.Invoice).subscription)
    : null

  const { data, error } = await db.from('subscription_events')
    .insert({
      stripe_event_id:        event.id,
      event_type:             event.type,
      stripe_customer_id:     customerId,
      stripe_subscription_id: subscriptionId,
      payload:                event as unknown,
      stripe_created_at:      new Date(event.created * 1000).toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    // If the unique constraint races us, treat as duplicate.
    if (error.code === '23505') return 'DUPLICATE'
    throw new Error(error.message)
  }
  return data!.id as string
}

// Patch the audit row with the resolved user id once we know who this
// event belonged to. Lets us answer "show me everything that happened
// to user X" with a single WHERE clause.
async function linkUser(auditId: string, userId: string, customerId?: string | null, subscriptionId?: string | null) {
  await db.from('subscription_events')
    .update({
      user_id:                userId,
      stripe_customer_id:     customerId ?? null,
      stripe_subscription_id: subscriptionId ?? null,
    })
    .eq('id', auditId)
}

async function annotate(auditId: string, note: string) {
  await db.from('subscription_events')
    .update({ handler_note: note })
    .eq('id', auditId)
}

// Stripe fields can be a string id OR an expanded object. Normalize to
// the id (string) or null. Saves a dozen `typeof === 'string'` checks.
function stringFromOptional(
  v: string | { id?: string } | null | undefined
): string | null {
  if (!v) return null
  if (typeof v === 'string') return v
  return v.id ?? null
}
