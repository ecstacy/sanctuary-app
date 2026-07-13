// ─────────────────────────────────────────────────────────────────────────────
//  i18next bootstrap
//
//  Initialized as a side effect on import (see src/main.jsx). Keeps the
//  configuration small — react-i18next's `useTranslation()` is the primary
//  consumer across components.
//
//  Language precedence at launch:
//    1. localStorage (user's sticky choice)   → readStoredLanguage()
//    2. Device locale / region heuristics     → detectDefaultLanguage()
//    3. Hard fallback 'en'                    → DEFAULT_LANGUAGE
//
//  After the user signs in we *also* honour profile.language (if set), via
//  `syncLanguageFromProfile()` called from AuthContext. That's the sticky
//  per-account preference and overrides the local heuristic.
// ─────────────────────────────────────────────────────────────────────────────

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { setSuperProps } from '../lib/track'

import en from './locales/en.json'
import hi from './locales/hi.json'
import de from './locales/de.json'
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  detectDefaultLanguage,
  readStoredLanguage,
  writeStoredLanguage,
} from './detect'

const initialLanguage =
  readStoredLanguage() || detectDefaultLanguage() || DEFAULT_LANGUAGE

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      de: { translation: de },
    },
    lng: initialLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: { escapeValue: false }, // React already escapes
    returnNull: false,
    // Keep bundle lean — no backend, no detector plugin. We do our own
    // detection (detect.js) so we can weight region signals our way.
  })

// Persist every language change so next launch skips detection. Also keep
// `app_language` on the analytics super-props so every event can be broken
// down by UI language — the key dimension for the de/hi rollout ("do Hindi
// users complete practices at the same rate?"). Super-props are inert until
// an event fires and consent gating still applies, so this is safe pre-consent.
i18n.on('languageChanged', (lng) => {
  writeStoredLanguage(lng)
  setSuperProps({ app_language: lng })
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng
    document.documentElement.dir = i18n.dir(lng)
  }
})

// Seed the initial super-prop and <html lang>/dir on first paint.
setSuperProps({ app_language: initialLanguage })
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage
  document.documentElement.dir = i18n.dir(initialLanguage)
}

// Called by AuthContext once we know the signed-in user's preference.
// Only applies if the profile explicitly has a language (don't clobber
// the user's on-device choice with an undefined profile value).
//
// Precedence (see header): an explicit on-device choice ALWAYS wins over the
// profile value. Without this guard, fetchProfile() re-applies the account
// language on every auth/refresh event — so right after a user picks a new
// language in Settings (which writes the sticky choice), a stale or
// un-persisted profile value would snap it back. This was the "switching to
// Hindi reverts to the previous language" bug: the profiles.language write
// no-ops when the column is absent (or is rejected by a constraint), leaving
// the DB on the old value that this function would then re-assert.
export function syncLanguageFromProfile(profileLanguage) {
  if (!profileLanguage) return
  if (!SUPPORTED_LANGUAGES.includes(profileLanguage)) return
  if (readStoredLanguage()) return // explicit on-device choice wins
  if (i18n.language === profileLanguage) return
  i18n.changeLanguage(profileLanguage)
}

export default i18n
