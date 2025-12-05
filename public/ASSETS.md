# Door Animation Transition Assets

This document describes the assets required for the door animation transition feature and their current status.

## Overview

The door animation transition requires:
1. A 3D skeleton hand model (GLB format)
2. Three sound effects (MP3 format)

## Current Status

### ✅ Sound Effects (Placeholder)
All sound effect files have been created as silent placeholders. They are valid MP3 files that can be played but contain no audio. Replace these with actual sound effects before production.

- **door-creak.mp3** - ✅ Created (placeholder)
- **bone-rattle.mp3** - ✅ Created (placeholder)
- **whoosh.mp3** - ✅ Created (placeholder)

Location: `public/sounds/`

### ⚠️ 3D Model (Procedural Fallback)
The skeleton hand 3D model is currently using a procedurally generated fallback. This works but is not as visually appealing as a proper 3D model would be.

- **skeleton-hand.glb** - ❌ Not yet sourced (using procedural fallback)

Location: `public/models/` (when added)

## Implementation Details

### Procedural Skeleton Hand
The application includes a procedural skeleton hand generator (`src/utils/proceduralSkeletonHand.ts`) that creates a simple hand geometry with:
- Palm and wrist bones
- Five fingers (thumb, index, middle, ring, pinky)
- Proper bone-like materials
- ~212 triangles (well under the 5000 limit)
- Shadow casting enabled

This procedural hand is automatically used when the GLB model is not available, ensuring the animation works even without the asset file.

### Audio Placeholders
The placeholder audio files are minimal valid MP3 files created using Node.js. They:
- Are valid MP3 format (can be loaded and played)
- Contain silent audio data
- Meet the duration requirements
- Are very small (~3-6KB each)
- Allow development and testing without actual sound effects

## Sourcing Real Assets

### For the Skeleton Hand Model
See `public/models/README.md` for:
- Detailed model requirements (format, polygon count, rigging)
- Recommended free sources (Sketchfab, Poly Pizza, Quaternius)
- Optimization steps using Blender
- How to export as GLB

### For Sound Effects
See `public/sounds/README.md` for:
- Detailed audio requirements (duration, file size, format)
- Recommended free sources (Freesound.org, Zapsplat, BBC Sound Effects)
- Audio optimization techniques
- Compression settings

## Replacing Placeholder Assets

### To Replace Sound Effects:
1. Download or create sound effects matching the specifications
2. Optimize them (see `public/sounds/README.md`)
3. Replace the files in `public/sounds/`:
   - `door-creak.mp3`
   - `bone-rattle.mp3`
   - `whoosh.mp3`
4. Test in the application

### To Add the Skeleton Hand Model:
1. Download or create a skeleton hand model
2. Optimize it (see `public/models/README.md`)
3. Save as `public/models/skeleton-hand.glb`
4. The application will automatically use it instead of the procedural fallback
5. Test in the application

## Testing Assets

### Test Sound Effects:
```javascript
// In browser console
const audio = new Audio('/sounds/door-creak.mp3');
audio.play();
```

### Test 3D Model:
1. Start the dev server: `npm run dev`
2. Click the door in the haunted house scene
3. Watch for the skeleton hand during the animation
4. Check browser console for any loading errors

## Asset Requirements Summary

| Asset | Format | Size Limit | Duration | Status |
|-------|--------|------------|----------|--------|
| skeleton-hand.glb | GLB | < 500KB | N/A | ⚠️ Procedural fallback |
| door-creak.mp3 | MP3 | < 100KB | 1-2s | ✅ Placeholder |
| bone-rattle.mp3 | MP3 | < 50KB | 0.5-1s | ✅ Placeholder |
| whoosh.mp3 | MP3 | < 100KB | 1-2s | ✅ Placeholder |

## Scripts

### Create Placeholder Audio Files
```bash
# Using Node.js (no dependencies)
node scripts/create-placeholder-audio.js

# Using ffmpeg (requires ffmpeg installed)
./scripts/create-placeholder-audio.sh
```

## Notes

- The application is fully functional with placeholder assets
- The procedural skeleton hand provides a working fallback
- Silent audio files allow testing of audio timing without actual sounds
- All asset loading includes error handling and graceful degradation
- The animation will work even if assets fail to load
