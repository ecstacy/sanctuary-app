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
const { REVIEWED_INGREDIENTS, foodSuitability, VIRUDDHA_PAIRINGS, VIRUDDHA_NOTES,
        SEASON_GUIDANCE, reviewedSeasons, seasonalFoods } = await (async () => {
  const bundled = await esbuild.build({
    stdin: {
      contents:
        `export { REVIEWED_INGREDIENTS } from './src/lib/ingredients.js'\n` +
        `export { foodSuitability } from './src/lib/doshaSemantics.js'\n` +
        `export { VIRUDDHA_PAIRINGS, VIRUDDHA_NOTES } from './src/data/ayurveda/viruddhaAhara.js'\n` +
        `export { SEASON_GUIDANCE, reviewedSeasons, seasonalFoods } from './src/data/ayurveda/rtucharya.js'\n`,
      resolveDir: REPO, loader: 'js',
    },
    bundle: true, format: 'cjs', platform: 'node', write: false, logLevel: 'silent',
  })
  const mod = { exports: {} }
  new Function('module', 'exports', 'require', bundled.outputFiles[0].text)(mod, mod.exports, require)
  return mod.exports
})()

// Reviewed-only viruddha content — the /food-combinations guide reads ONLY this,
// so nothing ships publicly until a human signs off in the review doc.
const REVIEWED_PAIRINGS = VIRUDDHA_PAIRINGS.filter((p) => p.reviewStatus === 'reviewed')
const REVIEWED_VNOTES = VIRUDDHA_NOTES.filter((n) => n.reviewStatus === 'reviewed')

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

