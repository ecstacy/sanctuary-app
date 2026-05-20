-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 007 — Premium entitlement + promo codes
--
-- Establishes the first-class entitlement primitive used by Sanctuary Plus.
-- The client reads `profiles.is_premium` directly (plus the expiry guard)
-- to gate features; this column is the source of truth that downstream
-- integrations (Stripe webhook, RevenueCat sync, internal grants) all
-- converge on.
--
-- WHY THREE COLUMNS, NOT ONE
--   `is_premium`         — the live entitlement bit. Cheap to index, cheap
--                          to read from every gated surface. Computed by
--                          server logic (webhook / RPC), never set ad-hoc
--                          by the client. RLS forbids the client from
--                          writing it.
--   `premium_source`     — provenance ('stripe' | 'apple' | 'google' |
--                          'promo' | 'grant'). Tells us where to refund,
--                          where to renew, and lets us segment revenue
--                          analytics by channel.
--   `premium_expires_at` — when the entitlement lapses. Nullable for
--                          lifetime / permanent-grant cases. A nightly
--                          job (Edge Function) flips `is_premium=false`
--                          when this passes.
--
-- WHY PROMO CODES LIVE IN A SEPARATE TABLE (not env vars / hardcoded)
--   1. Internal team grants and marketing campaigns need to be created/
--      revoked without a deploy.
--   2. We need to track redemption counts to enforce caps.
--   3. Per-code analytics: which influencer code converted best?
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Profile columns ────────────────────────────────────────────────────────
alter table profiles
  add column if not exists is_premium         boolean      not null default false,
  add column if not exists premium_source     text,
  add column if not exists premium_started_at timestamptz,
  add column if not exists premium_expires_at timestamptz;

-- Source must be one of the recognized provenance values when set.
-- Null is allowed (free users have no source).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_premium_source_check'
  ) then
    alter table profiles
      add constraint profiles_premium_source_check
      check (premium_source is null
             or premium_source in ('stripe', 'apple', 'google', 'promo', 'grant'));
  end if;
end $$;

-- Fast lookup for the nightly expiry sweep.
create index if not exists idx_profiles_premium_expires
  on profiles(premium_expires_at)
  where is_premium = true and premium_expires_at is not null;


-- ── promo_codes ────────────────────────────────────────────────────────────
-- One row per code that can be redeemed by a user. The same code can have
-- multiple redemptions (one per user) up to `max_redemptions`.
create table if not exists promo_codes (
  id              uuid        primary key default gen_random_uuid(),

  -- The user-typed code (case-INsensitive). We store the canonicalized
  -- (uppercased, trimmed) form so 'launch50', 'LAUNCH50', ' Launch50 '
  -- all resolve to the same row.
  code            text        not null unique,

  -- Three kinds, only `full_grant` is supported by the redeem RPC in v1.
  -- The others reserve the schema for Stripe-coupon mirroring once paid
  -- subscriptions go live.
  --   full_grant     — instant premium for `duration_days` (or forever if null)
  --   percent_off    — % discount at checkout (Stripe coupon companion)
  --   duration_free  — N free days appended to a Stripe trial
  kind            text        not null
                              check (kind in ('full_grant','percent_off','duration_free')),

  -- Meaning depends on `kind`:
  --   full_grant     — ignored (uses duration_days instead)
  --   percent_off    — 1..100
  --   duration_free  — ignored (uses duration_days)
  value           int,

  -- For full_grant + duration_free. NULL = permanent (use only for internal
  -- 'TEAM-…' codes; never publish a permanent code externally).
  duration_days   int,

  -- Cap on total redemptions (0 = unlimited; null treated as 0).
  max_redemptions int         not null default 0,
  used_count      int         not null default 0,

  valid_from      timestamptz not null default now(),
  valid_until     timestamptz,                          -- null = no expiry

  notes           text,                                 -- human context (campaign / who minted)
  created_by      uuid        references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),

  -- Soft-disable without deleting (preserves redemption history).
  active          boolean     not null default true
);

-- Codes are user-typed; index on the lookup form. Case-INsensitive match
-- happens in the RPC, so we just index the stored canonical form.
create index if not exists idx_promo_codes_code on promo_codes(upper(trim(code)));


-- ── promo_redemptions ──────────────────────────────────────────────────────
-- One row per (user, code) redemption. A user can't redeem the same code
-- twice (enforced via unique constraint).
create table if not exists promo_redemptions (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  promo_code_id   uuid        not null references promo_codes(id) on delete cascade,
  code_snapshot   text        not null,                -- the raw code as typed
  granted_until   timestamptz,                         -- null = lifetime grant
  redeemed_at     timestamptz not null default now()
);

