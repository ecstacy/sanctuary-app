import { useState, useCallback, useRef, useEffect } from 'react'

// ─── Voice Guidance ─────────────────────────────────────────────────────────
// Uses Web Speech Synthesis API with Android WebView workarounds.

export function useVoiceGuidance() {
  const [enabled, setEnabled] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const voiceRef = useRef(null)
  const queueRef = useRef([])
  const speakingRef = useRef(false)

  // Load voices — Android WebView loads them asynchronously
  useEffect(() => {
    if (!('speechSynthesis' in window)) return

    function pickVoice() {
      const voices = speechSynthesis.getVoices()
      if (!voices.length) return
      // Prefer English voices; prioritize non-local (network) voices for quality
      voiceRef.current =
        voices.find(v => v.lang.startsWith('en') && !v.localService) ||
        voices.find(v => v.lang.startsWith('en-') && v.name.includes('Female')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0]
    }

    pickVoice()
    speechSynthesis.addEventListener('voiceschanged', pickVoice)

    // Android WebView bug: speechSynthesis can get stuck. Periodically poke it.
    const keepAlive = setInterval(() => {
      if (speechSynthesis.paused) speechSynthesis.resume()
    }, 5000)

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', pickVoice)
      speechSynthesis.cancel()
      clearInterval(keepAlive)
    }
  }, [])

  const processQueue = useCallback(() => {
    if (speakingRef.current || !queueRef.current.length) return
    if (!('speechSynthesis' in window)) return

    // Queue holds either bare strings (legacy callers) or {text, onEnd}
    // objects. Normalize at the dequeue site so internal logic doesn't
    // care about the shape.
    const item = queueRef.current.shift()
    const text  = typeof item === 'string' ? item : item.text
    const onEnd = typeof item === 'string' ? null : item.onEnd
    speakingRef.current = true
    setSpeaking(true)

    // Cancel any stuck utterance
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    if (voiceRef.current) utterance.voice = voiceRef.current
    utterance.lang = 'en-US'
    utterance.rate = 0.88
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const done = () => {
      speakingRef.current = false
      setSpeaking(false)
      // Fire the per-utterance callback BEFORE processing the next item
      // so callers see a deterministic "this one is done" signal.
      try { onEnd?.() } catch (err) { console.error('[voice] onEnd threw:', err?.message || err) }
      // Process next in queue after a small pause
      setTimeout(() => processQueue(), 300)
    }

    // Android WebView safety: if utterance doesn't fire onend within 30s, force done
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
    if ('speechSynthesis' in window) speechSynthesis.cancel()
  }, [])

  const toggle = useCallback(() => {
    setEnabled(prev => {
      if (prev) {
        // Turning off — stop everything
        queueRef.current = []
        speakingRef.current = false
        setSpeaking(false)
        if ('speechSynthesis' in window) speechSynthesis.cancel()
      }
      return !prev
    })
  }, [])

  return { enabled, speaking, speak, stop, toggle }
}
