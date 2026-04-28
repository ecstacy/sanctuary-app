import { useEffect, useState, useCallback } from 'react'
import {
  getConsent,
  grantAggregate,
  declineAggregate,
  deferConsent,
  setAggregate,
  setCrash,
  shouldAskNow,
  subscribe,
} from '../lib/consent'

// React binding for the consent module. Mirrors the module state into
// component state so flips are reactive.
export default function useConsent() {
  const [state, setState] = useState(getConsent)

  useEffect(() => subscribe(setState), [])

  return {
    consent: state,
    shouldAsk: shouldAskNow(),
    grant: useCallback(() => grantAggregate(), []),
    decline: useCallback(() => declineAggregate(), []),
    defer: useCallback(() => deferConsent(), []),
    setAggregate: useCallback((v) => setAggregate(v), []),
    setCrash:     useCallback((v) => setCrash(v), []),
  }
}
