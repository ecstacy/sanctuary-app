# PostHog Dashboards — setup guide

> Status: **Setup runbook**. Build these once in PostHog and pin them.
> Project: Sanctuary, EU cloud (`https://eu.posthog.com`).
> Event taxonomy: see [`analytics-events.md`](./analytics-events.md).

This is the operator-side companion to the analytics taxonomy. The events
exist in code; this doc tells you what to assemble in PostHog so they
become decisions instead of rows in a database.

We recommend **five named insights**, grouped into **two dashboards**.

---

## Dashboard A — "Onboarding & Conversion"

The funnel from first-touch to first practice. The single most important
board for product growth. Pin it on the team channel.

### A1. Onboarding funnel

`Insights → New → Funnel`

Steps (in order):
1. `signup_started`
2. `signup_completed`
3. `dosha_quiz_started`
4. `dosha_quiz_completed`
5. `practice_started`

Settings:
- **Conversion window**: 24 hours
- **Breakdown**: by `method` (email vs google) on step 1 — surfaces whether
  Google sign-in dropoff is different from email
- **Date range**: last 30 days, comparing to previous 30

What to watch:
- The signup → dosha drop is the single biggest leak. If <60% complete the
  dosha quiz right after signup, the post-signup nudge isn't strong enough.
- Dosha → practice drop tells you if users get stuck on the result screen.

### A2. Login health

`Insights → New → Trends`

Series:
- Total `login_succeeded` (line)
- Total `login_failed` broken down by `reason` (stacked area)
- Formula `B/(A+B) * 100` where A=succeeded, B=failed → "auth failure rate"

Alert: failure rate >5% sustained for 2h. Usually means an OAuth provider
went sideways or an email-template bounce campaign is in progress.

---

## Dashboard B — "Practice Engagement"

Where the app's actual value gets used. Pin separately so growth-vs-
engagement signals don't crowd each other.

### B1. Practice completion funnel

`Insights → New → Funnel`

Steps:
1. `practice_started`
2. `pose_completed` (count ≥3)
3. `practice_completed`

Settings:
- **Breakdown**: by `routine_key` — answer "which routines do users abandon?"
- **Conversion window**: 1 hour (a session is short)
- Filter: `routine_key != 'asana-mindfulRespiration'` (single-pose practices
  finish too fast to be informative; exclude unless you specifically want them)

Reading it:
- A drop at step 2 means users bail in the *first* pose — pose 1 too hard,
  voice cue too aggressive, mat-not-out problem.
- A drop at step 3 means they completed several poses then quit — fatigue
  or routine-too-long. Compare against `total_duration_seconds` as a
  secondary breakdown.

### B2. Per-pose drop-off

`Insights → New → Trends`

Series A: `pose_started`, breakdown by `pose_id` and `routine_key`
Series B: `pose_completed`, same breakdowns
Formula: `B / A * 100` → completion rate per pose

Pin this as a **table** (not chart) sorted ascending by completion rate.
The poses at the top are your problem children. Common findings:
- A particular asana is consistently in the bottom 5 → revise its
  duration, voice cues, or position in the sequence
- The 4th pose in any routine is the cliff → you're scheduling a hard
  pose too early; reorder

### B3. Voice & engagement

`Insights → New → Trends`

Series:
- `voice_toggled` count, breakdown by `enabled`
- `practice_paused` count
- `why_this_pose_opened` count

Time-series, last 30 days. Watch the voice-on/off ratio per dosha cohort
(super-prop breakdown by `dosha_primary`). Vata-heavy users
typically prefer more cues; pitta-heavy prefer silence.

---

## Cross-cutting insights (no dedicated dashboard)

### C1. CTR by surface

`Insights → New → Trends → Formula`

For each surface that has both an impression and a tap event:

```
A = count(content_impression where surface = "home_suggested_asana")
B = count(asana_card_tapped where surface = "home_suggested" || source = "home_suggested_asana")
formula: B / A
```

Build one of these per surface:
- `home_suggested_asana` (asana tap)
- `discover_quick_routines` (routine tap)
- `discover_explore_asanas` (asana tap)

Compare CTRs side-by-side. The lowest one is your weakest surface — it
either isn't visible enough or doesn't speak to user intent.

### C2. CTA performance board

`Insights → New → Trends`

Total `cta_clicked` count, breakdown by `cta_id`. Sort descending.
Surfaces which CTAs are loved vs. ignored. Useful for A/B label tests
(swap copy on the lowest performer; compare next month).

### C3. Retention

`Insights → New → Retention`

- **First time event**: `signup_completed`
- **Returning event**: `practice_started`
- **Period**: weekly
- **Window**: 8 weeks

This is the long-term truth: do users actually come back to practice?
If week-1 retention <40% the product isn't sticky enough yet — work on
notifications, streak mechanics, or the morning ritual prompt before
chasing more growth.

Secondary retention chart with `Returning event = pose_completed` to
exclude users who started but never actually moved. Tighter signal.

### C4. Engagement quality cohorts

For any of the above, add **breakdown by `experience_level`** (1–7) as a
super-property. Lets you compare beginner vs. seasoned-yogi behavior.

Two findings to look for:
- Do level-1 users skip more than level-3? → tutorial gap
- Do level-7 users still tap the suggested asana? → personalization
  staleness; engine isn't adapting to advanced practitioners

---

## Setting up alerts

PostHog → Insights → … → Subscribe.

Recommended weekly digest (Mondays 09:00 CET):
- Onboarding funnel (A1)
- Practice completion funnel (B1)
- Retention (C3)

Recommended threshold alerts:
- **A2 login failure rate >5%** for 2h → Slack
- **B1 practice completion drops >10pp WoW** → Slack
- **`error_caught` events spike >50/h** → Slack

---

## Custom queries (HogQL)

When the prebuilt insights don't answer the question, drop into HogQL.
A few canned queries we keep returning to:

### Dosha cohort comparison

```sql
SELECT
  properties.dosha_primary AS dosha,
  count() AS sessions,
  countIf(event = 'practice_completed') AS completions,
  round(completions / sessions * 100, 1) AS completion_pct
FROM events
WHERE event IN ('practice_started', 'practice_completed')
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY dosha
ORDER BY sessions DESC
```

### Top abandoned poses

```sql
SELECT
  properties.pose_id AS pose,
  properties.routine_key AS routine,
  countIf(event = 'pose_started') AS started,
  countIf(event = 'pose_skipped') AS skipped,
  round(skipped / started * 100, 1) AS skip_pct
FROM events
WHERE event IN ('pose_started', 'pose_skipped')
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY pose, routine
HAVING started >= 50
ORDER BY skip_pct DESC
LIMIT 20
```

### Bounce rate by route

```sql
SELECT
  properties.route_name AS screen,
  count() AS visits,
  countIf(properties.bounced) AS bounces,
  round(bounces / visits * 100, 1) AS bounce_pct,
  round(avg(toFloat(properties.seconds_on_screen)), 1) AS avg_seconds
FROM events
WHERE event = 'screen_left'
  AND timestamp >= now() - INTERVAL 7 DAY
GROUP BY screen
ORDER BY visits DESC
```

---

## Maintaining the dashboards

- **Add new insights to the doc, not just to PostHog.** Otherwise the
  next person doesn't know what's been tried.
- **Archive insights nobody opens** after 60 days idle. Dashboard rot is
  worse than missing data.
- **Re-baseline** every release. A funnel that drops 5% might be a code
  regression OR a redesign that's working as intended.
