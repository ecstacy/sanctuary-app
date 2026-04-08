import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import { AuthProvider, useAuth } from './context/AuthContext'
import ScrollToTop from './components/ScrollToTop'
import { supabase } from './lib/supabase'

import WelcomePage from './pages/WelcomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DiscoverPage from './pages/DiscoverPage'
import PreviewPage from './pages/PreviewPage'
import HomePage from './pages/HomePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

function DeepLinkHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    // Extract all params from a deep link URL (handles both ? and # and %23)
    const extractParams = (url) => {
      const decoded = decodeURIComponent(url)
      // Try fragment first, then query string
      const hashIndex = decoded.indexOf('#')
      const questionIndex = decoded.indexOf('?')

      const parts = []
      if (hashIndex !== -1) parts.push(decoded.substring(hashIndex + 1))
      if (questionIndex !== -1) {
        const end = hashIndex > questionIndex ? hashIndex : decoded.length
        parts.push(decoded.substring(questionIndex + 1, end))
      }

      const merged = new URLSearchParams()
      parts.forEach(part => {
        new URLSearchParams(part).forEach((v, k) => merged.set(k, v))
      })
      return merged
    }

    const processUrl = (url) => {
      if (!url) return
      console.log('Processing URL:', url)

      // Handle both # and %23
      const normalized = url.replace(/%23/g, '#')

      if (normalized.includes('reset-password')) {
        const params = extractParams(normalized)
        const tokenHash = params.get('token_hash')
        const type = params.get('type')

        console.log('Token type:', type)
        console.log('Has token_hash:', !!tokenHash)

        if (tokenHash && type === 'recovery') {
          supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' }).then(({ error }) => {
            if (error) console.log('OTP verify error:', error.message)
            else {
              console.log('Session set, navigating...')
              navigate('/reset-password')
            }
          })
        }
        return
      }

      // Handle OAuth callback — tokens passed as query params from
      // the oauth-redirect edge function (which reads them from the
      // implicit flow fragment client-side and converts to query params)
      const params = extractParams(normalized)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        console.log('OAuth callback — setting session from tokens')
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ error }) => {
          if (error) console.log('OAuth session error:', error.message)
          else console.log('Google auth session set — onAuthStateChange will redirect')
        })
      }
    }

    // Method 1: window event from MainActivity
    const handleWindowEvent = (event) => {
      console.log('Window event received:', event.detail)
      const url = event.detail?.url || event.detail
      processUrl(url)
    }
    window.addEventListener('appUrlOpen', handleWindowEvent)

    // Method 2: Capacitor plugin listener
    CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      console.log('Capacitor listener received:', url)
      processUrl(url)
    })

    // Method 3: Check launch URL on mount
    CapacitorApp.getLaunchUrl().then((result) => {
      if (result?.url) {
        console.log('Launch URL:', result.url)
        processUrl(result.url)
      }
    })

    return () => {
      window.removeEventListener('appUrlOpen', handleWindowEvent)
      CapacitorApp.removeAllListeners('appUrlOpen')
    }
  }, [navigate])

  return null
}

function BackButtonHandler() {
  const navigate = useNavigate()
  const [toastVisible, setToastVisible] = useState(false)
  const exitPending = useRef(false)
  const toastTimer = useRef(null)

  useEffect(() => {
    const handleBack = () => {
      if (window.history.length > 1) {
        window.history.back()
        return
      }

      if (exitPending.current) {
        CapacitorApp.exitApp()
        return
      }

      exitPending.current = true
      setToastVisible(true)

      toastTimer.current = setTimeout(() => {
        exitPending.current = false
        setToastVisible(false)
      }, 2000)
    }

    window.addEventListener('nativeBackButton', handleBack)
    return () => {
      window.removeEventListener('nativeBackButton', handleBack)
      clearTimeout(toastTimer.current)
    }
  }, [])

  if (!toastVisible) return null

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-[#31332e] text-[#eaffe1] text-xs font-label px-5 py-3 rounded-full shadow-lg whitespace-nowrap animate-fade-in-up">
      Swipe again to close
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="font-body text-on-surface-variant text-sm">Loading...</p>
    </div>
  )
  return user ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="font-body text-on-surface-variant text-sm">Loading...</p>
    </div>
  )

  return (
    <>
      <DeepLinkHandler />
      <BackButtonHandler />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <WelcomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/login" element={user ? <Navigate to="/home" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}