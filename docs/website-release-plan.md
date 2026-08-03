# Website Release Plan — thesanctuaryteam.com

Status: the site is **built and release-ready** (landing, `/quiz`, 76 generated
`/poses`, legal pages, `_headers` CSP, `sitemap.xml`, `robots.txt`; zero-build
static → Cloudflare Pages). This plan is about **shipping it live**, not building it.
Owners: 👤 = Akash (accounts / DNS / external), 🤖 = code changes I can make.

---

## The one decision that drives everything

The landing + quiz + every pose page CTA is a **Google Play badge** pointing at
`com.sanctuary.app`, which **is not published yet** (waiting on org account →
German business registration → D-U-N-S → $25). A live badge to an unpublished
app is a dead "item not found" link.

Two paths:

- **A — Launch the site now, in "coming soon" mode (RECOMMENDED).** SEO is the
  long pole — the 76 pose pages take months to index and the payoff is M6–M12,
  so every week not indexed is lost. The `/quiz` gives a real dosha result with
  or without the app. We swap the dead Play badges for a non-dead "Coming soon
  on Google Play" state (→ email-notify or `/quiz`), behind a single flag. When
  the app publishes, one flag flip activates every badge. Matches the locked
  strategy: *"quiet soft-launch, content independent, app is the persistent CTA."*
- **B — Wait for the app, launch together.** Badge works day one, but delays SEO
  seeding by however long the entity/D-U-N-S chain takes (~30+ days).

**Recommendation: A.** Deploy now; flip badges live when the app lands.

---

## Phase 0 — Prerequisites (👤, external, blocks Phase 2)

- [ ] 👤 Confirm **thesanctuaryteam.com is registered** and you can manage its DNS.
- [ ] 👤 Domain in the **org Cloudflare account** as a zone (nameservers → Cloudflare),
      or at least DNS you can point. One Cloudflare account, all domains as zones.
- [ ] 👤 Decide the **inbox** `support@thesanctuaryteam.com` should forward to.

## Phase 1 — Site readiness (🤖, code — the "next batch")

- [ ] 🤖 **Badge flag.** Add one flag in `assets/site.js` (`APP_LIVE = false`).
      When false, `data-play-link` badges render "Coming soon on Google Play"
      (non-clickable or → `/quiz`); when true, the real Play URL + `referrer=`
      attribution (today's behaviour). One-line flip at go-live.
- [ ] 🤖 **Verify PostHog web is initialised**, not just captured. `site.js`
      fires `store_badge_clicked` on `window.posthog`, but confirm the snippet is
      actually loaded (EU, cookieless) so `/quiz` funnel + badge CTR are measured
      from day one (targets: quiz completion ≥40%, quiz→badge CTR ≥25%).
- [ ] 🤖 **Add `quiz_started` / `quiz_completed` events** if missing, so the
      funnel is measurable (growth-plan §1.4).
- [ ] 🤖 **Regenerate `/poses` + sitemap** (`npm run poses:pages`) so pages match
      the current `asanas.js` (it changed recently — bilateral flags etc.).
- [ ] 🤖 **Add `website/404.html`** (Cloudflare serves it) — small branded page.
- [ ] 🤖 **Indexing check:** `robots.txt` allows all ✓, `sitemap.xml` uses
      `www.thesanctuaryteam.com` ✓. Keep indexing ON (seed SEO now); the pose +
      quiz pages are evergreen regardless of app status.
- [ ] 🤖 Keep the **"Launching soon"** landing note until go-live.

## Phase 2 — Deploy (👤 dashboard + 🤖 verify)

- [ ] 👤 Cloudflare **Pages → Connect to Git → this repo**; preset **None**, build
      command **empty**, output dir **`website`**. (I can't touch your CF account.)
- [ ] 👤 **Custom domain**: add `www` + apex redirect; CF walks the DNS records.
      HTTPS is automatic. Pretty URLs (`/privacy`) work out of the box.
- [ ] 🤖 After first deploy, smoke-test: landing, `/quiz` full flow, a few
      `/poses/*`, legal pages, `_headers` CSP applied, `/sitemap.xml` + `/robots.txt`
      reachable, 404 works.

## Phase 3 — Email + Search Console (👤)

- [ ] 👤 **Cloudflare Email Routing** (free): `support@thesanctuaryteam.com` →
      your inbox. Referenced on all four legal/support pages, so it must resolve.
- [ ] 👤 **Google Search Console**: verify the domain, submit `sitemap.xml`.
- [ ] 👤 (optional) Bing Webmaster Tools — same sitemap, more index coverage.

## Phase 4 — Go-live flip (when the app publishes on Play)

- [ ] 🤖 Flip `APP_LIVE = true` → every badge becomes the real Play link + UTMs.
- [ ] 🤖 Remove the "Launching soon" note in `index.html`.
- [ ] 👤🤖 **Prove the attribution spine end-to-end** — the one thing never
      verified (adb sideloads return no referrer by design): from a **real Play
      track**, install via `/?utm_source=test` → badge → confirm
      `install_attributed` + `acquisition_source` land in PostHog.

## Phase 5 — Post-launch (ongoing)

- [ ] PostHog web dashboard: quiz completion rate, quiz→badge CTR, top pose pages.
- [ ] Search Console: watch the 76 pose pages get indexed (slow; weeks–months).
- [ ] Re-run `npm run poses:pages` whenever `asanas.js` changes (site ↔ app parity).

---

## Dependency graph (critical path)

```
👤 domain + Cloudflare zone ─┐
🤖 Phase 1 site changes ─────┼─→ 👤 Phase 2 deploy ─→ 🤖 smoke test ─→ 👤 Search Console + email
                             │                                    (site is LIVE, coming-soon mode)
app published on Play ───────┴─────────────────────────────────────→ 🤖 Phase 4 flip → attribution proof
(separate track: D-U-N-S/$25)                                        (badges go active)
```

The site launch (coming-soon) does **not** depend on the app being published.
Only Phase 4 does. So we can ship Phases 0–3 immediately and flip later.

## What I need from you to start the batch

1. **Path A (launch now, coming-soon badges) or B (wait for app)?** — I recommend A.
2. Is **thesanctuaryteam.com registered**, and is DNS in the org **Cloudflare** account?
3. What inbox should **support@** forward to?

With A + the domain in Cloudflare, I can do all of Phase 1 (code) right away, and
you do the Cloudflare dashboard connect (Phase 2) — the site is live the same day.