// Resolve balancedBy ids → their reviewed entry, so pairings link to their page.
const BY_ID = new Map(REVIEWED_INGREDIENTS.map((x) => [x.id, x]))
// Classical text a citation points at — the authority signal generic food sites lack.
const SOURCE_LABEL = { CS: 'Charaka Saṃhitā', SS: 'Suśruta Saṃhitā', AH: 'Aṣṭāṅga Hṛdaya' }

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
  <link rel="stylesheet" href="/assets/style.css?v=3">
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

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Ayurvedic food guide', item: `${SITE}/foods/` },
      { '@type': 'ListItem', position: 3, name: f.name, item: canonical },
    ],
  }

  // FAQPage — these pages ARE questions ("is X good for pitta?"). Structuring
  // the three dosha verdicts (which are already in the on-page table) as an
  // FAQPage targets Google's FAQ rich result + "People also ask". Answers
  // mirror the visible verdicts exactly, as the guidelines require.
  const faqAnswer = (d) => {
    const note = verdictNote(foodSuitability(f.doshaEffect?.[d]), d)
    const why = f.whyFavor || f.whyAvoid
    return why ? `${note} ${why}`.trim() : note   // JSON.stringify escapes; no HTML esc inside JSON-LD
  }
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      ...['vata', 'pitta', 'kapha'].map((d) => ({
        '@type': 'Question',
        name: `Is ${f.name} good for ${titleCase(d)}?`,
        acceptedAnswer: { '@type': 'Answer', text: faqAnswer(d) },
      })),
      {
        '@type': 'Question',
        name: `What are the Ayurvedic properties of ${f.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${f.name} has a ${(f.rasa || []).join(', ')} taste and a ${VIRYA_LABEL[f.virya] || f.virya} potency (vīrya)`
            + (f.guna?.length ? `, with ${f.guna.join(', ')} qualities` : '') + '.',
        },
      },
    ],
  }
  const jsonld = [breadcrumb, faq]

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

      ${f.preparation ? `<section>
        <h2>How to prepare ${esc(f.name)}</h2>
        <p>${esc(f.preparation)}</p>
      </section>` : ''}

      ${(() => {
        const companions = (f.balancedBy || []).map((id) => BY_ID.get(id)).filter(Boolean)
        return companions.length ? `<section>
        <h2>Traditionally balanced with</h2>
        <p class="pose-note">Classical pairings that make ${esc(f.name)} easier to digest or more balancing for the doshas.</p>
        <ul class="related-list">${companions.map((c) => `<li><a href="/foods/${foodSlug(c)}">${esc(c.name)}</a></li>`).join('')}</ul>
      </section>` : ''
      })()}

      ${f.source?.verse && SOURCE_LABEL[f.source.text] ? `<section>
        <h2>In the classical texts</h2>
        <p>${esc(f.name)} is attested in the <strong>${esc(SOURCE_LABEL[f.source.text])}</strong> (${esc(f.source.verse)})${f.source.note ? ` — ${esc(f.source.note)}` : ''}.</p>
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
  const description = `Browse ${total} foods with their taste, potency, and how each affects vata, pitta and kapha — filter by category or by the dosha you want to calm.`
  const byCat = {}
  foods.forEach((f) => { (byCat[f.category] ||= []).push(f) })
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Ayurvedic food guide',
    url: `${SITE}/foods/`,
    description,
  }

  // Category chips, in display order, with counts — only non-empty buckets.
  const catChips = CATEGORY_ORDER.filter((c) => byCat[c]).map((c) =>
    `<button type="button" class="chip" data-cat="${c}">${esc(CATEGORY_LABEL[c])} <span class="chip-n">${byCat[c].length}</span></button>`).join('')

  // Every food as a filterable card, sorted alphabetically. data-* carry the
  // dosha effect (sign-safe: -1 calms / +1 aggravates) so the dosha chips can
  // filter without re-deriving anything.
  const eff = (f, d) => (f.doshaEffect?.[d] ?? 0)
  const cards = foods.slice().sort((a, b) => a.name.localeCompare(b.name)).map((f) =>
    `<a class="food-card" href="/foods/${foodSlug(f)}" data-name="${esc(f.name.toLowerCase())}" data-cat="${esc(f.category)}" data-v="${eff(f, 'vata')}" data-p="${eff(f, 'pitta')}" data-k="${eff(f, 'kapha')}">${esc(f.name)}<span>${esc((f.rasa || []).map(titleCase).join(', '))}${f.virya ? ` · ${esc(f.virya)}` : ''}</span></a>`).join('')

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
    <section>
      <h2>Best foods by dosha</h2>
      <ul class="pose-related">
        <li><a href="/foods/for-vata">Best foods for Vata<span>Warm, moist, grounding</span></a></li>
        <li><a href="/foods/for-pitta">Best foods for Pitta<span>Cool, sweet, calming</span></a></li>
        <li><a href="/foods/for-kapha">Best foods for Kapha<span>Light, warm, pungent</span></a></li>
      </ul>
    </section>

    <section>
      <h2>Browse all foods</h2>
      <div class="lib-filters" id="foodFilters">
        <input type="search" class="lib-search" id="foodSearch" placeholder="Search foods…" aria-label="Search foods" autocomplete="off">
        <div class="chip-row" role="group" aria-label="Filter by dosha">
          <button type="button" class="chip chip-dosha" data-dosha="v">Calms Vata</button>
          <button type="button" class="chip chip-dosha" data-dosha="p">Calms Pitta</button>
          <button type="button" class="chip chip-dosha" data-dosha="k">Calms Kapha</button>
        </div>
        <div class="chip-row" role="group" aria-label="Filter by category">
          <button type="button" class="chip on" data-cat="">All <span class="chip-n">${total}</span></button>
          ${catChips}
        </div>
      </div>
      <p class="lib-count" id="foodCount" aria-live="polite">${total} foods</p>
      <div class="food-grid" id="foodGrid">
        ${cards}
      </div>
      <p class="lib-empty" id="foodEmpty" hidden>No foods match those filters. <button type="button" class="linklike" id="foodReset">Clear filters</button></p>
    </section>
  </div>
</main>
<script>
(function () {
  var grid = document.getElementById('foodGrid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.food-card'));
  var search = document.getElementById('foodSearch');
  var countEl = document.getElementById('foodCount');
  var emptyEl = document.getElementById('foodEmpty');
  var state = { q: '', cat: '', dosha: '' };

  function apply() {
    var q = state.q, shown = 0;
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var ok = (!q || c.getAttribute('data-name').indexOf(q) !== -1)
        && (!state.cat || c.getAttribute('data-cat') === state.cat)
        && (!state.dosha || parseInt(c.getAttribute('data-' + state.dosha), 10) < 0);
      c.hidden = !ok;
      if (ok) shown++;
    }
    countEl.textContent = shown + (shown === 1 ? ' food' : ' foods');
    emptyEl.hidden = shown !== 0;
  }
  function setActive(row, btn) {
    row.querySelectorAll('.chip').forEach(function (b) { b.classList.remove('on'); });
    if (btn) btn.classList.add('on');
  }

  if (search) search.addEventListener('input', function () { state.q = this.value.trim().toLowerCase(); apply(); });
  document.querySelectorAll('#foodFilters [data-cat]').forEach(function (btn) {
    btn.addEventListener('click', function () { state.cat = btn.getAttribute('data-cat'); setActive(btn.parentNode, btn); apply(); });
  });
  document.querySelectorAll('#foodFilters [data-dosha]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var d = btn.getAttribute('data-dosha');
      if (state.dosha === d) { state.dosha = ''; btn.classList.remove('on'); }
      else { state.dosha = d; setActive(btn.parentNode, btn); }
      apply();
    });
  });
  var reset = document.getElementById('foodReset');
  if (reset) reset.addEventListener('click', function () {
    state = { q: '', cat: '', dosha: '' };
    if (search) search.value = '';
    document.querySelectorAll('#foodFilters .chip').forEach(function (b) { b.classList.remove('on'); });
    var all = document.querySelector('#foodFilters [data-cat=""]'); if (all) all.classList.add('on');
    apply();
  });
})();
</script>
` + footer()
}

