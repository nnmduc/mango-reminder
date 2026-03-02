/* ProgressTrack - Background track for the progress bar */
import styles from './ProgressTrack.module.css'

export function ProgressTrack() {
  return (
    <div className={styles.track}>
      <div className={styles.trackBackground} />
    </div>
  )
}
