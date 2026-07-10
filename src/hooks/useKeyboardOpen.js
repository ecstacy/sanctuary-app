import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'

// ─── useKeyboardOpen ────────────────────────────────────────────────────────
//
// True while the soft keyboard is up. Callers use it to get out of the way —
// e.g. BottomNav is `fixed bottom-0` and would otherwise sit on top of the
// keyboard, eating the viewport exactly where the user is reading results.
//
// WHY NOT visualViewport
// ──────────────────────
// The usual web trick is `window.innerHeight - visualViewport.height > threshold`,
// which assumes the keyboard *overlays* the viewport. Our Android activity is
// `android:windowSoftInputMode="adjustResize"`, so the WebView is resized
// instead: innerHeight shrinks in lockstep with visualViewport.height and the
// gap stays ~0. The check never fires. Hence the plugin.
//
// Native  → @capacitor/keyboard's authoritative show/hide events.
// Web/dev → the keyboard (if there is one) comes up when a text field takes
//           focus, so track focusin/focusout on text-entry elements.
// ─────────────────────────────────────────────────────────────────────────────

const IS_NATIVE = typeof window !== 'undefined' && Capacitor?.isNativePlatform?.()

function isTextEntry(el) {
  if (!el) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
}

export default function useKeyboardOpen() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (IS_NATIVE) {
      let handles = []
      let cancelled = false
      // Dynamic import: the web bundle never needs the native plugin at runtime.
      import('@capacitor/keyboard')
        .then(({ Keyboard }) => {
          if (cancelled) return
          // iOS fires will*, Android fires did*. Listen for both.
          return Promise.all([
            Keyboard.addListener('keyboardWillShow', () => setOpen(true)),
            Keyboard.addListener('keyboardDidShow', () => setOpen(true)),
            Keyboard.addListener('keyboardWillHide', () => setOpen(false)),
            Keyboard.addListener('keyboardDidHide', () => setOpen(false)),
          ])
        })
        .then(hs => {
          if (!hs) return
          if (cancelled) hs.forEach(h => h.remove())
          else handles = hs
        })
        .catch(() => { /* plugin missing — leave the nav visible rather than break */ })

      return () => {
        cancelled = true
        handles.forEach(h => h.remove())
      }
    }

    const onFocusIn = e => { if (isTextEntry(e.target)) setOpen(true) }
    const onFocusOut = () => setOpen(false)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  return open
}
