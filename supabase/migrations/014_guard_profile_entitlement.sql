-- ─────────────────────────────────────────────────────────────────────────
--  014 — Stop clients writing their own entitlement (P0 security fix)
--
--  THE BUG
--  -------
--  `profiles` carries the entitlement flags (is_premium, premium_source,
--  premium_started_at, premium_expires_at) AND the ordinary user-editable
--  fields (language, notification_prefs, full_name, …). Its RLS policy is:
--
--      "Users can update own profile"  UPDATE  USING (auth.uid() = id)
--                                              WITH CHECK  NULL
--
--  With WITH CHECK null, Postgres re-uses the USING expression — so the only
--  requirement is "you own this row". **RLS has no column granularity**, so
--  any signed-in user could do:
--
--      supabase.from('profiles').update({ is_premium: true }).eq('id', myId)
--
--  ...and grant themselves free lifetime Plus with the public anon key,
--  bypassing Stripe entirely. Migration 007's comment claiming "RLS limits
--  clients to non-entitlement columns" was mistaken. Confirmed against the
--  live policy on 2026-07-16. See docs/security-audit.md finding #5.
--
--  THE FIX
--  -------
--  A BEFORE UPDATE trigger that rejects any change to the entitlement columns
--  when the caller is a client role. We gate on `current_user` rather than
--  auth.role(), because:
--    • PostgREST SET ROLEs to `anon` / `authenticated` for client calls, so
--      current_user is exactly those.
--    • A SECURITY DEFINER function (redeem_promo_code) runs as its OWNER, so
--      current_user is postgres — it keeps working. auth.role() would NOT
--      work here: it reads the JWT, which still says 'authenticated' when a
--      user invokes the RPC, and would wrongly block legitimate grants.
--    • The Stripe webhook uses the service_role key → current_user is
--      service_role → allowed.
--
--  Verified against the client: the app only ever updates avatar_url,
--  dosha_details, full_name, gender, health_data_consent, language,
--  notification_prefs and analytics_consent — never the entitlement columns.
--  So this blocks the attack without touching a single legitimate flow.
--
--  This also drags the rule into git. The policy above lives only in the
--  Supabase dashboard and was invisible to the repo, which is how the false
--  assumption survived review in the first place.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function guard_profile_entitlement_columns()
returns trigger
language plpgsql
security invoker           -- must see the REAL current_user
set search_path = public
as $$
begin
  -- Only constrain calls arriving as a client role. Elevated contexts
  -- (SECURITY DEFINER grant RPCs, the service_role Stripe webhook, the
  -- nightly expiry job) fall through untouched.
  if current_user in ('authenticated', 'anon') then
    if new.is_premium         is distinct from old.is_premium
    or new.premium_source     is distinct from old.premium_source
    or new.premium_started_at is distinct from old.premium_started_at
    or new.premium_expires_at is distinct from old.premium_expires_at then
      raise exception
        'entitlement columns are not client-writable (use redeem_promo_code or purchase)'
        using errcode = '42501';   -- insufficient_privilege
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_guard_entitlement on profiles;

create trigger trg_profiles_guard_entitlement
  before update on profiles
  for each row
  execute function guard_profile_entitlement_columns();


-- ── Verification (run manually as a normal signed-in user) ────────────────
--  Before this migration the following SUCCEEDED. It must now fail with
--  42501:
--
--      update profiles set is_premium = true where id = auth.uid();
--
--  And these must still succeed (ordinary profile edits):
--
--      update profiles set language = 'de' where id = auth.uid();
--      update profiles set notification_prefs = '{}'::jsonb where id = auth.uid();
--
--  redeem_promo_code('SANCTUARY-TEAM') must still grant premium.
--
--  FOLLOW-UP: any account that self-granted before this landed will still
--  read is_premium=true. Audit with:
--      select id, premium_source, premium_started_at from profiles
--      where is_premium = true
--        and premium_source is distinct from 'stripe'
--        and id not in (select user_id from promo_redemptions);
--  Rows returned there were granted by neither Stripe nor a promo code.
