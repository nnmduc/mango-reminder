/* ActivityCard component - Individual activity card with tap animation */
import { motion } from 'framer-motion'
import type { Activity } from '../../types/activity'
import styles from './ActivityCard.module.css'

interface ActivityCardProps {
  activity: Activity
  onSelect: (activity: Activity) => void
  onEdit?: (activity: Activity) => void
}

export function ActivityCard({ activity, onSelect, onEdit }: ActivityCardProps) {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  function handleEditClick(e: React.MouseEvent) {
    e.stopPropagation()
    onEdit?.(activity)
  }

  return (
    <motion.div className={styles.wrapper}>
      <motion.button
        className={styles.card}
        style={{ backgroundColor: activity.color }}
        onClick={() => onSelect(activity)}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {/* Decorative circle in bottom-right corner */}
        <div className={styles.decorCircle} />
        <div className={styles.emoji}>{activity.emoji}</div>
        <div className={styles.name}>{activity.name}</div>
        <div className={styles.duration}>{formatDuration(activity.duration)}</div>
      </motion.button>

      {/* Edit button — only for custom presets */}
      {!activity.isDefault && onEdit && (
        <button
          className={styles.editBtn}
          onClick={handleEditClick}
          aria-label={`Edit ${activity.name}`}
          type="button"
        >
          ✏️
        </button>
      )}
    </motion.div>
  )
}
