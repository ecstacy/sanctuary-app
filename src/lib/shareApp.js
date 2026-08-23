// ─────────────────────────────────────────────────────────────────────────────
//  shareApp — "tell a friend about The Sanctuary".
//
//  Layered, same approach as dataExport.js: the native share sheet (Web Share
//  API, which the Capacitor Android WebView supports) with a clipboard-copy
//  fallback for platforms without it. No native plugin, so no Gradle rebuild.
//
//  The link carries app_share UTM params so installs from a friend's share are
//  attributed as referral in the acquisition breakdown (see lib/installReferrer).
//  It points at the marketing site — which goes live with the Cloudflare deploy
//  (TODO #13); until then the share still works, the link just isn't reachable.
// ─────────────────────────────────────────────────────────────────────────────

import { track, EVENTS } from './track'

export const SHARE_URL = 'https://www.thesanctuaryteam.com/?utm_source=app_share&utm_medium=referral&utm_campaign=word_of_mouth'

/**
 * Open the share sheet (or copy the link). Returns how it resolved so the caller
 * can confirm to the user ('share' | 'clipboard' | 'cancelled' | 'unavailable').
 * @param {object} opts
 * @param {string} opts.surface  where the share was triggered ('profile' | 'home')
 * @param {(key:string, fallback:string)=>string} [opts.t]  i18n fn for the message
 */
export async function shareApp({ surface = 'unknown', t } = {}) {
  const tr = typeof t === 'function' ? t : (_k, fallback) => fallback
  const title = tr('share.title', 'The Sanctuary')
  const text = tr('share.message', 'I’ve been using The Sanctuary — personalized yoga & Ayurveda for your dosha. Thought you’d like it:')

  track(EVENTS.CTA_CLICKED, { cta_id: `share_app_${surface}`, route_name: surface })

  // Native share sheet (mobile browsers + the Android WebView).
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url: SHARE_URL })
      track('app_shared', { surface, method: 'share_sheet' })
      return 'share'
    } catch (err) {
      // AbortError = the user dismissed the sheet; anything else → try clipboard.
      if (err && err.name === 'AbortError') return 'cancelled'
    }
  }

  // Fallback: copy the link so they can paste it anywhere.
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(SHARE_URL)
      track('app_shared', { surface, method: 'clipboard' })
      return 'clipboard'
    }
  } catch { /* clipboard blocked — fall through */ }

  return 'unavailable'
}
