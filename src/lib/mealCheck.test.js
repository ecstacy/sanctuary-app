import { describe, it, expect } from 'vitest'
import { parseMeal, assessMeal, remediesFor, mealCombos, portionWeightOf } from './mealCheck'
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

  it('captures quantity (size + count) without losing the food', () => {
    const large = parseMeal('large black coffee').matched[0]
    expect(large.id).toBe('coffee')
    expect(large.qty.size).toBe('large')
    expect(large.portionWeight).toBeGreaterThan(1)

    const two = parseMeal('two eggs').matched[0]
    expect(two.id).toBe('egg')
    expect(two.qty.count).toBe(2)
    expect(two.portionWeight).toBeGreaterThan(1)
  })

  it('reads a portion word as an implied size (a bowl is large)', () => {
    const bowl = parseMeal('a bowl of rice').matched[0]
    expect(['basmatiRice', 'brownRice']).toContain(bowl.id)
    expect(bowl.qty.unit).toBe('bowl')
    expect(bowl.qty.size).toBe('large')
  })

  it('keeps leftover descriptors as modifiers', () => {
    const m = parseMeal('black coffee').matched[0]
    expect(m.id).toBe('coffee')
    expect(m.modifiers).toContain('black')
  })

  it('defaults a bare raw/cooked variant to cooked, but honours a modifier', () => {
    // Bare "tomato"/"onion" now resolve to the COOKED variant — in a prepared
    // meal that is almost always right, and it removes a friction prompt (the
    // old behaviour asked every time). Raw stays reachable via an explicit word.
    expect(parseMeal('tomato').matched.map((m) => m.id)).toContain('tomatoCooked')
    expect(parseMeal('onion').matched.map((m) => m.id)).toContain('onionCooked')
    expect(parseMeal('raw tomato').matched.map((m) => m.id)).toContain('tomatoRaw')
    expect(parseMeal('cooked tomato').matched.map((m) => m.id)).toContain('tomatoCooked')
  })

  it('attaches a prep dosha delta from a preparation modifier (#57)', () => {
    const iced = parseMeal('iced coffee').matched.find((m) => m.id === 'coffee')
    expect(iced.doshaDelta).toBeTruthy()
    expect(iced.doshaDelta.pitta).toBeLessThan(0) // iced cools
  })

  it('infers an implied companion food and marks it added (#57)', () => {
    const ids = parseMeal('milky coffee').matched.map((m) => m.id)
    expect(ids).toContain('coffee')
    expect(ids).toContain('milk')
    const milk = parseMeal('milky coffee').matched.find((m) => m.id === 'milk')
    expect(milk.inferred).toBe(true)
  })

  it('does not double-add a companion already named', () => {
    // "coffee with milk" already splits milk out; "milky" must not add a 2nd.
    const milks = parseMeal('milky coffee with milk').matched.filter((m) => m.id === 'milk')
    expect(milks.length).toBe(1)
  })
})

describe('modifier prep deltas — bounded and correct sign', () => {
  it('reads an iced drink as cooler than a hot one', () => {
    const iced = assessMeal([{ id: 'coffee', portionWeight: 1, doshaDelta: parseMeal('iced coffee').matched.find((m) => m.id === 'coffee').doshaDelta }])
    const hot = assessMeal(['coffee'])
    expect(iced.perDosha.pitta).toBeLessThan(hot.perDosha.pitta)
  })

  it('reads a fried food as heavier (more Kapha) than plain', () => {
    // potato is reviewed; frying should push Kapha up vs the bare food.
    const friedDelta = { kapha: 0.4, pitta: 0.3 }
    const fried = assessMeal([{ id: 'potato', portionWeight: 1, doshaDelta: friedDelta }])
    const plain = assessMeal(['potato'])
    expect(fried.perDosha.kapha).toBeGreaterThan(plain.perDosha.kapha)
  })
})

