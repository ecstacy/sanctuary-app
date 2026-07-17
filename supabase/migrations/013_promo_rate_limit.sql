-- ─────────────────────────────────────────────────────────────────────────
--  013 — Rate-limit promo redemption (brute-force guard)
--
--  WHY
--  ---
--  `redeem_promo_code()` is SECURITY DEFINER, so RLS does not constrain it —
--  and it was callable an unlimited number of times by any signed-in user.
--  Promo codes are the one path that flips `is_premium` without payment, so an
--  attacker could enumerate guessable codes ('LAUNCH50', 'FREEYOGA', …) and
--  grant themselves Plus for free. Nothing in the schema stopped that.
--  See docs/security-audit.md finding #1.
--
--  APPROACH
--  --------
--  Log every attempt, and reject once a user exceeds MAX_FAILED_ATTEMPTS
--  failures in the rolling window. We count FAILURES only: a legitimate user
--  redeeming one valid code is never impeded, while a script trying codes runs
--  out of budget almost immediately.
--
--  Keyed on user_id (auth is already required to call the RPC), so an attacker
--  must burn an account per bucket rather than spraying anonymously. This is a
--  deliberate trade-off: a determined attacker can create accounts, so this
--  raises cost rather than making enumeration impossible. The real defence is
--  HIGH-ENTROPY CODES — see the note at the bottom.
--
--  The attempts table is client-invisible (RLS on, no policies) — only the
--  definer function and service_role touch it.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists promo_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  -- The attempted code, so we can see WHAT is being sprayed in an incident.
  -- Not a secret (the user typed it); truncated to bound abuse of this column.
  code_tried   text,
  succeeded    boolean not null default false,
  attempted_at timestamptz not null default now()
);

-- The rate-check reads (user_id, attempted_at) for failures in a window.
create index if not exists idx_promo_attempts_user_time
  on promo_attempts (user_id, attempted_at desc)
  where succeeded = false;

alter table promo_attempts enable row level security;
-- No policies, deliberately: clients must never read or write this table.
-- redeem_promo_code() is SECURITY DEFINER and bypasses RLS; service_role can
-- read it for incident review.
revoke all on promo_attempts from anon, authenticated;


-- ── redeem_promo_code, with the guard ────────────────────────────────────
-- Recreated in full (create or replace) — the only changes vs 007 are the
-- rate-limit block (step 2) and the attempt logging on each failure path.
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
  v_failures   int;
  -- Tuning: 10 failures/hour. A real user mistypes 2-3 times at most; a
  -- script exhausts this in seconds and then gains ~nothing per hour.
  c_max_failed constant int      := 10;
  c_window     constant interval := interval '1 hour';
begin
  -- 1) Auth required.
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  -- 2) Rate limit — count recent FAILED attempts by this user.
  select count(*) into v_failures
  from promo_attempts
  where user_id = v_user_id
    and succeeded = false
    and attempted_at > now() - c_window;

  if v_failures >= c_max_failed then
    -- Deliberately does NOT log another attempt: a blocked caller must not be
    -- able to extend their own lockout window indefinitely by hammering.
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  -- 3) Find the code (case-insensitive, trimmed).
  select * into v_promo
  from promo_codes
  where upper(trim(code)) = upper(trim(input_code))
  limit 1;

  if not found then
    insert into promo_attempts (user_id, code_tried, succeeded)
    values (v_user_id, left(coalesce(input_code, ''), 64), false);
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  -- 4) Status checks. Each failure is logged — a wrong-but-real code is still
  --    a signal, and an exhausted/expired code shouldn't be probeable for free.
  if not v_promo.active then
    insert into promo_attempts (user_id, code_tried, succeeded)
    values (v_user_id, left(input_code, 64), false);
    return jsonb_build_object('ok', false, 'error', 'inactive');
  end if;
  if v_promo.valid_until is not null and v_promo.valid_until < now() then
    insert into promo_attempts (user_id, code_tried, succeeded)
    values (v_user_id, left(input_code, 64), false);
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;
  if v_promo.valid_from > now() then
    insert into promo_attempts (user_id, code_tried, succeeded)
    values (v_user_id, left(input_code, 64), false);
    return jsonb_build_object('ok', false, 'error', 'not_yet_valid');
  end if;
  if v_promo.max_redemptions > 0 and v_promo.used_count >= v_promo.max_redemptions then
    insert into promo_attempts (user_id, code_tried, succeeded)
    values (v_user_id, left(input_code, 64), false);
    return jsonb_build_object('ok', false, 'error', 'exhausted');
  end if;

  -- 5) Already redeemed by this user? Not a brute-force signal (they already
  --    know this code), so it is not counted as a failure.
  select id into v_existing
  from promo_redemptions
  where user_id = v_user_id and promo_code_id = v_promo.id;
  if found then
    return jsonb_build_object('ok', false, 'error', 'already_redeemed');
  end if;

  -- 6) Only `full_grant` is wired in v1.
  if v_promo.kind <> 'full_grant' then
    return jsonb_build_object('ok', false, 'error', 'kind_not_supported');
  end if;

  -- 7) Compute expiry (null = lifetime).
  if v_promo.duration_days is null then
    v_granted := null;
  else
    v_granted := now() + (v_promo.duration_days || ' days')::interval;
  end if;

  -- 8) Grant.
  update profiles
  set is_premium         = true,
      premium_source     = 'promo',
      premium_started_at = coalesce(premium_started_at, now()),
      premium_expires_at = case
                             when v_granted is null then null
                             else greatest(coalesce(premium_expires_at, now()), v_granted)
                           end
  where id = v_user_id;

  -- 9) Log redemption + bump counter + record the successful attempt.
  insert into promo_redemptions (user_id, promo_code_id, code_snapshot, granted_until)
  values (v_user_id, v_promo.id, input_code, v_granted);

  update promo_codes set used_count = used_count + 1 where id = v_promo.id;

  insert into promo_attempts (user_id, code_tried, succeeded)
  values (v_user_id, left(input_code, 64), true);

  return jsonb_build_object(
    'ok',            true,
    'granted_until', v_granted,
    'code',          v_promo.code
  );
end $$;

grant execute on function redeem_promo_code(text) to authenticated;


-- ── Housekeeping ─────────────────────────────────────────────────────────
-- Attempts older than 30 days have no forensic value; keep the table small.
-- Call from the same nightly job that expires premium (see 007).
create or replace function prune_promo_attempts()
returns void
language sql
security definer
set search_path = public
as $$
  delete from promo_attempts where attempted_at < now() - interval '30 days';
$$;

grant execute on function prune_promo_attempts() to service_role;


-- ── OPERATIONAL NOTE — the rate limit is the SECOND line of defence ───────
-- Rate limiting raises the cost of enumeration; it does not make it
-- impossible (an attacker can register more accounts). The primary defence is
-- code entropy. When minting codes:
--   • Use >=10 random chars, e.g. encode(gen_random_bytes(8),'base32') —
--     NOT guessable words like 'LAUNCH50' or 'FREEYOGA'.
--   • Always set max_redemptions (never leave it unbounded).
--   • Set valid_until on campaign codes so a leak has a fuse.
-- The seeded 'SANCTUARY-TEAM' code in 007 is guessable by design but is capped
-- at 20 redemptions and is internal-only; rotate it before public launch.
