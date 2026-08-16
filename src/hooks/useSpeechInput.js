// ─────────────────────────────────────────────────────────────────────────────
//  useSpeechInput — speech-to-text for capturing a meal by voice.
//
//  Native (Android/iOS) uses @capacitor-community/speech-recognition; the web
//  build falls back to the Web Speech API where the browser supports it. Either
//  way it streams a partial transcript to `onPartial` so the field fills live,
//  and the caller's existing parseMeal() turns that text into food chips — the
//  parser was written modality-agnostic (#47) precisely so a transcript enters
//  at the same place typed text does.
//
//  `supported` is false when there is no recogniser at all, so the caller can
//  simply not render the mic. Permission (RECORD_AUDIO) is requested lazily on
//  the first start, never on mount.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'

const IS_NATIVE = typeof Capacitor?.isNativePlatform === 'function' && Capacitor.isNativePlatform()

// App language → a BCP-47 tag the recogniser understands.
const LANG_TAG = { en: 'en-US', de: 'de-DE', hi: 'hi-IN' }
export const speechLangFor = (lng) => LANG_TAG[(lng || 'en').slice(0, 2)] || 'en-US'

export function useSpeechInput({ lang = 'en-US', onPartial } = {}) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)

  const nativeRef = useRef(null)   // the SpeechRecognition plugin
  const webRef = useRef(null)      // an active Web Speech recognition instance
  const onPartialRef = useRef(onPartial)
  onPartialRef.current = onPartial

  // Detect capability once.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (IS_NATIVE) {
        try {
          const { SpeechRecognition } = await import('@capacitor-community/speech-recognition')
          nativeRef.current = SpeechRecognition
          const res = await SpeechRecognition.available()
          if (!cancelled) setSupported(!!res?.available)
        } catch { if (!cancelled) setSupported(false) }
      } else {
        const WebSR = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!cancelled) setSupported(!!WebSR)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const stop = useCallback(async () => {
    setListening(false)
    if (IS_NATIVE && nativeRef.current) {
      try { await nativeRef.current.stop() } catch { /* already stopped */ }
      try { await nativeRef.current.removeAllListeners() } catch { /* noop */ }
    } else if (webRef.current) {
      try { webRef.current.stop() } catch { /* noop */ }
      webRef.current = null
    }
  }, [])

  const start = useCallback(async () => {
    setError(null)
    if (IS_NATIVE && nativeRef.current) {
      const SR = nativeRef.current
      try {
        let perm = await SR.checkPermissions()
        if (perm?.speechRecognition !== 'granted') perm = await SR.requestPermissions()
        if (perm?.speechRecognition !== 'granted') { setError('permission'); return }

        await SR.removeAllListeners()
        await SR.addListener('partialResults', (data) => {
          const text = data?.matches?.[0]
          if (text) onPartialRef.current?.(text)
        })
        await SR.addListener('listeningState', (data) => {
          if (data?.status === 'stopped') setListening(false)
        })
        setListening(true)
        await SR.start({ language: lang, partialResults: true, popup: false, maxResults: 2 })
      } catch (e) {
        setError(String(e?.message || e))
        setListening(false)
      }
      return
    }

    // Web fallback.
    const WebSR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!WebSR) { setError('unsupported'); return }
    try {
      const rec = new WebSR()
      rec.lang = lang
      rec.interimResults = true
      rec.continuous = true
      rec.onresult = (ev) => {
        let text = ''
        for (let i = 0; i < ev.results.length; i++) text += ev.results[i][0].transcript
        if (text.trim()) onPartialRef.current?.(text.trim())
      }
      rec.onerror = () => { setListening(false); webRef.current = null }
      rec.onend = () => { setListening(false); webRef.current = null }
      webRef.current = rec
      setListening(true)
      rec.start()
    } catch (e) {
      setError(String(e))
      setListening(false)
    }
  }, [lang])

  const toggle = useCallback(() => { if (listening) stop(); else start() }, [listening, start, stop])

  // Always release the mic on unmount.
  useEffect(() => () => { stop() }, [stop])

  return { supported, listening, error, start, stop, toggle }
}
