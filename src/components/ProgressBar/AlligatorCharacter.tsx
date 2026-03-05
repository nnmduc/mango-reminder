/* AlligatorCharacter - Emoji alligator with Framer Motion animation */
import { motion } from 'framer-motion'

interface AlligatorCharacterProps {
  progress: number // 0-1
  isRunning: boolean
  isEating: boolean
  reducedMotion: boolean
}

export function AlligatorCharacter({
  progress,
  isRunning,
  isEating,
  reducedMotion
}: AlligatorCharacterProps) {
  const xPosition = progress * 80

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: '50%',
        marginTop: '-28px',
        width: 56,
        height: 56,
        pointerEvents: 'none',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 44,
        lineHeight: 1,
      }}
      initial={{ left: '0%' }}
      animate={{ left: `${xPosition}%` }}
      transition={{ left: { type: 'tween', duration: 0.8, ease: 'linear' } }}
    >
      <motion.span
        animate={
          reducedMotion ? undefined
          : isEating ? { rotate: [-8, 8, -8], scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 0.3 } }
          : isRunning ? { y: [0, -5, 0], transition: { repeat: Infinity, duration: 0.38, ease: 'easeInOut' } }
          : { y: [0, -3, 0], transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } }
        }
        style={{ display: 'inline-block' }}
      >
        🐊
      </motion.span>
    </motion.div>
  )
}
