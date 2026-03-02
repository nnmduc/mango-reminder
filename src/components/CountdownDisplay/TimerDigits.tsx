/* TimerDigits component - Large countdown display in MM:SS format */
import { useMemo } from 'react'
import styles from './TimerDigits.module.css'

interface TimerDigitsProps {
  remainingSeconds: number
  totalSeconds: number
}

export function TimerDigits({ remainingSeconds, totalSeconds }: TimerDigitsProps) {
  const { minutes, seconds } = useMemo(() => {
    const mins = Math.floor(remainingSeconds / 60)
    const secs = remainingSeconds % 60
    return {
      minutes: String(mins).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0')
    }
  }, [remainingSeconds])

  // Determine color state based on percentage remaining
  const colorState = useMemo(() => {
    const percentageRemaining = (remainingSeconds / totalSeconds) * 100
    if (percentageRemaining > 25) return 'normal'
    if (percentageRemaining > 10) return 'warning'
    return 'urgent'
  }, [remainingSeconds, totalSeconds])

  return (
    <div className={`${styles.timer} ${styles[colorState]}`}>
      <span className={styles.digits}>{minutes}</span>
      <span className={styles.separator}>:</span>
      <span className={styles.digits}>{seconds}</span>
    </div>
  )
}
