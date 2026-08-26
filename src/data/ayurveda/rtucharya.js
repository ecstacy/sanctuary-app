// ─────────────────────────────────────────────────────────────────────────────
//  rtucharya.js — seasonal eating (ऋतुचर्या)
//
//  The classical texts prescribe not just what suits a constitution but what
//  suits the SEASON: each ṛtu accumulates or aggravates a dosha, and diet shifts
//  to meet it (Caraka Sūtrasthāna 6). This module maps our four calendar seasons
//  to the dosha to pacify and the tastes/qualities to favour or ease off.
//
//  ⚠ 4 SEASONS vs 6 ṚTUS — THE ADAPTATION UNDER REVIEW
//  ───────────────────────────────────────────────────
//  The saṃhitās use SIX ṛtus (śiśira, vasanta, grīṣma, varṣā, śarad, hemanta).
//  The app's calendar uses FOUR (spring/summer/autumn/winter, see
//  lib/dietTarget seasonFor). The mapping below is a defensible Western
//  adaptation, NOT a direct classical quote — which is exactly why it is
//  gated. The founder decides the mapping in docs/diet-review-rtucharya.md;
//  the notable divergence is autumn: classically śarad aggravates PITTA, while
//  the felt Western autumn (dry, windy, cooling) reads as VATA. Draft picks
//  Vata; flip to Pitta if the founder prefers the classical reading.
//
//  THE REVIEW GATE
//  ───────────────
//  reviewStatus gates the PROSE + the season→dosha CHOICE. Only 'reviewed'
//  seasons surface (selectors below). The per-food ranking itself reuses the
//  already-reviewed foodSuitability against the chosen dosha — no new food
//  claims are introduced here.
// ─────────────────────────────────────────────────────────────────────────────

import { foodSuitability, SUITABILITY } from '../../lib/doshaSemantics.js'

/** @typedef {'spring'|'summer'|'autumn'|'winter'} Season */

export const SEASON_GUIDANCE = {
  spring: {
    season: 'spring',
    ritu: 'Vasanta',
    dosha: 'kapha',
    title: 'Spring — lighten Kapha',
    intro: 'Kapha accumulated over winter liquefies in spring’s warmth, so it is the season it most easily aggravates. Eat to lighten and warm: favour light, dry, warm and pungent foods, and ease off the heavy, sweet, oily and cold.',
    favour: ['light', 'warm', 'pungent', 'bitter', 'astringent'],
    easeOff: ['heavy', 'sweet', 'sour', 'salty', 'oily', 'cold'],
    source: { text: 'CS', verse: 'Sū. 6' },
    reviewStatus: 'draft',
  },
  summer: {
    season: 'summer',
    ritu: 'Grīṣma',
    dosha: 'pitta',
    title: 'Summer — cool Pitta',
    intro: 'Heat is at its peak and the body’s strength is lowest. Favour cooling, sweet and hydrating foods with a light touch of bitter and astringent; ease off the hot, sour, salty, pungent and heavily fried.',
    favour: ['cooling', 'sweet', 'bitter', 'astringent', 'liquid'],
    easeOff: ['hot', 'sour', 'salty', 'pungent', 'oily'],
    source: { text: 'CS', verse: 'Sū. 6' },
    reviewStatus: 'draft',
  },
  autumn: {
    season: 'autumn',
    ritu: 'Śarad / early Hemanta',
    dosha: 'vata',
    title: 'Autumn — ground Vata',
    intro: 'Dry, cool and mobile, autumn is when Vata rises. Favour warm, moist, grounding and lightly oily foods with sweet, sour and salty tastes; ease off the dry, cold, raw and airy.',
    favour: ['warm', 'moist', 'oily', 'sweet', 'sour', 'salty'],
    easeOff: ['dry', 'cold', 'light', 'raw', 'astringent', 'pungent'],
    // Divergence flagged in the header — classically śarad is a Pitta season.
    source: { text: null, verse: null },
    reviewStatus: 'draft',
  },
  winter: {
    season: 'winter',
    ritu: 'Hemanta / Śiśira',
    dosha: 'vata',
    title: 'Winter — nourish, digestion is strong',
    intro: 'Cold keeps the digestive fire strong, so winter is the season for the most nourishing eating of the year: warm, hearty, unctuous foods with sweet, sour and salty tastes. Ease off the cold, dry and raw. Toward late winter, shift lighter as Kapha begins to build.',
    favour: ['warm', 'heavy', 'oily', 'sweet', 'sour', 'salty', 'nourishing'],
    easeOff: ['cold', 'dry', 'raw', 'light'],
    source: { text: 'CS', verse: 'Sū. 6' },
    reviewStatus: 'draft',
  },
}

export const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter']

// ── Selectors — reviewed seasons only ───────────────────────────────────────
const isReviewed = (s) => SEASON_GUIDANCE[s]?.reviewStatus === 'reviewed'

/** The reviewed guidance for a season, or null if not signed off. */
export function seasonGuidance(season) {
  return isReviewed(season) ? SEASON_GUIDANCE[season] : null
}

/** The dosha to pacify this season — only when the season is reviewed. */
export function seasonalDosha(season) {
  return isReviewed(season) ? SEASON_GUIDANCE[season].dosha : null
}

/** Season slugs that are signed off (for the website generator to iterate). */
export function reviewedSeasons() {
  return SEASON_ORDER.filter(isReviewed)
}

/**
 * Split foods into what to favour / ease off THIS season, by applying the
 * already-reviewed foodSuitability to the season's dosha. Empty until the
 * season is reviewed.
 * @param {Season} season
 * @param {object[]} foods
 */
export function seasonalFoods(season, foods) {
  const dosha = seasonalDosha(season)
  if (!dosha) return { dosha: null, favour: [], easeOff: [] }
  const favour = [], easeOff = []
  for (const f of foods || []) {
    const s = foodSuitability(f.doshaEffect?.[dosha])
    if (s === SUITABILITY.BALANCING) favour.push(f)
    else if (s === SUITABILITY.CAUTION) easeOff.push(f)
  }
  return { dosha, favour, easeOff }
}

export function rtucharyaCoverage() {
  return { total: SEASON_ORDER.length, reviewed: reviewedSeasons().length }
}
