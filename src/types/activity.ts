/* Activity type definitions for preset countdown activities */

export interface Activity {
  id: string
  name: string
  duration: number // in seconds
  color: string // hex color or CSS variable
  emoji: string
  isDefault?: boolean // default presets cannot be deleted
}

// Predefined color palette for custom presets
export const PRESET_COLORS = [
  '#FF6B6B', '#FF8E53', '#FDCB6E', '#A8E063',
  '#4ECDC4', '#45B7D1', '#6C5CE7', '#FD79A8',
  '#E17055', '#00B894', '#0984E3', '#D63031',
]

// Default emojis for the picker
export const PRESET_EMOJIS = [
  '🍽️','📚','📺','🎮','🏃','🎵','🎨','🛁',
  '😴','📖','🎯','🏊','🚴','🍕','🌙','⭐',
  '🎁','🐶','🐱','🦁','🐼','🦊','🐧','🌈',
  '⚽','🏀','🎸','✏️','🎭','🎪','🧩','🏋️',
]

export const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: 'meal',
    name: 'Meal Time',
    duration: 1800, // 30 minutes
    color: '#FF6B6B',
    emoji: '🍽️',
    isDefault: true,
  },
  {
    id: 'homework',
    name: 'Homework',
    duration: 2700, // 45 minutes
    color: '#4ECDC4',
    emoji: '📚',
    isDefault: true,
    },
    {
    id: 'tv',
    name: 'TV Time',
    duration: 1200, // 20 minutes
    color: '#45B7D1',
    emoji: '📺',
    isDefault: true,
  },
]

export type TimerState = 'idle' | 'running' | 'paused' | 'completed'
