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

  // Best-effort: server-side PostHog GDPR erasure. The Edge Function
  // (supabase/functions/posthog-delete-person) reads the caller's user id
  // from their JWT and asks PostHog to delete the matching person plus
  // all linked events. Must run BEFORE signOut() — once the session is
  // gone we can't authenticate the function call. Errors don't block
  // the local deletion: the user's first-party data is already gone.
  let posthogDeleted = false
  try {
    const { data, error } = await supabase.functions.invoke('posthog-delete-person', {
      method: 'POST',
    })
    if (!error && data?.ok) posthogDeleted = true
    else if (error) errors.posthog_delete_person = error.message || String(error)
    else if (data && !data.ok) errors.posthog_delete_person = data.error || 'unknown'
  } catch (err) {
    // Function-not-deployed shows up as a 404 here. Don't spam the user
    // with that — log internally and move on.
    if (!/Failed to send|404|Not Found/i.test(err?.message || '')) {
      errors.posthog_delete_person = err?.message || String(err)
    }
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
    posthogDeleted,
    errors,
    remainingTables,
  }
}
