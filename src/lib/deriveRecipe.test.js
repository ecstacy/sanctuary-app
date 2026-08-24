import { describe, it, expect } from 'vitest'
import { deriveRecipe } from './deriveRecipe'

// Tiny fake pantry so the test asserts the MATH, not the dataset.
const PANTRY = {
  rice:    { id: 'rice',    name: 'Rice',    category: 'grain',     rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'soft'], doshaEffect: { vata: -1, pitta: -1, kapha: 1 } },
  chilli:  { id: 'chilli',  name: 'Chilli',  category: 'spice',     rasa: ['pungent'], virya: 'heating', vipaka: 'pungent', guna: ['dry', 'sharp'], doshaEffect: { vata: 1, pitta: 1, kapha: -1 } },
  chicken: { id: 'chicken', name: 'Chicken', category: 'animal',    rasa: ['sweet'], virya: 'heating', vipaka: 'sweet', guna: ['heavy'], doshaEffect: { vata: -1, pitta: 0, kapha: 1 } },
  milk:    { id: 'milk',    name: 'Milk',    category: 'dairy',     rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'oily'], doshaEffect: { vata: -1, pitta: -1, kapha: 1 }, allergens: ['dairy'] },
  draftX:  { id: 'draftX',  name: 'DraftX',  category: 'other',     rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet', guna: [], doshaEffect: { vata: 1, pitta: 1, kapha: 1 } },
}
const resolve = (id) => PANTRY[id] || null

describe('deriveRecipe', () => {
  it('sums ingredient dosha effects and clamps to the display vocabulary', () => {
    // rice(K+1) + chilli(K−1) → 0; vata −1+1 → 0; pitta −1+1 → 0.
    const d = deriveRecipe({ id: 'r', name: 'R', ingredientIds: ['rice', 'chilli'], method: 'none' }, resolve)
    expect(d.doshaEffect).toEqual({ vata: 0, pitta: 0, kapha: 0 })
  })

  it('applies the cooking-method delta on top of the ingredient sum', () => {
    // Plain rice is Kapha +1. Fried adds kapha+1, pitta+1, vata−1 → clamps stay
    // in vocabulary but pitta flips −1→0(+1)=0? rice pitta −1 + fry +1 = 0.
    const plain = deriveRecipe({ id: 'a', name: 'A', ingredientIds: ['rice'], method: 'none' }, resolve)
    const fried = deriveRecipe({ id: 'b', name: 'B', ingredientIds: ['rice'], method: 'fried' }, resolve)
    expect(plain.doshaEffect.pitta).toBe(-1)
    expect(fried.doshaEffect.pitta).toBe(0)   // −1 + 1
    expect(fried.guna).toEqual(expect.arrayContaining(['oily', 'heavy']))
  })

  it('unions allergens (including category-implied) from the parts', () => {
    const d = deriveRecipe({ id: 'c', name: 'C', ingredientIds: ['rice', 'milk'], method: 'boiled' }, resolve)
    expect(d.allergens).toContain('dairy')
  })

  it('propagates a meat tag when any part is meat, so veg filters catch it', () => {
    const d = deriveRecipe({ id: 'd', name: 'D', ingredientIds: ['rice', 'chicken'], method: 'simmered' }, resolve)
    expect(d.dietTags).toContain('meat')
  })

  it('votes virya heating/cooling across ingredients plus the method nudge', () => {
    // cooling rice + heating chilli = 0, method none → neutral.
    expect(deriveRecipe({ id: 'e', name: 'E', ingredientIds: ['rice', 'chilli'], method: 'none' }, resolve).virya).toBe('neutral')
    // add a grill nudge (+1 heat) → heating.
    expect(deriveRecipe({ id: 'f', name: 'F', ingredientIds: ['rice', 'chilli'], method: 'grilled' }, resolve).virya).toBe('heating')
  })

  it('returns null when nothing resolves (all ingredients missing/unreviewed)', () => {
    expect(deriveRecipe({ id: 'g', name: 'G', ingredientIds: ['nope', 'gone'], method: 'none' }, resolve)).toBeNull()
  })

  it('marks itself derived, medium-confidence, with a self-explaining source', () => {
    const d = deriveRecipe({ id: 'h', name: 'H', ingredientIds: ['rice'], method: 'fried', reviewStatus: 'reviewed' }, resolve)
    expect(d.isDerivedRecipe).toBe(true)
    expect(d.confidence).toBe('medium')
    expect(d.source.text).toBe('derived')
    expect(d.source.note).toMatch(/computed/i)
    expect(d.reviewStatus).toBe('reviewed')
  })
})
