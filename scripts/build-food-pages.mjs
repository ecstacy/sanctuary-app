#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  build-food-pages.mjs — generate the /foods SEO library for the website
//
//  The food parallel to build-pose-pages.mjs: static HTML in website/foods/
//  from the SAME canonical dataset the app uses (src/data/ayurveda via
//  lib/ingredients.js), so the site and product can never drift. Targets
//  long-tail search — "is ginger good for pitta", "foods for vata" — the moat
//  is the per-dosha suitability table no generic nutrition site has.
//
//  ⚠ SIGN CONVENTION — food doshaEffect is -1 pacifies / +1 aggravates, the
//  OPPOSITE of a pose's doshaAffinity. Every dosha verdict here goes through
//  foodSuitability() (lib/doshaSemantics.js), never a raw number. Reading the
//  sign by hand is exactly how the /poses pages once shipped inverted advice.
//
//  Only reviewStatus:'reviewed' rows are exported by lib/ingredients.js, so an
//  unverified draft can't reach the web. Re-run:  npm run foods:pages
//  (the sitemap is owned by build-pose-pages.mjs, which also enumerates foods.)
// ─────────────────────────────────────────────────────────────────────────────

import { writeFile, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import esbuild from 'esbuild'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dirname, '..')
const OUT_DIR = join(REPO, 'website', 'foods')
const SITE = 'https://www.thesanctuaryteam.com'

// Load canonical data (bundle in-memory — same trick as build-pose-pages.mjs).
const { REVIEWED_INGREDIENTS, foodSuitability } = await (async () => {
  const bundled = await esbuild.build({
    stdin: {
      contents:
        `export { REVIEWED_INGREDIENTS } from './src/lib/ingredients.js'\n` +
        `export { foodSuitability } from './src/lib/doshaSemantics.js'\n`,
      resolveDir: REPO, loader: 'js',
    },
    bundle: true, format: 'cjs', platform: 'node', write: false, logLevel: 'silent',
  })
  const mod = { exports: {} }
  new Function('module', 'exports', 'require', bundled.outputFiles[0].text)(mod, mod.exports, require)
  return mod.exports
})()

// ── Helpers ─────────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const slugify = (s) => String(s).toLowerCase()
  .replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const titleCase = (s) => String(s).replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export const foodSlug = (f) => slugify(f.name)

const CATEGORY_LABEL = {
  grain: 'Grains', legume: 'Legumes', vegetable: 'Vegetables', fruit: 'Fruits',
  dairy: 'Dairy', spice: 'Spices', oil: 'Oils & fats', nut_seed: 'Nuts & seeds',
  sweetener: 'Sweeteners', beverage: 'Beverages', animal: 'Animal foods', other: 'Other',
}
const CATEGORY_ORDER = ['grain', 'legume', 'vegetable', 'fruit', 'dairy', 'spice',
  'oil', 'nut_seed', 'sweetener', 'beverage', 'animal', 'other']

const VIRYA_LABEL = { heating: 'Heating (uṣṇa)', cooling: 'Cooling (śīta)', neutral: 'Neutral' }

// Sign-safe: foodSuitability maps the food's doshaEffect (-1/0/+1) to a verdict.
const VERDICT = {
  balancing: { cls: 'pacify',   label: 'Balancing' },
  neutral:   { cls: 'neutral',  label: 'Neutral' },
  caution:   { cls: 'increase', label: 'Use sparingly' },
}
const verdictNote = (v, dosha) => {
  const D = titleCase(dosha)
  if (v === 'balancing') return `Calms ${D} — favour it when ${D} runs high.`
  if (v === 'caution')   return `Can raise ${D} — go easy when ${D} runs high.`
  return `Broadly neutral for ${D}.`
}

