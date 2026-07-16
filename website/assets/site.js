// ── The Sanctuary website — attribution + analytics ─────────────────────────
// 1. UTM passthrough: campaign params on the page URL are re-encoded into the
//    Play Store link's `referrer=` param, so the app's Install Referrer read
//    can attribute the install back to the exact post/series (see
//    docs/growth-plan.md §4).
// 2. PostHog (EU, cookieless): memory persistence — no cookies, no banner.

(function () {
  // ── UTM passthrough onto every Play badge ──
  var params = new URLSearchParams(window.location.search);
  var utms = [];
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
    var v = params.get(k);
    if (v) utms.push(k + '=' + encodeURIComponent(v));
  });
  if (utms.length) {
    var referrer = encodeURIComponent(utms.join('&'));
    document.querySelectorAll('a[data-play-link]').forEach(function (a) {
      var url = new URL(a.href);
      url.searchParams.set('referrer', decodeURIComponent(referrer));
      a.href = url.toString();
    });
  }

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
    // Store-badge clicks are the website's conversion event.
    document.querySelectorAll('a[data-play-link]').forEach(function (a) {
      a.addEventListener('click', function () {
        window.posthog.capture('store_badge_clicked', {
          store: 'google_play',
          utm_source: params.get('utm_source') || null,
          utm_campaign: params.get('utm_campaign') || null,
        });
      });
    });
  };
  document.head.appendChild(s);
})();
