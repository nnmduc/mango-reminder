/* useWakeLock - Screen Wake Lock API wrapper hook */
import { useState, useCallback, useRef, useEffect } from 'react'

interface WakeLockState {
  isSupported: boolean
  isActive: boolean
  error: string | null
}

interface UseWakeLockReturn {
  state: WakeLockState
  request: () => Promise<boolean>
  release: () => Promise<void>
}

export function useWakeLock(): UseWakeLockReturn {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const shouldBeActiveRef = useRef(false)

  const [state, setState] = useState<WakeLockState>({
    isSupported: 'wakeLock' in navigator,
    isActive: false,
    error: null,
  })

  const request = useCallback(async (): Promise<boolean> => {
    if (!('wakeLock' in navigator)) {
      setState(s => ({ ...s, error: 'Wake Lock not supported' }))
      return false
    }

    try {
      const lock = await navigator.wakeLock.request('screen')
      wakeLockRef.current = lock
      shouldBeActiveRef.current = true
      setState(s => ({ ...s, isActive: true, error: null }))

      lock.addEventListener('release', () => {
        // System released the lock (e.g. tab hidden, low battery)
        if (wakeLockRef.current === lock) {
          wakeLockRef.current = null
        }
        setState(s => ({ ...s, isActive: false }))
      })

      return true
    } catch (err) {
      setState(s => ({
        ...s,
        isActive: false,
        error: err instanceof Error ? err.message : 'Wake lock failed',
      }))
      return false
    }
  }, [])

  const release = useCallback(async (): Promise<void> => {
    shouldBeActiveRef.current = false
    if (wakeLockRef.current) {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
      setState(s => ({ ...s, isActive: false }))
    }
  }, [])

  // Re-acquire lock when tab becomes visible again (system releases on hide)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && shouldBeActiveRef.current && !wakeLockRef.current) {
        await request()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [request])

  // Release on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
      }
    }
  }, [])

  return { state, request, release }
}
