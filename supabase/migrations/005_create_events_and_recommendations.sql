-- ═══════════════════════════════════════════════════════════════════════════
-- Chunk 6: recommendations_log + content_events
-- Two tightly-coupled analytics tables that form the backbone of the
-- personalization feedback loop.
--
--   recommendations_log — "what did the app suggest, why, at what rank?"
--                         One row per recommendation surface per decision event.
--
--   content_events      — "what did the user do with content they encountered?"
--                         One row per engagement (shown/clicked/started/etc.).
--                         Optionally links back to a recommendation for
--                         recommended-vs-acted analysis.
--
-- Order matters: recommendations_log must exist before content_events (FK).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── recommendations_log ──────────────────────────────────────────────────

create table if not exists recommendations_log (
  id                        uuid         primary key default gen_random_uuid(),
  user_id                   uuid         not null references auth.users(id) on delete cascade,
  surface                   text         not null,
  recommended_content_type  text         not null,
  recommended_content_id    text         not null,
  rank                      smallint     not null default 1,
  reasoning                 jsonb        default '{}'::jsonb,
  engine_version            text         default 'v0',
  created_at                timestamptz  not null default now()
);

-- User history (most recent recommendations first)
create index if not exists idx_recommendations_user_created
  on recommendations_log (user_id, created_at desc);

-- Latest rec for a specific surface (e.g., "what did we show on home today?")
create index if not exists idx_recommendations_user_surface_created
  on recommendations_log (user_id, surface, created_at desc);

alter table recommendations_log enable row level security;

create policy "Users can read own recommendations"
  on recommendations_log for select
  using (auth.uid() = user_id);

create policy "Users can insert own recommendations"
  on recommendations_log for insert
  with check (auth.uid() = user_id);

-- ─── content_events ───────────────────────────────────────────────────────

create table if not exists content_events (
  id                 uuid         primary key default gen_random_uuid(),
  user_id            uuid         not null references auth.users(id) on delete cascade,
  event_type         text         not null check (event_type in (
                                    'shown', 'clicked', 'started', 'completed',
                                    'dismissed', 'saved', 'shared'
                                  )),
  content_type       text         not null check (content_type in (
                                    'asana', 'routine', 'recommendation',
                                    'insight', 'search_result', 'tip'
                                  )),
  content_id         text         not null,
  surface            text,
  recommendation_id  uuid         references recommendations_log(id) on delete set null,
  context            jsonb        default '{}'::jsonb,
  created_at         timestamptz  not null default now()
);

-- User engagement history
create index if not exists idx_content_events_user_created
  on content_events (user_id, created_at desc);

-- "Everything this user did with this specific piece of content"
-- (the engagement-per-content feature index for ML)
create index if not exists idx_content_events_user_content_created
  on content_events (user_id, content_type, content_id, created_at desc);

-- Fast join from a recommendation back to all actions taken on it
create index if not exists idx_content_events_recommendation
  on content_events (recommendation_id)
  where recommendation_id is not null;

alter table content_events enable row level security;

create policy "Users can read own content events"
  on content_events for select
  using (auth.uid() = user_id);

create policy "Users can insert own content events"
  on content_events for insert
  with check (auth.uid() = user_id);
