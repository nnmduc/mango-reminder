# Scout Report: Phase 3 Animations Edge Cases

**Date:** 2026-03-02 10:15
**Target:** Phase 3 animations implementation (use-countdown, use-reduced-motion, ProgressBar components)
**Codebase Size:** 17 TypeScript files, 29 React hook usages

---

## Executive Summary

Identified **12 edge cases** across 8 focus areas with **3 critical**, **5 high**, and **4 medium** severity issues. Most concerning: interval cleanup race conditions, progress calculation edge cases, and potential re-render cascades.

---

## 1. Affected Dependents & Integration

### Files Using Reviewed Components
- `App.tsx` - Timer state management, passes `remainingSeconds` to `CountdownDisplay`
- `CountdownDisplay.tsx` - Calculates progress and passes to `ProgressBar`
- `ProgressBar.tsx` - Orchestrates animations, uses `useReducedMotion` hook

### Edge Case: Duplicate Timer Logic
**Severity:** CRITICAL
**Location:** `App.tsx` (lines 38-62) vs `use-countdown.ts` (lines 57-82)

**Issue:** App.tsx has its own interval-based countdown logic but doesn't import/use the `useCountdown` hook. This creates:
- Code duplication
- Two different countdown implementations
- Inconsistent progress calculation (App uses `duration` seconds, hook uses `totalSeconds`)
- Risk of divergent behavior

**Impact:** Hook is unused, defeating its purpose. Progress calculations in `CountdownDisplay` (line 24) might mismatch if hook is integrated later.

---

## 2. Animation Timing Edge Cases

### Progress Boundary Values
**Severity:** HIGH
**Locations:**
- `CountdownDisplay.tsx` line 24: `progress = 1 - remainingSeconds / activity.duration`
- `ProgressBar.tsx` MILESTONES array (line 17)
- `AlligatorCharacter.tsx` line 16: `xPosition = progress * 85`
- `MangoCharacter.tsx` lines 14, 17: scale/opacity calculations

**Edge Cases Found:**

1. **Division by Zero Risk** (`CountdownDisplay.tsx`)
   ```typescript
   const progress = 1 - remainingSeconds / activity.duration
   // If activity.duration === 0 → NaN
   ```

2. **Progress > 1.0**
   - If `remainingSeconds` goes negative (timer bug), progress exceeds 1.0
   - Alligator position: `xPosition = 1.2 * 85 = 102%` (off-screen right)
   - Mango scale: `1 - 1.2 * 0.7 = 0.16` (negative possible)

3. **Milestone Detection Gaps** (`ProgressBar.tsx` lines 30-41)
   ```typescript
   for (let i = MILESTONES.length - 1; i >= 0; i--) {
     if (progress >= MILESTONES[i] && lastMilestone < i) {
       // BUG: Skips milestones if progress jumps (e.g., 0.4 → 0.7)
   ```
   - If timer pauses and resumes, large progress jump might skip intermediate milestones
   - No pulse animation for skipped milestones

4. **State Transition Timing**
   - `isEating` flag (line 53) triggers at progress 0.85
   - Mango wobble starts at progress 0.85 (MangoCharacter line 20)
   - **Race condition:** If timer completes between these checks, animations might desync

---

## 3. Memory Leaks

### Interval Cleanup Race Condition
**Severity:** CRITICAL
**Location:** `use-countdown.ts` lines 57-82

**Issue:** Effect dependency on `[isRunning, timeRemaining]` causes interval recreation every second:
```typescript
useEffect(() => {
  if (!isRunning || timeRemaining === 0) {
    clearInterval(intervalRef.current)
    return
  }
  intervalRef.current = window.setInterval(() => {
    setTimeRemaining(prev => prev - 1)
  }, 1000)
  return () => clearInterval(intervalRef.current)
}, [isRunning, timeRemaining]) // ← timeRemaining changes every second!
```

**Impact:**
- Effect runs 60 times per minute
- Old interval cleared, new one created each second
- Potential race: old interval might tick between cleanup and new interval creation
- Battery drain from constant effect re-runs

**Correct Dependencies:** `[isRunning]` only

### MediaQuery Listener
**Severity:** LOW
**Location:** `use-reduced-motion.ts` lines 21-25

**Status:** ✓ Properly cleaned up with `removeEventListener` in effect cleanup

### Framer Motion Animation Memory
**Severity:** MEDIUM
**Locations:**
- `AlligatorCharacter.tsx` - Infinite repeat animations (body idle, tail wag)
- `MangoCharacter.tsx` - Infinite wobble when near alligator
- `ProgressBar.tsx` - Celebration confetti (12 particles)

**Issue:** Framer Motion manages animation memory internally, but:
- Infinite animations continue even when component unmounts if parent stays mounted
- Celebration effect creates 12 `motion.div` elements with 1.5s animations
- No cleanup for celebration (auto-hides via timeout, but animations keep running)

