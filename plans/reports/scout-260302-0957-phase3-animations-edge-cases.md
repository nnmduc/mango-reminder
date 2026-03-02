# Scout Report: Phase 3 Animations Edge Cases

**Date:** 2026-03-02
**Scope:** Animation implementation edge cases and potential issues
**Files Analyzed:** 7 animation-related files + 3 dependent files

## Critical Edge Cases Discovered

### 1. **Duplicate Timer Logic - Data Flow Conflict**

**Issue:** Two separate timer implementations running in parallel
- `App.tsx` (lines 39-62): Primary timer using `useEffect` + `intervalRef`
- `useCountdown.ts` (lines 58-82): Secondary timer logic (UNUSED)

**Impact:**
- `useCountdown` hook is NOT imported/used anywhere in codebase
- All animation components receive `progress` calculated in `CountdownDisplay.tsx` line 24
- Hook was created but never integrated into actual app flow

**Risk:** Medium - Wasted code, potential future confusion

---

### 2. **Memory Leak - Milestone State Never Resets**

**File:** `ProgressBar.tsx` (line 25)
**Issue:** `lastMilestone` state persists across timer resets

```typescript
const [lastMilestone, setLastMilestone] = useState(-1)
// Never reset when timer resets!
```

**Scenario:**
1. User runs timer to 50% (milestone 0 triggered)
2. User resets timer
3. User runs timer again to 50%
4. **Milestone 0 does NOT trigger** (lastMilestone still = 0)

**Impact:** High - Broken milestone animations on subsequent runs

---

### 3. **setTimeout Memory Leaks**

**File:** `ProgressBar.tsx` (lines 37, 48)

```typescript
setTimeout(() => setShowPulse(false), 500)     // Line 37 - no cleanup
setTimeout(() => setShowCelebration(false), 3000) // Line 48 - no cleanup
```

**Issue:** If component unmounts before timeout completes:
- State updates on unmounted component
- React warning: "Can't perform a React state update on an unmounted component"

**Scenario:**
1. Timer reaches milestone, showPulse = true
2. User immediately clicks reset (component unmounts)
3. 500ms later, setTimeout tries to setState on dead component

**Impact:** High - Console warnings, potential memory leaks

---

### 4. **Infinite Re-render Risk - useEffect Dependency**

**File:** `ProgressBar.tsx` (lines 30-41)

```typescript
useEffect(() => {
  // ...
}, [progress, isRunning, lastMilestone])
```

