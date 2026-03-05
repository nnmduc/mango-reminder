# Mango Reminder — Key Files Reference

Quick lookup guide for critical files and their purposes.

---

## 📌 Entry Points

| File | Purpose |
|------|---------|
| `index.html` | HTML entry, PWA metadata, DOM root target |
| `src/main.tsx` | React DOM initialization |
| `src/App.tsx` | Main app component, view logic |

---

## 🎨 Styling Files (Global + Modules)

| File | Type | Purpose |
|------|------|---------|
| `src/index.css` | **Global** | Design tokens, CSS variables, reset |
| `src/App.module.css` | Module | ⚠️ Legacy, has duplicate colors |
| `src/components/Layout/AppLayout.module.css` | Module | Fullscreen container |
| `src/components/ActivitySelector/ActivitySelector.module.css` | Module | Grid layout |
| `src/components/ActivitySelector/ActivityCard.module.css` | Module | Card styling |
| `src/components/CountdownDisplay/CountdownDisplay.module.css` | Module | Timer view layout |
| `src/components/CountdownDisplay/TimerDigits.module.css` | Module | MM:SS digit colors (warning/urgent) |
| `src/components/CountdownDisplay/ControlButtons.module.css` | Module | Button group styling |
| `src/components/ProgressBar/ProgressBar.module.css` | Module | Progress container + pulse/confetti |
| `src/components/PresetEditor/PresetEditorModal.module.css` | Module | Modal styling |
| `src/components/WakeLockIndicator/WakeLockIndicator.module.css` | Module | Wake lock badge |

---

## 🧩 Components (12 files)

### Layout
- `src/components/Layout/AppLayout.tsx` — Fullscreen wrapper

### Activity Selection Screen
- `src/components/ActivitySelector/ActivitySelector.tsx` — Grid orchestrator + modal state
- `src/components/ActivitySelector/ActivityCard.tsx` — Individual activity button

### Timer Screen
- `src/components/CountdownDisplay/CountdownDisplay.tsx` — Main timer view orchestrator
- `src/components/CountdownDisplay/TimerDigits.tsx` — MM:SS display with color states
- `src/components/CountdownDisplay/ControlButtons.tsx` — Play/Pause/Reset buttons

### Progress Visualization
- `src/components/ProgressBar/ProgressBar.tsx` — Orchestrator (alligator eating mango)
- `src/components/ProgressBar/AlligatorCharacter.tsx` — Animated alligator sprite
- `src/components/ProgressBar/MangoCharacter.tsx` — Static mango sprite
- `src/components/ProgressBar/ProgressTrack.tsx` — Background progress track

### Dialogs & Status
- `src/components/PresetEditor/PresetEditorModal.tsx` — Add/edit activity modal
- `src/components/WakeLockIndicator/WakeLockIndicator.tsx` — Wake lock status badge

---

## 🪝 Hooks (6 files)

| Hook | Purpose | Key Exports |
|------|---------|-------------|
| `src/hooks/use-countdown.ts` | Timer state machine | `{ state, start, pause, resume, reset }` |
| `src/hooks/use-presets.ts` | Activity persistence | `{ activities, addPreset, updatePreset, deletePreset }` |
| `src/hooks/use-audio.ts` | Sound playback | `{ play, isMuted, toggleMute }` |
| `src/hooks/use-audio-permission.ts` | Request audio permission | `{ canPlay, requestPermission }` |
| `src/hooks/use-wake-lock.ts` | Keep screen on | `{ state, request, release }` |
| `src/hooks/use-reduced-motion.ts` | Accessibility check | Returns boolean |

---

## 📝 Types & Config

| File | Purpose |
|------|---------|
| `src/types/activity.ts` | Activity interface, PRESET_COLORS, DEFAULT_ACTIVITIES |
| `src/types/wake-lock.d.ts` | WakeLockSentinel API types |
| `src/types/index.ts` | Barrel export |
| `tsconfig.json` | TypeScript config |
| `vite.config.ts` | Vite build + PWA manifest config |

---

## 📦 Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts (dev, build, test, lint) |
| `vite.config.ts` | **Contains PWA manifest** (theme_color, icons, etc.) |
| `index.html` | **PWA metadata** (apple-touch-icon, splash screens) |
| `vercel.json` | Deployment config |
| `.prettierrc` | Code formatting |
| `eslint.config.js` | Linting rules |

---

## 🎵 Assets

| Path | Content |
|------|---------|
| `public/sounds/` | Audio files for timer milestones & celebration |
| `public/icons/` | PWA icons (192x192, 512x512 + maskable) |
| `public/splash/` | iOS splash screens |
| `src/assets/sounds/` | Audio import location |

---

## 🧪 Testing

| Path | Purpose |
|------|---------|
| `tests/` | Test files directory |
| `vitest.config.ts` | Vitest configuration |

---

## 🎯 CSS Variables Organization

### Global (in `index.css`)
- **Colors:** `--bg`, `--surface`, `--peach`, `--mint`, `--sky`, `--lavender`, `--yellow`
- **Text:** `--text`, `--text-2`, `--text-3`
- **States:** `--color-normal`, `--color-warning`, `--color-urgent`
- **Spacing:** `--spacing-xs` through `--spacing-xl`, `--touch-target`
- **Radius:** `--r-sm` through `--r-full`
- **Shadows:** `--shadow-xs` through `--shadow-lg`
- **Typography:** `--font-body`, `--font-timer`

### Per-Component (in `*.module.css`)
- Components access global vars via `var(--*)`
- Local overrides are component-specific

---

## 🔍 How to Find Things

### "I need to change colors"
→ Start in `src/index.css` (global tokens)
→ Then check `src/types/activity.ts` (PRESET_COLORS)
→ Check individual component `.module.css` if override needed

### "I need to change typography"
→ `src/index.css` (--font-body, --font-timer)
→ Component-specific sizes in respective `.module.css`

### "I need to add a new feature"
→ Plan: New component in `src/components/`
→ Add `.module.css` for that component
→ If state needed: Custom hook in `src/hooks/`
→ If type needed: Define in `src/types/`

### "I need to modify timer behavior"
→ `src/hooks/use-countdown.ts` (timer logic)
→ `src/components/CountdownDisplay/*` (UI)

### "I need to add/remove default activities"
→ `src/types/activity.ts` (DEFAULT_ACTIVITIES array)

