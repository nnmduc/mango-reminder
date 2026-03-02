/* ControlButtons component - Pause/Resume and Reset buttons */
import { motion } from 'framer-motion'
import type { TimerState } from '../../types/activity'
import styles from './ControlButtons.module.css'

interface ControlButtonsProps {
  timerState: TimerState
  onPauseResume: () => void
  onReset: () => void
}

export function ControlButtons({ timerState, onPauseResume, onReset }: ControlButtonsProps) {
  const isPaused = timerState === 'paused'

  return (
    <div className={styles.container}>
      <motion.button
        className={`${styles.button} ${styles.primary}`}
        onClick={onPauseResume}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <span className={styles.icon}>{isPaused ? '▶️' : '⏸️'}</span>
        <span className={styles.label}>{isPaused ? 'Resume' : 'Pause'}</span>
      </motion.button>

      <motion.button
        className={`${styles.button} ${styles.secondary}`}
        onClick={onReset}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <span className={styles.icon}>🔄</span>
        <span className={styles.label}>Reset</span>
      </motion.button>
    </div>
  )
}
