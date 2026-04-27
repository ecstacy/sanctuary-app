# Analytics Event Taxonomy

> Status: **Draft — awaiting review (Chunk 1)**
> Owner: product
> Last updated: 2026-04-27

## 1. Why this document exists

The single most expensive analytics mistake teams make is renaming events
six months in. This document is the contract: every event we ever fire
gets defined here first, named in `snake_case`, and given a stable property
schema. New events require a PR that updates this file.

## 2. Two analytics layers — don't confuse them

The Sanctuary already ships a Supabase-backed analytics module
(`src/lib/analytics.js`) used to **fuel the personalization engine**. That
layer is staying — it writes domain rows to `recommendations_log`,
`content_events`, `searches`, `user_state_checkins`. Its consumer is *the
app itself* (the recommender reads its own history).

The new layer we are designing here has a different consumer: **us, the
builders**. Funnels, retention, drop-off analysis, A/B tests. Different
audience, different store. Adding it does not remove anything.

| Layer | File | Store | Consumer | Identifier |
|---|---|---|---|---|
| Personalization log (existing) | `src/lib/analytics.js` | Supabase tables | The recommender engine | `user_id` |
| Product analytics (new) | `src/lib/track.js` *(Chunk 2)* | PostHog / Firebase | Product team dashboards | `distinct_id` (= `user_id` post-login, anon UUID before) |

The two layers are wired in parallel. Most user actions fire **both** —
once into Supabase (with rich domain context), once into the product-
analytics SDK (with funnel-friendly properties). Cost is negligible; the
upside is keeping each store fit for its purpose.

## 3. Naming rules

- `snake_case`, lowercase, English.
- **Object_verb** form: `practice_started`, not `started_practice`. Reads
  cleanly when sorted alphabetically in the dashboard.
- Past tense for things that happened (`pose_skipped`), present for
  passive states (`screen_viewed`).
- Properties are flat scalars where possible. Nested objects only when
  semantically grouped (e.g. `dosha_scores: { vata: 12, pitta: 8, kapha: 5 }`).
- Never put PII or free-text input in event names. Free-text values
  (search queries, notes) go in properties and are length-capped at 200
  chars by the façade.

## 4. Super-properties (sent on every event)

Set once on `identify()` and on app start. Never duplicated per-event.

| Property | Type | Source | Notes |
|---|---|---|---|
| `platform` | `'web' \| 'android' \| 'ios'` | Capacitor.getPlatform() | |
| `app_version` | string | `import.meta.env.VITE_APP_VERSION` | |
| `dosha_primary` | `'vata' \| 'pitta' \| 'kapha' \| null` | `profile.dosha_details.primary` | |
| `dosha_secondary` | same | profile | |
| `vikriti_primary` | same | latest vikriti row | |
| `experience_minutes` | number | `usePracticeStats` | rounded to nearest 5 |
| `streak_days` | number | usePracticeStats | |
| `experience_level` | `1..7` | derived from minutes via `YOGI_LEVELS` | |
| `time_of_day` | `'morning' \| 'afternoon' \| 'evening'` | `baseContext()` | |
| `consent_aggregate` | bool | `isAggregateAllowed()` | always present so dashboards can confirm gating |

## 5. Event catalog

Each event lists: trigger location, properties, and notes. A property
marked `*` is required; others are best-effort.

### 5.1 Lifecycle

#### `app_opened`
- **Where**: `App.jsx` mount, after consent check.
- **Props**: `cold_start: bool`, `referrer?: string`.
- **Notes**: Only fires once per launch; tab refocus is `app_resumed`.

#### `app_resumed`
- **Where**: `visibilitychange` listener in `App.jsx`.
- **Props**: `away_seconds: number`.

#### `screen_viewed` *(autocapture)*
- **Where**: single `useEffect` on `useLocation()` in `App.jsx`.
- **Props**: `path*`, `route_name*` (e.g. `home`, `practice`, `asana_detail`),
  `params?` (route params, no query string).
- **Notes**: Replaces the need for individual per-page view events.

