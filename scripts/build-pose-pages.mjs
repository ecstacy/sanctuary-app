#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  build-pose-pages.mjs — generate the /poses SEO library for the website
//
//  Emits static HTML into website/poses/ (+ website/de/poses/, website/hi/poses/)
//  from src/data/asanas.js — the same canonical data the app renders — so the
//  marketing site and the product can never drift apart. Growth-plan §2.2
//  (M3–M4): 76 pages of unique, structured content that compounds in search.
//
//  LOCALIZATION (#39/#58): each pose page is emitted in en/de/hi. English is the
//  canonical data; de/hi text comes from the app's own reviewed content overlays
//  (src/i18n/content/{de,hi}/asanas.json — the same source the app localizes
//  from, so the two can't diverge). Slugs stay English-based and stable across
//  languages (/de/poses/<english-slug>) so hreflang maps cleanly. Structural
//  facts (sanskrit, dosha affinity, images) are shared; only the prose is
//  swapped. Hindi text still passes the human-review gate (#20) before launch.
//
//  WHY A GENERATOR AND NOT ASTRO — the site is zero-build (Cloudflare Pages
//  serves website/ with an empty build command); a generator keeps it that way,
//  outputs committed static HTML, and matches the repo's existing pattern.
//  Re-run after editing asanas.js or the overlays:  npm run poses:pages
//
//  SEO surface per page: <title>/description, canonical + hreflang, OpenGraph,
//  Schema.org HowTo (steps) + ImageObject, breadcrumbs, related-pose links, and
//  the DOSHA AFFINITY table — the moat no generic yoga site has.
// ─────────────────────────────────────────────────────────────────────────────

import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import esbuild from 'esbuild'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dirname, '..')
const SITE = 'https://www.thesanctuaryteam.com'

