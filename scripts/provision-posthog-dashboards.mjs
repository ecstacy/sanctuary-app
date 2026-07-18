#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  provision-posthog-dashboards.mjs — dashboards-as-code for PostHog
//
//  The human-readable spec lives in docs/posthog-dashboards.md; this script is
//  the executable mirror. It creates (or updates in place) the four dashboards
//  and their insights via PostHog's management REST API, so the boards can be
//  rebuilt or evolved without click-ops.
//
//  IDEMPOTENT — insights and dashboards are matched by a stable `tags` marker
//  (`provisioned:<slug>`), not by name, so re-running updates the existing
//  object rather than duplicating it. Safe to run repeatedly.
//
//  SAFETY — dry-run by default. It prints what it *would* create/update and
//  writes nothing. Pass `--apply` to actually mutate PostHog.
//
//  What it CAN'T do (do these by hand once, see the runbook):
//    - Subscriptions / digest emails / threshold alerts (UI-only).
//    - Pin ordering nuance beyond adding tiles to the dashboard.
//
//  Env (from .env.local):
//    POSTHOG_PERSONAL_API_KEY   phx_… personal key, scopes insight+dashboard rw
//    POSTHOG_API_HOST           app host, e.g. https://eu.posthog.com
//    POSTHOG_PROJECT_ID         numeric project (team) id  [optional; auto-detected]
//
//  Usage:
//    node scripts/provision-posthog-dashboards.mjs            # dry run
//    node scripts/provision-posthog-dashboards.mjs --apply    # write to PostHog
//    node scripts/provision-posthog-dashboards.mjs --apply --only=C   # one board
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dirname, '..')

// ── Load .env.local (no dotenv dependency; parse the few keys we need) ────────
function loadEnv() {
  const env = { ...process.env }
  try {
    const raw = readFileSync(join(REPO, '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !(m[1] in env)) env[m[1]] = m[2]
    }
  } catch { /* .env.local optional if vars already in process.env */ }
  return env
}

const ENV = loadEnv()
const API_KEY = ENV.POSTHOG_PERSONAL_API_KEY
const HOST = (ENV.POSTHOG_API_HOST || 'https://eu.posthog.com').replace(/\/+$/, '')
const ARGV = process.argv.slice(2)
const APPLY = ARGV.includes('--apply')
const ONLY = (ARGV.find(a => a.startsWith('--only=')) || '').split('=')[1] || null

if (!API_KEY) {
  console.error('✗ POSTHOG_PERSONAL_API_KEY missing (put it in .env.local).')
  process.exit(1)
}

// ── Thin REST helper ─────────────────────────────────────────────────────────
async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${HOST}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json
  try { json = text ? JSON.parse(text) : null } catch { json = { raw: text } }
  if (!res.ok) {
    throw new Error(`${method} ${path} → HTTP ${res.status}: ${JSON.stringify(json).slice(0, 400)}`)
  }
  return json
}

async function resolveProjectId() {
  if (ENV.POSTHOG_PROJECT_ID) return Number(ENV.POSTHOG_PROJECT_ID)
  const me = await api('/api/users/@me/')
  const team = me?.team?.id || me?.organization?.teams?.[0]?.id
  if (!team) throw new Error('Could not auto-detect project id; set POSTHOG_PROJECT_ID.')
  return team
}

// ── Query builders — PostHog "HogQL query node" schema (InsightVizNode) ───────
// These mirror what the UI writes when you build a Funnel / Trends / Retention.
const event = (id, extra = {}) => ({ kind: 'EventsNode', event: id, name: id, math: 'total', ...extra })

function funnel({ series, breakdown, windowHours = 24, exclusions }) {
  return {
    kind: 'InsightVizNode',
    source: {
      kind: 'FunnelsQuery',
      series: series.map(s => (typeof s === 'string' ? event(s) : event(s.event, s))),
      funnelsFilter: {
        funnelWindowInterval: windowHours,
        funnelWindowIntervalUnit: 'hour',
        ...(exclusions ? { exclusions } : {}),
      },
      ...(breakdown ? { breakdownFilter: { breakdown_type: 'event', breakdown } } : {}),
      dateRange: { date_from: '-30d' },
    },
  }
}

function trends({ series, breakdown, breakdownType = 'event', formula, display }) {
  return {
    kind: 'InsightVizNode',
    source: {
      kind: 'TrendsQuery',
      series: series.map(s => (typeof s === 'string' ? event(s) : event(s.event, s))),
      trendsFilter: { ...(formula ? { formula } : {}), ...(display ? { display } : {}) },
      ...(breakdown ? { breakdownFilter: { breakdown_type: breakdownType, breakdown } } : {}),
      dateRange: { date_from: '-30d' },
      interval: 'day',
    },
  }
}