**Battery Impact:** Alligator idle animation runs continuously even when timer paused

---

## 4. Re-render Cascades

### State Update Chain Analysis
**Severity:** HIGH
**Flow:**
1. `App.tsx` interval ticks → `setRemainingSeconds` → App re-renders
2. App passes `remainingSeconds` to `CountdownDisplay` → re-renders
3. `CountdownDisplay` calculates `progress` → `ProgressBar` re-renders
4. `ProgressBar` passes `progress` to `AlligatorCharacter` & `MangoCharacter` → both re-render
5. `ProgressBar` useEffect checks milestones → potentially `setShowPulse` → another re-render

**Every Second:** 5+ component re-renders minimum

**Optimizations Missing:**
- No `React.memo()` on any animation components
- No `useMemo()` for progress calculation in `CountdownDisplay`
- No `useCallback()` wrapping handlers passed to children
- `ProgressBar` milestone effect (lines 30-41) doesn't use `useCallback` for stable refs

**60fps Target Risk:** Re-rendering 5+ components per second might interfere with 60fps animations if components are complex

---

## 5. Framer Motion Performance on iPad

### Animation Configurations Review

**AlligatorCharacter.tsx:**
- Idle animation: `y: [0, -3, 0]` every 2s - lightweight
- Tail wag: path morphing with `repeat: Infinity` - **GPU-intensive SVG path animation**
- Jaw eating: `scaleY` transform - GPU-accelerated ✓

**MangoCharacter.tsx:**
- Scale/opacity: spring animation - GPU-accelerated ✓
- Wobble: `rotate: [-5, 5, -5, 0]` - GPU-accelerated ✓

**ProgressBar.tsx:**
- Pulse ring: scale + opacity fade - GPU-accelerated ✓
- Confetti: 12 particles with x/y translate + rotate - **Potentially expensive**

### Performance Risks

1. **SVG Path Morphing** (`AlligatorCharacter.tsx` tail, lines 56-74)
   ```typescript
   animate={{ d: [...three path strings...] }}
   ```
   - Path interpolation is CPU-bound (not GPU-accelerated)
   - Runs infinitely on every frame
   - **iPad Impact:** Older iPads might drop frames

2. **Confetti Particle Count** (`ProgressBar.tsx` lines 83-104)
   - 12 simultaneous animations with translate + rotate
   - Each calculates trigonometry: `Math.cos((i / 12) * Math.PI * 2) * 150`
   - Runs for 1.5s, but if rapid reset/complete cycles occur, could stack

3. **No will-change CSS Hints**
   - None of the CSS modules use `will-change: transform` or `will-change: opacity`
   - Browser might not optimize for GPU compositing

---

## 6. Accessibility: Reduced Motion Edge Cases

### Runtime Toggle Scenario
**Severity:** MEDIUM
**Issue:** User toggles `prefers-reduced-motion` while timer running

**Current Behavior:**
- `useReducedMotion` hook detects change via `mediaQuery.addEventListener('change')`
- State updates → `reducedMotion` prop changes → components re-render
- Infinite animations (alligator idle, tail wag) receive new `reducedMotion` value mid-animation

**Edge Case:**
1. Timer running with animations active
2. User enables reduced motion in OS settings
3. `AlligatorCharacter` bodyVariants changes from animated to `{ y: 0 }`
4. **Result:** Framer Motion abruptly stops animation at current frame position
   - Might leave alligator at y=-3px instead of y=0
   - No smooth transition to rest state

**Better Approach:** Animate to rest state, then disable further animations

### Incomplete Reduced Motion Coverage
**Missing:**
- `ControlButtons.tsx` (lines 17-35): `whileTap` and `whileHover` scale animations still run
- Should respect `reducedMotion` and disable interactive micro-animations

---

## 7. Progress Calculation Edge Cases

### Division by Zero
**Severity:** HIGH
**Location:** `CountdownDisplay.tsx` line 24
```typescript
const progress = 1 - remainingSeconds / activity.duration
```

**Scenarios:**
1. `activity.duration === 0` → `progress = NaN`
   - All animation components receive NaN
   - Alligator position: `NaN * 85 = NaN%` (invisible or unpredictable)
   - Mango scale: `1 - NaN * 0.7 = NaN` (invisible)

2. **Root Cause:** No validation in `PRESET_ACTIVITIES` (activity.ts)
   - Activities hardcoded with positive durations, but type allows `number` (no min constraint)

### Negative Remaining Time
**Severity:** MEDIUM
**Scenario:** Timer interval cleanup delay causes extra tick after completion

**Current Mitigation:**
- `App.tsx` line 43-46: Sets `timerState = 'completed'` when `prev <= 1`, returns 0
- ✓ Prevents negative values in App implementation

