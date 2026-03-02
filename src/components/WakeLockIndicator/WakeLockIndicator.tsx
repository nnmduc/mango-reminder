/* WakeLockIndicator - Subtle status indicator showing screen wake lock state */
import styles from './WakeLockIndicator.module.css'

interface WakeLockIndicatorProps {
  isActive: boolean
  isSupported: boolean
  error: string | null
}

export function WakeLockIndicator({ isActive, isSupported, error }: WakeLockIndicatorProps) {
  if (!isSupported) {
    return (
      <div
        className={`${styles.indicator} ${styles.unsupported}`}
        title="Screen may sleep during countdown — keep screen on in Settings"
        aria-label="Screen wake lock not supported"
      >
        📵
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`${styles.indicator} ${styles.error}`}
        title={`Wake lock error: ${error}`}
        aria-label="Screen wake lock error"
      >
        ☀️
      </div>
    )
  }

  return (
    <div
      className={`${styles.indicator} ${isActive ? styles.active : styles.inactive}`}
      title={isActive ? 'Screen will stay awake' : 'Screen wake lock inactive'}
      aria-label={isActive ? 'Screen staying awake' : 'Screen wake lock inactive'}
    >
      ☀️
    </div>
  )
}
