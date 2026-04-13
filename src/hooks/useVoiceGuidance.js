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
      // Prefer English voices; prioritise non-local (network) voices for quality
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

    const text = queueRef.current.shift()
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
      // Process next in queue after a small pause
      setTimeout(() => processQueue(), 300)
    }

    utterance.onend = done
    utterance.onerror = done

    // Android WebView safety: if utterance doesn't fire onend within 30s, force done
    const safety = setTimeout(done, 30000)
    const originalDone = done
    utterance.onend = () => { clearTimeout(safety); originalDone() }
    utterance.onerror = () => { clearTimeout(safety); originalDone() }

    speechSynthesis.speak(utterance)
  }, [])

  const speak = useCallback((text) => {
    if (!enabled || !text) return
    queueRef.current.push(text)
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
