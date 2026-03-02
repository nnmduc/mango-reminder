# Phase 6: PWA Setup

## Context Links

- [Tech Stack Report](../reports/researcher-260302-0859-tech-stack-recommendation.md)
- [Main Plan](./plan.md)
- [Phase 5: Screen Wake Lock](./phase-05-screen-wake-lock.md)

## Overview

**Priority:** P1 - Critical
**Status:** pending
**Description:** Configure PWA with manifest, service worker, and Vercel deployment for installable iPad app

## Key Insights

From Tech Stack Research:
- Vite PWA plugin handles manifest + service worker generation
- HTTPS required for PWA + Wake Lock API (Vercel provides)
- Service worker caches all assets for offline use
- PWA enables "Add to Home Screen" on iPad

## Requirements

### Functional
- App installable on iPad home screen
- Works offline after initial load
- App icon displays correctly on home screen
- Splash screen on launch
- Fullscreen mode when launched from home screen

### Non-Functional
- First load <3s on 4G
- Subsequent loads <1s (cached)
- Lighthouse PWA score 100
- All assets cached by service worker

## Architecture

```
public/
  icons/
    icon-192.png        # Standard icon
    icon-512.png        # Large icon
    apple-touch-icon.png # iOS specific
  splash/
    apple-splash-*.png  # iOS splash screens (various sizes)
vite.config.ts          # PWA plugin configuration
vercel.json             # Vercel deployment config
```

## Related Code Files

### Create
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/apple-touch-icon.png`
- `public/splash/apple-splash-2048-2732.png` (iPad Pro 12.9")
- `public/splash/apple-splash-1668-2388.png` (iPad Pro 11")
- `public/splash/apple-splash-1620-2160.png` (iPad 10th gen)
- `vercel.json`

### Modify
- `vite.config.ts` - Add PWA plugin
- `index.html` - Add meta tags for iOS
- `package.json` - Add dependencies

## Implementation Steps

1. **Install Vite PWA plugin**
   ```bash
   npm install -D vite-plugin-pwa
   ```

2. **Configure Vite PWA plugin**
   ```typescript
   // vite.config.ts
   import { VitePWA } from 'vite-plugin-pwa'

   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         includeAssets: ['favicon.svg', 'icons/*.png', 'sounds/*.mp3'],
         manifest: {
           name: 'Mango Reminder',
           short_name: 'Mango',
           description: 'Kid-friendly countdown timer with animated alligator',
           theme_color: '#FFF8E7',
           background_color: '#FFF8E7',
           display: 'standalone',
           orientation: 'any',
           start_url: '/',
           icons: [
             {
               src: '/icons/icon-192.png',
               sizes: '192x192',
               type: 'image/png',
             },
             {
               src: '/icons/icon-512.png',
               sizes: '512x512',
               type: 'image/png',
             },
             {
               src: '/icons/icon-512.png',
               sizes: '512x512',
               type: 'image/png',
               purpose: 'maskable',
             },
           ],
         },
         workbox: {
           globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
           runtimeCaching: [
             {
               urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
               handler: 'CacheFirst',
               options: {
                 cacheName: 'google-fonts-cache',
                 expiration: {
                   maxEntries: 10,
                   maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                 },
               },
             },
           ],
         },
       }),
     ],
   })
   ```

3. **Add iOS-specific meta tags to index.html**
   ```html
   <head>
     <!-- PWA -->
     <meta name="apple-mobile-web-app-capable" content="yes">
     <meta name="apple-mobile-web-app-status-bar-style" content="default">
     <meta name="apple-mobile-web-app-title" content="Mango">
     <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">

     <!-- Splash screens for iPad -->
     <link rel="apple-touch-startup-image"
           href="/splash/apple-splash-2048-2732.png"
           media="(device-width: 1024px) and (device-height: 1366px)">
     <link rel="apple-touch-startup-image"
           href="/splash/apple-splash-1668-2388.png"
           media="(device-width: 834px) and (device-height: 1194px)">
     <link rel="apple-touch-startup-image"
           href="/splash/apple-splash-1620-2160.png"
           media="(device-width: 810px) and (device-height: 1080px)">

     <!-- Viewport for notch handling -->
     <meta name="viewport"
           content="width=device-width, initial-scale=1.0, viewport-fit=cover">

     <!-- Theme color -->
     <meta name="theme-color" content="#FFF8E7">
   </head>
   ```

4. **Create app icons**
   - Design mango character icon
   - Generate sizes: 192x192, 512x512
   - Apple touch icon: 180x180
   - Use maskable icon format for Android

5. **Create splash screens**
   - Mango character centered on warm cream background
   - Generate for iPad sizes:
     - 2048x2732 (iPad Pro 12.9")
     - 1668x2388 (iPad Pro 11")
     - 1620x2160 (iPad 10th gen)
     - 1536x2048 (iPad Air/Mini)

6. **Configure Vercel deployment**
   ```json
   // vercel.json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "Permissions-Policy",
             "value": "screen-wake-lock=(self)"
           }
         ]
       },
       {
         "source": "/sounds/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       }
     ]
   }
   ```

7. **Set up Vercel project**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

8. **Add PWA update prompt (optional)**
   ```typescript
   // src/components/UpdatePrompt.tsx
   import { useRegisterSW } from 'virtual:pwa-register/react'

   function UpdatePrompt() {
     const { needRefresh, updateServiceWorker } = useRegisterSW()

     if (!needRefresh) return null

     return (
       <div className={styles.updatePrompt}>
         <p>New version available!</p>
         <button onClick={() => updateServiceWorker(true)}>
           Update
         </button>
       </div>
     )
   }
   ```

## Icon Design Specifications

```
Mango Reminder Icon:
- Background: Warm cream (#FFF8E7)
- Character: Cute mango with face, green leaf
- Style: Flat design, bold colors
- Safe area: 80% of icon (for maskable)
- Export: PNG with transparency
```

## Todo List

- [ ] Install vite-plugin-pwa
- [ ] Configure PWA manifest in vite.config.ts
- [ ] Add iOS meta tags to index.html
- [ ] Design and export app icons (192, 512, apple-touch)
- [ ] Create iPad splash screens
- [ ] Configure Vercel headers (Permissions-Policy)
- [ ] Deploy to Vercel
- [ ] Test "Add to Home Screen" on iPad
- [ ] Verify offline functionality
- [ ] Run Lighthouse PWA audit
- [ ] Test app launch from home screen (fullscreen)
- [ ] Verify splash screen displays correctly

## Success Criteria

- "Add to Home Screen" option available on iPad Safari
- App icon displays on home screen
- Splash screen shows on launch
- App runs fullscreen (no Safari UI)
- Works offline after first load
- Lighthouse PWA score 100
- Service worker caches all assets

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| iOS Safari PWA quirks | Test on actual iPad, follow Apple guidelines |
| Service worker cache issues | Use workbox with proper versioning |
| Splash screen sizing wrong | Test all iPad sizes |
| Vercel deployment fails | Use vercel CLI for debugging |

## Security Considerations

- HTTPS enforced by Vercel
- Permissions-Policy header for wake lock
- Service worker same-origin only
- No sensitive data cached

## Next Steps

After completion, proceed to [Phase 7: Testing](./phase-07-testing.md)