// ── Load canonical data (asanas.js imports a Vite-only specifier, so bundle
//    it in-memory with esbuild first — same trick as generate-voice.mjs) ──
const { ASANAS, IMAGE_FILES, getDoshaTag, REVIEWED_INGREDIENTS } = await (async () => {
  const bundled = await esbuild.build({
    stdin: {
      contents:
        `export { ASANAS, getDoshaTag } from './src/data/asanas.js'\n` +
        `export { IMAGE_FILES } from './src/data/poseManifest.js'\n` +
        `export { REVIEWED_INGREDIENTS } from './src/lib/ingredients.js'\n`,
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

// ── Languages + content overlays ────────────────────────────────────────────
const LANGS = ['en', 'de', 'hi']
const prefix = (lang) => (lang === 'en' ? '' : `/${lang}`)
const FLAG = { en: '🇬🇧 EN', de: '🇩🇪 DE', hi: '🇮🇳 HI' }

const OVERLAYS = { en: null }
for (const l of ['de', 'hi']) {
  OVERLAYS[l] = JSON.parse(await readFile(join(REPO, 'src/i18n/content', l, 'asanas.json'), 'utf8'))
}

// Merge the localized prose overlay over a canonical asana. Structural fields
// (sanskrit, doshaAffinity, category, level, poseKey, images…) stay from the
// base; only translatable text is swapped, falling back to English per-field.
function localizeAsana(a, lang) {
  if (lang === 'en') return a
  const o = OVERLAYS[lang]?.asanas?.[a.id]
  if (!o) return a
  return {
    ...a,
    english: o.english || a.english,
    aliases: o.aliases || a.aliases,
    benefits: o.benefits || a.benefits,
    instructions: o.instructions || a.instructions,
    contraindications: o.contraindications || a.contraindications,
    modifications: o.modifications || a.modifications,
    reasoning: o.reasoning || a.reasoning,
    source: o.source ? { ...a.source, ...o.source } : a.source,
  }
}

const CATEGORY_LABELS = {
  de: { backbend: 'Rückbeuge', balance: 'Gleichgewicht', forward_fold: 'Vorwärtsbeuge', inversion: 'Umkehrhaltung', restorative: 'Regenerativ', seated: 'Sitzend', sequence: 'Abfolge', standing: 'Stehend', supine: 'Rückenlage', twist: 'Drehung' },
  hi: { backbend: 'पश्च-मोड़', balance: 'संतुलन', forward_fold: 'अग्र-मोड़', inversion: 'उल्टी मुद्रा', restorative: 'विश्रामदायक', seated: 'बैठकर', sequence: 'अनुक्रम', standing: 'खड़े होकर', supine: 'पीठ के बल', twist: 'मरोड़' },
}
const LEVEL_LABELS = {
  de: { beginner: 'Anfänger', intermediate: 'Mittelstufe', advanced: 'Fortgeschritten' },
  hi: { beginner: 'प्रारंभिक', intermediate: 'मध्यम', advanced: 'उन्नत' },
}
const catLabel = (cat, lang) => CATEGORY_LABELS[lang]?.[cat] || titleCase(cat)
const levelLabel = (lv, lang) => LEVEL_LABELS[lang]?.[String(lv || '').toLowerCase()] || titleCase(lv)

// UI strings (chrome + section headings). Functions where interpolation is
// needed. Dosha names (Vata/Pitta/Kapha) stay Latin across languages, as the
// app does.
const UI = {
  en: {
    langLabel: 'Language', crumbHome: 'Home', crumbPoses: 'Poses',
    nav: { foods: 'Foods', poses: 'Poses', quiz: 'Dosha quiz', support: 'Support' },
    footer: { foodGuide: 'Food guide', poseLibrary: 'Pose library', quiz: 'Dosha quiz', support: 'Support', privacy: 'Privacy', terms: 'Terms', copyright: '© 2026 The Sanctuary. Yoga is a practice, not a prescription — see a professional for medical concerns.' },
    benefits: 'Benefits', howTo: (n) => `How to practise ${n}`,
    hold: (s, b) => `Suggested hold: ${s}s${b ? ` · Breath: ${b}` : ''}`,
    affects: (n) => `How ${n} affects your doshas`,
    poseNote: 'In Ayurveda the same pose lands differently depending on your constitution. This is the lens the app uses to sequence your practice.',
    tblDosha: 'Dosha', tblEffect: 'Effect', tblNotes: 'Notes', tblCaption: (n) => `Effect of ${n} on each dosha`,
    bodyFocus: 'Body focus:', whoAvoid: 'Who should avoid or modify this pose',
    safetyNote: "If you're pregnant, injured, or managing a condition, check with a qualified teacher or clinician before practising.",
    modifications: 'Modifications', traditionalSource: 'Traditional source:', relatedPoses: 'Related poses', alsoCalled: 'Also called:',
    ctaKicker: 'Practise it properly', ctaTitle: 'Guided, in the app.',
    ctaBody: (n) => `${n} with video, voice guidance, and a daily practice composed around your dosha — not a generic playlist.`,
    playAria: 'Get The Sanctuary on Google Play', ctaNote: 'Not sure of your dosha? Take the 1-minute quiz →',
    effectNote: { Balancing: 'a good fit — helps settle this dosha', Neutral: 'broadly neutral', Caution: 'can aggravate this dosha — practise sparingly' },
    titleSuffix: 'benefits, steps & dosha effects | The Sanctuary',
    metaDesc: (n, s, fb) => `How to practise ${n}${s ? ` (${s})` : ''}: step-by-step instructions, benefits, contraindications, and how it affects vata, pitta and kapha. ${fb}`,
    idxTitle: (t) => `Yoga pose library — ${t} asanas with benefits & dosha effects | The Sanctuary`,
    idxDesc: (t) => `Browse ${t} yoga asanas: step-by-step instructions, benefits, contraindications, and how each pose affects vata, pitta and kapha.`,
    idxH1: (t) => `${t} yoga poses, explained.`,
    idxSub: 'Every asana with instructions, benefits, contraindications — and how it affects each dosha.', findDosha: 'Find your dosha →',
  },
  de: {
    langLabel: 'Sprache', crumbHome: 'Start', crumbPoses: 'Haltungen',
    nav: { foods: 'Ernährung', poses: 'Haltungen', quiz: 'Dosha-Quiz', support: 'Support' },
    footer: { foodGuide: 'Ernährungsguide', poseLibrary: 'Haltungsbibliothek', quiz: 'Dosha-Quiz', support: 'Support', privacy: 'Datenschutz', terms: 'AGB', copyright: '© 2026 The Sanctuary. Yoga ist eine Praxis, keine Verordnung — wende dich bei gesundheitlichen Anliegen an Fachleute.' },
    benefits: 'Vorteile', howTo: (n) => `So übst du ${n}`,
    hold: (s, b) => `Empfohlene Haltedauer: ${s}s${b ? ` · Atem: ${b}` : ''}`,
    affects: (n) => `Wie ${n} deine Doshas beeinflusst`,
    poseNote: 'Im Ayurveda wirkt dieselbe Haltung je nach Konstitution unterschiedlich. Das ist die Linse, mit der die App deine Praxis zusammenstellt.',
    tblDosha: 'Dosha', tblEffect: 'Wirkung', tblNotes: 'Hinweise', tblCaption: (n) => `Wirkung von ${n} auf jedes Dosha`,
    bodyFocus: 'Körperfokus:', whoAvoid: 'Wer diese Haltung meiden oder anpassen sollte',
    safetyNote: 'Wenn du schwanger oder verletzt bist oder eine Erkrankung hast, sprich vor dem Üben mit einer qualifizierten Lehrkraft oder Fachperson.',
    modifications: 'Anpassungen', traditionalSource: 'Traditionelle Quelle:', relatedPoses: 'Verwandte Haltungen', alsoCalled: 'Auch genannt:',
    ctaKicker: 'Übe es richtig', ctaTitle: 'Geführt, in der App.',
    ctaBody: (n) => `${n} mit Video, Sprachführung und einer täglichen Praxis, die um dein Dosha komponiert ist — keine generische Playlist.`,
    playAria: 'Hol dir The Sanctuary bei Google Play', ctaNote: 'Unsicher, welches Dosha? Mach den 1-Minuten-Test →',
    effectNote: { Balancing: 'gut geeignet — hilft, dieses Dosha zu beruhigen', Neutral: 'weitgehend neutral', Caution: 'kann dieses Dosha verstärken — sparsam üben' },
    titleSuffix: 'Wirkung, Schritte & Dosha-Effekte | The Sanctuary',
    metaDesc: (n, s, fb) => `So übst du ${n}${s ? ` (${s})` : ''}: Schritt-für-Schritt-Anleitung, Wirkung, Gegenanzeigen und wie es Vata, Pitta und Kapha beeinflusst. ${fb}`,
    idxTitle: (t) => `Yoga-Haltungsbibliothek — ${t} Asanas mit Wirkung & Dosha-Effekten | The Sanctuary`,
    idxDesc: (t) => `Durchstöbere ${t} Yoga-Asanas: Schritt-für-Schritt-Anleitungen, Wirkung, Gegenanzeigen und wie jede Haltung Vata, Pitta und Kapha beeinflusst.`,
    idxH1: (t) => `${t} Yoga-Haltungen, erklärt.`,
    idxSub: 'Jede Asana mit Anleitung, Wirkung, Gegenanzeigen — und wie sie jedes Dosha beeinflusst.', findDosha: 'Finde dein Dosha →',
  },
  hi: {
    langLabel: 'भाषा', crumbHome: 'होम', crumbPoses: 'आसन',
    nav: { foods: 'आहार', poses: 'आसन', quiz: 'दोष क्विज़', support: 'सहायता' },
    footer: { foodGuide: 'आहार गाइड', poseLibrary: 'आसन पुस्तकालय', quiz: 'दोष क्विज़', support: 'सहायता', privacy: 'गोपनीयता', terms: 'शर्तें', copyright: '© 2026 The Sanctuary. योग एक अभ्यास है, कोई नुस्खा नहीं — स्वास्थ्य संबंधी चिंताओं के लिए विशेषज्ञ से मिलें।' },
    benefits: 'लाभ', howTo: (n) => `${n} कैसे करें`,
    hold: (s, b) => `सुझाई गई अवधि: ${s} सेकंड${b ? ` · श्वास: ${b}` : ''}`,
    affects: (n) => `${n} आपके दोषों को कैसे प्रभावित करता है`,
    poseNote: 'आयुर्वेद में वही आसन आपकी प्रकृति के अनुसार अलग असर करता है। यही वह दृष्टिकोण है जिससे ऐप आपकी प्रैक्टिस क्रमबद्ध करता है।',
    tblDosha: 'दोष', tblEffect: 'प्रभाव', tblNotes: 'टिप्पणियाँ', tblCaption: (n) => `हर दोष पर ${n} का प्रभाव`,
    bodyFocus: 'शरीर केंद्र:', whoAvoid: 'इस आसन को किसे टालना या बदलना चाहिए',
    safetyNote: 'यदि आप गर्भवती हैं, चोटिल हैं, या किसी स्थिति का प्रबंधन कर रहे हैं, तो अभ्यास से पहले किसी योग्य शिक्षक या चिकित्सक से परामर्श करें।',
    modifications: 'बदलाव', traditionalSource: 'पारंपरिक स्रोत:', relatedPoses: 'संबंधित आसन', alsoCalled: 'अन्य नाम:',
    ctaKicker: 'इसे सही तरीके से करें', ctaTitle: 'ऐप में, मार्गदर्शन के साथ।',
    ctaBody: (n) => `${n} वीडियो, वाणी-मार्गदर्शन और आपके दोष के अनुसार बनी दैनिक प्रैक्टिस के साथ — कोई सामान्य प्लेलिस्ट नहीं।`,
    playAria: 'Google Play पर The Sanctuary पाएँ', ctaNote: 'दोष के बारे में अनिश्चित? 1-मिनट का क्विज़ लें →',
    effectNote: { Balancing: 'अच्छा मेल — इस दोष को शांत करने में मदद करता है', Neutral: 'मोटे तौर पर तटस्थ', Caution: 'इस दोष को बढ़ा सकता है — कम अभ्यास करें' },
    titleSuffix: 'लाभ, चरण और दोष प्रभाव | The Sanctuary',
    metaDesc: (n, s, fb) => `${n}${s ? ` (${s})` : ''} कैसे करें: चरण-दर-चरण निर्देश, लाभ, सावधानियाँ, और यह वात, पित्त और कफ को कैसे प्रभावित करता है। ${fb}`,
    idxTitle: (t) => `योग आसन पुस्तकालय — ${t} आसन लाभ और दोष प्रभावों के साथ | The Sanctuary`,
    idxDesc: (t) => `${t} योग आसन देखें: चरण-दर-चरण निर्देश, लाभ, सावधानियाँ, और हर आसन वात, पित्त और कफ को कैसे प्रभावित करता है।`,
    idxH1: (t) => `${t} योग आसन, समझाए गए।`,
    idxSub: 'हर आसन निर्देश, लाभ, सावधानियों के साथ — और यह हर दोष को कैसे प्रभावित करता है।', findDosha: 'अपना दोष जानें →',
  },
}

// Localized language switch for a given language-neutral path (e.g. /poses/slug).
const langSwitch = (altPath, cur) =>
  `<span class="lang-switch" aria-label="${esc(UI[cur].langLabel)}">` +
  LANGS.map((l) => `<a href="${prefix(l)}${altPath}"${l === cur ? ' aria-current="page"' : ''}>${FLAG[l]}</a>`).join('') +
  `</span>`

// ⚠ SIGN CONVENTION — asanas use the OPPOSITE sign to foods (see getDoshaTag in
// src/data/asanas.js — affinity > 0 → 'Balancing', < 0 → 'Caution'). Labels come
// from the app's own getDoshaTag so the two can never diverge; localized labels
// come from the same doshaTags overlay the app uses.
const EFFECT_META = { Balancing: { cls: 'pacify' }, Neutral: { cls: 'neutral' }, Caution: { cls: 'increase' } }
const DOSHA_TAG_KEY = { Balancing: 'balancing', Neutral: 'neutral', Caution: 'caution' }
const effectOf = (v, lang) => {
  const label = getDoshaTag(v).label
  const meta = EFFECT_META[label] || EFFECT_META.Neutral
  const localized = lang === 'en' ? label : (OVERLAYS[lang]?.doshaTags?.[DOSHA_TAG_KEY[label]] || label)
  return { label: localized, cls: meta.cls, note: UI[lang].effectNote[label] || '' }
}

// Mirrors POSE_ALIASES in src/components/PoseFigure.jsx — poses whose data key
// differs from the on-disk filename by more than casing.
const POSE_ALIASES = { forwardBend: 'paschimottanasana', legsUpWall: 'legUpWall' }
function imageFor(poseKey) {
  if (!poseKey || !IMAGE_FILES) return null
  const base = (POSE_ALIASES[poseKey] || poseKey).toLowerCase()
  return IMAGE_FILES[base] || null
}

// ── Slugs (english name is the primary search term; stable across languages) ─
const asanas = Object.values(ASANAS).filter((a) => a && a.id && a.english)
const slugCount = {}
asanas.forEach((a) => { const b = slugify(a.english); slugCount[b] = (slugCount[b] || 0) + 1 })
const SLUG_BY_ID = {}
for (const a of asanas) {
  const base = slugify(a.english)
  SLUG_BY_ID[a.id] = slugCount[base] > 1 ? `${base}-${slugify(a.sanskrit || a.id)}` : base
}
const slugOf = (a) => SLUG_BY_ID[a.id] || slugify(a.english)

// ── Shared chrome ───────────────────────────────────────────────────────────
const head = ({ lang, title, description, altPath, image, jsonld }) => {
  const p = prefix(lang)
  const canonical = `${SITE}${p}${altPath}`
  const alts = [
    ...LANGS.map((l) => ({ h: l, href: `${SITE}${prefix(l)}${altPath}` })),
    { h: 'x-default', href: `${SITE}${altPath}` },
  ]
  const t = UI[lang]
  return `<!doctype html>
<html lang="${lang}">
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
${alts.map((a) => `  <link rel="alternate" hreflang="${a.h}" href="${esc(a.href)}">`).join('\n')}
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
    <a class="brand" href="${p}/">
      <img src="/assets/logo.png" alt="">
      <span>The Sanctuary</span>
    </a>
    <nav class="nav-links">
      <a href="/foods/">${esc(t.nav.foods)}</a>
      <a href="${p}/poses/">${esc(t.nav.poses)}</a>
      <a href="${p}/quiz">${esc(t.nav.quiz)}</a>
      <a href="${p}/support">${esc(t.nav.support)}</a>
      ${langSwitch(altPath, lang)}
    </nav>
  </div>
</header>
`
}

const footer = (lang) => {
  const p = prefix(lang)
  const f = UI[lang].footer
  return `
<footer>
  <div class="wrap">
    <div class="footer-grid">
      <a class="brand" href="${p}/">
        <img src="/assets/logo.png" alt="">
        <span>The Sanctuary</span>
      </a>
      <nav class="footer-links">
        <a href="/foods/">${esc(f.foodGuide)}</a>
        <a href="${p}/poses/">${esc(f.poseLibrary)}</a>
        <a href="${p}/quiz">${esc(f.quiz)}</a>
        <a href="${p}/support">${esc(f.support)}</a>
        <a href="${p}/privacy">${esc(f.privacy)}</a>
        <a href="${p}/terms">${esc(f.terms)}</a>
      </nav>
    </div>
    <p class="copyright">${esc(f.copyright)}</p>
  </div>
</footer>

<script src="/assets/site.js?v=2"></script>
</body>
</html>
`
}

const ctaBlock = (a, lang) => {
  const t = UI[lang]
  return `
      <aside class="pose-cta">
        <p class="section-kicker">${esc(t.ctaKicker)}</p>
        <h2>${esc(t.ctaTitle)}</h2>
        <p>${esc(t.ctaBody(a.english))}</p>
        <a class="play-badge" data-play-link data-placement="pose_page"
           href="https://play.google.com/store/apps/details?id=com.sanctuary.app"
           aria-label="${esc(t.playAria)}">
          <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
               alt="${esc(t.playAria)}">
        </a>
        <p class="cta-note"><a href="${prefix(lang)}/quiz">${esc(t.ctaNote)}</a></p>
      </aside>`
}

// ── Single pose page ────────────────────────────────────────────────────────
function posePage(base, related, lang) {
  const a = localizeAsana(base, lang)
  const t = UI[lang]
  const p = prefix(lang)
  const slug = slugOf(base)
  const altPath = `/poses/${slug}`
  const canonical = `${SITE}${p}${altPath}`
  const img = imageFor(base.poseKey)
  const imgUrl = img ? `${SITE}/assets/poses/${img}` : null

  const sansSuffix = a.sanskrit && a.sanskrit !== a.english ? ` (${a.sanskrit})` : ''
  const names = [a.sanskrit, a.devanagari, a.iast].filter(Boolean)
  const title = `${a.english}${sansSuffix} — ${t.titleSuffix}`
  const firstBenefit = (a.benefits && a.benefits[0]) || ''
  const description = t.metaDesc(a.english, a.sanskrit, firstBenefit).slice(0, 300)

  const steps = (a.instructions || []).map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text }))
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: t.howTo(`${a.english}${a.sanskrit ? ` (${a.sanskrit})` : ''}`),
        description,
        ...(imgUrl ? { image: { '@type': 'ImageObject', url: imgUrl } } : {}),
        ...(base.durationSeconds ? { totalTime: `PT${Math.round(base.durationSeconds)}S` } : {}),
        ...(steps.length ? { step: steps } : {}),
        supply: [], tool: [],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.crumbHome, item: `${SITE}${p}/` },
          { '@type': 'ListItem', position: 2, name: t.crumbPoses, item: `${SITE}${p}/poses/` },
          { '@type': 'ListItem', position: 3, name: a.english, item: canonical },
        ],
      },
    ],
  }

  const doshaRows = ['vata', 'pitta', 'kapha'].map((d) => {
    const e = effectOf(base.doshaAffinity?.[d], lang)
    return `          <tr>
            <th scope="row">${titleCase(d)}</th>
            <td><span class="d-tag d-${e.cls}">${esc(e.label)}</span></td>
            <td>${esc(e.note)}</td>
          </tr>`
  }).join('\n')

  const list = (items, cls = '') => (items && items.length)
    ? `<ul class="${cls}">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''

  const sourceLine = a.source
    ? `${a.source.text === 'HYP' ? 'Hatha Yoga Pradipika' : a.source.text === 'GS' ? 'Gheranda Samhita' : 'Modern hatha'}${a.source.verse ? ` ${esc(a.source.verse)}` : ''}${a.source.note ? ` — ${esc(a.source.note)}` : ''}`
    : null

  return head({ lang, title, description, altPath, image: imgUrl, jsonld }) + `
