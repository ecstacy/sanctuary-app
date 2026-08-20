import { describe, it, expect } from 'vitest'
import { resolveDietTarget, seasonFor, shouldExplainTarget } from './dietTarget'

const jan = new Date('2026-01-15T09:00:00')
const jul = new Date('2026-07-15T09:00:00')

describe('resolveDietTarget', () => {
  it('targets the current imbalance when there is a vikriti signal', () => {
    const t = resolveDietTarget({
      vikriti: { hasSignal: true, vikriti: 'vata' },
      profile: { dosha: 'pitta' },
      now: jul,
    })
    expect(t).toMatchObject({ dosha: 'vata', source: 'vikriti' })
  })

  it('falls back to the constitution when there is no signal', () => {
    const t = resolveDietTarget({ vikriti: { hasSignal: false }, profile: { dosha: 'kapha' }, now: jul })
    expect(t).toMatchObject({ dosha: 'kapha', source: 'prakriti' })
  })

  it('prefers dosha_details.primary over the flat dosha column', () => {
    const t = resolveDietTarget({ profile: { dosha: 'vata', dosha_details: { primary: 'pitta' } }, now: jul })
    expect(t.dosha).toBe('pitta')
  })

  it('returns no target rather than guessing one', () => {
    // The UI must then show the food's properties WITHOUT a personal verdict.
    expect(resolveDietTarget({ now: jul })).toMatchObject({ dosha: null, source: 'none' })
    expect(resolveDietTarget()).toMatchObject({ dosha: null, source: 'none' })
  })

  it('normalises casing from either source', () => {
    expect(resolveDietTarget({ vikriti: { hasSignal: true, vikriti: 'Pitta' } }).dosha).toBe('pitta')
    expect(resolveDietTarget({ profile: { dosha: 'KAPHA' } }).dosha).toBe('kapha')
  })

  it('ignores a vikriti signal that predates a re-taken constitution (#65)', () => {
    // Re-quizzed to Kapha today; the Pitta flare is from stale earlier check-ins.
    const profile = { dosha_details: { primary: 'kapha', assessedAt: '2026-07-10T00:00:00Z' } }
    const stale = resolveDietTarget({
      vikriti: { hasSignal: true, vikriti: 'pitta', lastCheckinAt: '2026-07-01T00:00:00Z' },
      profile, now: jul,
    })
    expect(stale).toMatchObject({ dosha: 'kapha', source: 'prakriti' })
    // A check-in AFTER the re-quiz is a genuine new flare and is honoured.
    const fresh = resolveDietTarget({
      vikriti: { hasSignal: true, vikriti: 'pitta', lastCheckinAt: '2026-07-15T00:00:00Z' },
      profile, now: jul,
    })
    expect(fresh).toMatchObject({ dosha: 'pitta', source: 'vikriti' })
  })

  it('honours the user self-correction for the prakriti target (#52)', () => {
    const t = resolveDietTarget({ profile: { dosha_details: { primary: 'pitta', selfReport: { fit: 'adjusted', primary: 'vata' } } }, now: jul })
    expect(t).toMatchObject({ dosha: 'vata', source: 'prakriti' })
  })

  it('gives a tridoshic/balanced constitution NO single-dosha target', () => {
    // A ~33/33/34 user must not have their food page read against "your Pitta" —
    // and the source is 'balanced' (has a profile), distinct from 'none' (never
    // quizzed), so surfaces don't wrongly prompt the quiz.
    const balanced = { dosha_details: { primary: 'pitta', percentages: { vata: 34, pitta: 33, kapha: 33 } } }
    expect(resolveDietTarget({ profile: balanced, now: jul })).toMatchObject({ dosha: null, source: 'balanced' })
    // A user who never quizzed (no percentages) still reads as 'none'.
    expect(resolveDietTarget({ profile: {}, now: jul })).toMatchObject({ dosha: null, source: 'none' })
    // …but a genuine current vikriti flare still lenses, balanced or not.
    const flare = resolveDietTarget({ vikriti: { hasSignal: true, vikriti: 'pitta' }, profile: balanced, now: jul })
    expect(flare).toMatchObject({ dosha: 'pitta', source: 'vikriti' })
  })

  it('always carries the season, whatever the target', () => {
    expect(resolveDietTarget({ now: jan }).season).toBe('winter')
    expect(resolveDietTarget({ now: jul }).season).toBe('summer')
  })
})

describe('seasonFor', () => {
  it('maps every month to a season', () => {
    for (let m = 0; m < 12; m++) {
      const s = seasonFor(new Date(2026, m, 15))
      expect(['spring', 'summer', 'autumn', 'winter'], `month ${m}`).toContain(s)
    }
  })

  it('puts December and January in the same season', () => {
    // The wrap-around is the easy one to get wrong in a month-indexed table.
    expect(seasonFor(new Date(2026, 11, 20))).toBe('winter')
    expect(seasonFor(new Date(2026, 0, 20))).toBe('winter')
  })
})

describe('shouldExplainTarget', () => {
  const profile = { dosha: 'pitta' }

  it('explains only when the imbalance differs from the constitution', () => {
    expect(shouldExplainTarget({ dosha: 'vata', source: 'vikriti' }, profile)).toBe(true)
  })

  it('stays quiet when they agree', () => {
    expect(shouldExplainTarget({ dosha: 'pitta', source: 'vikriti' }, profile)).toBe(false)
  })

  it('stays quiet when the target IS the constitution', () => {
    expect(shouldExplainTarget({ dosha: 'pitta', source: 'prakriti' }, profile)).toBe(false)
  })

  it('stays quiet with nothing to compare against', () => {
    expect(shouldExplainTarget({ dosha: 'vata', source: 'vikriti' }, {})).toBe(false)
    expect(shouldExplainTarget({ dosha: null, source: 'none' }, profile)).toBe(false)
  })
})
