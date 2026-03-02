# Phase 5: Screen Wake Lock

## Context Links

- [Screen Wake Lock Report](../reports/researcher-260302-0846-screen-wake-lock.md)
- [Main Plan](./plan.md)
- [Phase 4: Audio System](./phase-04-audio-system.md)

## Overview

**Priority:** P1 - Critical
**Status:** completed
**Description:** Implement Screen Wake Lock API to prevent screen sleep during countdown on iPad

## Key Insights

From Wake Lock Research:
- Screen Wake Lock API supported on iOS Safari 16.4+ (94% global coverage)
- Requires HTTPS/secure context
- Must re-acquire lock on visibility change (tab switch)
- System can reject (low battery, power-save mode)
- User gesture required to activate

## Requirements

### Functional
- Screen stays awake during active countdown
- Release wake lock when timer paused or completed
- Re-acquire lock when returning from background
- Show UI indicator of wake lock status
- Graceful fallback for unsupported browsers

### Non-Functional
- Wake lock acquired within 100ms of timer start
- Zero impact on countdown accuracy
- Minimal battery drain increase

## Architecture

```
src/
  hooks/
    useWakeLock.ts           # Wake Lock API wrapper
  components/
    WakeLockIndicator/
      WakeLockIndicator.tsx  # Status indicator
      WakeLockIndicator.module.css
```

## Related Code Files

### Create
- `src/hooks/useWakeLock.ts`
- `src/components/WakeLockIndicator/WakeLockIndicator.tsx`
- `src/components/WakeLockIndicator/WakeLockIndicator.module.css`

### Modify
- `src/components/CountdownDisplay/CountdownDisplay.tsx` - Integrate wake lock

## Implementation Steps

1. **Create useWakeLock hook**
   ```typescript
   interface WakeLockState {
     isSupported: boolean
     isActive: boolean
     error: string | null
   }

   interface UseWakeLockReturn {
     state: WakeLockState
     request: () => Promise<boolean>
     release: () => Promise<void>
   }

   function useWakeLock(): UseWakeLockReturn
   ```

2. **Implement Wake Lock API wrapper**
   ```typescript
   function useWakeLock(): UseWakeLockReturn {
     const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)
     const [state, setState] = useState<WakeLockState>({
       isSupported: 'wakeLock' in navigator,
       isActive: false,
       error: null,
     })

     const request = useCallback(async () => {
       if (!('wakeLock' in navigator)) {
         setState(s => ({ ...s, error: 'Wake Lock not supported' }))
         return false
       }

       try {
         const lock = await navigator.wakeLock.request('screen')
         setWakeLock(lock)
         setState(s => ({ ...s, isActive: true, error: null }))

         lock.addEventListener('release', () => {
           setState(s => ({ ...s, isActive: false }))
         })

         return true
       } catch (err) {
         setState(s => ({
           ...s,
           isActive: false,
           error: err instanceof Error ? err.message : 'Wake lock failed',
         }))
         return false
       }
     }, [])

     const release = useCallback(async () => {
       if (wakeLock) {
         await wakeLock.release()
         setWakeLock(null)
         setState(s => ({ ...s, isActive: false }))
       }
     }, [wakeLock])

     return { state, request, release }
   }
   ```

3. **Handle visibility changes**
   ```typescript
   useEffect(() => {
     const handleVisibilityChange = async () => {
       if (document.visibilityState === 'visible' && shouldBeActive) {
         await request()
       }
     }

     document.addEventListener('visibilitychange', handleVisibilityChange)
     return () => {
       document.removeEventListener('visibilitychange', handleVisibilityChange)
     }
   }, [request, shouldBeActive])
   ```

4. **Create WakeLockIndicator component**
   ```tsx
   interface WakeLockIndicatorProps {
     isActive: boolean
     isSupported: boolean
     error: string | null
   }
   ```
   - Small icon in corner (sun/screen icon)
   - Green when active, gray when inactive
   - Red with tooltip when error/unsupported
   - Non-intrusive, subtle design

5. **Integrate with CountdownDisplay**
   ```typescript
   // In CountdownDisplay
   const { state: wakeLockState, request, release } = useWakeLock()

   // Request wake lock when timer starts
   useEffect(() => {
     if (isRunning && !isPaused) {
       request()
     } else {
       release()
     }
   }, [isRunning, isPaused, request, release])
   ```

6. **Implement fallback for unsupported browsers**
   - Display friendly message: "Keep screen manual in Settings"
   - Consider fullscreen mode as partial mitigation
   - Log to analytics for monitoring

7. **Add TypeScript declarations**
   ```typescript
   // src/types/wake-lock.d.ts
   interface WakeLockSentinel extends EventTarget {
     readonly released: boolean
     readonly type: 'screen'
     release(): Promise<void>
   }

   interface Navigator {
     wakeLock: {
       request(type: 'screen'): Promise<WakeLockSentinel>
     }
   }
   ```

## Todo List

- [ ] Create TypeScript declarations for Wake Lock API
- [ ] Create useWakeLock hook
- [ ] Implement request/release functions
- [ ] Handle visibility change (re-acquire on return)
- [ ] Handle system rejections gracefully
- [ ] Create WakeLockIndicator component
- [ ] Integrate wake lock with countdown start/stop
- [ ] Release wake lock on timer complete/pause
- [ ] Add fallback UI for unsupported browsers
- [ ] Test on iPad Safari 16.4+
- [ ] Test visibility change scenarios
- [ ] Test low battery behavior

## Success Criteria

- Screen stays awake during active countdown
- Wake lock releases when timer paused or complete
- Re-acquires lock when returning from background
- Status indicator shows current state
- Graceful message for unsupported browsers
- No console errors in Safari

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| iOS < 16.4 not supported | Show fallback message with instructions |
| System rejects (low battery) | Handle error, show UI feedback |
| Lock lost on tab switch | Re-acquire on visibilitychange |
| API changes in future Safari | Abstract behind hook, easy to update |

## Security Considerations

- HTTPS required (Vercel provides)
- No permissions prompt needed (implicit consent on use)
- Wake lock auto-releases when tab closes

## Next Steps

After completion, proceed to [Phase 6: PWA Setup](./phase-06-pwa-setup.md)
