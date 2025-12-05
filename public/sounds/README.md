# Sound Effects

## Required Audio Files

### 1. Door Creak (`door-creak.mp3`)
- **Duration**: 1-2 seconds
- **File Size**: < 100KB
- **Format**: MP3 or OGG
- **Sample Rate**: 44.1kHz
- **Channels**: Mono or Stereo
- **Description**: Old, creaky wooden door opening sound with rusty hinges

### 2. Bone Rattle (`bone-rattle.mp3`)
- **Duration**: 0.5-1 seconds
- **File Size**: < 50KB
- **Format**: MP3 or OGG
- **Sample Rate**: 44.1kHz
- **Channels**: Mono or Stereo
- **Description**: Subtle rattling or scraping bone sounds, dry and hollow

### 3. Whoosh (`whoosh.mp3`)
- **Duration**: 1-2 seconds
- **File Size**: < 100KB
- **Format**: MP3 or OGG
- **Sample Rate**: 44.1kHz
- **Channels**: Mono or Stereo
- **Description**: Ominous wind or rushing air sound, building in intensity

## Recommended Sources

### Free Sound Libraries

#### 1. Freesound.org (https://freesound.org)
- Largest free sound library
- Requires free account
- Check licenses (CC0, CC-BY)
- Search terms:
  - "door creak", "wooden door", "rusty hinge"
  - "bone rattle", "skeleton", "bones rattling"
  - "whoosh", "wind rush", "air swoosh"

#### 2. Zapsplat (https://www.zapsplat.com)
- Free with attribution
- High-quality sounds
- Categories: Doors, Horror, Whooshes

#### 3. BBC Sound Effects (https://sound-effects.bbcrewind.co.uk)
- 16,000+ free sounds
- RemArc license (free for non-commercial)
- Professional quality

#### 4. Sonniss Game Audio GDC Bundles
- Annual free bundles
- Professional game audio
- Royalty-free

### Paid Options

1. **Epidemic Sound** (https://www.epidemicsound.com)
   - Subscription-based
   - Commercial license included

2. **AudioJungle** (https://audiojungle.net)
   - Individual purchase
   - Wide selection

3. **Pro Sound Effects** (https://www.prosoundeffects.com)
   - Professional library
   - High quality

## Audio Optimization

### Compression Settings (using Audacity or similar)
1. Import audio file
2. Trim silence from start/end
3. Normalize to -3dB
4. Export as MP3:
   - Bitrate: 128kbps (good quality/size balance)
   - Sample rate: 44100 Hz
   - Channels: Mono (for smaller size) or Stereo

### File Size Reduction
- Use mono instead of stereo if spatial audio not critical
- Lower bitrate to 96kbps if quality acceptable
- Trim unnecessary silence
- Use OGG format for better compression (if browser support OK)

## Implementation Notes

The `AudioManager` utility will:
- Load these sounds on first door interaction (lazy loading)
- Use Three.js PositionalAudio for spatial positioning
- Position sounds at door location for realism
- Handle missing files gracefully (silent fallback)

## Current Status
**TODO**: Download and add the following files:
- [ ] `door-creak.mp3`
- [ ] `bone-rattle.mp3`
- [ ] `whoosh.mp3`

## Testing Sounds
After adding files, test with:
```javascript
const audio = new Audio('/sounds/door-creak.mp3');
audio.play();
```