function retention({ target, returning, period = 'Week', breakdown }) {
  return {
    kind: 'InsightVizNode',
    source: {
      kind: 'RetentionQuery',
      retentionFilter: {
        targetEntity: { id: target, name: target, type: 'events' },
        returningEntity: { id: returning, name: returning, type: 'events' },
        period,
        totalIntervals: 8,
        retentionType: 'retention_first_time',
      },
      ...(breakdown ? { breakdownFilter: { breakdown_type: 'event', breakdown } } : {}),
    },
  }
}

// ── The spec (mirror of docs/posthog-dashboards.md) ──────────────────────────
// Each dashboard has a slug (A/B/C/D) and a list of insights; each insight has
// a stable `slug` used for the provisioning tag.
const DASHBOARDS = [
  {
    slug: 'A', name: 'Onboarding & Conversion',
    description: 'First-touch → first practice. The core growth board.',
    insights: [
      {
        slug: 'A1', name: 'A1 · Onboarding funnel',
        query: funnel({
          series: ['signup_started', 'signup_completed', 'dosha_quiz_started', 'dosha_quiz_completed', 'practice_started'],
          breakdown: 'method', windowHours: 24,
        }),
      },
      {
        slug: 'A2', name: 'A2 · Login health (auth failure rate)',
        query: trends({
          series: ['login_succeeded', { event: 'login_failed', name: 'login_failed' }],
          breakdown: 'reason',
        }),
      },
    ],
  },
  {
    slug: 'B', name: 'Practice Engagement',
    description: 'Where the app value gets used.',
    insights: [
      {
        slug: 'B1', name: 'B1 · Practice completion funnel',
        query: funnel({
          series: ['practice_started', { event: 'pose_completed', name: 'pose_completed' }, 'practice_completed'],
          breakdown: 'routine_key', windowHours: 1,
        }),
      },
      {
        slug: 'B2', name: 'B2 · Per-pose completion rate',
        query: trends({
          series: ['pose_started', 'pose_completed'],
          breakdown: 'pose_id', formula: 'B / A * 100', display: 'ActionsTable',
        }),
      },
      {
        slug: 'B3', name: 'B3 · Voice & engagement',
        query: trends({ series: ['voice_toggled', 'practice_paused', 'why_this_pose_opened'] }),
      },
    ],
  },
  {
    slug: 'C', name: 'Daily Session & Habit',
    description: 'The DAU feature: composed session conversion + the habit loop.',
    insights: [
      {
        slug: 'C1', name: 'C1 · Daily-session conversion funnel',
        query: funnel({
          series: [
            'daily_session_composed',
            { event: 'content_impression', name: 'content_impression', properties: [{ key: 'surface', value: 'home_daily_session', operator: 'exact', type: 'event' }] },
            'daily_session_cta_tapped', 'daily_session_started', 'daily_session_completed',
          ],
          breakdown: 'slot', windowHours: 6,
        }),
      },
      {
        slug: 'C2', name: 'C2 · Personalization pull-through',
        query: trends({
          series: ['daily_session_completed'], breakdown: 'dosha_source', display: 'ActionsTable',
        }),
      },
      {
        slug: 'C3', name: 'C3 · Notification → return loop (practice_reminder)',
        query: funnel({
          series: [
            { event: 'notification_tapped', name: 'notification_tapped', properties: [{ key: 'kind', value: 'practice_reminder', operator: 'exact', type: 'event' }] },
            'daily_session_started', 'daily_session_completed',
          ],
          windowHours: 2,
        }),
      },
      {
        slug: 'C4', name: 'C4 · Reminder adoption',
        query: trends({
          series: ['notification_permission_result', 'notification_reminder_enabled', 'notification_reminder_disabled', 'notification_prompt_shown', 'notification_prompt_accepted'],
        }),
      },
    ],
  },
  {
    slug: 'D', name: 'Plus & Monetization',
    description: 'Upgrade funnel. Build now; test-mode traffic validates wiring.',
    insights: [
      {
        slug: 'D1', name: 'D1 · Paywall → checkout funnel',
        query: funnel({
          series: ['paywall_shown', 'paywall_plan_selected', 'paywall_checkout_started', 'paywall_checkout_completed'],
          breakdown: 'surface', windowHours: 1,
        }),
      },
      {
        slug: 'D2', name: 'D2 · Promo redemption path',
        query: funnel({
          series: ['promo_code_opened', 'promo_code_submitted', 'promo_code_redeemed'],
          windowHours: 1,
        }),
      },
      {
        slug: 'D3', name: 'D3 · Plus activation',
        query: trends({
          series: ['paywall_checkout_completed', 'promo_code_redeemed', 'welcome_to_plus_shown', 'welcome_to_plus_cta_tapped'],
        }),
      },
    ],
  },
  {
    slug: 'X', name: 'Cross-cutting',
    description: 'Retention + CTA insights that do not earn a dedicated board.',
    insights: [
      {
        slug: 'X2', name: 'X2 · CTA performance',
        query: trends({ series: ['cta_clicked'], breakdown: 'cta_id', display: 'ActionsBarValue' }),
      },
      {
        slug: 'X3', name: 'X3 · Retention (signup → practice)',
        query: retention({ target: 'signup_completed', returning: 'practice_started', period: 'Week' }),
      },
      {
        slug: 'X3b', name: 'X3b · Retention (signup → daily session)',
        query: retention({ target: 'signup_completed', returning: 'daily_session_completed', period: 'Week' }),
      },
      {
        // Doubles as a security signal: a sudden error spike is often the
        // first visible sign of someone fuzzing the app. Meaningful even at
        // low traffic — 100 errors/day with a handful of users is wrong by
        // definition. See docs/security-monitoring.md.
        slug: 'X5', name: 'X5 · Error rate (error_caught)',
        query: trends({ series: ['error_caught'], breakdown: 'kind' }),
      },
    ],
  },
]

