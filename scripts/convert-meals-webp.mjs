#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  convert-meals-webp.mjs — shrink bundled meal illustrations (PNG → WebP)
//
//  Meal masters land as large squares (~1254², a few MB each). They're bundled
//  into the app binary and only ever shown in a ~375px card band (plus a
//  possible larger detail crop later), so we downscale to a sane max edge and
//  encode WebP q80 — cutting each from megabytes to ~100–200 KB with no visible
//  loss for these painterly renders.
//
//  Converts every public/meals/*.png to .webp, then removes the source .png.
//  Idempotent: a .png with an up-to-date .webp sibling is skipped. Re-run after
//  adding new PNGs.
//
//  USAGE
//    npm run meals:webp             (resize + convert + delete source PNGs)
//    KEEP_PNG=1 npm run meals:webp    (keep the PNGs)
//    MEAL_MAX_EDGE=1024 npm run meals:webp   (override the 900px max edge)
//
//  After running, refresh the manifest: `npm run meals:manifest`.
// ─────────────────────────────────────────────────────────────────────────────

import { readdirSync, statSync, rmSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIR = join(__dirname, '..', 'public', 'meals')
const QUALITY = Number(process.env.WEBP_QUALITY || 80)
const MAX_EDGE = Number(process.env.MEAL_MAX_EDGE || 900)
const KEEP_PNG = process.env.KEEP_PNG === '1'

if (!existsSync(DIR)) { console.log('No public/meals/ dir yet.'); process.exit(0) }
const pngs = readdirSync(DIR).filter(f => f.toLowerCase().endsWith('.png'))
if (pngs.length === 0) { console.log('No PNGs to convert in public/meals/.'); process.exit(0) }

let converted = 0, skipped = 0, beforeBytes = 0, afterBytes = 0
for (const png of pngs) {
  const pngPath  = join(DIR, png)
  const webpPath = pngPath.replace(/\.png$/i, '.webp')

  const pngStat = statSync(pngPath)
  if (existsSync(webpPath) && statSync(webpPath).mtimeMs >= pngStat.mtimeMs) { skipped++; continue }

  await sharp(pngPath)
    // Only shrinks; never upscales a smaller master.
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 5 })
    .toFile(webpPath)

  beforeBytes += pngStat.size
  afterBytes  += statSync(webpPath).size
  converted++
  if (!KEEP_PNG) rmSync(pngPath)
  process.stdout.write(`✓ ${png} → ${png.replace(/\.png$/i, '.webp')}\n`)
}

const mb = b => (b / 1024 / 1024).toFixed(2)
console.log(`\nConverted ${converted}, skipped ${skipped}.`)
if (converted) {
  console.log(`Size: ${mb(beforeBytes)} MB PNG → ${mb(afterBytes)} MB WebP ` +
              `(${Math.round((1 - afterBytes / beforeBytes) * 100)}% smaller)`)
  console.log(KEEP_PNG ? 'Kept source PNGs (KEEP_PNG=1).' : 'Removed source PNGs.')
  console.log('Next: `npm run meals:manifest` to refresh the manifest.')
}
