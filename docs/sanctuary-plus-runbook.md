# Sanctuary Plus — Operations Runbook

End-to-end setup for the paywall, Stripe webhook, and expiry sweep.
Audience: anyone bringing Plus live (you) or on call when it breaks (future you).

---

## Architecture in one paragraph

The client paywall (`PaywallSheet`) redirects to a Stripe Payment Link with
the user's id stamped on `client_reference_id`. Stripe processes the payment,
then POSTs `checkout.session.completed` to the `stripe-webhook` Edge Function,
which verifies the signature, looks up the user, and flips `profiles.is_premium`.
A pg_cron job sweeps the table hourly to flip premium back off for anyone whose
`premium_expires_at` has passed (covers missed webhooks + finite-duration promo
grants). The `useIsPremium()` hook is what every paywalled surface reads.

```
User taps Upgrade  ──▶ Stripe Payment Link  ──▶ checkout completes
                              │
                              ▼
              Stripe webhook (POST /stripe-webhook)
                              │
                              ▼
              Verify signature ─▶ UPDATE profiles
                              │
                              ▼
                Hourly pg_cron sweeps lapsed users
```

---

## One-time setup

### 1. Apply migrations

```bash
supabase db push
```

Brings up `007_create_premium_entitlement.sql` (entitlement columns +
promo codes) and `008_stripe_subscription_lifecycle.sql` (Stripe columns
+ webhook audit + pg_cron schedule + `get_checkout_attribution()` RPC).

Verify on the database:

```sql
-- Entitlement columns exist
\d profiles

-- pg_cron job is scheduled (Pro plan and above only)
select jobname, schedule from cron.job where jobname = 'sanctuary_expire_premium';

-- Promo seed code
select code, kind, max_redemptions, used_count from promo_codes;
```

### 2. Create Stripe products

In the Stripe Dashboard (test mode first):

1. **Products → Add product**
   - Name: `Sanctuary Plus`
   - Two prices: `€8.99 / month` and `€59 / year` (recurring)
