/* ActivitySelector component - Grid layout container for activity cards */
import type { Activity } from '../../types/activity'
import { PRESET_ACTIVITIES } from '../../types/activity'
import { ActivityCard } from './ActivityCard'
import styles from './ActivitySelector.module.css'

interface ActivitySelectorProps {
  onSelectActivity: (activity: Activity) => void
}

export function ActivitySelector({ onSelectActivity }: ActivitySelectorProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>What are you doing?</h1>
      <div className={styles.grid}>
        {PRESET_ACTIVITIES.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onSelect={onSelectActivity}
          />
        ))}
      </div>
    </div>
  )
}
