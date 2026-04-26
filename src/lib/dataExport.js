// ─────────────────────────────────────────────────────────────────────────────
//  dataExport.js — GDPR Article 15 "right of access"
//
//  Gives the user a single JSON bundle containing every row they own in the
//  app's tables. The bundle is assembled client-side, using their own
//  authenticated session — so row-level security ensures we can never
//  accidentally include another user's data.
//
//  Design choices:
//    • JSON, not CSV. Preserves nesting (e.g. practice_sessions.asanas) and
//      nulls. Easy to re-import if we ever build migration tooling.
//    • One fetch per table. No joins — the user gets a transparent dump of
//      what's stored.
//    • Errors on individual tables don't abort the export; they're attached
//      to the bundle as an `errors` object so the user still gets whatever
//      we could read.
//    • The download path uses a standard Blob + anchor pattern which works
//      on web and in the Capacitor Android WebView (Android's DownloadManager
//      intercepts the anchor click on same-origin blob URLs).
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabase'

// Tables the user owns — each row has a `user_id` column keyed to the
// authenticated user. Edit this list if schema changes; intentionally
// exhaustive so nothing is silently left out of exports.
const USER_OWNED_TABLES = [
  'profiles',
  'practice_sessions',
  'user_state_checkins',
  'dosha_assessments',
  'user_struggles',
  'recommendations_log',
  'content_events',
  'searches',
]

// The `profiles` table uses `id` as the user key (it's a 1:1 with auth.users),
// everything else uses `user_id`.
const USER_KEY_COLUMN = {
  profiles: 'id',
}

export async function buildUserDataBundle(userId) {
  if (!userId) throw new Error('buildUserDataBundle: userId is required')

  const bundle = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    user_id: userId,
    tables: {},
    errors: {},
  }

  // Sequential to be gentle on the DB and avoid burst rate limits. For
  // most users the whole export is <50 rows per table; this is fast enough.
  for (const table of USER_OWNED_TABLES) {
    const column = USER_KEY_COLUMN[table] || 'user_id'
    const { data, error } = await supabase.from(table).select('*').eq(column, userId)
    if (error) {
      // Table may not exist on older DB snapshots, or RLS might hide it —
      // record the failure and move on.
      bundle.errors[table] = error.message
      bundle.tables[table] = []
    } else {
      bundle.tables[table] = data ?? []
    }
  }

  return bundle
}

// Serialize + trigger a download of the bundle. Returns the Blob so callers
// can show an in-app fallback (copy / share) if the browser refused the
// anchor click. Never throws — returns { ok, error } instead so the UI can
// stay calm.
export async function exportUserData(userId) {
  try {
    const bundle = await buildUserDataBundle(userId)
    const json = JSON.stringify(bundle, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const filename = `sanctuary-export-${bundle.generated_at.slice(0, 10)}.json`

    // Preferred path: native Web Share API with file support (modern
    // Android WebViews). Lets the user save to Drive, mail it, etc.
    if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function') {
      try {
        const file = new File([blob], filename, { type: 'application/json' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Your Sanctuary data' })
          return { ok: true, method: 'share', blob, filename, bundle }
        }
      } catch {
        // User cancelled the share sheet or the platform refused — fall
        // through to the download path below.
      }
    }

    // Fallback: anchor + blob URL download. Works on desktop browsers and
    // in the Capacitor Android WebView (DownloadManager handles the click).
    if (typeof document !== 'undefined') {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      // Revoke after a tick so the browser has finished reading.
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      return { ok: true, method: 'download', blob, filename, bundle }
    }

    return { ok: false, error: 'No export method available', blob, filename, bundle }
  } catch (err) {
    return { ok: false, error: err?.message || String(err) }
  }
}
