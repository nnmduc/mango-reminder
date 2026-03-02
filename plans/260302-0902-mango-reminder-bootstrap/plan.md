---
title: "Mango Reminder Bootstrap"
description: "Kid-friendly countdown timer PWA with animated alligator eating mango progress bar"
status: completed
priority: P1
effort: 16h
branch: main
tags: [pwa, react, typescript, framer-motion, kids-app]
created: 2026-03-02
---

# Mango Reminder - Implementation Plan

## Overview

Countdown timer for kids (4-12) on iPad/tablets. Features animated alligator eating mango as progress bar, sound notifications at milestones, and screen wake lock.

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Animations:** Framer Motion (character) + CSS (progress bar)
- **Styling:** CSS Modules
- **Audio:** Web Audio API + pre-generated MP3s
- **PWA:** Vite PWA plugin
- **Deployment:** Vercel

## Phases

| # | Phase | Est. | Status | File |
|---|-------|------|--------|------|
| 1 | Project Setup | 1.5h | completed | [phase-01](./phase-01-project-setup.md) |
| 2 | UI Components | 3h | pending | [phase-02](./phase-02-ui-components.md) |
| 3 | Animations | 4h | pending | [phase-03](./phase-03-animations.md) |
| 4 | Audio System | 2h | pending | [phase-04](./phase-04-audio-system.md) |
| 5 | Screen Wake Lock | 1h | completed | [phase-05](./phase-05-screen-wake-lock.md) |
| 6 | PWA Setup | 2h | completed | [phase-06](./phase-06-pwa-setup.md) |
| 7 | Testing | 2.5h | completed | [phase-07](./phase-07-testing.md) |

## Key Dependencies

- iOS Safari 16.4+ for Screen Wake Lock API
- User gesture required for audio playback
- HTTPS required (Vercel provides)

## Architecture

```
src/
  components/
    ActivitySelector/     # Preset activity cards
    CountdownDisplay/     # Fullscreen timer view
    ProgressBar/          # Alligator eating mango SVG
  hooks/
    useWakeLock.ts        # Screen Wake Lock API
    useCountdown.ts       # Timer logic
    useAudio.ts           # Sound notifications
  assets/
    sounds/               # Milestone MP3s
    images/               # SVG characters
```

## Success Criteria

- 2-3 tap flow to start timer
- 60fps animations on iPad Air
- Screen stays awake during countdown
- Audio plays at milestones (halfway, 15min, 5min, 1min)
- PWA installable on home screen

## Reports

- [Screen Wake Lock](../reports/researcher-260302-0846-screen-wake-lock.md)
- [Kid-Friendly UI](../reports/researcher-260302-0846-kid-friendly-ui.md)
- [Audio Generation](../reports/researcher-260302-0846-audio-generation.md)
- [Countdown Animations](../reports/researcher-260302-0846-countdown-animations.md)
- [Tech Stack](../reports/researcher-260302-0859-tech-stack-recommendation.md)
