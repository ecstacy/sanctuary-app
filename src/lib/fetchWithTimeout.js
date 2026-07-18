// ─────────────────────────────────────────────────────────────────────────────
//  fetchWithTimeout — a deadline on every network call
//
//  WHY
//  ───
//  Nothing in the app bounded a request. `fetch` has no default timeout, so a
//  request that never resolves (captive-wifi portal, dropped mobile data,
//  a hung server) leaves the promise pending FOREVER. In practice that means
//  a spinner that never stops and a flow the user can't retry or escape —
//  sign-in, checkout, and the daily-session load are all `await`-ed.
//
//  Mobile is where this bites: a phone moving between cell and wifi can hold
//  a socket open indefinitely rather than failing fast.
//
//  This wraps fetch with an AbortController deadline and normalises the
//  timeout into a real Error the callers can branch on (`err.isTimeout`).
//  Supabase-js takes a custom `fetch`, so wiring it there covers every
//  query, auth call, RPC and edge-function invocation at once — far more
//  reliable than remembering to wrap each call site.
// ─────────────────────────────────────────────────────────────────────────────

/** Default deadline. Generous enough for a cold Supabase start on slow mobile. */
export const DEFAULT_TIMEOUT_MS = 15_000

export class TimeoutError extends Error {
  constructor(ms, url) {
    super(`Request timed out after ${ms}ms`)
    this.name = 'TimeoutError'
    this.isTimeout = true
    this.timeoutMs = ms
    this.url = url
  }
}

/**
 * fetch with an abort deadline.
 *
 * Honours a caller-supplied `signal` as well, so Supabase's own cancellation
 * (and React cleanup) still work — whichever aborts first wins.
 *
 * @param {RequestInfo|URL} input
 * @param {RequestInit & { timeoutMs?: number }} [init]
 * @returns {Promise<Response>}
 */
export function fetchWithTimeout(input, init = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal: callerSignal, ...rest } = init

  // No AbortController (ancient webview) — degrade to a plain fetch rather
  // than throwing. Better an unbounded request than a broken app.
  if (typeof AbortController === 'undefined') {
    return fetch(input, { ...rest, signal: callerSignal })
  }

  const controller = new AbortController()
  let timedOut = false

  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  // Chain the caller's signal so external cancellation still propagates.
  const onCallerAbort = () => controller.abort()
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort()
    else callerSignal.addEventListener('abort', onCallerAbort, { once: true })
  }

  return fetch(input, { ...rest, signal: controller.signal })
    .catch((err) => {
      // Distinguish "we gave up" from "the caller cancelled" — only the
      // former is an error worth surfacing/retrying.
      if (timedOut) {
        throw new TimeoutError(
          timeoutMs,
          typeof input === 'string' ? input : input?.url,
        )
      }
      throw err
    })
    .finally(() => {
      clearTimeout(timer)
      if (callerSignal) callerSignal.removeEventListener('abort', onCallerAbort)
    })
}
