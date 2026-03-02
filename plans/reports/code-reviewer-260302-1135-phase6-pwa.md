# Code Review: Phase 6 - PWA Setup

**Date:** 2026-03-02
**Reviewer:** code-reviewer agent
**Scope:** Phase 6 PWA setup - vite.config.ts, index.html, vercel.json, public/icons/, public/splash/

---

## Scope

- Files: `vite.config.ts`, `index.html`, `vercel.json`, `public/icons/` (3 files), `public/splash/` (4 files)
- Build: passes (27 precache entries, 839.99 KiB)
- Tests: 35/35 pass
- Lint: clean

---

## Overall Assessment

Solid, minimal PWA setup that covers the fundamentals correctly. Config matches the plan spec and the build succeeds cleanly. Two medium issues need fixing before going live (splash media queries missing orientation, maskable icon using unpadded asset), and two low-priority items worth addressing. No critical or high-priority issues.

---

## Critical Issues

None.

---

## High Priority

None.

---

## Medium Priority

### M1 - Splash screen media queries missing `orientation` parameter

**File:** `index.html` lines 14-21

**Problem:** Apple's `apple-touch-startup-image` media queries require the `orientation` parameter to function correctly in iOS Safari. Without it, iOS may not match the correct splash image, defaulting to no splash screen at all. The phase plan's own example also omitted this, so the issue was present from spec.

**Current:**
```html
media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
```

**Required:**
```html
media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
```

All four splash links need `and (orientation: portrait)` appended. The splash images are portrait-oriented (taller than wide) so portrait is the correct value.

---

### M2 - Maskable icon reuses the same file as the standard 512px icon

**File:** `vite.config.ts` lines 34-38

**Problem:** The manifest declares `icon-512.png` twice — once as a standard icon and once as `purpose: maskable`. A maskable icon must have the subject matter within the center 80% "safe zone" with a full-bleed background extending to all edges. Using the same file means the icon will likely be cropped badly on Android adaptive icon shapes (circle, squircle, etc.), cutting off edges of the mango character.

**Impact:** Low on iOS Safari (it ignores the maskable purpose), but the manifest is also used for Chrome/Android installs, which is the platform where maskable matters. Since this is primarily an iPad app the immediate user impact is low, but it's a correctness issue.

**Fix:** Create a separate `icon-512-maskable.png` with proper safe-zone padding (subject inside center 80%, background extends to full 512x512 bleed). Update the manifest entry to reference it:
```ts
{
  src: '/icons/icon-512-maskable.png',
  sizes: '512x512',
  type: 'image/png',
  purpose: 'maskable',
},
```

---

## Low Priority

### L1 - WAV files are precached via globPatterns AND listed in includeAssets (potential redundancy)

**File:** `vite.config.ts` lines 12, 42

**Current:**
```ts
includeAssets: ['favicon.svg', 'icons/*.png', 'sounds/*.wav'],
globPatterns: ['**/*.{js,css,html,ico,png,svg,wav}'],
```

`globPatterns` already matches `**/*.wav`, so the sounds are captured by the precache manifest. `includeAssets` is intended for files outside the build output that need to be included but aren't matched by `globPatterns`. Since `*.wav` is in `globPatterns`, the `sounds/*.wav` entry in `includeAssets` is redundant. This doesn't cause errors (workbox deduplicates), but it's misleading config. Remove `sounds/*.wav` from `includeAssets`.

---

### L2 - Missing `navigateFallback` for SPA routing (future-proofing)

**File:** `vite.config.ts`

**Problem:** The workbox config has no `navigateFallback` setting. For a single-page app, if a user navigates to a deep URL while offline, the service worker won't know to serve `index.html` and the request will fail. This app currently has no client-side routing (single route), so this is not a live issue. If routes are ever added (e.g. `/settings`, `/history`), offline navigation will break without this.

**Suggested addition:**
```ts
workbox: {
  navigateFallback: '/index.html',
  globPatterns: ['**/*.{js,css,html,ico,png,svg,wav}'],
  // ...
}
```

---

## Edge Cases Found by Scout

