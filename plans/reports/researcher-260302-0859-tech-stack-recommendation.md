# Mango Reminder Tech Stack Research Report

**Date:** 2026-03-02 | **Status:** Final Recommendation

## Executive Summary

Mango Reminder requires a lightweight, animation-heavy frontend optimized for iPad/Safari. Based on performance, bundle size, and iOS compatibility, **Vite + React + CSS Animations** emerges as optimal. Two alternatives provided for flexibility.

---

## Key Findings

### Screen Wake Lock API (Critical Requirement)
- **Status:** Supported on iPad Safari 16.4+ (iOS 16.4+)
- **Implementation:** Use `navigator.wakeLock.request('screen')` with fallback to fullscreen mode
- **Fallback:** PWA fullscreen mode + accelerometer sensor to detect idle state
- **Decision:** Essential for product viability; requires iOS 16.4+

### Frontend Framework Analysis

| Framework | Bundle (gzip) | iPad Safari | Animations | DX | Verdict |
|-----------|---------------|-------------|-----------|-------|---------|
| **React 18** | ~40kb | Full support | GSAP/Framer Motion | Excellent | ✅ Recommended |
| **Vue 3** | ~33kb | Full support | Excellent CSS | Good | ✅ Alternative |
| **Svelte** | ~14kb | Full support | Native animations | Great | ⚠️ Niche ecosystem |
| **Vanilla JS** | ~0kb | Full support | Manual DOM | Poor | ❌ Too much work |

**YAGNI Decision:** React offers best balance—familiar ecosystem, Framer Motion for sophisticated animations (alligator eating mango), mature tooling. Don't use vanilla; don't over-engineer.

### Animation Approach

**Option A: CSS-in-JS (Recommended for YAGNI)**
- Pure CSS animations + requestAnimationFrame for countdown
- 60fps on iPad (hardware acceleration on -webkit-transform)
- Bundle: Minimal overhead
- Learning curve: Low

**Option B: Framer Motion + React**
- Declarative animation syntax, spring physics
- Bundle: +25kb gzipped (acceptable for app size)
- 60fps on iPad; better for character animations
- DRY benefit: Reusable animation components

**Option C: GSAP**
- Industry standard for complex sequences
- Bundle: +20kb gzipped
- Overkill for simple countdown timer (YAGNI violation)
- Best for character interactions only

**Recommendation:** Use CSS animations for countdown bar + Framer Motion for character (alligator) animations. **Reject GSAP**—too heavy for countdown-centric app.

### Build Tool

| Tool | Dev Speed | Bundle | Mobile Optimization | Verdict |
|------|-----------|--------|-------------------|---------|
| **Vite** | Lightning fast (HMR) | Excellent (esbuild) | Native | ✅ Recommended |
| **Next.js** | Good (with middleware) | Good (React Compiler) | Yes | ⚠️ Overkill |
| **Parcel** | Good | Good | Yes | Comparable |

**Decision:** Vite wins for simplicity. Next.js adds SSR complexity unnecessary for single-page iPad app.

### Styling

- **Tailwind CSS:** 40-60kb (PurgeCSS helps, still heavy for iPad)
- **CSS Modules:** Minimal overhead, full support iPad/Safari
- **styled-components:** Runtime JS overhead, avoid on mobile

**Recommendation:** **CSS Modules** for KISS principle. Avoid Tailwind unless design system justifies overhead.

### Audio Handling

**Web Audio API:**
- Supported on iPad Safari (iOS 13+)
- Pre-generate notification sounds (MP3/WAV)
- 0kb library overhead
- Low latency playback

**Tone.js:**
- Bundle: ~45kb gzipped
- Unnecessary for fixed preset sounds (YAGNI)
- Over-engineered for milestone notifications

**Decision:** Web Audio API + pre-generated files. Generate milestone sounds via ElevenLabs/Eleven API during build, cache on device.

### PWA & Deployment

**PWA Requirements Met:**
- Manifest.json (simple 2kb)
- Service Worker (cache offline, preload assets)
- HTTPS only (required for wakeLock API, Vercel/Netlify provide free)

**Hosting Options:**
1. **Vercel** (Recommended) - Free tier, optimized for React, global CDN, fast deployment
2. **Netlify** - Competitive, excellent DX, similar performance
3. **Cloudflare Pages** - Good for static assets, less mature for React SPAs

---

## Recommended Tech Stack (Option 1: YAGNI-Optimized)

```
Frontend:     React 18 + TypeScript
Build Tool:   Vite (esbuild)
Animations:   CSS + Framer Motion (character only)
Styling:      CSS Modules
State:        React hooks (Context API for preset activities)
Audio:        Web Audio API + pre-generated MP3s
PWA:          Vite PWA plugin + Service Worker
Deployment:   Vercel
Bundle Size:  ~80kb gzipped (React 40kb + Framer 25kb + App 15kb)
```

**Pros:** Fastest dev experience, familiar ecosystem, minimal overhead, 60fps animations on iPad
**Cons:** Slightly larger bundle than Svelte (acceptable for app use case)

---

## Alternative Stack (Option 2: Lightweight)

```
Frontend:     Vue 3 + TypeScript
Build Tool:   Vite
Animations:   Vue Transitions + CSS
Styling:      CSS Modules
Deployment:   Vercel
Bundle Size:  ~65kb gzipped
```

**Pros:** Smaller bundle, excellent CSS animation support, simpler learning curve
**Cons:** Smaller ecosystem for child-friendly UI components

---

## Alternative Stack (Option 3: Minimalist)

```
Frontend:     Svelte + TypeScript
Build Tool:   Vite
Animations:   Native Svelte animations (no external lib)
Styling:      Scoped CSS
Bundle Size:  ~40kb gzipped (smallest)
```

**Pros:** Tiny bundle, reactive by default, zero runtime overhead
**Cons:** Smaller community, fewer kid-UI component libraries

---

## Critical Implementation Notes

1. **Screen Lock:** Implement both:
   - `navigator.wakeLock.request('screen')` (iOS 16.4+)
   - Fallback: Request fullscreen + manual activity tracking

2. **Animations:** Use `will-change: transform` CSS hint for 60fps countdown bar

3. **Audio:** Pre-generate sounds at build time, cache in Service Worker

4. **Viewport:** Lock to portrait mode with viewport-fit metadata for notch handling

5. **Testing:** Safari DevTools remote debugging on actual iPad required

---

## YAGNI/KISS/DRY Alignment

- ✅ Reject GSAP/Tone.js (unnecessary libraries)
- ✅ Use native Web Audio API (zero extra deps)
- ✅ Vite > Next.js (no SSR needed)
- ✅ CSS Modules > Tailwind (avoid utility CSS bloat)
- ✅ Framer Motion for reusable animation components (DRY)
- ✅ React Context for preset activity state (KISS state management)

---

## Recommendation

**Choose Option 1 (React + Vite + Framer Motion)** for best balance of developer experience, performance, and feature completeness. Ecosystem maturity ensures you'll find kid-friendly UI solutions if needed later.

Start with Vite scaffold, add PWA plugin immediately. Test on actual iPad before production.
