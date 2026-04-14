import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const TABS = [
  { path: '/home', label: 'Home', icon: 'home_max' },
  { path: '/routine', label: 'Routine', icon: 'self_care', filled: true },
  { path: '/discover', label: 'Discover', icon: 'explore' },
  { path: '/profile', label: 'Profile', icon: 'person_2' },
]

const SCROLL_THRESHOLD = 10

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(true)
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
      className={`fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-xl rounded-t-[2rem] px-4 pt-3 flex justify-around items-center shadow-[0_-8px_24px_rgba(28,28,26,0.06)] z-30 transition-transform duration-300 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {TABS.map(tab => {
        const active = pathname === tab.path || (tab.path === '/routine' && pathname.startsWith('/practice'))
        return (
          <button
            key={tab.path}
            onClick={() => {
              if (tab.path === '/routine') {
                navigate('/routine', { state: { routineKey: 'stress' } })
              } else {
                navigate(tab.path)
              }
            }}
            className={`flex flex-col items-center gap-1 px-4 py-2 transition-all duration-300 ${
              active ? 'bg-primary-fixed rounded-full' : ''
            }`}
          >
            <span
              className={`material-symbols-outlined transition-colors duration-200 ${
                active ? 'text-primary' : 'text-on-surface-variant/50'
              }`}
              style={active && tab.filled ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {tab.icon}
            </span>
            <span className={`font-label text-[10px] uppercase tracking-widest transition-colors duration-200 ${
              active ? 'text-primary font-medium' : 'text-on-surface-variant/50'
            }`}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
