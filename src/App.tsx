/* App component - Main application with view switching logic */
import { useState, useCallback } from 'react'
import type { Activity, TimerState } from './types/activity'
import { AppLayout } from './components/Layout/AppLayout'
import { ActivitySelector } from './components/ActivitySelector/ActivitySelector'
import { CountdownDisplay } from './components/CountdownDisplay/CountdownDisplay'
import { useCountdown } from './hooks/use-countdown'
import { useAudio } from './hooks/use-audio'

type View = 'selector' | 'countdown'

function App() {
  const [view, setView] = useState<View>('selector')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  // Audio system
  const { play: playSound, isMuted, toggleMute } = useAudio({ preload: true })

  // Countdown timer with audio milestones
  const { state: countdownState, start, pause, resume, reset } = useCountdown(
    selectedActivity ? selectedActivity.duration / 60 : 0, // 0 when idle — ensures sync fires on every activity change
    {
      onMilestone: (soundId) => playSound(soundId),
      onComplete: () => playSound('celebration')
    }
  )

  // Map countdown state to timer state
  const timerState: TimerState = countdownState.isCompleted
    ? 'completed'
    : countdownState.isPaused
    ? 'paused'
    : countdownState.isRunning
    ? 'running'
    : 'idle'

  // Handle activity selection
  const handleSelectActivity = useCallback((activity: Activity) => {
    setSelectedActivity(activity)
    setView('countdown')
    start()
  }, [start])

  // Handle pause/resume
  const handlePauseResume = useCallback(() => {
    if (countdownState.isRunning) {
      pause()
    } else {
      resume()
    }
  }, [countdownState.isRunning, pause, resume])

  // Handle reset
  const handleReset = useCallback(() => {
    reset()
    setView('selector')
    setSelectedActivity(null)
  }, [reset])

  return (
    <AppLayout>
      {view === 'selector' && (
        <ActivitySelector onSelectActivity={handleSelectActivity} />
      )}
      {view === 'countdown' && selectedActivity && (
        <CountdownDisplay
          activity={selectedActivity}
          remainingSeconds={countdownState.timeRemaining}
          timerState={timerState}
          onPauseResume={handlePauseResume}
          onReset={handleReset}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}
    </AppLayout>
  )
}

export default App
