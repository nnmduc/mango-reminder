/* CompletedScreen - Celebration view shown when timer finishes */
import { motion } from 'framer-motion'
import type { Activity } from '../../types/activity'
import styles from './CompletedScreen.module.css'

interface CompletedScreenProps {
  activity: Activity
  onReset: () => void
}

export function CompletedScreen({ activity, onReset }: CompletedScreenProps) {
  const totalMinutes = Math.round(activity.duration / 60)

  return (
    <div className={styles.container}>
      {/* Star celebration */}
      <motion.div
        className={styles.starWrap}
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
      >
        <div className={styles.starCircle}>
          <span className={styles.starEmoji}>⭐</span>
        </div>
      </motion.div>

      {/* Heading */}
      <motion.div
        className={styles.textBlock}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h1 className={styles.title}>You did it!</h1>
        <p className={styles.subtitle}>
          {activity.name} done!
        </p>
        <p className={styles.detail}>
          {totalMinutes} {totalMinutes === 1 ? 'minute' : 'minutes'} spent
          <br />
          The alligator finished the mango! 🐊→🥭
        </p>
      </motion.div>

      {/* Back button */}
      <motion.button
        className={styles.backBtn}
        onClick={onReset}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
      >
        Back to Activities
      </motion.button>
    </div>
  )
}
