#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  convert-poses-webp.mjs — shrink bundled pose stills (PNG → WebP)
//
//  The pose images in public/poses/ are 840×840 RGBA PNGs (~0.9–2 MB each,
//  ~158 MB total) — bundled into the app binary. WebP at q80 cuts that ~75%
//  with no visible loss for these photographic renders, meaningfully shrinking
//  the APK/IPA.
//
//  Converts every public/poses/*.png to .webp (preserving alpha), then
//  removes the source .png. Idempotent: a .png with an up-to-date .webp
//  sibling is skipped. Re-run after adding new PNGs.
//
//  USAGE
//    npm run poses:webp           (convert + delete source PNGs)
//    KEEP_PNG=1 npm run poses:webp  (convert but keep the PNGs)
//
//  After running, refresh the manifest: `npm run poses`.
// ─────────────────────────────────────────────────────────────────────────────

import { readdirSync, statSync, rmSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIR = join(__dirname, '..', 'public', 'poses')
const QUALITY = Number(process.env.WEBP_QUALITY || 80)
const KEEP_PNG = process.env.KEEP_PNG === '1'

const pngs = readdirSync(DIR).filter(f => f.toLowerCase().endsWith('.png'))
if (pngs.length === 0) {
  console.log('No PNGs to convert in public/poses/.')
  process.exit(0)
}

let converted = 0, skipped = 0, beforeBytes = 0, afterBytes = 0
for (const png of pngs) {
  const pngPath  = join(DIR, png)
  const webpPath = pngPath.replace(/\.png$/i, '.webp')

  const pngStat = statSync(pngPath)
  // Skip if a newer-or-equal .webp already exists (idempotent re-runs).
  if (existsSync(webpPath) && statSync(webpPath).mtimeMs >= pngStat.mtimeMs) {
    skipped++
    continue
  }

  await sharp(pngPath)
    .webp({ quality: QUALITY, effort: 5, alphaQuality: 90 })
    .toFile(webpPath)

  beforeBytes += pngStat.size
  afterBytes  += statSync(webpPath).size
  converted++
  if (!KEEP_PNG) rmSync(pngPath)
  process.stdout.write(`✓ ${png} → ${png.replace(/\.png$/i, '.webp')}\n`)
}

const mb = b => (b / 1024 / 1024).toFixed(1)
console.log(`\nConverted ${converted}, skipped ${skipped}.`)
if (converted) {
  console.log(`Size: ${mb(beforeBytes)} MB PNG → ${mb(afterBytes)} MB WebP ` +
              `(${Math.round((1 - afterBytes / beforeBytes) * 100)}% smaller)`)
  console.log(KEEP_PNG ? 'Kept source PNGs (KEEP_PNG=1).' : 'Removed source PNGs.')
  console.log('Next: `npm run poses` to refresh the manifest.')
}
