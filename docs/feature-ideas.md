# Feature ideas — a grounded, prioritized backlog

_Written 2026-08-25 from the app's actual state. Each idea: what, why it fits, rough effort, and the honest catch. Ordered within each theme by value-to-effort. Not a commitment — a menu._

The app's real moat is the **per-dosha, per-state personalization** built on a **reviewed classical dataset** (no generic-wellness-app has this). Most high-value features deepen that loop or reduce friction in it.

## A. Retention & habit (the biggest lever for a wellness app)

1. **Streaks that survive real life** ⭐ *(low–med)*
   The routine already shows "+1 streak day," but there's no streak *state*, freeze/repair, or a home surface. A real streak with a weekly view and a "streak saver" (already a notification concept) is the single strongest retention mechanic. **Catch:** needs a `practice_days` store + a daily reconciler (the daily-session composer already has one to extend).

2. **"Today's check-in" → a felt-state loop** *(med)*
   Vikriti is inferred from self-reports over 14 days. A lightweight daily "how do you feel?" (1 tap: wired / heated / heavy / balanced) would (a) sharpen the vikriti signal faster, (b) make the personalization visibly responsive ("you said wired → here's a grounding practice"), (c) create a daily return reason. **Catch:** don't make it a chore — one tap, dismissible.

3. **Weekly reflection / progress digest** *(med)*
   A Sunday "your week" card: practices done, meals checked, dosha drift, one insight. Pairs with a weekly push. Turns scattered use into a felt arc. **Catch:** needs enough logged data to be non-empty — gate it.

## B. Personalization depth (widen the moat)

4. **Meal favourites + "cook again"** *(low)*
   Meal Check logs history; there's no way to favourite a dish or re-log it in one tap. A ⭐ on the meal detail page + a "your usuals" row (the typeahead already computes favourites) closes the loop. High value, low effort.

5. **Season-aware everything** *(low–med)*
   The meal composer already takes `season`; the practice/routine side is time-of-day aware (just shipped) but not season-aware. Ritu-charya (seasonal routine) is core Ayurveda and a natural personalization axis — "it's late summer, favour cooling." **Catch:** needs a season→dosha map (mostly classical, quick to encode).

6. **A real "why" explainer surface** *(low)*
   Every recommendation derives its verdict; the meal detail page shows it. Poses show dosha tags but not *why this pose for your state*. A short "chosen because your Vata is up" line on the routine/practice would make the personalization legible and trustworthy.

## C. Content depth (leverage the dataset)

7. **Ingredient → recipe → meal graph** *(med)*
   The meal detail page already drills meal→ingredient. The reverse — "what can I make with what settles my Pitta?" — is a natural discovery surface and pure dataset leverage. **Catch:** needs a reverse index (cheap to build from recipes-data).

8. **Meal-image pipeline finish** *(content)*
   52 dishes still on the generated tile (Batch A–C done). Not engineering — generation. The pipeline auto-picks them up.

9. **Guided practices beyond Nidra** *(med, content)*
   Yoga Nidra now has a real guided page. The same stepped-timer engine could host other non-asana practices (a body scan, a 5-min reset, walking meditation). Reuses `YogaNidraPage`'s structure.

## D. Growth & virality (feeds the funnel)

10. **Shareable dosha result card** ⭐ *(low–med)*
    The quiz result is the most shareable moment ("I'm Vata-Pitta"). A polished, branded share image (the website already has OG infra) drives the exact word-of-mouth loop the share feature started. **Catch:** generating an image client-side (canvas) or a pre-rendered template.

11. **"Is X good for my dosha?" as an app deep-link** *(low)*
    The 520 SEO food pages are a top-of-funnel magnet. Each should deep-link into the app's Meal Check for that food ("open in app") — turning SEO traffic into installs. **Catch:** Android App Links (already TODO #31) makes this seamless.

12. **Referral nudge tied to milestones** *(low)*
    The share nudge exists on Home. Firing it at a *earned* moment (7-day streak, first week done) converts far better than a static card.

## E. Monetization (when Plus turns on)

13. **The free→Plus teaser is already good** — the paywall shows value with promo redemption. When selling turns on, the highest-leverage add is a **7-day Plus trial** gated behind the streak (habit first, pay second).
14. **Family / partner plan** — Ayurveda is household (cooking for the family). A shared plan is a natural higher tier later.

## F. Trust & safety (protect the moat)

15. **"We can't confirm" surfacing for halal/kosher** — the exclusion engine is conservative (correctly). The UI wording must match ("we can't certify," never "this is halal"). Worth an audit pass on the strings.
16. **Ingredient provenance on the food page** — each reviewed food has a `source` (CS verse / derived). Surfacing "Charaka, Sutrasthana 27" on the ingredient detail builds real authority vs generic wellness apps.

---

## If I had to pick three to build next
- **#4 Meal favourites** (low effort, closes an obvious loop),
- **#1 Streaks** (highest retention lever),
- **#10 Shareable dosha card** (best growth-per-effort, feeds the word-of-mouth loop).

All three deepen the core loop rather than bolt on scope, and none require the parent-brand/launch decisions to be settled first.
