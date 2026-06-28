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
import deRecs from './content/de/recommendations.json'
import hiRecs from './content/hi/recommendations.json'
import deDina from './content/de/dinacharya.json'
import hiDina from './content/hi/dinacharya.json'
import deProtocols from './content/de/protocols.json'
import hiProtocols from './content/hi/protocols.json'
import dePranayamas from './content/de/pranayamas.json'
import hiPranayamas from './content/hi/pranayamas.json'
import deDosha from './content/de/dosha.json'
import hiDosha from './content/hi/dosha.json'
import dePrecautions from './content/de/precautions.json'
import hiPrecautions from './content/hi/precautions.json'

const ASANA_OVERLAYS = { de: deAsanas, hi: hiAsanas }
const DIETARY_OVERLAYS = { de: deDietary, hi: hiDietary }
const REC_OVERLAYS = { de: deRecs, hi: hiRecs }
const DINA_OVERLAYS = { de: deDina, hi: hiDina }
const PROTOCOL_OVERLAYS = { de: deProtocols, hi: hiProtocols }
const PRANAYAMA_OVERLAYS = { de: dePranayamas, hi: hiPranayamas }
const DOSHA_OVERLAYS = { de: deDosha, hi: hiDosha }
const PRECAUTION_OVERLAYS = { de: dePrecautions, hi: hiPrecautions }

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

// ── Recommendations ──────────────────────────────────────────────────────
// Overlay a recommendation's display prose (label, description, ayurvedicTip,
// breathwork sub/description, per-practice title/description) over the base.
// Sanskrit practice subtitles, breathwork titles, durations, levels, icons,
// keywords/synonyms (search engine) all stay from the base.
export function localizeRecommendation(rec) {
  if (!rec) return rec
  const ov = REC_OVERLAYS[i18n.language]?.[rec.id]
  if (!ov) return rec
  return {
    ...rec,
    ...ov,
    breathwork: ov.breathwork ? { ...rec.breathwork, ...ov.breathwork } : rec.breathwork,
    practices: Array.isArray(ov.practices)
      ? rec.practices.map((p, i) => ov.practices[i] ? { ...p, ...ov.practices[i] } : p)
      : rec.practices,
  }
}

// ── Dinacharya ───────────────────────────────────────────────────────────
// Overlay a daily-routine practice's prose (name, timeWindow, duration,
// benefits, howTo, tools, contraindications, source.note). Sanskrit/
// devanagari/iast, doshaTime, source.verse, icons stay from the base.
export function localizeDinacharyaPractice(p) {
  if (!p) return p
  const ov = DINA_OVERLAYS[i18n.language]?.practices?.[p.id]
  if (!ov) return p
  return {
    ...p,
    ...ov,
    source: ov.source ? { ...p.source, ...ov.source } : p.source,
  }
}

// Localized dosha-clock note for a time window string (or the base note).
export function localizeDoshaTimeNote(window, note) {
  return DINA_OVERLAYS[i18n.language]?.doshaTimes?.[window] || note
}

// ── Pranayamas ───────────────────────────────────────────────────────────
// Overlay a breath technique's prose. Sanskrit/devanagari/iast, numeric
// pattern fields (inhale/exhale/rate/rounds/ratio), doshaAffinity, tags,
// icon, poseKey, practiceSeat, durationSeconds stay from the base. Only
// pattern.notes / breathCues.notes / source.note text is overlaid.
export function localizePranayama(p) {
  if (!p) return p
  const ov = PRANAYAMA_OVERLAYS[i18n.language]?.[p.id]
  if (!ov) return p
  return {
    ...p,
    ...ov,
    pattern:    ov.pattern    ? { ...p.pattern,    ...ov.pattern }    : p.pattern,
    breathCues: ov.breathCues ? { ...p.breathCues, ...ov.breathCues } : p.breathCues,
    voiceCues:  ov.voiceCues  ? { ...p.voiceCues,  ...ov.voiceCues }  : p.voiceCues,
    source:     ov.source     ? { ...p.source,     ...ov.source }     : p.source,
  }
}

// ── Protocols ────────────────────────────────────────────────────────────
// Deep-merge a 3-day protocol's prose (title/subtitle/why + each day's
// title/lede + each section's title/items/note) over the English base.
// days and sections are matched by index; section.kind, id, vikriti,
// source citation, day numbers stay from the base.
export function localizeProtocol(p) {
  if (!p) return p
  const ov = PROTOCOL_OVERLAYS[i18n.language]?.[p.vikriti]
  if (!ov) return p
  return {
    ...p,
    title:    ov.title    ?? p.title,
    subtitle: ov.subtitle ?? p.subtitle,
    why:      ov.why      ?? p.why,
    days: p.days.map((d, i) => {
      const od = ov.days?.[i]
      if (!od) return d
      return {
        ...d,
        title: od.title ?? d.title,
        lede:  od.lede  ?? d.lede,
        sections: d.sections.map((s, j) => {
          const os = od.sections?.[j]
          if (!os) return s
          return { ...s, title: os.title ?? s.title, items: os.items ?? s.items, note: os.note ?? s.note }
        }),
      }
    }),
  }
}

// ── Dosha ──────────────────────────────────────────────────────────────────
// Two data sources feed the dosha profile screen, so two localizers.
//
// localizeDoshaDisplay overlays the inline DOSHA_DATA (display copy: element,
// tagline, description, strengths, balanceTips, qualities, season, timeOfDay,
// taste, yoga, meditation), keyed by dosha id. `name` stays literal.
export function localizeDoshaDisplay(doshaKey, data) {
  if (!data) return data
  const ov = DOSHA_OVERLAYS[i18n.language]?.display?.[doshaKey]
  if (!ov) return data
  return { ...data, ...ov }
}

// localizeDosha overlays the rich Charaka DOSHAS data (qualities[].english+note,
// body.*, mind.balanced/imbalanced, imbalanceSigns, triggers, pacification,
// tagline, season). sanskrit/devanagari/iast/elements/source stay literal.
export function localizeDosha(rich) {
  if (!rich) return rich
  const ov = DOSHA_OVERLAYS[i18n.language]?.prakriti?.[rich.id]
  if (!ov) return rich
  return {
    ...rich,
    ...ov,
    qualities: ov.qualities
      ? rich.qualities.map((q, i) => ({ ...q, ...(ov.qualities[i] || {}) }))
      : rich.qualities,
    body: ov.body ? { ...rich.body, ...ov.body } : rich.body,
    mind: ov.mind ? { ...rich.mind, ...ov.mind } : rich.mind,
    pacification: ov.pacification ? { ...rich.pacification, ...ov.pacification } : rich.pacification,
  }
}

// ── Precautions ─────────────────────────────────────────────────────────────
// AsanaDetailPage's static PRECAUTIONS map, keyed by asana id. Returns the
// localized array for the active language, or the English base array.
export function localizePrecautions(asanaId, base) {
  return PRECAUTION_OVERLAYS[i18n.language]?.[asanaId] || base
}