#### `screen_left` *(autocapture, paired with screen_viewed)*
- **Where**: cleanup of the same `useLocation` effect.
- **Props**: `route_name*`, `seconds_on_screen*`, `max_scroll_depth_pct*` (0–100,
  rounded to nearest 10), `interaction_count*` (taps + scrolls + form fills),
  `bounced*: bool` (left in <3s without interaction).
- **Notes**: Source of dwell-time, scroll, and CTR-denominator metrics.

### 5.2 Auth & onboarding

#### `signup_started`
- **Where**: SignupPage step 1 mount.
- **Props**: `method: 'email' \| 'google' \| 'apple'`.

#### `signup_step_completed`
- **Where**: each SignupPage step submit.
- **Props**: `step*: 'email' \| 'profile' \| 'preview'`, `step_number*: number`.

#### `signup_completed`
- **Where**: AuthContext on first session for a new user.
- **Props**: `method*`.

#### `login_succeeded`
- **Where**: AuthContext after sign-in event.
- **Props**: `method*`.

#### `login_failed`
- **Where**: LoginPage submit catch.
- **Props**: `reason: 'bad_credentials' \| 'network' \| 'other'`.

#### `password_reset_requested`
- **Where**: ForgotPasswordPage submit.

### 5.3 Dosha quiz (prakriti — first-time)

#### `dosha_quiz_started`
- **Where**: DoshaQuizPage mount.
- **Props**: `assessment_type*: 'prakriti'`.

#### `dosha_quiz_question_answered`
- **Where**: each answer tap.
- **Props**: `question_id*`, `question_index*`, `answer*: 'vata' \| 'pitta' \| 'kapha'`.

#### `dosha_quiz_completed`
- **Where**: DoshaQuizPage on submit-result.
- **Props**: `primary*`, `secondary*`, `dosha_scores*: { vata, pitta, kapha }`,
  `time_to_complete_seconds*`.

#### `dosha_quiz_abandoned`
- **Where**: unmount before completion.
- **Props**: `last_question_index`, `seconds_in`.

### 5.4 Vikriti check-in (recurring)

#### `vikriti_prompt_shown`
- **Where**: HomePage when `useVikritiSchedule` returns `isDue`.
- **Props**: `days_since_last`, `vikriti_count`.

#### `vikriti_started` / `vikriti_completed` / `vikriti_abandoned`
- Same shape as `dosha_quiz_*` but `assessment_type: 'vikriti'`.

### 5.5 Practice flow (the goldmine)

#### `practice_started`
- **Where**: PracticePage when `START` action dispatched.
- **Props**: `routine_key*` (e.g. `stress`, `sleep`, `single`), `pose_count*`,
  `total_duration_seconds*`, `source*: 'home_quick_routine' \| 'routine_page' \| 'discover_asana' \| 'recommendation' \| 'home_suggested'`.

#### `pre_checkin_submitted`
- **Where**: PracticePage `START` dispatch when scales touched.
- **Props**: `energy: 1..5 \| null`, `body: 1..5 \| null`, `routine_key*`.

#### `pose_started`
- **Where**: each `currentIndex` change while `status === 'active'`.
- **Props**: `pose_id*`, `pose_index*`, `pose_count*`, `routine_key*`,
  `duration_seconds*`.

#### `pose_skipped`
- **Where**: Skip button.
- **Props**: same as `pose_started` + `time_spent_seconds`.

#### `pose_repeated`
- **Where**: Repeat button.
- **Props**: same as `pose_started` + `repeat_count` *(running count for the session)*.

#### `pose_completed`
- **Where**: timer hits 0.
- **Props**: same as `pose_started`.

#### `voice_toggled`
- **Where**: Voice button in either header.
- **Props**: `enabled*: bool`, `during*: 'pre' \| 'active' \| 'rest'`.

#### `practice_paused` / `practice_resumed`
- **Props**: `pose_index*`, `time_remaining_seconds*`.

#### `why_this_pose_opened`
- **Where**: WHY THIS POSE info button.
- **Props**: `pose_id*`, `pose_index*`.

#### `practice_completed`
- **Where**: Practice complete screen mount.
- **Props**: `routine_key*`, `pose_count*`, `total_duration_seconds*`,
  `actual_duration_seconds*`, `skipped_count*`, `repeated_count*`.

