import { describe, it, expect, beforeEach } from 'vitest'
import { getDoneToday, isDoneToday, toggleDoneToday, doneTodayCount } from './asanaDone'

// Minimal localStorage shim so the test is independent of the runtime env.
beforeEach(() => {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  }
})

describe('asanaDone — done-for-the-day tracker', () => {
  it('starts empty', () => {
    expect(isDoneToday('tadasana')).toBe(false)
    expect(doneTodayCount()).toBe(0)
    expect(getDoneToday()).toBeInstanceOf(Set)
  })

  it('toggles a pose on and off, returning the new state', () => {
    expect(toggleDoneToday('tadasana')).toBe(true)
    expect(isDoneToday('tadasana')).toBe(true)
    expect(doneTodayCount()).toBe(1)
    expect(toggleDoneToday('tadasana')).toBe(false)
    expect(isDoneToday('tadasana')).toBe(false)
    expect(doneTodayCount()).toBe(0)
  })

  it('tracks multiple poses independently', () => {
    toggleDoneToday('tadasana')
    toggleDoneToday('vrksasana')
    expect(doneTodayCount()).toBe(2)
    expect(isDoneToday('vrksasana')).toBe(true)
    expect(isDoneToday('balasana')).toBe(false)
  })

  it('reads empty for a stale (previous-day) record', () => {
    localStorage.setItem('sanctuary.asanaDone', JSON.stringify({ date: '2000-01-01', ids: ['tadasana'] }))
    expect(isDoneToday('tadasana')).toBe(false) // yesterday's ticks don't carry over
    expect(doneTodayCount()).toBe(0)
  })
})
