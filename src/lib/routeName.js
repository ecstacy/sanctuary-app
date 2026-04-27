// ─────────────────────────────────────────────────────────────────────────────
//  routeName.js — pathname → stable analytics route name
//
//  Why a map and not the path itself?
//  ----------------------------------
//  PostHog (and any product-analytics tool) groups events by string. If we
//  ship `screen_viewed` with `path: '/asana/tadasana'`, every asana becomes
//  its own row in the dashboard — useless for "did the user open *an*
//  asana detail page?". We strip the params here and emit a stable name
//  like `asana_detail`. The original `path` still goes through as a
//  property for drill-down.
//
//  Add a new screen? Add an entry. Unknown routes fall back to `unknown`
//  so dashboards surface the gap and we add it.
// ─────────────────────────────────────────────────────────────────────────────

// Static one-to-one mappings.
const STATIC = {
  '/':                 'welcome',
  '/welcome':          'welcome',
  '/login':            'login',
  '/signup':           'signup',
  '/forgot-password':  'forgot_password',
  '/reset-password':   'reset_password',
  '/preview':          'preview',
  '/home':             'home',
  '/discover':         'discover',
  '/recommendations':  'recommendations',
  '/profile':          'profile',
  '/dosha-quiz':       'dosha_quiz',
  '/dosha':            'dosha_profile',
  '/dosha-profile':    'dosha_profile',
  '/vikriti':          'vikriti_quiz',
  '/journey':          'journey',
  '/routine':          'routine',
}

// Patterns for parameterized routes. First match wins. Each tester returns
// the canonical route_name string (or null).
const PATTERNS = [
  [/^\/asana\/[^/]+$/,            'asana_detail'],
  [/^\/practice\/asana\/[^/]+$/,  'practice_single'],
  [/^\/practice\/[^/]+$/,         'practice'],
]

export function routeNameFor(pathname) {
  if (!pathname) return 'unknown'
  // Trim trailing slash so '/home/' and '/home' map the same.
  const path = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname
  if (STATIC[path]) return STATIC[path]
  for (const [re, name] of PATTERNS) {
    if (re.test(path)) return name
  }
  return 'unknown'
}
