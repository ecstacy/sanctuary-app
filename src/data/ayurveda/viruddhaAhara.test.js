// Guardrails for the viruddha āhāra (incompatible combinations) layer.
//   1. THE REVIEW GATE holds — nothing surfaces until a human signs it off.
//   2. The tag deriver classifies real foods correctly (the heuristic part).
// If (1) fails, unreviewed content ships. If (2) fails, warnings misfire.

import { describe, it, expect } from 'vitest'
import {
  VIRUDDHA_PAIRINGS, VIRUDDHA_NOTES, viruddhaTags,
  viruddhaInMeal, viruddhaForIngredient, viruddhaCoverage,
} from './viruddhaAhara'
import { getIngredient } from '../../lib/ingredients'

describe('viruddha review gate', () => {
  it('every authored entry is currently draft (nothing signed off yet)', () => {
    // When the founder reviews docs/diet-review-viruddha-ahara.md and flips
    // entries, THIS test is the reminder to update it deliberately.
    expect(VIRUDDHA_PAIRINGS.every((p) => p.reviewStatus === 'draft')).toBe(true)
    expect(VIRUDDHA_NOTES.every((n) => n.reviewStatus === 'draft')).toBe(true)
    const cov = viruddhaCoverage()
    expect(cov.pairings.reviewed).toBe(0)
    expect(cov.notes.reviewed).toBe(0)
  })

  it('no draft pairing leaks through the selectors', () => {
    // milk + fish is the flagship pairing, but it's a draft — so a milk+fish
    // meal must produce ZERO warnings until reviewed.
    const milk = getIngredient('milk')
    const fish = getIngredient('salmon') || getIngredient('fish') || getIngredient('tuna')
    if (milk && fish) {
      expect(viruddhaInMeal([milk, fish])).toHaveLength(0)
    }
    expect(viruddhaForIngredient(getIngredient('milk')).pairings).toHaveLength(0)
  })

  it('every pairing references tags the deriver can actually produce', () => {
    const KNOWN = new Set(['milk', 'curd', 'honey', 'ghee', 'fish', 'meat', 'sourFruit', 'banana', 'melon', 'radish', 'salt'])
    for (const p of VIRUDDHA_PAIRINGS) {
      for (const tag of [...p.aTags, ...p.bTags]) expect(KNOWN.has(tag)).toBe(true)
    }
    for (const n of VIRUDDHA_NOTES) {
      for (const tag of n.tags) expect(KNOWN.has(tag)).toBe(true)
    }
  })
})

describe('viruddhaTags deriver', () => {
  const tagsOf = (id) => {
    const ing = getIngredient(id)
    return ing ? viruddhaTags(ing) : new Set()
  }

  it('classifies dairy: fresh milk vs soured curd', () => {
    expect(tagsOf('milk').has('milk')).toBe(true)
    expect(tagsOf('yoghurt').has('curd')).toBe(true)
    expect(tagsOf('buttermilk').has('curd')).toBe(true)
    // Fresh milk is not curd and vice-versa.
    expect(tagsOf('milk').has('curd')).toBe(false)
    expect(tagsOf('yoghurt').has('milk')).toBe(false)
  })

  it('tags honey and ghee distinctly', () => {
    expect(tagsOf('honey').has('honey')).toBe(true)
    expect(tagsOf('ghee').has('ghee')).toBe(true)
    expect(tagsOf('honey').has('ghee')).toBe(false)
  })

  it('tags sour fruits (named + sour-tasting), banana, melon, salt', () => {
    expect(tagsOf('lemon').has('sourFruit')).toBe(true)
    expect(tagsOf('pineapple').has('sourFruit')).toBe(true)
    expect(tagsOf('banana').has('banana')).toBe(true)
    expect(tagsOf('watermelon').has('melon')).toBe(true)
    expect(tagsOf('salt').has('salt')).toBe(true)
  })

  it('does not over-tag a plain grain', () => {
    expect(viruddhaTags(getIngredient('basmatiRice')).size).toBe(0)
  })
})
