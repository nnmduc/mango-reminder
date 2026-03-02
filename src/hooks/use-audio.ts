/* useAudio hook - Web Audio API playback with preloading */
import { useState, useCallback, useEffect, useRef } from 'react'
import { useAudioPermission } from './use-audio-permission'

export type SoundId = 'halfway' | '15min' | '5min' | '1min' | 'celebration'

export interface UseAudioOptions {
  preload?: boolean
}

export interface UseAudioReturn {
  play: (soundId: SoundId) => void
  stop: () => void
  isMuted: boolean
  toggleMute: () => void
  isLoaded: boolean
  canPlayAudio: boolean
}

const MUTE_STORAGE_KEY = 'mango-reminder-audio-muted'

// Sound file paths
const SOUND_PATHS: Record<SoundId, string> = {
  halfway: '/sounds/milestone-halfway.wav',
  '15min': '/sounds/milestone-15min.wav',
  '5min': '/sounds/milestone-5min.wav',
  '1min': '/sounds/milestone-1min.wav',
  celebration: '/sounds/celebration.wav'
}

/**
 * Hook for playing milestone notification sounds
 * Preloads and caches audio buffers for instant playback
 */
export function useAudio(options: UseAudioOptions = {}): UseAudioReturn {
  const { preload = true } = options

  // Audio permission state
  const { canPlayAudio, isUnlocked } = useAudioPermission()

  // Audio context and buffers
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBuffersRef = useRef<Map<SoundId, AudioBuffer>>(new Map())
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null)

  // State
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    // Load mute preference from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem(MUTE_STORAGE_KEY) === 'true'
    }
    return false
  })

  /**
   * Initialize audio context
   */
  const getAudioContext = useCallback((): AudioContext | null => {
    if (!canPlayAudio) return null

    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return null
      audioContextRef.current = new AudioContextClass()
    }

    return audioContextRef.current
  }, [canPlayAudio])

  /**
   * Preload and decode audio files
   */
  const preloadAudio = useCallback(async () => {
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const soundIds = Object.keys(SOUND_PATHS) as SoundId[]

      await Promise.all(
        soundIds.map(async (soundId) => {
          try {
            const response = await fetch(SOUND_PATHS[soundId])
            const arrayBuffer = await response.arrayBuffer()
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
            audioBuffersRef.current.set(soundId, audioBuffer)
          } catch (err) {
            console.error(`Failed to load sound: ${soundId}`, err)
          }
        })
      )

      setIsLoaded(true)
    } catch (err) {
      console.error('Failed to preload audio:', err)
    }
  }, [getAudioContext])

  /**
   * Play a sound by ID
   */
  const play = useCallback((soundId: SoundId) => {
    // Don't play if muted or not unlocked
    if (isMuted || !isUnlocked || !canPlayAudio) {
      return
    }

    const ctx = getAudioContext()
    if (!ctx) return

    // Resume context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume().catch(console.error)
    }

    // Stop current sound if playing
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop()
        currentSourceRef.current.disconnect()
      } catch {
        // Ignore errors from stopping already stopped sources
      }
    }

    // Get preloaded buffer
    const buffer = audioBuffersRef.current.get(soundId)
    if (!buffer) {
      console.warn(`Sound not loaded: ${soundId}`)
      return
    }

    try {
      // Create and play buffer source
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)
      source.start(0)

      currentSourceRef.current = source

      // Clean up after playback
      source.onended = () => {
        if (currentSourceRef.current === source) {
          currentSourceRef.current = null
        }
      }
    } catch (error) {
      console.error(`Failed to play sound: ${soundId}`, error)
    }
  }, [isMuted, isUnlocked, canPlayAudio, getAudioContext])

  /**
   * Stop currently playing sound
   */
  const stop = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop()
        currentSourceRef.current.disconnect()
        currentSourceRef.current = null
      } catch {
        // Ignore errors from stopping already stopped sources
      }
    }
  }, [])

  /**
   * Toggle mute state
   */
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev
      localStorage.setItem(MUTE_STORAGE_KEY, String(newMuted))

      // Stop playing sound if muting
      if (newMuted) {
        stop()
      }

      return newMuted
    })
  }, [stop])

  /**
   * Preload audio files on mount if enabled and unlocked
   */
  useEffect(() => {
    if (preload && isUnlocked && canPlayAudio && !isLoaded) {
      preloadAudio()
    }
  }, [preload, isUnlocked, canPlayAudio, isLoaded, preloadAudio])

  /**
   * Cleanup audio context on unmount
   */
  useEffect(() => {
    return () => {
      stop()
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error)
      }
    }
  }, [stop])

  return {
    play,
    stop,
    isMuted,
    toggleMute,
    isLoaded,
    canPlayAudio
  }
}
