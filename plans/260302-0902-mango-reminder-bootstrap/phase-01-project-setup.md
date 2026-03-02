# Phase 1: Project Setup

## Context Links

- [Tech Stack Report](../reports/researcher-260302-0859-tech-stack-recommendation.md)
- [Main Plan](./plan.md)

## Overview

**Priority:** P1 - Foundation
**Status:** completed
**Description:** Scaffold Vite + React 18 + TypeScript project with CSS Modules and Framer Motion

## Key Insights

- Vite provides fastest HMR and esbuild bundling
- React 18 + TypeScript for type safety and ecosystem
- CSS Modules for scoped styling without runtime overhead
- Target bundle: ~80kb gzipped

## Requirements

### Functional
- Project scaffolded with Vite React-TS template
- Framer Motion installed for character animations
- CSS Modules configured
- ESLint + Prettier for code quality
- Environment setup for Vercel deployment

### Non-Functional
- Dev server hot reload <500ms
- Production build <2s
- Zero TypeScript errors

## Architecture

```
mango-reminder/
  src/
    main.tsx              # Entry point
    App.tsx               # Root component
    App.module.css        # Root styles
    components/           # UI components (Phase 2)
    hooks/                # Custom hooks (Phase 3+)
    assets/               # Static assets
    types/                # TypeScript definitions
  public/
    favicon.svg           # Mango favicon
  index.html              # HTML entry
  vite.config.ts          # Vite configuration
  tsconfig.json           # TypeScript config
  package.json            # Dependencies
```

## Related Code Files

### Create
- `src/main.tsx` - React entry point
- `src/App.tsx` - Root App component
- `src/App.module.css` - Base styles with kid-friendly colors
- `src/types/index.ts` - Shared TypeScript types
- `src/types/activity.ts` - Activity preset types
- `vite.config.ts` - Vite configuration
- `.eslintrc.cjs` - ESLint configuration
- `.prettierrc` - Prettier configuration

## Implementation Steps

1. **Initialize Vite project**
   ```bash
   npm create vite@latest mango-reminder -- --template react-ts
   cd mango-reminder
   ```

2. **Install dependencies**
   ```bash
   npm install framer-motion
   npm install -D @types/node eslint prettier eslint-plugin-react-hooks
   ```

3. **Configure Vite** (`vite.config.ts`)
   ```typescript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import path from 'path'

   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
     css: {
       modules: {
         localsConvention: 'camelCaseOnly',
       },
     },
   })
   ```

4. **Define TypeScript types** (`src/types/activity.ts`)
   ```typescript
   export interface Activity {
     id: string
     name: string
     duration: number // minutes
     icon: string
     color: string
   }

   export const PRESET_ACTIVITIES: Activity[] = [
     { id: 'meal', name: 'Meal Time', duration: 30, icon: '🍽️', color: '#FF6B6B' },
     { id: 'homework', name: 'Homework', duration: 45, icon: '📚', color: '#4ECDC4' },
     { id: 'tv', name: 'TV Time', duration: 20, icon: '📺', color: '#45B7D1' },
   ]
   ```

5. **Set up base styles** with kid-friendly palette
   - Primary colors: Bright saturated (red, teal, blue)
   - Background: Warm cream (#FFF8E7)
   - Typography: Sans-serif, 18px+ minimum
   - Touch targets: 48-60px minimum

6. **Configure ESLint for React hooks**

7. **Test dev server runs correctly**

## Todo List

- [x] Run `npm create vite@latest` with react-ts template
- [x] Install framer-motion dependency
- [x] Configure path aliases in vite.config.ts
- [x] Create Activity types with preset definitions
- [x] Set up kid-friendly CSS variables (colors, spacing)
- [x] Configure ESLint + Prettier
- [x] Verify dev server starts without errors
- [x] Verify TypeScript compilation passes

## Success Criteria

- `npm run dev` starts server without errors
- `npm run build` produces production bundle
- TypeScript strict mode enabled, zero errors
- Path aliases working (`@/components`)
- CSS Modules scoped correctly

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Vite version incompatibility | Pin to Vite 5.x |
| Framer Motion bundle bloat | Use tree-shaking, import only needed modules |
| TypeScript config issues | Use strict mode from start |

## Security Considerations

- No secrets or API keys at this phase
- ESLint security rules enabled

## Next Steps

After completion, proceed to [Phase 2: UI Components](./phase-02-ui-components.md)
