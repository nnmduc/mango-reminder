/* TrackCard — Alligator chases and eats the mango as timer counts down */
import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import styles from './TrackCard.module.css'

interface TrackCardProps {
  progress: number  // 0–1 elapsed
  isRunning: boolean
}

// Small mango snack positions along the runway (% of runway width)
const SNACK_POSITIONS = [12, 26, 40, 54, 68]

export function TrackCard({ progress, isRunning }: TrackCardProps) {
  const reducedMotion = useReducedMotion()

  // Gator travels 0% → 88% so it visually reaches the mango at right: 14px
  const gatorLeft = progress * 88
  const isNearMango = progress > 0.87
  const isEating = progress > 0.97

  // Gator body animation — runs, then rushes, then chomps
  const gatorAnim = reducedMotion ? {} : isEating
    ? { rotate: [-18, 18, -18], scale: [1.2, 1.5, 1.2], transition: { repeat: Infinity, duration: 0.15 } }
    : isNearMango
      ? { y: [0, -8, 0], transition: { repeat: Infinity, duration: 0.22 } }
      : isRunning
        ? { y: [0, -4, 0], transition: { repeat: Infinity, duration: 0.45, ease: 'easeInOut' } }
        : { y: [0, -2, 0], transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }

  return (
    <div className={styles.card}>
      <div className={styles.runway}>
        {/* Eaten-path fill */}
        <div className={styles.trail} style={{ width: `${gatorLeft + 2}%` }} />

        {/* Mini mango snacks — disappear as gator passes */}
        {SNACK_POSITIONS.map((pos, i) => (
          <motion.span
            key={i}
            className={styles.snack}
            style={{ left: `${pos}%` }}
            animate={{
              scale: gatorLeft >= pos - 4 ? 0 : 1,
              opacity: gatorLeft >= pos - 4 ? 0 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          >
            🥭
          </motion.span>
        ))}

        {/* Alligator — wrapper moves horizontally via CSS transition */}
        <div className={styles.gatorPos} style={{ left: `${gatorLeft}%` }}>
          {/* Inner flip so gator faces right toward the mango */}
          <div className={styles.gatorFlip}>
            <motion.span className={styles.gatorEmoji} animate={gatorAnim}>
              🐊
            </motion.span>
          </div>
        </div>

        {/* Big mango at the finish line */}
        <motion.span
          className={styles.bigMango}
          animate={
            reducedMotion ? {} : isEating
              ? { scale: 0, opacity: 0, transition: { duration: 0.25 } }
              : isNearMango
                ? { scale: [1, 1.2, 1], rotate: [-10, 10, -10], transition: { repeat: Infinity, duration: 0.3 } }
                : {}
          }
        >
          🥭
        </motion.span>
      </div>
    </div>
  )
}
