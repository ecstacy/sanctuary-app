// ─────────────────────────────────────────────────────────────────────────────
//  track.js — product-analytics façade (PostHog-bound; no-op until Chunk 3).
//
//  This is the **builder-facing** analytics layer. Its consumer is us (the
//  product team) via dashboards: funnels, retention, scroll depth, CTRs.
//
//  It is intentionally separate from `analytics.js`, which is the
//  **app-facing** personalization log (Supabase-backed, fuels the
//  recommender). Both layers can fire on the same user action; they answer
//  different questions and live in different stores.
//
//  ── How to use ────────────────────────────────────────────────────────────
//      import { track, EVENTS } from '../lib/track'
//      track(EVENTS.PRACTICE_STARTED, {
//        routine_key: 'stress',
//        pose_count: 8,
//        total_duration_seconds: 900,
//        source: 'home_quick_routine',
//      })
//
//  ── Contract ──────────────────────────────────────────────────────────────
//   • Consent-gated. If `isAggregateAllowed()` is false, every method here
//     is a silent no-op. Switching consent on later flips tracking on
//     immediately for *future* events (subscribe to consent below).
//   • Fire-and-forget. Never throws, never blocks UI.
//   • PII-scrubbed. Property keys matching the PII pattern are dropped, and
//     long strings are truncated to 200 chars.
//   • Distinct-id strategy: anon UUID (lib/anonId.js) until `identify()`,
//     auth user_id afterwards. `reset()` reverts to a fresh anon id.
//   • Vendor-agnostic. Today everything funnels through `_emit()` which is
//     a no-op in production and a console.debug in dev. Chunk 3 swaps
//     `_emit` for `posthog.capture(...)` — no caller changes required.
//
//  See docs/analytics-events.md for the full event taxonomy and naming
//  rules. Add an entry there in the same PR as any new EVENTS constant.
// ─────────────────────────────────────────────────────────────────────────────

// posthog-js is loaded dynamically inside bootVendor() so users who haven't
// granted consent never download the SDK. See bootVendor below.
import { isAggregateAllowed, subscribe as subscribeConsent } from './consent'
import { getAnonId } from './anonId'

// ─── Event name constants ────────────────────────────────────────────────
// Single source of truth — never sprinkle event-name strings across the
// app. Mirror this list against docs/analytics-events.md §5.

