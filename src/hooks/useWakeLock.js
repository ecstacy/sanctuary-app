import { useEffect, useRef } from 'react'

export function useWakeLock() {
  const lockRef = useRef(null)

  useEffect(() => {
    async function acquire() {
      try {
        if ('wakeLock' in navigator) {
          lockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch {
        // Wake lock not available or denied — safe to ignore
      }
    }

    acquire()

    // Re-acquire on visibility change (Android releases on tab switch)
    function handleVisibility() {
      if (document.visibilityState === 'visible') acquire()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      lockRef.current?.release()
      lockRef.current = null
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])
}
