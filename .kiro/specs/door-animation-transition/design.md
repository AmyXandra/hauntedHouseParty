# Design Document

## Overview

This design document outlines the technical approach for implementing an immersive door transition animation in the haunted house game hub. When users click the door, a multi-stage animation sequence will execute: the door swings open to the right, a skeleton hand emerges from the darkness, and the hand drags the camera into the selected game with a fade transition.

The implementation leverages React Three Fiber's animation capabilities, Three.js for 3D transformations, and React's state management for coordinating the animation sequence. The design prioritizes smooth performance, modular architecture, and graceful degradation if assets fail to load.

## Architecture

### Component Structure

```
DoorTransitionSystem
├── Door (enhanced with animation state)
├── SkeletonHand (new component)
├── TransitionController (new hook)
├── CameraTransition (new component)
└── AudioManager (new utility)
```

### Animation State Machine

The transition follows a finite state machine with these states:

1. **IDLE** - Door is closed, waiting for interaction
2. **DOOR_OPENING** - Door rotating 90° to the right (1.2s)
3. **HAND_EMERGING** - Skeleton hand extending from doorway (0.8s)
4. **HAND_PAUSED** - Brief pause before drag (0.3s)
5. **DRAGGING** - Camera moving toward door (1.0s)
6. **FADING** - Screen fading to black (0.5s)
7. **NAVIGATING** - Route transition to game
8. **RESETTING** - Returning to idle state

### Data Flow

```
User Click → TransitionController
  ↓
State: DOOR_OPENING
  ↓ (triggers at 80% completion)
State: HAND_EMERGING
  ↓ (on completion)
State: HAND_PAUSED
  ↓ (after 0.3s)
State: DRAGGING + GameSelector.selectGame()
  ↓ (at 70% completion)
State: FADING
  ↓ (on completion)
State: NAVIGATING → Router.navigate(selectedGame)
  ↓ (on return to home)
State: RESETTING → IDLE
```

## Components and Interfaces

### Enhanced Door Component

```typescript
interface DoorAnimationState {
  state: AnimationState
  rotation: number // 0 to Math.PI/2 (90 degrees)
  isAnimating: boolean
}

interface EnhancedDoorProps extends DoorProps {
  textures: TextureSet
  onClick: () => void
  animationState: DoorAnimationState
}
```

The Door component will:
- Use a `<group>` with pivot point at left edge for rotation
- Animate rotation using `useFrame` hook
- Apply easing function (ease-in-out cubic) for smooth motion
- Disable pointer events during animation

### SkeletonHand Component

```typescript
interface SkeletonHandProps {
  visible: boolean
  animationProgress: number // 0 to 1
  position: Position3D
}
```

The SkeletonHand component will:
- Load a GLTF/GLB 3D model of a skeletal hand
- Position initially inside the doorway (z = 2, y = 1.5)
- Extend forward and slightly down as animationProgress increases
- Use `MeshStandardMaterial` with bone-like properties (off-white color, medium roughness)
- Cast shadows for realism
- Include subtle finger articulation using bone animations from the model

**Model Requirements:**
- Low-poly count (< 5000 triangles) for performance
- Rigged with basic bone structure for finger animation
- Textured with aged bone appearance
- Format: GLB (preferred) or GLTF

### TransitionController Hook

```typescript
interface TransitionConfig {
  doorDuration: number // 1.2s
  handDuration: number // 0.8s
  pauseDuration: number // 0.3s
  dragDuration: number // 1.0s
  fadeDuration: number // 0.5s
}

interface TransitionState {
  currentState: AnimationState
  progress: number // 0 to 1 for current state
  totalElapsed: number
  selectedGame: Game | null
}

function useTransitionController(
  config: TransitionConfig,
  onComplete: (game: Game) => void
): {
  state: TransitionState
  startTransition: () => void
  reset: () => void
}
```