2. **Payment Links → New** for each price
   - On both: set redirect on success → `https://sanctuary.com/thanks` (or
     wherever you'd like the post-purchase landing)
   - Confirm "Collect customer reference ID" is enabled in the link's
     "After payment" section so `?client_reference_id=` flows through

Copy the two Payment Link URLs.

### 3. Set client env vars

In `.env` (or wherever Vite reads from):

```bash
VITE_STRIPE_CHECKOUT_MONTHLY=https://buy.stripe.com/test_xxxxxxxx
VITE_STRIPE_CHECKOUT_ANNUAL=https://buy.stripe.com/test_yyyyyyyy
```

Until these are set the paywall buttons show the "launching soon" stub
(by design — internal promo codes still work).

### 4. Configure the webhook

Set Edge Function secrets:

```bash
supabase secrets set \
  STRIPE_SECRET_KEY=sk_test_... \
  STRIPE_WEBHOOK_SECRET=whsec_...
```

(The `STRIPE_WEBHOOK_SECRET` value comes from the next step.)

Deploy the function:

```bash
supabase functions deploy stripe-webhook
```

Add the webhook endpoint in Stripe Dashboard → Developers → Webhooks:

- **URL**: `https://<PROJECT-REF>.functions.supabase.co/stripe-webhook`
- **Events**: subscribe to exactly these
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

Stripe shows the signing secret (`whsec_...`) once. Copy it into
`STRIPE_WEBHOOK_SECRET` and re-deploy if you set the secret after deploy:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase functions deploy stripe-webhook
```

### 5. End-to-end smoke test

1. Sign in as a test account in staging
2. Open Discover, tap a locked asana — paywall sheet opens
3. Tap the annual plan — redirects to Stripe Payment Link with
   `?client_reference_id=<your-uuid>&prefilled_email=<email>` in the URL
4. Complete checkout with test card `4242 4242 4242 4242`
5. Within ~2 seconds Stripe fires `checkout.session.completed`. Verify:

```sql
-- Webhook landed
select event_type, user_id, handler_note, processed_at
from subscription_events
order by processed_at desc
limit 5;

-- Profile flipped
select id, is_premium, premium_source, premium_expires_at, stripe_subscription_id
from profiles where id = '<your-uuid>';
```

6. Reload the app — locks are gone, Chapter 3 unlocked, settings show
   "Sanctuary Plus is active · Billed via Stripe · until …"

### 6. Promo code smoke test

1. New test account
2. Profile → Sanctuary Plus → Have a code? → enter `SANCTUARY-TEAM`
3. RPC returns ok → `promo_redemptions` row inserted → page reloads → Plus
4. Verify:

```sql
select user_id, code_snapshot, granted_until, redeemed_at
from promo_redemptions
order by redeemed_at desc
limit 3;
```

---

## Day-to-day operations

### Mint a new promo code

```sql
insert into promo_codes (code, kind, duration_days, max_redemptions, notes)
values
  ('LAUNCH50',  'full_grant', 365, 500, 'Launch campaign — 1 year free'),
  ('YOGI-PRIYA','full_grant',  90,  50, 'Priya influencer code — 3 months');
```

Watch usage:

```sql
select code, used_count, max_redemptions, valid_until, active
from promo_codes order by created_at desc;
```

### Revoke a code

```sql
update promo_codes set active = false where code = 'LAUNCH50';
```

Existing redemptions stay valid; new attempts fail with `inactive`.

### Grant Plus directly (bypassing codes)

For founder/teacher comps with no expiry:

```sql
update profiles
set is_premium = true,
    premium_source = 'grant',
    premium_started_at = coalesce(premium_started_at, now()),
    premium_expires_at = null
where id = '<user-uuid>';
```

### Investigate "user paid but isn't premium"

```sql
-- All events for this user, newest first
select event_type, handler_note, processed_at
from subscription_events
where user_id = '<user-uuid>' or stripe_customer_id = (
  select stripe_customer_id from profiles where id = '<user-uuid>'
)
order by processed_at desc;
```

If `handler_note` says "No client_reference_id" then the Payment Link wasn't
hit with attribution — usually because the user opened the Payment Link
direct from a marketing email instead of through the app. Recovery:
manually grant via the SQL above, then audit the marketing source.

### Run the expiry sweep manually

```sql
select * from expire_premium_subscriptions();
-- → expired_count: 7
```

### Replay a missed webhook event

In Stripe Dashboard → Developers → Events → find the event → "Send test
webhook". The audit table's UNIQUE constraint on `stripe_event_id` makes
this safe: if we processed it already, the handler returns immediately
with `{duplicate: true}`.

---

## Failure modes & alarms

| Symptom | Likely cause | Where to look |
|---|---|---|
| Webhook returns 500 in Stripe Dashboard | Handler threw, Stripe will retry | `supabase functions logs stripe-webhook` |
| User paid but `is_premium=false` | `client_reference_id` missing from Payment Link | `subscription_events.handler_note` |
| Premium not expiring after cancel | pg_cron not running (Free tier) | `select * from cron.job` — if empty, schedule externally |
| Promo redemption silently fails | Code typed wrong / case mismatch | Check RPC return — error codes are precise |
| Webhook signature errors | Secret rotated in Stripe but not re-deployed | `supabase secrets set` + `functions deploy` |

---

## What's deliberately not built yet

These are 2–3 day items each, mark them up before scaling beyond a few
hundred subscribers:

- **Customer Portal link** — let Plus users self-manage (cancel, update
  card, change plan) from a "Manage subscription" button in Settings.
  Needs one more Edge Function: `create-customer-portal-session`.
- **Dunning UI** — when `premium_payment_failed_at` is set, surface a banner
  prompting the user to update their payment method (deeplink to Portal).
- **Native IAP** — only worth doing once web-flow conversion has been
  measured. Add via RevenueCat to unify the entitlement source of truth.
- **PPP pricing for India** — second set of Payment Links per locale, IP
  detection in `PaywallSheet` to pick the right env var.
- **Annual renewal reminder email** — fired by Loops 7 days before
  `premium_expires_at`. Needs the lifecycle email layer.
