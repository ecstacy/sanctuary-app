import { describe, it, expect } from 'vitest'
import { computeDietProfile, hasDietPattern } from './dietProfile'

// Small helpers to build fake meal_logs the way saveMealLog stores them.
const log = (itemIds, perDosha, eatenAt) => ({
  item_ids: itemIds,
  assessment: { perDosha },
  eaten_at: eatenAt,
})

describe('computeDietProfile', () => {
  it('returns an empty, lean-less profile for no logs', () => {
    const p = computeDietProfile([])
    expect(p.sample).toBe(0)
    expect(p.itemTotal).toBe(0)
    expect(p.dominant).toBeNull()
    expect(hasDietPattern(p)).toBe(false)
  })

  it('reads the dosha the meals consistently push', () => {
    // Three heating meals that each raise Pitta.
    const logs = [
      log(['gingerFresh'], { vata: -1, pitta: 1, kapha: -1 }),
      log(['greenChili'],  { vata: 0,  pitta: 1, kapha: -1 }),
      log(['garlic'],      { vata: -1, pitta: 1, kapha: -1 }),
    ]
    const p = computeDietProfile(logs)
    expect(p.sample).toBe(3)
    expect(p.dominant).toBe('pitta')
    expect(hasDietPattern(p)).toBe(true)
  })

  it('flags an over-eaten taste and a taste never eaten', () => {
    // All pungent spices — pungent is over-represented, and sweet/salty etc.
    // never appear, so they surface as missing.
    const logs = [
      log(['gingerFresh', 'blackPepper'], { vata: 0, pitta: 1, kapha: -1 }),
      log(['greenChili'],                 { vata: 0, pitta: 1, kapha: -1 }),
      log(['garlic'],                     { vata: 0, pitta: 1, kapha: -1 }),
    ]
    const p = computeDietProfile(logs)
    expect(p.surplusTastes).toContain('pungent')
    expect(p.missingTastes).toContain('sweet')
    expect(p.rasaCount.pungent).toBeGreaterThan(0)
  })

  it('buckets meals into slots by their timestamp', () => {
    const p = computeDietProfile([
      log(['basmatiRice'], { vata: -1, pitta: -1, kapha: 0 }, '2026-08-10T08:00:00'),
      log(['basmatiRice'], { vata: -1, pitta: -1, kapha: 0 }, '2026-08-10T13:00:00'),
      log(['basmatiRice'], { vata: -1, pitta: -1, kapha: 0 }, '2026-08-10T20:00:00'),
    ])
    expect(p.slotCount).toEqual({ morning: 1, midday: 1, evening: 1 })
  })

  it('ignores unknown / unreviewed ids without crashing', () => {
    const p = computeDietProfile([log(['not_a_real_food', 'basmatiRice'], { vata: -1, pitta: -1, kapha: 0 })])
    expect(p.itemTotal).toBe(1) // only the reviewed one counted
    expect(p.topFoods.map((f) => f.id)).toContain('basmatiRice')
  })
})
