-- ─────────────────────────────────────────────────────────────────────────
--  015 — Security signals: make attacks visible
--
--  We have two guards (013 promo rate-limit, 014 entitlement trigger) that
--  successfully BLOCK attacks but record nothing useful, so a determined
--  probe leaves no trace anyone would ever look at. Blocking without
--  detection means we'd never know we were targeted, or by whom.
--
--  This migration adds the detection half. It deliberately stays small —
--  no log drains, no SIEM, no rate-limiting middleware. See
--  docs/security-monitoring.md for what we explicitly chose NOT to build.
--
--  ── The transaction problem (why the entitlement signal uses RAISE LOG) ──
--  The 014 trigger ends in `raise exception`, which aborts the transaction.
--  Anything it INSERTed into a log table in that same transaction is rolled
--  back with it, and Postgres has no autonomous transactions. So the only
--  record that survives an aborted transaction is the server log, which is
--  written outside transaction scope. Hence RAISE LOG rather than a table.
--  We keep the exception — failing closed and loudly is worth more than a
--  tidier log, and Supabase's Logs Explorer is queryable.
-- ─────────────────────────────────────────────────────────────────────────


-- ── (a) Entitlement-write attempts → server log ──────────────────────────
-- Same guard as 014, plus a structured, greppable log line before it raises.
-- Prefix SECURITY_SIGNAL makes it searchable in the Supabase Logs Explorer.
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

      -- Survives the rollback below (server log is not transactional).
      -- Nobody hits this by accident: the client never writes these columns,
      -- so every occurrence is somebody probing for the self-grant hole.
      raise log
        'SECURITY_SIGNAL entitlement_write_blocked user=% role=% is_premium=%->% source=%->%',
        coalesce(auth.uid()::text, 'anon'),
        current_user,
        old.is_premium, new.is_premium,
        coalesce(old.premium_source, '-'), coalesce(new.premium_source, '-');

      raise exception
        'entitlement columns are not client-writable (use redeem_promo_code or purchase)'
        using errcode = '42501';   -- insufficient_privilege
    end if;
  end if;
  return new;
end $$;


-- ── (b) Promo abuse → a view over data we already collect ────────────────
-- 013 logs every promo attempt but nothing ever read the table. These views
-- turn it into something reviewable in one query.

-- Per-user rollup over the last 7 days. `distinct_codes_tried` is the
-- giveaway: a real user retypes ONE code; a script sprays many.
create or replace view security_promo_abuse as
select
  user_id,
  count(*)                                             as attempts,
  count(*) filter (where not succeeded)                as failures,
  count(distinct code_tried) filter (where not succeeded) as distinct_codes_tried,
  max(attempted_at)                                    as last_attempt,
  min(attempted_at)                                    as first_attempt
from promo_attempts
where attempted_at > now() - interval '7 days'
group by user_id
having count(*) filter (where not succeeded) >= 5
order by distinct_codes_tried desc, failures desc;

comment on view security_promo_abuse is
  'Users with >=5 failed promo attempts in 7d. High distinct_codes_tried = enumeration, not fat fingers.';

-- The codes being guessed — tells us whether real codes leaked, or someone is
-- brute-forcing blind. Only failures: successes are legitimate redemptions.
create or replace view security_promo_codes_probed as
select
  code_tried,
  count(*)               as attempts,
  count(distinct user_id) as distinct_users,
  max(attempted_at)      as last_seen
from promo_attempts
where not succeeded
  and attempted_at > now() - interval '30 days'
  and code_tried is not null
group by code_tried
having count(*) >= 3
order by attempts desc;

comment on view security_promo_codes_probed is
  'Most-guessed failing promo codes (30d). Many distinct_users on one code suggests a leaked/shared code.';

-- Views inherit the caller's permissions, but be explicit: clients must never
-- read these. Only service_role (dashboard / a review script).
revoke all on security_promo_abuse        from anon, authenticated;
revoke all on security_promo_codes_probed from anon, authenticated;
grant  select on security_promo_abuse        to service_role;
grant  select on security_promo_codes_probed to service_role;


-- ── Verification ─────────────────────────────────────────────────────────
--  (a) As a client role, attempt an entitlement write and confirm BOTH that
--      it still fails 42501 AND that a SECURITY_SIGNAL line appears in
--      Supabase → Logs → Postgres. Use the single-statement do-block from
--      migration 014 (the SQL editor runs as a privileged role otherwise —
--      see that file for why the obvious test is worthless).
--  (b) select * from security_promo_abuse;  -- empty until someone abuses it
--
--  Alerting + the weekly review routine: docs/security-monitoring.md
