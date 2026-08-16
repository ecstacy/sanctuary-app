// ─────────────────────────────────────────────────────────────────────────────
//  backInterceptor.js — a tiny stack of "handle the back press myself" hooks.
//
//  Android's hardware/edge-swipe back is handled in ONE place (App.jsx's
//  BackButtonHandler → window.history.back). A page that has an in-page step to
//  unwind first — e.g. Meal Check showing a result, which is page STATE not a
//  route — registers an interceptor here. The global handler runs the top
//  interceptor before touching history; if it returns true the back press was
//  consumed and the route is left untouched.
//
//  A stack (not a single slot) so nested/stacked pages compose: the most
//  recently registered gets first refusal.
// ─────────────────────────────────────────────────────────────────────────────

const stack = []

/** Register a back interceptor. Returns an unregister fn (call it on cleanup). */
export function pushBackInterceptor(fn) {
  stack.push(fn)
  return () => {
    const i = stack.lastIndexOf(fn)
    if (i >= 0) stack.splice(i, 1)
  }
}

/** Run the top interceptor. Returns true if one consumed the back press. */
export function runBackInterceptors() {
  for (let i = stack.length - 1; i >= 0; i--) {
    try { if (stack[i]()) return true } catch { /* a broken interceptor must not trap back */ }
  }
  return false
}
