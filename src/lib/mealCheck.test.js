import { describe, it, expect } from 'vitest'
import { parseMeal, assessMeal, remediesFor, mealCombos } from './mealCheck'
import { getIngredient } from './ingredients'

const pittaUser = { dosha_details: { primary: 'pitta' } }
const kaphaUser = { dosha_details: { primary: 'kapha' } }

describe('parseMeal', () => {
  it('resolves the example meal despite plurals, aliases and connectives', () => {
    const { matched } = parseMeal('eggs with toast and avocado')
    const ids = matched.map((m) => m.id)
    expect(ids).toContain('egg')
    expect(ids).toContain('whiteBread') // "toast" is an alias of white bread
    expect(ids).toContain('avocado')
  })

  it('finds the food inside a multi-word phrase (modifiers ignored)', () => {
    expect(parseMeal('black coffee dripped').matched.map((m) => m.id)).toContain('coffee')
    expect(parseMeal('scrambled eggs').matched.map((m) => m.id)).toContain('egg')
  })

  it('surfaces unknown foods instead of guessing them', () => {
    const { matched, unknown } = parseMeal('quinoa and a unicornberry')
    expect(matched.map((m) => m.id)).toContain('quinoa')
    expect(unknown.map((u) => u.token)).toContain('unicornberry')
  })

  it('does not double-count a repeated food', () => {
    const { matched } = parseMeal('rice, rice and more rice')
    expect(matched.filter((m) => m.id === 'basmatiRice' || m.id === 'brownRice').length).toBeLessThanOrEqual(1)
  })
})

describe('assessMeal — sign correctness', () => {
  // Fresh ginger: vata -1 (pacifies), pitta +1 (aggravates), kapha -1 (pacifies).
  it('reads a heating food as raising pitta, settling vata & kapha', () => {
    const a = assessMeal(['gingerFresh'])
    expect(a.dir.pitta).toBe('raises')
    expect(a.dir.vata).toBe('settles')
    expect(a.dir.kapha).toBe('settles')
    expect(a.headline).toBe('pitta')
  })

  // Basmati (vata -1, pitta -1, kapha 0) raises nothing.
  it('reads a tridoshic-calming food as raising nothing', () => {
    const a = assessMeal(['basmatiRice'])
    expect(a.headline).toBeNull()
  })

  it('returns an all-neutral, headline-less result for an empty meal', () => {
    const a = assessMeal([])
    expect(a.headline).toBeNull()
    expect(a.perDosha).toEqual({ vata: 0, pitta: 0, kapha: 0 })
  })
})

describe('assessMeal — the worked example (eggs + toast + avocado)', () => {
  // egg   v-1 p+1 k+1 ; whiteBread v+1 p0 k+1 ; avocado v-1 p-1 k+1
  // → kapha is raised by all three; avocado offsets the egg's pitta → net Kapha.
  const meal = ['egg', 'whiteBread', 'avocado']

  it('nets to raising Kapha (the honest read over the "eggs = pitta" guess)', () => {
    const a = assessMeal(meal, kaphaUser)
    expect(a.headline).toBe('kapha')
    expect(a.perDosha.kapha).toBeGreaterThan(0.5)
    expect(a.dir.pitta).toBe('neutral') // avocado cancels the egg's heat
  })

  it('frames raising the user\'s own dosha as "mind"', () => {
    expect(assessMeal(meal, kaphaUser).concern).toBe('mind')
    expect(assessMeal(meal, pittaUser).concern).toBe('watch') // raises kapha, not their pitta
  })
})

describe('remediesFor', () => {
  it('suggests foods that pacify the raised dosha, and pranayama that balances it', () => {
    const a = assessMeal(['gingerFresh']) // raises pitta
    const { target, foods, practices } = remediesFor(a)
    expect(target).toBe('pitta')
    // every suggested food must actually pacify pitta (doshaEffect.pitta < 0)
    for (const f of foods) expect(getIngredient(f.id).doshaEffect.pitta).toBeLessThan(0)
    expect(foods.length).toBeGreaterThan(0)
    // pranayama must balance pitta (e.g. Sheetali / Nadi Shodhana / Bhramari)
    expect(practices.length).toBeGreaterThan(0)
    expect(practices.map((p) => p.id)).toContain('sheetali')
  })

  it('never suggests a food the user must exclude (vegan → no dairy remedy)', () => {
    const a = assessMeal(['gingerFresh']) // pitta; yoghurt/buttermilk pacify pitta
    const vegan = remediesFor(a, { dietPrefs: { patterns: ['vegan'] } })
    for (const f of vegan.foods) {
      expect(getIngredient(f.id).category).not.toBe('dairy')
    }
    const plain = remediesFor(a)
    // without the restriction, a dairy pacifier is allowed to appear
    expect(plain.foods.some((f) => getIngredient(f.id).category === 'dairy')).toBe(true)
  })

  it('returns no remedy target when nothing is raised', () => {
    const a = assessMeal(['basmatiRice'])
    expect(remediesFor(a).target).toBeNull()
  })
})

describe('mealCombos (viruddha āhāra within a meal)', () => {
  it('does not fabricate pairings for a plain compatible meal', () => {
    expect(mealCombos(['basmatiRice', 'mungDal'])).toEqual([])
  })
})
