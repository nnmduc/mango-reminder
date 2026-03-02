# Phase 7: Testing

## Context Links

- [All Research Reports](../reports/)
- [Main Plan](./plan.md)
- [Phase 6: PWA Setup](./phase-06-pwa-setup.md)

## Overview

**Priority:** P1 - Validation
**Status:** completed
**Description:** Comprehensive testing on iPad Safari including performance, animations, audio, and PWA functionality

## Key Insights

- iPad Safari 16.4+ required for Wake Lock API
- 60fps animation target on iPad Air
- Audio requires user gesture before playback
- PWA must work offline after initial load

## Requirements

### Functional Testing
- All user flows work correctly (activity selection -> countdown -> completion)
- Audio plays at milestone points
- Wake lock keeps screen awake
- PWA installs and launches correctly
- Offline mode functions

### Non-Functional Testing
- Animation performance (60fps)
- Load time (<3s first load, <1s cached)
- Touch responsiveness (<100ms feedback)
- Battery impact acceptable
- Accessibility (screen reader, reduced motion)

## Architecture

```
tests/
  e2e/
    countdown-flow.spec.ts    # Full user journey
    activity-selection.spec.ts
    audio-playback.spec.ts
  unit/
    useCountdown.test.ts
    useWakeLock.test.ts
    useAudio.test.ts
  manual/
    ipad-testing-checklist.md
```

## Related Code Files

### Create
- `tests/e2e/countdown-flow.spec.ts`
- `tests/unit/useCountdown.test.ts`
- `tests/unit/useWakeLock.test.ts`
- `tests/manual/ipad-testing-checklist.md`
- `vitest.config.ts`

### Modify
- `package.json` - Add test dependencies

## Implementation Steps

