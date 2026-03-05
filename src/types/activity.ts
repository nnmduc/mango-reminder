/* Activity type definitions for preset countdown activities */

export interface Activity {
  id: string
  name: string
  duration: number // in seconds
  color: string // hex color or CSS variable
  emoji: string
  isDefault?: boolean // default presets cannot be deleted
}

// Predefined color palette for custom presets — soft pastels
export const PRESET_COLORS = [
  '#FFD6C0', '#FFC8E0', '#FFF3C4', '#C7F0DD',
  '#B5D8F7', '#D4C5F5', '#FFDDE1', '#C8F4E8',
  '#FFE4B5', '#C5E8FF', '#E8D5FF', '#D4F5D0',
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
    color: '#FFD6C0', // peach pastel
    emoji: '🍽️',
    isDefault: true,
  },
  {
    id: 'homework',
    name: 'Homework',
    duration: 2700, // 45 minutes
    color: '#D4C5F5', // lavender pastel
    emoji: '📚',
    isDefault: true,
  },
  {
    id: 'tv',
    name: 'TV Time',
    duration: 1200, // 20 minutes
    color: '#FFF3C4', // yellow pastel
    emoji: '📺',
    isDefault: true,
  },
]

export type TimerState = 'idle' | 'running' | 'paused' | 'completed'
