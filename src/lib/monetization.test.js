import { describe, it, expect, vi, beforeEach } from 'vitest'

// Both inputs to the gate are mocked so each rule can be isolated.
const mocks = vi.hoisted(() => ({ platform: 'web', regionRestricted: false }))
vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => mocks.platform },
}))
vi.mock('./region', () => ({
  isPlusPurchaseRestricted: () => mocks.regionRestricted,
}))

const { getPurchaseBlockReason, canSellPlus } = await import('./monetization')

beforeEach(() => {
  mocks.platform = 'web'
  mocks.regionRestricted = false
})

describe('iOS gate (Apple 3.1.1 — Plus sells via Stripe, so never on iOS)', () => {
  it('blocks selling on iOS', () => {
    mocks.platform = 'ios'
    expect(getPurchaseBlockReason()).toBe('ios')
    expect(canSellPlus()).toBe(false)
  })

  it('blocks on iOS even in an unrestricted region', () => {
    mocks.platform = 'ios'
    mocks.regionRestricted = false
    expect(canSellPlus()).toBe(false)
  })

  it('reports ios (not region) when both gates apply — platform is absolute', () => {
    mocks.platform = 'ios'
    mocks.regionRestricted = true
    expect(getPurchaseBlockReason()).toBe('ios')
  })
})

describe('region gate still works', () => {
  it('blocks a restricted region on android', () => {
    mocks.platform = 'android'
    mocks.regionRestricted = true
    expect(getPurchaseBlockReason()).toBe('region')
    expect(canSellPlus()).toBe(false)
  })
})

describe('selling is allowed where it should be', () => {
  it('android, unrestricted region', () => {
    mocks.platform = 'android'
    expect(getPurchaseBlockReason()).toBeNull()
    expect(canSellPlus()).toBe(true)
  })

  it('web, unrestricted region', () => {
    mocks.platform = 'web'
    expect(canSellPlus()).toBe(true)
  })
})
