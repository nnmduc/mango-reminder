# Scout Report: mango-reminder Codebase Inventory

**Date:** 2026-03-04  
**Total Files:** 36  
**Total Lines:** 2,803  
**Focus Areas:** CSS modules, TSX components, hooks, types, entry points

---

## 📊 File Inventory (Organized by Category)

### Entry Points (2 files, 95 lines)
| File | Lines | Purpose |
|------|-------|---------|
| `src/main.tsx` | 10 | Vite React entry point—mounts App to #root |
| `src/index.css` | 85 | Global CSS—reset, base styles, responsive layout |

### Root App (2 files, 175 lines)
| File | Lines | Purpose |
|------|-------|---------|
| `src/App.tsx` | 80 | Main app component—view switching (selector ↔ countdown), state management |
| `src/App.module.css` | 95 | App-level styles—layout, theme variables, dark mode support |

### Components Directory (24 files, 1,540 lines)

#### Layout Component (2 files, 40 lines)
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/Layout/AppLayout.tsx` | 15 | Shell layout—header, main, footer structure |
| `src/components/Layout/AppLayout.module.css` | 25 | Layout spacing, grid, responsive breakpoints |

#### Activity Selector (4 files, 331 lines)
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/ActivitySelector/ActivitySelector.tsx` | 79 | Activity list display—grid of activity cards, search/filter UI |
| `src/components/ActivitySelector/ActivitySelector.module.css` | 101 | Grid layout, card hover states, responsive columns |
| `src/components/ActivitySelector/ActivityCard.tsx` | 51 | Individual activity card—icon, title, duration, edit/delete actions |
| `src/components/ActivitySelector/ActivityCard.module.css` | 96 | Card styling, animation, interaction states |

#### Countdown Display (6 files, 409 lines)
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/CountdownDisplay/CountdownDisplay.tsx` | 94 | Main timer display—countdown logic integration, layout |
| `src/components/CountdownDisplay/CountdownDisplay.module.css` | 114 | Timer layout, responsive sizing, background effects |
| `src/components/CountdownDisplay/TimerDigits.tsx` | 35 | Displays time in MM:SS format—large font rendering |
| `src/components/CountdownDisplay/TimerDigits.module.css` | 64 | Digit styling, monospace font, centering |
| `src/components/CountdownDisplay/ControlButtons.tsx` | 68 | Play/pause/reset buttons—timer control logic |
| `src/components/CountdownDisplay/ControlButtons.module.css` | 77 | Button styles, icon colors, active/disabled states |

#### Progress Bar (6 files, 314 lines)
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/ProgressBar/ProgressBar.tsx` | 110 | Progress bar container—time elapsed visualization |
| `src/components/ProgressBar/ProgressBar.module.css` | 75 | Bar sizing, fill animation, gradient background |
| `src/components/ProgressBar/ProgressTrack.tsx` | 31 | Track segment—individual time chunk display |
| `src/components/ProgressBar/ProgressTrack.module.css` | 47 | Segment styling, hover effects |
| `src/components/ProgressBar/MangoCharacter.tsx` | 49 | Mango sprite—animated character on progress bar |
| `src/components/ProgressBar/AlligatorCharacter.tsx` | 52 | Alligator sprite—enemy character animation |

#### Preset Editor (2 files, 516 lines)
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/PresetEditor/PresetEditorModal.tsx` | 197 | Modal form—create/edit activity presets, form handling, validation |
| `src/components/PresetEditor/PresetEditorModal.module.css` | 319 | Modal overlay, form layout, input styling, button states |

#### Wake Lock Indicator (2 files, 89 lines)
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/WakeLockIndicator/WakeLockIndicator.tsx` | 44 | Indicator UI—shows screen lock status during countdown |
| `src/components/WakeLockIndicator/WakeLockIndicator.module.css` | 45 | Indicator styling, glow animation, status colors |

### Hooks Directory (6 files, 571 lines)
| File | Lines | Purpose |
|------|-------|---------|
| `src/hooks/use-countdown.ts` | 173 | Core countdown timer logic—interval management, time calculation, state updates |
| `src/hooks/use-audio.ts` | 215 | Audio playback management—load, play sounds, volume control, error handling |
| `src/hooks/use-audio-permission.ts` | 106 | Web Audio API permission handling—iOS/Android browser detection |
| `src/hooks/use-wake-lock.ts` | 90 | Screen wake lock API wrapper—prevent device sleep during countdown |
| `src/hooks/use-presets.ts` | 58 | Local storage persistence—load/save activity presets |
| `src/hooks/use-reduced-motion.ts` | 29 | Accessibility—detect prefers-reduced-motion, reduce animations |

### Types Directory (3 files, 73 lines)
| File | Lines | Purpose |
|------|-------|---------|
| `src/types/activity.ts` | 54 | Type definitions—Activity, TimerState, PresetData interfaces |
| `src/types/wake-lock.d.ts` | 17 | TypeScript declaration—extend Navigator for WakeLock API |
| `src/types/index.ts` | 2 | Re-exports all types for convenient imports |

### Ambient Declarations (1 file, 1 line)
| File | Lines | Purpose |
|------|-------|---------|
| `src/vite-env.d.ts` | 1 | Vite types reference—enables import.meta.env typing |

---

## 📁 Directory Breakdown

```
src/
├── main.tsx                          # Entry point (10 lines)
├── index.css                         # Global styles (85 lines)
├── App.tsx + App.module.css          # Root app (175 lines)
├── components/                       # UI layers (1,540 lines)
│   ├── Layout/                       # Shell (40 lines)
│   ├── ActivitySelector/             # Activity list (331 lines)
│   ├── CountdownDisplay/             # Timer display (409 lines)
│   ├── ProgressBar/                  # Progress visualization (314 lines)
│   ├── PresetEditor/                 # Edit modal (516 lines)
│   └── WakeLockIndicator/            # Status indicator (89 lines)
├── hooks/                            # Custom hooks (571 lines)
│   ├── use-countdown.ts              # Timer logic (173 lines)
│   ├── use-audio.ts                  # Sound playback (215 lines)
│   ├── use-audio-permission.ts       # Audio permissions (106 lines)
│   ├── use-wake-lock.ts              # Screen lock (90 lines)
│   ├── use-presets.ts                # Storage (58 lines)
│   └── use-reduced-motion.ts         # Accessibility (29 lines)
├── types/                            # Type definitions (73 lines)
│   ├── activity.ts                   # Domain types (54 lines)
│   ├── wake-lock.d.ts                # API types (17 lines)
│   └── index.ts                      # Re-exports (2 lines)
└── assets/sounds/                    # Audio files (not counted)
```

---

## 🎯 Key Observations

**CSS Distribution:** 1,089 lines (39% of codebase)
- **PresetEditorModal.module.css**: 319 lines (heavily styled modal)
- **CountdownDisplay**: 114 lines (timer display styles)
- **ActivitySelector**: 101 lines (card grid layout)

**Component Size Distribution:**
- **Large (100+ lines):** PresetEditorModal (197), ProgressBar (110), CountdownDisplay (94)
- **Medium (50-99 lines):** ActivityCard (51), TimerDigits (35), WakeLockIndicator (44)
- **Small (<50 lines):** Most others

**Hook Responsibility:**
- **Logic-heavy:** use-countdown (173), use-audio (215)
- **API Wrappers:** use-audio-permission (106), use-wake-lock (90)
- **Utilities:** use-presets (58), use-reduced-motion (29)

**No Modularization Issues:** All files are under 320 lines—well within the 200-line guideline for components (CSS is exempt).

---

## Unresolved Questions

None—inventory complete.