export const EVENTS = Object.freeze({
  // Lifecycle (§5.1)
  APP_OPENED:               'app_opened',
  APP_RESUMED:              'app_resumed',
  SCREEN_VIEWED:            'screen_viewed',
  SCREEN_LEFT:              'screen_left',
  SESSION_STARTED:          'session_started',
  SESSION_ENDED:            'session_ended',

  // Auth & onboarding (§5.2)
  SIGNUP_STARTED:           'signup_started',
  SIGNUP_STEP_COMPLETED:    'signup_step_completed',
  SIGNUP_COMPLETED:         'signup_completed',
  LOGIN_SUCCEEDED:          'login_succeeded',
  LOGIN_FAILED:             'login_failed',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',

  // Dosha quiz / vikriti (§5.3 / §5.4)
  DOSHA_QUIZ_STARTED:           'dosha_quiz_started',
  DOSHA_QUIZ_QUESTION_ANSWERED: 'dosha_quiz_question_answered',
  DOSHA_QUIZ_COMPLETED:         'dosha_quiz_completed',
  DOSHA_QUIZ_ABANDONED:         'dosha_quiz_abandoned',
  VIKRITI_PROMPT_SHOWN:         'vikriti_prompt_shown',
  VIKRITI_STARTED:              'vikriti_started',
  VIKRITI_COMPLETED:            'vikriti_completed',
  VIKRITI_ABANDONED:            'vikriti_abandoned',

  // Practice flow (§5.5)
  PRACTICE_STARTED:        'practice_started',
  PRE_CHECKIN_SUBMITTED:   'pre_checkin_submitted',
  POSE_STARTED:            'pose_started',
  POSE_SKIPPED:            'pose_skipped',
  POSE_REPEATED:           'pose_repeated',
  POSE_COMPLETED:          'pose_completed',
  VOICE_TOGGLED:           'voice_toggled',
  PRACTICE_PAUSED:         'practice_paused',
  PRACTICE_RESUMED:        'practice_resumed',
  WHY_THIS_POSE_OPENED:    'why_this_pose_opened',
  PRACTICE_COMPLETED:      'practice_completed',
  PRACTICE_ABANDONED:      'practice_abandoned',
  POST_CHECKIN_SUBMITTED:  'post_checkin_submitted',

  // Discovery & search (§5.6)
  ROUTINE_CARD_TAPPED:    'routine_card_tapped',
  ROUTINE_SWITCHED:       'routine_switched',
  ASANA_CARD_TAPPED:      'asana_card_tapped',
  SEARCH_SUBMITTED:       'search_submitted',
  SEARCH_RESULT_CLICKED:  'search_result_clicked',

  // Profile & account (§5.7)
  PROFILE_UPDATED:    'profile_updated',
  CONSENT_CHANGED:    'consent_changed',
  DATA_EXPORTED:      'data_exported',
  PASSWORD_CHANGED:   'password_changed',
  ACCOUNT_DELETED:    'account_deleted',

  // Engagement & attention (§5.8)
  SCROLL_DEPTH_REACHED:  'scroll_depth_reached',
  CONTENT_IMPRESSION:    'content_impression',
  CTA_CLICKED:           'cta_clicked',
  ELEMENT_ENGAGED:       'element_engaged',
  ENGAGEMENT_HEARTBEAT:  'engagement_heartbeat',

  // Errors (§5.9)
  ERROR_CAUGHT:           'error_caught',
})

// ─── Internal state ──────────────────────────────────────────────────────

let _distinctId = null         // resolved on first call (lazy, requires window)
let _superProps  = {}          // set via setSuperProps + AuthContext
let _sessionId   = null        // current session id (random per session)
let _sessionStartedAt = null
let _initialized = false

// Vendor handle. Null until PostHog finishes its dynamic import + init.
let _vendor = null

// Pending events fired before the SDK chunk finishes downloading. Cleared
// by flushQueue() once the vendor is live. Capped so a runaway loop can't
// blow up memory if the SDK never loads.
const _queue = []
const QUEUE_MAX = 100

// ─── PII scrubbing (mirrors analytics.js stripLikelyPII) ─────────────────
const PII_KEY_RE =
  /(email|mail|^name$|full_?name|display_?name|phone|address|lat|lng|latitude|longitude|^ip$|geo|user_?id|device_?id|advertising_?id|password|token|secret)/i

const MAX_STR = 200

function scrub(props) {
  if (!props || typeof props !== 'object') return {}
  const out = {}
  for (const [k, v] of Object.entries(props)) {
    if (PII_KEY_RE.test(k)) continue
    if (v == null) continue
    if (typeof v === 'string') {
      out[k] = v.length > MAX_STR ? v.slice(0, MAX_STR) : v
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      out[k] = v
    } else if (Array.isArray(v)) {
      // Allow primitive arrays only; objects-in-arrays get stringified short.
      out[k] = v.slice(0, 20).map(x =>
        typeof x === 'object' ? String(x).slice(0, MAX_STR) : x
      )
    } else if (typeof v === 'object') {
      // Recurse one level deep — deeper trees get dropped to keep events flat.
      out[k] = scrub(v)
    }
  }
  return out
}

// ─── Identifier resolution ───────────────────────────────────────────────

function distinctId() {
  if (_distinctId) return _distinctId
  if (typeof window === 'undefined') return null
  _distinctId = getAnonId()
  return _distinctId
}

function newSessionId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch { /* ignore */ }
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function ensureSession() {
  if (_sessionId) return _sessionId
  _sessionId = newSessionId()
  _sessionStartedAt = Date.now()
  return _sessionId
}

