import { describe, it, expect } from 'vitest'
import { computeFamiliarity } from './familiarity'

describe('computeFamiliarity', () => {
  it('returns null with no baseline (nothing to progress against)', () => {
    expect(computeFamiliarity({ hasPrakriti: false, intent: true })).toBeNull()
  })

  it('starts at stage 0 with only the quiz taken', () => {
    expect(computeFamiliarity({ hasPrakriti: true }).stage).toBe(0)
  })

  it('advances a stage as distinct signals accrue', () => {
    expect(computeFamiliarity({ hasPrakriti: true, intent: true }).stage).toBe(1)
    expect(computeFamiliarity({ hasPrakriti: true, intent: true, refine: true, selfReport: true }).stage).toBe(2)
  })

  it('reaches the top stage with an ongoing check-in rhythm', () => {
    const f = computeFamiliarity({ hasPrakriti: true, intent: true, refine: true, selfReport: true, vikritiCount: 3 })
    expect(f.stage).toBe(3)
    expect(f.key).toBe('stage3')
  })

  it('counts a single check-in but not yet a rhythm', () => {
    const one = computeFamiliarity({ hasPrakriti: true, vikritiCount: 1 })
    const many = computeFamiliarity({ hasPrakriti: true, vikritiCount: 3 })
    expect(many.score).toBeGreaterThan(one.score)
  })
})