<main>
  <div class="wrap pose-page">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${p}/">${esc(t.crumbHome)}</a> <span aria-hidden="true">/</span>
      <a href="${p}/poses/">${esc(t.crumbPoses)}</a> <span aria-hidden="true">/</span>
      <span aria-current="page">${esc(a.english)}</span>
    </nav>

    <article>
      <header class="pose-head">
        <p class="kicker">${esc(catLabel(base.category || 'pose', lang))} · ${esc(levelLabel(base.level || '', lang))}</p>
        <h1>${esc(a.english)}</h1>
        <p class="pose-names">${names.map((n) => `<span>${esc(n)}</span>`).join('<span class="sep">·</span>')}</p>
        ${a.aliases && a.aliases.length ? `<p class="pose-alias">${esc(t.alsoCalled)} ${esc(a.aliases.join(', '))}</p>` : ''}
      </header>

      ${img ? `<img class="pose-hero" src="/assets/poses/${esc(img)}"
             alt="${esc(a.english)}${a.sanskrit ? ` (${esc(a.sanskrit)})` : ''}"
             width="840" height="840" loading="eager">` : ''}

      ${a.reasoning ? `<p class="pose-lede">${esc(a.reasoning)}</p>` : ''}

      ${a.benefits?.length ? `<section>
        <h2>${esc(t.benefits)}</h2>
        ${list(a.benefits)}
      </section>` : ''}

      ${a.instructions?.length ? `<section>
        <h2>${esc(t.howTo(a.english))}</h2>
        <ol class="pose-steps">${a.instructions.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
        ${base.durationSeconds ? `<p class="pose-hold">${esc(t.hold(Math.round(base.durationSeconds), base.breathPattern ? titleCase(base.breathPattern) : ''))}</p>` : ''}
      </section>` : ''}

      <section>
        <h2>${esc(t.affects(a.english))}</h2>
        <p class="pose-note">${esc(t.poseNote)}</p>
        <table class="dosha-table">
          <caption class="sr-only">${esc(t.tblCaption(a.english))}</caption>
          <thead><tr><th scope="col">${esc(t.tblDosha)}</th><th scope="col">${esc(t.tblEffect)}</th><th scope="col">${esc(t.tblNotes)}</th></tr></thead>
          <tbody>
