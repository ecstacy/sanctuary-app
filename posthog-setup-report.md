<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog product analytics across The Sanctuary app. Events are wired through the existing consent-gated facade (`src/lib/track.js`), which dynamically loads the `posthog-js` SDK only when the user grants analytics consent. No SDK code is ever downloaded for users who decline. Identity is bound on login and signup via `identify()` so pre-login anon events are automatically aliased to the authenticated user.

## Changes summary

| File | Changes |
|------|---------|
| `src/pages/LoginPage.jsx` | `login_succeeded` (email/google/biometric), `login_failed`, `identify()` on success |
| `src/pages/SignupPage.jsx` | `signup_started` (mount), `signup_step_completed` (step 1→2), `signup_completed`, `identify()`, Google signup |
| `src/pages/DoshaQuizPage.jsx` | `dosha_quiz_started`, `dosha_quiz_question_answered` (per answer), `dosha_quiz_completed` (with percentages), `cta_clicked` (dosha_save) |
| `src/pages/VikritiQuizPage.jsx` | `vikriti_started`, `vikriti_completed` (with percentages + prakriti match), `cta_clicked` (vikriti_save) |
| `src/pages/PracticePage.jsx` | `practice_started`, `pre_checkin_submitted`, `pose_skipped`, `pose_repeated`, `practice_completed`, `practice_abandoned`, `post_checkin_submitted`, `voice_toggled`, `why_this_pose_opened` |
| `src/pages/HomePage.jsx` | `screen_viewed` (route_name=home), `cta_clicked` (home_get_practice, home_breathwork) |
| `src/pages/DiscoverPage.jsx` | `search_submitted`, `asana_card_tapped` (search results + explore grid), `routine_card_tapped` |
| `.env.local` | `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` confirmed set |

## Event table

| Event | Description | File |
|-------|-------------|------|
| `login_succeeded` | Successful login, with `method` (email/google/biometric) | LoginPage.jsx |
| `login_failed` | Failed login attempt, with `method` and `reason` | LoginPage.jsx |
| `signup_started` | User lands on signup page | SignupPage.jsx |
| `signup_step_completed` | User advances past language-select step | SignupPage.jsx |
| `signup_completed` | Account created, with `method`, `language`, `has_struggles` | SignupPage.jsx |
| `dosha_quiz_started` | User taps "Discover My Dosha" | DoshaQuizPage.jsx |
| `dosha_quiz_question_answered` | Per-question answer, with `question_index`, `category`, `dosha_selected` | DoshaQuizPage.jsx |
| `dosha_quiz_completed` | Quiz reaches result, with `primary_dosha`, `dosha_label`, vata/pitta/kapha percentages | DoshaQuizPage.jsx |
| `cta_clicked` (dosha_save) | User taps "Save My Dosha Profile" | DoshaQuizPage.jsx |
| `vikriti_started` | User taps "Begin Check-in" on vikriti intro | VikritiQuizPage.jsx |
| `vikriti_completed` | Vikriti reaches result, with percentages and `matches_prakriti` | VikritiQuizPage.jsx |
| `cta_clicked` (vikriti_save) | User taps "Save Check-in" on vikriti result | VikritiQuizPage.jsx |
| `practice_started` | User taps "Start Practice", with `routine_key`, `pose_count`, `total_duration_seconds`, `source` | PracticePage.jsx |
| `pre_checkin_submitted` | User rated at least one pre-practice scale | PracticePage.jsx |
| `pose_skipped` | User taps Skip, with `asana_id`, `pose_index`, `time_remaining` | PracticePage.jsx |
| `pose_repeated` | User taps Replay, with `asana_id`, `pose_index` | PracticePage.jsx |
| `practice_completed` | All poses done, with `completed_count`, `skipped_count`, `total_duration_seconds` | PracticePage.jsx |
| `practice_abandoned` | User exits mid-practice, with `last_asana_index`, `time_elapsed` | PracticePage.jsx |
| `post_checkin_submitted` | Post-practice feel tap (worse/same/better) | PracticePage.jsx |
| `voice_toggled` | Voice guidance toggled on/off | PracticePage.jsx |
| `why_this_pose_opened` | User opens pose info panel | PracticePage.jsx |
| `screen_viewed` | Home screen viewed (route_name=home, time_of_day) | HomePage.jsx |
| `cta_clicked` (home_get_practice) | "Get My Practice" tapped with `routine_key` and `checkin` | HomePage.jsx |
| `cta_clicked` (home_breathwork) | Mindful Respiration card tapped | HomePage.jsx |
| `search_submitted` | Search query submitted from Discover | DiscoverPage.jsx |
| `asana_card_tapped` | Asana card tapped in search results or explore grid | DiscoverPage.jsx |
| `routine_card_tapped` | Quick routine card tapped in Discover | DiscoverPage.jsx |

## Next steps

We've built 5 insights and a dashboard to monitor user behavior based on these events:

- **Dashboard:** https://eu.posthog.com/project/167680/dashboard/646629

### Insights

- **Signup → Practice Conversion Funnel** — 4-step activation funnel (signup → practice completed): https://eu.posthog.com/project/167680/insights/oqa9BVbX
- **Practice Sessions Over Time** — daily completed vs abandoned practices: https://eu.posthog.com/project/167680/insights/MWLwWXrK
- **Dosha Quiz Funnel** — quiz started → completed → saved: https://eu.posthog.com/project/167680/insights/ghdFtICQ
- **Login Method Breakdown** — email vs Google vs biometric by week: https://eu.posthog.com/project/167680/insights/W6ViGpEt
- **Post-Practice Feel Delta** — better / same / worse breakdown after sessions: https://eu.posthog.com/project/167680/insights/xQ1uYonk

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
