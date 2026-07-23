import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import useKeyboardOpen from '../hooks/useKeyboardOpen'

const TABS = [
  { path: '/home', navKey: 'nav.home', icon: 'home_max' },
  { path: '/routine', navKey: 'nav.routine', icon: 'self_care', filled: true },
  { path: '/discover', navKey: 'nav.discover', icon: 'explore' },
  { path: '/profile', navKey: 'nav.profile', icon: 'person_2' },
]

const SCROLL_THRESHOLD = 10

export default function BottomNav() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(true)
  // The nav is `fixed bottom-0`; with the keyboard up it would sit on top of
  // it and eat the viewport. See the hook for why visualViewport can't detect
  // this (the Android activity is adjustResize).
  const keyboardOpen = useKeyboardOpen()
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true

      requestAnimationFrame(() => {
        const currentY = window.scrollY
        const delta = currentY - lastScrollY.current

        if (delta > SCROLL_THRESHOLD && currentY > 80) {
          // Scrolling down past the top area — hide
          setVisible(false)
        } else if (delta < -SCROLL_THRESHOLD || currentY < 80) {
          // Scrolling up or near top — show
          setVisible(true)
        }

        lastScrollY.current = currentY
        ticking.current = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Always show on route change
  useEffect(() => {
    setVisible(true)
    lastScrollY.current = 0
  }, [pathname])


  return (
    <nav
      aria-label="Primary"
      className={`fixed bottom-0 left-0 w-full bg-background/60 backdrop-blur-2xl border-t border-outline-variant/10 px-4 pt-3 flex justify-around items-center transition-transform duration-300 ease-out ${
        visible && !keyboardOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
      // aria-hidden while off-screen so the tabs aren't reachable by
      // screen readers / tab focus behind the keyboard.
      aria-hidden={keyboardOpen || !visible}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))', zIndex: 50 }}
    >
      {TABS.map(tab => {
        const active = pathname === tab.path || (tab.path === '/routine' && pathname.startsWith('/practice'))
        const label = t(tab.navKey)
        return (
          <button
            key={tab.path}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              if (tab.path === '/routine') {
                navigate('/routine', { state: { routineKey: 'stress' } })
              } else {
                navigate(tab.path)
              }
            }}
            className={`flex flex-col items-center gap-1 px-4 py-2 min-h-[44px] transition-all duration-300 ${
              active ? 'bg-primary-fixed rounded-full' : ''
            }`}
          >
            <span
              aria-hidden="true"
              className={`material-symbols-outlined transition-colors duration-200 ${
                active ? 'text-primary' : 'text-on-surface-variant/50'
              }`}
              style={active && tab.filled ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {tab.icon}
            </span>
            <span className={`font-label text-[11px] uppercase tracking-widest transition-colors duration-200 ${
              active ? 'text-primary font-medium' : 'text-on-surface-variant/50'
            }`}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
