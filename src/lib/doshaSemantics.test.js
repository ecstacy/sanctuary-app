// Locks the two OPPOSITE dosha sign conventions in this repo.
//
// This file is executable documentation. If someone "tidies" one of the
// datasets to match the other's signs, these tests fail loudly — instead of
// the app quietly telling users the reverse of the truth about their
// constitution, which is exactly what happened once while generating the
// public /poses pages (see doshaSemantics.js header).

import { describe, it, expect } from 'vitest'
import {
  SUITABILITY, FOOD_EFFECT,
  practiceSuitability, foodSuitability, foodEffectDirection,
} from './doshaSemantics'

describe('practices (asanas, pranayamas): +1 = balancing', () => {
  it('maps the numeric schema', () => {
    expect(practiceSuitability(1)).toBe(SUITABILITY.BALANCING)
    expect(practiceSuitability(0)).toBe(SUITABILITY.NEUTRAL)
    expect(practiceSuitability(-1)).toBe(SUITABILITY.CAUTION)
  })

  it('maps the legacy string schema still used by a few entries', () => {
    // e.g. Mindful Respiration: doshaAffinity: { vata: 'balancing', ... }
    expect(practiceSuitability('balancing')).toBe(SUITABILITY.BALANCING)
    expect(practiceSuitability('aggravating')).toBe(SUITABILITY.CAUTION)
    expect(practiceSuitability('neutral')).toBe(SUITABILITY.NEUTRAL)
  })

  it('treats missing/garbage as neutral rather than guessing', () => {
    expect(practiceSuitability(undefined)).toBe(SUITABILITY.NEUTRAL)
    expect(practiceSuitability(null)).toBe(SUITABILITY.NEUTRAL)
    expect(practiceSuitability('nonsense')).toBe(SUITABILITY.NEUTRAL)
    expect(practiceSuitability(NaN)).toBe(SUITABILITY.NEUTRAL)
  })
})

describe('foods (rasa effect): -1 = pacifying, the OPPOSITE sign', () => {
  it('reports the direction the food moves the dosha', () => {
    expect(foodEffectDirection(-1)).toBe(FOOD_EFFECT.DECREASES)
    expect(foodEffectDirection(0)).toBe(FOOD_EFFECT.NEUTRAL)
    expect(foodEffectDirection(1)).toBe(FOOD_EFFECT.INCREASES)
  })

  it('maps a dosha-DECREASING food to BALANCING suitability', () => {
    expect(foodSuitability(-1)).toBe(SUITABILITY.BALANCING)
    expect(foodSuitability(0)).toBe(SUITABILITY.NEUTRAL)
    expect(foodSuitability(1)).toBe(SUITABILITY.CAUTION)
  })
})

describe('⚠ the inversion — the whole reason this module exists', () => {
  it('the same raw number means OPPOSITE things in the two datasets', () => {
    // +1 on a pose = good for you. +1 on a food = aggravating.
    expect(practiceSuitability(1)).toBe(SUITABILITY.BALANCING)
    expect(foodSuitability(1)).toBe(SUITABILITY.CAUTION)
    expect(practiceSuitability(1)).not.toBe(foodSuitability(1))

    expect(practiceSuitability(-1)).toBe(SUITABILITY.CAUTION)
    expect(foodSuitability(-1)).toBe(SUITABILITY.BALANCING)
    expect(practiceSuitability(-1)).not.toBe(foodSuitability(-1))
  })

  it('is a strict inversion across the range, not a coincidence', () => {
    for (const n of [-1, 0, 1]) {
      expect(practiceSuitability(n)).toBe(foodSuitability(-n))
    }
  })
})

describe('real data sanity — the conventions match what ships', () => {
  it('a vata-grounding pose reads as balancing for vata', async () => {
    const { ASANAS } = await import('../data/asanas')
    // Tadasana is tagged 'vata_pacifying' and has doshaAffinity.vata = 1.
    const tadasana = ASANAS.tadasana
    expect(tadasana.tags).toContain('vata_pacifying')
    expect(practiceSuitability(tadasana.doshaAffinity.vata)).toBe(SUITABILITY.BALANCING)
  })

  it('a sweet taste reads as balancing for vata and caution for kapha', async () => {
    const { RASAS } = await import('../data/ayurveda/dietary')
    // Sweet: { vata: -1, pitta: -1, kapha: 1 } — pacifies vata/pitta, aggravates kapha.
    expect(foodSuitability(RASAS.sweet.effect.vata)).toBe(SUITABILITY.BALANCING)
    expect(foodSuitability(RASAS.sweet.effect.kapha)).toBe(SUITABILITY.CAUTION)
  })
})
