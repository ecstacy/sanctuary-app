// ─────────────────────────────────────────────────────────────────────────────
//  crash.js — native crash + non-fatal error reporting via Firebase Crashlytics
//
//  Sister module to track.js. Where track.js answers product-level
//  questions ("did the user complete onboarding?"), this module answers
//  reliability questions ("which devices crash on the practice screen?")
//  and stays close to the metal so we capture native ANRs / segfaults
//  the JS layer can't see.
//
//  ── Contract ─────────────────────────────────────────────────────────────
//   • Consent-gated. Silent no-op until `isCrashReportingAllowed()` is true.
//     The user can flip this independently of aggregate analytics — see
//     ProfilePage privacy block.
//   • Native-only. The Capacitor plugin is Android (and iOS). On web we
//     no-op entirely — no point shipping a fake JS Crashlytics that
//     reports nowhere useful.
//   • Fire-and-forget. Never throws, never blocks UI.
//   • Lazy-loaded. The plugin module is dynamic-imported on first use so
//     web bundles don't pay for the wrapper.
//
//  ── Usage ────────────────────────────────────────────────────────────────
//      import { recordError, setUserId } from '../lib/crash'
//      try { await dangerousThing() }
//      catch (err) { recordError(err, { where: 'PracticePage:save' }) }
// ─────────────────────────────────────────────────────────────────────────────

import { Capacitor } from '@capacitor/core'
import { isCrashReportingAllowed, subscribe as subscribeConsent } from './consent'

// Lazy module ref. Populated on first successful boot, cleared on opt-out.
let _plugin = null
let _bootPromise = null
let _initialized = false
let _userId = null
const _customKeys = {}

function isSupported() {
  // Capacitor plugin is native-only. The web shim does nothing useful;
  // skip it entirely so we don't waste a chunk download.
  return Capacitor.isNativePlatform()
}

async function bootPlugin() {
  if (_plugin || _bootPromise) return _bootPromise
  if (!isSupported()) return null
  _bootPromise = (async () => {
    try {
      const mod = await import('@capacitor-firebase/crashlytics')
      _plugin = mod.FirebaseCrashlytics
      // Crashlytics is enabled by default on the native side. We want it
      // explicitly bound to our consent flag so a user who declined gets
      // collection turned off at the SDK level too.
      await _plugin.setEnabled({ enabled: true })
      // Re-apply any identity / custom keys that were set before the
      // plugin finished loading.
      if (_userId) await _plugin.setUserId({ userId: String(_userId) })
      for (const [k, v] of Object.entries(_customKeys)) {
        await applyCustomKey(k, v)
      }
    } catch (err) {
      console.error('[crash] plugin load failed:', err?.message || err)
    } finally {
      _bootPromise = null
    }
  })()
  return _bootPromise
}

async function applyCustomKey(key, value) {
  if (!_plugin) return
  try {
    if (typeof value === 'boolean') {
      await _plugin.setCustomKey({ key, value, type: 'boolean' })
    } else if (typeof value === 'number') {
      await _plugin.setCustomKey({ key, value, type: Number.isInteger(value) ? 'long' : 'double' })
    } else {
      await _plugin.setCustomKey({ key, value: String(value).slice(0, 100), type: 'string' })
    }
  } catch (err) {
    console.error('[crash] setCustomKey failed:', err?.message || err)
  }
}

async function teardownPlugin() {
  if (!_plugin) return
  try {
    await _plugin.setEnabled({ enabled: false })
    // Forget the user binding so a later opt-in starts clean.
    await _plugin.setUserId({ userId: '' })
  } catch { /* ignore */ }
  _plugin = null
}

// ─── Public API ──────────────────────────────────────────────────────────

export function init() {
  if (_initialized) return
  _initialized = true
  if (isCrashReportingAllowed()) bootPlugin()
  subscribeConsent(() => {
    if (isCrashReportingAllowed()) bootPlugin()
    else teardownPlugin()
  })
}

export function setUserId(userId) {
  _userId = userId || null
  if (!isCrashReportingAllowed() || !isSupported()) return
  ;(async () => {
    if (!_plugin) await bootPlugin()
    if (_plugin) {
      try { await _plugin.setUserId({ userId: String(userId || '') }) }
      catch (err) { console.error('[crash] setUserId failed:', err?.message || err) }
    }
  })()
}

export function setCustomKey(key, value) {
  if (!key) return
  _customKeys[key] = value
  if (!isCrashReportingAllowed() || !isSupported()) return
  ;(async () => {
    if (!_plugin) await bootPlugin()
    await applyCustomKey(key, value)
  })()
}

/**
 * Record a non-fatal error. Use this in catch blocks for things that
 * shouldn't take the app down but you still want triage on.
 */
export function recordError(error, context = {}) {
  if (!isCrashReportingAllowed() || !isSupported()) return
  const message = error?.message || String(error || 'unknown')
  const stack   = error?.stack
  ;(async () => {
    if (!_plugin) await bootPlugin()
    if (!_plugin) return
    // Push context as custom keys around the recorded error so they
    // appear on the Crashlytics issue page. Keys are namespaced so they
    // don't pollute the persistent ones set via setCustomKey().
    for (const [k, v] of Object.entries(context || {})) {
      await applyCustomKey(`ctx_${k}`, v)
    }
    try {
      await _plugin.recordException({ message, stacktrace: stack ? parseStack(stack) : [] })
    } catch (err) {
      console.error('[crash] recordException failed:', err?.message || err)
    }
  })()
}

/**
 * Force a native crash — DEV ONLY. Wired to a hidden settings button so
 * we can verify the integration end-to-end. Throws on web because there's
 * no native side to crash; the caller should guard with isSupported().
 */
export function _forceTestCrash() {
  if (!isSupported() || !_plugin) {
    throw new Error('[crash] no native plugin loaded — open the Android APK with consent ON')
  }
  // Fire-and-forget; the process is about to die anyway.
  _plugin.crash({ message: 'Test crash from src/lib/crash.js _forceTestCrash' })
}

/**
 * Forget the current identity. Call on logout.
 */
export function reset() {
  _userId = null
  if (!_plugin) return
  ;(async () => {
    try { await _plugin.setUserId({ userId: '' }) } catch { /* ignore */ }
  })()
}

// ─── Stack parser ────────────────────────────────────────────────────────
// Crashlytics expects a structured stacktrace array. Browser stack
// strings vary by engine — this is a pragmatic V8/WebView parser that
// handles the typical "at fn (file:line:col)" format.
function parseStack(stack) {
  if (!stack || typeof stack !== 'string') return []
  const out = []
  for (const line of stack.split('\n').slice(0, 30)) {
    const m = line.match(/at\s+(?:(.+?)\s+\()?([^)]+):(\d+):(\d+)\)?/)
    if (!m) continue
    out.push({
      functionName: m[1] || '<anonymous>',
      fileName:     m[2],
      lineNumber:   parseInt(m[3], 10),
      columnNumber: parseInt(m[4], 10),
    })
  }
  return out
}
