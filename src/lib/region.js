// ─────────────────────────────────────────────────────────────────────────────
//  region.js — coarse client-side region detection for purchase gating
//
//  WHY THIS EXISTS
//  ---------------
//  Selling digital subscriptions to consumers in some jurisdictions triggers
//  registration obligations we haven't met yet:
//    • India — OIDAR registration + GST filings (deferred for v1; see
//      sanctuary-plus-legal-todos.md).
//  Until those are in place we should not *sell* Plus into those regions.
//  Promo-code redemption (a free internal grant, not a sale) is still fine
//  everywhere — it doesn't trigger sales-tax / OIDAR obligations.
//
//  ENFORCEMENT LAYERS
//  ------------------
//  This is the UX layer: don't show paid plans to a user we shouldn't sell
//  to, and show an honest "not available in your region yet" message instead.
//  The HARD enforcement is Stripe-side — configure allowed countries on the
//  Payment Link / Checkout so a determined user still can't complete a
//  purchase. Treat this module as the friendly front door, not the lock.
//
//  DETECTION
//  ---------
//  Timezone (Intl) is the most reliable zero-dependency signal we have on the
//  client — far better than navigator.language (which reflects UI language,
//  not location). It's still spoofable and imperfect (a traveller, a
//  mis-set device), which is exactly why Stripe's country restriction is the
//  real guard. Good enough for a v1 soft-launch front door.
// ─────────────────────────────────────────────────────────────────────────────

// IANA timezones that map to regions where Plus purchase is gated for v1.
// India only for now; structured so adding US/UK/etc. later is one line.
const RESTRICTED_TIMEZONES = new Set([
  'Asia/Kolkata',
  'Asia/Calcutta',   // legacy alias still emitted by some devices
])

// Returns the user's IANA timezone, or '' if unavailable.
export function getTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    return ''
  }
}

// True when we should NOT offer paid Plus plans to this user (region not yet
// supported for sales). Promo redemption stays available regardless.
export function isPlusPurchaseRestricted() {
  return RESTRICTED_TIMEZONES.has(getTimeZone())
}

// A coarse label for analytics so we can see how often the restriction fires
// and from where, without storing precise location.
export function getCoarseRegion() {
  const tz = getTimeZone()
  if (RESTRICTED_TIMEZONES.has(tz)) return 'IN'
  return tz.split('/')[0] || 'unknown'   // e.g. 'Europe', 'America'
}
