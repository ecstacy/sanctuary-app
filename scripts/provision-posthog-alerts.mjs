#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  provision-posthog-alerts.mjs — subscriptions & threshold alerts (chunk 4)
//
//  Companion to provision-posthog-dashboards.mjs. That script builds the
//  boards; this one wires the *notifications* on top of them:
//    - Weekly email digests (the Monday 09:00 CET digest from the runbook).
//    - Threshold alerts (e.g. login-failure rate > 5%).
//
//  Both are keyed to insights the dashboards script created, resolved by their
//  `provisioned:<slug>` tag — so run the dashboards script FIRST.
//
//  IDEMPOTENT — subscriptions/alerts are matched by title/name, so re-running
//  updates rather than duplicating. SAFETY — dry-run by default; --apply writes.
//
//  Slack routing is intentionally out of scope: it needs a Slack integration
//  that a personal API key can't provision. Email digests + email alerts cover
//  the runbook; add Slack by hand in the UI if desired.
//
//  Env (.env.local): POSTHOG_PERSONAL_API_KEY, POSTHOG_API_HOST,
//    POSTHOG_DIGEST_EMAIL (optional; defaults to the account owner's email).
//
//  Usage:
//    node scripts/provision-posthog-alerts.mjs            # dry run
//    node scripts/provision-posthog-alerts.mjs --apply    # write
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dirname, '..')

