/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  analytics.js — centralized event logging for the personalization engine.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  CONTRACT
 *  --------
 *  • All writes to  recommendations_log / content_events / user_state_checkins
 *    MUST go through helpers in this module. No direct supabase inserts in UI.
 *  • All helpers are fire-and-forget — they never throw. Errors are logged.
 *    Analytics failure never blocks the user.
 *  • All helpers auto-enrich `context` JSONB with time_of_day / hour /
 *    day_of_week / iso_timestamp. Callers only add surface-specific fields.
 *  • Vocabulary constants (SURFACES, CONTENT_TYPES, EVENT_TYPES, CHECKIN_TYPES)
 *    are the single source of truth for string values — use them instead of
 *    sprinkling magic strings across the codebase.
 *
 *  Usage:
 *      import * as analytics from '../lib/analytics'
 *      const recId = await analytics.logRecommendation({
 *        userId: user.id,
 *        surface: analytics.SURFACES.HOME_SUGGESTED_ASANA,
 *        contentType: analytics.CONTENT_TYPES.ASANA,
 *        contentId: 'tadasana',
 *        reasoning: { rules_fired: ['morning','kapha_primary'] },
 *      })
 *      await analytics.logContentEvent({
 *        userId: user.id,
 *        eventType: analytics.EVENT_TYPES.CLICKED,
 *        contentType: analytics.CONTENT_TYPES.ASANA,
 *        contentId: 'tadasana',
 *        recommendationId: recId,
 *      })
 */

import { supabase } from './supabase'
import { isAggregateAllowed } from './consent'

// ── Vocabulary — single source of truth ──────────────────────────────────

export const SURFACES = {
  HOME_SUGGESTED_ASANA:  'home_suggested_asana',
  HOME_DOSHA_CARD:       'home_dosha_card',
  HOME_BREATHING_CTA:    'home_breathing_cta',
  HOME_CHECKIN_ROUTINE:  'home_checkin_routine',
  RESET_INTERVENTION:    'reset_intervention',
  SEARCH_RESULT:         'search_result',
  DISCOVER_CARD:         'discover_card',
  NOTIFICATION:          'notification',
  PRE_PRACTICE_PICKER:   'pre_practice_picker',
  ASANA_DETAIL:          'asana_detail',
}

export const CONTENT_TYPES = {
  ASANA:          'asana',
  ROUTINE:        'routine',
  RECOMMENDATION: 'recommendation',
  INSIGHT:        'insight',
  SEARCH_RESULT:  'search_result',
  TIP:            'tip',
}

export const EVENT_TYPES = {
  SHOWN:     'shown',
  CLICKED:   'clicked',
  STARTED:   'started',
  COMPLETED: 'completed',
  DISMISSED: 'dismissed',
  SAVED:     'saved',
  SHARED:    'shared',
}

export const CHECKIN_TYPES = {
  PRE_PRACTICE:  'pre_practice',
  POST_PRACTICE: 'post_practice',
  RESET:         'reset',
  STANDALONE:    'standalone',
}

export const SEARCH_SOURCES = {
  HOME_SEARCH:          'home_search',           // home page search input submit
  RECOMMENDATIONS_PAGE: 'recommendations_page',  // typed directly on /recommendations
  POPULAR_CHIP:         'popular_chip',          // tapped a POPULAR_SEARCHES suggestion
  ALSO_RELATED:         'also_related',          // pivoted from an "Also Related" card
  NO_RESULTS_SUGGESTION:'no_results_suggestion', // tapped a chip from the empty state
}

// ── Auto-enriched context ────────────────────────────────────────────────

function baseContext() {
  const now = new Date()
  const hour = now.getHours()
  let timeOfDay = 'morning'
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon'
  else if (hour >= 17) timeOfDay = 'evening'

  return {
    time_of_day: timeOfDay,
    hour,
    day_of_week: now.getDay(),   // 0 = Sunday
    iso_timestamp: now.toISOString(),
  }
}

// ── logRecommendation ────────────────────────────────────────────────────
// Writes a row to recommendations_log. Returns the new row id (UUID) so the
// caller can pass it to logContentEvent to tie a click back to the rec.
// Returns null on validation/insert failure.

export async function logRecommendation({
  userId,
  surface,
  contentType,
  contentId,
  rank = 1,
  reasoning = {},
  engineVersion = 'v0',
}) {
  if (!userId || !surface || !contentType || !contentId) return null

  const { data, error } = await supabase
    .from('recommendations_log')
    .insert({
      user_id: userId,
      surface,
      recommended_content_type: contentType,
      recommended_content_id: String(contentId),
      rank,
      reasoning,
      engine_version: engineVersion,
    })
    .select('id')
    .single()

  if (error) {
    console.error('logRecommendation failed:', error.message)
    return null
  }
  return data?.id ?? null
}

// ── logContentEvent ──────────────────────────────────────────────────────
// Writes a row to content_events. Fire-and-forget — returns a resolved
// promise on insert (or validation skip). Errors are logged, never thrown.

