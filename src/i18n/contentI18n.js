// ─────────────────────────────────────────────────────────────────────────────
//  contentI18n — runtime localization overlay for content data
//
//  Phase 3 of the localization project. The data modules (data/asanas.js
//  etc.) remain the English source of truth and own all structural fields
//  (id, poseKey, icon, durationSeconds, doshaAffinity, tags, bodyParts,
//  devanagari, iast). This module overlays the *translatable text* for the
//  active language on top of a base object, by id.
//
//  Why an overlay rather than moving content into the i18n JSON or inlining
//  {en,de,hi} into the data files: components consume data objects directly
//  (asana.benefits, routine.asanas, …) and pass them around. An overlay
//  keyed by id lets us localize at the data accessors / display points with
//  minimal churn, keeps the English data diff-clean, and keeps the per-
//  language files small and easy to hand to a human reviewer (Hindi
//  Ayurveda content needs review before launch).
//
//  Coverage is partial and grows batch by batch — any id without an overlay
//  entry falls through to the English base, so the app is always complete.
// ─────────────────────────────────────────────────────────────────────────────

import i18n from './index'
import deAsanas from './content/de/asanas.json'
import hiAsanas from './content/hi/asanas.json'
import deDietary from './content/de/dietary.json'
import hiDietary from './content/hi/dietary.json'

const ASANA_OVERLAYS = { de: deAsanas, hi: hiAsanas }
const DIETARY_OVERLAYS = { de: deDietary, hi: hiDietary }

// Shallow-merge the language overlay over a base asana. voiceCues/source are
// nested so we merge them one level deep — a partial overlay (e.g. only
// `enter` translated) still keeps the English siblings.
export function localizeAsana(asana) {
  if (!asana) return asana
  const ov = ASANA_OVERLAYS[i18n.language]?.asanas?.[asana.id]
  if (!ov) return asana
  return {
    ...asana,
    ...ov,
    voiceCues: ov.voiceCues ? { ...asana.voiceCues, ...ov.voiceCues } : asana.voiceCues,
    source:    ov.source    ? { ...asana.source,    ...ov.source }    : asana.source,
  }
}

// Localized {label, description} for a routine key, or null to fall back to
// the English ROUTINE_TEMPLATES values.
export function localizeRoutineMeta(routineKey) {
  return ASANA_OVERLAYS[i18n.language]?.routines?.[routineKey] || null
}

// getDoshaTag returns English labels ('Balancing'/'Caution'/'Neutral').
// Map them to the active language; unknown labels pass through.
const DOSHA_TAG_KEYS = { Balancing: 'balancing', Caution: 'caution', Neutral: 'neutral' }
export function localizeDoshaTagLabel(label) {
  const map = ASANA_OVERLAYS[i18n.language]?.doshaTags
  if (!map) return label
  return map[DOSHA_TAG_KEYS[label]] || label
}

// ── Dietary ──────────────────────────────────────────────────────────────
// Deep-merge the per-dosha guidance overlay (principle, tastes, favor/avoid,
// eatingHabits, seasonal, source.note) over the English base.
export function localizeDietaryGuidance(guide) {
  if (!guide) return guide
  const ov = DIETARY_OVERLAYS[i18n.language]?.guidance?.[guide.dosha]
  if (!ov) return guide
  return {
    ...guide,
    ...ov,
    tastes: ov.tastes ? { ...guide.tastes, ...ov.tastes } : guide.tastes,
    favor:  ov.favor  ? { ...guide.favor,  ...ov.favor }  : guide.favor,
    avoid:  ov.avoid  ? { ...guide.avoid,  ...ov.avoid }  : guide.avoid,
    source: ov.source ? { ...guide.source, ...ov.source } : guide.source,
  }
}

export function localizeRasa(taste, rasa) {
  if (!rasa) return rasa
  const ov = DIETARY_OVERLAYS[i18n.language]?.rasas?.[taste]
  return ov ? { ...rasa, ...ov } : rasa
}

// Localized label for a favor-category key (grains/vegetables/…); falls back
// to the raw key (matches the English display).
export function localizeDietCategory(key) {
  return DIETARY_OVERLAYS[i18n.language]?.categories?.[key] || key
}