const TAG = (slug) => `provisioned:${slug}`
const MARKER = 'provisioned'

// ── Upsert helpers (idempotent by provisioning tag) ──────────────────────────
async function findByTag(kind, tag, projectId) {
  // kind: 'dashboards' | 'insights'
  //
  // ⚠ PostHog LOWERCASES tags on write. Comparing case-sensitively meant
  // `provisioned:dash-X` never matched the stored `provisioned:dash-x`, so
  // "idempotent" re-runs silently created DUPLICATE dashboards and insights
  // instead of updating them. (It did exactly that once — a second
  // "Cross-cutting" board.) Compare lowercase on both sides.
  const want = tag.toLowerCase()
  const r = await api(`/api/projects/${projectId}/${kind}/?limit=200`)
  const items = (r?.results || []).filter(i => !i.deleted)
  return items.find(i =>
    Array.isArray(i.tags) && i.tags.some(t => String(t).toLowerCase() === want)
  ) || null
}

async function upsertInsight(insight, projectId) {
  const tag = TAG(insight.slug)
  const existing = await findByTag('insights', tag, projectId)
  const payload = { name: insight.name, query: insight.query, tags: [MARKER, tag] }
  if (!APPLY) {
    console.log(`   ${existing ? '↻ update' : '＋ create'} insight  ${insight.slug}  "${insight.name}"`)
    return existing?.id ?? `dry:${insight.slug}`
  }
  const saved = existing
    ? await api(`/api/projects/${projectId}/insights/${existing.id}/`, { method: 'PATCH', body: payload })
    : await api(`/api/projects/${projectId}/insights/`, { method: 'POST', body: payload })
  console.log(`   ${existing ? '↻ updated' : '＋ created'} insight ${insight.slug} (id=${saved.id})`)
  return saved.id
}

async function upsertDashboard(board, projectId) {
  const tag = TAG(`dash-${board.slug}`)
  const existing = await findByTag('dashboards', tag, projectId)
  const payload = { name: board.name, description: board.description, tags: [MARKER, tag] }
  let dashId
  if (!APPLY) {
    console.log(`\n▸ Dashboard ${board.slug}: ${existing ? '↻ update' : '＋ create'} "${board.name}"`)
    dashId = existing?.id ?? `dry:${board.slug}`
  } else {
    const saved = existing
      ? await api(`/api/projects/${projectId}/dashboards/${existing.id}/`, { method: 'PATCH', body: payload })
      : await api(`/api/projects/${projectId}/dashboards/`, { method: 'POST', body: payload })
    dashId = saved.id
    console.log(`\n▸ Dashboard ${board.slug} "${board.name}" ${existing ? '↻ updated' : '＋ created'} (id=${dashId})`)
  }

  for (const insight of board.insights) {
    const insightId = await upsertInsight(insight, projectId)
    if (APPLY && !String(insightId).startsWith('dry:')) {
      // Attach insight tile to the dashboard (idempotent: PostHog dedups by insight).
      await api(`/api/projects/${projectId}/insights/${insightId}/`, {
        method: 'PATCH', body: { dashboards: [dashId] },
      }).catch(e => console.warn(`   ! tile attach warned: ${e.message}`))
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`PostHog dashboards — ${APPLY ? 'APPLY (writing)' : 'DRY RUN (no writes)'}  host=${HOST}`)
  const projectId = await resolveProjectId()
  console.log(`Project id: ${projectId}${ONLY ? `   (filter --only=${ONLY})` : ''}`)

  const boards = ONLY ? DASHBOARDS.filter(b => b.slug === ONLY) : DASHBOARDS
  if (!boards.length) { console.error(`No dashboard matches --only=${ONLY}`); process.exit(1) }

  for (const board of boards) await upsertDashboard(board, projectId)

  console.log(`\n${APPLY ? '✓ Done.' : 'Dry run complete — re-run with --apply to write.'}`)
  if (APPLY) console.log('Remember: subscriptions & threshold alerts are UI-only (see runbook §Alerts).')
}

main().catch(e => { console.error('\n✗', e.message); process.exit(1) })
