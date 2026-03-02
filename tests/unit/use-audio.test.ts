import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAudio } from '@/hooks/use-audio'

// --- Mock Web Audio API ---
const createMockAudioBuffer = () => ({} as AudioBuffer)

const createMockBufferSource = () => {
  const source = {
    buffer: null as AudioBuffer | null,
    onended: null as (() => void) | null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn().mockImplementation(function (this: typeof source) {
      // Fire onended asynchronously to simulate playback completing
      setTimeout(() => { this.onended?.() }, 10)
    }),
    stop: vi.fn(),
  }
  return source
}

const createMockAudioContext = () => ({
  state: 'running' as AudioContextState,
  destination: {},
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  createBuffer: vi.fn().mockReturnValue(createMockAudioBuffer()),
  createBufferSource: vi.fn().mockImplementation(() => createMockBufferSource()),
  decodeAudioData: vi.fn().mockResolvedValue(createMockAudioBuffer()),
})

type MockAudioContext = ReturnType<typeof createMockAudioContext>
let mockAudioContextInstance: MockAudioContext

// Mock fetch for audio file loading
const mockFetch = vi.fn().mockResolvedValue({
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
} as unknown as Response)

describe('useAudio', () => {
  beforeEach(() => {
    mockAudioContextInstance = createMockAudioContext()

    // Mock AudioContext constructor — must use function (not arrow) to support `new`
    vi.stubGlobal('AudioContext', vi.fn(function() { return mockAudioContextInstance }))
    vi.stubGlobal('fetch', mockFetch)

    // Mock localStorage
    const store: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, val: string) => { store[key] = val }),
      removeItem: vi.fn((key: string) => { delete store[key] }),
      clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useAudio())

    expect(result.current.isMuted).toBe(false)
    expect(result.current.isLoaded).toBe(false)
  })

  it('detects audio API support', () => {
    const { result } = renderHook(() => useAudio())
    expect(result.current.canPlayAudio).toBeDefined()
  })

  it('toggles mute state', () => {
    const { result } = renderHook(() => useAudio())

    act(() => { result.current.toggleMute() })
    expect(result.current.isMuted).toBe(true)

    act(() => { result.current.toggleMute() })
    expect(result.current.isMuted).toBe(false)
  })

  it('persists mute preference to localStorage', () => {
    const { result } = renderHook(() => useAudio())

    act(() => { result.current.toggleMute() })

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'mango-reminder-audio-muted',
      'true'
    )
  })

  it('loads mute preference from localStorage on init', () => {
    localStorage.setItem('mango-reminder-audio-muted', 'true')

    const { result } = renderHook(() => useAudio())
    expect(result.current.isMuted).toBe(true)
  })

  it('does not play when muted', async () => {
    const { result } = renderHook(() => useAudio())

    // Mute first
    act(() => { result.current.toggleMute() })

    act(() => { result.current.play('halfway') })

    expect(mockAudioContextInstance.createBufferSource).not.toHaveBeenCalled()
  })

  it('does not play when audio not unlocked', () => {
    // No user gesture = not unlocked
    const { result } = renderHook(() => useAudio())

    act(() => { result.current.play('celebration') })

    expect(mockAudioContextInstance.createBufferSource).not.toHaveBeenCalled()
  })

  it('stop does not throw when nothing is playing', () => {
    const { result } = renderHook(() => useAudio())

    expect(() => {
      act(() => { result.current.stop() })
    }).not.toThrow()
  })

  it('preloads audio files when unlocked', async () => {
    // Simulate audio already unlocked via localStorage
    localStorage.setItem('mango-reminder-audio-permission', 'true')

    renderHook(() => useAudio({ preload: true }))

    // Wait for: canPlayAudio effect → preload effect → async fetch calls
    await act(async () => {
      await new Promise(r => setTimeout(r, 50))
    })

    expect(mockFetch).toHaveBeenCalled()
  })

  it('skips preload when preload option is false', async () => {
    localStorage.setItem('mango-reminder-audio-permission', 'true')

    await act(async () => {
      renderHook(() => useAudio({ preload: false }))
      await new Promise(r => setTimeout(r, 0))
    })

    expect(mockFetch).not.toHaveBeenCalled()
  })
})

describe('useAudio - AudioContext unavailable', () => {
  beforeEach(() => {
    // Remove AudioContext to simulate unsupported environment
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('fetch', vi.fn())

    const store: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, val: string) => { store[key] = val }),
      removeItem: vi.fn(),
      clear: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reports canPlayAudio as false when AudioContext unavailable', () => {
    const { result } = renderHook(() => useAudio())
    expect(result.current.canPlayAudio).toBe(false)
  })

  it('play does not throw when audio unsupported', () => {
    const { result } = renderHook(() => useAudio())

    expect(() => {
      act(() => { result.current.play('halfway') })
    }).not.toThrow()
  })
})