${doshaRows}
          </tbody>
        </table>
        ${base.bodyParts?.length ? `<p class="pose-meta"><strong>${esc(t.bodyFocus)}</strong> ${esc(base.bodyParts.map(titleCase).join(', '))}</p>` : ''}
      </section>

      ${a.contraindications?.length ? `<section class="pose-safety">
        <h2>${esc(t.whoAvoid)}</h2>
        ${list(a.contraindications)}
        <p class="pose-note">${esc(t.safetyNote)}</p>
      </section>` : ''}

      ${a.modifications?.length ? `<section>
        <h2>${esc(t.modifications)}</h2>
        ${list(a.modifications)}
      </section>` : ''}

      ${sourceLine ? `<p class="pose-source"><strong>${esc(t.traditionalSource)}</strong> ${sourceLine}</p>` : ''}

${ctaBlock(a, lang)}

      ${related.length ? `<section>
        <h2>${esc(t.relatedPoses)}</h2>
        <ul class="pose-related">
          ${related.map((r) => { const lr = localizeAsana(r, lang); return `<li><a href="${p}/poses/${slugOf(r)}">${esc(lr.english)}<span>${esc(r.sanskrit || '')}</span></a></li>` }).join('')}
        </ul>
      </section>` : ''}
    </article>
  </div>
