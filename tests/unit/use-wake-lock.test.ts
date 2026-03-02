import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWakeLock } from '@/hooks/use-wake-lock'

// Mock WakeLockSentinel
const createMockSentinel = () => {
  const listeners: Record<string, EventListener[]> = {}
  const sentinel = {
    released: false,
    type: 'screen' as WakeLockType,
    release: vi.fn().mockImplementation(async () => {
      sentinel.released = true
      listeners['release']?.forEach(cb => cb(new Event('release')))
    }),
    addEventListener: vi.fn().mockImplementation((event: string, cb: EventListener) => {
      if (!listeners[event]) listeners[event] = []
      listeners[event].push(cb)
    }),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onrelease: null,
    _fireRelease: () => {
      listeners['release']?.forEach(cb => cb(new Event('release')))
    },
  }
  return sentinel
}

// Remove wakeLock from navigator so `'wakeLock' in navigator` returns false
function removeWakeLock() {
  try {
    delete (navigator as unknown as Record<string, unknown>).wakeLock
  } catch { /* ignore in environments that disallow delete */ }
}

// ── Supported browser ────────────────────────────────────────────────────────

describe('useWakeLock - supported browser', () => {
  let mockSentinel: ReturnType<typeof createMockSentinel>

  beforeEach(() => {
    mockSentinel = createMockSentinel()
    Object.defineProperty(navigator, 'wakeLock', {
      value: { request: vi.fn().mockResolvedValue(mockSentinel) },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    removeWakeLock()
    vi.restoreAllMocks()
  })

  it('detects browser support as true', () => {
    const { result } = renderHook(() => useWakeLock())
    expect(result.current.state.isSupported).toBe(true)
  })

  it('initializes with isActive=false and no error', () => {
    const { result } = renderHook(() => useWakeLock())
    expect(result.current.state.isActive).toBe(false)
    expect(result.current.state.error).toBeNull()
  })

  it('requests wake lock and sets isActive to true', async () => {
    const { result } = renderHook(() => useWakeLock())

    let success: boolean
    await act(async () => { success = await result.current.request() })

    expect(success!).toBe(true)
    expect(result.current.state.isActive).toBe(true)
    expect(result.current.state.error).toBeNull()
  })

  it('releases wake lock and sets isActive to false', async () => {
    const { result } = renderHook(() => useWakeLock())

    await act(async () => { await result.current.request() })
    await act(async () => { await result.current.release() })

    expect(result.current.state.isActive).toBe(false)
    expect(mockSentinel.release).toHaveBeenCalledTimes(1)
  })

  it('handles request failure gracefully', async () => {
    vi.mocked(navigator.wakeLock.request).mockRejectedValueOnce(
      new Error('Permission denied')
    )

    const { result } = renderHook(() => useWakeLock())

    let success: boolean
    await act(async () => { success = await result.current.request() })

    expect(success!).toBe(false)
    expect(result.current.state.isActive).toBe(false)
    expect(result.current.state.error).toBe('Permission denied')
  })

  it('updates isActive to false when system releases the lock', async () => {
    const { result } = renderHook(() => useWakeLock())

    await act(async () => { await result.current.request() })
    expect(result.current.state.isActive).toBe(true)

    // Simulate OS releasing the lock (e.g. tab hidden or low battery)
    act(() => { mockSentinel._fireRelease() })

    expect(result.current.state.isActive).toBe(false)
  })

  it('re-acquires lock when tab becomes visible after system release', async () => {
    const { result } = renderHook(() => useWakeLock())

    await act(async () => { await result.current.request() })

    // System releases the lock
    act(() => { mockSentinel._fireRelease() })

    // Tab becomes visible again
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
        configurable: true,
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(navigator.wakeLock.request).toHaveBeenCalledTimes(2)
  })

  it('does not re-acquire lock after intentional release', async () => {
    const { result } = renderHook(() => useWakeLock())

    await act(async () => { await result.current.request() })
    await act(async () => { await result.current.release() }) // intentional

    // Tab becomes visible
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
        configurable: true,
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // Only the initial request — no re-acquire
    expect(navigator.wakeLock.request).toHaveBeenCalledTimes(1)
  })
})

// ── Unsupported browser ──────────────────────────────────────────────────────

describe('useWakeLock - unsupported browser', () => {
  beforeEach(() => {
    // Start with no wakeLock on navigator
    removeWakeLock()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('detects browser support as false when wakeLock absent', () => {
    const { result } = renderHook(() => useWakeLock())
    expect(result.current.state.isSupported).toBe(false)
  })

  it('returns false with "Wake Lock not supported" error on request', async () => {
    const { result } = renderHook(() => useWakeLock())

    let success: boolean
    await act(async () => { success = await result.current.request() })

    expect(success!).toBe(false)
    expect(result.current.state.isActive).toBe(false)
    expect(result.current.state.error).toBe('Wake Lock not supported')
  })
})
