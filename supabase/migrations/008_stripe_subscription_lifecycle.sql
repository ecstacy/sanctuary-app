-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 008 — Stripe subscription lifecycle
--
-- Adds the columns the Stripe webhook needs to map a subscription event
-- back to a Sanctuary user, an audit trail for every webhook we receive
-- (for replay + debugging), and an hourly pg_cron job that expires lapsed
-- premium users so the entitlement state matches reality between
-- subscription events.
--
-- ARCHITECTURE
-- ────────────
--   Stripe ─ checkout.session.completed ─▶ Edge Function `stripe-webhook`
--                                            │
--                                            ▼
--                              UPDATE profiles + INSERT subscription_events
--                                            │
--                                            ▼  (every hour)
--                                  expire_premium_subscriptions()
--                                  flips lapsed users back to free
--
-- WHY AN AUDIT TABLE
-- ──────────────────
-- Webhook deliveries can fail or arrive out of order. We persist every
-- event we accept (idempotently keyed by Stripe's event id) so we can:
--   • Replay missed updates after an outage
--   • Diagnose "why is this user not premium?" without Stripe Dashboard
--   • Reconstruct an MRR audit trail without trusting client-side state
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Profile columns for Stripe state ──────────────────────────────────────
alter table profiles
  add column if not exists stripe_customer_id        text,
  add column if not exists stripe_subscription_id    text,
  -- Mirrors Stripe's `cancel_at_period_end` flag. When true, the user
  -- has cancelled but keeps premium until the period ends; we still
  -- treat them as premium during this grace window.
  add column if not exists premium_cancel_at_period_end boolean not null default false,
  -- Set when an invoice payment fails. Used to surface dunning UI
  -- ("Update your payment method") before the subscription is fully
  -- cancelled.
  add column if not exists premium_payment_failed_at timestamptz;

-- Stripe customer/subscription ids are globally unique on Stripe's side.
-- Index for the webhook's lookup path (event arrives with sub id, we
-- need user id).
create index if not exists idx_profiles_stripe_customer
  on profiles(stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists idx_profiles_stripe_subscription
  on profiles(stripe_subscription_id)
  where stripe_subscription_id is not null;


-- ── Webhook audit trail ───────────────────────────────────────────────────
-- One row per Stripe webhook we accept. Idempotency: the unique constraint
-- on `stripe_event_id` means a retry of the same delivery is a no-op
-- INSERT (the webhook handler does `on conflict do nothing` and skips
-- profile updates if the row already existed).
create table if not exists subscription_events (
  id                  uuid        primary key default gen_random_uuid(),

  -- The Stripe event id (e.g. evt_1Nv...). Source of idempotency.
  stripe_event_id     text        not null unique,

  -- One of: checkout.session.completed, customer.subscription.updated,
  --         customer.subscription.deleted, invoice.paid,
  --         invoice.payment_failed
  event_type          text        not null,

  -- The user this event resolved to. Null when we couldn't map (logged
  -- for ops to investigate — usually a checkout with no client_reference_id).
  user_id             uuid        references auth.users(id) on delete set null,

  -- Pertinent Stripe ids extracted from the payload for fast lookup.
  stripe_customer_id     text,
  stripe_subscription_id text,

  -- Full Stripe payload — debug fodder, also lets us replay if needed.
  payload             jsonb       not null,

  -- Stripe's event timestamp + ours.
  stripe_created_at   timestamptz,
  processed_at        timestamptz not null default now(),

  -- Notes from the handler — e.g. "user not found by client_reference_id"
  -- or "ignored: subscription belongs to deleted user".
  handler_note        text
);

create index if not exists idx_subscription_events_user
  on subscription_events(user_id, processed_at desc);
create index if not exists idx_subscription_events_type
  on subscription_events(event_type, processed_at desc);
create index if not exists idx_subscription_events_subscription
  on subscription_events(stripe_subscription_id)
  where stripe_subscription_id is not null;

alter table subscription_events enable row level security;
-- No client-side policies — only the service role (webhook handler) writes
-- and reads. An admin role can be granted SELECT separately later.


-- ── Expiry sweep ──────────────────────────────────────────────────────────
-- Stripe sends a `customer.subscription.deleted` webhook when a subscription
-- actually ends, so the expiry sweep is a safety net for two cases:
--   1. We missed a delivery (network blip during the webhook).
--   2. Promo grants with a finite duration_days — no Stripe event exists
--      for those, so the sweep is the ONLY thing that flips them back.
-- Runs every hour via pg_cron. Idempotent.
create or replace function expire_premium_subscriptions()
returns table(expired_count int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update profiles
    set is_premium                    = false,
        premium_cancel_at_period_end  = false
    where is_premium = true
      and premium_expires_at is not null
      and premium_expires_at < now();

  get diagnostics v_count = row_count;
  return query select v_count;
end $$;


-- ── Schedule via pg_cron ──────────────────────────────────────────────────
-- pg_cron is available on Supabase's Pro plan + above. On the Free tier
-- this CREATE EXTENSION + cron.schedule will be a no-op (extension absent)
-- and you'll need to call expire_premium_subscriptions() from an external
-- scheduler instead (e.g. a GitHub Action with the Supabase CLI). The
-- function itself works either way.
do $$
begin
  -- Extension may be unavailable on some plans — wrap in exception block
  -- so the migration is idempotent across environments.
  begin
    create extension if not exists pg_cron;
  exception when others then
    raise notice 'pg_cron not available — schedule expire_premium_subscriptions() externally';
    return;
  end;

  -- Hourly at :05 to avoid clustering with other potential top-of-hour
  -- jobs. Only schedule if not already present (cron.schedule errors on
  -- duplicate job names).
  if not exists (select 1 from cron.job where jobname = 'sanctuary_expire_premium') then
    perform cron.schedule(
      'sanctuary_expire_premium',
      '5 * * * *',
      $cron$ select expire_premium_subscriptions(); $cron$
    );
  end if;
end $$;


-- ── RPC: create_stripe_checkout_intent ────────────────────────────────────
-- Lightweight server-side helper that the client calls before redirecting
-- to a Stripe Payment Link. It doesn't create the Checkout session itself
-- (Stripe Payment Links handle that), it just:
--   • Confirms the caller is authenticated
--   • Returns the auth user's id + email so the client can append
--     client_reference_id and prefilled_email to the Payment Link URL,
--     letting the webhook map the resulting session to this user.
-- This is the cleanest way to bridge pre-built Payment Links with our
-- entitlement model without standing up a Stripe Sessions API call.
create or replace function get_checkout_attribution()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email   text;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select email into v_email from auth.users where id = v_user_id;

  return jsonb_build_object(
    'ok',                   true,
    'client_reference_id',  v_user_id,
    'prefilled_email',      v_email
  );
end $$;

grant execute on function get_checkout_attribution()       to authenticated;
grant execute on function expire_premium_subscriptions()   to service_role;