The hook will:
- Manage the animation state machine
- Track elapsed time using `useFrame`
- Calculate progress for each animation phase
- Trigger game selection at appropriate time
- Invoke navigation callback when complete
- Provide reset function for returning to home

### CameraTransition Component

```typescript
interface CameraTransitionProps {
  isActive: boolean
  progress: number // 0 to 1
  targetPosition: Position3D // door position
}
```

This component will:
- Use `useThree()` to access camera
- Interpolate camera position toward door
- Apply slight downward tilt (rotation) for "being pulled" effect
- Use ease-in easing for acceleration effect
- Store initial camera position for reset

### AudioManager Utility

```typescript
interface TransitionSounds {
  doorCreak: string // path to audio file
  boneRattle: string
  whoosh: string
}

class AudioManager {
  private sounds: Map<string, THREE.Audio>
  private listener: THREE.AudioListener
  
  loadSounds(sounds: TransitionSounds): Promise<void>
  play(soundName: string, position?: Position3D): void
  stop(soundName: string): void
  fadeOut(soundName: string, duration: number): void
}
```

The AudioManager will:
- Use Three.js PositionalAudio for spatial sound
- Load audio files during app initialization
- Position sounds at door location for realism
- Handle fade-out during transition completion
- Provide fallback if Web Audio API unavailable

## Data Models

### AnimationState Enum

```typescript
enum AnimationState {
  IDLE = 'IDLE',
  DOOR_OPENING = 'DOOR_OPENING',
  HAND_EMERGING = 'HAND_EMERGING',
  HAND_PAUSED = 'HAND_PAUSED',
  DRAGGING = 'DRAGGING',
  FADING = 'FADING',
  NAVIGATING = 'NAVIGATING',
  RESETTING = 'RESETTING'
}
```

### TransitionTimeline

```typescript
interface TransitionTimeline {
  doorOpen: { start: 0, end: 1.2 }
  handEmerge: { start: 0.96, end: 1.76 } // starts at 80% of door
  handPause: { start: 1.76, end: 2.06 }
  drag: { start: 2.06, end: 3.06 }
  fade: { start: 2.76, end: 3.26 } // starts at 70% of drag
  navigate: { start: 3.26 }
}
```

### EasingFunctions

```typescript
type EasingFunction = (t: number) => number

const easings = {
  easeInOutCubic: (t: number) => 
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3)
}
```

## Correctn
ess Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Click triggers rotation start
*For any* door component in idle state, when clicked, the rotation value should begin changing from 0 within the next frame update.
**Validates: Requirements 1.1**

### Property 2: Animation timing accuracy
*For any* animation phase (door open, hand emerge, drag), when the configured duration elapses, the animation progress should equal 1.0 (complete).
**Validates: Requirements 1.2, 2.3, 3.3**

### Property 3: Easing function application
*For any* door opening animation, at t=0.5 (50% time elapsed), the rotation should not equal Math.PI/4 (45 degrees), indicating non-linear easing is applied.
**Validates: Requirements 1.3**

### Property 4: Animation completion persistence
*For any* door that has completed opening animation, the rotation should remain at Math.PI/2 on all subsequent frames until reset.
**Validates: Requirements 1.4**

### Property 5: Click prevention during animation
*For any* door in non-idle animation state, clicking should not change the animation state or restart the sequence.
**Validates: Requirements 1.5, 9.3**

### Property 6: Hand emergence timing coordination
*For any* transition sequence, when door animation progress reaches 0.8, the skeleton hand visibility should become true within the next frame.
**Validates: Requirements 2.1**

### Property 7: Hand position progression
*For any* skeleton hand animation, the initial z-position should be less than the final z-position (moving forward toward camera).
**Validates: Requirements 2.2**

### Property 8: Hand material properties
*For any* skeleton hand mesh, the material should have roughness > 0.3 and color in the off-white range (RGB values > 200).
**Validates: Requirements 2.4**

### Property 9: Hand pause state transition
*For any* transition sequence, when hand animation completes, the state should transition to HAND_PAUSED before DRAGGING.
**Validates: Requirements 2.5**