- **Offline audio:** `.wav` files at ~30-100KB each are included in the precache. Total sound payload is ~262KB. Well within reasonable bounds; no issue.
- **Cache busting:** The service worker uses `autoUpdate` (silent update on new deploy). Because this is a kid-facing app with no real-time data, silent auto-updates are appropriate. No edge case concern.
- **Vercel `immutable` caching of icons/splash:** Icons and splash images are served with `max-age=31536000, immutable`. If these files ever need updating, the filenames must change (or the cache must be purged). The icon filenames are non-hashed (`icon-192.png`). A deploy with updated artwork but the same filename will be served stale by CDN/browser caches. Acceptable for a V1 but worth noting for future icon updates.
- **No iPhone splash screens:** Only iPad sizes are covered. iPhone users who add to home screen will get a white/black flash before the app loads. Not in scope for this project (iPad-primary), but documented.
- **Service worker update during countdown:** `autoUpdate` will claim the new service worker immediately. If a countdown is in progress during an update, the page reload triggered by `skipWaiting` + `clientsClaim` could interrupt the timer. The `registerType: 'autoUpdate'` mode uses `skipWaiting` and `clientsClaim` internally. For a kid app, a mid-session reload would be disruptive. Consider either: (a) not reloading immediately (remove `autoUpdate`, show a manual "Update available" prompt), or (b) accepting the low probability since Vercel deploys are infrequent.

---

## Positive Observations

- `apple-touch-icon.png` is correctly 180x180 (Apple's required size).
- All four target iPad splash screen pixel dimensions are correct (2048x2732, 1668x2388, 1620x2160, 1536x2048).
- `viewport-fit=cover` correctly handles notch/status bar on newer iPads.
- `theme_color` and `background_color` both set to `#FFF8E7` (cream) matches app's visual identity and prevents jarring background flash during load.
- `Permissions-Policy: screen-wake-lock=(self)` header is correctly scoped to self-origin only - good security posture.
- Audio files correctly use `.wav` format throughout (plan had an `.mp3` mismatch in globPatterns template; implementation fixed it to `wav`).
- `immutable` cache headers on static assets (icons, sounds, splash) are correct - these assets won't change between requests, so `immutable` prevents unnecessary revalidation.
- `orientation: any` in the manifest is appropriate for a tablet app that should work in both portrait and landscape.
- Google Fonts runtime caching rule is present - forward-compatible even though no Google Fonts are currently loaded.
- Build size is healthy: 272KB JS (88KB gzipped), 839KB precache total.

---

## Recommended Actions

1. **[M1 - Required before production]** Add `and (orientation: portrait)` to all four `apple-touch-startup-image` media queries in `index.html`.
2. **[M2 - Before Android/Chrome promotion]** Create a separate `icon-512-maskable.png` with proper safe-zone padding; update `vite.config.ts` to reference it.
3. **[L1 - Cleanup]** Remove `sounds/*.wav` from `includeAssets` in `vite.config.ts` since it's already covered by `globPatterns`.
4. **[L2 - Future-proofing]** Add `navigateFallback: '/index.html'` to workbox config before adding any client-side routes.

---

## Plan TODO Status

Phase 6 todo items mapped against implementation:

| Todo Item | Status |
|-----------|--------|
| Install vite-plugin-pwa | Done |
| Configure PWA manifest in vite.config.ts | Done |
| Add iOS meta tags to index.html | Done (see M1 for splash fix needed) |
| Design and export app icons (192, 512, apple-touch) | Done |
| Create iPad splash screens | Done (see M1) |
| Configure Vercel headers (Permissions-Policy) | Done |
| Deploy to Vercel | Not verifiable from code |
| Test "Add to Home Screen" on iPad | Not verifiable from code |
| Verify offline functionality | Not verifiable from code |
| Run Lighthouse PWA audit | Not verifiable from code |
| Test app launch from home screen (fullscreen) | Not verifiable from code |
| Verify splash screen displays correctly | Not verifiable from code |

Plan status: update phase-06 from `pending` to `completed` after M1 fix is applied.

---

## Metrics

- Type Coverage: N/A (config files, no new TS logic)
- Test Coverage: 35/35 pass (no new testable logic added in this phase)
- Linting Issues: 0
- Build Errors: 0
- Precache size: 839.99 KiB across 27 entries (within Workbox 2MB recommended limit)

---

## Unresolved Questions

- Q1: Are there plans to support iPhone users? If yes, iPhone splash screens (portrait + landscape for each model) need to be added. The current coverage is iPad-only.
- Q2: Is a manual "Update available" prompt preferred over the silent `autoUpdate` strategy, given that updates mid-countdown would restart the session?
