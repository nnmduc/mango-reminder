# 🥭 Mango Reminder

A **kid-friendly countdown timer** PWA built for iPad and tablets. Designed to help children stay aware of time during daily activities — meals, homework, TV, and more.

🌐 **Live demo:** [mango.scout.vn](https://mango.scout.vn)

---

## 🌟 Why This Exists

Traditional timers (like Apple's built-in Clock app) have two big problems for kids:

1. **No Screen Wake Lock** — the screen dims and locks, so kids lose track of time
2. **Not kid-friendly** — the UI is designed for adults, not engaging or readable for children

**Mango Reminder** solves both. The screen stays on for the full duration, and the interface is colorful, emoji-driven, and immediately understandable — even for young children who can't read yet.

---

## ✨ Features

- ⏱️ **Countdown timer** with large, clear display
- 🔒 **Screen Wake Lock** — keeps the iPad screen on (no more dimming mid-meal)
- 🍽️ **Preset activities** — Meal Time, Homework, TV Time (and more)
- ➕ **Custom presets** — add your own activities with emoji + color
- 🔔 **Audio milestones** — gentle sound cues at halfway, 5 min, 1 min remaining
- 🎉 **Completion celebration** — fun animation + sound when time's up
- 📱 **PWA** — install it on the home screen like a native app
- 🌐 **Works offline** — no internet needed after first load

---

## 🎯 Use Cases

| Activity | Default Duration |
|----------|-----------------|
| 🍽️ Meal Time | 30 minutes |
| 📚 Homework | 45 minutes |
| 📺 TV Time | 20 minutes |

Add any custom activity with a custom emoji, color, and duration.

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Animations | Framer Motion + CSS |
| Styling | CSS Modules |
| Audio | Web Audio API (no dependencies) |
| PWA | vite-plugin-pwa + Service Worker |
| Hosting | Vercel (HTTPS required for Wake Lock) |

**Browser requirements:** iPad Safari 16.4+ (iOS 16.4+) for full Wake Lock support.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ActivitySelector/   # Activity picker cards
│   ├── CountdownDisplay/   # Timer display + controls
│   ├── Layout/             # App shell layout
│   └── PresetEditor/       # Custom activity editor
├── hooks/
│   ├── use-countdown.ts    # Countdown timer logic
│   ├── use-audio.ts        # Audio playback + milestones
│   ├── use-audio-permission.ts  # Web Audio API autoplay handling
│   ├── use-wake-lock.ts    # Screen Wake Lock API
│   ├── use-presets.ts      # Custom presets persistence
│   └── use-reduced-motion.ts   # Accessibility: prefers-reduced-motion
└── types/
    └── activity.ts         # Activity type definitions
```

---

## 🧒 Designed For Kids

- Large emoji-based activity cards — easy to recognize
- Soft pastel color palette — easy on the eyes
- Big, bold countdown numbers — visible from across the table
- Simple two-screen flow: pick activity → watch timer

---

## 📄 License

MIT © 2026 — built with ❤️ for Mango.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a pull request

