import { describe, it, expect } from 'vitest'
import { pickRoutine } from './routineSelect'
describe('pickRoutine', () => {
  it('winds down at night regardless of dosha', () => {
    expect(pickRoutine({ hour: 22, vikriti: 'kapha' }).key).toBe('sleep')
    expect(pickRoutine({ hour: 20, vikriti: 'vata' }).key).toBe('preBedWindDown')
  })
  it('energizes in the morning by default', () => {
    expect(pickRoutine({ hour: 7, vikriti: null }).key).toBe('energy')
    expect(pickRoutine({ hour: 7, vikriti: 'kapha' })).toEqual({ key: 'energy', reason: 'kapha' })
  })
  it('steers by elevated dosha midday', () => {
    expect(pickRoutine({ hour: 14, vikriti: 'vata' }).key).toBe('stress')
    expect(pickRoutine({ hour: 14, vikriti: 'pitta' }).key).toBe('flexibility')
    expect(pickRoutine({ hour: 14, vikriti: 'kapha' }).key).toBe('energy')
  })
  it('falls back to a general practice when balanced', () => {
    expect(pickRoutine({ hour: 14, vikriti: null })).toEqual({ key: 'flexibility', reason: 'general' })
  })
})
