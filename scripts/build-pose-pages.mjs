#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  build-pose-pages.mjs — generate the /poses SEO library for the website
//
//  Emits static HTML into website/poses/ from src/data/asanas.js — the same
//  canonical data the app renders — so the marketing site and the product can
//  never drift apart. Growth-plan §2.2 (M3–M4): 76 pages of unique, structured
//  content that compounds in search for years.
//
//  WHY A GENERATOR AND NOT ASTRO
//  ─────────────────────────────
//  The plan floated Astro. A generator script is the better fit here:
//    • The site is deliberately ZERO-BUILD — Cloudflare Pages serves website/
//      with an empty build command. Astro would add a framework, a build step,
//      and a deploy-config change for what is fundamentally templating.
//    • This repo already has the pattern (build-pose-manifest.mjs,
//      provision-posthog-dashboards.mjs) and already commits generated
//      artifacts (poseManifest.js).
//    • Output is committed static HTML — reviewable in diffs, instantly
//      served, no runtime.
//  Re-run after editing asanas.js:  npm run poses:pages
//
//  SEO surface per page: <title>/description, canonical, OpenGraph,
//  Schema.org HowTo (steps) + ImageObject, breadcrumbs, and internal links to
//  related poses. The moat is the DOSHA AFFINITY table — no generic yoga site
//  has it, and it's the reason these pages can outrank bigger domains.
// ─────────────────────────────────────────────────────────────────────────────

import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import esbuild from 'esbuild'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dirname, '..')
const OUT_DIR = join(REPO, 'website', 'poses')
const IMG_OUT = join(REPO, 'website', 'assets', 'poses')
const SITE = 'https://www.thesanctuaryteam.com'