function loadEnv() {
  const env = { ...process.env }
  try {
    const raw = readFileSync(join(REPO, '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !(m[1] in env)) env[m[1]] = m[2]
    }
  } catch { /* optional */ }
  return env
}

const ENV = loadEnv()
const API_KEY = ENV.POSTHOG_PERSONAL_API_KEY
const HOST = (ENV.POSTHOG_API_HOST || 'https://eu.posthog.com').replace(/\/+$/, '')
const APPLY = process.argv.slice(2).includes('--apply')

if (!API_KEY) { console.error('✗ POSTHOG_PERSONAL_API_KEY missing (.env.local).'); process.exit(1) }

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${HOST}${path}`, {
    method,
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json; try { json = text ? JSON.parse(text) : null } catch { json = { raw: text } }
  if (!res.ok) throw new Error(`${method} ${path} → HTTP ${res.status}: ${JSON.stringify(json).slice(0, 400)}`)
  return json
}

async function resolveContext() {
  const me = await api('/api/users/@me/')
  const projectId = ENV.POSTHOG_PROJECT_ID ? Number(ENV.POSTHOG_PROJECT_ID)
    : (me?.team?.id || me?.organization?.teams?.[0]?.id)
  const email = ENV.POSTHOG_DIGEST_EMAIL || me?.email
  const userId = me?.id
  if (!projectId) throw new Error('Could not resolve project id.')
  if (!email) throw new Error('Could not resolve a digest email (set POSTHOG_DIGEST_EMAIL).')
  return { projectId, email, userId }
}

// Map provisioning-tagged insights → their id, so we can attach subs/alerts.
async function insightIdsByTag(projectId) {
  const r = await api(`/api/projects/${projectId}/insights/?limit=200`)
  const map = {}
  for (const i of r.results || []) {
    // PostHog lowercases tags, so key the map lowercase and look up lowercase.
    const tag = (i.tags || []).find(t => t.startsWith('provisioned:'))
    if (tag) map[tag.split(':')[1].toLowerCase()] = i.id
  }
  return map
}

// ── The chunk-4 spec (mirror of runbook §Alerts) ─────────────────────────────
// Weekly email digests — Monday 09:00 CET. Each targets one insight tile.
const DIGESTS = [
  { slug: 'A1', title: 'Weekly digest · Onboarding funnel' },
  { slug: 'B1', title: 'Weekly digest · Practice completion' },
  { slug: 'C1', title: 'Weekly digest · Daily-session conversion' },
  { slug: 'X3', title: 'Weekly digest · Retention' },
]

// Threshold alerts — email-routed (Slack needs a UI integration).
// Only Trends insights yielding a single number are cleanly alertable.
const ALERTS = [
  {
    slug: 'A2',
    name: 'A2 · Login failure rate > 5%',
    // A2 carries a formula (B/(A+B)*100). When an insight has a formula the
    // result collapses to a single series at index 0, so we alert on that.
    seriesIndex: 0,
    upper: 5,
  },
  {
    // Error spikes are both a reliability and a SECURITY signal — fuzzing an
    // app tends to generate errors long before it finds anything. The runbook
    // specifies ">50/h"; PostHog's cheapest calculation_interval here is
    // daily, so this is a deliberately coarse daily proxy rather than a
    // pretend-precise hourly rule. Tune once real traffic sets a baseline.
    slug: 'X5',
    name: 'X5 · Error spike (error_caught)',
    seriesIndex: 0,
    upper: 100,
  },
]

async function upsertDigest(d, ctx) {
  const insightId = ctx.insightIds[d.slug.toLowerCase()]
  if (!insightId) { console.warn(`   ! no insight for ${d.slug}, skipping digest`); return }
  const existing = (await api(`/api/projects/${ctx.projectId}/subscriptions/?limit=200`))
    .results.find(s => s.title === d.title)
  // Next Monday 09:00 Europe/Berlin (CET/CEST) as an anchor start.
  const payload = {
    insight: insightId,
    target_type: 'email',
    target_value: ctx.email,
    frequency: 'weekly',
    interval: 1,
    byweekday: ['monday'],
    start_date: '2026-07-13T07:00:00Z', // 09:00 CEST
    title: d.title,
  }
  if (!APPLY) { console.log(`   ${existing ? '↻' : '＋'} digest  ${d.slug} → ${ctx.email}  "${d.title}"`); return }
  const saved = existing
    ? await api(`/api/projects/${ctx.projectId}/subscriptions/${existing.id}/`, { method: 'PATCH', body: payload })
    : await api(`/api/projects/${ctx.projectId}/subscriptions/`, { method: 'POST', body: payload })
  console.log(`   ${existing ? '↻ updated' : '＋ created'} digest ${d.slug} (id=${saved.id}) → ${ctx.email}`)
}

async function upsertAlert(a, ctx) {
  const insightId = ctx.insightIds[a.slug.toLowerCase()]
  if (!insightId) { console.warn(`   ! no insight for ${a.slug}, skipping alert`); return }
  const existing = (await api(`/api/projects/${ctx.projectId}/alerts/?limit=200`))
    .results.find(x => x.name === a.name)
  const payload = {
    name: a.name,
    insight: insightId,
    subscribed_users: ctx.userId ? [ctx.userId] : [],
    config: { type: 'TrendsAlertConfig', series_index: a.seriesIndex },
    condition: { type: 'absolute_value' },
    threshold: { configuration: { type: 'absolute', bounds: { upper: a.upper } } },
    calculation_interval: 'daily',
    enabled: a.upper != null, // don't enable a bound-less alert
  }
  if (!APPLY) {
    console.log(`   ${existing ? '↻' : '＋'} alert   ${a.slug}  "${a.name}"  upper=${a.upper ?? '(unset)'}`)
    return
  }
  if (a.upper == null) { console.log(`   ⤫ skipped alert ${a.slug} — no threshold set (see report)`); return }
  const saved = existing
    ? await api(`/api/projects/${ctx.projectId}/alerts/${existing.id}/`, { method: 'PATCH', body: payload })
    : await api(`/api/projects/${ctx.projectId}/alerts/`, { method: 'POST', body: payload })
  console.log(`   ${existing ? '↻ updated' : '＋ created'} alert ${a.slug} (id=${saved.id})`)
}

async function main() {
  console.log(`PostHog alerts/subscriptions — ${APPLY ? 'APPLY (writing)' : 'DRY RUN'}  host=${HOST}`)
  const { projectId, email, userId } = await resolveContext()
  const insightIds = await insightIdsByTag(projectId)
  const ctx = { projectId, email, userId, insightIds }
  console.log(`Project ${projectId} · digest → ${email} · ${Object.keys(insightIds).length} tagged insights\n`)

  console.log('▸ Weekly email digests (Mon 09:00 CEST)')
  for (const d of DIGESTS) await upsertDigest(d, ctx)

  console.log('\n▸ Threshold alerts (email)')
  for (const a of ALERTS) await upsertAlert(a, ctx)

  console.log(`\n${APPLY ? '✓ Done.' : 'Dry run — re-run with --apply to write.'}`)
  console.log('Slack routing remains UI-only (needs a Slack integration).')
}

main().catch(e => { console.error('\n✗', e.message); process.exit(1) })