export async function logContentEvent({
  userId,
  eventType,
  contentType,
  contentId,
  surface,
  recommendationId,
  context = {},
}) {
  if (!userId || !eventType || !contentType || !contentId) return

  const { error } = await supabase.from('content_events').insert({
    user_id: userId,
    event_type: eventType,
    content_type: contentType,
    content_id: String(contentId),
    surface: surface ?? null,
    recommendation_id: recommendationId ?? null,
    context: { ...baseContext(), ...context },
  })

  if (error) console.error('logContentEvent failed:', error.message)
}

// ── logSearch ────────────────────────────────────────────────────────────
// Writes a row to `searches`. Captures raw query + result shape so we can
// answer "what do users search for?", "which queries return zero results?",
// and "did the user click through on what we showed them?" (via JOIN to
// content_events by context.query).
//
// Fire-and-forget. Returns the new row id so a caller could tie follow-on
// events to this search if useful; returns null on validation/error.

export async function logSearch({
  userId,
  query,
  resultCount = 0,
  topResultId,
  topResultType,
  source,
  context = {},
}) {
  if (!userId || !query || !source) return null
  const trimmed = String(query).trim()
  if (trimmed.length === 0) return null

  const { data, error } = await supabase
    .from('searches')
    .insert({
      user_id: userId,
      query: trimmed,
      result_count: resultCount,
      top_result_id: topResultId ?? null,
      top_result_type: topResultType ?? null,
      source,
      context: { ...baseContext(), ...context },
    })
    .select('id')
    .single()

  if (error) {
    console.error('logSearch failed:', error.message)
    return null
  }
  return data?.id ?? null
}

// ── linkCheckinToSession ─────────────────────────────────────────────────
// Updates an existing user_state_checkins row with a related_session_id.
// Used by Chunk 14: after a practice session row is created, we back-fill
// the pre_practice checkin (written in Chunk 13) so the pre → session →
// post loop is closed and queryable by session_id.
//
// Fire-and-forget. Safe to call with nulls — it will no-op.

// ── logAggregateEvent ────────────────────────────────────────────────────
// Fire an anonymous, aggregate-scope product event. Gated behind the user's
// opt-in consent — if they haven't granted aggregate analytics, this is a
// silent no-op. Never include user_id, email, full_name, or any free-text
// input. The `anonId` is a random per-install UUID created by the caller
// (see lib/anonId.js) and is explicitly NOT tied to the auth user.
//
// Write target is a nullable-user-id table (`aggregate_events`) that exists
// only when the opt-in path is live. Until the migration lands, this helper
// is a callable no-op — callers can drop it in now so instrumentation lands
// in the same commit as the UI surface that triggers it.

export async function logAggregateEvent({
  anonId,
  eventName,
  properties = {},
}) {
  if (!isAggregateAllowed()) return          // fail-closed: no consent → no send
  if (!anonId || !eventName) return
  // Scrub anything that looks like PII before it hits the wire.
  const safeProps = stripLikelyPII(properties)
  try {
    const { error } = await supabase.from('aggregate_events').insert({
      anon_id: anonId,
      event_name: String(eventName).slice(0, 64),
      properties: safeProps,
      context: baseContext(),
    })
    // Table may not exist yet on older DB snapshots — don't spam console.
    if (error && !/relation .* does not exist/i.test(error.message)) {
      console.error('logAggregateEvent failed:', error.message)
    }
  } catch (err) {
    console.error('logAggregateEvent threw:', err?.message || err)
  }
}

// Drop fields whose keys look like PII. Defensive — callers shouldn't be
// passing these in the first place, but this makes it harder to leak by
// mistake.
const PII_KEY_RE = /(email|mail|name|phone|address|lat|lng|latitude|longitude|ip|geo|userid|user_id|device_id|advertising_id)/i
function stripLikelyPII(obj) {
  if (!obj || typeof obj !== 'object') return {}
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (PII_KEY_RE.test(k)) continue
    if (typeof v === 'string' && v.length > 200) {
      out[k] = v.slice(0, 200)                // truncate free-text defensively
    } else {
      out[k] = v
    }
  }
  return out
}

export async function linkCheckinToSession({ checkinId, sessionId }) {
  if (!checkinId || !sessionId) return
  const { error } = await supabase
    .from('user_state_checkins')
    .update({ related_session_id: sessionId })
    .eq('id', checkinId)
  if (error) console.error('linkCheckinToSession failed:', error.message)
}

// ── logCheckin ───────────────────────────────────────────────────────────
// Writes a row to user_state_checkins. Returns the new row id so callers
// can later link a post_practice checkin to its pre_practice via app logic.

export async function logCheckin({
  userId,
  type,
  stressLevel,
  energyLevel,
  moodTags,
  bodyFocus,
  notes,
  relatedSessionId,
  context = {},
}) {
  if (!userId || !type) return null

  const { data, error } = await supabase
    .from('user_state_checkins')
    .insert({
      user_id: userId,
      checkin_type: type,
      stress_level: stressLevel ?? null,
      energy_level: energyLevel ?? null,
      mood_tags: moodTags ?? [],
      body_focus: bodyFocus ?? [],
      notes: notes ?? null,
      related_session_id: relatedSessionId ?? null,
      context: { ...baseContext(), ...context },
    })
    .select('id')
    .single()

  if (error) {
    console.error('logCheckin failed:', error.message)
    return null
  }
  return data?.id ?? null
}
