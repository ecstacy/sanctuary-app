-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 018 — Meal Check logs + trial start
--
-- Backs the "I ate X, what does it do to my doshas?" feature (Plus-only, with a
-- 7-day full trial for free users). Two pieces:
--
--   1. meal_logs        — per-account, cross-device history of meal checks.
--   2. profiles column  — meal_check_trial_started_at, so the trial window is
--                          anchored to first use and NOT resettable by deleting
--                          history (deriving it from the first log row would let
--                          a user clear their meals to earn another free week).
--
-- The verdict itself is computed client-side by src/lib/mealCheck.js over the
-- reviewed ingredient dataset; we persist a SNAPSHOT of that result so history
-- renders stably even after the dataset or engine changes.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Trial anchor on the profile ─────────────────────────────────────────────
-- Nullable: null = the user has never run a meal check. Set once (client, on the
-- first check) and then left alone. NOT one of the entitlement columns guarded
-- by migration 014, so the client may write it under its own JWT.
alter table profiles
  add column if not exists meal_check_trial_started_at timestamptz;

-- ── meal_logs ───────────────────────────────────────────────────────────────
create table if not exists meal_logs (
  id            uuid         primary key default gen_random_uuid(),
  user_id       uuid         not null references auth.users(id) on delete cascade,

  -- When the meal was eaten. Client may backdate to the chosen slot (this
  -- morning) rather than the moment of logging; defaults to now().
  eaten_at      timestamptz  not null default now(),

  -- What the user typed, kept verbatim so their history reads back naturally.
  input_text    text,

  -- Resolved reviewed-ingredient ids (src/data/ayurveda/ingredients.js). May be
  -- empty if nothing matched; unmatched free text stays in input_text only.
  item_ids      text[]       not null default '{}',

  -- Snapshot of the computed verdict at log time:
  --   { perDosha:{vata,pitta,kapha}, headline, concern, lens,
  --     remedies:{ foods:[id], practices:[id] } }
  -- Stored so the history card doesn't have to re-run the engine against a
  -- dataset that may have shifted since.
  assessment    jsonb        not null default '{}'::jsonb,

  -- Attribution: { slot, entry_point, app_version }.
  context       jsonb        not null default '{}'::jsonb
);

-- Primary read: this user's recent meals, newest first (history + trial checks).
create index if not exists idx_meal_logs_user_recent
  on meal_logs(user_id, eaten_at desc);

-- ── RLS ────────────────────────────────────────────────────────────────────
-- Own-rows only; the client writes directly under its JWT (no webhook/service
-- role involved). Mirrors protocol_day_completions (migration 009).
alter table meal_logs enable row level security;

drop policy if exists "meal_logs_select_own" on meal_logs;
create policy "meal_logs_select_own"
  on meal_logs for select
  using (auth.uid() = user_id);

drop policy if exists "meal_logs_insert_own" on meal_logs;
create policy "meal_logs_insert_own"
  on meal_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "meal_logs_update_own" on meal_logs;
create policy "meal_logs_update_own"
  on meal_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "meal_logs_delete_own" on meal_logs;
create policy "meal_logs_delete_own"
  on meal_logs for delete
  using (auth.uid() = user_id);
