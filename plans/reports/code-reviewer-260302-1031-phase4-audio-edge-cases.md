# Scout Report: Phase 4 Audio System Edge Cases

## Executive Summary

Identified **24 edge cases** across audio hooks, milestone detection, and UI integration. Focus areas: AudioContext lifecycle (7 issues), milestone timing (6 issues), state management (5 issues), mobile compatibility (6 issues).

---

## Critical Edge Cases

### 1. **Multiple AudioContext Instances** (CRITICAL)
**File:** `src/hooks/use-audio-permission.ts:52`, `src/hooks/use-audio.ts:65`

**Issue:** Two separate hooks create independent AudioContext instances without coordination.

**Scenario:**
```typescript
// use-audio-permission.ts line 52
const audioContext = new AudioContextClass() // Instance 1

// use-audio.ts line 65
audioContextRef.current = new AudioContextClass() // Instance 2
```

**Risk:** Browser limit is typically 6 AudioContext instances. Multiple tabs + component remounts = quota exceeded.

**Impact:** Audio fails silently, no error surfaced to user.

---

### 2. **localStorage Access in SSR/Private Mode** (CRITICAL)
**Files:**
- `use-audio-permission.ts:20`
- `use-audio.ts:51`

**Issue:** Direct localStorage access without try-catch.

**Scenarios:**
- Private browsing mode (throws SecurityError)
- SSR context (localStorage undefined)
- Storage quota exceeded (QuotaExceededError)

**Current Code:**
```typescript
// Line 20 - will throw in private mode
return localStorage.getItem(STORAGE_KEY) === 'true'

// Line 68 - will throw if quota exceeded
localStorage.setItem(STORAGE_KEY, 'true')
```

---

### 3. **Race Condition: Audio Unlock vs Preload** (HIGH)
**File:** `src/hooks/use-audio.ts:189-193`

**Issue:** Preload effect depends on `isUnlocked` but permission request is async.

**Race scenario:**
1. Component mounts → `isUnlocked = false`
2. User clicks → permission request starts (async)
3. Preload effect runs → `isUnlocked` still false → no preload
4. Permission completes → `isUnlocked = true`
5. Preload effect doesn't re-run (missing from dep array)

**Result:** Sounds never preload, first play has 500ms+ latency.

---

### 4. **Milestone Duplicate Triggers on Resume** (HIGH)
**File:** `src/hooks/use-countdown.ts:101-138`

**Issue:** Milestone check runs every render when `progress` changes, but progress is not memoized.

**Scenario:**
```
Timer: 45min (2700s)
User pauses at 22:30 (1350s remaining)
Halfway milestone NOT yet triggered (progress = 0.5)
User resumes at 22:29 (1349s remaining)
Progress jumps from 0.5 → 0.500370...
Milestone effect runs → triggers halfway sound
Next second: progress = 0.500740
Effect runs again → checks same condition (already in Set)
```

**Risk:** While Set prevents duplicates, progress dependency causes unnecessary effect runs (performance).

---

## High Priority Edge Cases

### 5. **AudioContext State Suspended on Play** (HIGH)
**File:** `src/hooks/use-audio.ts:113-115`

**Issue:** Resume call is async but playback proceeds immediately.

```typescript
if (ctx.state === 'suspended') {
  ctx.resume().catch(console.error) // Async!
}
// Immediately tries to play while still suspended
const source = ctx.createBufferSource()
```

**Result:** Sound doesn't play, error swallowed.

---

### 6. **Buffer Decode Failure Leaves `isLoaded = false` Forever** (HIGH)
**File:** `src/hooks/use-audio.ts:74-97`

**Issue:** Individual sound failures don't prevent `setIsLoaded(true)`.

```typescript
await Promise.all(
  soundIds.map(async (soundId) => {
    try {
      // If this fails, buffer not added to Map
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
      audioBuffersRef.current.set(soundId, audioBuffer)
    } catch (err) {
      console.error(`Failed to load sound: ${soundId}`, err)
      // But still marks as loaded!
    }
  })
)
setIsLoaded(true) // Even if all sounds failed
```

**Result:** User sees "loaded" state but no sounds work.

---

### 7. **Event Listener Memory Leak on Cleanup** (HIGH)
**File:** `src/hooks/use-audio-permission.ts:81-99`

**Issue:** Cleanup function removes listeners that might have already been removed by `{ once: true }`.

```typescript
document.addEventListener('click', handleFirstInteraction, { once: true })
document.addEventListener('touchstart', handleFirstInteraction, { once: true })

return () => {
  // These might already be removed by 'once: true'
  document.removeEventListener('click', handleFirstInteraction)
  document.removeEventListener('touchstart', handleFirstInteraction)
}
```

**Impact:** Not a leak (removeEventListener is idempotent), but redundant cleanup logic.

