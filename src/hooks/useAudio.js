import { useRef, useCallback, useEffect } from 'react'

// ─── Procedural Audio Engine ────────────────────────────────────────────────
// Generates tick, bell, chime, and completion sounds using Web Audio API.
// No external audio files needed.

export function useAudio() {
  const ctxRef = useRef(null)

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    // Resume if suspended (Android WebView requires user gesture)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }

  // Soft metronome tick — plays every second during active pose
  const tick = useCallback(() => {
    try {
      const ctx = getCtx()
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, t)
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.04)

      gain.gain.setValueAtTime(0.06, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.08)
    } catch { /* audio not available */ }
  }, [])

  // Gentle bell — plays on pose transitions
  const bell = useCallback(() => {
    try {
      const ctx = getCtx()
      const t = ctx.currentTime

      // Two harmonics for a richer bell
      ;[523.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, t)
        gain.gain.setValueAtTime(i === 0 ? 0.2 : 0.1, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(t)
        osc.stop(t + 1.2)
      })
    } catch { /* audio not available */ }
  }, [])

  // Rising chime — 3-note ascending for "get ready" / warning
  const chime = useCallback(() => {
    try {
      const ctx = getCtx()
      const t = ctx.currentTime
      const notes = [523.25, 659.25, 783.99] // C5, E5, G5

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, t + i * 0.15)
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.15, t + i * 0.15)
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.6)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(t + i * 0.15)
        osc.stop(t + i * 0.15 + 0.6)
      })
    } catch { /* audio not available */ }
  }, [])

  // Completion fanfare — descending then ascending
  const complete = useCallback(() => {
    try {
      const ctx = getCtx()
      const t = ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, t + i * 0.2)
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.18, t + i * 0.2 + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.8)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(t + i * 0.2)
        osc.stop(t + i * 0.2 + 0.8)
      })
    } catch { /* audio not available */ }
  }, [])

  // Countdown beep — short, urgent for last 5 seconds
  const countdown = useCallback(() => {
    try {
      const ctx = getCtx()
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1000, t)
      gain.gain.setValueAtTime(0.12, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.15)
    } catch { /* audio not available */ }
  }, [])

  // Initialize audio context on first user interaction
  const init = useCallback(() => {
    getCtx()
  }, [])

  useEffect(() => {
    return () => {
      ctxRef.current?.close()
      ctxRef.current = null
    }
  }, [])

  return { tick, bell, chime, complete, countdown, init }
}