</main>
` + footer(lang)
}

// ── Index page ──────────────────────────────────────────────────────────────
function indexPage(byCategory, lang) {
  const t = UI[lang]
  const p = prefix(lang)
  const total = asanas.length
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: UI[lang].nav.poses, description: t.idxDesc(total), url: `${SITE}${p}/poses/`, inLanguage: lang,
  }

  const sections = Object.keys(byCategory).sort().map((cat) => `
      <section>
        <h2 id="${slugify(cat)}">${esc(catLabel(cat, lang))} <span class="cat-count">${byCategory[cat].length}</span></h2>
        <ul class="pose-grid">
          ${byCategory[cat].map((base) => {
            const a = localizeAsana(base, lang)
            const img = imageFor(base.poseKey)
            return `<li><a href="${p}/poses/${slugOf(base)}">
              ${img ? `<img src="/assets/poses/${esc(img)}" alt="" width="120" height="120" loading="lazy">` : '<span class="pose-thumb-blank" aria-hidden="true"></span>'}
              <span class="pose-grid-name">${esc(a.english)}</span>
              <span class="pose-grid-sans">${esc(a.sanskrit || '')}</span>
            </a></li>`
          }).join('')}
        </ul>
      </section>`).join('')

  return head({ lang, title: t.idxTitle(total), description: t.idxDesc(total), altPath: '/poses/', jsonld }) + `