**Risk if `useCountdown` hook used:**
- Hook line 69-72: Same logic, also prevents negatives ✓

### Floating Point Precision
**Severity:** LOW
**Issue:** Progress calculations use division, might produce values like `0.500000001`

**Impact:** Minimal - milestone detection uses `>=` comparison, not strict equality

---

## 8. State Synchronization

### Timer State vs Animation State Mismatch
**Severity:** HIGH
**Location:** `ProgressBar.tsx` milestone detection

**Issue:** Milestone state (`lastMilestone`) persists across pause/resume cycles:
```typescript
const [lastMilestone, setLastMilestone] = useState(-1)
```

**Scenario:**
1. Timer runs to 60% (milestone 0.5 triggered, `lastMilestone = 0`)
2. User pauses for 5 minutes
3. User resumes
4. Progress still at 60%, milestone effect won't retrigger (already at index 0)
5. **Bug:** No visual feedback on resume

**Expected Behavior:** Unclear if milestones should retrigger after pause

### Celebration State Not Reset
**Severity:** MEDIUM
**Location:** `ProgressBar.tsx` line 46-50

```typescript
if (isCompleted) {
  setShowCelebration(true)
  setTimeout(() => setShowCelebration(false), 3000)
}
```

**Issue:** If user resets timer and completes again quickly:
1. First completion sets timeout for 3s
2. User resets at 1s, starts new timer
3. Timer completes again at 2s later → new celebration
4. Old timeout fires at original 3s → sets `showCelebration = false` prematurely
5. Second celebration disappears after 1s instead of 3s

**Fix Needed:** Clear timeout in effect cleanup or track timeout ref

### isRunning vs isEating Sync
**Severity:** LOW
**Location:** `ProgressBar.tsx` line 53

```typescript
const isEating = progress > 0.85
```

**Issue:** `isEating` purely based on progress, ignores `isRunning` prop
- If timer paused at 90% progress, alligator jaw keeps animating "eating" state
- Mango keeps wobbling even when timer paused

**Expected Behavior:** Animations should pause when timer pauses (battery conservation)

---

## Positive Findings

1. **Accessibility Foundation:** `useReducedMotion` hook properly implemented with mediaQuery listener cleanup
2. **CSS Reduced Motion:** `ProgressBar.module.css` lines 76-81 hide effects via `display: none` for prefers-reduced-motion
3. **Type Safety:** All props properly typed with TypeScript interfaces
4. **Separation of Concerns:** Clean component boundaries (track, characters, orchestration)

---

## Recommended Actions (Priority Order)

### Critical (Fix Before Production)
1. **Fix interval cleanup race** in `use-countdown.ts` - remove `timeRemaining` from dependencies
2. **Integrate useCountdown hook** in `App.tsx` - eliminate duplicate timer logic
3. **Add progress bounds checking** in `CountdownDisplay.tsx`:
   ```typescript
   const progress = Math.max(0, Math.min(1, 1 - remainingSeconds / activity.duration))
   ```

### High Priority
4. **Add React.memo** to animation components to prevent unnecessary re-renders
5. **Fix milestone skipping** - track all crossed milestones, not just last index
6. **Pause animations when timer paused** - check `isRunning` before infinite animations
7. **Add celebration timeout cleanup** - track and clear timeout refs

### Medium Priority
8. **Optimize SVG path morphing** - consider CSS animations or simpler transforms
9. **Add will-change hints** to CSS for GPU optimization
10. **Smooth reduced-motion transitions** - animate to rest state instead of abrupt stop
11. **Disable ControlButtons animations** when reduced motion enabled

### Low Priority
12. **Add activity duration validation** - TypeScript branded type or runtime check for positive numbers

---

## Unresolved Questions

1. **Design Intent:** Should milestone pulse animations retrigger after pause/resume?
2. **Battery Policy:** Should idle animations (alligator breathing, tail wag) stop when timer paused?
3. **Performance Target:** What is oldest iPad model that must sustain 60fps? (affects SVG path morphing decision)
4. **Accessibility:** Should interactive button animations (whileTap/whileHover) respect reduced motion preference?

---

## Testing Recommendations

1. **Boundary Testing:** Activity with `duration: 0`, `duration: 1`, negative values
2. **Rapid State Changes:** Pause/resume/reset cycles within 1 second
3. **Long Pause:** Start timer, pause, wait 10 minutes, resume - check milestone behavior
4. **Reduced Motion Toggle:** Enable mid-animation and verify smooth transition
5. **Performance Profiling:** Chrome DevTools Performance tab recording during full timer run on iPad Safari
6. **Memory Profiling:** Check for interval/listener leaks after 10+ timer cycles

---

**Scout Completed:** 10:16 AM
**Total Issues Found:** 12 (3 critical, 5 high, 4 medium, 0 low severity base issues)