describe('portionWeightOf — bounded magnitude', () => {
  it('scales up for large / more and down for small, within bounds', () => {
    expect(portionWeightOf({ size: 'large' })).toBeGreaterThan(1)
    expect(portionWeightOf({ size: 'small' })).toBeLessThan(1)
    expect(portionWeightOf({ count: 3 })).toBeGreaterThan(portionWeightOf({ count: 1 }))
    // never runaway
    expect(portionWeightOf({ count: 99, size: 'large' })).toBeLessThanOrEqual(1.8)
    expect(portionWeightOf({ size: 'small' })).toBeGreaterThanOrEqual(0.5)
  })

  it('lets a larger portion pull the meal harder between items', () => {
    // ginger (raises pitta) + basmati (settles pitta). A large ginger should
    // tilt the net more toward pitta than a small one.
    const bigGinger = assessMeal([{ id: 'gingerFresh', portionWeight: 1.6 }, { id: 'basmatiRice', portionWeight: 1 }])
    const smallGinger = assessMeal([{ id: 'gingerFresh', portionWeight: 0.6 }, { id: 'basmatiRice', portionWeight: 1 }])
    expect(bigGinger.perDosha.pitta).toBeGreaterThan(smallGinger.perDosha.pitta)
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

  it('honours a self-reported dosha over the quiz primary (#52)', () => {
    // A Pitta-by-quiz user who told us they feel more like Kapha: the meal that
    // raises Kapha is now framed as raising THEIR own dosha.
    const feelsKapha = { dosha_details: { primary: 'pitta', selfReport: { fit: 'adjusted', primary: 'kapha' } } }
    expect(assessMeal(meal, feelsKapha).concern).toBe('mind')
    // A mere 'confirmed' report leaves the quiz primary in place.
    const confirmedPitta = { dosha_details: { primary: 'pitta', selfReport: { fit: 'confirmed' } } }
    expect(assessMeal(meal, confirmedPitta).concern).toBe('watch')
  })
})

describe('assessMeal — a balanced/tridoshic constitution has no single lens', () => {
  // A ~33/33/34 user re-quizzed as tridoshic must NOT be lensed to their numeric
  // top dosha (that made a balanced user read as "your Pitta"). A Pitta-raising
  // meal is 'watch' (assessed on its own), never 'mind'.
  const tridoshic = { dosha_details: { primary: 'vata', percentages: { vata: 34, pitta: 33, kapha: 33 } } }
  it('does not treat the numeric top dosha as a dominant to mind', () => {
    const a = assessMeal(['gingerFresh'], tridoshic) // raises pitta
    expect(a.headline).toBe('pitta')
    expect(a.lens).toBeNull()
    expect(a.concern).toBe('watch')
  })
})

describe('remediesFor — post-meal remedies are light correctives, not a second plate', () => {
  it('never suggests a heavy staple (grain / legume / animal / composite) to eat now', () => {
    const a = assessMeal(['gingerFresh']) // raises pitta
    const { foods } = remediesFor(a)
    const heavy = new Set(['grain', 'legume', 'animal', 'other'])
    for (const f of foods) expect(heavy.has(getIngredient(f.id).category)).toBe(false)
    // mung dal pacifies pitta but must never be offered after a meal.
    expect(foods.map((f) => f.id)).not.toContain('mungDal')
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
    const a = assessMeal(['gingerFresh']) // pitta; some pitta pacifiers are dairy (ghee, buttermilk)
    const vegan = remediesFor(a, { dietPrefs: { patterns: ['vegan'] } })
    for (const f of vegan.foods) {
      expect(getIngredient(f.id).category).not.toBe('dairy')
    }
  })

  it('personalises remedies by time of day', () => {
    const a = assessMeal(['egg', 'whiteBread', 'avocado']) // kapha
    const morning = remediesFor(a, { slot: 'morning' }).foods.map((f) => f.id)
    const evening = remediesFor(a, { slot: 'evening' }).foods.map((f) => f.id)
    expect(morning).not.toEqual(evening) // the slot actually changes the picks
    // every pick still genuinely pacifies the raised dosha
    for (const f of [...morning, ...evening]) expect(getIngredient(f).doshaEffect.kapha).toBeLessThan(0)
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
