/* AlligatorCharacter - Animated alligator SVG with Framer Motion */
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
  // Position based on progress (0% -> 85% of track width)
  const xPosition = progress * 85

  // Body bob — faster and bigger when running
  const bodyVariants = {
    idle: reducedMotion
      ? { y: 0 }
      : { y: [0, -3, 0], transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' } },
    running: reducedMotion
      ? { y: 0 }
      : { y: [0, -6, 0], transition: { repeat: Infinity, duration: 0.45, ease: 'easeInOut' } }
  }

  // Leg swing for running animation (legs alternate in pairs)
  const legNormal = isRunning && !reducedMotion
    ? { rotate: [-25, 25, -25], transition: { repeat: Infinity, duration: 0.45, ease: 'easeInOut' } }
    : { rotate: 0 }
  const legAlt = isRunning && !reducedMotion
    ? { rotate: [25, -25, 25], transition: { repeat: Infinity, duration: 0.45, ease: 'easeInOut' } }
    : { rotate: 0 }

  // Jaw animation when eating
  const jawVariants = {
    normal: { scaleY: 1, originY: 0 },
    eating: {
      scaleY: [1, 1.3, 1],
      transition: { duration: 0.3, repeat: 2 }
    }
  }

  return (
    <motion.svg
      width="80"
      height="60"
      viewBox="0 0 80 60"
      style={{
        position: 'absolute',
        top: '50%',
        marginTop: '-30px' // half of SVG height (60px) — avoids framer-motion transform conflict
      }}
      initial={{ left: '0%' }}
      animate={{ left: `${xPosition}%` }}
      transition={{ left: { type: 'tween', duration: 1, ease: 'linear' } }}
    >
      {/* Body bob as a separate inner group so position and bob don't conflict */}
      <motion.g
        animate={isRunning ? 'running' : 'idle'}
        variants={bodyVariants}
      >
      {/* Tail */}
      <motion.path
        d="M 5 30 Q 0 25, 3 20 Q 8 15, 5 10"
        stroke="#2d8659"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        animate={
          reducedMotion
            ? undefined
            : {
                d: [
                  'M 5 30 Q 0 25, 3 20 Q 8 15, 5 10',
                  'M 5 30 Q 2 28, 5 25 Q 10 20, 8 15',
                  'M 5 30 Q 0 25, 3 20 Q 8 15, 5 10'
                ]
              }
        }
        transition={{ repeat: Infinity, duration: 1.5 }}
      />

      {/* Body (main oval) */}
      <ellipse cx="35" cy="30" rx="25" ry="18" fill="#3fa66d" />

      {/* Belly spot */}
      <ellipse cx="35" cy="35" rx="18" ry="12" fill="#5ec48a" opacity="0.6" />

      {/* Head */}
      <circle cx="60" cy="28" r="16" fill="#3fa66d" />

      {/* Eyes */}
      <g>
        {/* Left eye white */}
        <circle cx="55" cy="22" r="5" fill="white" />
        {/* Left eye pupil */}
        <circle cx="56" cy="22" r="3" fill="#1a1a1a" />

        {/* Right eye white */}
        <circle cx="68" cy="22" r="5" fill="white" />
        {/* Right eye pupil */}
        <circle cx="69" cy="22" r="3" fill="#1a1a1a" />
      </g>

      {/* Jaw/mouth */}
      <motion.g
        variants={jawVariants}
        animate={isEating ? 'eating' : 'normal'}
      >
        {/* Upper jaw */}
        <path
          d="M 75 28 Q 78 32, 75 36 L 65 34 Z"
          fill="#2d8659"
          stroke="#2d8659"
          strokeWidth="1"
        />
        {/* Lower jaw */}
        <path
          d="M 75 36 Q 78 40, 73 42 L 65 38 Z"
          fill="#2d8659"
          stroke="#2d8659"
          strokeWidth="1"
        />
        {/* Teeth hint */}
        <line
          x1="73"
          y1="34"
          x2="73"
          y2="38"
          stroke="white"
          strokeWidth="1.5"
        />
        <line
          x1="70"
          y1="34"
          x2="70"
          y2="38"
          stroke="white"
          strokeWidth="1.5"
        />
      </motion.g>

      {/* Legs — wrapped in motion.g for running cycle animation */}
      {/* Leg 1 (front) and Leg 3 (back) swing together; Leg 2 (middle) alternates */}
      <motion.g style={{ transformOrigin: '25px 45px' }} animate={legNormal}>
        <line x1="25" y1="45" x2="23" y2="55" stroke="#2d8659" strokeWidth="5" strokeLinecap="round" />
      </motion.g>
      <motion.g style={{ transformOrigin: '35px 46px' }} animate={legAlt}>
        <line x1="35" y1="46" x2="35" y2="56" stroke="#2d8659" strokeWidth="5" strokeLinecap="round" />
      </motion.g>
      <motion.g style={{ transformOrigin: '45px 45px' }} animate={legNormal}>
        <line x1="45" y1="45" x2="47" y2="55" stroke="#2d8659" strokeWidth="5" strokeLinecap="round" />
      </motion.g>
      </motion.g>{/* end body bob group */}
    </motion.svg>
  )
}