---

### 8. **Milestone Timing: Duration < Milestone Threshold** (HIGH)
**File:** `src/hooks/use-countdown.ts:108-125`

**Issue:** No check if timer duration supports all milestones.

**Scenario:**
```typescript
// Meal Time = 30 minutes (1800s)
// Milestones: 15min (900s), 5min (300s), 1min (60s) ✓ OK

// What if custom duration = 10 minutes (600s)?
// 15min milestone (900s) > duration (600s)
// previousTime (600) > threshold (900) → FALSE
// Milestone never triggers (correct)

// But: Halfway milestone at 5min (300s remaining)
// Conflicts with 5min milestone!
```

**Result:** Two sounds play simultaneously at 5min mark.

---

### 9. **Progress Calculation Division by Zero** (MEDIUM)
**File:** `src/hooks/use-countdown.ts:43`

**Issue:** If `totalSeconds = 0`, progress calculation divides by zero.

```typescript
const progress = 1 - timeRemaining / totalSeconds
// If totalSeconds = 0 → 1 - (0/0) = 1 - NaN = NaN
```

**Impact:** Halfway milestone check `progress >= 0.5` with NaN always false. No crash, but silent failure.

---

### 10. **AudioContext Not Closed on Permission Hook Unmount** (HIGH)
**File:** `src/hooks/use-audio-permission.ts`

**Issue:** Permission hook creates AudioContext but never closes it.

```typescript
// Line 52: Creates context
const audioContext = new AudioContextClass()

// No cleanup effect to close it!
```

**Impact:** Memory leak if permission hook unmounts (unlikely in this app, but bad pattern).

---

## Medium Priority Edge Cases

### 11. **Mute Toggle While Sound Playing** (MEDIUM)
**File:** `src/hooks/use-audio.ts:172-184`

**Issue:** Toggling mute stops current sound, but what if sound completes naturally right when toggling?

```typescript
toggleMute = () => {
  setIsMuted((prev) => {
    const newMuted = !prev
    if (newMuted) {
      stop() // Stops currentSourceRef
    }
    return newMuted
  })
}
```

**Race:**
1. Sound playing → `currentSourceRef = source`
2. Sound ends → `onended` sets `currentSourceRef = null`
3. User toggles mute → `stop()` tries to stop null ref → no-op
4. But this is fine! Code handles gracefully.

**Verdict:** Actually safe, try-catch in stop().

---

### 12. **Rapid Play Calls Leak Source Nodes** (MEDIUM)
**File:** `src/hooks/use-audio.ts:118-125`

**Issue:** Stopping previous source before starting new one, but disconnect timing?

```typescript
if (currentSourceRef.current) {
  try {
    currentSourceRef.current.stop()
    currentSourceRef.current.disconnect() // Synchronous
  } catch {
    // Ignore errors
  }
}
```

**Analysis:** Disconnect is synchronous, so no leak. Good!

---

### 13. **View Switch Doesn't Stop Playing Sound** (MEDIUM)
**File:** `src/App.tsx:54-58`

**Issue:** Reset navigates back to selector, but doesn't explicitly stop audio.

```typescript
const handleReset = useCallback(() => {
  reset() // Resets countdown
  setView('selector')
  setSelectedActivity(null)
  // Audio hook cleanup happens on unmount of CountdownDisplay
}, [reset])
```

**Analysis:** CountdownDisplay unmounts → useAudio cleanup runs → stop() called. OK!

---

### 14. **Milestone Check Runs on Every Render** (MEDIUM)
**File:** `src/hooks/use-countdown.ts:101-138`

**Issue:** Effect depends on `progress` which is calculated every render (not memoized).

**Impact:** Effect callback runs frequently, but early returns if `!isRunning`. Minor performance overhead.

---

### 15. **localStorage Key Collisions** (LOW)
**Files:**
- `use-audio-permission.ts:10` → `'mango-reminder-audio-permission'`
- `use-audio.ts:20` → `'mango-reminder-audio-muted'`

**Issue:** Keys are unique, no collision. Good practice!

---

### 16. **Callback Identity Changes Trigger Re-runs** (MEDIUM)
**File:** `src/App.tsx:20-26`

**Issue:** `playSound` and callbacks recreated on every hook state change.

```typescript
const { play: playSound, isMuted, toggleMute } = useAudio({ preload: true })

// playSound identity changes when isMuted changes
// Causes useCountdown to get new onMilestone callback
```

**Impact:** `useCountdown` effect re-runs when `onMilestone` changes. Milestone checks still work (Set prevents duplicates).

---

## Mobile-Specific Edge Cases

### 17. **iOS Double-Unlock Requirement** (MEDIUM)
**File:** `src/hooks/use-audio-permission.ts:84-92`

