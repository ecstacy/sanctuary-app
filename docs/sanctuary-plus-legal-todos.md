# Sanctuary Plus — Legal & Compliance To-Dos

Parked items from the monetization buildout. Not blockers for internal use
(the `SANCTUARY-TEAM` promo code path doesn't touch consumer-protection
law), but **must be resolved before charging external EU/Indian users**.

## Soft-launch path (no lawyer required)

You can ship Plus to founding team + friends today by minting promo codes
(`promo_codes` table, `redeem_promo_code` RPC). Internal grants don't
trigger consumer-protection or VAT obligations. This is the safe runway to
polish product + lifecycle while the legal track happens in parallel.

When you're ready for real revenue, work through the table below.

## What you must have before first paid external user

| Priority | Item | DIY-friendly path | Lawyer-required? |
|---|---|---|---|
| 🔴 must | **Privacy Policy** | Termly / iubenda template (~€10–30/mo) + tailor the health-data section | No, if templates are tailored well |
| 🔴 must | **Terms of Service** | Same generators; ensure subscription clauses + EU withdrawal waiver text | Worth a 1-hour lawyer review (~€200) |
| 🔴 must | **Refund Policy** | Standalone page or section of ToS. State your position clearly. | No |
| 🔴 must | **Impressum** (if serving Germany) | DIY — just publish company name, address, contact, register info. Templates at e-recht24.de | No |
| 🔴 must | **Not-medical-advice disclaimer** | One screen during onboarding + clause in ToS | No |
| 🔴 must | **EU 14-day withdrawal waiver** at checkout | Toggle in Stripe Payment Link config + the waiver text auto-shows | No |
| 🟠 strong | **Subscription cancellation in ≤2 clicks** (German "Kündigungsbutton") | Customer Portal link from Settings satisfies this | No |
| 🟠 strong | **Health data consent flow** (GDPR Art. 9) | Add explicit consent checkbox during dosha quiz: "I consent to processing my dosha and wellness data as described in the Privacy Policy" | No |
| 🟡 nice | **Cyber/E&O insurance** (~€1,500/yr) | Hiscox or Markel small-SaaS policy | No |
| 🟡 nice | **DPAs with vendors** (Stripe, Supabase, PostHog, Loops) | All offer click-through; just sign | No |

## Recommended template stack (DIY budget option)

If you're not paying a lawyer, here's the cheapest path that covers ~90%
of the real risk surface:

- **Termly** (~€10/mo) — generates Privacy Policy + ToS + Cookie Policy
  from a guided questionnaire. Has a SaaS template that asks about
  subscription billing, automatic renewal, etc.
- **iubenda** (~€30/mo) — pricier, more thorough, has a specific
  "Privacy controller" service for €30/mo extra
- **e-recht24.de** — free German Impressum generator. Reliable, used by
  most German indie SaaS
- **RocketLawyer** (~€40/mo) — if you want occasional lawyer chat access
  bundled with templates

Total: **~€20/mo for templates + €0 for Impressum**.

When you grow past ~500 paying users or hit your first GDPR request /
complaint, that's the moment to engage a real lawyer for €1,500–3,000 to
audit and replace the templated docs.

## Phase 0 — Business foundation (still needed)

| # | Task | Effort | DIY-friendly? |
|---|---|---|---|
| 1 | Decide business entity (German UG, UK Ltd, Estonia OÜ, Delaware C-corp via Stripe Atlas) | 1-2 days research | Yes |
| 2 | Register the entity | 1-4 weeks | Yes (online filing for most) |
| 3 | Business bank account | 1-2 weeks | Yes (Wise / N26 / Revolut Business work) |
| 4 | Get an accountant for VAT filings | Engage early | DIY for ~first year if revenue is low |

Stripe Atlas (Delaware C-corp + bank + EIN, ~$500, 1 week) is the
fastest "I exist as a legal entity" path. Tax complexity in the EU
follows separately.

## What Stripe forces you to have (non-negotiable)

Stripe won't activate the account until these URLs are live and reachable:

- Privacy Policy URL
- Terms of Service URL
- Refund Policy URL (can be a section of ToS)
- Business address visible somewhere on the site
- Working contact email

So the DIY template stack above isn't optional — it's the minimum Stripe
will accept to activate.

## Regions to skip in v1 (defer the legal lift)

- **India**: OIDAR registration is mandatory for non-Indian entities
  selling digital services to Indian consumers. ~8 weeks process +
  ongoing GST filings. **Geofence India out of v1 Stripe pricing**;
  revisit when you have product-market fit in EU + ready to invest in
  Indian compliance. Geofencing is one line in `PaywallSheet`.
- **US**: state-by-state sales tax on digital services is its own swamp.
  Defer until US accounts for >25% of pipeline.
- **UK**: post-Brexit, UK VAT is a separate registration from EU VAT
  OSS. Defer until UK accounts for meaningful revenue.

Start with **DE + EU OSS only**. One registration, one filing cadence,
covers all 27 member states.

## Health data — the one thing templates won't get right

Dosha results, mood checkins, and Vikriti tracking are **special category
data under GDPR Article 9**. Templates from Termly/iubenda will give you
a generic privacy policy that mentions health data abstractly — you need
to add a specific section explaining:

1. What health-adjacent data you process (dosha result, mood checkins, sleep
   self-reports, pranayama practice frequency)
2. Your lawful basis (explicit consent under Art. 9(2)(a))
3. How the user consents (the dosha quiz consent checkbox)
4. Retention period (e.g. "until account deletion, then 90 days for
   restore window")
5. That this data is NOT shared with third parties

This is a 30-minute writing exercise once you have the framework. The
template policy will mostly be right; you're just appending one section.

## When to actually hire a lawyer

Defer until any of these triggers:

- First GDPR data-access or deletion request from a user
- First refund dispute or chargeback that names policy ambiguity
- You hit 1,000 paying subscribers
- You expand to a new jurisdiction (UK, US, India, AU)
- You raise a funding round (investors will want clean docs)
- A regulator contacts you

Before any of those, templates + this doc are sufficient defense.
