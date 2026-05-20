-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 009 — Protocol day completions
--
-- Records when a Plus user marks a day of a vikriti pacifying protocol
-- complete. Append-only: every "mark complete" tap creates a row, and
-- unmark deletes the most recent row for that (user, vikriti, day) pair.
-- This shape gives us both current-attempt state AND a longitudinal
-- history of how many times the user has worked through each protocol.
--
-- WHY APPEND-ONLY, NOT UPSERT
-- ───────────────────────────
-- A user who runs the Vata protocol three times in three months is doing
-- meaningful work — we want to remember each pass, not just the most
-- recent one. Append rows; the client computes "current attempt" as
-- completions within the last 14 days (the same window the vikriti
-- detection uses), and earlier completions become history.
--
-- WHY NO "ATTEMPTS" TABLE
-- ──────────────────────
-- A separate protocol_attempts table would let us model "started but
-- abandoned" explicitly, but it requires the user to "start" a protocol
-- — extra ceremony for marginal value. Inferring attempts from the
-- timing of completion rows is good enough for v1, and the schema can
-- migrate to attempts later without losing data.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists protocol_day_completions (
  id              uuid         primary key default gen_random_uuid(),
  user_id         uuid         not null references auth.users(id) on delete cascade,

  -- Which protocol this completion belongs to. Tied to the vikriti
  -- (Vata-pacifying / Pitta-cooling / Kapha-energizing) rather than a
  -- protocol id so we can rename / restructure protocols without
  -- breaking historical rows.
  vikriti         text         not null check (vikriti in ('vata', 'pitta', 'kapha')),

  -- 1..N. Bounded to 7 so the column accommodates longer future protocols
  -- (week-long Pancakarma-inspired plans, say) without a schema change.
  day             smallint     not null check (day between 1 and 7),

  completed_at    timestamptz  not null default now(),

  -- Free-form attribution so we can attribute completions to specific
  -- nudges (vikriti_card / dosha_profile / direct_link / push_reminder).
  -- Useful for measuring which entry point actually drives follow-through.
  context         jsonb        not null default '{}'::jsonb
);

-- Primary read pattern: "what completions does this user have for this
-- vikriti?" — runs every time the ProtocolPage loads.
create index if not exists idx_protocol_completions_user_vikriti
  on protocol_day_completions(user_id, vikriti, completed_at desc);

-- Secondary read: "what protocols has this user done lately?" for any
-- future cross-protocol history surface.
create index if not exists idx_protocol_completions_user_recent
  on protocol_day_completions(user_id, completed_at desc);

-- ── RLS ────────────────────────────────────────────────────────────────────
-- Users see + write their own rows. No service-role needs here since
-- there's no webhook or external integration; the client writes directly
-- under their own JWT.
alter table protocol_day_completions enable row level security;

drop policy if exists "protocol_completions_select_own" on protocol_day_completions;
create policy "protocol_completions_select_own"
  on protocol_day_completions for select
  using (auth.uid() = user_id);

drop policy if exists "protocol_completions_insert_own" on protocol_day_completions;
create policy "protocol_completions_insert_own"
  on protocol_day_completions for insert
  with check (auth.uid() = user_id);

-- Unmark = delete the most recent row. Allow delete on owned rows only.
drop policy if exists "protocol_completions_delete_own" on protocol_day_completions;
create policy "protocol_completions_delete_own"
  on protocol_day_completions for delete
  using (auth.uid() = user_id);
