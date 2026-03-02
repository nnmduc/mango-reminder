/* use-presets hook - manages activities with localStorage persistence */
import { useState, useCallback } from 'react'
import type { Activity } from '../types/activity'
import { DEFAULT_ACTIVITIES } from '../types/activity'

const STORAGE_KEY = 'mango-reminder-custom-presets'

function loadCustomPresets(): Activity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Activity[]
  } catch {
    return []
  }
}

function saveCustomPresets(presets: Activity[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
}

export function usePresets() {
  const [customPresets, setCustomPresets] = useState<Activity[]>(loadCustomPresets)

  // All activities: defaults first, then user presets
  const activities = [...DEFAULT_ACTIVITIES, ...customPresets]

  const addPreset = useCallback((preset: Omit<Activity, 'id' | 'isDefault'>) => {
    const newPreset: Activity = {
      ...preset,
      id: `custom-${Date.now()}`,
      isDefault: false,
    }
    setCustomPresets(prev => {
      const updated = [...prev, newPreset]
      saveCustomPresets(updated)
      return updated
    })
  }, [])

  const updatePreset = useCallback((id: string, changes: Omit<Activity, 'id' | 'isDefault'>) => {
    setCustomPresets(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...changes } : p)
      saveCustomPresets(updated)
      return updated
    })
  }, [])

  const deletePreset = useCallback((id: string) => {
    setCustomPresets(prev => {
      const updated = prev.filter(p => p.id !== id)
      saveCustomPresets(updated)
      return updated
    })
  }, [])

  return { activities, addPreset, updatePreset, deletePreset }
}