<main>
  <div class="wrap pose-index">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${p}/">${esc(t.crumbHome)}</a> <span aria-hidden="true">/</span>
      <span aria-current="page">${esc(t.crumbPoses)}</span>
    </nav>
    <p class="kicker">${esc(UI[lang].footer.poseLibrary)}</p>
    <h1>${esc(t.idxH1(total))}</h1>
    <p class="sub">${esc(t.idxSub)} <a href="${p}/quiz">${esc(t.findDosha)}</a></p>
${sections}
  </div>
</main>
` + footer(lang)
}

// ── Related-pose picker (same category first, then shared tags) ─────────────
function relatedFor(a) {
  const tags = new Set(a.tags || [])
  return asanas
    .filter((o) => o.id !== a.id)
    .map((o) => {
      let score = 0
      if (o.category === a.category) score += 3
      ;(o.tags || []).forEach((tg) => { if (tags.has(tg)) score += 1 })
      if (o.level === a.level) score += 0.5
      return { o, score }
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, 6)
    .map((x) => x.o)
}

// ── Build ───────────────────────────────────────────────────────────────────
const IMG_OUT = join(REPO, 'website', 'assets', 'poses')
await mkdir(IMG_OUT, { recursive: true })

// Copy only the images actually referenced (shared across languages).
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
for (const a of asanas) { const cat = a.category || 'other'; (byCategory[cat] ||= []).push(a) }
Object.values(byCategory).forEach((list) => list.sort((x, y) => x.english.localeCompare(y.english)))

for (const lang of LANGS) {
  const outDir = join(REPO, 'website', prefix(lang), 'poses')
  await mkdir(outDir, { recursive: true })
  for (const a of asanas) {
    await writeFile(join(outDir, `${slugOf(a)}.html`), posePage(a, relatedFor(a), lang), 'utf8')
  }
  await writeFile(join(outDir, 'index.html'), indexPage(byCategory, lang), 'utf8')
}

// ── Sitemap (regenerated wholesale so it can't drift) ───────────────────────
const landingAlts = [
  { h: 'en', href: `${SITE}/` }, { h: 'de', href: `${SITE}/de/` },
  { h: 'hi', href: `${SITE}/hi/` }, { h: 'x-default', href: `${SITE}/` },
]
const quizAlts = [
  { h: 'en', href: `${SITE}/quiz` }, { h: 'de', href: `${SITE}/de/quiz` },
  { h: 'hi', href: `${SITE}/hi/quiz` }, { h: 'x-default', href: `${SITE}/quiz` },
]
const altsFor = (path) => [
  { h: 'en', href: `${SITE}${path}` }, { h: 'de', href: `${SITE}/de${path}` },
  { h: 'hi', href: `${SITE}/hi${path}` }, { h: 'x-default', href: `${SITE}${path}` },
]
const supportAlts = altsFor('/support')
const privacyAlts = altsFor('/privacy')
const termsAlts = altsFor('/terms')
const faqAlts = altsFor('/faq')
const posesIndexAlts = altsFor('/poses/')
const staticUrls = [
  { loc: `${SITE}/`, priority: '1.0', alts: landingAlts },
  { loc: `${SITE}/de/`, priority: '0.9', alts: landingAlts },
  { loc: `${SITE}/hi/`, priority: '0.9', alts: landingAlts },
  { loc: `${SITE}/quiz`, priority: '0.9', alts: quizAlts },
  { loc: `${SITE}/de/quiz`, priority: '0.8', alts: quizAlts },
  { loc: `${SITE}/hi/quiz`, priority: '0.8', alts: quizAlts },
  { loc: `${SITE}/faq`, priority: '0.6', alts: faqAlts },
  { loc: `${SITE}/de/faq`, priority: '0.5', alts: faqAlts },
  { loc: `${SITE}/hi/faq`, priority: '0.5', alts: faqAlts },
  { loc: `${SITE}/poses/`, priority: '0.8', alts: posesIndexAlts },
  { loc: `${SITE}/de/poses/`, priority: '0.7', alts: posesIndexAlts },
  { loc: `${SITE}/hi/poses/`, priority: '0.7', alts: posesIndexAlts },
  { loc: `${SITE}/support`, priority: '0.6', alts: supportAlts },
  { loc: `${SITE}/de/support`, priority: '0.5', alts: supportAlts },
  { loc: `${SITE}/hi/support`, priority: '0.5', alts: supportAlts },
  { loc: `${SITE}/privacy`, priority: '0.3', alts: privacyAlts },
  { loc: `${SITE}/de/privacy`, priority: '0.3', alts: privacyAlts },
  { loc: `${SITE}/hi/privacy`, priority: '0.3', alts: privacyAlts },
  { loc: `${SITE}/terms`, priority: '0.3', alts: termsAlts },
  { loc: `${SITE}/de/terms`, priority: '0.3', alts: termsAlts },
  { loc: `${SITE}/hi/terms`, priority: '0.3', alts: termsAlts },
]
// Each pose in each language, sharing one hreflang group.
const poseUrls = []
for (const a of asanas) {
  const slug = slugOf(a)
  const alts = altsFor(`/poses/${slug}`)
  for (const lang of LANGS) {
    poseUrls.push({ loc: `${SITE}${prefix(lang)}/poses/${slug}`, priority: lang === 'en' ? '0.7' : '0.6', alts })
  }
}
poseUrls.sort((a, b) => a.loc.localeCompare(b.loc))

// Food library (pages emitted by build-food-pages.mjs; EN-only for now — the
// ingredient dataset isn't translated yet. Sitemap owned here.)
const foodUrls = [
  { loc: `${SITE}/foods/`, priority: '0.8' },
  // Per-dosha hubs ("best foods for pitta") — high-intent, high priority.
  ...['vata', 'pitta', 'kapha'].map((d) => ({ loc: `${SITE}/foods/for-${d}`, priority: '0.7' })),
  ...REVIEWED_INGREDIENTS
    .map((f) => ({ loc: `${SITE}/foods/${slugify(f.name)}`, priority: '0.6' }))
    .sort((a, b) => a.loc.localeCompare(b.loc)),
]

await writeFile(
  join(REPO, 'website', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<!-- Generated by scripts/build-pose-pages.mjs — do not edit by hand. -->\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  [...staticUrls, ...foodUrls, ...poseUrls]
    .map((u) => {
      const alts = u.alts
        ? u.alts.map((a) => `\n    <xhtml:link rel="alternate" hreflang="${a.h}" href="${a.href}"/>`).join('')
        : ''
      return `  <url><loc>${u.loc}</loc>${alts}<priority>${u.priority}</priority></url>`
    })
    .join('\n') +
  `\n</urlset>\n`,
  'utf8'
)

console.log(`✓ ${asanas.length} pose pages × ${LANGS.length} langs → website/{,de/,hi/}poses/`)
console.log(`✓ ${copied} images → website/assets/poses/${missing ? `  (${missing} without an image)` : ''}`)
console.log(`✓ sitemap.xml — ${staticUrls.length + foodUrls.length + poseUrls.length} URLs`)
