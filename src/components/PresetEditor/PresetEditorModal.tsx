/* PresetEditorModal - Simplified bottom-sheet style preset editor */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Activity } from '../../types/activity'
import { PRESET_COLORS, PRESET_EMOJIS } from '../../types/activity'
import styles from './PresetEditorModal.module.css'

interface PresetEditorModalProps {
  preset?: Activity | null
  onSave: (data: Omit<Activity, 'id' | 'isDefault'>) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

// Quick-pick time chips in minutes
const TIME_CHIPS = [5, 10, 15, 20, 30, 45, 60, 90]

const DEFAULT_FORM = {
  name: '',
  emoji: '⭐',
  color: PRESET_COLORS[0],
  minutes: 15,
}

export function PresetEditorModal({ preset, onSave, onDelete, onClose }: PresetEditorModalProps) {
  const isEdit = !!preset
  const [name, setName]     = useState(preset?.name ?? DEFAULT_FORM.name)
  const [emoji, setEmoji]   = useState(preset?.emoji ?? DEFAULT_FORM.emoji)
  const [color, setColor]   = useState(preset?.color ?? DEFAULT_FORM.color)
  const [minutes, setMinutes] = useState(
    preset ? Math.round(preset.duration / 60) : DEFAULT_FORM.minutes
  )

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

  function adjustMinutes(delta: number) {
    setMinutes(m => Math.max(1, Math.min(180, m + delta)))
  }

  return (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={styles.sheet}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        >
          {/* Handle bar */}
          <div className={styles.handle} />

          {/* Header with live preview */}
          <div className={styles.header}>
            <div className={styles.preview} style={{ backgroundColor: color }}>
              <span className={styles.previewEmoji}>{emoji}</span>
              <span className={styles.previewName}>{name || 'Activity name'}</span>
              <span className={styles.previewTime}>{minutes} min</span>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          </div>

          <div className={styles.body}>
            {/* Emoji picker */}
            <div className={styles.section}>
              <span className={styles.label}>Pick an icon</span>
              <div className={styles.emojiGrid}>
                {PRESET_EMOJIS.map(e => (
                  <button
                    key={e}
                    className={`${styles.emojiBtn} ${emoji === e ? styles.selected : ''}`}
                    onClick={() => setEmoji(e)}
                    type="button"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Name input */}
            <div className={styles.section}>
              <span className={styles.label}>Name</span>
              <input
                className={styles.input}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Play Time"
                maxLength={20}
                autoComplete="off"
              />
            </div>

            {/* Duration - chips + stepper */}
            <div className={styles.section}>
              <span className={styles.label}>Duration</span>
              {/* Quick chips */}
              <div className={styles.timeChips}>
                {TIME_CHIPS.map(t => (
                  <button
                    key={t}
                    className={`${styles.chip} ${minutes === t ? styles.chipActive : ''}`}
                    onClick={() => setMinutes(t)}
                    type="button"
                  >
                    {t >= 60 ? `${t / 60}h` : `${t}m`}
                  </button>
                ))}
              </div>
              {/* Stepper */}
              <div className={styles.stepper}>
                <button
                  className={styles.stepBtn}
                  onClick={() => adjustMinutes(-5)}
                  disabled={minutes <= 5}
                  type="button"
                  aria-label="Decrease by 5 minutes"
                >−</button>
                <span className={styles.stepValue}>{minutes} min</span>
                <button
                  className={styles.stepBtn}
                  onClick={() => adjustMinutes(5)}
                  disabled={minutes >= 180}
                  type="button"
                  aria-label="Increase by 5 minutes"
                >+</button>
              </div>
            </div>

            {/* Color picker */}
            <div className={styles.section}>
              <span className={styles.label}>Color</span>
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
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.actions}>
            {isEdit && onDelete && (
              <button className={styles.deleteBtn} onClick={handleDelete} type="button">
                Delete
              </button>
            )}
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              type="button"
              disabled={!name.trim() || minutes < 1}
            >
              {isEdit ? 'Save Changes' : 'Add Activity'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
