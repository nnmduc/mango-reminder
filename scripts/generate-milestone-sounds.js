#!/usr/bin/env node
/**
 * Generate milestone notification sounds for Mango Reminder
 * Creates kid-friendly audio files optimized for Web Audio API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple WAV file generator
class WavGenerator {
  constructor(sampleRate = 44100) {
    this.sampleRate = sampleRate;
  }

  generateChime(frequencies, noteDuration = 0.15, totalDuration = 0.4) {
    const samples = Math.floor(this.sampleRate * totalDuration);
    const buffer = new Float32Array(samples);

    frequencies.forEach((freq, i) => {
      const startSample = Math.floor(i * noteDuration * this.sampleRate);
      const duration = Math.floor(noteDuration * this.sampleRate);

      for (let j = 0; j < duration && startSample + j < samples; j++) {
        const t = j / this.sampleRate;
        const envelope = Math.exp(-5 * t / noteDuration);
        buffer[startSample + j] += Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
      }
    });

    return buffer;
  }

  generateBell(frequency, duration = 0.5) {
    const samples = Math.floor(this.sampleRate * duration);
    const buffer = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const t = i / this.sampleRate;
      const envelope = Math.exp(-3 * t);
      const fundamental = Math.sin(2 * Math.PI * frequency * t);
      const harmonic2 = Math.sin(2 * Math.PI * frequency * 2.4 * t) * 0.3;
      const harmonic3 = Math.sin(2 * Math.PI * frequency * 3.8 * t) * 0.2;
      buffer[i] = (fundamental + harmonic2 + harmonic3) * envelope * 0.2;
    }

    return buffer;
  }

  generateTwoTone(freq1, freq2, toneDuration = 0.2, totalDuration = 0.35) {
    const samples = Math.floor(this.sampleRate * totalDuration);
    const buffer = new Float32Array(samples);

    // First tone
    const tone1Samples = Math.floor(toneDuration * this.sampleRate);
    for (let i = 0; i < tone1Samples; i++) {
      const t = i / this.sampleRate;
      const envelope = 0.5 * (1 - Math.cos(Math.PI * t / toneDuration));
      buffer[i] = Math.sin(2 * Math.PI * freq1 * t) * envelope * 0.3;
    }

    // Second tone
    const offset = Math.floor((toneDuration + 0.05) * this.sampleRate);
    for (let i = 0; i < tone1Samples && offset + i < samples; i++) {
      const t = i / this.sampleRate;
      const envelope = 0.5 * (1 - Math.cos(Math.PI * t / toneDuration));
      buffer[offset + i] = Math.sin(2 * Math.PI * freq2 * t) * envelope * 0.3;
    }

    return buffer;
  }

  generateTripleBeep(frequency, beepDuration = 0.1, totalDuration = 0.6) {
    const samples = Math.floor(this.sampleRate * totalDuration);
    const buffer = new Float32Array(samples);

    for (let beep = 0; beep < 3; beep++) {
      const startSample = Math.floor(beep * (beepDuration + 0.08) * this.sampleRate);
      const beepSamples = Math.floor(beepDuration * this.sampleRate);

      for (let i = 0; i < beepSamples && startSample + i < samples; i++) {
        const t = i / this.sampleRate;
        const envelope = Math.sin(Math.PI * t / beepDuration);
        buffer[startSample + i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
      }
    }

    return buffer;
  }

  generateCelebration() {
    const duration = 1.2;
    const samples = Math.floor(this.sampleRate * duration);
    const buffer = new Float32Array(samples);

    // Ascending fanfare: C-E-G-C
    const notes = [
      { freq: 523.25, start: 0, duration: 0.25 },
      { freq: 659.25, start: 0.2, duration: 0.25 },
      { freq: 783.99, start: 0.4, duration: 0.25 },
      { freq: 1046.50, start: 0.6, duration: 0.6 }
    ];

    notes.forEach(note => {
      const startSample = Math.floor(note.start * this.sampleRate);
      const noteSamples = Math.floor(note.duration * this.sampleRate);

      for (let i = 0; i < noteSamples && startSample + i < samples; i++) {
        const t = i / this.sampleRate;
        const envelope = Math.exp(-2 * t / note.duration);
        buffer[startSample + i] += Math.sin(2 * Math.PI * note.freq * t) * envelope * 0.25;
      }
    });

    // Add sparkle harmonics
    for (let i = Math.floor(0.6 * this.sampleRate); i < samples; i++) {
      const t = i / this.sampleRate;
      buffer[i] += Math.sin(2 * Math.PI * 2093 * t) * Math.random() * 0.05;
    }

    return buffer;
  }

  bufferToWav(buffer) {
    const bytesPerSample = 2;
    const blockAlign = bytesPerSample;
    const byteRate = this.sampleRate * blockAlign;
    const dataSize = buffer.length * bytesPerSample;
    const headerSize = 44;
    const fileSize = headerSize + dataSize;

    const wav = Buffer.alloc(fileSize);
    let offset = 0;

    // RIFF chunk descriptor
    wav.write('RIFF', offset); offset += 4;
    wav.writeUInt32LE(fileSize - 8, offset); offset += 4;
    wav.write('WAVE', offset); offset += 4;

    // fmt sub-chunk
    wav.write('fmt ', offset); offset += 4;
    wav.writeUInt32LE(16, offset); offset += 4; // Subchunk1Size (16 for PCM)
    wav.writeUInt16LE(1, offset); offset += 2;  // AudioFormat (1 for PCM)
    wav.writeUInt16LE(1, offset); offset += 2;  // NumChannels (1 for mono)
    wav.writeUInt32LE(this.sampleRate, offset); offset += 4;
    wav.writeUInt32LE(byteRate, offset); offset += 4;
    wav.writeUInt16LE(blockAlign, offset); offset += 2;
    wav.writeUInt16LE(16, offset); offset += 2; // BitsPerSample

    // data sub-chunk
    wav.write('data', offset); offset += 4;
    wav.writeUInt32LE(dataSize, offset); offset += 4;

    // Write audio data
    for (let i = 0; i < buffer.length; i++) {
      const sample = Math.max(-1, Math.min(1, buffer[i]));
      wav.writeInt16LE(Math.round(sample * 0x7FFF), offset);
      offset += 2;
    }

    return wav;
  }

  saveWav(buffer, filename) {
    const wav = this.bufferToWav(buffer);
    fs.writeFileSync(filename, wav);
    const sizeKB = (wav.length / 1024).toFixed(2);
    console.log(`✓ Generated: ${filename} (${sizeKB} KB)`);
  }
}

// Main execution
const outputDir = path.join(__dirname, '../public/sounds');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const generator = new WavGenerator(44100);

console.log('🎵 Generating milestone notification sounds...\n');

// Generate all sounds
const sounds = [
  {
    name: 'milestone-halfway.wav',
    buffer: generator.generateChime([261.63, 329.63, 392.00], 0.15, 0.4),
    desc: 'Cheerful ascending C-E-G chime (50% milestone)'
  },
  {
    name: 'milestone-15min.wav',
    buffer: generator.generateBell(440, 0.5),
    desc: 'Gentle bell tone (15 minutes remaining)'
  },
  {
    name: 'milestone-5min.wav',
    buffer: generator.generateTwoTone(523.25, 659.25, 0.2, 0.35),
    desc: 'Two-tone alert (5 minutes remaining)'
  },
  {
    name: 'milestone-1min.wav',
    buffer: generator.generateTripleBeep(587.33, 0.1, 0.6),
    desc: 'Triple beep (1 minute remaining)'
  },
  {
    name: 'celebration.wav',
    buffer: generator.generateCelebration(),
    desc: 'Celebration fanfare (timer complete)'
  }
];

sounds.forEach(sound => {
  const filepath = path.join(outputDir, sound.name);
  generator.saveWav(sound.buffer, filepath);
  console.log(`  → ${sound.desc}\n`);
});

console.log('✨ All sounds generated successfully!');
console.log(`📁 Location: ${outputDir}`);
console.log('\n💡 Next steps:');
console.log('   1. Test sounds in your browser');
console.log('   2. Optionally convert to MP3 with: ffmpeg -i file.wav -b:a 128k file.mp3');
console.log('   3. Update src/hooks/useAudio.ts to load these files\n');
