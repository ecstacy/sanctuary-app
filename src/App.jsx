import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import { AuthProvider, useAuth } from './context/AuthContext'
import ScrollToTop from './components/ScrollToTop'
import LoadingScreen from './components/LoadingScreen'
import PageTransition from './components/PageTransition'
import BottomNav from './components/BottomNav'
import DoshaThemeProvider from './components/DoshaThemeProvider'
import { supabase } from './lib/supabase'

// Lazy-load pages for code-splitting
const WelcomePage = lazy(() => import('./pages/WelcomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const DiscoverPage = lazy(() => import('./pages/DiscoverPage'))
const PreviewPage = lazy(() => import('./pages/PreviewPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const DoshaQuizPage = lazy(() => import('./pages/DoshaQuizPage'))
const VikritiQuizPage = lazy(() => import('./pages/VikritiQuizPage'))
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'))
const DoshaProfilePage = lazy(() => import('./pages/DoshaProfilePage'))
const RoutinePage = lazy(() => import('./pages/RoutinePage'))
const PracticePage = lazy(() => import('./pages/PracticePage'))
const JourneyPage = lazy(() => import('./pages/JourneyPage'))
const AsanaDetailPage = lazy(() => import('./pages/AsanaDetailPage'))

function DeepLinkHandler() {
  const navigate = useNavigate()
  const { setTransitioning } = useAuth()

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

      // Handle both # and %23
      const normalized = url.replace(/%23/g, '#')

      if (normalized.includes('reset-password')) {
        const params = extractParams(normalized)
        const tokenHash = params.get('token_hash')
        const type = params.get('type')

        if (tokenHash && type === 'recovery') {
          supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' }).then(({ error }) => {
            if (error) console.error('OTP verify error:', error.message)
            else navigate('/reset-password')
          })
        }
        return
      }

      // Handle OAuth callback — tokens passed as query params from
      // the GitHub Pages redirect page (which reads implicit flow
      // fragment tokens client-side and converts to query params)
      const params = extractParams(normalized)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        setTransitioning(true)
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ error }) => {
          if (error) {
            console.error('OAuth session error:', error.message)
            setTransitioning(false)
          }
        })
      }
    }

    // Method 1: window event from MainActivity
    const handleWindowEvent = (event) => {
      const url = event.detail?.url || event.detail
      processUrl(url)
    }
    window.addEventListener('appUrlOpen', handleWindowEvent)

    // Method 2: Capacitor plugin listener
    CapacitorApp.addListener('appUrlOpen', ({ url }) => processUrl(url))

    // Method 3: Check launch URL on mount
    CapacitorApp.getLaunchUrl().then((result) => {
      if (result?.url) processUrl(result.url)
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
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/" replace />
}

// Pages that display the bottom nav. /quiz and /vikriti are focused,
// step-by-step flows (like a modal) — the main-tab nav would distract
// from the task and also overlap their CTAs, so they're excluded.
const NAV_PAGES = ['/home', '/discover', '/profile', '/routine', '/dosha', '/journey', '/recommendations']

function ShowBottomNav() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  if (!user) return null
  const show = NAV_PAGES.some(p => pathname === p || pathname.startsWith(p + '/'))
  return show ? <BottomNav /> : null
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <>
      <DoshaThemeProvider />
      <DeepLinkHandler />
      <BackButtonHandler />
      <Suspense fallback={<LoadingScreen />}>
      <PageTransition>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/home" replace /> : <WelcomePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/login" element={user ? <Navigate to="/home" replace /> : <LoginPage />} />
          <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/quiz" element={<PrivateRoute><DoshaQuizPage /></PrivateRoute>} />
          <Route path="/vikriti" element={<PrivateRoute><VikritiQuizPage /></PrivateRoute>} />
          <Route path="/dosha" element={<PrivateRoute><DoshaProfilePage /></PrivateRoute>} />
          <Route path="/routine" element={<PrivateRoute><RoutinePage /></PrivateRoute>} />
          <Route path="/asana/:id" element={<PrivateRoute><AsanaDetailPage /></PrivateRoute>} />
          <Route path="/practice/:id" element={<PrivateRoute><PracticePage /></PrivateRoute>} />
          <Route path="/practice/asana/:asanaId" element={<PrivateRoute><PracticePage /></PrivateRoute>} />
          <Route path="/journey" element={<PrivateRoute><JourneyPage /></PrivateRoute>} />
          <Route path="/recommendations" element={<PrivateRoute><RecommendationsPage /></PrivateRoute>} />
        </Routes>
      </PageTransition>
      </Suspense>
      <ShowBottomNav />
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