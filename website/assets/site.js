// ── The Sanctuary website — attribution + analytics ─────────────────────────
// 1. UTM passthrough: campaign params on the page URL are re-encoded into the
//    Play Store link's `referrer=` param, so the app's Install Referrer read
//    can attribute the install back to the exact post/series (see
//    docs/growth-plan.md §4).
// 2. PostHog (EU, cookieless): memory persistence — no cookies, no banner.

(function () {
  // ── Launch state ──
  // The app is not published on Google Play yet (waiting on the org account /
  // D-U-N-S). Until it is, we must NOT show the official "Get it on Google
  // Play" badge pointing at a dead listing — it 404s and breaks Play's brand
  // rules. So every badge renders a "Coming soon" pill that keeps the funnel
  // moving to /quiz. Flip this to true the day the app publishes — one line,
  // and every badge across the site (landing, quiz result, 76 pose pages)
  // becomes the real, attribution-carrying Play link.
  var APP_LIVE = false;

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
      if (!APP_LIVE) {
        // ── Coming-soon state ──
        if (!a.dataset.soon) {
          a.dataset.soon = '1';
          a.classList.add('play-badge--soon');
          a.setAttribute('href', '/quiz');
          a.setAttribute('aria-label', 'Coming soon on Google Play — take the free dosha quiz');
          a.innerHTML =
            '<span class="soon-pill"><span class="soon-dot"></span>Coming soon on Google Play</span>';
          a.addEventListener('click', function () {
            if (!window.posthog) return;
            window.posthog.capture('coming_soon_badge_clicked', {
              placement: a.dataset.placement || 'unknown',
              utm_source: utmValue('utm_source'),
              utm_campaign: utmValue('utm_campaign'),
            });
          });
        }
        a.style.visibility = 'visible';
        return;
      }

      // ── Live state — real Play badge + install attribution ──
      if (utms.length) {
        var url = new URL(a.href);
        url.searchParams.set('referrer', utms.join('&'));
        a.href = url.toString();
      }
      if (!a.dataset.attributionBound) {
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
      }
      a.style.visibility = 'visible';
    });

    // Non-badge prose links to Play (e.g. the quiz page sentence) — while
    // coming-soon, redirect them to /quiz so they aren't dead ends.
    if (!APP_LIVE) {
      (root || document).querySelectorAll('a[href*="play.google.com/store"]:not([data-play-link])').forEach(function (a) {
        a.setAttribute('href', '/quiz');
      });
    }
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
