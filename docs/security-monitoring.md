# Security Monitoring — what we watch, and what we deliberately don't

> Companion to [security-audit.md](./security-audit.md). Signals ship in
> migration `015_security_signals.sql`.
> Scope check: solo founder, pre-launch, ~1 user. This is sized for that —
> **detection, not a SOC.** Revisit at ~1k users.

Guards that *block* attacks are only half the job. Until 015 the app blocked
the self-grant attempt and promo brute-force and **recorded nothing anyone
would look at** — so we'd never know we'd been probed. This is the other half.

---

## The three signals worth having

### 1. Entitlement-write attempts (highest fidelity)

Someone trying to set their own `is_premium`. **Nobody hits this by accident** —
the client never writes those columns — so every occurrence is a probe for the
vulnerability that was live until migration 014.

**Where:** Supabase → **Logs** → **Postgres**. Search:

```
SECURITY_SIGNAL entitlement_write_blocked
```

Each line carries the user id, the DB role, and the attempted before→after
values.

> **Why a log line and not a table:** the 014 trigger ends in `raise
> exception`, which aborts the transaction — any row it inserted would roll
> back with it, and Postgres has no autonomous transactions. Server logs are
> written outside transaction scope, so they survive. We kept the exception
> because failing closed and loudly beats a tidier audit trail.

⚠️ **Retention is short** (roughly 1 day on Free, 7 on Pro). This signal is for
"was I attacked recently", not long-term forensics. If that matters later, the
upgrade path is a log drain — deliberately not built yet.

### 2. Promo-code abuse

Migration 013 already logs every attempt; 015 adds two views over it.

```sql
select * from security_promo_abuse;         -- users with >=5 failures in 7d
select * from security_promo_codes_probed;  -- which codes are being guessed (30d)
```

Read them like this:
- **High `distinct_codes_tried`** → enumeration. A real user retypes *one* code;
  a script sprays many. This is the column that separates attack from typo.
- **One code, many `distinct_users`** in the second view → a code leaked and is
  being shared, not brute-forced. Different problem: revoke it.

Both views are `service_role` only — clients can't read them.

### 3. Auth + error anomalies (already spec'd)

In PostHog, from [posthog-dashboards.md](./posthog-dashboards.md):
- **A2 login-failure rate > 5%** sustained → credential stuffing or a broken
  provider.
- **`error_caught` spike > 50/h** → often the first sign of someone fuzzing.

⚠️ These were *specified* in the runbook but **the threshold alerts are UI-only**
(a personal API key can't provision Slack routing) — so **verify they're
actually armed**, don't assume. An alert you believe in but never configured is
worse than none.

---

## The routine

**Weekly, ~5 minutes:**
```sql
select * from security_promo_abuse;
select * from security_promo_codes_probed;
```
plus a Logs search for `SECURITY_SIGNAL`.

**After any public push** (a launch, a viral post — i.e. when attention spikes),
run the same checks within a day. Attacks follow attention.

**If a signal fires:**
1. `entitlement_write_blocked` → the guard held; nothing was granted. Note the
   user id, then confirm nothing slipped through:
   ```sql
   select id, premium_source, premium_started_at from profiles
   where is_premium = true
     and premium_source is distinct from 'stripe'
     and id not in (select user_id from promo_redemptions);
   ```
   Rows here were granted by neither Stripe nor a promo code.
2. **Promo enumeration** → rotate the affected codes, tighten
   `max_redemptions`, and re-mint with high entropy
   (`encode(gen_random_bytes(8),'base32')` — never `LAUNCH50`).
3. Repeated abuse from one account → disable it in Supabase Auth.

---

## Deliberately NOT built (and why)

Being explicit so these aren't mistaken for oversights:

| Not built | Why |
|---|---|
| Log drain / external SIEM | Costs money and attention to watch an empty feed at ~1 user. Revisit when retention actually bites. |
| WAF / rate-limiting middleware | Supabase already rate-limits auth; our own hot paths are guarded (013). A WAF in front of Supabase is a big lift for a threat we don't face yet. |
| Automated blocking / IP bans | High false-positive risk, and nothing to protect at this scale. Manual review is proportionate. |
| Alerting on every failed login | Noise. The A2 *rate* alert catches the pattern that matters. |
| Per-request audit table | Costs write throughput on every request to catch what the targeted signals above already catch. |

**The honest limitation:** everything here is *detection after the fact*, and
short-retention at that. It tells you that you were probed — it does not stop a
novel attack. The actual protection remains the guards (013/014), RLS, and
keeping the dependency surface patched.
