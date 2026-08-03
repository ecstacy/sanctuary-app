// ─────────────────────────────────────────────────────────────────────────────
//  build-og-image.mjs — generate the social share card (og:image)
//
//  Renders a 1200×630 PNG to website/assets/og.png (the size Facebook, X,
//  LinkedIn, WhatsApp, iMessage all expect). Zero design dependencies: an SVG
//  rasterised by sharp (already a dep of the pose pipeline), with the real logo
//  composited on top. Re-run with `node scripts/build-og-image.mjs` if the
//  brand copy or colours change. Output is committed so the site stays
//  zero-build.
// ─────────────────────────────────────────────────────────────────────────────
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const W = 1200, H = 630

// Brand palette (mirrors website/assets/style.css).
const C = {
  bg1: '#fbfaf3', bg2: '#e9f1e8',
  ink: '#25271f', inkSoft: '#4c4e45',
  green: '#3f7a52', terracotta: '#c26d4a',
  vata: '#35708f', pitta: '#9e5720', kapha: '#467539',
}

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.bg1}"/>
      <stop offset="1" stop-color="${C.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- soft dosha motif, upper right -->
  <circle cx="1015" cy="150" r="120" fill="${C.vata}"  opacity="0.16"/>
  <circle cx="1090" cy="235" r="120" fill="${C.pitta}" opacity="0.16"/>
  <circle cx="985"  cy="255" r="120" fill="${C.kapha}" opacity="0.16"/>

  <!-- eyebrow -->
  <text x="80" y="150" font-family="Manrope, system-ui, sans-serif" font-size="26"
        letter-spacing="6" font-weight="700" fill="${C.green}">YOGA · AYURVEDA · DAILY PRACTICE</text>

  <!-- headline -->
  <text x="78" y="290" font-family="Georgia, 'Noto Serif', serif" font-size="88"
        font-weight="700" fill="${C.ink}">Yoga that knows</text>
  <text x="78" y="388" font-family="Georgia, 'Noto Serif', serif" font-size="88"
        font-weight="700" fill="${C.ink}">your body type.</text>

  <!-- subhead -->
  <text x="80" y="452" font-family="Manrope, system-ui, sans-serif" font-size="31"
        fill="${C.inkSoft}">A fresh daily practice composed for your dosha —</text>
  <text x="80" y="494" font-family="Manrope, system-ui, sans-serif" font-size="31"
        fill="${C.inkSoft}">voice-guided, in English, German &amp; Hindi.</text>

  <!-- brand footer (logo composited separately) -->
  <text x="164" y="566" font-family="Georgia, 'Noto Serif', serif" font-size="34"
        font-weight="700" fill="${C.terracotta}">The Sanctuary</text>
  <text x="164" y="596" font-family="Manrope, system-ui, sans-serif" font-size="21"
        fill="${C.inkSoft}">thesanctuaryteam.com</text>
</svg>`

const logo = await sharp(resolve(root, 'website/assets/logo.png'))
  .resize(64, 64, { fit: 'inside' })
  .toBuffer()

await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: 80, top: 540 }])
  .png()
  .toFile(resolve(root, 'website/assets/og.png'))

console.log('✓ website/assets/og.png (1200×630)')
