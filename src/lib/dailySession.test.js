import { describe, it, expect } from 'vitest'
import { composeDailySession, resolveSlot, rawSlot } from './dailySession'
import { ASANAS } from '../data/asanas'

// Helpers ---------------------------------------------------------------------
const at = (hour) => new Date(`2026-07-10T${String(hour).padStart(2, '0')}:00:00`)
const base = (over = {}) => ({ userId: 'u1', now: at(8), profile: {}, vikriti: { hasSignal: false }, checkin: null, history: [], ...over })
const dur = (ids) => ids.reduce((s, id) => s + (ASANAS[id]?.durationSeconds || 0), 0)

describe('slot resolution', () => {
  it('maps hours to raw slots', () => {
    expect(rawSlot(6)).toBe('morning')
    expect(rawSlot(11)).toBe('morning')
    expect(rawSlot(14)).toBe('afternoon')
    expect(rawSlot(19)).toBe('evening')
  })
  it('folds afternoon into morning when no morning session done yet', () => {
    expect(resolveSlot(14, [])).toBe('morning')
  })
  it('folds afternoon into evening once a morning session is done', () => {
    expect(resolveSlot(14, ['morning'])).toBe('evening')
  })
})

describe('composeDailySession — structure', () => {
  it('produces a non-empty arc that opens with a seat/warm-up and closes on savasana', () => {
    const s = composeDailySession(base())
    expect(s.asanaIds.length).toBeGreaterThanOrEqual(5)
    expect(s.asanaIds[s.asanaIds.length - 1]).toBe('savasana')
    // Every phase key present in order.
    const phases = s.poses.map(p => p.phase)
    expect(phases[0]).toBe('centering')
    expect(phases).toContain('peak')
    expect(phases[phases.length - 1]).toBe('close')
  })

  it('only uses beginner/intermediate poses and never arm balances or full flows', () => {
    const s = composeDailySession(base())
    for (const id of s.asanaIds) {
      const a = ASANAS[id]
      expect(a, id).toBeTruthy()
      expect(['beginner', 'intermediate']).toContain(String(a.level).toLowerCase())
      expect(a.tags || []).not.toContain('arm_balance')
      expect(id).not.toBe('chandraNamaskar')
      expect(id).not.toBe('suryaNamaskarB')
    }
  })

  it('lands within tolerance of the duration target', () => {
    const s = composeDailySession(base({ targetMinutes: 13 }))
    expect(s.totalSeconds).toBe(dur(s.asanaIds))
    // Target 780s ± a generous window (poses are coarse-grained).
    expect(s.totalSeconds).toBeGreaterThan(600)
    expect(s.totalSeconds).toBeLessThan(1100)
  })

  it('has no duplicate poses', () => {
    const s = composeDailySession(base())
    expect(new Set(s.asanaIds).size).toBe(s.asanaIds.length)
  })

  it('always closes on savasana in the close phase — including long evening arcs', () => {
    // Evening + big restoratives is the case that previously pulled savasana
    // into the peak and dropped the close.
    for (const now of [at(7), at(20), at(14)]) {
      const s = composeDailySession(base({ now, vikriti: { hasSignal: true, vikriti: 'pitta' }, checkin: 'sleep' }))
      const savCount = s.asanaIds.filter(id => id === 'savasana').length
      expect(savCount, `one savasana @${now.getHours()}h`).toBe(1)
      expect(s.asanaIds[s.asanaIds.length - 1], `ends on savasana @${now.getHours()}h`).toBe('savasana')
      expect(s.poses[s.poses.length - 1].phase).toBe('close')
      // savasana must not appear in any earlier phase
      expect(s.poses.slice(0, -1).some(p => p.id === 'savasana')).toBe(false)
    }
  })
})

describe('composeDailySession — determinism', () => {
  it('is stable for the same (user, date, slot)', () => {
    const a = composeDailySession(base())
    const b = composeDailySession(base())
    expect(a.asanaIds).toEqual(b.asanaIds)
    expect(a.seed).toBe(b.seed)
  })

  it('differs across days', () => {
    const d1 = composeDailySession(base({ now: at(8) }))
    const d2 = composeDailySession(base({ now: new Date('2026-07-11T08:00:00') }))
    expect(d1.seed).not.toBe(d2.seed)
    // Overwhelmingly likely to differ; assert the arc isn't byte-identical.
    expect(d1.asanaIds.join()).not.toBe(d2.asanaIds.join())
  })

  it('differs morning vs evening', () => {
    const m = composeDailySession(base({ now: at(7) }))
    const e = composeDailySession(base({ now: at(20) }))
    expect(m.slot).toBe('morning')
    expect(e.slot).toBe('evening')
    expect(m.asanaIds.join()).not.toBe(e.asanaIds.join())
  })
})

describe('composeDailySession — arc character', () => {
  it('evening excludes warming/energizing poses', () => {
    const e = composeDailySession(base({ now: at(20) }))
    for (const id of e.asanaIds) {
      const tags = ASANAS[id].tags || []
      expect(tags, id).not.toContain('warming')
      expect(tags, id).not.toContain('energizing')
    }
  })

  it('morning leans energizing (at least one wake-up/energizing/warming pose)', () => {
    const m = composeDailySession(base({ now: at(7) }))
    const energizing = m.asanaIds.some(id => (ASANAS[id].tags || []).some(t => ['energizing', 'warming', 'wake_up', 'sequence'].includes(t)))
    expect(energizing).toBe(true)
  })
})

describe('composeDailySession — personalization', () => {
  it('surfaces a vikriti reason and biases toward pacifying poses', () => {
    const s = composeDailySession(base({ now: at(20), vikriti: { hasSignal: true, vikriti: 'pitta' } }))
    expect(s.reasons.some(r => r.code === 'pacify:pitta')).toBe(true)
    // At least one pose explicitly tagged pitta_pacifying.
    const pacifying = s.asanaIds.filter(id => (ASANAS[id].tags || []).includes('pitta_pacifying'))
    expect(pacifying.length).toBeGreaterThanOrEqual(1)
  })

  it('falls back to prakriti when there is no vikriti signal', () => {
    const s = composeDailySession(base({ profile: { dosha: 'vata' } }))
    expect(s.reasons.some(r => r.code === 'dosha:vata')).toBe(true)
  })

  it('records the check-in as a reason', () => {
    const s = composeDailySession(base({ checkin: 'stress' }))
    expect(s.reasons.some(r => r.code === 'checkin:stress')).toBe(true)
  })

  it('penalizes poses from recent history (freshness)', () => {
    // Force a big recent set; the composer should still produce a valid arc
    // and avoid the penalized peak poses where an alternative exists.
    const recentPeak = ['virabhadrasanaI', 'virabhadrasanaII', 'trikonasana', 'bhujangasana']
    const s = composeDailySession(base({ now: at(7), history: [{ asanas: recentPeak.map(id => ({ id })) }] }))
    const overlap = s.asanaIds.filter(id => recentPeak.includes(id))
    // Not a hard ban, but strong penalty — expect it to mostly avoid them.
    expect(overlap.length).toBeLessThanOrEqual(1)
  })
})
