# Mango Reminder — Codebase Exploration Report

**Date:** 2026-03-04 | **Scope:** Complete codebase analysis

---

## 1. Project Type & Tech Stack

### Core Framework
- **React 18.3.1** (modern functional components)
- **TypeScript 5.6** (strict type safety)
- **Vite 6.0** (fast build tooling)

### Build & Dev Tools
- **ESLint + TypeScript ESLint** (code quality)
- **Vitest + Testing Library** (unit testing)
- **Prettier** (code formatting)

### UI & Motion
- **Framer Motion 11.15** (animation library for smooth transitions)
- **CSS Modules** (scoped styling with camelCase convention)

### Progressive Web App
- **Vite Plugin PWA** (offline support, installability, auto-updates)
- **Wake Lock API** (keep screen on during timer)

### Audio
- Custom audio system with Web Audio API
- Audio permission handling

---

## 2. File Structure

```
mango-reminder/
├── src/
│   ├── App.tsx                          # Main app component, view switching
│   ├── App.module.css                   # (Legacy/duplicate color vars)
│   ├── main.tsx                         # React DOM entry point
│   ├── index.css                        # Global styles & design tokens
│   ├── vite-env.d.ts                    # Vite type declarations
│   │
│   ├── components/                      # 6 feature components
│   │   ├── Layout/
│   │   │   ├── AppLayout.tsx            # Fullscreen container wrapper
│   │   │   └── AppLayout.module.css
│   │   ├── ActivitySelector/            # Activity grid screen
│   │   │   ├── ActivitySelector.tsx
│   │   │   ├── ActivityCard.tsx         # Individual activity card
│   │   │   ├── ActivitySelector.module.css
│   │   │   └── ActivityCard.module.css
│   │   ├── CountdownDisplay/            # Timer screen (5 sub-files)
│   │   │   ├── CountdownDisplay.tsx     # Main timer orchestrator
│   │   │   ├── TimerDigits.tsx          # MM:SS display
│   │   │   ├── ControlButtons.tsx       # Pause/Resume/Reset buttons
│   │   │   └── *.module.css             # Scoped styles
│   │   ├── ProgressBar/                 # Animated alligator-mango progress
│   │   │   ├── ProgressBar.tsx          # Main orchestrator
│   │   │   ├── AlligatorCharacter.tsx   # Animated alligator (eats mango)
│   │   │   ├── MangoCharacter.tsx       # Static mango sprite
│   │   │   ├── ProgressTrack.tsx        # Background track
│   │   │   └── *.module.css
│   │   ├── PresetEditor/                # Modal for adding/editing activities
│   │   │   ├── PresetEditorModal.tsx
│   │   │   └── PresetEditorModal.module.css
│   │   └── WakeLockIndicator/           # Status indicator
│   │       ├── WakeLockIndicator.tsx
│   │       └── WakeLockIndicator.module.css
│   │
│   ├── hooks/                           # 6 custom hooks
│   │   ├── use-countdown.ts             # Timer state machine
│   │   ├── use-presets.ts               # Activity localStorage persistence
│   │   ├── use-audio.ts                 # Sound effect system
│   │   ├── use-audio-permission.ts      # Ask for audio permission
│   │   ├── use-wake-lock.ts             # Keep screen awake
│   │   └── use-reduced-motion.ts        # Accessibility preference
│   │
│   ├── types/
│   │   ├── activity.ts                  # Activity interface, presets, colors
│   │   ├── index.ts
│   │   └── wake-lock.d.ts               # Browser API types
│   │
│   └── assets/
│       └── sounds/                      # Audio files directory
│
├── public/
│   ├── favicon.svg
│   ├── icons/                           # PWA icons (192x192, 512x512)
│   ├── sounds/                          # Audio assets
│   └── splash/                          # iOS splash screens
│
├── tests/                               # Test files
├── package.json                         # Dependencies
├── vite.config.ts                       # Build config + PWA manifest
├── tsconfig.json                        # TypeScript config
├── index.html                           # HTML entry (PWA links)
├── vercel.json                          # Deployment config
└── ...

```

---

## 3. Main Entry Points

