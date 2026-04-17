-- ═══════════════════════════════════════════════════════════════════════════
-- Chunk 1: dosha_assessments
-- Stores every dosha assessment a user has ever taken.
--   - prakriti = constitutional (original baseline, taken once)
--   - vikriti  = current imbalance (re-assessed periodically)
-- This is the source of truth for a user's dosha history. profiles.dosha is
-- kept as a denormalized cache for fast reads.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists dosha_assessments (
  id                uuid         primary key default gen_random_uuid(),
  user_id           uuid         not null references auth.users(id) on delete cascade,
  assessment_type   text         not null check (assessment_type in ('prakriti', 'vikriti')),
  primary_dosha     text         not null check (primary_dosha in ('vata', 'pitta', 'kapha')),
  secondary_dosha   text         check (secondary_dosha in ('vata', 'pitta', 'kapha')),
  vata_score        numeric      not null default 0,
  pitta_score       numeric      not null default 0,
  kapha_score       numeric      not null default 0,
  quiz_version      text         not null default 'v1',
  raw_details       jsonb        default '{}'::jsonb,
  created_at        timestamptz  not null default now()
);

-- Fast lookup of a user's latest assessment, or history of a specific type
create index if not exists idx_dosha_assessments_user_created
  on dosha_assessments (user_id, created_at desc);

create index if not exists idx_dosha_assessments_user_type_created
  on dosha_assessments (user_id, assessment_type, created_at desc);

-- Row-level security — users only see / insert their own assessments
alter table dosha_assessments enable row level security;

create policy "Users can read own assessments"
  on dosha_assessments for select
  using (auth.uid() = user_id);

create policy "Users can insert own assessments"
  on dosha_assessments for insert
  with check (auth.uid() = user_id);

-- ─── One-time backfill ────────────────────────────────────────────────────
-- Seed a prakriti row for every existing profile that already has a dosha,
-- using the dosha_details JSONB if present. Safe to run multiple times — the
-- NOT EXISTS guard prevents duplicate prakriti rows per user.

insert into dosha_assessments (
  user_id, assessment_type, primary_dosha, secondary_dosha,
  vata_score, pitta_score, kapha_score, quiz_version, raw_details, created_at
)
select
  p.id,
  'prakriti',
  lower(coalesce(p.dosha_details->>'primary', split_part(lower(p.dosha), '-', 1))),
  lower(nullif(p.dosha_details->>'secondary', '')),
  coalesce((p.dosha_details->'scores'->>'vata')::numeric,  (p.dosha_details->>'vata')::numeric,  0),
  coalesce((p.dosha_details->'scores'->>'pitta')::numeric, (p.dosha_details->>'pitta')::numeric, 0),
  coalesce((p.dosha_details->'scores'->>'kapha')::numeric, (p.dosha_details->>'kapha')::numeric, 0),
  'v1-backfill',
  coalesce(p.dosha_details, '{}'::jsonb),
  coalesce(p.updated_at, p.created_at, now())
from profiles p
where p.dosha is not null
  and lower(coalesce(p.dosha_details->>'primary', split_part(lower(p.dosha), '-', 1)))
      in ('vata', 'pitta', 'kapha')
  and not exists (
    select 1 from dosha_assessments a
    where a.user_id = p.id and a.assessment_type = 'prakriti'
  );
