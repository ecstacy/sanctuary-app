#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  upload-pose-videos.mjs — push local video masters to Supabase Storage
//
//  Uploads media/pose-videos/*.mp4 to the public `poses` bucket. Idempotent
//  (upsert), so re-running only changes files that differ. Run after dropping
//  new clips into media/pose-videos/.
//
//  ONE-TIME SETUP (Supabase dashboard):
//    Storage → New bucket → name "poses" → Public bucket ✓ → create.
//
//  USAGE:
//    SUPABASE_URL=https://xxxx.supabase.co \
//    SUPABASE_SERVICE_ROLE_KEY=eyJ... \
//    node scripts/upload-pose-videos.mjs
//
//  (or `npm run poses:upload` after exporting those two env vars)
//
//  The service-role key is required to write to Storage and must NEVER be
//  committed or shipped to the client — it lives only in your shell / CI
//  secrets. Get it from Supabase → Project Settings → API → service_role.
// ─────────────────────────────────────────────────────────────────────────────

import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const VID_DIR   = join(__dirname, '..', 'media', 'pose-videos')
const BUCKET    = 'poses'

const URL = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL || !KEY) {
  console.error('✖ Missing env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  console.error('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... npm run poses:upload')
  process.exit(1)
}
if (!existsSync(VID_DIR)) {
  console.error(`✖ No video dir at ${VID_DIR}. Drop {poseKey}.mp4 files there first.`)
  process.exit(1)
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

const files = readdirSync(VID_DIR).filter(f => f.toLowerCase().endsWith('.mp4'))
if (files.length === 0) {
  console.error('✖ No .mp4 files in media/pose-videos/.')
  process.exit(1)
}

console.log(`▸ Uploading ${files.length} videos to ${URL} bucket "${BUCKET}"…`)
let ok = 0, fail = 0
for (const f of files) {
  const body = readFileSync(join(VID_DIR, f))
  const { error } = await supabase.storage.from(BUCKET).upload(f, body, {
    contentType: 'video/mp4',
    upsert: true,            // re-runnable; overwrites changed files
    cacheControl: '31536000', // 1 year — pose clips are immutable once named
  })
  if (error) { console.error(`  ✖ ${f}: ${error.message}`); fail++ }
  else       { console.log(`  ✓ ${f}`); ok++ }
}
console.log(`\nDone — uploaded ${ok}, failed ${fail}.`)
if (fail) process.exit(1)
console.log('Next: `npm run poses` (refresh manifest) + commit src/data/poseManifest.js')
