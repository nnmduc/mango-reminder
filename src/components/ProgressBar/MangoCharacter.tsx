/* MangoCharacter - Cute mango SVG that shrinks as it gets eaten */
import { motion } from 'framer-motion'

interface MangoCharacterProps {
  progress: number // 0-1
  reducedMotion: boolean
}

export function MangoCharacter({
  progress,
  reducedMotion
}: MangoCharacterProps) {
  // Scale from 1 to 0.3 as progress increases
  const scale = 1 - progress * 0.7

  // Fade out in final 10%
  const opacity = progress > 0.9 ? 0.5 : 1

  // Wobble when alligator is near (last 15%)
  const shouldWobble = progress > 0.85 && !reducedMotion

  const wobbleVariants = {
    normal: { rotate: 0 },
    wobble: {
      rotate: [-5, 5, -5, 0],
      transition: {
        duration: 0.4,
        repeat: Infinity,
        repeatDelay: 0.5
      }
    }
  }

  return (
    <motion.svg
      width="70"
      height="80"
      viewBox="0 0 70 80"
      style={{
        position: 'absolute',
        right: '5%',
        top: '50%',
        marginTop: '-40px' // half of SVG height (80px) — avoids framer-motion transform conflict
      }}
      animate={{
        scale,
        opacity
      }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
    >
      <motion.g
        variants={wobbleVariants}
        animate={shouldWobble ? 'wobble' : 'normal'}
      >
        {/* Leaf on top */}
        <ellipse
          cx="35"
          cy="15"
          rx="12"
          ry="8"
          fill="#4caf50"
          transform="rotate(-20 35 15)"
        />
        <path
          d="M 35 15 Q 38 18, 35 21"
          stroke="#2e7d32"
          strokeWidth="2"
          fill="none"
        />

        {/* Mango body - gradient from yellow to orange */}
        <defs>
          <radialGradient id="mangoGradient">
            <stop offset="0%" stopColor="#ffd54f" />
            <stop offset="50%" stopColor="#ffb74d" />
            <stop offset="100%" stopColor="#ff9800" />
          </radialGradient>
        </defs>

        {/* Main body */}
        <ellipse cx="35" cy="45" rx="25" ry="30" fill="url(#mangoGradient)" />

        {/* Highlight spot */}
        <ellipse
          cx="28"
          cy="38"
          rx="8"
          ry="12"
          fill="#ffe082"
          opacity="0.6"
        />

        {/* Face */}
        <g>
          {/* Eyes */}
          <circle cx="28" cy="42" r="3" fill="#3e2723" />
          <circle cx="42" cy="42" r="3" fill="#3e2723" />

          {/* Eye shine */}
          <circle cx="29" cy="41" r="1" fill="white" />
          <circle cx="43" cy="41" r="1" fill="white" />

          {/* Smile */}
          <path
            d="M 28 50 Q 35 54, 42 50"
            stroke="#3e2723"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Rosy cheeks */}
          <circle cx="22" cy="48" r="4" fill="#ff8a80" opacity="0.4" />
          <circle cx="48" cy="48" r="4" fill="#ff8a80" opacity="0.4" />
        </g>

        {/* Texture spots */}
        <circle cx="20" cy="35" r="2" fill="#f57c00" opacity="0.3" />
        <circle cx="45" cy="38" r="2" fill="#f57c00" opacity="0.3" />
        <circle cx="30" cy="55" r="2" fill="#f57c00" opacity="0.3" />
        <circle cx="40" cy="60" r="2" fill="#f57c00" opacity="0.3" />
      </motion.g>
    </motion.svg>
  )
}
