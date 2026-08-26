// ─────────────────────────────────────────────────────────────────────────────
//  build-guides.mjs — long-form guides (website /guides)
//
//  Zero-build, same as the food/pose generators: emits static HTML into
//  website/guides/. Content lives in scripts/guides-data.mjs (shared with the
//  sitemap builder). Each guide carries Article + FAQPage + BreadcrumbList
//  JSON-LD and links down into the food pages, dosha hubs and quiz.
//
//  Run: node scripts/build-guides.mjs   (also part of `npm run web:pages`)
// ─────────────────────────────────────────────────────────────────────────────

import { writeFile, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GUIDES } from './guides-data.mjs'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(REPO, 'website', 'guides')
const SITE = 'https://www.thesanctuaryteam.com'

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

// Paragraphs may carry intentional inline <a>/<em>; escape the TEXT but keep
// those two tags. Simple + safe because the source is our own authored data.
const para = (s) => String(s)
  .replace(/&(?!(amp|lt|gt|quot|#39);)/g, '&amp;')
  .replace(/<(?!\/?(a|em)\b)/g, '&lt;')

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
${(Array.isArray(jsonld) ? jsonld : jsonld ? [jsonld] : [])
    .map((j) => `  <script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
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
      <a href="/guides/">Guides</a>
      <a href="/quiz">Dosha quiz</a>
      <a href="/support">Support</a>
    </nav>
  </div>
</header>
`

const footer = () => `
<footer>
  <div class="wrap">
    <p>© The Sanctuary — general wellness &amp; education rooted in yoga and Ayurveda. Not medical advice.</p>
    <p class="foot-links"><a href="/">Home</a> · <a href="/guides/">Guides</a> · <a href="/quiz">Dosha quiz</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p>
  </div>
</footer>
</body>
</html>
`

function guidePage(g) {
  const canonical = `${SITE}/guides/${g.slug}`
  const sections = g.sections.map((s) => `      <section>
        <h2>${esc(s.h2)}</h2>
        ${s.body.map((p) => `<p>${para(p)}</p>`).join('\n        ')}
        ${s.links?.length ? `<p class="guide-links">${s.links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join(' · ')}</p>` : ''}
      </section>`).join('\n')

  const faqBlock = g.faqs?.length ? `
    <section class="guide-faq">
      <h2>Common questions</h2>
      ${g.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${para(f.a)}</p>`).join('\n      ')}
    </section>` : ''

  const relatedBlock = g.related?.length ? `
    <aside class="pose-cta">
      <p class="section-kicker">Keep reading</p>
      <ul class="pose-related">
        ${g.related.map((r) => `<li><a href="${esc(r.href)}">${esc(r.label)}</a></li>`).join('')}
      </ul>
      <p class="cta-note"><a href="/quiz">Take the dosha quiz →</a></p>
    </aside>` : ''

  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: g.h1,
      description: g.description, datePublished: g.updated, dateModified: g.updated,
      mainEntityOfPage: canonical,
      author: { '@type': 'Organization', name: 'The Sanctuary' },
      publisher: { '@type': 'Organization', name: 'The Sanctuary' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE}/guides/` },
      { '@type': 'ListItem', position: 3, name: g.h1, item: canonical },
    ] },
    ...(g.faqs?.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: g.faqs.map((f) => ({ '@type': 'Question', name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : []),
  ]

  return head({ title: g.title, description: g.description, canonical, jsonld }) + `
<main>
  <div class="wrap pose-page">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">/</span>
      <a href="/guides/">Guides</a> <span aria-hidden="true">/</span>
      <span aria-current="page">${esc(g.h1)}</span>
    </nav>
    <article>
      <header class="pose-head">
        <p class="kicker">${esc(g.kicker)} · ${g.readingMins} min read</p>
        <h1>${esc(g.h1)}</h1>
        ${g.intro.map((p) => `<p class="sub">${para(p)}</p>`).join('\n        ')}
      </header>
${sections}${faqBlock}${relatedBlock}
    </article>
  </div>
</main>
` + footer()
}

function hubPage() {
  const canonical = `${SITE}/guides/`
  const title = 'Ayurveda guides — doshas, tastes & eating for balance | The Sanctuary'
  const description = 'Plain-English guides to Ayurveda: what your dosha is, the six tastes, and how to eat for Vata, Pitta and Kapha.'
  const jsonld = { '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: 'Ayurveda guides', url: canonical, description }
  const items = GUIDES.map((g) => `        <li><a href="/guides/${g.slug}">${esc(g.h1)}<span>${esc(g.description)}</span></a></li>`).join('\n')
  return head({ title, description, canonical, jsonld }) + `
<main>
  <div class="wrap pose-page">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">/</span>
      <span aria-current="page">Guides</span>
    </nav>
    <header class="pose-head">
      <p class="kicker">Ayurveda guides</p>
      <h1>Understand it, then eat for it</h1>
      <p class="sub">Start with the ideas, then put them on your plate. <a href="/quiz">Find your dosha →</a></p>
    </header>
    <section>
      <ul class="pose-related">
${items}
      </ul>
    </section>
  </div>
</main>
` + footer()
}

// ── Emit ────────────────────────────────────────────────────────────────────
if (existsSync(OUT_DIR)) await rm(OUT_DIR, { recursive: true, force: true })
await mkdir(OUT_DIR, { recursive: true })

const slugs = new Set()
for (const g of GUIDES) {
  if (slugs.has(g.slug)) throw new Error(`Duplicate guide slug "${g.slug}"`)
  slugs.add(g.slug)
  await writeFile(join(OUT_DIR, `${g.slug}.html`), guidePage(g), 'utf8')
}
await writeFile(join(OUT_DIR, 'index.html'), hubPage(), 'utf8')

console.log(`✓ ${GUIDES.length} guides + hub → website/guides/`)
