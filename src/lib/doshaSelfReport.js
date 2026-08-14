// ─────────────────────────────────────────────────────────────────────────────
//  doshaSelfReport.js — the user's own read of their constitution.
//
//  Confidence Batch C (#52). A few quiz questions can't perfectly represent a
//  person, so we let them confirm or correct the reading with one tap. The
//  correction is the user's explicit statement about themselves, so it overrides
//  the quiz-derived primary everywhere the baseline constitution is used.
//
//  Stored as a `selfReport` key merged into the existing `dosha_details` JSON
//  column — no migration. Shape:
//    { fit: 'confirmed' | 'adjusted', primary?: 'vata'|'pitta'|'kapha', at: ISO }
//  'confirmed' is a positive trust signal (and future input to the "getting to
//  know you" progression, #55); 'adjusted' also carries the corrected primary.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabase'

// effectivePrimary lives in the pure doshaState module (shared by the engine
// libs); re-exported here so existing importers keep working.
export { effectivePrimary } from './doshaState'

// Merge a self-report into dosha_details without clobbering the quiz fields.
export async function saveDoshaSelfReport(userId, currentDoshaDetails, report) {
  if (!userId || !report?.fit) return { error: 'bad-args' }
  const next = {
    ...(currentDoshaDetails || {}),
    selfReport: { ...report, at: new Date().toISOString() },
  }
  const { error } = await supabase.from('profiles').update({ dosha_details: next }).eq('id', userId)
  if (error) console.error('dosha self-report save failed:', error.message)
  return { error, selfReport: next.selfReport }
}

// Whether the user has already answered "does this fit?" for the current read.
export function doshaSelfReport(profile) {
  return profile?.dosha_details?.selfReport || null
}