// ── Per-dosha hub ("best foods for pitta") ──────────────────────────────────
// The three highest-volume queries in the niche, built by filtering the corpus
// on each food's suitability — pure dataset leverage, and a linked cluster
// around the food pages.
const DOSHA_INTRO = {
  vata:  'Vata is dry, light, cold and mobile. To calm it, favour warm, moist, grounding and lightly oily foods — and ease off dry, cold, raw and airy ones.',
  pitta: 'Pitta is hot, sharp, oily and intense. To cool it, favour cooling, sweet and mildly bitter or astringent foods — and ease off hot, sour, salty and fried ones.',
  kapha: 'Kapha is heavy, cold, oily and stable. To lighten it, favour light, warm, dry and pungent foods — and ease off heavy, sweet, cold and oily ones.',
}

function doshaHubPage(dosha, foods) {
  const D = titleCase(dosha)
  const favour = foods.filter((f) => foodSuitability(f.doshaEffect?.[dosha]) === 'balancing')
  const easeOff = foods.filter((f) => foodSuitability(f.doshaEffect?.[dosha]) === 'caution')
  const canonical = `${SITE}/foods/for-${dosha}`
  const title = `Best foods for ${D} — what to favour & avoid (Ayurveda) | The Sanctuary`
  const description = `${favour.length} foods that calm ${D} and ${easeOff.length} to ease off, from the classical Ayurvedic lens — grouped by taste, potency and how each affects the doshas.`
  const eg = (arr) => arr.slice(0, 8).map((f) => f.name).join(', ')

  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `Best foods for ${D}`, url: canonical, description },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: `What foods are good for ${D}?`, acceptedAnswer: { '@type': 'Answer', text: `${DOSHA_INTRO[dosha]} Foods that calm ${D} include ${eg(favour)}.` } },
        { '@type': 'Question', name: `What foods aggravate ${D}?`, acceptedAnswer: { '@type': 'Answer', text: `Go easy on foods that raise ${D}, such as ${eg(easeOff)}.` } },
      ],
    },
  ]

  const groupList = (arr) => CATEGORY_ORDER.filter((c) => arr.some((f) => f.category === c)).map((c) => {
    const items = arr.filter((f) => f.category === c).sort((a, b) => a.name.localeCompare(b.name))
    return `      <section>
        <h3>${esc(CATEGORY_LABEL[c])}</h3>
        <ul class="pose-related">
          ${items.map((f) => `<li><a href="/foods/${foodSlug(f)}">${esc(f.name)}<span>${esc((f.rasa || []).map(titleCase).join(', '))} · ${esc(f.virya)}</span></a></li>`).join('')}
        </ul>
      </section>`
  }).join('\n')

  return head({ title, description, canonical, jsonld }) + `
<main>
  <div class="wrap pose-page">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">/</span>
      <a href="/foods/">Foods</a> <span aria-hidden="true">/</span>
      <span aria-current="page">For ${esc(D)}</span>
    </nav>
    <header class="pose-head">
      <p class="kicker">Ayurvedic food guide</p>
      <h1>Best foods for ${esc(D)}</h1>
      <p class="pose-lede">${esc(DOSHA_INTRO[dosha])}</p>
      <p class="pose-note">These lists come from the same reviewed dataset the app uses.
         Your ideal plate depends on your whole constitution and the season — <a href="/quiz">find your dosha →</a>.</p>
    </header>

    <article>
      <section>
        <h2>Foods that calm ${esc(D)} <span class="count">(${favour.length})</span></h2>
${groupList(favour)}
      </section>

      ${easeOff.length ? `<section class="pose-safety">
        <h2>Go easy on these when ${esc(D)} is high <span class="count">(${easeOff.length})</span></h2>
