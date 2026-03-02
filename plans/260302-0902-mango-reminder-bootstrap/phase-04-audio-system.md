# Phase 4: Audio System

## Context Links

- [Audio Generation Report](../reports/researcher-260302-0846-audio-generation.md)
- [Main Plan](./plan.md)
- [Phase 3: Animations](./phase-03-animations.md)

## Overview

**Priority:** P2 - Enhancement
**Status:** pending
**Description:** Implement milestone notification sounds using Web Audio API with pre-generated MP3 files

## Key Insights

From Audio Research:
- Web Audio API preferred over Tone.js (zero library overhead)
- Pre-generated MP3s for reliability (not runtime AI generation)
- User gesture required before audio can play (mobile autoplay policy)
- Kid-friendly sounds: 300-2000 Hz, 300-500ms duration, -15 to -10 dB
- Rising pitch = positive/encouraging; falling = completion

## Requirements

### Functional
- Play notification sound at milestones:
  - Halfway point (50%)
  - 15 minutes remaining
  - 5 minutes remaining
  - 1 minute remaining
  - Timer complete (celebration)
- Sounds must be kid-friendly and non-startling
- Mute toggle accessible during countdown

### Non-Functional
- <50ms audio latency
- Works on iPad Safari
- Total audio assets <500KB
- Graceful fallback if audio blocked

## Architecture

```
src/
  hooks/
    useAudio.ts              # Audio playback hook
    useAudioPermission.ts    # Handle autoplay policy
  assets/
    sounds/
      milestone-halfway.mp3  # Cheerful chime
      milestone-15min.mp3    # Gentle reminder
      milestone-5min.mp3     # Alert tone
      milestone-1min.mp3     # Urgent but friendly
      celebration.mp3        # Completion fanfare
public/
  sounds/                    # Served statically
    (same files)
```

## Related Code Files

### Create
- `src/hooks/useAudio.ts`
- `src/hooks/useAudioPermission.ts`
- `src/assets/sounds/milestone-halfway.mp3`
- `src/assets/sounds/milestone-15min.mp3`
- `src/assets/sounds/milestone-5min.mp3`
- `src/assets/sounds/milestone-1min.mp3`
- `src/assets/sounds/celebration.mp3`

### Modify
- `src/hooks/useCountdown.ts` - Trigger audio at milestones
- `src/components/CountdownDisplay/CountdownDisplay.tsx` - Add mute toggle

## Implementation Steps

1. **Generate/Source audio files**
   - Use ElevenLabs Sound Effects or Freepik/Zapsplat
   - Requirements per sound:
     - Duration: 300-800ms
     - Format: MP3 128kbps
     - Size: ~30-50KB each
   - Sound design:
     - `milestone-halfway.mp3`: Ascending C-E-G chime (cheerful)
     - `milestone-15min.mp3`: Single bell tone (gentle)
     - `milestone-5min.mp3`: Two-tone alert (slightly urgent)
     - `milestone-1min.mp3`: Quick triple beep (urgent but friendly)
     - `celebration.mp3`: Fanfare with sparkle (1-2 seconds)

2. **Create useAudioPermission hook**
   ```typescript
   interface AudioPermissionState {
     canPlayAudio: boolean
     isUnlocked: boolean
     requestPermission: () => Promise<boolean>
   }

   function useAudioPermission(): AudioPermissionState {
     // Create AudioContext on first user gesture
     // Store permission state in localStorage
   }
   ```

3. **Create useAudio hook**
   ```typescript
   interface UseAudioOptions {
     preload?: boolean
   }

   interface UseAudioReturn {
     play: (soundId: SoundId) => void
     stop: () => void
     isMuted: boolean
     toggleMute: () => void
     isLoaded: boolean
   }

   type SoundId = 'halfway' | '15min' | '5min' | '1min' | 'celebration'

   function useAudio(options?: UseAudioOptions): UseAudioReturn
   ```

4. **Implement Web Audio API playback**
   ```typescript
   // Create audio context on user gesture
   let audioContext: AudioContext | null = null

   function initAudioContext(): AudioContext {
     if (!audioContext) {
       audioContext = new (window.AudioContext || window.webkitAudioContext)()
     }
     return audioContext
   }

   async function playSound(url: string): Promise<void> {
     const ctx = initAudioContext()
     const response = await fetch(url)
     const arrayBuffer = await response.arrayBuffer()
     const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

     const source = ctx.createBufferSource()
     source.buffer = audioBuffer
     source.connect(ctx.destination)
     source.start(0)
   }
   ```

5. **Preload audio on app start**
   - Decode all audio files on first user interaction
   - Cache decoded buffers in memory
   - Instant playback from cache

6. **Integrate with useCountdown**
   ```typescript
   // In useCountdown, detect milestone crossings
   const previousProgress = useRef(0)

   useEffect(() => {
     const milestones = [
       { threshold: 0.5, sound: 'halfway' },
       { threshold: 0.67, sound: '15min' },  // 15min/45min = 0.67
       { threshold: 0.83, sound: '5min' },
       { threshold: 0.97, sound: '1min' },
     ]

     milestones.forEach(({ threshold, sound }) => {
       if (previousProgress.current < threshold && progress >= threshold) {
         playSound(sound)
       }
     })

     previousProgress.current = progress
   }, [progress])
   ```

7. **Add mute toggle UI**
   - Speaker icon button in CountdownDisplay
   - Persist mute preference in localStorage
   - Visual indicator of mute state

8. **Handle audio permission prompt**
   - On first activity selection, unlock audio context
   - Show toast if audio blocked with instructions
   - Fallback: visual-only feedback if audio unavailable

## Sound Generation Script

For generating sounds with AI (optional):
```bash
# Using ElevenLabs Sound Effects API (if available)
# Or download from Freepik/Zapsplat free libraries

# Specifications:
# - Sample rate: 44100 Hz
# - Channels: Mono (reduces file size)
# - Bitrate: 128 kbps
# - Normalize to -10 dB
```

## Todo List

- [ ] Source/generate 5 notification sound files
- [ ] Optimize audio files (mono, 128kbps, <50KB each)
- [ ] Create useAudioPermission hook
- [ ] Create useAudio hook with preloading
- [ ] Implement Web Audio API playback
- [ ] Cache decoded audio buffers
- [ ] Integrate milestone detection in useCountdown
- [ ] Add mute toggle button to CountdownDisplay
- [ ] Persist mute preference in localStorage
- [ ] Test audio playback on iPad Safari
- [ ] Handle autoplay policy gracefully
- [ ] Add visual feedback when audio blocked

## Success Criteria

- Audio plays at each milestone point
- No audible latency (<50ms)
- Mute toggle works and persists
- Graceful handling when audio blocked
- Sounds are pleasant and kid-appropriate
- Total audio bundle <300KB

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| iPad Safari blocks audio | Unlock on first tap, show UI feedback |
| Audio latency | Preload and decode all sounds upfront |
| Sound too loud/startling | Test with kids, normalize to -10 dB |
| AudioContext suspended | Resume on visibility change |

## Security Considerations

- Audio files served from same origin
- No external audio URLs loaded
- Mute preference stored locally only

## Next Steps

After completion, proceed to [Phase 5: Screen Wake Lock](./phase-05-screen-wake-lock.md)
