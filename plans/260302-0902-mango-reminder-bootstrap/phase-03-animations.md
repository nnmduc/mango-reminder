# Phase 3: Animations

## Context Links

- [Countdown Animations Report](../reports/researcher-260302-0846-countdown-animations.md)
- [Kid-Friendly UI Report](../reports/researcher-260302-0846-kid-friendly-ui.md)
- [Main Plan](./plan.md)
- [Phase 2: UI Components](./phase-02-ui-components.md)

## Overview

**Priority:** P1 - Core Feature
**Status:** pending
**Description:** Implement animated alligator eating mango progress bar using SVG + Framer Motion

## Key Insights

From Animation Research:
- CSS animations for progress bar (hardware accelerated)
- Framer Motion for character choreography (React integration)
- SVG for scalable vector characters
- Target: 60fps on iPad Air
- Use `transform` and `opacity` only (avoid layout recalc)
- Honor `prefers-reduced-motion` for accessibility

## Requirements

### Functional
- Alligator character moves from left to right as time progresses
- Mango character on right side, gets "eaten" as timer completes
- Progress bar shows elapsed/remaining time visually
- Pulse animation at milestone points (halfway, 15min, 5min, 1min)
- Celebration animation on timer completion

### Non-Functional
- 60fps sustained animation on iPad
- Reduced motion fallback
- Smooth easing (spring physics preferred)
- Battery-conscious (no idle animations when paused)

## Architecture

```
src/
  components/
    ProgressBar/
      ProgressBar.tsx           # Container component
      ProgressBar.module.css
      AlligatorCharacter.tsx    # Animated alligator SVG
      MangoCharacter.tsx        # Mango being eaten SVG
      ProgressTrack.tsx         # Background track
  assets/
    images/
      alligator.svg             # Alligator vector (inline)
      mango.svg                 # Mango vector (inline)
  hooks/
    useCountdown.ts             # Timer logic with progress %
    useReducedMotion.ts         # Accessibility check
```

## Related Code Files

### Create
- `src/components/ProgressBar/ProgressBar.tsx`
- `src/components/ProgressBar/ProgressBar.module.css`
- `src/components/ProgressBar/AlligatorCharacter.tsx`
- `src/components/ProgressBar/MangoCharacter.tsx`
- `src/components/ProgressBar/ProgressTrack.tsx`
- `src/hooks/useCountdown.ts`
- `src/hooks/useReducedMotion.ts`

### Modify
- `src/components/CountdownDisplay/CountdownDisplay.tsx` - Add ProgressBar

## Implementation Steps

1. **Create useCountdown hook**
   ```typescript
   interface CountdownState {
     timeRemaining: number    // seconds
     totalTime: number        // seconds
     progress: number         // 0-1 (elapsed / total)
     isRunning: boolean
     isPaused: boolean
   }

   function useCountdown(durationMinutes: number): {
     state: CountdownState
     start: () => void
     pause: () => void
     resume: () => void
     reset: () => void
   }
   ```

2. **Create useReducedMotion hook**
   ```typescript
   function useReducedMotion(): boolean {
     // Check prefers-reduced-motion media query
     // Return true if user prefers reduced motion
   }
   ```

3. **Design SVG characters**
   - **Alligator:** Simple, friendly design
     - Body (green oval)
     - Eyes (two circles with pupils)
     - Mouth/jaw (opens when near mango)
     - Tail (wavy appendage)
   - **Mango:** Cute fruit character
     - Orange/yellow gradient body
     - Simple face (eyes, small smile)
     - Green leaf on top
     - Gets smaller/fades as eaten

4. **Build ProgressTrack component**
   - Horizontal track (rounded rectangle)
   - Background: light gray
   - Full width of container
   - Represents 0-100% journey

5. **Build AlligatorCharacter component**
   ```tsx
   interface AlligatorProps {
     progress: number  // 0-1
     isEating: boolean
     reducedMotion: boolean
   }
   ```
   - Position based on progress (translateX)
   - Subtle idle animation (gentle bounce)
   - Jaw animation when approaching mango (progress > 0.9)
   - Use Framer Motion `motion.svg` and `motion.g`

6. **Build MangoCharacter component**
   ```tsx
   interface MangoProps {
     progress: number  // 0-1
     reducedMotion: boolean
   }
   ```
   - Fixed position on right side
   - Scale down as progress increases (1 -> 0.3)
   - Opacity decreases in final 10%
   - "Wobble" animation when alligator near

7. **Build ProgressBar container**
   - Orchestrates AlligatorCharacter and MangoCharacter
   - Passes progress from useCountdown
   - Handles milestone pulse animations

8. **Implement milestone animations**
   ```typescript
   const MILESTONES = [0.5, 0.67, 0.83, 0.97] // halfway, 15min, 5min, 1min
   ```
   - Brief scale pulse on progress bar
   - Alligator does excited animation
   - Trigger audio (Phase 4)

9. **Implement completion celebration**
   - Alligator happy dance
   - Confetti or star burst (CSS particles)
   - Duration: 2-3 seconds
   - Auto-reset or manual dismiss

## Animation Specifications

### Alligator Movement
```typescript
const alligatorVariants = {
  idle: {
    y: [0, -5, 0],
    transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
  },
  moving: {
    x: `${progress * 100}%`,
    transition: { type: "spring", stiffness: 50, damping: 20 }
  },
  eating: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.3 }
  }
}
```

### Mango Shrinking
```typescript
const mangoVariants = {
  normal: { scale: 1, opacity: 1 },
  shrinking: {
    scale: 1 - (progress * 0.7),  // 1 -> 0.3
    opacity: progress > 0.9 ? 0.5 : 1
  },
  wobble: {
    rotate: [-5, 5, -5, 0],
    transition: { duration: 0.3 }
  }
}
```

### Reduced Motion Fallback
- Replace animations with instant transitions
- Use opacity changes instead of movement
- Progress bar fills without character animation

## Todo List

- [ ] Create useCountdown hook with start/pause/resume/reset
- [ ] Create useReducedMotion hook
- [ ] Design alligator SVG (simple friendly style)
- [ ] Design mango SVG (cute fruit character)
- [ ] Build ProgressTrack component
- [ ] Build AlligatorCharacter with Framer Motion
- [ ] Build MangoCharacter with shrink animation
- [ ] Build ProgressBar container
- [ ] Implement milestone pulse detection
- [ ] Implement completion celebration
- [ ] Add prefers-reduced-motion fallback
- [ ] Test 60fps on iPad Safari
- [ ] Verify battery impact is acceptable

## Success Criteria

- Alligator smoothly moves across screen as time elapses
- Mango shrinks proportionally to progress
- Milestone pulses visible at correct times
- Celebration plays on completion
- 60fps maintained (no frame drops)
- Reduced motion users see static progress bar

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| SVG complexity causes jank | Keep paths simple, <50 nodes total |
| Framer Motion re-renders | Use `layout` prop sparingly, memo components |
| iPad battery drain | Stop animations when paused |
| Safari SVG quirks | Test early, use webkit prefixes if needed |

## Security Considerations

- No external resources loaded
- SVG inline, no XSS risk

## Next Steps

After completion, proceed to [Phase 4: Audio System](./phase-04-audio-system.md)