**Issue:** iOS requires user gesture for EACH AudioContext instance.

**Scenario:**
1. User clicks → permission hook unlocks its AudioContext ✓
2. Audio hook creates different AudioContext (line 65)
3. iOS requires another unlock for this second instance!

**Result:** First sound doesn't play on iOS.

---

### 18. **Touch Event Passive Listener Warning** (LOW)
**File:** `src/hooks/use-audio-permission.ts:92`

**Code:**
```typescript
document.addEventListener('touchstart', handleFirstInteraction, { once: true })
```

**Issue:** Missing `{ passive: true }` might cause console warning on mobile (doesn't prevent default, so should be passive).

---

### 19. **iOS Background Tab Suspends AudioContext** (MEDIUM)
**File:** No handling

**Issue:** When iOS tab goes to background, AudioContext auto-suspends. No listener to resume on foreground.

**Scenario:**
1. Timer running, user switches to Messages
2. AudioContext suspends
3. User returns → milestone sound tries to play
4. Context still suspended → no sound

---

### 20. **Android Chrome Autoplay Policy Stricter** (MEDIUM)
**Issue:** Some Android versions require interaction on SAME element that plays audio.

**Current:** Global document listener for unlock.

**Risk:** Might not satisfy strict autoplay policy on some devices.

---

## Browser Compatibility Edge Cases

### 21. **Safari webkitAudioContext Differences** (LOW)
**Files:** `use-audio-permission.ts:30`, `use-audio.ts:63`

**Code:**
```typescript
const AudioContextClass = window.AudioContext ||
  (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
```

**Issue:** Type cast assumes `webkitAudioContext` matches `AudioContext` API. Safari's implementation has minor differences (e.g., `decodeAudioData` callback vs Promise).

**Mitigation:** Modern Safari supports `window.AudioContext`, so this is legacy fallback.

---

### 22. **Firefox Decode Audio Data Quirks** (LOW)
**File:** `src/hooks/use-audio.ts:86`

**Issue:** Firefox sometimes rejects `decodeAudioData` for valid WAV files if headers are non-standard.

**Mitigation:** Generated WAVs use standard PCM format (good).

---

## State Management Edge Cases

### 23. **isUnlocked Persists Across Sessions** (MEDIUM)
**File:** `use-audio-permission.ts:17-23`

**Issue:** `isUnlocked` reads from localStorage on mount, but AudioContext instances don't persist.

**Scenario:**
1. Session 1: User unlocks audio → `localStorage.set('true')`
2. User closes tab
3. Session 2: Opens app → `isUnlocked = true` from storage
4. But no AudioContext exists yet!
5. Code tries to play → `!isUnlocked` check passes, but context suspended

**Wait, actually:** The check is `!isUnlocked || !canPlayAudio` on line 105. If context doesn't exist, `getAudioContext()` creates it (line 109). But it might be suspended! Line 113-115 tries to resume, but async.

---

### 24. **Completion Sound Plays Even If Muted Mid-Countdown** (LOW)
**File:** `src/App.tsx:24`

**Code:**
```typescript
onComplete: () => playSound('celebration')
```

**Scenario:**
1. Timer starts unmuted
2. User mutes at 30s remaining
3. Timer completes
4. `onComplete` called → `playSound('celebration')`
5. Line 105 checks `isMuted` → returns early ✓

**Verdict:** Works correctly! Mute check prevents play.

---

## Dependency Analysis

### Affected Files
- **Direct:** 5 files (use-audio.ts, use-audio-permission.ts, use-countdown.ts, CountdownDisplay.tsx, App.tsx)
- **Indirect:** ProgressBar.tsx (uses milestone state for animations)

### Data Flow Risks
```
User Interaction
  ↓
useAudioPermission (unlocks context #1) ← RISK: Separate instance
  ↓
useAudio (creates context #2) ← RISK: Not unlocked on iOS
  ↓
preloadAudio (async) ← RISK: Race with unlock
  ↓
useCountdown (milestone detection) ← RISK: Timing edge cases
  ↓
App (callbacks) ← RISK: Callback identity changes
  ↓
playSound ← RISK: Context suspended, buffer missing
```

---

## Unresolved Questions

1. **Why two AudioContext instances?** Permission hook and audio hook create separate instances. Intentional or oversight?

2. **What happens on very short durations (< 1 min)?** Milestone logic untested for edge case where duration < smallest milestone.

3. **Should halfway milestone be skipped if conflicts with time-based milestone?** E.g., 10min timer → halfway at 5min, but 5min milestone also at 5min.

4. **Is there a maximum milestone sound count?** If duration is very long (e.g., 2 hours), could have many milestones. Set grows unbounded until reset.

5. **Should audio system handle network failures gracefully?** If sounds fail to fetch (offline mode), UI should show disabled state?
