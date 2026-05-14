#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  generate-voice.mjs — pre-generate Azure HD voice MP3s for every asana
//  and pranayama instruction the app speaks at runtime.
//
//  WHY pre-generation, not runtime synthesis?
//    1. Quality — same Nova Dragon HD voice every session, no surprises.
//    2. Offline — instructions play in remote regions / on planes / in the
//       India market where connectivity is patchy.
//    3. Cost — Azure F0 free tier gives 0.5M chars/month; one regeneration
//       of the entire catalogue is ~50k chars (≈10% of free).
//    4. Latency — local file plays instantly; the cloud API takes 0.5–2s
//       per cue which would make the practice feel sluggish.
//
//  OUTPUTS
//    public/audio/poses/{key}.mp3 — one file per spoken line, where the
//      key is derived deterministically from poseId + line index (see
//      `buildJobs`). The same key appears in the manifest so the client
//      can look up "do I have a pre-recorded clip for this line?" without
//      a fuzzy text match.
//
//    public/audio/manifest.json — { [key]: durationSeconds }. The runtime
//      voice hook reads this at app start to decide pre-rec vs TTS.
//
//  RESUME / IDEMPOTENCY
//    Each job is keyed by (text, voice, rate). If the MP3 already exists
//    AND the manifest records the same text hash, the job is skipped.
//    Change the text in asanas.js → the hash changes → only that one
//    line regenerates. No need to delete files manually.
//
//  USAGE
//    AZURE_SPEECH_KEY=xxx AZURE_REGION=eastus node scripts/generate-voice.mjs
//
//    Optional overrides:
//      AZURE_VOICE=en-US-Nova:DragonHDLatestNeural   (default)
//      AZURE_RATE=0.92                               (default; 1.0 = normal)
//      DRY_RUN=1                                     prints jobs, no API calls
//      ONLY=tadasana,virabhadrasanaI                 generate just these poseIds
//
//  COST CHECK
//    The script prints total chars before hitting the API. Sanity-check
//    against the F0 free tier (500k chars / month).
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
const OUT_DIR   = join(REPO_ROOT, 'public', 'audio', 'poses')
const MANIFEST  = join(REPO_ROOT, 'public', 'audio', 'manifest.json')

// ── Config (env-driven) ────────────────────────────────────────────────────
const KEY    = process.env.AZURE_SPEECH_KEY
const REGION = process.env.AZURE_REGION || 'eastus'
const VOICE  = process.env.AZURE_VOICE  || 'en-US-Nova:DragonHDLatestNeural'
const RATE   = process.env.AZURE_RATE   || '0.92'  // slightly slow for clarity
const DRY    = process.env.DRY_RUN === '1'
const ONLY   = process.env.ONLY ? new Set(process.env.ONLY.split(',').map(s => s.trim())) : null

if (!KEY && !DRY) {
  console.error('✖ Missing AZURE_SPEECH_KEY. Set it via env var, e.g.:')
  console.error('   AZURE_SPEECH_KEY=xxx AZURE_REGION=eastus node scripts/generate-voice.mjs')
  process.exit(1)
}

// ── Load canonical content (ESM dynamic import so we don't duplicate data) ─
const asanasModule    = await import(pathToFileURL(join(REPO_ROOT, 'src', 'data', 'asanas.js')).href)
const pranayamasModule = await import(pathToFileURL(join(REPO_ROOT, 'src', 'data', 'pranayamas.js')).href)
const { ASANAS }    = asanasModule
const { PRANAYAMAS } = pranayamasModule

// ── Build the job list ─────────────────────────────────────────────────────
// Each entry: { key, text } — the key is what the client looks up. We use
// a stable scheme: `${poseId}__${slot}` where slot is `name`, `enter`,
// `i0`..`iN`. The client maps an instruction array index → `iN` directly.
function buildJobs() {
  const jobs = []
  const seenKeys = new Set()
  const push = (key, text) => {
    if (!text || typeof text !== 'string') return
    if (seenKeys.has(key)) return
    seenKeys.add(key)
    jobs.push({ key, text: text.trim() })
  }

  // ── Session-level static phrases ───────────────────────────────────────
  // Reserved keys prefixed `_session__` so they never collide with a pose
  // id. The practice page passes these via opts.fileKey + requireFile to
  // suppress the TTS fallback — we'd rather have silence than robot voice
  // for these pivotal moments.
  push('_session__complete', 'Practice complete. Namaste. Your body and mind thank you.')

  const everything = [
    ...Object.values(ASANAS).map(a => ({ ...a, kind: 'asana' })),
    ...Object.values(PRANAYAMAS).map(p => ({ ...p, kind: 'pranayama' })),
  ]

  for (const entry of everything) {
    if (ONLY && !ONLY.has(entry.id)) continue

    // 1. Pose announcement — "Mountain Pose." spoken once when entering.
    if (entry.english) push(`${entry.id}__name`, `${entry.english}.`)

    // 2. Optional "enter" cue from voiceCues — short, used when there are
    //    no granular instructions[].
    if (entry.voiceCues?.enter) push(`${entry.id}__enter`, entry.voiceCues.enter)

    // 3. Granular instructions[] — main narration during the hold.
    if (Array.isArray(entry.instructions)) {
      entry.instructions.forEach((step, i) => push(`${entry.id}__i${i}`, step))
    }
  }
  return jobs
}

