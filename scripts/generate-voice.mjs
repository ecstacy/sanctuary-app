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
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import esbuild from 'esbuild'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')

// ── Language ────────────────────────────────────────────────────────────────
// VOICE_LANG selects which language to generate (en | de | hi). We use
// VOICE_LANG, not LANG — LANG is a standard shell locale var we must not clobber.
// Non-English passes pull cue text from the i18n overlays (content/{lang}/…),
// falling back to English for any line without a translation. English stays at
// the original flat paths for back-compat; other langs get subdirs + suffixed
// manifests so the runtime can pick per i18n.language.
const LANG = (process.env.VOICE_LANG || 'en').toLowerCase()
const LANG_DEFAULTS = {
  en: { voice: 'en-US-Nova:DragonHDLatestNeural', xmlLang: 'en-US' },
  de: { voice: 'de-DE-Seraphina:DragonHDLatestNeural', xmlLang: 'de-DE' },
  hi: { voice: 'hi-IN-SwaraNeural', xmlLang: 'hi-IN' },
}
if (!LANG_DEFAULTS[LANG]) {
  console.error(`✖ Unsupported VOICE_LANG='${LANG}'. Use one of: ${Object.keys(LANG_DEFAULTS).join(', ')}`)
  process.exit(1)
}

const OUT_DIR = LANG === 'en'
  ? join(REPO_ROOT, 'public', 'audio', 'poses')
  : join(REPO_ROOT, 'public', 'audio', 'poses', LANG)
const MANIFEST = LANG === 'en'
  ? join(REPO_ROOT, 'public', 'audio', 'manifest.json')
  : join(REPO_ROOT, 'public', 'audio', `manifest.${LANG}.json`)

// ── Config (env-driven) ────────────────────────────────────────────────────
const KEY     = process.env.AZURE_SPEECH_KEY
const REGION  = process.env.AZURE_REGION || 'eastus'
const VOICE   = process.env.AZURE_VOICE  || LANG_DEFAULTS[LANG].voice
const XMLLANG = LANG_DEFAULTS[LANG].xmlLang
const RATE    = process.env.AZURE_RATE   || '0.92'  // slightly slow for clarity
const DRY     = process.env.DRY_RUN === '1'
const ONLY    = process.env.ONLY ? new Set(process.env.ONLY.split(',').map(s => s.trim())) : null

if (!KEY && !DRY) {
  console.error('✖ Missing AZURE_SPEECH_KEY. Set it via env var, e.g.:')
  console.error('   AZURE_SPEECH_KEY=xxx AZURE_REGION=eastus node scripts/generate-voice.mjs')
  process.exit(1)
}

// ── Load canonical content ──────────────────────────────────────────────────
// asanas.js / pranayamas.js now import contentI18n (an extensionless, Vite-only
// specifier) so a raw Node dynamic import() no longer resolves. Bundle the three
// modules in-memory with esbuild (which resolves like Vite) and eval the CJS to
// pull the data objects out. Enumerating jobs from the canonical data keeps the
// key set identical across languages; translation happens after (see translator).
const { ASANAS, PRANAYAMAS, COACH_PHRASES, spokenInstructions } = await (async () => {
  const bundled = await esbuild.build({
    stdin: {
      contents:
        `export { ASANAS } from './src/data/asanas.js'\n` +
        `export { PRANAYAMAS } from './src/data/pranayamas.js'\n` +
        `export { COACH_PHRASES, spokenInstructions } from './src/lib/voiceCoach.js'\n`,
      resolveDir: REPO_ROOT,
      loader: 'js',
    },
    bundle: true, format: 'cjs', platform: 'node', write: false, logLevel: 'silent',
  })
  const mod = { exports: {} }
  new Function('module', 'exports', 'require', bundled.outputFiles[0].text)(mod, mod.exports, require)
  return mod.exports
})()

