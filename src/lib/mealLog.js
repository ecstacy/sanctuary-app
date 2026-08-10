// Data layer for Meal Check history — per-account rows in Supabase (table +
// RLS from migration 018), so history is cross-device from day one. All calls
// take the caller's userId (from useAuth) and fail soft: a logging error must
// never block the user from seeing their verdict.

import { supabase } from './supabase'
import { logSearch } from './analytics'

// Capture every parsed meal-check term into the `searches` table (source
// 'meal_check') so we can review, in our own DB (not third-party analytics),
// the most-typed foods and — via result_count = 0 — the coverage gaps to add to
// the dataset. One row per token: matched → result_count 1 + the resolved id;
// unmatched → result_count 0 (surfaced by searches' no-results partial index).
// Fire-and-forget; never blocks the verdict.
export function logMealSearchTerms(userId, parsed) {
  if (!userId || !parsed) return
  const fire = (query, resultCount, topResultId) =>
    logSearch({
      userId, query, resultCount,
      topResultId: topResultId ?? null,
      topResultType: topResultId ? 'ingredient' : null,
      source: 'meal_check',
    })
  ;(parsed.matched || []).forEach((m) => fire(m.token, 1, m.id))
  ;(parsed.ambiguous || []).forEach((a) => fire(a.token, a.options?.length || 0, a.options?.[0]?.id || null))
  ;(parsed.unknown || []).forEach((u) => fire(u.token, 0, null))
}

export async function listMealLogs(userId, limit = 30) {
  if (!userId) return []
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .order('eaten_at', { ascending: false })
    .limit(limit)
  if (error) { console.error('meal_logs list failed:', error.message); return [] }
  return data || []
}

export async function saveMealLog(userId, { inputText, itemIds, assessment, context, eatenAt } = {}) {
  if (!userId) return { data: null, error: 'no-user' }
  const row = {
    user_id: userId,
    input_text: inputText || null,
    item_ids: itemIds || [],
    assessment: assessment || {},
    context: context || {},
  }
  if (eatenAt) row.eaten_at = eatenAt
  const { data, error } = await supabase.from('meal_logs').insert(row).select().single()
  if (error) console.error('meal_logs insert failed:', error.message)
  return { data, error }
}

export async function deleteMealLog(userId, id) {
  if (!userId || !id) return { error: 'bad-args' }
  const { error } = await supabase.from('meal_logs').delete().eq('id', id).eq('user_id', userId)
  if (error) console.error('meal_logs delete failed:', error.message)
  return { error }
}

// Anchor the 7-day trial on first use. Conditional (only writes when still
// null) so it can't be pushed forward by later checks. Returns the ISO value
// it set, or null if it was already set / nothing to do.
export async function startMealTrialIfNeeded(userId, currentValue) {
  if (!userId || currentValue) return null
  const startedAt = new Date().toISOString()
  const { error } = await supabase
    .from('profiles')
    .update({ meal_check_trial_started_at: startedAt })
    .eq('id', userId)
    .is('meal_check_trial_started_at', null)
  if (error) { console.error('meal trial start failed:', error.message); return null }
  return startedAt
}
