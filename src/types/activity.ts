/* Activity type definitions for preset countdown activities */

export interface Activity {
  id: string
  name: string
  duration: number // in seconds
  color: string // CSS variable name
  emoji: string
}

export const PRESET_ACTIVITIES: Activity[] = [
  {
    id: 'meal',
    name: 'Meal Time',
    duration: 1800, // 30 minutes
    color: 'var(--color-meal)',
    emoji: '🍽️'
  },
  {
    id: 'homework',
    name: 'Homework',
    duration: 2700, // 45 minutes
    color: 'var(--color-homework)',
    emoji: '📚'
  },
  {
    id: 'tv',
    name: 'TV Time',
    duration: 3600, // 60 minutes
    color: 'var(--color-tv)',
    emoji: '📺'
  }
]

export type TimerState = 'idle' | 'running' | 'paused' | 'completed'
