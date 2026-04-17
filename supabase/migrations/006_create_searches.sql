-- ═══════════════════════════════════════════════════════════════════════════
-- Chunk 10: searches
-- Dedicated table for user-submitted queries (symptom search, popular-chip
-- taps, "Also Related" pivots). Separate from content_events because:
--
--   • Queries are raw text (unbounded) — don't fit content_events.content_id
--     semantics which assume stable content identifiers.
--   • We want aggregate analytics on `normalized_query` ("what are people
--     searching for?") — indexed separately from user engagement.
--   • content_events.event_type CHECK constraint doesn't admit 'searched';
--     rather than loosen the constraint we model this as first-class data.
--
-- Click-through attribution stays in content_events (shown/clicked rows with
-- context.query set), so searches + content_events can be JOIN'd when needed.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists searches (
  id                 uuid         primary key default gen_random_uuid(),
  user_id            uuid         not null references auth.users(id) on delete cascade,

  -- Raw query as typed (case preserved for debugging/display)
  query              text         not null,

  -- Lowercased + trimmed for grouping and aggregation.
  -- Generated column so we can't drift from the source of truth.
  normalized_query   text         generated always as (lower(trim(query))) stored,

  -- How many results came back. 0 = no-match (useful for gap analysis).
  result_count       smallint     not null default 0,

  -- What the engine ranked #1 for this query (null if no results).
  top_result_id      text,
  top_result_type    text,        -- 'recommendation' | 'asana' | 'routine'

  -- Where the search was initiated from.
  -- Free-form text, but use vocabulary from SEARCH_SOURCES in analytics.js.
  source             text         not null,

  -- Anything else (time_of_day, checked_in state, etc.)
  context            jsonb        default '{}'::jsonb,

  created_at         timestamptz  not null default now()
);

-- User history (most recent searches first) — "show me my search history"
create index if not exists idx_searches_user_created
  on searches (user_id, created_at desc);

-- Aggregate analytics — "what are users searching for globally?"
-- Not user-scoped because the analysis crosses users.
create index if not exists idx_searches_normalized_created
  on searches (normalized_query, created_at desc);

-- Gap analysis — "which queries consistently return zero results?"
-- Partial index keeps it small.
create index if not exists idx_searches_no_results
  on searches (normalized_query, created_at desc)
  where result_count = 0;

alter table searches enable row level security;

create policy "Users can read own searches"
  on searches for select
  using (auth.uid() = user_id);

create policy "Users can insert own searches"
  on searches for insert
  with check (auth.uid() = user_id);
