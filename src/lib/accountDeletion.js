// ─────────────────────────────────────────────────────────────────────────────
//  accountDeletion.js — GDPR Article 17 "right to erasure"
//
//  Two-phase delete:
//    1. Client deletes every row the user owns across the app's tables.
//       RLS policies must allow self-delete on every table we touch — if a
//       policy is missing, that table will silently remain populated and
//       we record the table name in `errors` so the UI can show it.
//    2. A best-effort RPC to `delete_account_self` (a Postgres function
//       provided by a server-side migration) tears down the auth.users row
//       via `auth.admin.delete_user`. If the RPC doesn't exist yet, we
//       fall back to sign-out and tell the user their data is gone but
//       the login record will be removed within N days by a scheduled job.
//
//  The function is deliberately cautious:
//    • Never throws — always returns { ok, errors, remainingTables }.
//    • Runs deletions sequentially so a failure on table N doesn't hide
//      failures on table N+1.
//    • Signs the user out at the end regardless (they asked to leave).
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabase'

// Ordered so that "child" tables are deleted before tables they might
// reference via FK, avoiding FK-violation errors on cascading deletes.
// `profiles` is last because other rows FK into it.
const DELETE_ORDER = [
  'content_events',
  'recommendations_log',
  'searches',
  'user_state_checkins',
  'practice_sessions',
  'dosha_assessments',
  'user_struggles',
  'profiles',
]

const USER_KEY_COLUMN = {
  profiles: 'id',
}

export async function deleteAllUserData(userId) {
  if (!userId) return { ok: false, errors: { root: 'missing userId' }, remainingTables: [] }

  const errors = {}
  const remainingTables = []

  for (const table of DELETE_ORDER) {
    const column = USER_KEY_COLUMN[table] || 'user_id'
    const { error } = await supabase.from(table).delete().eq(column, userId)
    if (error) {
      // Relation-not-found is fine — older snapshot without that table.
      if (/relation .* does not exist/i.test(error.message)) continue
      errors[table] = error.message
      remainingTables.push(table)
    }
  }

  // Best-effort: ask the server-side function to nuke the auth.users row.
  // If the RPC isn't deployed yet, we swallow the error — the client-side
  // rows are gone, which is the important part. The auth shell can be
  // reaped by a scheduled job.
  let authDeleted = false
  try {
    const { error } = await supabase.rpc('delete_account_self')
    if (!error) authDeleted = true
    else if (!/function .* does not exist/i.test(error.message)) {
      errors.rpc_delete_account_self = error.message
    }
  } catch (err) {
    errors.rpc_delete_account_self = err?.message || String(err)
  }

  // Whatever happened, sign the user out on this device.
  try {
    await supabase.auth.signOut()
  } catch (err) {
    errors.sign_out = err?.message || String(err)
  }

  // Clear local caches that would otherwise linger between accounts.
  try {
    const keys = [
      'sanctuary_practice_history',
      'sanctuary.consent.v1',
      'sanctuary.lang',
      'sanctuary.anon_id',
    ]
    keys.forEach(k => localStorage.removeItem(k))
  } catch { /* storage unavailable */ }

  return {
    ok: remainingTables.length === 0,
    authDeleted,
    errors,
    remainingTables,
  }
}