// ── Translation resolver (non-English passes) ───────────────────────────────
// Maps a job key (e.g. `tadasana__hold`, `virasana__i2`, `coach__align_3`,
// `session__complete`) to the localized string from the overlays. Returns null
// when there's no translation so the caller can fall back to English.
async function buildTranslator(lang) {
  if (lang === 'en') return null
  const load = async (p) => {
    try { return JSON.parse(await readFile(join(REPO_ROOT, 'src', 'i18n', 'content', lang, p), 'utf8')) }
    catch { return {} }
  }
  const asanas = (await load('asanas.json')).asanas || {}
  const pranayamas = await load('pranayamas.json')      // top-level keyed by id
  const coach = await load('voiceCoach.json')
  return (key) => {
    if (coach[key] != null) return coach[key]
    const m = key.match(/^(.+)__(name|enter|hold|breathe|exit|i\d+)$/)
    if (!m) return null
    const [, id, slot] = m
    const src = asanas[id] || pranayamas[id] || null
    if (!src) return null
    if (slot === 'name') return src.english ? `${src.english}.` : null
    if (slot[0] === 'i') return src.instructions?.[Number(slot.slice(1))] ?? null
    return src.voiceCues?.[slot] ?? null
  }
}
const translate = await buildTranslator(LANG)

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
  // Reserved keys prefixed `session__` so they never collide with a pose
  // id. NOTE: avoid leading underscores — Android's aapt build tool
  // silently skips assets starting with `_` when packaging the APK, so
  // the file would be missing in production builds. The practice page
  // passes these via opts.fileKey + requireFile to suppress the TTS
  // fallback — we'd rather have silence than robot voice for these
  // pivotal moments.
  push('session__complete', 'Practice complete. Namaste. Your body and mind thank you.')
  // Spoken at the start of the second side of a bilateral pose. Side-neutral on
  // purpose — the pre-recorded pose cues name a fixed side, so we never re-read
  // them on the other side. Until this clip is generated the practice page
  // TTS-falls-back (it is NOT requireFile), so the cue is always heard.
  push('session__other_side', 'Now, the other side.')

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

    // 3. Mid-hold pose-specific coach cues — landed by voiceCoach.js at
    //    ~15% (hold), ~35% (breathe), and ~8s before exit. Previously
    //    these went through robot TTS because they weren't pre-recorded;
    //    now they share the Nova HD bank with the entry/name cues.
    if (entry.voiceCues?.hold)    push(`${entry.id}__hold`,    entry.voiceCues.hold)
    if (entry.voiceCues?.breathe) push(`${entry.id}__breathe`, entry.voiceCues.breathe)
    if (entry.voiceCues?.exit)    push(`${entry.id}__exit`,    entry.voiceCues.exit)

    // 4. Granular instructions[] — main narration during the hold. Use the
    //    same bilateral-aware transform the practice page plays, so the trailing
    //    "switch sides" clip is never generated (and never requested). Indices
    //    0..N-1 stay stable; only the redundant tail is dropped/shortened.
    if (Array.isArray(entry.instructions)) {
      spokenInstructions(entry).forEach((step, i) => push(`${entry.id}__i${i}`, step))
    }
  }

  // ── Universal coach bank (alignment / breath / presence / dosha /
  //    milestones). Enumerated by voiceCoach.js so the generator and the
  //    runtime stay in lockstep — editing a phrase in voiceCoach.js
  //    re-runs only that one clip on the next generator pass.
  for (const phrase of COACH_PHRASES) {
    if (ONLY && !ONLY.has(phrase.key)) continue
    push(phrase.key, phrase.text)
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
    `<speak version='1.0' xml:lang='${XMLLANG}'>` +
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

  // Non-English: swap each job's English text for its overlay translation.
  // Keys stay identical to the English manifest (so the runtime lookup by
  // fileKey matches); only the spoken text changes. Lines with no translation
  // fall back to English — counted so a gap is visible.
  let untranslated = 0
  if (translate) {
    for (const job of jobs) {
      const t = translate(job.key)
      if (t) job.text = t
      else untranslated++
    }
  }

  // Cost preview — useful sanity check against F0 free tier.
  const totalChars = jobs.reduce((s, j) => s + j.text.length, 0)
  console.log(`▸ Language: ${LANG}`)
  console.log(`▸ ${jobs.length} clips, ${totalChars.toLocaleString()} chars`)
  if (translate) console.log(`▸ Untranslated (fell back to English): ${untranslated}`)
  console.log(`▸ Voice: ${VOICE} @ rate=${RATE} · xml:lang=${XMLLANG}`)
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