#### `practice_abandoned`
- **Where**: Close button while `status === 'active'` or `'resting'`.
- **Props**: `routine_key*`, `last_pose_index*`, `time_in_seconds*`,
  `progress_percent*`.

#### `post_checkin_submitted`
- **Where**: Complete screen if post-practice scales added later.
- **Props**: `energy`, `body`, `routine_key*`.

### 5.6 Discovery & search

#### `routine_card_tapped`
- **Where**: HomePage Quick Routines + RoutinePage switcher.
- **Props**: `routine_key*`, `surface*: 'home_quick' \| 'routine_switch'`.

#### `routine_switched`
- **Where**: RoutinePage from the chip.
- **Props**: `from_routine`, `to_routine*`.

#### `asana_card_tapped`
- **Where**: any chip/card that opens `/asana/:id`.
- **Props**: `asana_id*`, `surface*: 'discover_explore' \| 'discover_search_result' \| 'recommendations' \| 'home_suggested'`.

#### `search_submitted`
- **Where**: HomePage + DiscoverPage + RecommendationsPage.
- **Props**: `query*` (length-capped 200), `source*` (matches existing
  `SEARCH_SOURCES` from analytics.js), `result_count*`.

#### `search_result_clicked`
- **Where**: any tap on a recommendation card on RecommendationsPage.
- **Props**: `query`, `position*`, `result_id*`, `result_type*`.

### 5.7 Profile & account

#### `profile_updated`
- **Props**: `field*: 'display_name' \| 'avatar' \| 'preferences'`.

#### `consent_changed`
- **Where**: ProfilePage privacy toggles.
- **Props**: `kind*: 'aggregate' \| 'personalization' \| 'marketing'`,
  `granted*: bool`.

#### `data_exported`
- **Where**: ProfilePage Export Data button.

#### `password_changed`

#### `account_deleted`
- **Where**: ProfilePage Delete Account final confirm.
- **Notes**: Last event before `reset()` is called and tracking stops.

### 5.8 Engagement & attention

These events power scroll-depth, CTR, and engagement personalization.
Most are **autocaptured** by small generic hooks (`useScrollDepth`,
`useImpression`, `useEngagementTimer`) so we don't sprinkle calls across
every component.

#### `scroll_depth_reached` *(autocapture, throttled)*
- **Where**: `useScrollDepth` hook on every scrollable page (Home,
  Discover, Recommendations, AsanaDetail, Profile).
- **Props**: `route_name*`, `depth_pct*: 25 | 50 | 75 | 100` (one event per
  threshold per visit), `seconds_to_reach*`.
- **Notes**: Fires at most 4 times per screen. The maximum value also
  rolls up into `screen_left.max_scroll_depth_pct` for convenience.

#### `content_impression` *(autocapture via IntersectionObserver)*
- **Where**: `useImpression` ref attached to every recommendation card,
  asana chip, routine card, suggested-asana card, vikriti prompt, etc.
- **Props**: `surface*` (matches existing `SURFACES` vocab),
  `content_type*`, `content_id*`, `position*` (index in list),
  `visible_pct*` (50/75/100 — the threshold that fired),
  `dwell_ms*` (how long it stayed in view before scroll-out).