### Property 10: Camera drag initiation
*For any* transition sequence, when entering DRAGGING state, the camera position should begin changing within the next frame.
**Validates: Requirements 3.1**

### Property 11: Camera movement direction
*For any* camera drag animation, the camera z-position should increase (moving forward) and y-position should decrease (moving down) throughout the animation.
**Validates: Requirements 3.2**

### Property 12: Fade timing coordination
*For any* drag transition, when progress reaches 0.7, the fade state should become active within the next frame.
**Validates: Requirements 3.4**

### Property 13: Configurable animation durations
*For any* transition configuration with custom duration values, the actual animation durations should match the configured values within 50ms tolerance.
**Validates: Requirements 4.1**

### Property 14: State change observability
*For any* animation state transition, registered state change callbacks should be invoked with the new state value.
**Validates: Requirements 4.3**

### Property 15: Shadow casting enabled
*For any* skeleton hand mesh, the castShadow property should be set to true.
**Validates: Requirements 5.2**

### Property 16: Performance under concurrent animations
*For any* complete transition sequence, the frame time should remain below 33ms (30fps minimum) throughout all animation phases.
**Validates: Requirements 6.1, 6.3**

### Property 17: Model polygon count optimization
*For any* loaded skeleton hand model, the total triangle count should be less than 5000.
**Validates: Requirements 6.2**

### Property 18: Resource cleanup on completion
*For any* completed transition sequence, animation frame callbacks should be removed and object references should be cleared.
**Validates: Requirements 6.5**

### Property 19: Game selection timing
*For any* transition sequence, the GameSelector should be invoked when the state transitions to DRAGGING.
**Validates: Requirements 7.1**

### Property 20: Game preloading during transition
*For any* selected game, the game component loading should be initiated before the NAVIGATING state is reached.
**Validates: Requirements 7.2**

### Property 21: Navigation after fade
*For any* transition sequence, route navigation should occur only after fade animation completes.
**Validates: Requirements 3.5, 7.3**

### Property 22: Door reset on return
*For any* door component, when returning to home page, the rotation should reset to 0.
**Validates: Requirements 7.4**

### Property 23: Hand visibility reset
*For any* skeleton hand, when returning to home page, the visible property should be false.
**Validates: Requirements 7.5**

### Property 24: Door sound playback timing
*For any* transition sequence, when state transitions to DOOR_OPENING, the door creak audio should be triggered.
**Validates: Requirements 8.1**

### Property 25: Hand sound playback timing
*For any* transition sequence, when skeleton hand becomes visible, the bone rattle audio should be triggered.
**Validates: Requirements 8.2**

### Property 26: Drag sound playback timing
*For any* transition sequence, when state transitions to DRAGGING, the whoosh audio should be triggered.
**Validates: Requirements 8.3**

### Property 27: Spatial audio positioning
*For any* played transition sound, the audio object should be PositionalAudio with position set to door coordinates.
**Validates: Requirements 8.4**

### Property 28: Audio fadeout on completion
*For any* completed transition sequence, fadeOut should be called on all active audio sources.
**Validates: Requirements 8.5**

### Property 29: Fallback on model load failure
*For any* skeleton hand model that fails to load, the transition should skip hand-related states and proceed directly from door opening to dragging.
**Validates: Requirements 9.1**

### Property 30: State reset on interruption
*For any* interrupted transition sequence, the animation state should reset to IDLE and allow new interactions.
**Validates: Requirements 9.2**

### Property 31: Error handling with navigation fallback
*For any* transition sequence that encounters an error, navigation to a game should still complete successfully.
**Validates: Requirements 9.5**

## Error Handling

### Model Loading Failures

If the skeleton hand 3D model fails to load:
1. Log warning to console with error details
2. Set `handModelAvailable` flag to false
3. Skip HAND_EMERGING and HAND_PAUSED states
4. Transition directly from DOOR_OPENING to DRAGGING
5. Continue with camera drag and navigation