// ── Shared chrome ───────────────────────────────────────────────────────────
const head = ({ title, description, canonical, jsonld }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Noto+Serif:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/style.css?v=2">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${SITE}/assets/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:image" content="${SITE}/assets/og.png">
${jsonld ? `  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>
<body>

<header>
  <div class="wrap nav">
    <a class="brand" href="/">
      <img src="/assets/logo.png" alt="">
      <span>The Sanctuary</span>
    </a>
    <nav class="nav-links">
      <a href="/foods/">Foods</a>
      <a href="/poses/">Poses</a>
      <a href="/quiz">Dosha quiz</a>
      <a href="/support">Support</a>
    </nav>
  </div>
</header>
`

const footer = () => `
<footer>
  <div class="wrap">
    <div class="footer-grid">
      <a class="brand" href="/"><img src="/assets/logo.png" alt=""><span>The Sanctuary</span></a>
      <nav class="footer-links">
        <a href="/foods/">Food guide</a>
        <a href="/poses/">Pose library</a>
        <a href="/quiz">Dosha quiz</a>
        <a href="/faq">FAQ</a>
        <a href="/support">Support</a>
      </nav>
    </div>
    <p class="copyright">© 2026 The Sanctuary. Ayurveda is a wellness tradition, not a
       prescription — see a professional for medical concerns.</p>
  </div>
</footer>

<script src="/assets/site.js?v=2"></script>
</body>
</html>
`

const list = (items) => (items && items.length)
  ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''

// ── Single food page ────────────────────────────────────────────────────────
function foodPage(f, related) {
  const canonical = `${SITE}/foods/${foodSlug(f)}`
  const names = [f.sanskrit, f.devanagari].filter(Boolean)
  const confidence = f.confidence === 'high' ? 'Classically cited' : 'Property-derived'
  const title = `Is ${f.name} good for vata, pitta or kapha? — Ayurvedic guide | The Sanctuary`
  const description = `${f.name} in Ayurveda: taste (${(f.rasa || []).join(', ')}), potency (${f.virya}), and how it affects vata, pitta and kapha. ${f.whyFavor || ''}`.slice(0, 300)

  const doshaRows = ['vata', 'pitta', 'kapha'].map((d) => {
    const v = foodSuitability(f.doshaEffect?.[d])   // sign-safe
    const meta = VERDICT[v] || VERDICT.neutral
    return `          <tr>
            <th scope="row">${titleCase(d)}</th>
            <td><span class="d-tag d-${meta.cls}">${meta.label}</span></td>
            <td>${esc(verdictNote(v, d))}</td>
          </tr>`
  }).join('\n')

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Ayurvedic food guide', item: `${SITE}/foods/` },
      { '@type': 'ListItem', position: 3, name: f.name, item: canonical },
    ],
  }

  const metaBits = [
    f.rasa?.length ? `<strong>Taste:</strong> ${esc(f.rasa.map(titleCase).join(', '))}` : '',
    f.virya ? `<strong>Potency:</strong> ${esc(VIRYA_LABEL[f.virya] || titleCase(f.virya))}` : '',
    f.vipaka ? `<strong>Post-digestive:</strong> ${esc(titleCase(f.vipaka))}` : '',
    f.guna?.length ? `<strong>Qualities:</strong> ${esc(f.guna.map(titleCase).join(', '))}` : '',
  ].filter(Boolean)

  return head({ title, description, canonical, jsonld }) + `
<main>
  <div class="wrap pose-page">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">/</span>
      <a href="/foods/">Foods</a> <span aria-hidden="true">/</span>
      <span aria-current="page">${esc(f.name)}</span>
    </nav>

    <article>
      <header class="pose-head">
        <p class="kicker">${esc(CATEGORY_LABEL[f.category] || 'Food')} · ${esc(confidence)}</p>
        <h1>${esc(f.name)}</h1>
        ${names.length ? `<p class="pose-names">${names.map((n) => `<span>${esc(n)}</span>`).join('<span class="sep">·</span>')}</p>` : ''}
        ${f.aliases?.length ? `<p class="pose-alias">Also called: ${esc(f.aliases.join(', '))}</p>` : ''}
      </header>

      ${f.whyFavor ? `<p class="pose-lede">${esc(f.whyFavor)}</p>` : ''}

      <section>
        <h2>How ${esc(f.name)} affects your doshas</h2>
        <p class="pose-note">In Ayurveda a food's effect depends on your constitution.
           This is the lens the app uses to suggest what to favour and ease off.</p>
        <table class="dosha-table">
          <caption class="sr-only">Effect of ${esc(f.name)} on each dosha</caption>
          <thead><tr><th scope="col">Dosha</th><th scope="col">Suitability</th><th scope="col">Notes</th></tr></thead>
          <tbody>
${doshaRows}
          </tbody>
        </table>
        ${metaBits.length ? `<p class="pose-meta">${metaBits.join(' &nbsp;·&nbsp; ')}</p>` : ''}
      </section>

      ${f.whyAvoid ? `<section>
        <h2>When to go easy</h2>
        <p>${esc(f.whyAvoid)}</p>
      </section>` : ''}

      ${(f.bestTime?.length || f.bestSeason?.length) ? `<section>
        <h2>Best time to eat it</h2>
        <p class="pose-meta">
          ${f.bestTime?.length ? `<strong>Time of day:</strong> ${esc(f.bestTime.map(titleCase).join(', '))}` : ''}
          ${(f.bestTime?.length && f.bestSeason?.length) ? ' &nbsp;·&nbsp; ' : ''}
          ${f.bestSeason?.length ? `<strong>Season:</strong> ${esc(f.bestSeason.map(titleCase).join(', '))}` : ''}
        </p>
      </section>` : ''}

      ${f.combosToAvoid?.length ? `<section class="pose-safety">
        <h2>Combinations to avoid</h2>
        <p class="pose-note">Ayurveda flags some pairings (viruddha āhāra) as hard to digest together.</p>
        ${list(f.combosToAvoid)}
      </section>` : ''}

      ${f.cautions?.length ? `<section class="pose-safety">
        <h2>Cautions</h2>
        ${list(f.cautions.map(titleCase))}
        ${f.cautionNote ? `<p class="pose-note">${esc(f.cautionNote)}</p>` : ''}
      </section>` : ''}

      <p class="pose-source"><strong>${esc(confidence)}.</strong> ${f.confidence === 'high'
        ? 'Directly attested in the classical Ayurvedic corpus.'
        : 'Not directly cited classically — classified from its taste, potency and qualities. Weigh it accordingly.'}</p>

      <aside class="pose-cta">
        <p class="section-kicker">Eat for your dosha</p>
        <h2>Personalised in the app.</h2>
        <p>The Sanctuary turns this into daily meal guidance composed around your
           dosha and the season — not a generic food list.</p>
        <a class="play-badge" data-play-link data-placement="food_page"
           href="https://play.google.com/store/apps/details?id=com.sanctuary.app"
           aria-label="Get The Sanctuary on Google Play">
          <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
               alt="Get it on Google Play">
        </a>
        <p class="cta-note"><a href="/quiz">Not sure of your dosha? Take the 1-minute quiz →</a></p>
      </aside>

      ${related.length ? `<section>
        <h2>More ${esc((CATEGORY_LABEL[f.category] || 'foods').toLowerCase())}</h2>
        <ul class="pose-related">
          ${related.map((r) => `<li><a href="/foods/${foodSlug(r)}">${esc(r.name)}<span>${esc((r.rasa || []).map(titleCase).join(', '))}</span></a></li>`).join('')}
        </ul>
      </section>` : ''}
    </article>
  </div>
</main>
` + footer()
}

