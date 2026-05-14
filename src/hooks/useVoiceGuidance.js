import { useState, useCallback, useRef, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { TextToSpeech } from '@capacitor-community/text-to-speech'

// ─── Voice Guidance ─────────────────────────────────────────────────────────
//
// Two engines under one hook:
//   • Native (Android/iOS via Capacitor) — TextToSpeech plugin. Calls the
//     OS's system TTS service directly. Stable, audible, queues reliably,
//     no WebView speechSynthesis quirks. This is the path used in
//     production by the installed app.
//   • Web (browser / dev preview) — falls back to window.speechSynthesis
//     with the same callback contract. Voice list loads asynchronously
//     on first call so we re-pick on `voiceschanged`.
//
// Callers see one API: `speak(text, onEnd?)` and `stop()`. The hook
// chooses the engine once at mount based on Capacitor.isNativePlatform().
// `onEnd` fires AFTER the utterance finishes (or errors / times out),
// before the next item in the queue runs — so multi-step instructions
// can be sequenced deterministically without race conditions.
// ─────────────────────────────────────────────────────────────────────────────

const IS_NATIVE = typeof window !== 'undefined' && Capacitor?.isNativePlatform?.()

export function useVoiceGuidance() {
  const [enabled, setEnabled] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const voiceRef = useRef(null)
  const queueRef = useRef([])
  const speakingRef = useRef(false)
  // Bumped on stop(); native speak() compares before resolving so a
  // stale onEnd from a cancelled utterance can't advance the queue.
  const generationRef = useRef(0)

  // ── Web-only: pick a voice and keep speechSynthesis alive ──────────────
  useEffect(() => {
    if (IS_NATIVE) return
    if (!('speechSynthesis' in window)) return

    function pickVoice() {
      const voices = speechSynthesis.getVoices()
      if (!voices.length) return
      voiceRef.current =
        voices.find(v => v.lang.startsWith('en') && !v.localService) ||
        voices.find(v => v.lang.startsWith('en-') && v.name.includes('Female')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0]
    }

    pickVoice()
    speechSynthesis.addEventListener('voiceschanged', pickVoice)

    const keepAlive = setInterval(() => {
      if (speechSynthesis.paused) speechSynthesis.resume()
    }, 5000)

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', pickVoice)
      speechSynthesis.cancel()
      clearInterval(keepAlive)
    }
  }, [])

  // ── Native: ensure any prior utterance is cleared on unmount ───────────
  useEffect(() => {
    if (!IS_NATIVE) return
    return () => { TextToSpeech.stop().catch(() => {}) }
  }, [])

  const processQueue = useCallback(() => {
    if (speakingRef.current || !queueRef.current.length) return

    const item = queueRef.current.shift()
    const text  = typeof item === 'string' ? item : item.text
    const onEnd = typeof item === 'string' ? null : item.onEnd
    if (!text) { setTimeout(() => processQueue(), 0); return }

    speakingRef.current = true
    setSpeaking(true)
    const gen = generationRef.current

    const done = () => {
      // Guard against late callbacks from a cancelled utterance — without
      // this a stop() followed by a fresh speak() could see the prior
      // onEnd fire and advance the new queue prematurely.
      if (gen !== generationRef.current) return
      speakingRef.current = false
      setSpeaking(false)
      try { onEnd?.() } catch (err) { console.error('[voice] onEnd threw:', err?.message || err) }
      setTimeout(() => processQueue(), 250)
    }

    if (IS_NATIVE) {
      // Native plugin: `speak` resolves when the utterance finishes.
      // Defensive safety timer in case the OS never fires the callback
      // (rare, but observed on some Android TTS engines under audio
      // focus contention).
      const safety = setTimeout(done, 30000)
      TextToSpeech.speak({
        text,
        lang: 'en-US',
        rate: 0.95,           // plugin defaults to 1.0; slight slow-down for instruction clarity
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient',  // iOS only — mixes with background music
      })
        .then(() => { clearTimeout(safety); done() })
        .catch(err => {
          clearTimeout(safety)
          console.error('[voice] native TTS error:', err?.message || err)
          done()
        })
      return
    }

    // ── Web fallback ──
    if (!('speechSynthesis' in window)) { done(); return }
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    if (voiceRef.current) utterance.voice = voiceRef.current
    utterance.lang = 'en-US'
    utterance.rate = 0.88
    utterance.pitch = 1.0
    utterance.volume = 1.0
    const safety = setTimeout(done, 30000)
    utterance.onend = () => { clearTimeout(safety); done() }
    utterance.onerror = () => { clearTimeout(safety); done() }
    speechSynthesis.speak(utterance)
  }, [])

  /**
   * Queue a single phrase. Optional `onEnd` callback fires after this
   * specific utterance finishes (or errors), BEFORE the next item is
   * processed. Use it to sequence multi-step instructions.
   */
  const speak = useCallback((text, onEnd) => {
    if (!enabled || !text) return
    queueRef.current.push(onEnd ? { text, onEnd } : text)
    processQueue()
  }, [enabled, processQueue])

  const stop = useCallback(() => {
    queueRef.current = []
    speakingRef.current = false
    setSpeaking(false)
    generationRef.current += 1
    if (IS_NATIVE) {
      TextToSpeech.stop().catch(() => {})
    } else if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
  }, [])

  const toggle = useCallback(() => {
    setEnabled(prev => {
      if (prev) {
        // Turning off — flush everything
        queueRef.current = []
        speakingRef.current = false
        setSpeaking(false)
        generationRef.current += 1
        if (IS_NATIVE) TextToSpeech.stop().catch(() => {})
        else if ('speechSynthesis' in window) speechSynthesis.cancel()
      }
      return !prev
    })
  }, [])

  return { enabled, speaking, speak, stop, toggle }
}
