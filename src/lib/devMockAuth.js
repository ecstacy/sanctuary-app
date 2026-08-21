// ─────────────────────────────────────────────────────────────────────────────
//  devMockAuth — a DEVELOPMENT-ONLY logged-in session for verifying auth-gated
//  screens (dosha profile, meal check, etc.) in the browser without real
//  credentials or a Supabase login.
//
//  ⚠ Strictly inert in production: gated on `import.meta.env.DEV`, which is
//  false for every `npm run build`, so this can never activate in a shipped
//  app. It also requires an explicit opt-in, so it never turns on by accident
//  even in dev.
//
//  Activate by loading the dev server with `?devAuth=<variant>`, e.g.
//    http://localhost:5173/dosha?devAuth=vata
//  Variants: vata | pitta | kapha | tridoshic | dual. Add `&devPremium=0` to
//  test the free (paywalled) path. The chosen variant is remembered in
//  localStorage so client-side navigation keeps the mock; clear it with
//  `?devAuth=off`.
// ─────────────────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString()
// A syntactically-valid UUID for a user that doesn't exist — Supabase queries
// return empty instead of 400ing on a non-UUID id, keeping the console clean.
const DEV_UUID = '00000000-0000-4000-8000-0000000d0511'

const PROFILES = {
  vata: {
    dosha: 'Vata',
    dosha_details: { primary: 'vata', secondary: 'pitta', tertiary: 'kapha', percentages: { vata: 52, pitta: 30, kapha: 18 }, assessedAt: now() },
  },
  pitta: {
    dosha: 'Pitta',
    dosha_details: { primary: 'pitta', secondary: 'kapha', tertiary: 'vata', percentages: { vata: 20, pitta: 54, kapha: 26 }, assessedAt: now() },
  },
  kapha: {
    dosha: 'Kapha',
    dosha_details: { primary: 'kapha', secondary: 'vata', tertiary: 'pitta', percentages: { vata: 24, pitta: 22, kapha: 54 }, assessedAt: now() },
  },
  tridoshic: {
    dosha: 'Tridoshic',
    dosha_details: { primary: 'vata', secondary: 'pitta', tertiary: 'kapha', percentages: { vata: 34, pitta: 33, kapha: 33 }, assessedAt: now() },
  },
  dual: {
    dosha: 'Pitta-Kapha',
    dosha_details: { primary: 'pitta', secondary: 'kapha', tertiary: 'vata', percentages: { vata: 18, pitta: 44, kapha: 38 }, assessedAt: now() },
  },
}

function resolveVariant() {
  try {
    const q = new URLSearchParams(window.location.search)
    let v = q.get('devAuth')
    if (v === 'off') { localStorage.removeItem('devAuth'); localStorage.removeItem('devPremium'); return null }
    if (v) {
      localStorage.setItem('devAuth', v)
      if (q.get('devPremium') != null) localStorage.setItem('devPremium', q.get('devPremium'))
    } else {
      v = localStorage.getItem('devAuth')
    }
    return v
  } catch {
    return null
  }
}

function getDevMock() {
  if (!import.meta.env.DEV) return null
  const variant = resolveVariant()
  if (!variant) return null
  const base = PROFILES[variant] || PROFILES.vata
  let premium = true
  try { premium = localStorage.getItem('devPremium') !== '0' } catch { /* ignore */ }

  const user = { id: DEV_UUID, email: 'dev@sanctuary.test', app_metadata: { provider: 'dev' }, user_metadata: {} }
  const profile = {
    id: DEV_UUID,
    email: 'dev@sanctuary.test',
    is_premium: premium,
    diet_prefs: {},
    meal_check_trial_started_at: null,
    ...base,
  }
  // eslint-disable-next-line no-console
  console.warn(`[devMockAuth] MOCK SESSION ACTIVE — variant="${variant}", premium=${premium}. Dev only.`)
  return { user, profile }
}

// Resolved once at module load (mirrors how AuthContext reads the session once).
export const DEV_MOCK = getDevMock()
