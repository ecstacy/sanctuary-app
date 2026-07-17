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
//  Promo redemption stays available in both cases: a free grant is not a sale,
//  so it triggers neither Apple's IAP rule nor OIDAR/GST.
// ─────────────────────────────────────────────────────────────────────────────

import { Capacitor } from '@capacitor/core'
import { isPlusPurchaseRestricted } from './region'

/**
 * Why we can't sell Plus right now, or null if we can.
 * @returns {'ios' | 'region' | null}
 */
export function getPurchaseBlockReason() {
  // Platform first — it's absolute, region is jurisdictional.
  if (Capacitor.getPlatform() === 'ios') return 'ios'
  if (isPlusPurchaseRestricted()) return 'region'
  return null
}

/** True when paid plans may be shown and a checkout may be started. */
export function canSellPlus() {
  return getPurchaseBlockReason() === null
}