**Issue:** `lastMilestone` is in dependency array AND updated inside effect
- Effect runs when `lastMilestone` changes
- Effect updates `lastMilestone` via `setLastMilestone(i)`
- Could trigger effect again (but doesn't due to conditional logic)

**Risk:** Medium - Fragile pattern, one logic error could cause infinite loop

---

### 5. **Boundary Condition - Progress > 1**

**Files:**
- `AlligatorCharacter.tsx` line 16: `xPosition = progress * 85`
- `MangoCharacter.tsx` line 14: `scale = 1 - progress * 0.7`

**Issue:** No validation that `progress` stays in 0-1 range

**Scenario:** If `CountdownDisplay.tsx` line 24 calculates `progress > 1` due to:
- Floating point rounding
- Duration = 0 edge case
- Negative remainingSeconds

**Result:**
- Alligator positioned off-screen (>85%)
- Mango scale becomes negative (inverted/flipped)

**Impact:** Medium - Visual glitches on edge cases

---

### 6. **Division by Zero - Progress Calculation**

**File:** `CountdownDisplay.tsx` line 24

```typescript
const progress = 1 - remainingSeconds / activity.duration
```

**Issue:** If `activity.duration === 0`:
- Division by zero → `NaN`
- `progress = 1 - Infinity = -Infinity` or `NaN`
- All animations break

**Likelihood:** Low (PRESET_ACTIVITIES all have valid durations)
**Impact:** Critical if custom activities added later

---

### 7. **Async Race - Milestone Detection Double-Trigger**

**File:** `ProgressBar.tsx` (lines 30-41)

**Issue:** Effect depends on `progress`, which updates every second

**Scenario:**
1. Progress goes from 0.495 → 0.505 (crosses 0.5 milestone)
2. Effect triggers, sets `lastMilestone = 0`, `showPulse = true`
3. Timeout scheduled for 500ms
4. Before timeout completes, progress updates to 0.51
5. Effect runs AGAIN (progress changed)
6. Loop checks milestones again

**Current Behavior:** Safe (break statement prevents re-trigger)
**Risk:** Medium - If someone removes `break`, double animations

---

### 8. **Reduced Motion - Incomplete Coverage**

**Files:**
- `AlligatorCharacter.tsx`: Properly respects `reducedMotion`
- `MangoCharacter.tsx`: Properly respects `reducedMotion`
- `ProgressBar.tsx`: Pulse/celebration conditionally rendered

**Missing:**
- `ProgressBar.module.css` lines 76-81: CSS media query for `prefers-reduced-motion`
- Duplicate fallback (both CSS + JS check)

**Issue:** CSS animations still run even when `reducedMotion={true}` for:
- `.pulseRing` element (if rendered despite conditional)
- `.confetti` elements

**Impact:** Low - Defense-in-depth missing, but JS conditional prevents render

---

### 9. **SSR/Hydration - useReducedMotion Initial State**

**File:** `useReducedMotion.ts` line 5

```typescript
const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
```

**Issue:** Initial state always `false`, even if user has `prefers-reduced-motion: reduce`

**Scenario (if SSR enabled later):**
1. Server renders with `reducedMotion = false` (animations present)
2. Client hydrates, `useEffect` runs, detects `true`
3. Component re-renders with `reducedMotion = true` (animations removed)
4. Flash of animated content (FOAC)

**Current Impact:** None (no SSR in current Vite setup)
**Future Risk:** Medium if SSR added

---

### 10. **iPad Safari - SVG Transform Performance**

**Files:**
- `AlligatorCharacter.tsx` line 48-50: Inline `style` with `left` percentage
- `MangoCharacter.tsx` line 40-43: Inline `style` with fixed positioning

**Issue:**
- `left: ${xPosition}%` triggers layout recalculation (not GPU accelerated)
- Should use `transform: translateX()` instead

**Performance Impact:**
- Current: Layout shift on every progress update (60 times/minute)
- Target: 60fps on iPad (requires GPU-accelerated transforms only)

**Risk:** High - Violates phase plan requirement "Use transform and opacity only"

---

### 11. **Framer Motion - Re-render on Every Progress Update**

**Files:**
- `AlligatorCharacter.tsx` line 52-53: `animate="idle"` + `variants={bodyVariants}`
- `MangoCharacter.tsx` line 45-49: `animate={{ scale, opacity }}`

**Issue:** `scale` recalculated on every render (progress updates every 1s)

**Current Behavior:**
- Parent `ProgressBar` re-renders every second (progress change)
- Child `MangoCharacter` re-renders (no memoization)
- Framer Motion recalculates animation

**Performance:** Acceptable for 1-second updates
**Risk:** Low - But no `React.memo()` means unnecessary work

---

### 12. **Celebration Confetti - Array Re-creation**

**File:** `ProgressBar.tsx` line 83

```typescript
{[...Array(12)].map((_, i) => (
```

**Issue:** New array created on EVERY render (even when `showCelebration = false`)

**Performance:**
- Minimal (12 elements, short-lived)
- But creates 12 React elements unnecessarily

**Risk:** Low - Micro-optimization opportunity

---

## Data Flow Analysis

```
App.tsx (timer master)
  ├─ intervalRef (1-second ticks)
  ├─ remainingSeconds (state)
  └─ timerState (state)
       ↓
CountdownDisplay.tsx
  ├─ Calculates progress = 1 - remainingSeconds / duration
  └─ Passes to ProgressBar
       ↓
ProgressBar.tsx
  ├─ Milestone detection (useEffect on progress)
  ├─ Celebration trigger (useEffect on isCompleted)
  └─ Passes to characters
       ↓
  ┌────────────────────┬────────────────────┐
  ↓                    ↓                    ↓
AlligatorCharacter   MangoCharacter   ProgressTrack
  (progress → x)     (progress → scale)   (static)
```

**Key Observation:** `useCountdown` hook NOT in data flow (dead code)

---

## Unused Code - Dead Imports

1. **useCountdown Hook**
   - File: `src/hooks/use-countdown.ts` (100 lines)
   - Status: Created but never imported
   - Action: Remove or integrate

2. **CountdownState Interface**
   - Exported but unused
   - App.tsx uses simpler state management

---

## Accessibility Edge Cases

### Reduced Motion Toggling Mid-Animation

**Scenario:**
1. User starts timer with animations enabled
2. Mid-countdown, user enables "Reduce Motion" in system settings
3. `useReducedMotion` hook detects change (line 21)
4. `reducedMotion` prop flips from `false` → `true`

**Current Behavior:**
- Alligator: Idle animation stops (line 20-29 conditional)
- Mango: Wobble stops (line 20 conditional)
- Progress bar: Pulse/celebration respect new state

**Issue:** Animations mid-flight may snap to static state (no graceful transition)

**Impact:** Low - Rare scenario, expected behavior for accessibility

---

## Platform-Specific Risks (iPad Safari)

### 1. Viewport Height Changes
- Safari address bar shows/hides on scroll
- Could affect `overflow: visible` in `.container` (ProgressBar.module.css line 7)

### 2. Touch Events During Animation
- Confetti animation runs for 1.5s (line 100)
- User may tap buttons during celebration
- No pointer-events blocking on confetti layer

### 3. Battery Impact
- Framer Motion runs animations via requestAnimationFrame
- Idle animations (alligator bounce) run continuously when timer paused
- **Wait, no:** Idle animation only runs when `isRunning` (but check this)

**Action Required:** Verify idle animations stop when paused

---

## State Mutation Risks

### No Immutability Issues Detected
- All state updates use proper setters
- No direct mutations found
- Framer Motion variants are static objects (safe)

---

## Async Cleanup Checklist

| Component | Cleanup Method | Status |
|-----------|----------------|--------|
| `useCountdown` | clearInterval in useEffect return | ✅ Complete |
| `App.tsx` timer | clearInterval in useEffect return | ✅ Complete |
| `ProgressBar` pulse timeout | ❌ Missing | 🔴 RISK |
| `ProgressBar` celebration timeout | ❌ Missing | 🔴 RISK |
| `useReducedMotion` listener | removeEventListener | ✅ Complete |

---

## Recommendations Priority

### Critical (Fix Before Production)
1. Add timeout cleanup in `ProgressBar.tsx` useEffect returns
2. Reset `lastMilestone` when timer resets (add to props or effect)
3. Validate `progress` bounds (0-1) before calculations

### High (Performance/UX)
4. Change alligator `left: %` to `transform: translateX()` for GPU acceleration
5. Add `React.memo()` to character components
6. Remove dead `useCountdown` hook or integrate properly

### Medium (Code Quality)
7. Extract milestone detection logic to custom hook
8. Add prop validation for `progress` in character components
9. Simplify `lastMilestone` dependency in useEffect

### Low (Nice-to-Have)
10. Memoize confetti array creation
11. Add SSR-safe initial state for `useReducedMotion`
12. Add unit tests for boundary conditions

---

## Unresolved Questions

1. **Is `useCountdown` hook intended to replace App.tsx timer?**
   - If yes, needs integration work
   - If no, should be deleted

2. **Should milestone state persist across resets?**
   - Current: Persists (broken)
   - Expected: Reset on timer reset?

3. **How to handle rapid reset/restart during celebration?**
   - Confetti animation runs 1.5s
   - User resets at 0.2s
   - Cleanup strategy?

4. **Performance target validation?**
   - "60fps on iPad" mentioned in plan
   - No performance monitoring code
   - How to measure in production?
