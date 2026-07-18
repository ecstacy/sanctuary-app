// ── The Sanctuary website — attribution + analytics ─────────────────────────
// 1. UTM passthrough: campaign params on the page URL are re-encoded into the
//    Play Store link's `referrer=` param, so the app's Install Referrer read
//    can attribute the install back to the exact post/series (see
//    docs/growth-plan.md §4).
// 2. PostHog (EU, cookieless): memory persistence — no cookies, no banner.

(function () {
  // ── Campaign attribution, persisted for the visit ──
  // The landing page carries the utm_* params, but the highest-intent path is
  // landing → /quiz → store badge, and that internal hop drops the query
  // string. Persisting to sessionStorage keeps the campaign attached for the
  // whole visit, so the badge on the quiz RESULT still carries the referrer.
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var STORE_KEY = 'sanctuary.utms';
  var params = new URLSearchParams(window.location.search);

  var utms = [];
  KEYS.forEach(function (k) {
    var v = params.get(k);
    if (v) utms.push(k + '=' + encodeURIComponent(v));
  });

  try {
    if (utms.length) {
      // First touch of this visit wins — don't let a later param-less page
      // overwrite the campaign that actually brought the user in.
      sessionStorage.setItem(STORE_KEY, utms.join('&'));
    } else {
      var saved = sessionStorage.getItem(STORE_KEY);
      if (saved) utms = saved.split('&');
    }
  } catch (e) { /* private mode / storage blocked — degrade to URL-only */ }

  // Read a single param, falling back to the persisted set.
  function utmValue(key) {
    var direct = params.get(key);
    if (direct) return direct;
    var hit = utms.filter(function (p) { return p.indexOf(key + '=') === 0; })[0];
    return hit ? decodeURIComponent(hit.slice(key.length + 1)) : null;
  }

  // Exposed so pages that render badges AFTER load (e.g. the quiz result card)
  // can re-apply attribution — otherwise a dynamically inserted badge would
  // silently drop the campaign and break the install-attribution chain.
  function applyAttribution(root) {
    (root || document).querySelectorAll('a[data-play-link]').forEach(function (a) {
      if (utms.length) {
        var url = new URL(a.href);
        url.searchParams.set('referrer', utms.join('&'));
        a.href = url.toString();
      }
      if (a.dataset.attributionBound) return;
      a.dataset.attributionBound = '1';
      a.addEventListener('click', function () {
        if (!window.posthog) return;
        window.posthog.capture('store_badge_clicked', {
          store: 'google_play',
          placement: a.dataset.placement || 'unknown',
          utm_source: utmValue('utm_source'),
          utm_campaign: utmValue('utm_campaign'),
        });
      });
    });
  }
  window.sanctuaryApplyAttribution = applyAttribution;
  applyAttribution(document);

  // ── PostHog web analytics (same project as the app; platform=web) ──
  var POSTHOG_KEY = 'phc_sabRLt3PV658fMuK7w345tQZWJHeAkBwjdXqPmJ2gxym';
  var s = document.createElement('script');
  s.src = 'https://eu-assets.i.posthog.com/static/array.js';
  s.async = true;
  s.onload = function () {
    if (!window.posthog) return;
    window.posthog.init(POSTHOG_KEY, {
      api_host: 'https://eu.i.posthog.com',
      persistence: 'memory',          // cookieless — no consent banner needed
      capture_pageview: true,
      autocapture: false,             // only pageviews + explicit events
      register: { platform: 'web' },
    });
    // Badge click listeners are bound by applyAttribution() above (which also
    // covers badges rendered later), so nothing to wire here.
  };
  document.head.appendChild(s);
})();
