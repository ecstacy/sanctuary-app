-- Drop any partial table from previous failed attempts, then recreate cleanly.

drop table if exists practice_sessions;

create table practice_sessions (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users(id) on delete cascade,
  practice_date     date        not null default current_date,
  routine_key       text        not null,
  routine_label     text        not null,
  duration_seconds  integer     not null default 0,
  completed_count   integer     not null default 0,
  skipped_count     integer     not null default 0,
  total_poses       integer     not null default 0,
  asanas            jsonb       not null default '[]'::jsonb,
  created_at        timestamptz not null default now()
);

create index idx_practice_sessions_user_date
  on practice_sessions (user_id, practice_date desc);

alter table practice_sessions enable row level security;

create policy "Users can read own sessions"
  on practice_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on practice_sessions for insert
  with check (auth.uid() = user_id);
