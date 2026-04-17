-- ═══════════════════════════════════════════════════════════════════════════
-- Chunk 3: user_state_checkins
-- Every mood/energy/stress data point a user ever logs.
--   - pre_practice   : 2-tap quick check before starting a routine
--   - post_practice  : 1-tap feel-better check after finishing a session
--   - reset          : state captured when user taps the "Reset" intervention
--   - standalone     : voluntary check-in (e.g., daily mood log)
-- Paired pre/post rows link to the same practice_sessions row via
-- related_session_id, enabling the feel-better-delta analysis that powers
-- adaptive recommendations.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists user_state_checkins (
  id                  uuid         primary key default gen_random_uuid(),
  user_id             uuid         not null references auth.users(id) on delete cascade,
  checkin_type        text         not null check (checkin_type in (
                                      'pre_practice', 'post_practice', 'reset', 'standalone'
                                    )),
  stress_level        smallint     check (stress_level between 1 and 5),
  energy_level        smallint     check (energy_level between 1 and 5),
  mood_tags           text[]       default '{}',
  body_focus          text[]       default '{}',
  notes               text,
  related_session_id  uuid         references practice_sessions(id) on delete set null,
  context             jsonb        default '{}'::jsonb,
  created_at          timestamptz  not null default now()
);

-- Primary query pattern: latest check-ins for a user
create index if not exists idx_checkins_user_created
  on user_state_checkins (user_id, created_at desc);

-- Secondary: latest check-ins of a specific type (e.g., most recent standalone mood log)
create index if not exists idx_checkins_user_type_created
  on user_state_checkins (user_id, checkin_type, created_at desc);

-- Secondary: join pre/post checkins to their session for delta analysis
create index if not exists idx_checkins_session
  on user_state_checkins (related_session_id)
  where related_session_id is not null;

-- Row-level security — users only see / insert their own checkins
alter table user_state_checkins enable row level security;

create policy "Users can read own checkins"
  on user_state_checkins for select
  using (auth.uid() = user_id);

create policy "Users can insert own checkins"
  on user_state_checkins for insert
  with check (auth.uid() = user_id);