// ── Hub page ────────────────────────────────────────────────────────────────
function hubPage(foods) {
  const total = foods.length
  const title = `Ayurvedic food guide — ${total} foods for vata, pitta & kapha | The Sanctuary`
  const description = `Browse ${total} foods with their taste, potency, and how each affects vata, pitta and kapha — the Ayurvedic lens for what to favour and what to ease off.`
  const byCat = {}
  foods.forEach((f) => { (byCat[f.category] ||= []).push(f) })
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Ayurvedic food guide',
    url: `${SITE}/foods/`,
    description,
  }
  const sections = CATEGORY_ORDER.filter((c) => byCat[c]).map((c) => {
    const items = byCat[c].slice().sort((a, b) => a.name.localeCompare(b.name))
    return `      <section>
        <h2>${esc(CATEGORY_LABEL[c])}</h2>
        <ul class="pose-related">
          ${items.map((f) => `<li><a href="/foods/${foodSlug(f)}">${esc(f.name)}<span>${esc((f.rasa || []).map(titleCase).join(', '))} · ${esc(f.virya)}</span></a></li>`).join('')}
        </ul>
      </section>`
  }).join('\n')

  return head({ title, description, canonical: `${SITE}/foods/`, jsonld }) + `
<main>
  <div class="wrap pose-page">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">/</span>
      <span aria-current="page">Foods</span>
    </nav>
    <header class="pose-head">
      <p class="kicker">Ayurvedic food guide</p>
      <h1>Foods for your dosha</h1>
      <p class="sub">${total} foods with their taste, potency, and how each affects
         vata, pitta and kapha. <a href="/quiz">Find your dosha →</a></p>
    </header>
${sections}
  </div>
</main>
` + footer()
}

// ── Emit ────────────────────────────────────────────────────────────────────
const foods = REVIEWED_INGREDIENTS.slice().sort((a, b) => a.name.localeCompare(b.name))

if (existsSync(OUT_DIR)) await rm(OUT_DIR, { recursive: true, force: true })
await mkdir(OUT_DIR, { recursive: true })

// Guard: duplicate slugs would overwrite each other silently.
const seen = new Map()
for (const f of foods) {
  const s = foodSlug(f)
  if (seen.has(s)) throw new Error(`Duplicate food slug "${s}": ${seen.get(s)} vs ${f.id}`)
  seen.set(s, f.id)
}

await writeFile(join(OUT_DIR, 'index.html'), hubPage(foods), 'utf8')
for (const f of foods) {
  const related = foods.filter((r) => r.category === f.category && r.id !== f.id).slice(0, 6)
  await writeFile(join(OUT_DIR, `${foodSlug(f)}.html`), foodPage(f, related), 'utf8')
}

console.log(`✓ ${foods.length} food pages + hub → website/foods/`)
