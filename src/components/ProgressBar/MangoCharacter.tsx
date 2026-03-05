/* MangoCharacter - Emoji mango that shrinks as it gets eaten */
import { motion } from 'framer-motion'

interface MangoCharacterProps {
  progress: number // 0-1
  reducedMotion: boolean
}

export function MangoCharacter({ progress, reducedMotion }: MangoCharacterProps) {
  const scale = 1 - progress * 0.65
  const opacity = progress > 0.9 ? 0.4 : 1
  const shouldWobble = progress > 0.82 && !reducedMotion

  return (
    <motion.div
      style={{
        position: 'absolute',
        right: '4%',
        top: '50%',
        marginTop: '-28px',
        width: 56,
        height: 56,
        pointerEvents: 'none',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
        lineHeight: 1,
      }}
      animate={{ scale, opacity }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
    >
      <motion.span
        animate={
          shouldWobble
            ? { rotate: [-8, 8, -8, 0], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.3 } }
            : { rotate: 0 }
        }
        style={{ display: 'inline-block' }}
      >
        🥭
      </motion.span>
    </motion.div>
  )
}
