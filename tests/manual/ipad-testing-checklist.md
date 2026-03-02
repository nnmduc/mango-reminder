# iPad Safari Testing Checklist

## Device Requirements
- [ ] iPad with iOS 16.4+ (required for Wake Lock API)
- [ ] Safari browser (not Chrome/Firefox - Wake Lock only in Safari)
- [ ] Wi-Fi connection for initial load

---

## Activity Selection
- [ ] All 3 activity cards visible and readable from arm's length
- [ ] Cards show correct colors, icons, and labels
- [ ] Touch feedback visible on tap (<100ms)
- [ ] Tapping a card transitions to countdown screen
- [ ] Total taps to start: 2-3 (per success criteria)

## Countdown Display
- [ ] Timer shows correct duration for selected activity
- [ ] Large digits readable from arm's length
- [ ] Progress bar visible (alligator + mango)
- [ ] Alligator position reflects elapsed time correctly
- [ ] Mango shrinks proportionally as time passes
- [ ] Pause button works (timer stops)
- [ ] Resume button works (timer continues from paused time)
- [ ] Reset button returns to activity selector

## Animations (60fps target)
- [ ] Alligator moves smoothly across screen
- [ ] Mango shrinks proportionally
- [ ] No visible jank or stuttering during countdown
- [ ] Celebration animation plays on completion
- [ ] Reduced motion preference respected (check Settings > Accessibility > Motion)

## Audio
- [ ] Sound plays on first activity tap (unlocks audio context)
- [ ] Halfway milestone sound plays at 50% elapsed
- [ ] 15-minute milestone sound plays (for timers ≥15min)
- [ ] 5-minute milestone sound plays (for timers ≥5min)
- [ ] 1-minute milestone sound plays (for timers ≥1min)
- [ ] Celebration sound plays on completion
- [ ] Mute toggle button works (silences sounds)
- [ ] Mute icon updates to reflect state
- [ ] Mute preference persists after page reload
- [ ] Each milestone sound plays only once per session

## Wake Lock
- [ ] Screen stays awake during active countdown
- [ ] Screen can sleep normally when timer is paused
- [ ] Wake lock re-acquires after switching tabs and returning
- [ ] Wake lock indicator shows correct state (if visible in UI)
- [ ] No battery drain warning from OS during testing

## PWA Installation
- [ ] "Add to Home Screen" option available in Safari share menu
- [ ] App icon displays correctly on home screen (no white padding)
- [ ] Splash screen appears on launch from home screen
- [ ] App launches fullscreen (no Safari address bar or tab bar)
- [ ] Status bar style correct (light/dark)

## Offline Mode
- [ ] Enable airplane mode after first load
- [ ] App still loads from cache
- [ ] Full countdown flow works offline
- [ ] Audio plays offline (cached)
- [ ] Re-enable Wi-Fi — no errors on reconnect

## Performance
- [ ] First load <3s on 4G / Wi-Fi
- [ ] Subsequent load <1s (cached via service worker)
- [ ] No jank during animation (use Safari > Develop > Timeline)
- [ ] No memory warnings from iOS during a full countdown
- [ ] App remains responsive after 30+ minutes

## Accessibility
- [ ] Works with VoiceOver enabled (Settings > Accessibility > VoiceOver)
- [ ] All interactive elements have meaningful labels
- [ ] Touch targets ≥48px (verify with Safari Web Inspector)
- [ ] Reduced motion: animations simplified when enabled
- [ ] Sufficient color contrast on all text

## Rotation & Layout
- [ ] Portrait orientation — layout correct
- [ ] Landscape orientation — layout adapts correctly
- [ ] No content cut off in either orientation
- [ ] Safe area insets respected (notch/home indicator)

## Edge Cases
- [ ] Timer completes correctly (reaches 0, shows completion)
- [ ] Multiple start/pause/resume cycles work without drift
- [ ] Starting a new activity mid-countdown resets correctly
- [ ] Low battery mode (enable via Settings) — no crashes
- [ ] Incoming phone call during countdown — resumes correctly after

---

## Performance Profiling Steps

1. Connect iPad via USB cable
2. On iPad: Settings > Safari > Advanced > Web Inspector = ON
3. On Mac Safari: Develop menu > [Your iPad] > [Tab]
4. Open Timeline tab in Web Inspector
5. Start recording, run countdown for 60 seconds
6. Check for frames dropping below 60fps

## Known Limitations

- Wake Lock requires iOS 16.4+ (Safari only)
- Audio requires first user gesture (cannot autoplay on load)
- PWA install only via Safari share sheet (not Chrome/Firefox on iOS)
