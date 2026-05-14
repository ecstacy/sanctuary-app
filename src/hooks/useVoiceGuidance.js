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

// ─── Pre-recorded audio manifest ────────────────────────────────────────────
// `public/audio/manifest.json` is populated by scripts/generate-voice.mjs
// after a successful Azure HD voice synth run. Keys look like
// `${poseId}__name`, `${poseId}__enter`, `${poseId}__i0`, … `__iN`.
// At runtime the hook fetches the manifest once and a `speak(text, onEnd, { fileKey })`
// call routes to the MP3 if listed there — otherwise it falls back to
// native/Web TTS so the app stays functional even before generation is
// complete (or for cues that haven't been pre-recorded, like dynamic
// timing-based coach lines).
const AUDIO_BASE = '/audio/poses/'
const MANIFEST_URL = '/audio/manifest.json'
let manifestPromise = null
function loadManifest() {
  if (manifestPromise) return manifestPromise
  manifestPromise = fetch(MANIFEST_URL)
    .then(r => (r.ok ? r.json() : {}))
    .catch(() => ({}))
  return manifestPromise
}

export function useVoiceGuidance() {
  const [enabled, setEnabled] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const voiceRef = useRef(null)
  const queueRef = useRef([])
  const speakingRef = useRef(false)
  const manifestRef = useRef({})
  const audioElRef = useRef(null)
  // Bumped on stop(); native speak() compares before resolving so a
  // stale onEnd from a cancelled utterance can't advance the queue.
  const generationRef = useRef(0)

  // Prefetch the audio manifest at mount so the first call to speak()
  // doesn't race a fetch and unnecessarily fall back to TTS.
  useEffect(() => {
    loadManifest().then(m => { manifestRef.current = m || {} })
  }, [])

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
    const text    = typeof item === 'string' ? item : item.text
    const onEnd   = typeof item === 'string' ? null : item.onEnd
    const fileKey = typeof item === 'string' ? null : item.fileKey
    if (!text && !fileKey) { setTimeout(() => processQueue(), 0); return }

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

    // ── Pre-recorded MP3 path ────────────────────────────────────────────
    // Preferred when the caller knows the fileKey AND the manifest lists
    // it. Plays via HTMLAudioElement — works identically on native (via
    // the WebView's audio stack) and web. No system-TTS robot voice.
    if (fileKey && manifestRef.current[fileKey]) {
      const src = `${AUDIO_BASE}${fileKey}.mp3`
      // Reuse a single Audio element so we don't leak listeners across
      // hundreds of cues over a long session.
      let el = audioElRef.current
      if (!el) {
        el = new Audio()
        audioElRef.current = el
      }
      el.onended = null
      el.onerror = null
      el.src = src
      el.currentTime = 0
      const safety = setTimeout(done, 30000)
      el.onended = () => { clearTimeout(safety); done() }
      el.onerror = () => {
        clearTimeout(safety)
        console.warn('[voice] audio file failed, falling back to TTS:', src)
        // Re-queue the same text without the fileKey so the next pass
        // takes the TTS branch. Keeps the onEnd contract intact.
        speakingRef.current = false
        setSpeaking(false)
        queueRef.current.unshift({ text, onEnd })
        setTimeout(() => processQueue(), 0)
      }
      el.play().catch(err => {
        clearTimeout(safety)
        console.warn('[voice] audio play() rejected, falling back to TTS:', err?.message)
        speakingRef.current = false
        setSpeaking(false)
        queueRef.current.unshift({ text, onEnd })
        setTimeout(() => processQueue(), 0)
      })
      return
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
   *
   * If `opts.fileKey` is provided AND the manifest lists it, the call
   * plays the pre-recorded MP3 instead of synthesizing — used for the
   * Azure HD voice catalogue. Falls back to TTS automatically when the
   * key isn't in the manifest, so callers don't need to know what's
   * pre-recorded vs not.
   */
  const speak = useCallback((text, onEnd, opts) => {
    if (!enabled) return
    const fileKey = opts?.fileKey || null
    if (!text && !fileKey) return
    queueRef.current.push({ text, onEnd, fileKey })
    processQueue()
  }, [enabled, processQueue])

  const flushAudio = useCallback(() => {
    const el = audioElRef.current
    if (el) {
      try { el.pause() } catch { /* ignore */ }
      el.onended = null
      el.onerror = null
      el.removeAttribute('src')
    }
  }, [])

  const stop = useCallback(() => {
    queueRef.current = []
    speakingRef.current = false
    setSpeaking(false)
    generationRef.current += 1
    flushAudio()
    if (IS_NATIVE) {
      TextToSpeech.stop().catch(() => {})
    } else if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
  }, [flushAudio])

  const toggle = useCallback(() => {
    setEnabled(prev => {
      if (prev) {
        // Turning off — flush everything
        queueRef.current = []
        speakingRef.current = false
        setSpeaking(false)
        generationRef.current += 1
        flushAudio()
        if (IS_NATIVE) TextToSpeech.stop().catch(() => {})
        else if ('speechSynthesis' in window) speechSynthesis.cancel()
      }
      return !prev
    })
  }, [flushAudio])

  return { enabled, speaking, speak, stop, toggle }
}
