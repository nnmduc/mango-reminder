/* ProgressBar - Orchestrates animated alligator eating mango progress */
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlligatorCharacter } from './AlligatorCharacter'
import { MangoCharacter } from './MangoCharacter'
import { ProgressTrack } from './ProgressTrack'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  progress: number // 0-1 (elapsed / total)
  isRunning: boolean
  isCompleted: boolean
}

// Milestone points for pulse animations
const MILESTONES = [0.5, 0.67, 0.83, 0.97] // halfway, 15min, 5min, 1min

export function ProgressBar({
  progress,
  isRunning,
  isCompleted
}: ProgressBarProps) {
  const reducedMotion = useReducedMotion()
  const [lastMilestone, setLastMilestone] = useState(-1)
  const [showPulse, setShowPulse] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // Detect milestone crossings
  useEffect(() => {
    if (!isRunning) return

    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      if (progress >= MILESTONES[i] && lastMilestone < i) {
        setLastMilestone(i)
        setShowPulse(true)
        setTimeout(() => setShowPulse(false), 500)
        break
      }
    }
  }, [progress, isRunning, lastMilestone])

  // Show celebration on completion
  useEffect(() => {
    if (isCompleted) {
      setShowCelebration(true)
      // Auto-hide after 3 seconds
      setTimeout(() => setShowCelebration(false), 3000)
    }
  }, [isCompleted])

  // Check if alligator is eating (near mango)
  const isEating = progress > 0.85

  return (
    <div className={styles.container}>
      {/* Progress track background */}
      <ProgressTrack />

      {/* Animated characters */}
      <div className={styles.charactersLayer}>
        <AlligatorCharacter
          progress={progress}
          isRunning={isRunning}
          isEating={isEating}
          reducedMotion={reducedMotion}
        />
        <MangoCharacter progress={progress} reducedMotion={reducedMotion} />
      </div>

      {/* Milestone pulse effect */}
      {showPulse && !reducedMotion && (
        <motion.div
          className={styles.pulseRing}
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Celebration effect */}
      {showCelebration && !reducedMotion && (
        <div className={styles.celebration}>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.confetti}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                rotate: 0
              }}
              animate={{
                x: Math.cos((i / 12) * Math.PI * 2) * 150,
                y: Math.sin((i / 12) * Math.PI * 2) * 150,
                opacity: 0,
                rotate: 360
              }}
              transition={{
                duration: 1.5,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
