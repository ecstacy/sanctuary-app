import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchWithTimeout, TimeoutError, DEFAULT_TIMEOUT_MS } from './fetchWithTimeout'

const originalFetch = globalThis.fetch

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => {
  vi.useRealTimers()
  globalThis.fetch = originalFetch
})

function abortError() {
  const err = new Error('The operation was aborted.')
  err.name = 'AbortError'
  return err
}

/**
 * A fetch that never resolves unless its signal aborts — i.e. a hung socket.
 * Mirrors real fetch semantics: an ALREADY-aborted signal rejects immediately
 * rather than waiting for an 'abort' event that will never fire again.
 */
function hangingFetch() {
  return vi.fn((_input, init) => new Promise((_resolve, reject) => {
    const signal = init?.signal
    if (signal?.aborted) return reject(abortError())
    signal?.addEventListener('abort', () => reject(abortError()))
  }))
}

describe('the hang it exists to prevent', () => {
  it('rejects with TimeoutError instead of pending forever', async () => {
    globalThis.fetch = hangingFetch()
    const p = fetchWithTimeout('https://example.test/slow', { timeoutMs: 5000 })
    const assertion = expect(p).rejects.toBeInstanceOf(TimeoutError)
    await vi.advanceTimersByTimeAsync(5000)
    await assertion
  })

  it('marks the error so callers can branch on it', async () => {
    globalThis.fetch = hangingFetch()
    const p = fetchWithTimeout('https://example.test/slow', { timeoutMs: 1000 })
    const assertion = p.catch(e => e)
    await vi.advanceTimersByTimeAsync(1000)
    const err = await assertion
    expect(err.isTimeout).toBe(true)
    expect(err.timeoutMs).toBe(1000)
    expect(err.url).toBe('https://example.test/slow')
  })
})

describe('does not interfere with normal operation', () => {
  it('passes a fast response straight through', async () => {
    const res = { ok: true, status: 200 }
    globalThis.fetch = vi.fn().mockResolvedValue(res)
    await expect(fetchWithTimeout('https://example.test/ok')).resolves.toBe(res)
  })

  it('clears the timer so a resolved request leaves nothing pending', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
    await fetchWithTimeout('https://example.test/ok', { timeoutMs: 1000 })
    expect(vi.getTimerCount()).toBe(0)
  })

  it('forwards method/headers/body untouched', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
    await fetchWithTimeout('https://example.test/x', {
      method: 'POST', headers: { 'X-Test': '1' }, body: 'hi', timeoutMs: 1000,
    })
    const [, init] = globalThis.fetch.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({ 'X-Test': '1' })
    expect(init.body).toBe('hi')
    // `timeoutMs` is ours — it must not leak into the real fetch init.
    expect(init.timeoutMs).toBeUndefined()
  })

  it('propagates a real network error unchanged (not as a timeout)', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    const err = await fetchWithTimeout('https://example.test/x').catch(e => e)
    expect(err).toBeInstanceOf(TypeError)
    expect(err.isTimeout).toBeUndefined()
  })
})

describe('caller cancellation still works (Supabase + React cleanup rely on it)', () => {
  it('aborts when the caller signal aborts', async () => {
    globalThis.fetch = hangingFetch()
    const ac = new AbortController()
    const p = fetchWithTimeout('https://example.test/x', { signal: ac.signal, timeoutMs: 60_000 })
    const assertion = p.catch(e => e)
    ac.abort()
    const err = await assertion
    // Cancelled by the caller — NOT our timeout. Mislabelling this would make
    // ordinary unmount-cancellation look like a network fault in logs/UX.
    expect(err.isTimeout).toBeUndefined()
    expect(err.name).toBe('AbortError')
  })

  it('handles an already-aborted signal without hanging', async () => {
    globalThis.fetch = hangingFetch()
    const ac = new AbortController()
    ac.abort()
    const err = await fetchWithTimeout('https://example.test/x', { signal: ac.signal }).catch(e => e)
    expect(err).toBeInstanceOf(Error)
    expect(err.isTimeout).toBeUndefined()
  })
})

describe('defaults', () => {
  it('applies a sane default deadline', () => {
    expect(DEFAULT_TIMEOUT_MS).toBe(15_000)
  })
})
