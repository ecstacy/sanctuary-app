import { describe, it, expect } from 'vitest'
import { effectivePrimary, afterBaseline, baselineAt } from './doshaState'

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
