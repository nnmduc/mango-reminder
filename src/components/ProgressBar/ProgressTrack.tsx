/* ProgressTrack - Fun grassy path background with progress fill */
import styles from './ProgressTrack.module.css'

interface ProgressTrackProps {
  progress: number // 0-1 for fill
}

export function ProgressTrack({ progress }: ProgressTrackProps) {
  const fillPercent = Math.min(100, progress * 100)

  return (
    <div className={styles.track}>
      {/* Background path */}
      <div className={styles.trackBg}>
        {/* Progress fill */}
        <div
          className={styles.trackFill}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
      {/* Decorative grass tufts */}
      <div className={styles.grassDecor}>
        {[15, 32, 50, 68, 85].map(pos => (
          <div key={pos} className={styles.grassTuft} style={{ left: `${pos}%` }}>
            <span>🌿</span>
          </div>
        ))}
      </div>
    </div>
  )
}