// ── Manifest helpers ───────────────────────────────────────────────────────
async function readManifest() {
  try {
    const raw = await readFile(MANIFEST, 'utf8')
    return JSON.parse(raw)
  } catch { return {} }
}

function hashText(text) {
  return createHash('sha1').update(`${VOICE}|${RATE}|${text}`).digest('hex').slice(0, 12)
}

async function fileExists(p) {
  try { await stat(p); return true } catch { return false }
}

// ── Azure TTS REST call ────────────────────────────────────────────────────
//
// We POST SSML to the regional cognitiveservices endpoint. The HD voice
// catalogue is gated to specific regions (eastus, westus2, southeastasia
// at the time of writing) — if you provision a Speech resource in a region
// that doesn't expose HD voices, the synth returns 400. Fix is to recreate
// the resource in a supported region; F0 lets you do that for free.
//
// xml:escaped on input to prevent SSML injection from accidental angle
// brackets in instruction text. `prosody rate` slows the voice slightly
// — yoga teachers don't talk at podcast pace.
function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

async function synth(text) {
  const ssml =
    `<speak version='1.0' xml:lang='en-US'>` +
      `<voice name='${VOICE}'>` +
        `<prosody rate='${RATE}'>${escapeXml(text)}</prosody>` +
      `</voice>` +
    `</speak>`

  const url = `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
      'Content-Type':              'application/ssml+xml',
      // 24 kHz mono MP3 — small files, perfectly fine for spoken voice.
      // The HD voice is rendered server-side then encoded; the source is
      // higher quality than the 24k container so there's no audible loss.
      'X-Microsoft-OutputFormat':  'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent':                'sanctuary-voice-generator',
    },
    body: ssml,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Azure ${res.status} ${res.statusText}: ${body.slice(0, 300)}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const manifest = await readManifest()
  const jobs = buildJobs()

  // Cost preview — useful sanity check against F0 free tier.
  const totalChars = jobs.reduce((s, j) => s + j.text.length, 0)
  console.log(`▸ ${jobs.length} clips, ${totalChars.toLocaleString()} chars`)
  console.log(`▸ Voice: ${VOICE} @ rate=${RATE}`)
  console.log(`▸ Region: ${REGION}`)
  console.log(`▸ Output: ${OUT_DIR}`)

  let made = 0, skipped = 0, failed = 0
  for (const job of jobs) {
    const hash = hashText(job.text)
    const filename = `${job.key}.mp3`
    const fullPath = join(OUT_DIR, filename)
    const entry = manifest[job.key]

    // Skip if same hash and file present — covers most re-runs.
    if (entry?.hash === hash && await fileExists(fullPath)) {
      skipped++
      continue
    }

    if (DRY) {
      console.log(`would gen → ${filename}  «${job.text.slice(0, 60)}»`)
      made++
      continue
    }

    try {
      const audio = await synth(job.text)
      await writeFile(fullPath, audio)
      manifest[job.key] = { hash, text: job.text, bytes: audio.length }
      made++
      process.stdout.write(`✓ ${filename}\n`)
      // Persist incrementally so a crash mid-run doesn't lose progress.
      await writeFile(MANIFEST, JSON.stringify(manifest, null, 2))
    } catch (err) {
      failed++
      console.error(`✖ ${filename}: ${err.message}`)
      // Throttle on the first failure in case it's a rate limit — let
      // a retry-on-next-run pick up where we left off instead of
      // burning the rest of the quota on errors.
      if (failed >= 3) {
        console.error('Too many failures, aborting. Re-run later to resume.')
        break
      }
    }
  }

  console.log(`\nDone — generated ${made}, skipped ${skipped}, failed ${failed}`)
}

await main()