// ─── Vendor emit shim ────────────────────────────────────────────────────
// In Chunk 3 this becomes:   _vendor?.capture(name, payload)
// For now: dev-only console log so we can validate wiring without a vendor.

function _emit(name, payload) {
  // Vendor not ready yet — queue and dev-log. flushQueue() drains this
  // once posthog finishes its dynamic import + init.
  if (!_vendor) {
    if (_queue.length < QUEUE_MAX) _queue.push({ name, payload })
    if (import.meta.env.DEV) console.log('[track] queued (vendor booting):', name)
    return
  }

  if (name === '$identify' && typeof _vendor.identify === 'function') {
    try { _vendor.identify(payload.distinct_id, payload.set || {}) } catch (err) {
      console.error('[track] identify failed:', err?.message || err)
    }
    if (import.meta.env.DEV) console.log('[track] identify', payload.distinct_id, payload.set)
    return
  }

  if (typeof _vendor.capture === 'function') {
    try { _vendor.capture(name, payload) } catch (err) {
      console.error('[track] vendor emit failed:', err?.message || err)
    }
  }
  if (import.meta.env.DEV) {
    console.log('[track]', name, payload)
  }
}

function flushQueue() {
  if (!_vendor || _queue.length === 0) return
  const batch = _queue.splice(0, _queue.length)
  if (import.meta.env.DEV) console.log('[track] flushing', batch.length, 'queued event(s)')
  for (const { name, payload } of batch) _emit(name, payload)
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Initialize the façade. Safe to call multiple times. Subscribes to consent
 * so future grant/revoke flips tracking without a reload. Lazily boots the
 * PostHog SDK the first time consent is granted.
 */
export function init() {
  if (_initialized) return
  _initialized = true
  ensureSession()

  // First-time boot of PostHog if consent is already granted from a prior
  // session (localStorage). If not granted, we wait for the consent
  // subscriber below to flip us on.
  if (isAggregateAllowed()) bootVendor()

  subscribeConsent(() => {
    if (isAggregateAllowed()) {
      bootVendor()
    } else {
      // Consent withdrawn — stop sending and forget the user.
      teardownVendor()
      _superProps = {}
      _distinctId = null
    }
  })
}

// ─── Vendor lifecycle ────────────────────────────────────────────────────

// Promise-tracked so concurrent track() calls during boot all wait on the
// same load and we never double-init.
let _vendorBootPromise = null

async function bootVendor() {
  if (_vendor || _vendorBootPromise) return _vendorBootPromise
  const key  = import.meta.env.VITE_POSTHOG_KEY
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com'
  if (!key) {
    if (import.meta.env.DEV) {
      console.warn('[track] VITE_POSTHOG_KEY missing — staying in no-op mode')
    }
    return
  }
  _vendorBootPromise = (async () => {
    try {
      // Dynamic import so PostHog (~60KB gzipped) is code-split into its
      // own chunk and only fetched the first time consent is granted.
      const mod = await import('posthog-js')
      const posthog = mod.default || mod
      posthog.init(key, {
        api_host: host,
        // We fire screen_viewed ourselves with a stable route_name from the
        // router (Chunk 4); auto-capturing pageviews on top would double-count.
        capture_pageview: false,
        capture_pageleave: false,
        // Explicit events from our taxonomy only — no DOM auto-capture.
        autocapture: false,
        // Privacy posture: never record session by default. Heatmap & replay
        // can be turned on per-feature later, with consent re-prompt.
        disable_session_recording: true,
        persistence: 'localStorage+cookie',
        // PostHog charges per event; we identify lazily so anon users don't
        // each create a person profile until they actually sign up.
        person_profiles: 'identified_only',
        // We already gate every event behind our own consent flag
        // (isAggregateAllowed). Honoring DNT on top of that means a user
        // who consented in our UI but has DNT on at the OS/browser level
        // would silently drop everything — surprising and hard to debug.
        // Defer to our explicit consent UI as the single source of truth.
        respect_dnt: false,
        // Expose for ad-hoc dev poking + diagnostics. Harmless in prod.
        debug: import.meta.env.DEV,
        loaded: ph => {
          // Bind the device's stable anon id so events from before this load
          // (queued in the SDK) and events after share one distinct_id.
          try { ph.register({ anon_id: getAnonId() }) } catch { /* ignore */ }
          // Surface the SDK on window in dev so you can call
          // `posthog.capture('test')` from DevTools to bypass the façade.
          if (import.meta.env.DEV && typeof window !== 'undefined') {
            window.posthog = ph
          }
        },
      })
      _vendor = posthog
      flushQueue()
    } catch (err) {
      console.error('[track] PostHog load failed:', err?.message || err)
    } finally {
      _vendorBootPromise = null
    }
  })()
  return _vendorBootPromise
}

function teardownVendor() {
  if (!_vendor) return
  try { _vendor.opt_out_capturing() } catch { /* ignore */ }
  try { _vendor.reset() } catch { /* ignore */ }
  _vendor = null
}

/**
 * Fire a tracked event. Silently no-ops when consent is not granted.
 *
 * @param {string} name  Event name from EVENTS (or a snake_case literal in
 *                       a pinch — but please add it to EVENTS + the doc).
 * @param {object} props Flat key/value bag. PII keys are dropped; strings
 *                       are truncated to 200 chars.
 */
export function track(name, props = {}) {
  if (!isAggregateAllowed()) {
    if (import.meta.env.DEV) {
      console.log('[track] dropped (no aggregate consent):', name)
    }
    return
  }
  if (!name || typeof name !== 'string') return
  init()
  const payload = {
    ...scrub(_superProps),
    ...scrub(props),
    distinct_id: distinctId(),
    session_id: ensureSession(),
    ts: new Date().toISOString(),
  }
  _emit(name, payload)
}

/**
 * Convenience for screen_viewed. Passes a stable `route_name` so dashboards
 * group correctly even if the URL has params.
 */
export function screen(routeName, props = {}) {
  if (!routeName) return
  track(EVENTS.SCREEN_VIEWED, { route_name: routeName, ...props })
}

/**
 * Bind the current device id to an authenticated user. Call from
 * AuthContext on session resolved. PostHog (Chunk 3) will alias the prior
 * anon id to the user id under the hood so pre-login events count.
 */
export function identify(userId, traits = {}) {
  if (!isAggregateAllowed()) return
  if (!userId) return
  init()
  _distinctId = String(userId)
  _superProps = { ..._superProps, ...scrub(traits) }
  _emit('$identify', {
    distinct_id: _distinctId,
    set: scrub(traits),
  })
}

/**
 * Update super-properties (sent on every subsequent event). Call when
 * dosha changes, streak ticks, experience-level promotes, etc.
 */
export function setSuperProps(traits = {}) {
  _superProps = { ..._superProps, ...scrub(traits) }
}

/**
 * Forget the current identity and start a fresh anonymous session.
 * Call on logout and on consent revoke.
 */
export function reset() {
  _superProps = {}
  _sessionId = null
  _sessionStartedAt = null
  // Mint a fresh anon id so the next session can't be joined to the old user.
  _distinctId = null
  if (_vendor && typeof _vendor.reset === 'function') {
    try { _vendor.reset() } catch { /* ignore */ }
  }
}

/**
 * For Chunk 3 only — wire the PostHog client in. Kept as a setter so the
 * façade has zero hard dependency on the SDK package today.
 */
export function _setVendor(vendor) {
  _vendor = vendor
}

// Default export is the bag of public methods, so callers can choose
// `import track from` for the single-method case or named imports for
// the rest. Both styles are fine.
export default { track, screen, identify, setSuperProps, reset, init, EVENTS }
