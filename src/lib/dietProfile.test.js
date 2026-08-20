import { describe, it, expect } from 'vitest'
import { computeDietProfile, hasDietPattern, computeWeeklyTrends } from './dietProfile'

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

  it('weights recent checks over older ones for the lean (the "lately" bug)', () => {
    // Equal counts: an older Pitta stretch, then a recent Kapha one. A plain
    // average would tie; recency weighting must let the recent Kapha win.
    const older = '2026-08-12T12:00:00'
    const recent = '2026-08-20T12:00:00'
    const logs = [
      log(['greenChili'], { vata: 0, pitta: 1, kapha: -1 }, older),
      log(['greenChili'], { vata: 0, pitta: 1, kapha: -1 }, older),
      log(['greenChili'], { vata: 0, pitta: 1, kapha: -1 }, older),
      log(['banana'], { vata: 0, pitta: 0, kapha: 1 }, recent),
      log(['banana'], { vata: 0, pitta: 0, kapha: 1 }, recent),
      log(['banana'], { vata: 0, pitta: 0, kapha: 1 }, recent),
    ]
    const p = computeDietProfile(logs)
    expect(p.dominant).toBe('kapha') // the recent trend wins over the older one
    expect(p.doshaAvg.kapha).toBeGreaterThan(p.doshaAvg.pitta)
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

describe('computeWeeklyTrends', () => {
  it('buckets checks by calendar week, oldest first, with a per-week lean', () => {
    const trends = computeWeeklyTrends([
      // week of 11 Aug (Mon) — Pitta
      log(['greenChili'], { vata: 0, pitta: 1, kapha: -1 }, '2026-08-12T12:00:00'),
      log(['greenChili'], { vata: 0, pitta: 1, kapha: -1 }, '2026-08-13T12:00:00'),
      // week of 18 Aug (Mon) — Kapha
      log(['banana'], { vata: 0, pitta: 0, kapha: 1 }, '2026-08-20T12:00:00'),
      log(['banana'], { vata: 0, pitta: 0, kapha: 1 }, '2026-08-20T13:00:00'),
    ])
    expect(trends.map((w) => w.weekStart)).toEqual(['2026-08-10', '2026-08-17'])
    expect(trends[0].dominant).toBe('pitta')
    expect(trends[1].dominant).toBe('kapha')
    expect(trends[1].count).toBe(2)
  })

  it('keeps only the most recent N weeks', () => {
    const logs = []
    for (let w = 0; w < 10; w++) {
      logs.push(log(['banana'], { vata: 0, pitta: 0, kapha: 1 }, `2026-0${w < 4 ? 6 : 7}-${String(1 + w * 2).padStart(2, '0')}T12:00:00`))
    }
    const trends = computeWeeklyTrends(logs, { weeks: 3 })
    expect(trends.length).toBeLessThanOrEqual(3)
  })
})