### React Entry
- **`index.html`** (Line 1)
  - PWA metadata (apple-touch-icon, splash screens, manifest)
  - DOM target: `<div id="root">`
  - Script loads `/main.tsx`

### JavaScript Entry
- **`main.tsx`** → Creates React root, mounts `<App />`

### App Component
- **`App.tsx`** — Manages two views:
  - `selector` → ActivitySelector (grid of activities)
  - `countdown` → CountdownDisplay (timer in progress)
- Handles view switching, audio playback, and state orchestration

---

## 4. Styling Approach

### Strategy
**CSS Modules + Global Design Tokens**

All styles use **CSS Modules** for scoping + locally-scoped variables:
- Each component has `ComponentName.module.css`
- Vite configured to convert to camelCase: `border-color` → `.borderColor`

### Global Design Tokens (`src/index.css`)

#### Colors (Soft Pastel Minimal)
```css
--bg:         #FAFAF8       /* Off-white background */
--surface:    #FFFFFF       /* Cards/surfaces */
--surface-2:  #F4F4F0       /* Secondary surface */

/* Activity tints (kids-friendly pastels) */
--peach:      #FFD6C0  (--peach-dk, --peach-text)
--mint:       #B5EAD7  (--mint-dk, --mint-text)
--sky:        #B5D8F7  (--sky-dk, --sky-text)
--lavender:   #C7B8EA  (--lavender-dk, --lavender-text)
--yellow:     #FFF0B3  (--yellow-dk, --yellow-text)

/* Text hierarchy */
--text:       #1A1A2E       /* Primary text */
--text-2:     #6B6B80       /* Secondary */
--text-3:     #A5A5BB       /* Tertiary */

/* Timer states */
--color-normal:  #1A1A2E
--color-warning: #D97706    /* 1 min left */
--color-urgent:  #DC2626    /* Alarm urgency */
```

#### Typography
```css
--font-body:  'Plus Jakarta Sans' (Google Fonts)
--font-timer: 'Plus Jakarta Sans'
```

#### Spacing
```css
--touch-target: 44px
--spacing-xs:   6px
--spacing-sm:   10px
--spacing-md:   16px
--spacing-lg:   24px
--spacing-xl:   36px
```

#### Border Radius
```css
--r-sm:   10px
--r-md:   16px
--r-lg:   20px
--r-xl:   24px
--r-2xl:  32px
--r-full: 999px
```

#### Shadows (Ultra-light)
```css
--shadow-xs:  0 1px 3px rgba(0,0,0,0.06)
--shadow-sm:  0 2px 8px rgba(0,0,0,0.07)
--shadow-md:  0 4px 16px rgba(0,0,0,0.08)
--shadow-lg:  0 8px 32px rgba(0,0,0,0.10)
```

### No Tailwind or styled-components
- Pure CSS Modules for component scoping
- Global variables in `:root` for consistency
- Responsive design via `@media` queries

---

## 5. Color & Theme Configuration

### Activity Preset Colors
Defined in `src/types/activity.ts`:
```typescript
export const PRESET_COLORS = [
  '#FF6B6B', '#FF8E53', '#FDCB6E', '#A8E063',
  '#4ECDC4', '#45B7D1', '#6C5CE7', '#FD79A8',
  '#E17055', '#00B894', '#0984E3', '#D63031',
]
```

### Default Activities
```typescript
const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 'meal', name: 'Meal Time', duration: 1800s, color: '#FF6B6B', emoji: '🍽️' },
  { id: 'homework', name: 'Homework', duration: 2700s, color: '#4ECDC4', emoji: '📚' },
  { id: 'tv', name: 'TV Time', duration: 1200s, color: '#45B7D1', emoji: '📺' },
]
```

### Theme Customization Points
1. `:root` CSS variables (global) → Edit `index.css`
2. Activity colors → Edit `PRESET_COLORS` array in `types/activity.ts`
3. Individual component overrides → Component `.module.css` files

### Accessibility
- `@media (prefers-reduced-motion: reduce)` respected in animations
- Custom hook `use-reduced-motion()` disables Framer Motion
- Semantic HTML with ARIA labels

---

