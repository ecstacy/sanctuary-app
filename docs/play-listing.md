# Play Store listing kit — The Sanctuary

_Launch prep for TODO #12 / step 5. The **copy** below is a first draft to edit; the **Data safety** and **Content rating** sections are derived from the actual code (track.js, crash.js, consent.js, Supabase profile, Capacitor plugins) — verify against the current build before you submit, but they should be accurate as of 2026-08-25._

---

## 1. Store listing copy (draft — your voice wins)

**App name** (≤30 chars): `The Sanctuary` — or `The Sanctuary: Yoga·Ayurveda` (28).

**Short description** (≤80 chars):
> Personalized yoga & Ayurveda for your dosha — daily practice, meals & calm.

**Full description** (≤4000 chars):
> **Your constitution is unique. Your practice should be too.**
>
> The Sanctuary reads your Ayurvedic constitution (dosha) and builds a daily practice around *you* — grounding when you're scattered, cooling when you're fired up, energizing when you're heavy.
>
> **What's inside**
> • **Know your dosha** — a short quiz reveals your Vata, Pitta and Kapha balance, explained clearly.
> • **A daily practice, personalized** — yoga sequences chosen for your current state and the time of day, with clear pose guidance.
> • **Eat for your constitution** — meal ideas tuned to your dosha, and a Meal Check that reads any dish and shows how it moves your doshas — built on classical Ayurvedic sources, not guesswork.
> • **Breathe** — guided pranayama and a full Yoga Nidra for deep rest.
> • **Gentle, honest guidance** — every recommendation shows *why*, drawn from Charaka and the classical texts. General wellbeing, never medical advice.
>
> **Private by design** — analytics and crash reporting are off until you turn them on. Your data is yours: download or delete it any time.
>
> Available in English, German (Deutsch) and Hindi (हिन्दी).
>
> _The Sanctuary offers general Ayurvedic and yoga guidance for wellbeing. It is not medical or nutritional advice, diagnosis, or treatment._

**Category:** Health & Fitness
**Tags:** yoga, ayurveda, meditation, wellness, dosha
**Languages:** English, German, Hindi

---

## 2. Data safety form (factual — from the code)

Google's Data Safety form asks, per data type: **collected?**, **shared?** (= sent to a third party for *their own* use — processors don't count), **processing optional?**, **purpose**, **encrypted in transit?**, **user can request deletion?**

**Cross-cutting facts:**
- **Encrypted in transit:** ✅ Yes for everything (Supabase, PostHog EU, Firebase all over TLS/HTTPS).
- **Deletion:** ✅ Yes — in-app **"Delete my account"** + **"Download my data"** (Profile → Your data), and support@thesanctuaryteam.com.
- **"Shared" with third parties:** ❌ No for all — PostHog, Supabase and Firebase are **service providers/processors**, which Google does not count as "sharing."
- **Consent-gating:** analytics and crash reporting are **off by default** (see consent.js) — declare those data types as **"Data collection is optional."**

| Data type | Collected | Purpose | Optional? |
|---|---|---|---|
| **Name** (from Google sign-in / profile) | Yes | Account management, personalization | No (account) |
| **Email address** (Google sign-in) | Yes | Account management | No (account) |
| **User IDs** | Yes | Account management, analytics | No (account) |
| **Gender** (optional profile field) | Yes | Personalize recommendations | Yes (user-entered) |
| **Health & fitness info** — dosha/constitution, diet preferences, meal logs, practice activity | Yes | App functionality (core personalization) | No |
| **App interactions / in-app actions** (PostHog analytics) | Yes | Analytics | **Yes** (consent-gated) |
| **Crash logs & diagnostics** (Firebase Crashlytics) | Yes | App stability / diagnostics | **Yes** (consent-gated) |
| **Photos** (optional profile avatar upload) | Yes (if user uploads) | Account personalization | Yes |

**PII in analytics:** track.js runs a PII scrubber that blocks email/name/phone/address/location/device-id/token fields from event properties, and PostHog uses `person_profiles: 'identified_only'` on the **EU** host. Worth noting in the "how data is handled" text.

**Audio / microphone:** the app uses **@capacitor-community/speech-recognition** for voice input. It uses the **device's native speech recognizer** and keeps the resulting **text**, not an audio recording — so declare **microphone permission** but **"Voice/audio recordings: not collected"** (audio isn't stored or transmitted by the app). ⚠️ Confirm the recognizer's own behavior (Android's SpeechRecognizer may route audio to Google) and reflect that honestly.

---

## 3. Content rating (IARC questionnaire)

Answer the questionnaire truthfully — expected outcome **Everyone / PEGI 3**:
- Violence, blood, sexual content, nudity, profanity: **No**
- Controlled substances / drugs / alcohol / tobacco: **No** (Ayurvedic diet discussion is food/wellbeing, not drug references)
- Gambling / simulated gambling: **No**
- User-to-user communication / user-generated content sharing: **No**
- Shares user location: **No**
- Digital purchases: **at launch, No** (free-tier-first; revisit when Plus/IAP turns on)

Category: **Health & Fitness / Reference**.

---

## 4. Other listing requirements (status)
- **Privacy policy URL:** ✅ `https://www.thesanctuaryteam.com/privacy`
- **Support email:** ✅ `support@thesanctuaryteam.com` (Google Workspace)
- **App icon** (512×512), **feature graphic** (1024×500), **≥2 phone screenshots** — needed (see §5)
- **Target audience & content:** adults / general wellbeing
- **Ads:** declare **No ads**
- **Public developer name:** the **parent brand** (TODO #26) — set once chosen

---

## 5. Screenshots (plan)
Capture on a clean device/emulator, mock-auth off, real content. Best 5–8:
1. **Home** — the personalized daily state + dosha gem
2. **Your Constitution** card (Vata/Pitta/Kapha)
3. **Today's practice / Routine** hero
4. **Meal Check** result (dosha impact of a dish)
5. **Meal ideas** (the illustrated cards)
6. **A pose detail** with guidance
7. **Yoga Nidra** guided screen
8. (optional) **Discover** library

I can generate raw candidates from the live app; you'll likely want them framed + captioned for the store.
