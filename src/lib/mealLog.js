// Data layer for Meal Check history — per-account rows in Supabase (table +
// RLS from migration 018), so history is cross-device from day one. All calls
// take the caller's userId (from useAuth) and fail soft: a logging error must
// never block the user from seeing their verdict.

import { supabase } from './supabase'

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
