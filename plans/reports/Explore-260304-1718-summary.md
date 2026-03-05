# Mango Reminder — Exploration Summary

## Executive Summary

**Mango Reminder** is a kid-friendly PWA countdown timer with animated alligator progress visualization. Built with React 18, TypeScript, Vite, and CSS Modules.

### Core Stats
- **12 React Components** (functional, no class components)
- **6 Custom Hooks** (countdown, presets, audio, wake-lock, reduced-motion)
- **No state library** (React hooks + localStorage only)
- **No CSS-in-JS** (pure CSS Modules + global design tokens)
- **No backend** (fully client-side PWA)

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           App.tsx (root)                │
│  • View switching (selector/countdown)  │
│  • Audio orchestration                  │
│  • Timer state management               │
└────────────┬────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
┌──────────────┐  ┌──────────────────┐
│ActivitySelect│  │CountdownDisplay  │
│tor           │  │ • TimerDigits    │
│ • Grid view  │  │ • ControlButtons │
│ • Add/Edit   │  │ • ProgressBar    │
└──────────────┘  │   - Alligator    │
                  │   - Mango        │
                  │   - Track        │
                  │ • WakeLockInd.   │
                  └──────────────────┘

              Hooks (shared)
    ┌─────────────────────────────────┐
    │ use-countdown (timer logic)      │
    │ use-presets (localStorage)       │
    │ use-audio (Web Audio API)        │
    │ use-wake-lock (Screen awake)     │
    │ use-reduced-motion (A11y)        │
    │ use-audio-permission (iOS req)   │
    └─────────────────────────────────┘
```

---

## Styling System

### No Build-Time CSS Processing
- Pure CSS Modules (zero abstractions)
- CSS Variables for theming
- Responsive via media queries

### Token Hierarchy
1. **Global tokens** (`index.css` `:root`)
   - Colors (pastel palette for kids)
   - Spacing scale
   - Typography
   - Shadows

2. **Component tokens** (`*.module.css`)
   - Component-specific overrides
   - Responsive breakpoints (768px tablet, 480px mobile)

### Color Palette
- **Background:** Soft off-white (#FAFAF8)
- **Pastels:** Peach, Mint, Sky, Lavender, Yellow (for activities)
- **States:** Normal (dark), Warning (orange), Urgent (red)
- **No dark mode** currently implemented

---

## Data Flow

```
localStorage
    │
    ├─→ use-presets ────→ Activity[]
    │
    ├─→ use-countdown ──→ { timeRemaining, isRunning, ... }
    │
    ├─→ use-audio ──────→ { isMuted, play() }
    │
    └─→ use-wake-lock ──→ { isActive, request(), release() }
                │
                └──→ App.tsx
                │
                ├─→ ActivitySelector (choose activity)
                │
                └─→ CountdownDisplay (run timer)
```

**No prop drilling** — components use hooks directly for independence.

---

## Key Technical Decisions

✅ **React Hooks over Context**
- Simpler state management
- No provider hell
- Each hook is independently testable

✅ **CSS Modules over Tailwind**
- Better organization for component-scoped styles
- Easier to reason about specificity
- Global tokens for consistency

✅ **localStorage over Backend**
- Offline-first PWA approach
- No server dependency
- User activities private to their device

✅ **Framer Motion for Delight**
- Activity selector: tap scale, hover lift
- Progress bar: milestone pulse, celebration confetti
- Respects `prefers-reduced-motion`

✅ **TypeScript Strict Mode**
- All files use strict typing
- No `any` types
- Full type safety

---

## Current Limitations & Gaps

⚠️ **App.module.css has duplicate color variables**
- `--color-primary-red`, `--color-background` (not used)
- Should be removed to avoid confusion
- Global tokens in `index.css` are the source of truth

⚠️ **No Dark Mode**
- Only light pastel theme available
- Would require CSS variable overrides + context

⚠️ **No User Settings**
- No way to change theme, font size, sound volume
- Settings could use localStorage + context hook

⚠️ **Limited Analytics**
- No tracking of timer completion, user behavior
- Could add optional localStorage logging

⚠️ **No Internationalization**
- English-only text ("What are you doing?", button labels)
- Could use i18n library (react-i18next)

---

## File Organization Health

### ✅ Well-Organized
- Clear separation: components, hooks, types
- Each hook is single-responsibility
- CSS Modules are component-adjacent

### ⚠️ Could Improve
- `App.tsx` mixes view logic + audio orchestration (consider extract `useViewLogic` hook)
- `App.module.css` unused/duplicate colors
- No `utils/` folder for helper functions (if any added in future)

### 📦 Scalability
- Adding new activities → Update `DEFAULT_ACTIVITIES` in `types/activity.ts`
- Adding new screen → Create component folder, export in App.tsx
- Adding new sound → Add file, wire in `use-audio.ts`
- Adding new hook → Create `use-feature-name.ts`, export in App or component

---

## Deployment & PWA

- ✅ **Vite PWA plugin** configured with manifest
- ✅ **iOS support** (splash screens, apple-touch-icon)
- ✅ **Offline support** (Workbox caching)
- ✅ **Auto-update** (registerType: 'autoUpdate')
- ✅ **Google Fonts caching** (1-year expiration)
- 🚀 **Vercel deployment** (vercel.json configured)

---

## Testing Coverage

- **Vitest** configured (run via `npm test`)
- **Testing Library** for component tests
- **jsdom** for DOM simulation
- **No existing tests** in codebase (TODO)

---

## Development Workflow

```bash
npm run dev          # Start Vite dev server (HMR enabled)
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint check
npm run preview      # Preview production build locally
npm test             # Run Vitest suite
npm test:watch       # Watch mode
```

---

## Security & Accessibility

✅ **Accessibility**
- `prefers-reduced-motion` respected
- ARIA labels on interactive elements
- Large touch targets (44px+)
- Semantic HTML (buttons, headings)
- No focus traps

✅ **Security**
- No eval(), no DOM innerHTML
- localStorage only (no XSS vectors)
- CSP headers (via Vercel)
- No sensitive data stored

---

## What's Missing (Future Opportunities)

1. **Test Suite** — No unit/component tests currently
2. **Storybook** — For component documentation
3. **Dark Mode** — Add CSS variable overrides
4. **Settings Screen** — Theme, sound volume, text size
5. **Analytics** — Optional usage tracking
6. **Backend Sync** — Cloud backup of activities
7. **Collaborative Timers** — Share timers with other users
8. **Multiple Languages** — i18n support
9. **Accessibility Audit** — Formal WCAG 2.1 compliance

---

## Quick Start for Development

```bash
# Clone and install
git clone ...
cd mango-reminder
npm install

# Develop
npm run dev
# → Open http://localhost:5173

# Make changes to components/hooks/styles
# → HMR refreshes automatically

# Test before commit
npm run lint
npm test

# Build for production
npm run build
npm run preview
```

---

## Reports Generated

1. **Explore-260304-1718-codebase-overview.md** — Full technical deep-dive
2. **Explore-260304-1718-key-files.md** — Quick reference guide
3. **Explore-260304-1718-summary.md** — This document

---

## Unresolved Questions

None from exploration — codebase is well-structured and clear.

If planning theme/settings feature, clarify:
- **Q1:** Should theme preference persist in localStorage or sync to backend?
- **Q2:** Should users be able to create/share custom activity templates?
- **Q3:** Should timer completion trigger notifications on home screen?

