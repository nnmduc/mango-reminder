/* CountdownDisplay - Fullscreen timer view with controls */
import { useEffect } from 'react'
import type { Activity, TimerState } from '../../types/activity'
import { TimerDigits } from './TimerDigits'
import { ControlButtons } from './ControlButtons'
import { CompletedScreen } from './CompletedScreen'
import { TrackCard } from './TrackCard'
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

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
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
  const progress = Math.max(0, Math.min(1, 1 - remainingSeconds / activity.duration))
  const isRunning = timerState === 'running'
  const isCompleted = timerState === 'completed'

  const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock()

  useEffect(() => {
    if (isRunning) requestWakeLock()
    else releaseWakeLock()
  }, [isRunning, requestWakeLock, releaseWakeLock])

  // Show celebration screen when done
  if (isCompleted) {
    return <CompletedScreen activity={activity} onReset={onReset} />
  }

  return (
    <div className={styles.container}>
      {/* Top bar: ← back on left, 🔊 mute on right */}
      <div className={styles.header}>
        <button
          className={styles.iconBtn}
          onClick={onReset}
          aria-label="Back to activities"
        >
          <BackIcon />
        </button>

        {onToggleMute && (
          <button
            className={styles.iconBtn}
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        )}
      </div>

      {/* Activity pill */}
      <div className={styles.activityPill}>
        <span className={styles.emoji}>{activity.emoji}</span>
        <h2 className={styles.activityName}>{activity.name}</h2>
      </div>

      {/* SVG ring timer */}
      <div className={styles.timerSection}>
        <TimerDigits
          remainingSeconds={remainingSeconds}
          totalSeconds={activity.duration}
          ringColor={activity.color}
        />
      </div>

      {/* Track card: progress bar + 🐊 dots 🥭 */}
      <div className={styles.trackSection}>
        <TrackCard progress={progress} isRunning={isRunning} />
      </div>

      {/* Controls */}
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