### Audio Loading Failures

If audio files fail to load:
1. Log warning to console
2. Continue animation sequence without audio
3. Set `audioAvailable` flag to false
4. Skip all audio playback calls

### Animation Interruption

If user navigates away or component unmounts during animation:
1. Cancel all active animation frame callbacks
2. Clear all timeouts and intervals
3. Stop and dispose of all audio sources
4. Reset animation state to IDLE
5. Restore camera to original position

### Performance Degradation

If frame rate drops below 20fps:
1. Log performance warning
2. Optionally reduce shadow quality
3. Optionally skip hand finger articulation
4. Continue with simplified animation

### State Machine Errors

If invalid state transition is attempted:
1. Log error with current and attempted states
2. Force reset to IDLE state
3. Allow user to retry interaction

## Testing Strategy

### Unit Testing Approach

**Animation State Machine Tests:**
- Test each state transition in isolation
- Verify state changes occur at correct timing thresholds
- Test invalid state transitions are rejected
- Mock time progression for deterministic tests

**Component Tests:**
- Test Door component renders and responds to clicks
- Test SkeletonHand component visibility and position updates
- Test CameraTransition component modifies camera correctly
- Mock Three.js objects to avoid WebGL context requirements

**Hook Tests:**
- Test useTransitionController state management
- Test timing calculations for each animation phase
- Test configuration parameter handling
- Test reset functionality

**Utility Tests:**
- Test easing functions return correct values
- Test AudioManager loads and plays sounds
- Test error handling in audio playback

### Property-Based Testing Approach

We will use **fast-check** for property-based testing in TypeScript.

**Property Test 1: Animation Timing Consistency**
- Generate random duration configurations (within reasonable bounds)
- Run transition with those durations
- Verify actual elapsed time matches configured time ± tolerance
- **Validates: Property 2, Property 13**

**Property Test 2: State Machine Validity**
- Generate random sequences of state transitions
- Verify only valid transitions are accepted
- Verify invalid transitions maintain current state
- **Validates: Property 14, Property 30**

**Property Test 3: Camera Movement Direction**
- Generate random initial camera positions
- Run drag animation
- Verify z increases and y decreases for all starting positions
- **Validates: Property 11**

**Property Test 4: Resource Cleanup**
- Generate random animation sequences (complete, interrupted, errored)
- Verify all callbacks are removed after sequence ends
- Verify no memory leaks by checking reference counts
- **Validates: Property 18**

**Property Test 5: Easing Function Non-Linearity**
- Generate random progress values between 0 and 1
- Apply easing function
- Verify output differs from linear interpolation
- **Validates: Property 3**

**Property Test 6: Audio Timing Coordination**
- Generate random animation configurations
- Track when audio play calls occur
- Verify audio triggers align with state transitions
- **Validates: Properties 24, 25, 26**

**Property Test 7: Fallback Behavior**
- Generate random failure scenarios (model load, audio load, errors)
- Verify navigation always completes successfully
- Verify user can always access games
- **Validates: Properties 29, 31**

### Integration Testing

**Full Transition Sequence Test:**
1. Render HauntedHousePage with Door component
2. Simulate click on door
3. Advance time through entire animation sequence
4. Verify each state transition occurs at correct time
5. Verify navigation to game occurs
6. Verify all resources are cleaned up

**Return to Home Test:**
1. Complete full transition to game
2. Navigate back to home page
3. Verify door is reset to closed position
4. Verify skeleton hand is hidden
5. Verify new transition can be triggered

**Performance Test:**
1. Run full transition sequence
2. Monitor frame times throughout
3. Verify frame time stays below 33ms threshold
4. Test on various hardware configurations

### Test Configuration

- Minimum test iterations for property tests: 100
- Each property-based test should be tagged with: `**Feature: door-animation-transition, Property {number}: {property_text}**`
- Use Vitest for test runner
- Use React Testing Library for component tests
- Use @react-three/test-renderer for R3F component tests
- Mock time using Vitest's `vi.useFakeTimers()`

