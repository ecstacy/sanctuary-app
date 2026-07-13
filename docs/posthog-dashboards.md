# PostHog Dashboards — setup guide

> Status: **Setup runbook**. Build these once in PostHog and pin them.
> Project: Sanctuary, EU cloud (`https://eu.posthog.com`).
> Event taxonomy: see [`analytics-events.md`](./analytics-events.md).

This is the operator-side companion to the analytics taxonomy. The events
exist in code; this doc tells you what to assemble in PostHog so they
become decisions instead of rows in a database.

**Four dashboards**, plus a set of cross-cutting insights that don't earn
their own board. Provisioning is scripted — see
[`scripts/provision-posthog-dashboards.mjs`](../scripts/provision-posthog-dashboards.mjs).
The sections below are the human-readable spec that script mirrors; when you
change one, change the other.

- **A — Onboarding & Conversion**
- **B — Practice Engagement**
- **C — Daily Session & Habit** *(the DAU feature — its own board)*
- **D — Plus & Monetization**

## The `app_language` breakdown — read this first

Every board below can be split by `app_language` (`en` / `de` / `hi`), a
super-property set on every event (see `src/i18n/index.js`). For the de/hi
rollout this is *the* question: do non-English users onboard, complete
practices, and retain at the same rate as English users? Add it as a
secondary breakdown on the funnels and retention charts named below and
compare cohorts side-by-side. A German-only drop at a specific step almost
always means a translation is confusing or a layout broke under longer
strings; a Hindi-only drop is worth pairing with the pending human-review
gate on the Hindi copy.

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
- **Secondary breakdown**: by `app_language` — the de/hi onboarding health check
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
typically prefer more cues; pitta-heavy prefer silence. A second cut by
`app_language` tells you whether the *localized* voice audio lands — if
Hindi users toggle voice off far more than English, the TTS pronunciation
of Sanskrit names is probably the culprit (a known review gate).

---

## Dashboard C — "Daily Session & Habit"

The DAU feature. "Today's Practice" is the composed, profile-tailored
session on Home and the thing notifications drive people back to. This
board answers two questions: does the composed session convert, and does
the habit loop (composed → practiced → reminded → returned) actually close?

### C1. Daily-session conversion funnel

`Insights → New → Funnel`

Steps:
1. `daily_session_composed`
2. `content_impression` where `surface = 'home_daily_session'`
3. `daily_session_cta_tapped`
4. `daily_session_started`
5. `daily_session_completed`

Settings:
- **Breakdown**: by `slot` (`morning` / `evening`) — the two sessions have
  different intent; morning energize vs. evening wind-down convert differently
- **Conversion window**: 6 hours (a slot is a half-day)
- **Secondary breakdown**: `app_language`

Reading it:
- composed → impression near 100% (it renders on Home). A gap means the
  card is below the fold or a render bug.
- impression → tap is the *hook* strength. Low tap-through on evening but
  not morning → the evening card copy isn't compelling after a long day.
- started → completed is session-length tolerance; pair with
  `total_duration_seconds` (we target ~13 min).

### C2. Personalization pull-through

`Insights → New → Trends`

Series: `daily_session_completed`, breakdown by `dosha_source`
(`prakriti` / `vikriti` / `none`) and separately by `reason_codes`.

The question: does a session composed from a *known* dosha complete more
often than the `none` fallback? If not, the weighting engine isn't earning
its complexity — either the composer isn't differentiating enough or the
`reason_codes` we surface ("chosen for your Pitta balance") don't build trust.
Pin as a table sorted by completion rate.

### C3. Notification → return loop

`Insights → New → Funnel`

Steps:
1. `notification_tapped` (filter `kind = 'practice_reminder'`)
2. `daily_session_started`
3. `daily_session_completed`

**Conversion window**: 2 hours. This is the whole reason notifications
exist — a tap that doesn't lead to a completed session is a buzz we
shouldn't have sent. Build the same funnel filtered to `kind = 'streak_save'`
and `kind = 'wind_down'` to compare which reminder types actually convert;
retire or retune any type whose tap→complete rate is near zero.

Companion trend: `notification_tapped` broken down by `kind`, over 30 days —
the raw "are people tapping" signal.

### C4. Reminder adoption & streaks

`Insights → New → Trends`

Series:
- `notification_permission_result` breakdown by `granted` — OS-level opt-in rate
- `notification_reminder_enabled` vs `notification_reminder_disabled` — net reminder adoption
- `notification_prompt_shown` → `notification_prompt_accepted` as a mini-funnel —
  is the post-2nd-session nudge working, or just annoying? (accept rate <15%
  means soften or delay it)

Secondary: `streak_days` distribution (super-prop) as a histogram — the
shape of your habit tail. A spike at exactly `3` is streak-save doing its
job at the `STREAK_MIN` threshold.

---

## Dashboard D — "Plus & Monetization"

The upgrade funnel. Stripe may still be test-mode at launch — build the
board now so test-mode traffic validates the wiring and real revenue has
somewhere to land day one.

### D1. Paywall → checkout funnel

`Insights → New → Funnel`

Steps:
1. `paywall_shown`
2. `paywall_plan_selected`
3. `paywall_checkout_started`
4. `paywall_checkout_completed`

