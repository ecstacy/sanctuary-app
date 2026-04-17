-- ═══════════════════════════════════════════════════════════════════════════
-- Chunk 4: pose_interactions
-- Flattens every pose within every practice session into its own row.
-- This is the ML/analytics training table — answers questions like:
--   "which poses does this user skip most often?"
--   "how close is actual hold duration to prescribed?"
--   "which poses correlate with biggest feel-better deltas?"
-- practice_sessions.asanas JSONB is retained as a convenience payload for
-- the completion screen, but this table is the source of truth for queries.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists pose_interactions (
  id                            uuid         primary key default gen_random_uuid(),
  session_id                    uuid         not null references practice_sessions(id) on delete cascade,
  user_id                       uuid         not null references auth.users(id) on delete cascade,
  pose_id                       text         not null,
  pose_sanskrit                 text,
  pose_order                    smallint     not null,
  prescribed_duration_seconds   integer,
  actual_duration_seconds       integer      not null default 0,
  was_skipped                   boolean      not null default false,
  was_repeated                  boolean      not null default false,
  created_at                    timestamptz  not null default now()
);

-- Session join (also supports "all poses in a given session")
create index if not exists idx_pose_interactions_session
  on pose_interactions (session_id, pose_order);

-- User history — most recent pose interactions first
create index if not exists idx_pose_interactions_user_created
  on pose_interactions (user_id, created_at desc);

-- The ML feature index: "everything this user ever did with this pose"
create index if not exists idx_pose_interactions_user_pose_created
  on pose_interactions (user_id, pose_id, created_at desc);

-- Row-level security
alter table pose_interactions enable row level security;

create policy "Users can read own pose interactions"
  on pose_interactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own pose interactions"
  on pose_interactions for insert
  with check (auth.uid() = user_id);

-- ─── One-time backfill ────────────────────────────────────────────────────
-- Unnest practice_sessions.asanas JSONB → one pose_interactions row per pose.
-- Idempotent: only backfills sessions that don't already have rows.

insert into pose_interactions (
  session_id, user_id, pose_id, pose_sanskrit, pose_order,
  actual_duration_seconds, was_skipped, created_at
)
select
  ps.id,
  ps.user_id,
  (elem.value->>'id'),
  (elem.value->>'sanskrit'),
  elem.ordinality::smallint,
  coalesce((elem.value->>'actualDuration')::integer, 0),
  coalesce((elem.value->>'skipped')::boolean, false),
  ps.created_at
from practice_sessions ps
cross join lateral jsonb_array_elements(ps.asanas) with ordinality as elem(value, ordinality)
where ps.asanas is not null
  and jsonb_typeof(ps.asanas) = 'array'
  and (elem.value->>'id') is not null
  and not exists (
    select 1 from pose_interactions pi where pi.session_id = ps.id
  );