-- One redemption per (user, code). Lets us tell a user "you already used
-- this code" instead of silently letting them double-dip.
create unique index if not exists idx_promo_redemptions_user_code
  on promo_redemptions(user_id, promo_code_id);

create index if not exists idx_promo_redemptions_user
  on promo_redemptions(user_id);


-- ── RLS ────────────────────────────────────────────────────────────────────
-- The client can't see or write promo_codes directly — only the RPC below
-- (which runs as security definer) touches it. promo_redemptions is
-- visible to the owning user as their personal history.
alter table promo_codes        enable row level security;
alter table promo_redemptions  enable row level security;

-- No client-side policies on promo_codes — only the redeem RPC reads it.
-- A future admin role can be granted SELECT separately.

-- Owner can read their own redemptions (e.g. show a "history" surface).
drop policy if exists "promo_redemptions_select_own" on promo_redemptions;
create policy "promo_redemptions_select_own"
  on promo_redemptions for select
  using (auth.uid() = user_id);


-- ── RPC: redeem_promo_code ─────────────────────────────────────────────────
-- The only path by which a code can move a profile to is_premium=true via
-- the 'promo' source. Runs as security definer (elevated) so it can:
--   • read promo_codes (RLS-locked for clients)
--   • update profiles (RLS limits clients to non-entitlement columns)
--   • insert into promo_redemptions
--
-- Returns a JSON object: { ok, error?, granted_until?, code? }.
-- We return JSON (not raise exceptions) so the client can render a friendly
-- error message; raised exceptions are noisier and surface as 500s.
create or replace function redeem_promo_code(input_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id    uuid := auth.uid();
  v_promo      promo_codes%rowtype;
  v_granted    timestamptz;
  v_existing   uuid;
begin
  -- 1) Auth required.
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  -- 2) Find the code (case-insensitive, trimmed).
  select * into v_promo
  from promo_codes
  where upper(trim(code)) = upper(trim(input_code))
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  -- 3) Status checks.
  if not v_promo.active then
    return jsonb_build_object('ok', false, 'error', 'inactive');
  end if;
  if v_promo.valid_until is not null and v_promo.valid_until < now() then
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;
  if v_promo.valid_from > now() then
    return jsonb_build_object('ok', false, 'error', 'not_yet_valid');
  end if;
  if v_promo.max_redemptions > 0 and v_promo.used_count >= v_promo.max_redemptions then
    return jsonb_build_object('ok', false, 'error', 'exhausted');
  end if;

  -- 4) Already redeemed by this user?
  select id into v_existing
  from promo_redemptions
  where user_id = v_user_id and promo_code_id = v_promo.id;
  if found then
    return jsonb_build_object('ok', false, 'error', 'already_redeemed');
  end if;

  -- 5) Only `full_grant` is wired in v1. The other kinds exist in schema
  --    so Stripe coupon mirroring can hang off them later.
  if v_promo.kind <> 'full_grant' then
    return jsonb_build_object('ok', false, 'error', 'kind_not_supported');
  end if;

  -- 6) Compute expiry (null = lifetime).
  if v_promo.duration_days is null then
    v_granted := null;  -- lifetime grant
  else
    v_granted := now() + (v_promo.duration_days || ' days')::interval;
  end if;

  -- 7) Grant.
  update profiles
  set is_premium         = true,
      premium_source     = 'promo',
      premium_started_at = coalesce(premium_started_at, now()),
      premium_expires_at = case
                             -- Lifetime grant overrides any existing expiry.
                             when v_granted is null then null
                             -- Otherwise extend whichever is later (don't
                             -- shorten a longer existing grant).
                             else greatest(coalesce(premium_expires_at, now()), v_granted)
                           end
  where id = v_user_id;

  -- 8) Log redemption + bump counter.
  insert into promo_redemptions (user_id, promo_code_id, code_snapshot, granted_until)
  values (v_user_id, v_promo.id, input_code, v_granted);

  update promo_codes set used_count = used_count + 1 where id = v_promo.id;

  return jsonb_build_object(
    'ok',            true,
    'granted_until', v_granted,
    'code',          v_promo.code
  );
end $$;

grant execute on function redeem_promo_code(text) to authenticated;


-- ── Seed: a single internal team code for testing ─────────────────────────
-- Permanent grant, capped to 20 redemptions. Founder/teacher use only;
-- never share publicly.
insert into promo_codes (code, kind, duration_days, max_redemptions, notes)
values ('SANCTUARY-TEAM', 'full_grant', null, 20, 'Internal team & founding teachers')
on conflict (code) do nothing;
