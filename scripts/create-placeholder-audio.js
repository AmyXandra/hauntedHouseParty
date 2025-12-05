#!/usr/bin/env node

/**
 * Creates placeholder audio files for development
 * These are minimal valid MP3 files that can be replaced with actual sound effects later
 * No external dependencies required - uses Node.js built-in modules
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SOUNDS_DIR = path.join(__dirname, '..', 'public', 'sounds')

// Minimal valid MP3 file header (silent audio)
// This is a valid MP3 frame with no audio data
const createMinimalMP3 = (durationSeconds) => {
  // MP3 frame header for MPEG-1 Layer 3, 44.1kHz, mono, 32kbps
  const frameHeader = Buffer.from([
    0xFF, 0xFB, // Sync word + MPEG-1 Layer 3
    0x90, 0x00, // 44.1kHz, mono, 32kbps, no padding
  ])
  
  // Calculate approximate number of frames needed
  // At 32kbps and 44.1kHz, each frame is ~26ms
  const framesNeeded = Math.ceil(durationSeconds / 0.026)
  
  // Create a buffer with repeated frames
  const frameSize = 104 // Bytes per frame at 32kbps
  const totalSize = framesNeeded * frameSize
  const buffer = Buffer.alloc(totalSize)
  
  // Fill with frame headers
  for (let i = 0; i < framesNeeded; i++) {
    frameHeader.copy(buffer, i * frameSize)
  }
  
  return buffer
}

// Create sounds directory if it doesn't exist
if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR, { recursive: true })
}

console.log('Creating placeholder audio files...\n')

// Create door-creak.mp3 (1.5 seconds)
const doorCreak = createMinimalMP3(1.5)
fs.writeFileSync(path.join(SOUNDS_DIR, 'door-creak.mp3'), doorCreak)
console.log('✓ Created door-creak.mp3 (1.5s, ' + doorCreak.length + ' bytes)')

// Create bone-rattle.mp3 (0.8 seconds)
const boneRattle = createMinimalMP3(0.8)
fs.writeFileSync(path.join(SOUNDS_DIR, 'bone-rattle.mp3'), boneRattle)
console.log('✓ Created bone-rattle.mp3 (0.8s, ' + boneRattle.length + ' bytes)')

// Create whoosh.mp3 (1.2 seconds)
const whoosh = createMinimalMP3(1.2)
fs.writeFileSync(path.join(SOUNDS_DIR, 'whoosh.mp3'), whoosh)
console.log('✓ Created whoosh.mp3 (1.2s, ' + whoosh.length + ' bytes)')

console.log('\n✓ Placeholder audio files created successfully!')
console.log('\nFiles created in: ' + SOUNDS_DIR)
console.log('\nNote: These are silent placeholder files. Replace them with actual sound effects.')
console.log('See public/sounds/README.md for sourcing recommendations.')
