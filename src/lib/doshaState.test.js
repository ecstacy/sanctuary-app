import { describe, it, expect } from 'vitest'
import { effectivePrimary, afterBaseline, baselineAt, isBalancedConstitution, dominantDoshas } from './doshaState'

describe('dominantDoshas — co-dominance (dual constitutions)', () => {
  it('a clear single dominant returns one dosha', () => {
    expect(dominantDoshas({ vata: 52, pitta: 30, kapha: 18 })).toEqual(['vata'])
  })
  it('a 40-40-20 split is co-dominant (both 40s, ordered by %)', () => {
    // vata & kapha tie at 40 → dual, not an arbitrary single pick.
    expect(dominantDoshas({ vata: 40, pitta: 20, kapha: 40 })).toEqual(['vata', 'kapha'])
  })
  it('the boundary case 45-37-18 (exactly 8 apart) stays single', () => {
    expect(dominantDoshas({ vata: 45, pitta: 37, kapha: 18 })).toEqual(['vata'])
  })
  it('within the gap (44-38-18) is dual', () => {
    expect(dominantDoshas({ vata: 44, pitta: 38, kapha: 18 })).toEqual(['vata', 'pitta'])
  })
  it('orders the pair by percentage, descending', () => {
    expect(dominantDoshas({ vata: 20, pitta: 38, kapha: 42 })).toEqual(['kapha', 'pitta'])
  })
  it('returns [] with no percentages', () => {
    expect(dominantDoshas(null)).toEqual([])
    expect(dominantDoshas({ vata: 0, pitta: 0, kapha: 0 })).toEqual([])
  })
})

describe('isBalancedConstitution — tridoshic detection', () => {
  it('is true when the three percentages sit within a narrow band', () => {
    expect(isBalancedConstitution({ dosha_details: { percentages: { vata: 34, pitta: 33, kapha: 33 } } })).toBe(true)
  })
  it('is false when one dosha clearly dominates', () => {
    expect(isBalancedConstitution({ dosha_details: { percentages: { vata: 25, pitta: 60, kapha: 15 } } })).toBe(false)
  })
  it('is false without percentages (older profiles)', () => {
    expect(isBalancedConstitution({ dosha_details: { primary: 'pitta' } })).toBe(false)
    expect(isBalancedConstitution(null)).toBe(false)
  })
})

describe('effectivePrimary', () => {
  it('prefers an adjusted self-report over the quiz primary', () => {
    expect(effectivePrimary({ dosha_details: { primary: 'pitta', selfReport: { fit: 'adjusted', primary: 'kapha' } } })).toBe('kapha')
  })
  it('ignores a mere confirmation and uses the quiz primary', () => {
    expect(effectivePrimary({ dosha_details: { primary: 'pitta', selfReport: { fit: 'confirmed' } } })).toBe('pitta')
  })
  it('falls back to the legacy dosha label, then null', () => {
    expect(effectivePrimary({ dosha: 'VATA' })).toBe('vata')
    expect(effectivePrimary({})).toBeNull()
    expect(effectivePrimary(null)).toBeNull()
  })
})

describe('afterBaseline — vikriti staleness gate', () => {
  const baselined = { dosha_details: { assessedAt: '2026-06-01T00:00:00Z' } }
  it('treats vikriti recorded AFTER the baseline as current', () => {
    expect(afterBaseline(baselined, '2026-06-10T00:00:00Z')).toBe(true)
  })
  it('treats vikriti recorded BEFORE the baseline as stale', () => {
    expect(afterBaseline(baselined, '2026-05-01T00:00:00Z')).toBe(false)
  })
  it('is permissive when there is no baseline yet (older profiles)', () => {
    expect(afterBaseline({}, '2020-01-01T00:00:00Z')).toBe(true)
    expect(baselineAt({})).toBeNull()
  })
  it('is false when there is a baseline but no vikriti timestamp', () => {
    expect(afterBaseline(baselined, null)).toBe(false)
  })
})