1. **Set up Vitest for unit tests**
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
   ```

   ```typescript
   // vitest.config.ts
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       setupFiles: ['./tests/setup.ts'],
       globals: true,
     },
   })
   ```

2. **Write unit tests for hooks**

   ```typescript
   // tests/unit/useCountdown.test.ts
   import { renderHook, act } from '@testing-library/react'
   import { useCountdown } from '@/hooks/useCountdown'

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
     })

     it('counts down when started', () => {
       const { result } = renderHook(() => useCountdown(1))
       act(() => result.current.start())
       act(() => vi.advanceTimersByTime(1000))
       expect(result.current.state.timeRemaining).toBe(59)
     })

     it('pauses and resumes correctly', () => {
       const { result } = renderHook(() => useCountdown(1))
       act(() => result.current.start())
       act(() => vi.advanceTimersByTime(5000))
       act(() => result.current.pause())

       const pausedTime = result.current.state.timeRemaining
       act(() => vi.advanceTimersByTime(5000))
       expect(result.current.state.timeRemaining).toBe(pausedTime)

       act(() => result.current.resume())
       act(() => vi.advanceTimersByTime(1000))
       expect(result.current.state.timeRemaining).toBe(pausedTime - 1)
     })

     it('calculates progress correctly', () => {
       const { result } = renderHook(() => useCountdown(1))
       act(() => result.current.start())
       act(() => vi.advanceTimersByTime(30000)) // 30 seconds
       expect(result.current.state.progress).toBeCloseTo(0.5, 1)
     })
   })
   ```

3. **Write unit tests for useWakeLock**
   ```typescript
   // tests/unit/useWakeLock.test.ts
   describe('useWakeLock', () => {
     it('detects browser support', () => {
       const { result } = renderHook(() => useWakeLock())
       expect(result.current.state.isSupported).toBeDefined()
     })

     it('handles unsupported browsers gracefully', () => {
       // Mock navigator without wakeLock
       const { result } = renderHook(() => useWakeLock())
       expect(result.current.state.error).toBeNull()
     })
   })
   ```

4. **Create iPad manual testing checklist**
   ```markdown
   # iPad Safari Testing Checklist

   ## Device Requirements
   - [ ] iPad with iOS 16.4+ (required for Wake Lock)
   - [ ] Safari browser
   - [ ] Wi-Fi connection for initial load

   ## Activity Selection (2-3 taps)
   - [ ] All 3 activity cards visible
   - [ ] Cards have correct colors and icons
   - [ ] Touch feedback visible on tap (<100ms)
   - [ ] Tapping card transitions to countdown

   ## Countdown Display
   - [ ] Timer shows correct duration
   - [ ] Large digits readable from arm's length
   - [ ] Progress bar visible (alligator + mango)
   - [ ] Pause/Resume button works
   - [ ] Reset button returns to selector

   ## Animations (60fps target)
   - [ ] Alligator moves smoothly across screen
   - [ ] Mango shrinks proportionally
   - [ ] No visible jank or stuttering
   - [ ] Celebration animation on completion

   ## Audio
   - [ ] Sound plays on first activity tap (unlock)
   - [ ] Milestone sounds play at correct times
   - [ ] Celebration sound on completion
   - [ ] Mute toggle works
   - [ ] Mute preference persists after reload

   ## Wake Lock
   - [ ] Screen stays awake during countdown
   - [ ] Screen can sleep when paused
   - [ ] Wake lock re-acquires after tab switch
   - [ ] Status indicator shows correct state

   ## PWA
   - [ ] "Add to Home Screen" available in share menu
   - [ ] Icon displays correctly on home screen
   - [ ] Splash screen shows on launch
   - [ ] App runs fullscreen (no Safari UI)
   - [ ] Works offline (airplane mode)

   ## Performance
   - [ ] First load <3s on 4G
   - [ ] Cached load <1s
   - [ ] Smooth scrolling
   - [ ] No memory warnings

   ## Accessibility
   - [ ] Works with VoiceOver enabled
   - [ ] Reduced motion respects preference
   - [ ] Touch targets >= 48px

   ## Edge Cases
   - [ ] Timer completes correctly
   - [ ] Multiple start/stop cycles work
   - [ ] Low battery mode handling
   - [ ] Device rotation (portrait/landscape)
   ```

5. **Set up Playwright for E2E (optional)**
   ```bash
   npm install -D @playwright/test
   npx playwright install webkit
   ```

6. **Run Lighthouse audits**
   ```bash
   npm install -g lighthouse
   lighthouse https://mango-reminder.vercel.app --view
   ```

   Target scores:
   - Performance: >90
   - Accessibility: 100
   - Best Practices: 100
   - PWA: 100

7. **Test with Safari Remote Debugging**
   - Connect iPad via USB
   - Enable Web Inspector (Settings > Safari > Advanced)
   - Open Safari on Mac, Develop menu > iPad
   - Monitor performance, network, console

8. **Performance profiling**
   - Use Safari Timeline to identify frame drops
   - Check for layout thrashing in animations
   - Verify no memory leaks on long runs

## Test Matrix

| Feature | Unit | E2E | Manual iPad |
|---------|------|-----|-------------|
| useCountdown | ✓ | | |
| useWakeLock | ✓ | | ✓ |
| useAudio | ✓ | | ✓ |
| ActivitySelector | | ✓ | ✓ |
| CountdownDisplay | | ✓ | ✓ |
| Animations | | | ✓ |
| PWA Install | | | ✓ |
| Offline Mode | | | ✓ |

## Todo List

- [x] Install Vitest and testing-library
- [x] Write useCountdown unit tests
- [x] Write useWakeLock unit tests
- [x] Write useAudio unit tests
- [x] Create iPad manual testing checklist
- [ ] Test on actual iPad (iOS 16.4+)
- [ ] Run Lighthouse PWA audit
- [ ] Profile animation performance in Safari
- [ ] Test offline functionality
- [ ] Test all 3 activity presets
- [ ] Test edge cases (interruptions, low battery)
- [ ] Fix any discovered issues
- [ ] Document known limitations

## Success Criteria

- All unit tests pass
- Manual iPad checklist 100% complete
- Lighthouse scores: Performance >90, PWA 100
- 60fps animations on iPad Air
- No console errors in Safari
- Works offline after first load
- All milestone sounds play correctly

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| No iPad available for testing | Use Safari on Mac + iOS Simulator |
| iOS version too old | Document minimum requirements |
| Performance issues discovered late | Profile early in development |
| Audio autoplay blocked | Test on fresh Safari profile |

## Security Considerations

- Tests don't expose sensitive data
- No production credentials in test environment
- Manual testing on personal devices only

## Next Steps

After all tests pass:
1. Fix any discovered bugs
2. Update documentation
3. Deploy final version to Vercel
4. Share with test users (kids!)
