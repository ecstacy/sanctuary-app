// ─────────────────────────────────────────────────────────────────────────────
//  Language & region detection
//
//  We want to answer two things at first launch, before the user has picked:
//    1. What UI language should we default to?      → detectDefaultLanguage()
//    2. What order should the picker show options in? → detectRegion()
//
//  Signals we use (in priority order):
//    a. localStorage `sanctuary.lang` (explicit prior choice — always wins)
//    b. Supabase auth user_metadata.language (set during signup)
//         → read separately by i18n init; not used here.
//    c. Device locale via `navigator.language` / `navigator.languages`
//       On Android Capacitor WebView these inherit the system language, which
//       is the strongest lightweight proxy for Play Store country.
//    d. `Intl.DateTimeFormat().resolvedOptions().locale` as a fallback.
//
//  Why not Play Install Referrer?
//    The Play Install Referrer API gives the true install country, but needs
//    a native lib (com.android.installreferrer) and an async round-trip on
//    first launch. Overkill for a language default — system locale is already
//    a very strong signal (users set their phone language for a reason).
//    If we need it later, swap detectRegion() for a native Capacitor plugin
//    call without touching callers.
// ─────────────────────────────────────────────────────────────────────────────

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'de']
export const DEFAULT_LANGUAGE = 'en'

// BCP-47 primary subtag → our internal code
const LANG_MAP = {
  en: 'en',
  hi: 'hi',
  de: 'de',
}

// Regions where Hindi should be the top pick.
// IN is the primary; we include neighbours where Hindi has significant reach
// but err on the side of caution — a Nepali user who reads Hindi can still
// pick it from the list.
const HINDI_REGIONS = new Set(['IN'])
const GERMAN_REGIONS = new Set(['DE', 'AT', 'CH', 'LI'])

function parseLocale(tag) {
  if (!tag || typeof tag !== 'string') return { lang: null, region: null }
  // tag forms: "hi", "hi-IN", "en_IN", "en-IN-x-foo"
  const normalized = tag.replace('_', '-')
  const parts = normalized.split('-')
  const lang = parts[0]?.toLowerCase() || null
  // Region is the first 2-letter uppercase subtag
  const region = parts.slice(1).find(p => /^[A-Za-z]{2}$/.test(p))?.toUpperCase() || null
  return { lang, region }
}

function allLocales() {
  if (typeof navigator === 'undefined') return []
  const list = []
  if (Array.isArray(navigator.languages)) list.push(...navigator.languages)
  if (navigator.language) list.push(navigator.language)
  try {
    const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale
    if (intlLocale) list.push(intlLocale)
  } catch { /* ignore */ }
  return list.filter(Boolean)
}

export function detectRegion() {
  for (const loc of allLocales()) {
    const { region } = parseLocale(loc)
    if (region) return region
  }
  return null
}

// Returns { language, region, source } without consulting localStorage.
// Callers that want the "sticky" choice should check localStorage first.
export function detectDefaultLanguage() {
  const locales = allLocales()

  // Prefer an exact supported match from the user's language preference list.
  for (const loc of locales) {
    const { lang } = parseLocale(loc)
    if (lang && LANG_MAP[lang] && SUPPORTED_LANGUAGES.includes(LANG_MAP[lang])) {
      return LANG_MAP[lang]
    }
  }

  // Otherwise infer from region (an en-IN phone is often a Hindi-literate user).
  const region = detectRegion()
  if (region && HINDI_REGIONS.has(region)) return 'hi'
  if (region && GERMAN_REGIONS.has(region)) return 'de'

  return DEFAULT_LANGUAGE
}

// Returns SUPPORTED_LANGUAGES reordered so the region-preferred language is
// first, English is always present, and the rest follow in original order.
export function orderLanguagesForRegion(region = detectRegion()) {
  const preferred = new Set()
  if (region && HINDI_REGIONS.has(region)) preferred.add('hi')
  if (region && GERMAN_REGIONS.has(region)) preferred.add('de')

  const head = [...preferred]
  const rest = SUPPORTED_LANGUAGES.filter(l => !preferred.has(l))
  // Guarantee English is always visible and near the top.
  if (!head.includes('en') && !rest.includes('en')) rest.unshift('en')
  return [...head, ...rest]
}

// Read the user's sticky choice from localStorage (if any).
export function readStoredLanguage() {
  try {
    const v = localStorage.getItem('sanctuary.lang')
    if (v && SUPPORTED_LANGUAGES.includes(v)) return v
  } catch { /* ignore */ }
  return null
}

export function writeStoredLanguage(lang) {
  try {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      localStorage.setItem('sanctuary.lang', lang)
    }
  } catch { /* ignore */ }
}
