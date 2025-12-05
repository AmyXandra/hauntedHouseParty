# Implementation Plan

- [x] 1. Set up animation infrastructure and types
  - Create animation state enum and type definitions
  - Create transition configuration constants
  - Create easing function utilities
  - Update types/index.ts with new interfaces
  - _Requirements: 1.1, 4.1, 4.5_

- [x] 1.1 Write unit tests for easing functions
  - Test easeInOutCubic returns correct values at key points
  - Test easeInCubic acceleration behavior
  - Test easeOutCubic deceleration behavior
  - _Requirements: 1.3_

- [x] 1.2 Write property test for easing non-linearity
  - **Property 3: Easing function application**
  - **Validates: Requirements 1.3**

- [x] 2. Implement transition controller hook
  - Create useTransitionController hook with state machine
  - Implement timing calculations for each animation phase
  - Add state transition logic with proper sequencing
  - Implement reset functionality
  - _Requirements: 1.1, 1.2, 2.1, 2.5, 3.4, 4.1, 4.3_

- [x] 2.1 Write unit tests for transition controller
  - Test state transitions occur at correct times
  - Test invalid state transitions are rejected
  - Test reset functionality restores idle state
  - Test configuration parameter handling
  - _Requirements: 1.1, 4.1, 4.3_

- [x] 2.2 Write property test for animation timing accuracy
  - **Property 2: Animation timing accuracy**
  - **Validates: Requirements 1.2, 2.3, 3.3**

- [x] 2.3 Write property test for configurable durations
  - **Property 13: Configurable animation durations**
  - **Validates: Requirements 4.1**

- [x] 2.4 Write property test for state change observability
  - **Property 14: State change observability**
  - **Validates: Requirements 4.3**

- [x] 3. Enhance Door component with animation
  - Wrap door mesh in group with pivot point at left edge
  - Add animation state props to Door component
  - Implement rotation animation using useFrame
  - Add click prevention during animation
  - Apply easing function to rotation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3.1 Write unit tests for Door component
  - Test door renders with correct initial rotation
  - Test click triggers animation start
  - Test rotation reaches 90 degrees on completion
  - Test clicks are ignored during animation
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 3.2 Write property test for click triggers rotation
  - **Property 1: Click triggers rotation start**
  - **Validates: Requirements 1.1**

- [x] 3.3 Write property test for animation completion persistence
  - **Property 4: Animation completion persistence**
  - **Validates: Requirements 1.4**

- [x] 3.4 Write property test for click prevention
  - **Property 5: Click prevention during animation**
  - **Validates: Requirements 1.5, 9.3**

- [x] 4. Create SkeletonHand component
  - Create SkeletonHand component with GLTF loader
  - Implement visibility and position animation
  - Configure material properties (bone-like appearance)
  - Enable shadow casting
  - Add error handling for model load failures
  - _Requirements: 2.1, 2.2, 2.4, 5.2, 5.5, 9.1_

- [x] 4.1 Write unit tests for SkeletonHand component
  - Test hand renders when visible
  - Test hand position updates with animation progress
  - Test castShadow is enabled
  - Test fallback behavior on model load failure
  - _Requirements: 2.2, 5.2, 9.1_

- [x] 4.2 Write property test for hand emergence timing
  - **Property 6: Hand emergence timing coordination**
  - **Validates: Requirements 2.1**

- [x] 4.3 Write property test for hand position progression
  - **Property 7: Hand position progression**
  - **Validates: Requirements 2.2**

- [x] 4.4 Write property test for hand material properties
  - **Property 8: Hand material properties**
  - **Validates: Requirements 2.4**

- [x] 4.5 Write property test for shadow casting
  - **Property 15: Shadow casting enabled**
  - **Validates: Requirements 5.2**

- [x] 4.6 Write property test for model polygon count
  - **Property 17: Model polygon count optimization**
  - **Validates: Requirements 6.2**

