# thesanctuaryteam.com — marketing site

Zero-dependency static site (plain HTML/CSS/JS — no build step). This is the
M1 skeleton from [docs/growth-plan.md](../docs/growth-plan.md) §2: landing +
privacy + terms + support. The /quiz funnel (M2) and /poses SEO library
(M3–4, generated from `src/data/asanas.js`) come later — introduce Astro only
when the generated pages actually need it.

## Local preview

```bash
python3 -m http.server 8900 --bind 127.0.0.1 --directory website
```

## Deploy (Cloudflare Pages, free)

1. Cloudflare dashboard → Workers & Pages → Create → Pages →
   "Connect to Git" → select this repo.
2. Build settings: **Framework preset: None**, build command: *(empty)*,
   output directory: `website`.
3. Custom domain → add `www.thesanctuaryteam.com` (and apex redirect) —
   Cloudflare walks you through the DNS records.
4. Pretty URLs (`/privacy` → `privacy.html`) work out of the box.

Netlify works identically (publish directory `website`, no build command).

## Flip-to-live checklist (when the Play listing goes public)

- [ ] Remove the "Launching soon" note in `index.html` (one `<p class="cta-note">`)
- [ ] Set up `support@thesanctuaryteam.com` forwarding (Cloudflare Email
      Routing is free) — the address is referenced on all four pages
- [ ] Submit `sitemap.xml` in Google Search Console
- [ ] Verify the Play badge carries `referrer=` UTMs end-to-end
      (visit `/?utm_source=test`, click badge, check the URL)

## Attribution notes

`assets/site.js` re-encodes any `utm_*` params on the page URL into the Play
link's `referrer=` param (Install Referrer spine — growth-plan §4), fires
`store_badge_clicked` into PostHog (EU, cookieless `memory` persistence — no
banner needed), and captures pageviews with `platform: web`.
