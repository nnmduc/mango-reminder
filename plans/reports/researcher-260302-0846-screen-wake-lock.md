# Screen Wake Lock Research Report
**Date:** 2026-03-02 | **Status:** Complete

## Executive Summary

The **Screen Wake Lock API** is the primary modern solution for preventing screen lock during countdown timers. iOS Safari 16.4+ now supports it after historical limitations, enabling cross-device timer implementations. However, graceful fallback handling remains essential for older browsers.

## Current Browser Support

| Platform | Support | Version | Status |
|----------|---------|---------|--------|
| iOS Safari | ✓ Yes | 16.4+ | **Now supported** |
| iPad Safari | ✓ Yes | 16.4+ | **Now supported** |
| Chrome | ✓ Yes | 85+ | Full support |
| Edge | ✓ Yes | 90+ | Full support |
| Firefox | ✓ Yes | 126+ | Full support |
| Opera | ✓ Yes | 73+ | Full support |
| **Global Coverage** | **94.43%** | - | Excellent adoption |

**Critical:** iOS versions <16.4 and Opera Mini have no API support.

## Implementation Strategy

### 1. Primary Approach: Screen Wake Lock API

```javascript
let wakeLock = null;

async function requestWakeLock() {
  if (!("wakeLock" in navigator)) {
    console.warn("Wake Lock API not supported");
    return false;
  }

  try {
    wakeLock = await navigator.wakeLock.request("screen");
    console.log("Wake lock active");
    return true;
  } catch (err) {
    console.error("Wake lock failed:", err.name, err.message);
    return false;
  }
}

function releaseWakeLock() {
  wakeLock?.release().then(() => { wakeLock = null; });
}

// Re-acquire on visibility change
document.addEventListener("visibilitychange", async () => {
  if (wakeLock !== null && document.visibilityState === "visible") {
    wakeLock = await navigator.wakeLock.request("screen");
  }
});
```

**Requirements:**
- HTTPS/secure context only
- Active, visible document
- User activation (event handler triggered)

### 2. System-Level Limitations

Wake lock requests may be **rejected** due to:
- Low battery / power-save mode
- Document hidden/backgrounded
- System policies (browsers can refuse)

**Mitigation:** Wrap in try-catch, provide UI feedback on lock status.

### 3. Fallback Strategies (for unsupported browsers)

For iOS <16.4 or other limitations:

**Option A: Prevent Auto-Lock via Interaction**
- Enable fullscreen mode (reduces lock timeout)
- Periodically trigger user-permissible events (e.g., click handlers)

**Option B: Audio/Video Playback Trick** (battery-intensive)
- Play muted audio/video in loop (unreliable, drains battery)

**Option C: User Education**
- UI prompt: "Keep screen manual enabled" or "Adjust device settings"
- Display wake lock status clearly

**Recommendation:** Rely on the API for modern browsers; document limitations for legacy devices.

## Best Practices for Countdown Timers

1. **Request immediately on timer start** - triggers during active usage
2. **Release on timer completion** - don't hold unnecessarily
3. **Handle visibility changes** - re-acquire when returning to tab
4. **Graceful degradation** - provide UI feedback if API unavailable
5. **Error handling** - catch system rejections (low battery, etc.)
6. **Permissions Policy** - respect HTTP headers:
   ```http
   Permissions-Policy: screen-wake-lock=(self)
   ```

## Security & Performance Notes

- **Secure Context Required:** HTTPS mandatory
- **Battery Impact:** Moderate (device dependent)
- **Permissions:** User-initiated only (no silent activation)
- **No Guaranteed Duration:** System can revoke at any time

## Recommendations for Mango Reminder

✓ **Implement Wake Lock API** as primary solution (covers 94% users)
✓ **Add feature detection** with user-friendly error messaging
✓ **Re-acquire on visibility change** for tab switching
✓ **Target iOS 16.4+** for full device support
✓ **Graceful fallback:** Display UI notice if unsupported

---

**Sources:**
- [MDN: Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
- [Chrome Developers: Wake Lock API](https://developer.chrome.com/articles/wake-lock)
- [CanIUse: Wake Lock](https://caniuse.com/wake-lock)
- [W3C: Screen Wake Lock Specification](https://www.w3.org/TR/screen-wake-lock/)