${groupList(easeOff)}
      </section>` : ''}

      <aside class="pose-cta">
        <p class="section-kicker">Eat for your ${esc(D)}</p>
        <h2>Personalised in the app.</h2>
        <p>The Sanctuary composes daily meals around your dosha and the season — not a generic list.</p>
        <p class="cta-note"><a href="/foods/">← Browse all foods</a> &nbsp;·&nbsp; <a href="/quiz">Take the dosha quiz →</a></p>
      </aside>
    </article>
  </div>
</main>
` + footer()
}

// ── Food-combinations guide (viruddha āhāra) ────────────────────────────────
// Reviewed pairings only. Answers "can I eat X with Y" — a query cluster generic
// food sites don't cover. Emitted only when there IS reviewed content.
const SEVERITY_LABEL = {
  classical: 'Classical', traditional: 'Traditional', modern: 'Modern application',
}
function combinationsPage() {
  const canonical = `${SITE}/food-combinations`
  const title = 'Ayurvedic food combinations to avoid (viruddha āhāra) | The Sanctuary'
  const description = `${REVIEWED_PAIRINGS.length} incompatible food combinations from the classical Ayurvedic texts — milk with fish, honey heated, curd with fruit — with why, and a safer alternative for each.`
  const cite = (s) => s?.text ? ` <span class="src">— ${esc(SOURCE_LABEL[s.text] || s.text)}${s.verse ? ` ${esc(s.verse)}` : ''}</span>` : ''

  const pairItems = REVIEWED_PAIRINGS.map((p) => `      <article class="combo">
        <h3>${esc(p.a)} + ${esc(p.b)} <span class="sev sev-${p.severity}">${esc(SEVERITY_LABEL[p.severity] || p.severity)}</span></h3>
        <p>${esc(p.reason)}${cite(p.source)}</p>
        <p class="swap"><strong>Instead:</strong> ${esc(p.saferSwap)}</p>
      </article>`).join('\n')

  const noteItems = REVIEWED_VNOTES.map((n) => `      <article class="combo">
        <h3><span class="sev sev-${n.severity}">${esc(SEVERITY_LABEL[n.severity] || n.severity)}</span></h3>
        <p>${esc(n.reason)}${cite(n.source)}</p>
        <p class="swap"><strong>Instead:</strong> ${esc(n.saferSwap)}</p>
      </article>`).join('\n')

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: REVIEWED_PAIRINGS.slice(0, 10).map((p) => ({
      '@type': 'Question',
      name: `Can you eat ${p.a.toLowerCase()} with ${p.b.toLowerCase()}?`,
      acceptedAnswer: { '@type': 'Answer', text: `${p.reason} ${p.saferSwap}` },
    })),
  }
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Food combinations', item: canonical },
    ],
  }

  return head({ title, description, canonical, jsonld: [breadcrumb, faq] }) + `
<main>
  <div class="wrap pose-page">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">/</span>
      <span aria-current="page">Food combinations</span>
    </nav>
    <header class="pose-head">
      <p class="kicker">Viruddha āhāra</p>
      <h1>Food combinations to avoid</h1>
      <p class="sub">Some foods are wholesome on their own but incompatible together.
         These are the classical Ayurvedic pairings to keep apart — and what to do instead.
         <a href="/foods/">Browse all foods →</a></p>
    </header>
    <section>
      <h2>Incompatible pairings</h2>
${pairItems}
    </section>${noteItems ? `
    <section>
      <h2>How &amp; when it's taken</h2>
${noteItems}
    </section>` : ''}
    <aside class="pose-cta">
      <h2>Checked for you, in the app.</h2>
      <p>The Sanctuary flags incompatible combinations in a meal automatically — and composes meals that avoid them.</p>
      <p class="cta-note"><a href="/quiz">Take the dosha quiz →</a></p>
    </aside>
    <p class="disclaimer">General Ayurvedic guidance, not medical advice.</p>
  </div>
</main>
` + footer()
}

