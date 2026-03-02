# Mango Reminder Tech Stack

**Date:** 2026-03-02
**Status:** Approved

## Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite (esbuild)
- **Animations:** CSS + Framer Motion (character animations only)
- **Styling:** CSS Modules
- **State Management:** React Hooks + Context API

### Audio
- **Implementation:** Web Audio API
- **Format:** Pre-generated MP3 files (AI-generated)
- **Sounds:** Milestone notifications (halfway, 15min, 5min, 1min)

### PWA & Deployment
- **PWA:** Vite PWA plugin + Service Worker
- **Hosting:** Vercel
- **HTTPS:** Required (Wake Lock API dependency)

### Key Features
- **Screen Wake Lock:** `navigator.wakeLock.request('screen')` (iOS 16.4+)
- **Bundle Size:** ~80kb gzipped
- **Performance Target:** 60fps animations on iPad

## Browser Requirements
- **Primary:** iPad Safari 16.4+ (iOS 16.4+)
- **Fallback:** Fullscreen mode for older devices

## Rationale

### YAGNI Compliance
- ✅ Rejected GSAP (unnecessary for countdown timer)
- ✅ Rejected Tone.js (45kb overhead for simple sounds)
- ✅ Rejected Next.js (SSR not needed for SPA)
- ✅ Rejected Tailwind (CSS Modules lighter for mobile)

### KISS Compliance
- ✅ React Context for simple state management
- ✅ Native Web Audio API (zero deps)
- ✅ CSS animations for countdown (hardware-accelerated)

### DRY Compliance
- ✅ Reusable Framer Motion animation components
- ✅ Shared activity configuration
- ✅ Component-based architecture

## Development Setup
```bash
npm create vite@latest . -- --template react-ts
npm install framer-motion
npm install -D vite-plugin-pwa
```

## Deployment
- Auto-deploy via Vercel GitHub integration
- Environment: Production (main branch)
- Custom domain: TBD

## Testing Requirements
- Safari DevTools remote debugging on actual iPad
- Test on iOS 16.4+ devices
- Verify Screen Wake Lock API functionality
- Performance profiling (60fps target)
