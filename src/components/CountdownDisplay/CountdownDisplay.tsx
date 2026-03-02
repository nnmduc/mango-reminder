/* CountdownDisplay component - Fullscreen timer view with controls */
import { useEffect } from 'react'
import type { Activity, TimerState } from '../../types/activity'
import { TimerDigits } from './TimerDigits'
import { ControlButtons } from './ControlButtons'
import { ProgressBar } from '../ProgressBar/ProgressBar'
import { WakeLockIndicator } from '../WakeLockIndicator/WakeLockIndicator'
import { useWakeLock } from '../../hooks/use-wake-lock'
import styles from './CountdownDisplay.module.css'

interface CountdownDisplayProps {
  activity: Activity
  remainingSeconds: number
  timerState: TimerState
  onPauseResume: () => void
  onReset: () => void
  isMuted?: boolean
  onToggleMute?: () => void
}

export function CountdownDisplay({
  activity,
  remainingSeconds,
  timerState,
  onPauseResume,
  onReset,
  isMuted = false,
  onToggleMute
}: CountdownDisplayProps) {
  // Calculate progress (0 = start, 1 = complete), clamped to avoid negative values
  // during the brief render before useCountdown syncs to the new activity duration
  const progress = Math.max(0, Math.min(1, 1 - remainingSeconds / activity.duration))
  const isRunning = timerState === 'running'
  const isCompleted = timerState === 'completed'

  const { state: wakeLockState, request: requestWakeLock, release: releaseWakeLock } = useWakeLock()

  // Manage wake lock based on timer state
  useEffect(() => {
    if (isRunning) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }
  }, [isRunning, requestWakeLock, releaseWakeLock])

  return (
    <div className={styles.container}>
      {/* Activity info at top */}
      <div className={styles.header}>
        {/* Wake lock status indicator (top-left) */}
        <WakeLockIndicator
          isActive={wakeLockState.isActive}
          isSupported={wakeLockState.isSupported}
          error={wakeLockState.error}
        />

        <span className={styles.emoji}>{activity.emoji}</span>
        <h2 className={styles.activityName}>{activity.name}</h2>

        {/* Mute toggle button */}
        {onToggleMute && (
          <button
            className={styles.muteButton}
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        )}
      </div>

      {/* Timer in center */}
      <div className={styles.timerSection}>
        <TimerDigits
          remainingSeconds={remainingSeconds}
          totalSeconds={activity.duration}
        />
      </div>

      {/* Progress bar with animated alligator eating mango */}
      <div className={styles.progressSection}>
        <ProgressBar
          progress={progress}
          isRunning={isRunning}
          isCompleted={isCompleted}
        />
      </div>

      {/* Controls at bottom */}
      <div className={styles.controlsSection}>
        <ControlButtons
          timerState={timerState}
          onPauseResume={onPauseResume}
          onReset={onReset}
        />
      </div>
    </div>
  )
}
