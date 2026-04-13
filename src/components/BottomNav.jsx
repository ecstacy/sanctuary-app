import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { path: '/home', label: 'Home', icon: 'home_max' },
  { path: '/routine', label: 'Routine', icon: 'self_care', filled: true },
  { path: '/discover', label: 'Discover', icon: 'explore' },
  { path: '/profile', label: 'Profile', icon: 'person_2' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-xl rounded-t-[2rem] px-4 pt-3 flex justify-around items-center shadow-[0_-12px_32px_rgba(28,28,26,0.04)] animate-nav-enter"
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