Settings:
- **Breakdown**: by `surface` — *which* locked feature drives upgrades
  (e.g. vikriti history vs. an inline lock). Your highest-converting surface
  is where the value story lands; the lowest is either mis-placed or the
  feature behind it isn't worth paying for.
- **Conversion window**: 1 hour
- **Secondary breakdown**: `app_language` — willingness-to-pay differs by market

Reading it:
- shown → plan_selected is *intent*. A big drop means the paywall doesn't
  make the case; iterate copy/pricing presentation.
- checkout_started → completed is *friction*. A drop here is a Stripe/UX
  problem, not a value problem — check the
  [Plus runbook](./sanctuary-plus-runbook.md) for webhook/checkout failures.

### D2. Promo redemption path

`Insights → New → Funnel`

Steps:
1. `promo_code_opened`
2. `promo_code_submitted`
3. `promo_code_redeemed`

Plus a companion `promo_code_failed` trend broken down by failure reason —
a spike in failures on a specific code means it expired or was fat-fingered
in a campaign asset.

### D3. Plus activation

`Insights → New → Trends`

Series:
- `paywall_checkout_completed` + `promo_code_redeemed` = total grants
- `welcome_to_plus_shown` → `welcome_to_plus_cta_tapped` mini-funnel — do
  new Plus members actually engage the feature they unlocked, or churn silently?

Watch `vikriti_plus_action_tapped` alongside the free vikriti action to see
which surface converts free→plus intent (see §5.10 of the taxonomy for the
free-vs-plus action split).

---

## Cross-cutting insights (no dedicated dashboard)

### X1. CTR by surface

`Insights → New → Trends → Formula`

For each surface that has both an impression and a tap event:

```
A = count(content_impression where surface = "<surface>")
B = count(<the tap event for that surface>)
formula: B / A
```

Build one per surface with a live impression:
- `home_daily_session` → tap is `daily_session_cta_tapped`
- `discover_quick_routines` → tap is `routine_card_tapped`
- `discover_explore_asanas` → tap is `asana_card_tapped`
- `discover_breathwork` → breathwork tap
- `dosha_profile`, `dinacharya`, `vikriti_history` → their respective taps

Compare CTRs side-by-side. The lowest one is your weakest surface — it
either isn't visible enough or doesn't speak to user intent.

> Note: the old `home_suggested_asana` surface was removed when the daily-
> session hero replaced the single-asana suggestion card. Use
> `home_daily_session` (above) — do not resurrect the old surface name.

### X2. CTA performance board

`Insights → New → Trends`

Total `cta_clicked` count, breakdown by `cta_id`. Sort descending.
Surfaces which CTAs are loved vs. ignored. Useful for A/B label tests
(swap copy on the lowest performer; compare next month).

### X3. Retention

`Insights → New → Retention`

- **First time event**: `signup_completed`
- **Returning event**: `practice_started`
- **Period**: weekly
- **Window**: 8 weeks
- **Breakdown**: `app_language` — retention is the truest cross-market signal

This is the long-term truth: do users actually come back to practice?
If week-1 retention <40% the product isn't sticky enough yet — work on
notifications, streak mechanics, or the morning ritual prompt before
chasing more growth.

Secondary retention chart with `Returning event = daily_session_completed`
to measure the habit feature specifically — this is the DAU metric that
justifies the composer + notifications investment.

### X4. Engagement quality cohorts

For any of the above, add **breakdown by `experience_level`** (1–7) as a
super-property. Lets you compare beginner vs. seasoned-yogi behavior.

Two findings to look for:
- Do level-1 users skip more than level-3? → tutorial gap
- Do level-7 users still tap the daily session? → personalization
  staleness; engine isn't adapting to advanced practitioners

---

## Setting up alerts

**Scripted** — `scripts/provision-posthog-alerts.mjs` (run *after* the
dashboards script; it resolves insights by their `provisioned:*` tag). Dry-run
by default; `--apply` to write. `npm run dashboards:alerts` /
`dashboards:alerts:apply`. It creates:

- **Weekly email digests** (Mondays 09:00 CEST) → the account email (override
  with `POSTHOG_DIGEST_EMAIL`): Onboarding funnel (A1), Practice completion
  (B1), Daily-session conversion (C1), Retention (X3).
- **Threshold alert**: A2 login-failure rate `> 5`, email-routed.

**Still UI-only** (a personal API key can't provision a Slack integration):
- **Slack routing** for any of the above — add the Slack destination by hand.
- Relative/percent-change alerts that PostHog only exposes in the UI, e.g.
  **B1 practice completion drops >10pp WoW**, **C3 reminder tap→complete near
  zero**, **`error_caught` spike >50/h**. Add these once when you want Slack.

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

### Language cohort comparison (de/hi rollout)

```sql
SELECT
  properties.app_language AS lang,
  countIf(event = 'daily_session_started') AS started,
  countIf(event = 'daily_session_completed') AS completed,
  round(completed / started * 100, 1) AS complete_pct
FROM events
WHERE event IN ('daily_session_started', 'daily_session_completed')
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY lang
ORDER BY started DESC
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
  next person doesn't know what's been tried. The provisioning script is
  the source of truth — edit it and re-run rather than clicking in the UI.
- **Archive insights nobody opens** after 60 days idle. Dashboard rot is
  worse than missing data.
- **Re-baseline** every release. A funnel that drops 5% might be a code
  regression OR a redesign that's working as intended.
