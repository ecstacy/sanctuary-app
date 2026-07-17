// PII-scrub regression test.
//
// track()'s scrubber is the last line of defence between the app's event bus
// and a third-party analytics vendor. It's a plain regex on property keys, so
// it is exactly the kind of guard that quietly rots when someone adds an event
// with a `user_email` prop and nobody notices. These tests drive the REAL
// track() path (consent → scrub → vendor) rather than the helper, so they fail
// if the pipeline stops scrubbing for any reason, not just if the regex changes.
//
// See docs/security-audit.md finding #11.

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./consent', () => ({
  isAggregateAllowed: () => true,
  isCrashReportingAllowed: () => false,
  subscribe: () => () => {},
  getConsent: () => ({ aggregate: true }),
}))

const { track, _setVendor, setSuperProps, reset } = await import('./track')

let captured = []
beforeEach(() => {
  captured = []
  reset()
  _setVendor({
    capture: (name, payload) => captured.push({ name, payload }),
    reset: () => {},
  })
})

const propsOf = () => captured.at(-1)?.payload ?? {}

describe('track() drops PII-shaped property keys', () => {
  it('drops the obvious direct identifiers', () => {
    track('test_event', {
      email: 'akash@example.com',
      name: 'Akash',
      phone: '+49 170 000000',
      address: '12 Some Street',
      password: 'hunter2',
      // benign props must survive
      pose_id: 'vrksasana',
      duration_s: 42,
    })
    const p = propsOf()
    for (const k of ['email', 'name', 'phone', 'address', 'password']) {
      expect(p, `${k} must not reach the vendor`).not.toHaveProperty(k)
    }
    expect(p.pose_id).toBe('vrksasana')
    expect(p.duration_s).toBe(42)
  })

  it('drops variants and near-misses', () => {
    track('test_event', {
      user_email: 'a@b.com',
      full_name: 'A B',
      displayName: 'ab',
      device_id: 'abc',
      advertising_id: 'xyz',
      access_token: 'tok',
      api_secret: 's',
      latitude: 1.23,
      longitude: 4.56,
      geo_city: 'Berlin',
      kept: 'yes',
    })
    const p = propsOf()
    for (const k of [
      'user_email', 'full_name', 'displayName', 'device_id',
      'advertising_id', 'access_token', 'api_secret',
      'latitude', 'longitude', 'geo_city',
    ]) {
      expect(p, `${k} must not reach the vendor`).not.toHaveProperty(k)
    }
    expect(p.kept).toBe('yes')
  })

  it('scrubs nested objects too', () => {
    track('test_event', { meta: { email: 'a@b.com', slot: 'morning' } })
    expect(propsOf().meta).not.toHaveProperty('email')
    expect(propsOf().meta.slot).toBe('morning')
  })

  it('scrubs super-props, not just per-event props', () => {
    setSuperProps({ email: 'leak@example.com', app_language: 'de' })
    track('test_event', {})
    const p = propsOf()
    expect(p).not.toHaveProperty('email')
    expect(p.app_language).toBe('de')
  })

  it('truncates long strings so free text cannot smuggle a payload', () => {
    track('test_event', { note: 'x'.repeat(5000) })
    expect(propsOf().note.length).toBeLessThanOrEqual(200)
  })
})

describe('track() still emits what dashboards rely on', () => {
  // distinct_id is deliberately NOT asserted here: it resolves from browser
  // storage via getAnonId() and returns null when `window` is undefined, which
  // is the correct fail-safe for a non-browser context. Asserting it would
  // mean pulling in jsdom for no security value — the identifier is exercised
  // on-device instead.
  it('attaches session_id and ts', () => {
    track('test_event', { ok: true })
    const p = propsOf()
    expect(p.session_id).toBeTruthy()
    expect(p.ts).toBeTruthy()
  })

  it('emits the event under its own name', () => {
    track('test_event', { ok: true })
    expect(captured.at(-1).name).toBe('test_event')
  })
})
