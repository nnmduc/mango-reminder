/* PresetEditorModal - Add/edit custom activity presets */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Activity } from '../../types/activity'
import { PRESET_COLORS, PRESET_EMOJIS } from '../../types/activity'
import styles from './PresetEditorModal.module.css'

interface PresetEditorModalProps {
  preset?: Activity | null       // null = add mode, Activity = edit mode
  onSave: (data: Omit<Activity, 'id' | 'isDefault'>) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

const DEFAULT_FORM = {
  name: '',
  emoji: '⭐',
  color: PRESET_COLORS[0],
  minutes: 15,
}

export function PresetEditorModal({ preset, onSave, onDelete, onClose }: PresetEditorModalProps) {
  const isEdit = !!preset
  const [name, setName] = useState(preset?.name ?? DEFAULT_FORM.name)
  const [emoji, setEmoji] = useState(preset?.emoji ?? DEFAULT_FORM.emoji)
  const [color, setColor] = useState(preset?.color ?? DEFAULT_FORM.color)
  const [minutes, setMinutes] = useState(
    preset ? Math.round(preset.duration / 60) : DEFAULT_FORM.minutes
  )

  // Sync form when preset changes
  useEffect(() => {
    if (preset) {
      setName(preset.name)
      setEmoji(preset.emoji)
      setColor(preset.color)
      setMinutes(Math.round(preset.duration / 60))
    }
  }, [preset])

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed || minutes < 1) return
    onSave({ name: trimmed, emoji, color, duration: minutes * 60 })
    onClose()
  }

  function handleDelete() {
    if (preset && onDelete) {
      onDelete(preset.id)
      onClose()
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <h2 className={styles.title}>{isEdit ? 'Edit Preset' : 'New Preset'}</h2>

          {/* Preview card */}
          <div className={styles.preview} style={{ backgroundColor: color }}>
            <span className={styles.previewEmoji}>{emoji}</span>
            <span className={styles.previewName}>{name || 'Activity name'}</span>
            <span className={styles.previewTime}>{minutes} min</span>
          </div>

          {/* Emoji picker */}
          <label className={styles.label}>Icon</label>
          <div className={styles.emojiGrid}>
            {PRESET_EMOJIS.map(e => (
              <button
                key={e}
                className={`${styles.emojiBtn} ${emoji === e ? styles.emojiSelected : ''}`}
                onClick={() => setEmoji(e)}
                type="button"
              >
                {e}
              </button>
            ))}
          </div>

          {/* Name */}
          <label className={styles.label} htmlFor="preset-name">Name</label>
          <input
            id="preset-name"
            className={styles.input}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Play Time"
            maxLength={20}
          />

          {/* Duration slider */}
          <label className={styles.label}>Duration: {minutes} min</label>
          <input
            className={styles.slider}
            type="range"
            min={1}
            max={180}
            value={minutes}
            onChange={e => setMinutes(Number(e.target.value))}
          />
          <div className={styles.sliderLabels}>
            <span>1 min</span>
            <span>3 hrs</span>
          </div>

          {/* Color picker */}
          <label className={styles.label}>Color</label>
          <div className={styles.colorGrid}>
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                className={`${styles.colorBtn} ${color === c ? styles.colorSelected : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                type="button"
                aria-label={c}
              />
            ))}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {isEdit && onDelete && (
              <button className={styles.deleteBtn} onClick={handleDelete} type="button">
                Delete
              </button>
            )}
            <button className={styles.cancelBtn} onClick={onClose} type="button">
              Cancel
            </button>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              type="button"
              disabled={!name.trim() || minutes < 1}
            >
              {isEdit ? 'Save' : 'Add'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
