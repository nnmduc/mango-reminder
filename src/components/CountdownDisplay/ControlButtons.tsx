/* ControlButtons - Pause/Resume and Reset with SVG icons */
import { motion } from 'framer-motion'
import type { TimerState } from '../../types/activity'
import styles from './ControlButtons.module.css'

interface ControlButtonsProps {
  timerState: TimerState
  onPauseResume: () => void
  onReset: () => void
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="2" />
      <rect x="14" y="4" width="4" height="16" rx="2" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
    </svg>
  )
}

export function ControlButtons({ timerState, onPauseResume, onReset }: ControlButtonsProps) {
  const isPaused = timerState === 'paused'
  const isCompleted = timerState === 'completed'

  return (
    <div className={styles.container}>
      {!isCompleted && (
        <motion.button
          className={`${styles.button} ${styles.primary}`}
          onClick={onPauseResume}
          whileTap={{ scale: 0.94, y: 4 }}
          whileHover={{ y: -2 }}
        >
          <span className={styles.icon}>
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </span>
          <span className={styles.label}>{isPaused ? 'Resume' : 'Pause'}</span>
        </motion.button>
      )}

      <motion.button
        className={`${styles.button} ${styles.secondary}`}
        onClick={onReset}
        whileTap={{ scale: 0.94, y: 4 }}
        whileHover={{ y: -2 }}
      >
        <span className={styles.icon}><ResetIcon /></span>
        <span className={styles.label}>{isCompleted ? 'Done!' : 'Reset'}</span>
      </motion.button>
    </div>
  )
}
