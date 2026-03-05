/* ActivitySelector component - Grid of activity cards with preset management */
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Activity } from '../../types/activity'
import { usePresets } from '../../hooks/use-presets'
import { ActivityCard } from './ActivityCard'
import { PresetEditorModal } from '../PresetEditor/PresetEditorModal'
import styles from './ActivitySelector.module.css'

interface ActivitySelectorProps {
  onSelectActivity: (activity: Activity) => void
}

export function ActivitySelector({ onSelectActivity }: ActivitySelectorProps) {
  const { activities, addPreset, updatePreset, deletePreset } = usePresets()
  const [editingPreset, setEditingPreset] = useState<Activity | null | undefined>(undefined)
  // undefined = modal closed, null = add mode, Activity = edit mode

  const isModalOpen = editingPreset !== undefined

  function handleEdit(activity: Activity) {
    setEditingPreset(activity)
  }

  function handleSave(data: Omit<Activity, 'id' | 'isDefault'>) {
    if (editingPreset) {
      updatePreset(editingPreset.id, data)
    } else {
      addPreset(data)
    }
  }

  function handleDelete(id: string) {
    deletePreset(id)
  }

  function closeModal() {
    setEditingPreset(undefined)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>What are you doing today?</h1>
      <p className={styles.subtitle}>Tap an activity to start your timer</p>

      <div className={styles.grid}>
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onSelect={onSelectActivity}
            onEdit={handleEdit}
          />
        ))}

        {/* Add new preset button */}
        <motion.button
          className={styles.addBtn}
          onClick={() => setEditingPreset(null)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          aria-label="Add new preset"
        >
          <span className={styles.addIcon}>+</span>
          <span className={styles.addLabel}>Add</span>
        </motion.button>
      </div>

      {isModalOpen && (
        <PresetEditorModal
          preset={editingPreset ?? null}
          onSave={handleSave}
          onDelete={editingPreset ? handleDelete : undefined}
          onClose={closeModal}
        />
      )}

      {/* Footer — always visible at the bottom */}
      <p className={styles.footer}>🐊 The alligator is waiting for the mango 🥭</p>
    </div>
  )
}
