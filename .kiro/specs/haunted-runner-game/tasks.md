# Implementation Plan

- [x] 1. Set up core game structure and interfaces
  - Create main Game5 component with proper TypeScript interfaces
  - Implement GameState interface and initial state management
  - Set up Canvas wrapper with proper camera and shadow configuration
  - Integrate BackButton component for navigation
  - _Requirements: 8.1, 8.3, 8.4, 8.5_

- [ ]* 1.1 Write property test for game initialization
  - **Property 12: Game state management (initialization)**
  - **Validates: Requirements 5.1**

- [ ] 2. Implement keyboard input handling and lane switching
  - Create keyboard event listeners for arrow keys
  - Implement lane switching logic with boundary validation
  - Add input filtering to only process events during 'playing' status
  - _Requirements: 1.1, 1.2_

- [ ]* 2.1 Write property test for lane switching mechanics
  - **Property 1: Lane switching respects boundaries**
  - **Validates: Requirements 1.1, 1.2**

- [ ] 3. Implement physics system for jumping and gravity
  - Create physics update loop using useEffect with setInterval
  - Implement gravity simulation with 0.008 units per frame
  - Add jump velocity application on up arrow key press
  - Implement ground collision detection and bounce effects
  - _Requirements: 1.3, 1.4, 1.5_

- [ ]* 3.1 Write property test for jump input velocity
  - **Property 2: Jump input applies upward velocity**
  - **Validates: Requirements 1.3**

- [ ]* 3.2 Write property test for gravity simulation
  - **Property 3: Gravity simulation consistency**
  - **Validates: Requirements 1.4**

- [ ]* 3.3 Write property test for ground collision
  - **Property 4: Ground collision resets jumping state**
  - **Validates: Requirements 1.5**

- [ ] 4. Create GameScene component and 3D environment
  - Implement GameScene component with proper lighting setup
  - Add atmospheric fog with haunted color scheme
  - Configure ambient and directional lighting with specified intensities
  - Include Sky, RunningPath, and EnvironmentDecorations components
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ]* 4.1 Write unit tests for 3D scene configuration
  - Test Canvas rendering with shadows enabled
  - Test fog application with correct color
  - Test lighting setup with specified intensities
  - Test camera positioning and FOV
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 5. Implement dynamic object spawning system
  - Create object spawning logic in GameScene using useFrame
  - Implement grave obstacle spawning every 1.5 seconds
  - Add coin spawning with lane availability checking
  - Implement ghost spawning with random intervals
  - _Requirements: 2.4, 2.5, 3.5, 7.1_

- [ ]* 5.1 Write property test for coin spawn lane availability
  - **Property 7: Coin spawn lane availability**
  - **Validates: Requirements 2.4**

- [ ]* 5.2 Write property test for ghost spawn positioning
  - **Property 13: Ghost spawn positioning**
  - **Validates: Requirements 7.2**

- [ ] 6. Implement collision detection system
  - Create collision detection logic for player-obstacle interactions
  - Implement collision cooldown mechanism (500ms)
  - Add collision handlers for graves, ghosts, and coins
  - Implement object removal after collision or collection
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

- [ ]* 6.1 Write property test for collision damage consistency
  - **Property 8: Collision damage consistency**
  - **Validates: Requirements 3.1, 3.2, 7.4**

- [ ]* 6.2 Write property test for collision cooldown
  - **Property 9: Collision cooldown enforcement**
  - **Validates: Requirements 3.3**

- [ ]* 6.3 Write property test for coin collection effects
  - **Property 5: Coin collection scoring**
  - **Validates: Requirements 2.1, 2.2**

- [ ]* 6.4 Write property test for coin removal
  - **Property 6: Coin removal after collection**
  - **Validates: Requirements 2.3**

- [ ] 7. Implement scoring and lives system
  - Create score increment logic for coin collection (+10 points)
  - Implement lives decrement logic for obstacle collisions (-1 life)
  - Add game over detection when lives reach 0
  - Implement coins collected counter tracking
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.4_

- [ ]* 7.1 Write property test for game over state transition
  - **Property 10: Game over state transition**
  - **Validates: Requirements 3.4**

- [ ] 8. Create game UI overlays and displays
  - Implement score display with coin icon styling
  - Create lives display using heart icons
  - Add coins collected counter display
  - Implement controls hint overlay at bottom center
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ]* 8.1 Write property test for UI state reflection
  - **Property 11: UI state reflection**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [ ]* 8.2 Write unit test for controls hint display
  - Test that controls hint contains expected keyboard instructions
  - _Requirements: 4.5_

- [ ] 9. Implement game state management and transitions
  - Create startGame function to initialize playing state
  - Implement resetGame function to return to menu
  - Add game over screen with final score display
  - Create menu screen with game instructions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 9.1 Write property test for state management transitions
  - **Property 12: Game state management (transitions)**
  - **Validates: Requirements 5.2, 5.3, 5.4**

- [ ]* 9.2 Write unit tests for callback integration
  - Test onBack callback invocation from BackButton
  - Test component interface compliance with GameProps
  - _Requirements: 5.5, 8.1, 8.2_

- [ ] 10. Implement ghost enemy movement patterns
  - Create wave-like motion for ghost movement across lanes
  - Implement ghost collision detection with player
  - Add ghost removal when moving beyond visible area
  - _Requirements: 7.3, 7.4, 7.5_

- [ ]* 10.1 Write property test for ghost wave motion
  - **Property 14: Ghost wave motion**
  - **Validates: Requirements 7.3**

- [ ]* 10.2 Write property test for object cleanup
  - **Property 15: Object cleanup beyond bounds**
  - **Validates: Requirements 7.5**

- [ ] 11. Add error handling and fallback mechanisms
  - Implement input validation for lane positions
  - Add physics edge case handling (negative bounce, velocity limits)
  - Create 3D rendering fallbacks for model loading failures
  - Add state management safety checks
  - _Requirements: All error handling scenarios_

- [ ]* 11.1 Write unit tests for error handling
  - Test invalid input handling
  - Test model loading fallbacks
  - Test state validation and recovery

- [ ] 12. Final integration and polish
  - Ensure all components work together seamlessly
  - Verify integration with existing game hub
  - Test responsive behavior and performance
  - Add final visual polish and effects
  - _Requirements: 8.2, 8.4_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.