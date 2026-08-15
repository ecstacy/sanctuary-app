import { describe, it, expect } from 'vitest'
import { spokenInstructions, buildSchedule } from './voiceCoach'
import { ASANAS } from '../data/asanas.js'

describe('spokenInstructions — bilateral switch-cue stripping', () => {
  it('strips a trailing "Switch sides." sentence but keeps the useful cue', () => {
    const a = { bilateral: true, instructions: ['Step forward.', 'Press the back foot down. Lift the ribs. Switch sides.'] }
    expect(spokenInstructions(a)).toEqual(['Step forward.', 'Press the back foot down. Lift the ribs.'])
  })

  it('strips a trailing "then switch which leg is in front and repeat"', () => {
    const a = { bilateral: true, instructions: ['Cross the legs.', 'Stay and breathe, then switch which leg is in front and repeat.'] }
    expect(spokenInstructions(a)).toEqual(['Cross the legs.', 'Stay and breathe'])
  })

  it('drops the line entirely when it is ONLY a switch directive', () => {
    const a = { bilateral: true, instructions: ['Hold, steady in the twist.', 'Switch sides.'] }
    expect(spokenInstructions(a)).toEqual(['Hold, steady in the twist.'])
  })

  it('strips the trailing German switch directive', () => {
    const a = { bilateral: true, instructions: ['Steh vorne.', 'Drücke den Fuß nach unten. Wechsle die Seite.'] }
    expect(spokenInstructions(a)).toEqual(['Steh vorne.', 'Drücke den Fuß nach unten.'])
  })

  it('strips the trailing Hindi switch directive (with danda)', () => {
    const a = { bilateral: true, instructions: ['आगे खड़े हों।', 'पिछले पैर को दबाएँ। पक्ष बदलें।'] }
    expect(spokenInstructions(a)).toEqual(['आगे खड़े हों।', 'पिछले पैर को दबाएँ।'])
  })

  it('leaves non-bilateral poses untouched', () => {
    const a = { bilateral: false, instructions: ['Fold forward.', 'Switch sides.'] }
    expect(spokenInstructions(a)).toEqual(['Fold forward.', 'Switch sides.'])
  })

  it('never removes a genuine last cue that is not a switch directive', () => {
    const a = { bilateral: true, instructions: ['Reach up.', 'Lengthen the spine and breathe.'] }
    expect(spokenInstructions(a)).toEqual(['Reach up.', 'Lengthen the spine and breathe.'])
  })

  it('no bilateral pose still speaks a bare "switch sides" line in playback', () => {
    for (const a of Object.values(ASANAS)) {
      if (!a.bilateral) continue
      for (const line of spokenInstructions(a)) {
        expect(/^\s*switch sides\.?\s*$/i.test(line), `${a.id}: "${line}"`).toBe(false)
      }
    }
  })
})

describe('buildSchedule — no time-milestone can fire on a short hold', () => {
  it('a 20s hold never schedules the 15s or 30s milestone', () => {
    const items = buildSchedule({ asana: ASANAS.tadasana ? { ...ASANAS.tadasana, durationSeconds: 20 } : { id: 'x', durationSeconds: 20, voiceCues: {} }, poseIndex: 0 })
    const kinds = items.map(i => i.kind)
    expect(kinds).not.toContain('fifteen')
    expect(kinds).not.toContain('thirty')
  })
})
