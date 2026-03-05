/* TrackCard - White card showing progress bar with alligator + mango characters */
import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import styles from './TrackCard.module.css'

interface TrackCardProps {
  progress: number  // 0-1 elapsed
  isRunning: boolean
}

// Number of milestone dots to show
const DOT_COUNT = 5

export function TrackCard({ progress, isRunning }: TrackCardProps) {
  const reducedMotion = useReducedMotion()
  const isEating = progress > 0.85
  const filledDots = Math.round(progress * DOT_COUNT)

  return (
    <div className={styles.card}>
      {/* Linear progress bar */}
      <div className={styles.bar}>
        <div className={styles.barFill} style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Characters row */}
      <div className={styles.chars}>
        {/* Alligator — moves right with progress */}
        <motion.span
          className={styles.char}
          animate={
            reducedMotion ? undefined
            : isEating
              ? { rotate: [-8, 8, -8], scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 0.3 } }
              : isRunning
                ? { y: [0, -4, 0], transition: { repeat: Infinity, duration: 0.4, ease: 'easeInOut' } }
                : { y: [0, -2, 0], transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }
          }
          style={{ display: 'inline-block' }}
        >
          🐊
        </motion.span>

        {/* Milestone dots */}
        <div className={styles.dots}>
          {Array.from({ length: DOT_COUNT }, (_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${i < filledDots ? styles.dotFilled : ''}`}
            />
          ))}
        </div>

        {/* Mango — shrinks as progress increases */}
        <motion.span
          className={styles.char}
          animate={{
            scale: 1 - progress * 0.5,
            opacity: progress > 0.9 ? 0.4 : 1,
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          style={{ display: 'inline-block', transformOrigin: 'center' }}
        >
          🥭
        </motion.span>
      </div>
    </div>
  )
}
