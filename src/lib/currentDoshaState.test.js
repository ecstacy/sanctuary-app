import { describe, it, expect } from 'vitest'
import { deriveCurrentDoshaState } from './currentDoshaState'

const constitution = (over = {}) => ({
  dosha: 'vata',
  dosha_details: { primary: 'vata', assessedAt: '2026-08-01T00:00:00Z', percentages: { vata: 50, pitta: 30, kapha: 20 } },
  ...over,
})

describe('deriveCurrentDoshaState', () => {
  it('reads a fresh vikriti signal as the current state, over the constitution', () => {
    const s = deriveCurrentDoshaState({
      profile: constitution(),
      signal: { hasSignal: true, vikriti: 'pitta', lastCheckinAt: '2026-08-20T00:00:00Z' },
      schedule: {},
    })
    expect(s.currentDosha).toBe('pitta')
    expect(s.source).toBe('vikriti')
    expect(s.isElevated).toBe(true)
    expect(s.prakriti).toBe('vata')       // the baseline is still known…
    expect(s.matchesPrakriti).toBe(false) // …and it differs from today
  })

  it('falls back to the constitution when there is no live signal', () => {
    const s = deriveCurrentDoshaState({ profile: constitution(), signal: { hasSignal: false }, schedule: {} })
    expect(s.currentDosha).toBe('vata')
    expect(s.source).toBe('prakriti')
    expect(s.isElevated).toBe(false)
  })

  it('ignores a vikriti signal older than the constitution baseline (#65)', () => {
    const s = deriveCurrentDoshaState({
      profile: constitution(),
      signal: { hasSignal: true, vikriti: 'kapha', lastCheckinAt: '2026-07-01T00:00:00Z' }, // pre-baseline
      schedule: {},
    })
    expect(s.currentDosha).toBe('vata')
    expect(s.source).toBe('prakriti')
  })

  it('flags when today agrees with the baseline so the card can stay quiet', () => {
    const s = deriveCurrentDoshaState({
      profile: constitution(),
      signal: { hasSignal: true, vikriti: 'vata', lastCheckinAt: '2026-08-20T00:00:00Z' },
      schedule: {},
    })
    expect(s.matchesPrakriti).toBe(true)
  })

  it('treats a tridoshic constitution with no signal as balanced', () => {
    const s = deriveCurrentDoshaState({
      profile: { dosha: 'tridoshic', dosha_details: { primary: 'vata', percentages: { vata: 34, pitta: 33, kapha: 33 } } },
      signal: { hasSignal: false }, schedule: {},
    })
    expect(s.balanced).toBe(true)
    expect(s.isTridoshic).toBe(true)
  })

  it('uses the latest vikriti percentages when the reading is a fresh vikriti', () => {
    const s = deriveCurrentDoshaState({
      profile: constitution(),
      signal: { hasSignal: false },
      schedule: { lastVikritiAt: '2026-08-19T00:00:00Z', lastVikritiPrimary: 'pitta', daysSinceLast: 2, lastVikritiPercentages: { vata: 20, pitta: 55, kapha: 25 } },
    })
    expect(s.currentDosha).toBe('pitta')
    expect(s.currentPercentages).toEqual({ vata: 20, pitta: 55, kapha: 25 })
    expect(s.prakritiPercentages).toEqual({ vata: 50, pitta: 30, kapha: 20 })
  })
})