// ── Load canonical data (asanas.js imports a Vite-only specifier, so bundle
//    it in-memory with esbuild first — same trick as generate-voice.mjs) ──
const { ASANAS, IMAGE_FILES, getDoshaTag } = await (async () => {
  const bundled = await esbuild.build({
    stdin: {
      contents:
        `export { ASANAS, getDoshaTag } from './src/data/asanas.js'\n` +
        `export { IMAGE_FILES } from './src/data/poseManifest.js'\n`,
      resolveDir: REPO,
      loader: 'js',
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

const titleCase = (s) => String(s).replace(/[_-]/g, ' ')
  .replace(/\b\w/g, (c) => c.toUpperCase())

// ⚠ SIGN CONVENTION — asanas use the OPPOSITE sign to foods.
//   asanas.js  doshaAffinity: +1 = BALANCING for that dosha, -1 = CAUTION
//              (authoritative: getDoshaTag() in src/data/asanas.js —
//               `affinity > 0 → 'Balancing'`, `affinity < 0 → 'Caution'`)
//   dietary.js RASAS.effect:  -1 = pacifying, +1 = aggravating
// Getting this backwards silently inverts the advice on all 76 pages, so the
// labels below are derived from getDoshaTag, not from intuition.
// Labels come from the APP's own getDoshaTag so the two can never diverge —
// it also handles the legacy string schema ('balancing'/'aggravating') that a
// few older entries still use (e.g. Mindful Respiration), which a naive
// numeric lookup silently rendered as "Neutral".
const EFFECT_META = {
  Balancing: { cls: 'pacify',   note: 'a good fit — helps settle this dosha' },
  Neutral:   { cls: 'neutral',  note: 'broadly neutral' },
  Caution:   { cls: 'increase', note: 'can aggravate this dosha — practise sparingly' },
}
const effectOf = (v) => {
  const label = getDoshaTag(v).label
  return { label, ...(EFFECT_META[label] || EFFECT_META.Neutral) }
}

// Mirrors POSE_ALIASES in src/components/PoseFigure.jsx — the handful of poses
// whose data key differs from the on-disk filename by more than casing. Kept in
// sync by hand; if a pose here loses its image, check that map first. (Without
// these, Legs Up the Wall and Seated Forward Bend generate imageless pages even
// though the app renders them fine.)
const POSE_ALIASES = {
  forwardBend: 'paschimottanasana',
  legsUpWall:  'legUpWall',
}

function imageFor(poseKey) {
  if (!poseKey || !IMAGE_FILES) return null
  const base = (POSE_ALIASES[poseKey] || poseKey).toLowerCase()
  return IMAGE_FILES[base] || null
}

// ── Slugs (english name is the primary search term; disambiguate collisions) ─
const asanas = Object.values(ASANAS).filter((a) => a && a.id && a.english)
const slugCount = {}
asanas.forEach((a) => {
  const base = slugify(a.english)
  slugCount[base] = (slugCount[base] || 0) + 1
})
const slugOf = (a) => {
  const base = slugify(a.english)
  return slugCount[base] > 1 ? `${base}-${slugify(a.sanskrit || a.id)}` : base
}

// ── Shared chrome (mirrors the hand-written pages) ──────────────────────────
const head = ({ title, description, canonical, image, jsonld }) => `<!doctype html>
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
  <link rel="stylesheet" href="/assets/style.css">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(image || `${SITE}/assets/og.png`)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:image" content="${esc(image || `${SITE}/assets/og.png`)}">
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
      <a class="brand" href="/">
        <img src="/assets/logo.png" alt="">
        <span>The Sanctuary</span>
      </a>
      <nav class="footer-links">
        <a href="/poses/">Pose library</a>
        <a href="/quiz">Dosha quiz</a>
        <a href="/support">Support</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
    </div>
    <p class="copyright">© 2026 The Sanctuary. Yoga is a practice, not a prescription —
       see a professional for medical concerns.</p>
  </div>
</footer>

<script src="/assets/site.js"></script>
</body>
</html>
`

const ctaBlock = (a) => `
      <aside class="pose-cta">
        <p class="section-kicker">Practise it properly</p>
        <h2>Guided, in the app.</h2>
        <p>${esc(a.english)} with video, voice guidance, and a daily practice
           composed around your dosha — not a generic playlist.</p>
        <a class="play-badge" data-play-link data-placement="pose_page"
           href="https://play.google.com/store/apps/details?id=com.sanctuary.app"
           aria-label="Get The Sanctuary on Google Play">
          <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
               alt="Get it on Google Play">
        </a>
        <p class="cta-note"><a href="/quiz">Not sure of your dosha? Take the 1-minute quiz →</a></p>
      </aside>`

// ── Single pose page ────────────────────────────────────────────────────────
function posePage(a, related) {
  const slug = slugOf(a)
  const canonical = `${SITE}/poses/${slug}`
  const img = imageFor(a.poseKey)
  const imgUrl = img ? `${SITE}/assets/poses/${img}` : null

  const names = [a.sanskrit, a.devanagari, a.iast].filter(Boolean)
  const title = `${a.english}${a.sanskrit && a.sanskrit !== a.english ? ` (${a.sanskrit})` : ''} — benefits, steps & dosha effects | The Sanctuary`

  const firstBenefit = (a.benefits && a.benefits[0]) || ''
  const description = `How to practise ${a.english}${a.sanskrit ? ` (${a.sanskrit})` : ''}: step-by-step instructions, benefits, contraindications, and how it affects vata, pitta and kapha. ${firstBenefit}`.slice(0, 300)

  const steps = (a.instructions || []).map((text, i) => ({
    '@type': 'HowToStep', position: i + 1, text,
  }))

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: `How to practise ${a.english}${a.sanskrit ? ` (${a.sanskrit})` : ''}`,
        description,
        ...(imgUrl ? { image: { '@type': 'ImageObject', url: imgUrl } } : {}),
        ...(a.durationSeconds ? { totalTime: `PT${Math.round(a.durationSeconds)}S` } : {}),
        ...(steps.length ? { step: steps } : {}),
        supply: [], tool: [],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Yoga poses', item: `${SITE}/poses/` },
          { '@type': 'ListItem', position: 3, name: a.english, item: canonical },
        ],
      },
    ],
  }

  const doshaRows = ['vata', 'pitta', 'kapha'].map((d) => {
    const e = effectOf(a.doshaAffinity?.[d])
    return `          <tr>
            <th scope="row">${titleCase(d)}</th>
            <td><span class="d-tag d-${e.cls}">${e.label}</span></td>
            <td>${esc(e.note)}</td>
          </tr>`
  }).join('\n')

  const list = (items, cls = '') => (items && items.length)
    ? `<ul class="${cls}">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''

  const sourceLine = a.source
    ? `${a.source.text === 'HYP' ? 'Hatha Yoga Pradipika' : a.source.text === 'GS' ? 'Gheranda Samhita' : 'Modern hatha'}${a.source.verse ? ` ${esc(a.source.verse)}` : ''}${a.source.note ? ` — ${esc(a.source.note)}` : ''}`
    : null

  return head({ title, description, canonical, image: imgUrl, jsonld }) + `
<main>
  <div class="wrap pose-page">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">/</span>
      <a href="/poses/">Poses</a> <span aria-hidden="true">/</span>
      <span aria-current="page">${esc(a.english)}</span>
    </nav>

    <article>
      <header class="pose-head">
        <p class="kicker">${esc(titleCase(a.category || 'pose'))} · ${esc(titleCase(a.level || ''))}</p>
        <h1>${esc(a.english)}</h1>
        <p class="pose-names">${names.map((n) => `<span>${esc(n)}</span>`).join('<span class="sep">·</span>')}</p>
        ${a.aliases && a.aliases.length ? `<p class="pose-alias">Also called: ${esc(a.aliases.join(', '))}</p>` : ''}
      </header>

      ${img ? `<img class="pose-hero" src="/assets/poses/${esc(img)}"
             alt="${esc(a.english)}${a.sanskrit ? ` (${esc(a.sanskrit)})` : ''} demonstrated"
             width="840" height="840" loading="eager">` : ''}

      ${a.reasoning ? `<p class="pose-lede">${esc(a.reasoning)}</p>` : ''}

      ${a.benefits?.length ? `<section>
        <h2>Benefits</h2>
        ${list(a.benefits)}
      </section>` : ''}

      ${a.instructions?.length ? `<section>
        <h2>How to practise ${esc(a.english)}</h2>
        <ol class="pose-steps">${a.instructions.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
        ${a.durationSeconds ? `<p class="pose-hold">Suggested hold: ${Math.round(a.durationSeconds)}s${a.breathPattern ? ` · Breath: ${esc(titleCase(a.breathPattern))}` : ''}</p>` : ''}
      </section>` : ''}

      <section>
        <h2>How ${esc(a.english)} affects your doshas</h2>
        <p class="pose-note">In Ayurveda the same pose lands differently depending on
           your constitution. This is the lens the app uses to sequence your practice.</p>
        <table class="dosha-table">
          <caption class="sr-only">Effect of ${esc(a.english)} on each dosha</caption>
          <thead><tr><th scope="col">Dosha</th><th scope="col">Effect</th><th scope="col">Notes</th></tr></thead>
          <tbody>
${doshaRows}
          </tbody>
        </table>
        ${a.bodyParts?.length ? `<p class="pose-meta"><strong>Body focus:</strong> ${esc(a.bodyParts.map(titleCase).join(', '))}</p>` : ''}
      </section>

      ${a.contraindications?.length ? `<section class="pose-safety">
        <h2>Who should avoid or modify this pose</h2>
        ${list(a.contraindications)}
        <p class="pose-note">If you're pregnant, injured, or managing a condition,
           check with a qualified teacher or clinician before practising.</p>
      </section>` : ''}

      ${a.modifications?.length ? `<section>
        <h2>Modifications</h2>
        ${list(a.modifications)}
      </section>` : ''}

      ${sourceLine ? `<p class="pose-source"><strong>Traditional source:</strong> ${sourceLine}</p>` : ''}

${ctaBlock(a)}

      ${related.length ? `<section>
        <h2>Related poses</h2>
        <ul class="pose-related">
          ${related.map((r) => `<li><a href="/poses/${slugOf(r)}">${esc(r.english)}<span>${esc(r.sanskrit || '')}</span></a></li>`).join('')}
        </ul>
      </section>` : ''}
    </article>
  </div>
</main>
` + footer()
}

// ── Index page ──────────────────────────────────────────────────────────────
function indexPage(byCategory) {
  const total = asanas.length
  const title = `Yoga pose library — ${total} asanas with benefits & dosha effects | The Sanctuary`
  const description = `Browse ${total} yoga asanas: step-by-step instructions, benefits, contraindications, and how each pose affects vata, pitta and kapha.`
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Yoga pose library',
    description,
    url: `${SITE}/poses/`,
  }

  const sections = Object.keys(byCategory).sort().map((cat) => `
      <section>
        <h2 id="${slugify(cat)}">${esc(titleCase(cat))} <span class="cat-count">${byCategory[cat].length}</span></h2>
        <ul class="pose-grid">
          ${byCategory[cat].map((a) => {
            const img = imageFor(a.poseKey)
            return `<li><a href="/poses/${slugOf(a)}">
              ${img ? `<img src="/assets/poses/${esc(img)}" alt="" width="120" height="120" loading="lazy">` : '<span class="pose-thumb-blank" aria-hidden="true"></span>'}
              <span class="pose-grid-name">${esc(a.english)}</span>
              <span class="pose-grid-sans">${esc(a.sanskrit || '')}</span>
            </a></li>`
          }).join('')}
        </ul>
      </section>`).join('')

  return head({ title, description, canonical: `${SITE}/poses/`, jsonld }) + `
<main>
  <div class="wrap pose-index">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">/</span>
      <span aria-current="page">Poses</span>
    </nav>
    <p class="kicker">Pose library</p>
    <h1>${total} yoga poses, explained.</h1>
    <p class="sub">Every asana with instructions, benefits, contraindications —
       and how it affects each dosha. <a href="/quiz">Find your dosha →</a></p>
${sections}
  </div>
</main>
` + footer()
}

// ── Related-pose picker (same category first, then shared tags) ─────────────
function relatedFor(a) {
  const tags = new Set(a.tags || [])
  const scored = asanas
    .filter((o) => o.id !== a.id)
    .map((o) => {
      let score = 0
      if (o.category === a.category) score += 3
      ;(o.tags || []).forEach((t) => { if (tags.has(t)) score += 1 })
      if (o.level === a.level) score += 0.5
      return { o, score }
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
  return scored.slice(0, 6).map((x) => x.o)
}

// ── Build ───────────────────────────────────────────────────────────────────
await mkdir(OUT_DIR, { recursive: true })
await mkdir(IMG_OUT, { recursive: true })

// Copy only the images actually referenced (keeps website/ lean).
let copied = 0, missing = 0
for (const a of asanas) {
  const file = imageFor(a.poseKey)
  if (!file) { missing++; continue }
  const src = join(REPO, 'public', 'poses', file)
  if (!existsSync(src)) { missing++; continue }
  await copyFile(src, join(IMG_OUT, file))
  copied++
}

const byCategory = {}
for (const a of asanas) {
  const cat = a.category || 'other'
  ;(byCategory[cat] ||= []).push(a)
}
Object.values(byCategory).forEach((list) =>
  list.sort((x, y) => x.english.localeCompare(y.english)))

for (const a of asanas) {
  await writeFile(join(OUT_DIR, `${slugOf(a)}.html`), posePage(a, relatedFor(a)), 'utf8')
}
await writeFile(join(OUT_DIR, 'index.html'), indexPage(byCategory), 'utf8')

// ── Sitemap (regenerated wholesale so it can't drift) ───────────────────────
const staticUrls = [
  { loc: `${SITE}/`, priority: '1.0' },
  { loc: `${SITE}/de/`, priority: '0.9' },
  { loc: `${SITE}/hi/`, priority: '0.9' },
  { loc: `${SITE}/quiz`, priority: '0.9' },
  { loc: `${SITE}/de/quiz`, priority: '0.8' },
  { loc: `${SITE}/hi/quiz`, priority: '0.8' },
  { loc: `${SITE}/poses/`, priority: '0.8' },
  { loc: `${SITE}/support`, priority: '0.6' },
  { loc: `${SITE}/privacy`, priority: '0.3' },
  { loc: `${SITE}/terms`, priority: '0.3' },
]
const poseUrls = asanas
  .map((a) => ({ loc: `${SITE}/poses/${slugOf(a)}`, priority: '0.7' }))
  .sort((a, b) => a.loc.localeCompare(b.loc))

await writeFile(
  join(REPO, 'website', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<!-- Generated by scripts/build-pose-pages.mjs — do not edit by hand. -->\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  [...staticUrls, ...poseUrls]
    .map((u) => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`)
    .join('\n') +
  `\n</urlset>\n`,
  'utf8'
)

console.log(`✓ ${asanas.length} pose pages + index → website/poses/`)
console.log(`✓ ${copied} images → website/assets/poses/${missing ? `  (${missing} without an image)` : ''}`)
console.log(`✓ sitemap.xml — ${staticUrls.length + poseUrls.length} URLs`)
