// ─────────────────────────────────────────────────────────────────────────────
//  useCurrentDoshaState — the shared "who is the user right now?" reading.
//
//  Wraps the pure deriveCurrentDoshaState with the three live data sources so
//  Home's state card and the Dosha profile page consume ONE derivation and can
//  never disagree (see lib/currentDoshaState.js for the why).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useVikritiSignal } from './useVikritiSignal'
import useVikritiSchedule from './useVikritiSchedule'
import { deriveCurrentDoshaState } from '../lib/currentDoshaState'

export function useCurrentDoshaState() {
  const { profile } = useAuth()
  const signal = useVikritiSignal()
  const schedule = useVikritiSchedule()

  return useMemo(
    () => deriveCurrentDoshaState({ profile, signal, schedule }),
    [profile, signal, schedule],
  )
}
