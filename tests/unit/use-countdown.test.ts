import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCountdown } from '@/hooks/use-countdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with correct duration', () => {
    const { result } = renderHook(() => useCountdown(30))
    expect(result.current.state.totalTime).toBe(30 * 60)
    expect(result.current.state.timeRemaining).toBe(30 * 60)
    expect(result.current.state.isRunning).toBe(false)
    expect(result.current.state.isPaused).toBe(false)
    expect(result.current.state.isCompleted).toBe(false)
    expect(result.current.state.progress).toBe(0)
  })

  it('counts down when started', () => {
    const { result } = renderHook(() => useCountdown(1))

    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(1000) })

    expect(result.current.state.timeRemaining).toBe(59)
    expect(result.current.state.isRunning).toBe(true)
  })

  it('pauses and stops counting', () => {
    const { result } = renderHook(() => useCountdown(1))

    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(5000) })
    act(() => { result.current.pause() })

    const pausedTime = result.current.state.timeRemaining
    expect(result.current.state.isPaused).toBe(true)
    expect(result.current.state.isRunning).toBe(false)

    act(() => { vi.advanceTimersByTime(5000) })
    expect(result.current.state.timeRemaining).toBe(pausedTime)
  })

  it('resumes counting after pause', () => {
    const { result } = renderHook(() => useCountdown(1))

    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(5000) })
    act(() => { result.current.pause() })

    const pausedTime = result.current.state.timeRemaining

    act(() => { result.current.resume() })
    act(() => { vi.advanceTimersByTime(1000) })

    expect(result.current.state.timeRemaining).toBe(pausedTime - 1)
    expect(result.current.state.isRunning).toBe(true)
    expect(result.current.state.isPaused).toBe(false)
  })

  it('resets to initial state', () => {
    const { result } = renderHook(() => useCountdown(1))

    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(10000) })
    act(() => { result.current.reset() })

    expect(result.current.state.timeRemaining).toBe(60)
    expect(result.current.state.isRunning).toBe(false)
    expect(result.current.state.isPaused).toBe(false)
    expect(result.current.state.progress).toBe(0)
  })

  it('calculates progress correctly at halfway', () => {
    const { result } = renderHook(() => useCountdown(1)) // 60 seconds

    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(30000) }) // 30 seconds elapsed

    expect(result.current.state.progress).toBeCloseTo(0.5, 1)
  })

  it('completes when time reaches zero', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useCountdown(1, { onComplete }))

    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(60000) }) // full minute

    expect(result.current.state.isCompleted).toBe(true)
    expect(result.current.state.timeRemaining).toBe(0)
    expect(result.current.state.isRunning).toBe(false)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('triggers 15min milestone when crossing threshold', () => {
    const onMilestone = vi.fn()
    // 30 min timer, 15min milestone at exactly 15min remaining (900s)
    const { result } = renderHook(() => useCountdown(30, { onMilestone }))

    act(() => { result.current.start() })
    // Advance to just past 15min remaining (900s elapsed from 1800s total)
    act(() => { vi.advanceTimersByTime(900 * 1000 + 1000) })

    expect(onMilestone).toHaveBeenCalledWith('15min')
  })

  it('triggers 5min milestone when crossing threshold', () => {
    const onMilestone = vi.fn()
    const { result } = renderHook(() => useCountdown(10, { onMilestone }))

    act(() => { result.current.start() })
    // Advance past 5 min remaining (300s from 600s total = 300s elapsed)
    act(() => { vi.advanceTimersByTime(301 * 1000) })

    expect(onMilestone).toHaveBeenCalledWith('5min')
  })

  it('triggers 1min milestone when crossing threshold', () => {
    const onMilestone = vi.fn()
    const { result } = renderHook(() => useCountdown(5, { onMilestone }))

    act(() => { result.current.start() })
    // Advance past 1 min remaining (60s from 300s total = 240s elapsed)
    act(() => { vi.advanceTimersByTime(241 * 1000) })

    expect(onMilestone).toHaveBeenCalledWith('1min')
  })

  it('triggers halfway milestone at 50% progress', () => {
    const onMilestone = vi.fn()
    const { result } = renderHook(() => useCountdown(2, { onMilestone })) // 120s

    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(61 * 1000) }) // just past halfway

    expect(onMilestone).toHaveBeenCalledWith('halfway')
  })

  it('does not trigger milestones twice', () => {
    const onMilestone = vi.fn()
    const { result } = renderHook(() => useCountdown(5, { onMilestone }))

    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(241 * 1000) }) // past 1min
    act(() => { vi.advanceTimersByTime(10 * 1000) })  // more time

    const calls = onMilestone.mock.calls.filter(([id]) => id === '1min')
    expect(calls.length).toBe(1)
  })

  it('clears milestones on reset', () => {
    const onMilestone = vi.fn()
    const { result } = renderHook(() => useCountdown(5, { onMilestone }))

    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(241 * 1000) }) // trigger 1min
    act(() => { result.current.reset() })
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(241 * 1000) }) // should trigger 1min again

    const calls = onMilestone.mock.calls.filter(([id]) => id === '1min')
    expect(calls.length).toBe(2)
  })
})