- **Notes**: This is the **denominator for CTR**. A "click-through rate
  for the home suggested asana" = `count(asana_card_tapped where
  surface=home_suggested) / count(content_impression where
  surface=home_suggested)`. Fires once per card per screen visit.

#### `cta_clicked`
- **Where**: every primary/secondary CTA button (Start Practice, Begin
  Practice, See All, Switch Routine, Take Vikriti, etc.).
- **Props**: `cta_id*` (stable string like `routine_start`,
  `home_vikriti_take`, `discover_see_all`), `route_name*`, `label*` (the
  visible text — useful for A/B label tests).
- **Notes**: Calling this out separately from `*_tapped` events lets us
  build a "CTA performance" board that's vendor-agnostic of the action
  the CTA leads to.

#### `element_engaged`
- **Where**: low-frequency, manually-instrumented for elements we
  *specifically* want to learn about (e.g. PoseFigure expand, dosha card
  expand, ayurvedic-wisdom card, journey timeline node).
- **Props**: `element_id*`, `route_name*`, `kind*: 'expand' \| 'tap' \|
  'long_press' \| 'swipe'`.

#### `engagement_heartbeat` *(throttled, every 15s active)*
- **Where**: `useEngagementTimer` in `App.jsx`. Pauses on `visibilitychange`,
  blur, idle (>30s no input).
- **Props**: `route_name*`, `active_seconds*` (always 15), `session_id*`.
- **Notes**: Lets us compute true *active* time per session/per screen,
  not just wall-clock. PostHog's session duration is generous; this is
  more accurate. Cap at 4 hours/session to bound cost.

#### `session_started` / `session_ended`
- **Where**: derived in the façade — a session starts on `app_opened` or
  after >30 min idle, ends on `app_resumed` after long away or
  `visibilitychange` hidden for >5 min.
- **Props (started)**: `session_id*`, `cold_start*: bool`.
- **Props (ended)**: `session_id*`, `duration_seconds*`,
  `active_seconds*`, `screens_visited*`, `events_fired*`.

### 5.9 Errors

#### `error_caught`
- **Where**: top-level error boundary + Supabase error logger.
- **Props**: `where*` (component or function name), `kind*: 'render' \| 'fetch' \| 'auth' \| 'storage'`,
  `message` (truncated 200 chars, no stack).

## 6. What we already track in Supabase (preserved as-is)

These continue firing into the personalization layer. Where a parallel
product-analytics event makes sense, it's listed in §5 above.

| Existing call | Continues firing | Adds product event |
|---|---|---|
| `logRecommendation` | yes | no — product layer doesn't need impressions yet |
| `logContentEvent(CLICKED, ASANA, ...)` | yes | yes → `asana_card_tapped` |
| `logSearch` | yes | yes → `search_submitted` |
| `logCheckin(PRE_PRACTICE)` | yes | yes → `pre_checkin_submitted` |
| `logCheckin(POST_PRACTICE)` | yes | yes → `post_checkin_submitted` |
| `logAggregateEvent` | yes | replaced — façade subsumes this |

## 7. Privacy & consent

- All product-analytics events are gated behind `isAggregateAllowed()` —
  the same flag that gates `logAggregateEvent` today. No consent → SDK
  never initializes, façade is a silent no-op.
- `identify(user.id, ...)` only sends after the user is authenticated
  *and* consented. Pre-auth, the SDK uses an anonymous distinct id.
- On `account_deleted` or consent revoke: call vendor's GDPR delete API
  + `reset()` locally.
- PII scrubbing remains at the façade level — same allowlist approach
  that `stripLikelyPII` uses today, generalized.

## 8. Decisions & open questions

### Resolved
1. **Vendor**: **PostHog (EU cloud)**. Picked for funnel/path analysis,
   GDPR-friendly hosting, single SDK across web + Capacitor webview,
   built-in autocapture for scroll/CTR/heatmaps.
2. **`pose_started` granularity**: fire every pose. PostHog handles the
   volume; per-pose drop-off is the single most useful signal we have
   for tuning routines.
3. **`screen_viewed`**: autocapture on every route change, no whitelist.
4. **Track everything trackable**: confirmed — engagement, scroll, CTR,
   impressions, dwell time all included (§5.1, §5.8).

### Still open
1. **`error_caught` — Sentry's job long-term?** Sentry has better
   tooling for errors specifically. For now we ship to PostHog as one
   stream; if/when Sentry lands, pull §5.9 out and route there.
2. **Engagement heartbeat cost**: at 15s cadence × ~5 min median session
   that's ~20 events/session/user. Within PostHog free tier (1M events/mo)
   for ~10k MAU. If cost ever bites, drop heartbeat to 30s or sample.
3. **Impression observer threshold**: starting at 50% visible / 1s dwell.
   Re-tune after first dashboard pass.

## 9. Change log

| Date | Author | Change |
|---|---|---|
| 2026-04-27 | initial draft | Chunk 1 — full taxonomy proposed |
| 2026-04-27 | review pass | Added §5.8 Engagement & attention (scroll, CTR, impressions, heartbeat, sessions) and `screen_left`. Vendor decision: PostHog EU cloud. |