- [x] 4.7 Write property test for fallback on model failure
  - **Property 29: Fallback on model load failure**
  - **Validates: Requirements 9.1**

- [x] 5. Implement CameraTransition component
  - Create CameraTransition component using useThree hook
  - Implement camera position interpolation toward door
  - Add slight downward rotation for "being pulled" effect
  - Apply ease-in easing for acceleration
  - Store and restore initial camera position
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 5.1 Write unit tests for CameraTransition
  - Test camera position changes when active
  - Test camera moves toward door position
  - Test camera resets to initial position
  - _Requirements: 3.1, 3.2_

- [x] 5.2 Write property test for camera drag initiation
  - **Property 10: Camera drag initiation**
  - **Validates: Requirements 3.1**

- [x] 5.3 Write property test for camera movement direction
  - **Property 11: Camera movement direction**
  - **Validates: Requirements 3.2**

- [-] 6. Create AudioManager utility
  - Implement AudioManager class with Three.js Audio
  - Add sound loading functionality
  - Implement spatial audio positioning
  - Add play, stop, and fadeOut methods
  - Handle Web Audio API unavailability
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 6.1 Write unit tests for AudioManager
  - Test sounds load correctly
  - Test play method triggers audio
  - Test spatial positioning is applied
  - Test fadeOut reduces volume over time
  - Test fallback when Web Audio unavailable
  - _Requirements: 8.1, 8.4, 8.5_

- [x] 6.2 Write property test for spatial audio positioning
  - **Property 27: Spatial audio positioning**
  - **Validates: Requirements 8.4**

- [ ] 6.3 Write property test for audio fadeout
  - **Property 28: Audio fadeout on completion**
  - **Validates: Requirements 8.5**

- [x] 7. Integrate animation sequence with game selection
  - Connect transition controller to GameSelector
  - Implement game selection timing (during DRAGGING state)
  - Add game component preloading during animation
  - Implement fade to black effect
  - Trigger navigation after fade completes
  - _Requirements: 3.4, 3.5, 7.1, 7.2, 7.3_

- [x] 7.1 Write unit tests for game selection integration
  - Test GameSelector is called at correct time
  - Test game preloading occurs before navigation
  - Test navigation happens after fade
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 7.2 Write property test for fade timing coordination
  - **Property 12: Fade timing coordination**
  - **Validates: Requirements 3.4**

- [x] 7.3 Write property test for game selection timing
  - **Property 19: Game selection timing**
  - **Validates: Requirements 7.1**

- [x] 7.4 Write property test for game preloading
  - **Property 20: Game preloading during transition**
  - **Validates: Requirements 7.2**

- [x] 7.5 Write property test for navigation after fade
  - **Property 21: Navigation after fade**
  - **Validates: Requirements 3.5, 7.3**

- [x] 8. Implement audio integration with animation states
  - Trigger door creak sound on DOOR_OPENING state
  - Trigger bone rattle sound on hand emergence
  - Trigger whoosh sound on DRAGGING state
  - Position all sounds at door location
  - Fade out sounds on transition completion
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8.1 Write property test for door sound timing
  - **Property 24: Door sound playback timing**
  - **Validates: Requirements 8.1**

- [x] 8.2 Write property test for hand sound timing
  - **Property 25: Hand sound playback timing**
  - **Validates: Requirements 8.2**

- [x] 8.3 Write property test for drag sound timing
  - **Property 26: Drag sound playback timing**
  - **Validates: Requirements 8.3**

- [x] 9. Implement reset functionality for return to home
  - Reset door rotation to 0 on home page mount
  - Hide skeleton hand on reset
  - Restore camera to original position
  - Clear animation state to IDLE
  - Ensure new transitions can be triggered
  - _Requirements: 7.4, 7.5_

- [x] 9.1 Write unit tests for reset functionality
  - Test door resets to closed position
  - Test hand becomes hidden
  - Test animation state returns to IDLE
  - Test new transition can be triggered after reset
  - _Requirements: 7.4, 7.5_