## Implementation Notes

### Performance Optimizations

1. **Lazy Load Skeleton Hand Model**: Only load the GLTF model when door is first clicked, not on initial page load
2. **Reuse Materials**: Create skeleton hand material once and reuse across renders
3. **Throttle State Updates**: Batch state updates to minimize re-renders
4. **Use useRef for Animation Values**: Store animation progress in refs to avoid triggering re-renders
5. **Dispose Resources**: Properly dispose of Three.js geometries, materials, and textures on unmount

### Accessibility Considerations

1. **Keyboard Support**: Allow Enter/Space key to trigger door interaction
2. **Reduced Motion**: Respect `prefers-reduced-motion` media query - skip animations if user prefers
3. **Screen Reader**: Provide ARIA labels for door interaction state
4. **Focus Management**: Maintain focus on door during animation, transfer to game on navigation

### Browser Compatibility

- Target modern browsers with WebGL 2.0 support
- Fallback to WebGL 1.0 if 2.0 unavailable
- Test on Chrome, Firefox, Safari, Edge
- Provide warning message for browsers without WebGL support

### Asset Requirements

**3D Model:**
- Skeleton hand model in GLB format
- < 5000 triangles
- Rigged with basic bone structure
- Textured with bone appearance
- File size < 500KB

**Audio Files:**
- Door creak: MP3/OGG, < 100KB, 1-2 seconds
- Bone rattle: MP3/OGG, < 50KB, 0.5-1 seconds  
- Whoosh: MP3/OGG, < 100KB, 1-2 seconds
- Sample rate: 44.1kHz, mono or stereo

**Texture Files (if not included in GLB):**
- Bone color/diffuse: 512x512 WebP
- Bone normal map: 512x512 WebP
- Bone roughness: 512x512 WebP

## Dependencies

### New Dependencies Required

```json
{
  "@react-three/drei": "^10.7.7", // Already installed - provides useGLTF
  "three": "^0.174.0", // Already installed
  "fast-check": "^4.3.0" // Already installed for property-based testing
}
```

No new dependencies required - all necessary libraries are already in the project.

### File Structure

```
src/
├── components/
│   ├── scene/
│   │   ├── Door.tsx (enhanced)
│   │   ├── Door.test.tsx (new)
│   │   ├── SkeletonHand.tsx (new)
│   │   ├── SkeletonHand.test.tsx (new)
│   │   └── CameraTransition.tsx (new)
│   └── ...
├── hooks/
│   ├── useTransitionController.ts (new)
│   ├── useTransitionController.test.ts (new)
│   └── ...
├── utils/
│   ├── AudioManager.ts (new)
│   ├── AudioManager.test.ts (new)
│   ├── easingFunctions.ts (new)
│   └── easingFunctions.test.ts (new)
├── constants/
│   └── transitionConfig.ts (new)
└── types/
    └── index.ts (updated with new types)

public/
├── models/
│   └── skeleton-hand.glb (new)
└── sounds/
    ├── door-creak.mp3 (new)
    ├── bone-rattle.mp3 (new)
    └── whoosh.mp3 (new)
```

## Migration Strategy

Since this is an enhancement to existing functionality:

1. **Phase 1**: Implement core animation system without breaking existing door click behavior
   - Add animation state management
   - Implement door rotation animation
   - Keep existing navigation as fallback

2. **Phase 2**: Add skeleton hand component
   - Create SkeletonHand component
   - Integrate with animation sequence
   - Implement fallback if model fails to load

3. **Phase 3**: Add camera transition and audio
   - Implement CameraTransition component
   - Add AudioManager utility
   - Integrate audio with animation states

4. **Phase 4**: Polish and optimization
   - Add accessibility features
   - Optimize performance
   - Add comprehensive tests

This phased approach ensures the application remains functional throughout development.
