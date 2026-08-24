import { describe, it, expect } from 'vitest'
import { mealVisual } from './mealVisual'

describe('mealVisual', () => {
  it('keys the glyph off a name keyword before category', () => {
    // First core ingredient is a grain, but "salad" wins → vegetable theme.
    const v = mealVisual({ name: 'Quinoa salad', category: 'grain', core: [{ category: 'grain' }] })
    expect(v.icon).toBe('nutrition')
    expect(v.from).toBe('#e4ede2') // vegetable gradient, not grain
  })

  it('falls back to the dominant category when no keyword matches', () => {
    const v = mealVisual({ name: 'Warm chickpea bowl', category: 'legume' })
    expect(v.icon).toBe('ramen_dining')
  })

  it('reads category off the first core ingredient when no top-level category', () => {
    const v = mealVisual({ name: 'Something', core: [{ category: 'fruit' }] })
    expect(v.ink).toBe('#b25a37')
  })

  it('is deterministic and always returns a full theme', () => {
    const a = mealVisual({ name: 'Mystery dish' })
    const b = mealVisual({ name: 'Mystery dish' })
    expect(a).toEqual(b)
    expect(a).toEqual(expect.objectContaining({ icon: expect.any(String), from: expect.any(String), to: expect.any(String), ink: expect.any(String) }))
  })
})
