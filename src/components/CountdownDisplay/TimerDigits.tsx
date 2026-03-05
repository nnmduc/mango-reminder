/* TimerDigits - SVG circular ring with centered countdown, pastel minimal */
import { useMemo } from 'react'
import styles from './TimerDigits.module.css'

interface TimerDigitsProps {
  remainingSeconds: number
  totalSeconds: number
  ringColor?: string // CSS color for the progress stroke
}

// SVG ring constants — matches viewBox 230x230, radius 96
const RADIUS = 96
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ≈ 603

export function TimerDigits({ remainingSeconds, totalSeconds, ringColor }: TimerDigitsProps) {
  const { timeStr, colorState, strokeOffset, strokeColor } = useMemo(() => {
    const mins = Math.floor(remainingSeconds / 60)
    const secs = remainingSeconds % 60
    const time = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

    const pctRemaining = (remainingSeconds / totalSeconds) * 100
    const state = pctRemaining > 25 ? 'normal' : pctRemaining > 10 ? 'warning' : 'urgent'

    // Progress elapsed = 1 - remaining; dashoffset = circumference * (1 - elapsed)
    const elapsed = 1 - remainingSeconds / totalSeconds
    const offset = CIRCUMFERENCE * (1 - elapsed) // starts full, shrinks as time passes

    // Ring stroke color: use activity color, fallback to peach-dk
    const stroke = ringColor ?? '#FFA882'

    return { timeStr: time, colorState: state, strokeOffset: offset, strokeColor: stroke }
  }, [remainingSeconds, totalSeconds, ringColor])

  return (
    <div className={`${styles.timer} ${styles[colorState]}`}>
      {/* SVG progress ring */}
      <svg className={styles.ringsvg} viewBox="0 0 230 230" aria-hidden="true">
        {/* Background track */}
        <circle className={styles.ringTrack} cx="115" cy="115" r={RADIUS} />
        {/* Progress fill */}
        <circle
          className={styles.ringFill}
          cx="115" cy="115" r={RADIUS}
          stroke={strokeColor}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeOffset}
        />
      </svg>

      {/* Centered time + label */}
      <div className={styles.center}>
        <span className={styles.digits}>{timeStr}</span>
        <span className={styles.sublabel}>remaining</span>
      </div>
    </div>
  )
}
