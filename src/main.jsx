import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import './index.css'
import './i18n' // initializes i18next as a side effect
import App from './App.jsx'

// ─────────────────────────────────────────────────────────────────────────────
//  Native status bar: reserve space for the OS status bar so `100dvh` only
//  spans the area *below* it. Without this, Android's translucent status bar
//  overlays the WebView and our `h-[100dvh]` pages slide under it.
//  Web/PWA: plugin is a no-op, body's padding-top: env(safe-area-inset-top)
//  (see index.css) keeps iOS safe-area coverage.
// ─────────────────────────────────────────────────────────────────────────────
if (Capacitor.isNativePlatform()) {
  StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {})
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
  // Transparent so the Android theme's color shows through; if the theme is
  // dark, pair with Style.Light instead.
  StatusBar.setBackgroundColor?.({ color: '#00000000' }).catch(() => {})
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