## 6. Key UI Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **AppLayout** | Fullscreen wrapper, prevents selection | `children` |
| **ActivitySelector** | Grid of activity cards + add button | `onSelectActivity` |
| **ActivityCard** | Individual activity button | `activity`, `onSelect`, `onEdit` |
| **CountdownDisplay** | Timer view with controls | `activity`, `remainingSeconds`, `timerState`, handlers |
| **TimerDigits** | Large MM:SS countdown | `remainingSeconds`, `totalSeconds` |
| **ControlButtons** | Pause/Resume/Reset buttons | `timerState`, handlers |
| **ProgressBar** | Alligator eating mango animation | `progress` (0-1), `isRunning`, `isCompleted` |
| **AlligatorCharacter** | Animated alligator sprite | `progress`, `isRunning`, `isEating`, `reducedMotion` |
| **MangoCharacter** | Static mango sprite at right | `progress`, `reducedMotion` |
| **ProgressTrack** | Background progress line/track | `progress` |
| **PresetEditorModal** | Modal for add/edit activities | `preset`, `onSave`, `onDelete`, `onClose` |
| **WakeLockIndicator** | Battery-like wake lock status | `isActive`, `isSupported`, `error` |

---

## 7. State Management & Data Flow

### State Hierarchy
```
App.tsx (root)
├── view: 'selector' | 'countdown'
├── selectedActivity: Activity | null
├── countdownState (from use-countdown hook)
│   ├── timeRemaining
│   ├── isRunning, isPaused, isCompleted
│   └── control functions: start, pause, resume, reset
└── audio state (from use-audio hook)
    ├── isMuted
    ├── playSound()
    └── toggleMute()
```

### Persistence
- Activities stored in **localStorage** via `use-presets` hook
- Default presets auto-loaded on first run
- Users can add/edit/delete custom activities

### Side Effects Handled
- **Wake Lock** → Requested on timer start, released on pause
- **Audio** → Plays on milestones (50%, 67%, 83%, 97%) and completion
- **Reduced Motion** → Checked on mount, disables Framer Motion animations

---

## 8. Key Features

✅ **Countdown Timer**
- Configurable durations (default 20-45 min activities)
- Pause/Resume/Reset controls
- Audio milestone alerts

✅ **Kid-Friendly Design**
- Animated alligator "eating" mango progress
- Celebration confetti on completion
- Large touch targets (44px+)
- Emoji-based activity selector

✅ **Accessibility**
- Respects `prefers-reduced-motion`
- ARIA labels on buttons
- Semantic HTML

✅ **Progressive Web App**
- Installable on mobile
- Offline support via Service Worker
- Auto-updates via Workbox
- iOS splash screens

✅ **Audio System**
- Web Audio API integration
- User permission request (required for iOS)
- Mute toggle button

✅ **Wake Lock**
- Screen stays on during active timer
- Fallback for unsupported browsers

---

## 9. Dependencies Summary

### Core
- react, react-dom (UI framework)
- framer-motion (animations)

### Dev Tools
- typescript, vite, eslint, vitest
- @vitejs/plugin-react (JSX support)
- vite-plugin-pwa (offline support)

### Testing
- @testing-library/react
- vitest, jsdom

### Code Quality
- prettier, typescript-eslint

---

## Key Observations

1. **Two-view architecture** — Selector grid + timer fullscreen (no navigation needed)
2. **CSS Modules first** — No CSS-in-JS, pure scoped CSS + global tokens
3. **Framer Motion lite** — Only used for activity selector tap/hover + progress celebrations
4. **Custom hooks for separation** — Audio, countdown, presets, wake-lock all isolated
5. **localStorage-only persistence** — No backend API (PWA-first approach)
6. **Accessibility considered** — Reduced motion support built-in
7. **Kids-focused UX** — Large buttons, emojis, animations, celebration effects

---

## Next Steps for Theming

If implementing a theme system:
1. Create `src/theme/theme.ts` exporting theme object with all CSS vars
2. Create theme switcher component that updates `:root` styles
3. Store selected theme in localStorage
4. Use `use-theme` hook for consistent access
5. Update `index.css` to support multiple themes via CSS custom properties

