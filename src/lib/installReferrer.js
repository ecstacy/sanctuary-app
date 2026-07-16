// ─────────────────────────────────────────────────────────────────────────────
//  installReferrer.js — first-launch install attribution (Android)
//
//  The website's Play badge carries the content campaign's utm_* params into
//  the store URL's `referrer=` param (website/assets/site.js); Google Play
//  hands that string back to the app exactly once via the Install Referrer
//  API. We read it on first launch, fire `install_attributed`, and pin the
//  acquisition source as super-props so every later event of this user can be
//  cohorted by campaign (docs/growth-plan.md §4).
//
//  Sideloads/adb/emulators have no referrer — that resolves as ok=false and
//  we mark the read consumed so we never ask again. A transient service
//  error leaves the flag unset so the next launch retries.
// ─────────────────────────────────────────────────────────────────────────────

import { Capacitor, registerPlugin } from '@capacitor/core'
import { track, setSuperProps, EVENTS } from './track'

const InstallReferrer = registerPlugin('InstallReferrer')

const CONSUMED_KEY = 'sanctuary.installReferrerConsumed'

export async function readInstallReferrerOnce() {
  if (Capacitor.getPlatform() !== 'android') return
  try {
    if (localStorage.getItem(CONSUMED_KEY)) return
  } catch { return }

  let res
  try {
    res = await InstallReferrer.getReferrer()
  } catch {
    return // plugin missing (old build) — retry next launch
  }

  // Transient failure → retry next launch. Definitive states are consumed.
  if (!res?.ok && res?.error === 'service_disconnected') return
  try { localStorage.setItem(CONSUMED_KEY, '1') } catch { /* ignore */ }

  if (!res?.ok || !res.referrer) return

  // Play's organic default is "utm_source=google-play&utm_medium=organic".
  // We fire for anything with a utm_source, organic included — the breakdown
  // separates campaigns from organic in the dashboards.
  const params = new URLSearchParams(res.referrer)
  const source = params.get('utm_source')
  if (!source) return

  const attribution = {
    utm_source:   source,
    utm_medium:   params.get('utm_medium')   || null,
    utm_campaign: params.get('utm_campaign') || null,
    utm_content:  params.get('utm_content')  || null,
  }
  setSuperProps({
    acquisition_source:   attribution.utm_source,
    acquisition_campaign: attribution.utm_campaign,
  })
  track(EVENTS.INSTALL_ATTRIBUTED, attribution)
}
