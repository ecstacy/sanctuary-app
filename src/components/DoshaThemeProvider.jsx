import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * Sets `data-dosha` on <html> to activate the dosha-specific
 * CSS custom-property palette defined in index.css.
 * Renders nothing — purely a side-effect component.
 */
export default function DoshaThemeProvider() {
  const { profile } = useAuth()
  const dosha = (profile?.dosha_details?.primary || profile?.dosha || '').toLowerCase()

  useEffect(() => {
    const root = document.documentElement
    if (dosha && ['vata', 'pitta', 'kapha'].includes(dosha)) {
      root.setAttribute('data-dosha', dosha)
    } else {
      root.removeAttribute('data-dosha')
    }
    return () => root.removeAttribute('data-dosha')
  }, [dosha])

  return null
}
