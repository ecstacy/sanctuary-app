// ─────────────────────────────────────────────────────────────────────────────
//  monetization.js — "may we sell Plus to this user, here, right now?"
//
//  Two independent reasons we may not sell, unified behind one question so
//  purchase surfaces never have to remember the list:
//
//    • 'ios'    — Apple App Store Review Guideline 3.1.1 requires digital
//                 subscriptions to be sold through In-App Purchase. Sanctuary
//                 Plus sells via Stripe Checkout, so we do not offer purchase
//                 on iOS at all, and we must not link out to a web purchase
//                 either (that's the same violation). iOS ships free-tier-first
//                 (docs/growth-plan.md §3.2); StoreKit is a later workstream.
//    • 'region' — jurisdictions we're not yet registered to sell into
//                 (India / OIDAR + GST for v1). See lib/region.js.
//
//  ENTITLEMENT IS UNAFFECTED. useIsPremium() stays the source of truth: a user
//  who bought Plus on Android or the web keeps their features on iOS. Apple
//  permits honouring an entitlement purchased elsewhere — what it forbids is
//  *selling* or *steering to* an external purchase inside the app. So we gate
//  the buy path, never the access path.
//
//  Promo redemption stays available in all cases: a free grant is not a sale,
//  so it triggers neither Apple's IAP rule nor OIDAR/GST — and it's how we grant
//  Plus to ourselves/testers while selling is globally off (see 'prelaunch').
//
//    • 'prelaunch' — a global kill-switch (VITE_SELLING_ENABLED, default off).
//                 The Play launch ships free-tier-first: no payments/tax profile
//                 is required of a free app, so this decouples the store launch
//                 from the German Steuernummer wait (docs/TODO.md #11). Flip the
//                 env to 'true' and rebuild to turn selling on globally once the
//                 tax ID lands — no code change, no re-review.
// ─────────────────────────────────────────────────────────────────────────────

import { Capacitor } from '@capacitor/core'
import { isPlusPurchaseRestricted } from './region'

// Global selling switch. Explicit env wins; otherwise it defaults ON in dev
// (so the real paywall stays testable locally) and OFF in a production build
// (so a release cut without the env var is launch-safe / free-tier-first).
// To monetize: set VITE_SELLING_ENABLED=true for the release build.
const SELLING_ENABLED = import.meta.env.VITE_SELLING_ENABLED != null
  ? import.meta.env.VITE_SELLING_ENABLED === 'true'
  : import.meta.env.DEV === true

/**
 * Why we can't sell Plus right now, or null if we can.
 * @returns {'prelaunch' | 'ios' | 'region' | null}
 */
export function getPurchaseBlockReason() {
  // Global kill-switch first — when selling is off, that's the honest reason
  // on every platform and region, and nothing below should override it.
  if (!SELLING_ENABLED) return 'prelaunch'
  // Platform next — it's absolute; region is jurisdictional.
  if (Capacitor.getPlatform() === 'ios') return 'ios'
  if (isPlusPurchaseRestricted()) return 'region'
  return null
}

/** True when paid plans may be shown and a checkout may be started. */
export function canSellPlus() {
  return getPurchaseBlockReason() === null
}
