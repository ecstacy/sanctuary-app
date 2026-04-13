import { useLocation } from 'react-router-dom'

/**
 * Wraps route content with a smooth entrance animation.
 * Re-triggers on every pathname change via the key prop.
 */
export default function PageTransition({ children }) {
  const { pathname } = useLocation()

  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  )
}