// ── Seasonal guide (ṛtucharyā) ──────────────────────────────────────────────
// Reviewed seasons only. Favour/ease-off lists are DERIVED from the season's
// dosha via the already-reviewed foodSuitability — no new food claims.
function seasonalHubPage(season, foods) {
  const g = SEASON_GUIDANCE[season]
  const { favour, easeOff } = seasonalFoods(season, foods)
  const Cap = titleCase(season)
  const canonical = `${SITE}/foods/seasonal/${season}`
  const title = `What to eat in ${Cap} — seasonal Ayurvedic food guide (ṛtucharyā) | The Sanctuary`
  const description = `${g.intro} ${favour.length} foods to favour and ${easeOff.length} to ease off this ${season}.`
  const cite = g.source?.text ? ` <span class="src">— ${esc(SOURCE_LABEL[g.source.text] || g.source.text)}${g.source.verse ? ` ${esc(g.source.verse)}` : ''}</span>` : ''
  const list = (arr) => `<ul class="pose-related">${arr.slice().sort((a, b) => a.name.localeCompare(b.name))
    .map((f) => `<li><a href="/foods/${foodSlug(f)}">${esc(f.name)}<span>${esc((f.rasa || []).map(titleCase).join(', '))} · ${esc(f.virya)}</span></a></li>`).join('')}</ul>`

  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Ayurvedic food guide', item: `${SITE}/foods/` },
      { '@type': 'ListItem', position: 3, name: `Eating in ${Cap}`, item: canonical },
    ] },
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `What to eat in ${Cap}`, url: canonical, description },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What should I eat in ${season}?`, acceptedAnswer: { '@type': 'Answer', text: g.intro } },
    ] },
  ]

  return head({ title, description, canonical, jsonld }) + `
<main>
  <div class="wrap pose-page">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">/</span>
      <a href="/foods/">Foods</a> <span aria-hidden="true">/</span>
      <span aria-current="page">Eating in ${esc(Cap)}</span>
    </nav>
    <header class="pose-head">
      <p class="kicker">Ṛtucharyā · ${esc(g.ritu)}</p>
      <h1>${esc(g.title)}</h1>
      <p class="sub">${esc(g.intro)}${cite}</p>
    </header>
    <section>
      <h2>Favour this ${esc(season)} <span class="count">${favour.length}</span></h2>
      ${list(favour)}
    </section>
    <section>
      <h2>Ease off this ${esc(season)} <span class="count">${easeOff.length}</span></h2>
      ${list(easeOff)}
    </section>
    <aside class="pose-cta">
      <h2>Meals for the season, in the app.</h2>
      <p>The Sanctuary composes daily meals around your dosha AND the season — not a generic list.</p>
      <p class="cta-note"><a href="/foods/">← Browse all foods</a> &nbsp;·&nbsp; <a href="/quiz">Take the dosha quiz →</a></p>
    </aside>
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
for (const dosha of ['vata', 'pitta', 'kapha']) {
  await writeFile(join(OUT_DIR, `for-${dosha}.html`), doshaHubPage(dosha, foods), 'utf8')
}
for (const f of foods) {
  const related = foods.filter((r) => r.category === f.category && r.id !== f.id).slice(0, 6)
  await writeFile(join(OUT_DIR, `${foodSlug(f)}.html`), foodPage(f, related), 'utf8')
}

// Food-combinations guide — only when there is reviewed viruddha content, so
// the page never ships empty or with unreviewed pairings. Lives at the site
// root (/food-combinations), not under /foods/.
if (REVIEWED_PAIRINGS.length > 0) {
  await writeFile(join(REPO, 'website', 'food-combinations.html'), combinationsPage(), 'utf8')
  console.log(`✓ food-combinations guide (${REVIEWED_PAIRINGS.length} pairings, ${REVIEWED_VNOTES.length} notes) → website/food-combinations.html`)
} else {
  console.log(`· food-combinations guide skipped — 0 reviewed viruddha pairings (see docs/diet-review-viruddha-ahara.md)`)
}

// Seasonal guides — only reviewed seasons, so none ship until sign-off.
const seasons = reviewedSeasons()
if (seasons.length > 0) {
  await mkdir(join(OUT_DIR, 'seasonal'), { recursive: true })
  for (const s of seasons) {
    await writeFile(join(OUT_DIR, 'seasonal', `${s}.html`), seasonalHubPage(s, foods), 'utf8')
  }
  console.log(`✓ seasonal guides (${seasons.join(', ')}) → website/foods/seasonal/`)
} else {
  console.log(`· seasonal guides skipped — 0 reviewed seasons (see docs/diet-review-rtucharya.md)`)
}

console.log(`✓ ${foods.length} food pages + hub + 3 dosha hubs → website/foods/`)
