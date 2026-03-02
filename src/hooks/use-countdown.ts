/* useCountdown hook - Timer logic with progress tracking */
import { useState, useEffect, useCallback, useRef } from 'react'
import type { SoundId } from './use-audio'

export interface CountdownState {
  timeRemaining: number // seconds
  totalTime: number // seconds
  progress: number // 0-1 (elapsed / total)
  isRunning: boolean
  isPaused: boolean
  isCompleted: boolean
}

export interface UseCountdownOptions {
  onMilestone?: (soundId: SoundId) => void
  onComplete?: () => void
}

interface UseCountdownReturn {
  state: CountdownState
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
}

export function useCountdown(
  durationMinutes: number,
  options: UseCountdownOptions = {}
): UseCountdownReturn {
  const { onMilestone, onComplete } = options
  const totalSeconds = durationMinutes * 60
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<number | null>(null)

  // Track previous time to detect milestone crossings
  const previousTimeRef = useRef<number>(totalSeconds)
  const milestonesTriggeredRef = useRef<Set<string>>(new Set())

  // Calculate progress (0 = start, 1 = complete)
  const progress = 1 - timeRemaining / totalSeconds
  const isCompleted = timeRemaining === 0

  // Start timer
  const start = useCallback(() => {
    setIsRunning(true)
    setIsPaused(false)
  }, [])

  // Pause timer
  const pause = useCallback(() => {
    setIsRunning(false)
    setIsPaused(true)
  }, [])

  // Resume timer
  const resume = useCallback(() => {
    setIsRunning(true)
    setIsPaused(false)
  }, [])

  // Reset timer
  const reset = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeRemaining(totalSeconds)
    previousTimeRef.current = totalSeconds
    milestonesTriggeredRef.current.clear()
  }, [totalSeconds])

  // Countdown effect
  useEffect(() => {
    if (!isRunning || timeRemaining === 0) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeRemaining])

  // Milestone detection effect
  useEffect(() => {
    if (!isRunning || !onMilestone) return

    const previousTime = previousTimeRef.current
    const currentTime = timeRemaining

    // Define milestones: time-based (in seconds)
    const milestones = [
      { threshold: 15 * 60, sound: '15min' as SoundId, key: '15min' },
      { threshold: 5 * 60, sound: '5min' as SoundId, key: '5min' },
      { threshold: 1 * 60, sound: '1min' as SoundId, key: '1min' }
    ]

    // Check time-based milestones
    milestones.forEach(({ threshold, sound, key }) => {
      // Trigger when we cross the threshold (going down)
      if (
        previousTime > threshold &&
        currentTime <= threshold &&
        !milestonesTriggeredRef.current.has(key)
      ) {
        onMilestone(sound)
        milestonesTriggeredRef.current.add(key)
      }
    })

    // Check progress-based milestone: 50% (halfway)
    const halfwayKey = 'halfway'
    if (
      progress >= 0.5 &&
      !milestonesTriggeredRef.current.has(halfwayKey)
    ) {
      onMilestone('halfway')
      milestonesTriggeredRef.current.add(halfwayKey)
    }

    previousTimeRef.current = currentTime
  }, [timeRemaining, isRunning, onMilestone, progress])

  // Completion effect
  useEffect(() => {
    if (isCompleted && onComplete) {
      onComplete()
    }
  }, [isCompleted, onComplete])

  const state: CountdownState = {
    timeRemaining,
    totalTime: totalSeconds,
    progress,
    isRunning,
    isPaused,
    isCompleted
  }

  return {
    state,
    start,
    pause,
    resume,
    reset
  }
}
