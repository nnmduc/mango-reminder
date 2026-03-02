# Phase 2: UI Components

## Context Links

- [Kid-Friendly UI Report](../reports/researcher-260302-0846-kid-friendly-ui.md)
- [Main Plan](./plan.md)
- [Phase 1: Project Setup](./phase-01-project-setup.md)

## Overview

**Priority:** P1 - Core UI
**Status:** pending
**Description:** Build activity selector and countdown display components with kid-friendly design patterns

## Key Insights

From Kid-Friendly UI research:
- Touch targets: 48-60px minimum
- Colors: 2-3 primary max, high contrast (WCAG AAA)
- Flow: 2-3 taps to start timer
- Typography: Sans-serif, 18px+ body text
- No hidden menus; all controls visible

## Requirements

### Functional
- Activity selector with 3 preset cards (Meal, Homework, TV)
- Fullscreen countdown display with large timer
- Pause/Resume button during countdown
- Reset button to return to activity selector
- Visual feedback on tap (<100ms)

### Non-Functional
- Touch targets >= 48px
- Animations < 500ms
- WCAG AAA contrast (4.5:1 minimum)
- One-handed operation possible

## Architecture

```
src/components/
  ActivitySelector/
    ActivitySelector.tsx        # Container for activity cards
    ActivitySelector.module.css
    ActivityCard.tsx            # Individual activity card
    ActivityCard.module.css
  CountdownDisplay/
    CountdownDisplay.tsx        # Fullscreen timer view
    CountdownDisplay.module.css
    TimerDigits.tsx             # Large countdown numbers
    TimerDigits.module.css
    ControlButtons.tsx          # Pause/Resume/Reset
    ControlButtons.module.css
  Layout/
    AppLayout.tsx               # Main app wrapper
    AppLayout.module.css
```

## Related Code Files

### Create
- `src/components/ActivitySelector/ActivitySelector.tsx`
- `src/components/ActivitySelector/ActivitySelector.module.css`
- `src/components/ActivitySelector/ActivityCard.tsx`
- `src/components/ActivitySelector/ActivityCard.module.css`
- `src/components/CountdownDisplay/CountdownDisplay.tsx`
- `src/components/CountdownDisplay/CountdownDisplay.module.css`
- `src/components/CountdownDisplay/TimerDigits.tsx`
- `src/components/CountdownDisplay/TimerDigits.module.css`
- `src/components/CountdownDisplay/ControlButtons.tsx`
- `src/components/CountdownDisplay/ControlButtons.module.css`
- `src/components/Layout/AppLayout.tsx`
- `src/components/Layout/AppLayout.module.css`

### Modify
- `src/App.tsx` - Integrate components

## Implementation Steps

1. **Create AppLayout wrapper**
   - Fullscreen container with warm cream background
   - Responsive padding for tablet viewports
   - CSS custom properties for colors

2. **Build ActivityCard component**
   ```tsx
   interface ActivityCardProps {
     activity: Activity
     onSelect: (activity: Activity) => void
   }
   ```
   - Large touch target (min 120x120px)
   - Icon (emoji) + name + duration display
   - Color-coded background per activity
   - Scale animation on press (1.05x)
   - Framer Motion whileTap for feedback

3. **Build ActivitySelector container**
   - Grid layout: 3 cards centered
   - Title: "What are you doing?"
   - Responsive: stack on small screens

4. **Build TimerDigits component**
   - Large countdown display (MM:SS format)
   - Font size: 80-120px for tablet
   - Monospace or tabular numbers for stability
   - Color transition: normal -> warning (yellow) -> urgent (red)

5. **Build ControlButtons component**
   - Pause/Resume toggle button (60px minimum)
   - Reset/Cancel button
   - Icon + text labels
   - Positioned in thumb-zone (bottom center)

6. **Build CountdownDisplay container**
   - Fullscreen layout
   - Activity info at top (icon + name)
   - Timer in center
   - Progress bar area (Phase 3)
   - Controls at bottom

7. **Implement view switching in App.tsx**
   ```tsx
   type View = 'selector' | 'countdown'
   const [view, setView] = useState<View>('selector')
   const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
   ```

## Color Palette (CSS Variables)

```css
:root {
  /* Primary Colors */
  --color-meal: #FF6B6B;      /* Coral red */
  --color-homework: #4ECDC4;  /* Teal */
  --color-tv: #45B7D1;        /* Sky blue */

  /* UI Colors */
  --color-bg: #FFF8E7;        /* Warm cream */
  --color-text: #2D3436;      /* Dark gray */
  --color-text-light: #636E72;

  /* Timer States */
  --color-normal: #2D3436;
  --color-warning: #FDCB6E;   /* Yellow */
  --color-urgent: #E17055;    /* Orange-red */

  /* Spacing */
  --touch-target: 48px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}
```

## Todo List

- [ ] Create CSS custom properties file with color palette
- [ ] Build AppLayout component with fullscreen container
- [ ] Build ActivityCard with Framer Motion tap animation
- [ ] Build ActivitySelector grid layout
- [ ] Build TimerDigits with large monospace numbers
- [ ] Build ControlButtons with pause/resume/reset
- [ ] Build CountdownDisplay container layout
- [ ] Wire up view switching in App.tsx
- [ ] Test touch targets are >= 48px
- [ ] Verify WCAG contrast ratios

## Success Criteria

- Tap activity card -> transitions to countdown view
- Timer displays correctly in MM:SS format
- Pause/Resume toggles timer state
- Reset returns to activity selector
- All buttons have visible tap feedback
- Works in landscape and portrait orientation

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Touch targets too small on iPad mini | Use rem units, test on device |
| Layout breaks on different tablets | Use CSS Grid/Flexbox, test viewports |
| Font rendering issues Safari | Use system fonts or web-safe alternatives |

## Security Considerations

- No user input validation needed (preset activities only)
- No external data fetching

## Next Steps

After completion, proceed to [Phase 3: Animations](./phase-03-animations.md)
