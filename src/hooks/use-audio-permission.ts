/* useAudioPermission hook - Handle Web Audio API autoplay policy */
import { useState, useCallback, useEffect } from 'react'

export interface AudioPermissionState {
  canPlayAudio: boolean
  isUnlocked: boolean
  requestPermission: () => Promise<boolean>
}

const STORAGE_KEY = 'mango-reminder-audio-permission'

/**
 * Hook to manage audio playback permissions and unlock audio context
 * Handles mobile autoplay policies that require user gesture
 */
export function useAudioPermission(): AudioPermissionState {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    // Check if audio was previously unlocked
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    }
    return false
  })

  const [canPlayAudio, setCanPlayAudio] = useState<boolean>(false)

  // Check if Web Audio API is supported
  useEffect(() => {
    const hasAudioAPI = typeof window !== 'undefined' &&
      (window.AudioContext !== undefined || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext !== undefined)

    setCanPlayAudio(hasAudioAPI)
  }, [])

  /**
   * Request permission to play audio by creating and starting AudioContext
   * Must be called from a user gesture (click, tap, etc.)
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!canPlayAudio) {
      console.warn('Web Audio API not supported')
      return false
    }

    try {
      // Create or get existing audio context
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) {
        console.warn('AudioContext not available')
        return false
      }
      const audioContext = new AudioContextClass()

      // Resume context if suspended (required on mobile)
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      // Play silent buffer to unlock audio (iOS requirement)
      const buffer = audioContext.createBuffer(1, 1, 22050)
      const source = audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(audioContext.destination)
      source.start(0)

      // Mark as unlocked
      setIsUnlocked(true)
      localStorage.setItem(STORAGE_KEY, 'true')

      // Clean up
      source.disconnect()

      return true
    } catch (error) {
      console.error('Failed to unlock audio:', error)
      return false
    }
  }, [canPlayAudio])

  // Auto-request on first mount if not already unlocked
  useEffect(() => {
    if (canPlayAudio && !isUnlocked) {
      // Listen for first user interaction
      const handleFirstInteraction = async () => {
        await requestPermission()
        // Remove listeners after first unlock
        document.removeEventListener('click', handleFirstInteraction)
        document.removeEventListener('touchstart', handleFirstInteraction)
      }

      document.addEventListener('click', handleFirstInteraction, { once: true })
      document.addEventListener('touchstart', handleFirstInteraction, { once: true })

      return () => {
        document.removeEventListener('click', handleFirstInteraction)
        document.removeEventListener('touchstart', handleFirstInteraction)
      }
    }
  }, [canPlayAudio, isUnlocked, requestPermission])

  return {
    canPlayAudio,
    isUnlocked,
    requestPermission
  }
}