- [x] 9.2 Write property test for door reset
  - **Property 22: Door reset on return**
  - **Validates: Requirements 7.4**

- [x] 9.3 Write property test for hand visibility reset
  - **Property 23: Hand visibility reset**
  - **Validates: Requirements 7.5**

- [x] 10. Add error handling and fallbacks
  - Implement model load failure fallback (skip hand animation)
  - Add animation interruption handling
  - Implement error logging
  - Ensure navigation completes even with errors
  - Add state reset on errors
  - _Requirements: 9.1, 9.2, 9.5_

- [x] 10.1 Write unit tests for error handling
  - Test model load failure triggers fallback
  - Test interruption resets state properly
  - Test errors are logged
  - Test navigation completes despite errors
  - _Requirements: 9.1, 9.2, 9.5_

- [x] 10.2 Write property test for state reset on interruption
  - **Property 30: State reset on interruption**
  - **Validates: Requirements 9.2**

- [x] 10.3 Write property test for error handling fallback
  - **Property 31: Error handling with navigation fallback**
  - **Validates: Requirements 9.5**

- [ ] 11. Implement resource cleanup
  - Remove animation frame callbacks on unmount
  - Clear timeouts and intervals
  - Dispose of audio sources
  - Clear object references
  - Prevent memory leaks
  - _Requirements: 6.5_

- [x] 11.1 Write property test for resource cleanup
  - **Property 18: Resource cleanup on completion**
  - **Validates: Requirements 6.5**

- [x] 12. Add hand pause state transition
  - Implement HAND_PAUSED state in state machine
  - Add 0.3 second pause after hand emergence
  - Transition to DRAGGING after pause
  - _Requirements: 2.5_

- [x] 12.1 Write property test for hand pause state
  - **Property 9: Hand pause state transition**
  - **Validates: Requirements 2.5**

- [x] 13. Optimize performance
  - Implement lazy loading for skeleton hand model
  - Reuse materials across renders
  - Use useRef for animation values to avoid re-renders
  - Throttle state updates
  - Monitor and maintain 30fps minimum
  - _Requirements: 6.1, 6.3, 6.4_

- [x] 13.1 Write property test for performance
  - **Property 16: Performance under concurrent animations**
  - **Validates: Requirements 6.1, 6.3**

- [x] 14. Add accessibility features
  - Add keyboard support (Enter/Space to trigger)
  - Respect prefers-reduced-motion media query
  - Add ARIA labels for door interaction state
  - Implement focus management during transition
  - _Requirements: 5.1 (implicit accessibility requirement)_

- [x] 14.1 Write unit tests for accessibility
  - Test keyboard triggers door interaction
  - Test reduced motion skips animations
  - Test ARIA labels are present
  - Test focus management works correctly

- [x] 15. Create placeholder assets
  - Create or source skeleton hand 3D model (GLB format)
  - Create or source door creak sound effect
  - Create or source bone rattle sound effect
  - Create or source whoosh sound effect
  - Optimize assets for web delivery
  - _Requirements: 2.4, 5.1, 8.1, 8.2, 8.3_

- [x] 16. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Write integration tests for full sequence
  - Test complete transition from click to navigation
  - Test return to home and reset
  - Test error scenarios end-to-end
  - Test performance throughout full sequence
  - _Requirements: All requirements_

- [x] 17.1 Write property test for audio timing coordination
  - **Property test covering Properties 24, 25, 26**
  - **Validates: Requirements 8.1, 8.2, 8.3**

- [x] 17.2 Write property test for state machine validity
  - **Property test for state transitions**
  - **Validates: Requirements 4.3, 9.2**

- [x] 17.3 Write property test for fallback behavior
  - **Property test for various failure scenarios**
  - **Validates: Requirements 9.1, 9.5**
