# Design Document

## Overview

The Haunted Runner Game is a 3D endless runner built with React Three Fiber that combines lane-based movement mechanics with physics-based jumping and collision detection. The game features a haunted atmosphere with atmospheric lighting, fog effects, and spooky visual elements. Players control a 3D character model that automatically runs forward while navigating between three lanes to collect coins and avoid obstacles.

The architecture follows React component patterns with Three.js integration, utilizing hooks for game state management, physics simulation, and 3D rendering. The game integrates seamlessly with the existing haunted house game hub through standardized interfaces and consistent UI components.

## Architecture

### Component Hierarchy
```
Game5 (Main Game Component)
├── Canvas (React Three Fiber)
│   └── GameScene
│       ├── Sky (Atmospheric background)
│       ├── RunningPath (Ground surface)
│       ├── EnvironmentDecorations (Ambient objects)
│       ├── HeroCharacter (Player model)
│       ├── GraveObstacle[] (Dynamic obstacles)
│       ├── CoinCollectible[] (Dynamic collectibles)
│       └── GhostEnemy[] (Dynamic flying enemies)
├── Game UI Overlays
│   ├── Score Display
│   ├── Lives Display
│   ├── Coins Counter
│   └── Controls Hint
├── BackButton (Navigation)
└── State-based Screens
    ├── Menu Screen
    └── Game Over Screen
```

### State Management Pattern
The game uses React's `useState` and `useRef` hooks for state management:
- **Game State**: Managed via `useState<GameState>` containing score, lives, status, lane position, jumping state, and coins collected
- **Physics State**: Managed via `useRef` for bounce values and velocity to avoid re-renders during animation frames
- **Object Collections**: Dynamic arrays of graves, coins, and ghosts managed in GameScene component

### Physics System Architecture
- **Gravity Simulation**: Constant downward acceleration applied every 16ms (~60fps)
- **Collision Detection**: AABB (Axis-Aligned Bounding Box) collision using distance calculations
- **Movement Interpolation**: Smooth lane transitions using THREE.MathUtils.lerp
- **Bounce Mechanics**: Velocity-based jumping with ground collision detection

## Components and Interfaces

### Core Game Component (Game5)
```typescript
interface GameProps {
  onBack: () => void
}

interface GameState {
  score: number
  lives: number
  gameStatus: 'menu' | 'playing' | 'gameover'
  currentLane: number
  isJumping: boolean
  coinsCollected: number
}
```

**Responsibilities:**
- Game state management and transitions
- Keyboard input handling (arrow keys)
- Physics simulation (gravity, bouncing)
- UI rendering for different game states
- Integration with game hub via onBack callback

### 3D Scene Component (GameScene)
```typescript
interface GameSceneProps {
  gameState: GameState
  onCollision: (id: string, type: 'grave' | 'ghost') => void
  onCoinCollect: (id: string) => void
  bounceValue: number
}
```

**Responsibilities:**
- 3D environment setup (lighting, fog, camera)
- Dynamic object spawning and management
- Collision detection coordination
- Performance optimization (object removal)

### Character Component (HeroCharacter)
```typescript
interface HeroCharacterProps {
  currentLane: number
  bounceValue: number
  scale?: number
}
```

**Responsibilities:**
- 3D character model loading and rendering
- Animation state management (idle, running, jumping)
- Smooth lane transition animations
- Physics-based vertical movement

### Obstacle Components
```typescript
interface Grave {
  id: string
  lane: number
  position: number
}

interface Ghost {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  lifetime: number
}

interface Coin {
  id: string
  lane: number
  position: number
}
```

**Responsibilities:**
- Individual object movement and animation
- Collision detection with player character
- Self-removal when out of bounds
- Visual effects (rotation, bobbing, wave motion)

## Data Models

### Game Constants
```typescript
const GRAVITY = 0.008              // Physics gravity constant
const LEFT_LANE = -2               // X position for left lane
const MIDDLE_LANE = 0              // X position for middle lane  
const RIGHT_LANE = 2               // X position for right lane
const HERO_Z_POSITION = 8          // Fixed Z position for player
const RUNNING_SPEED = 0.005        // Speed multiplier for object movement
const COLLISION_COOLDOWN = 500     // Milliseconds between collision events
```

### Spawn Timing Configuration
```typescript
const OBSTACLE_SPAWN_INTERVAL = 1.5    // Seconds between obstacle waves
const GHOST_SPAWN_INTERVAL = 10-15     // Random seconds between ghost spawns
const COIN_SPAWN_PROBABILITY = 0.7     // 70% chance per available lane
const GRAVE_COUNT_RANGE = 1-2          // Number of graves per spawn wave
```

### UI Layout Configuration
```typescript
interface UILayout {
  scorePosition: 'top-left'
  livesPosition: 'top-right'  
  coinsPosition: 'top-center'
  controlsPosition: 'bottom-center'
  backButtonPosition: 'bottom-right'
}
```

### 3D Scene Configuration
```typescript
interface SceneConfig {
  cameraPosition: [0, 4, 15]
  cameraFOV: 60
  fogColor: '#1a0f0a'
  fogNear: 12
  fogFar: 40
  ambientLightIntensity: 5.6
  directionalLightIntensity: 0.7
  shadowMapSize: 256
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all testable properties from the prework analysis, several redundancies were identified:

- **Collision damage properties (3.1, 3.2, 7.4)** can be combined into a single comprehensive collision damage property
- **UI display properties (4.1, 4.2, 4.3)** can be consolidated into one UI state reflection property  
- **Lane movement properties (1.1, 1.2)** can be combined into a single lane switching property
- **State transition properties (5.2, 5.3, 5.4)** can be unified into a comprehensive state management property

The following properties represent the unique, non-redundant correctness requirements:

**Property 1: Lane switching respects boundaries**
*For any* current lane position and arrow key input, the character should move to the adjacent lane in the correct direction, or remain in the current lane if already at the boundary
**Validates: Requirements 1.1, 1.2**

**Property 2: Jump input applies upward velocity**
*For any* game state where the character is on the ground, pressing the up arrow key should set the character's velocity to a positive upward value
**Validates: Requirements 1.3**

**Property 3: Gravity simulation consistency**
*For any* character with upward velocity, gravity should reduce the velocity by exactly 0.008 units per physics frame
**Validates: Requirements 1.4**

**Property 4: Ground collision resets jumping state**
*For any* character that reaches ground level (bounceValue <= 0), the jumping state should be reset to false and a small bounce should be applied
**Validates: Requirements 1.5**

**Property 5: Coin collection scoring**
*For any* coin collision event, the score should increase by exactly 10 points and the coins collected counter should increase by exactly 1
**Validates: Requirements 2.1, 2.2**

**Property 6: Coin removal after collection**
*For any* coin that is collected, the coin should no longer exist in the game world after the collection event
**Validates: Requirements 2.3**

**Property 7: Coin spawn lane availability**
*For any* spawn event, coins should only be placed in lanes that are not occupied by obstacles in the same spawn wave
**Validates: Requirements 2.4**

**Property 8: Collision damage consistency**
*For any* collision between the player character and any obstacle (grave or ghost), the player's lives should decrease by exactly 1
**Validates: Requirements 3.1, 3.2, 7.4**

**Property 9: Collision cooldown enforcement**
*For any* sequence of collision events, only the first collision within a 500 millisecond window should be processed
**Validates: Requirements 3.3**

**Property 10: Game over state transition**
*For any* game state where lives reach 0, the game status should transition to 'gameover'
**Validates: Requirements 3.4**

**Property 11: UI state reflection**
*For any* game state during playing status, the UI should display the current score, remaining lives as heart icons, and coins collected count
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

**Property 12: Game state management**
*For any* state transition (start game, game over, reset), all game counters should be set to their appropriate values (playing: reset to defaults, gameover: preserve score, menu: reset all)
**Validates: Requirements 5.2, 5.3, 5.4**

**Property 13: Ghost spawn positioning**
*For any* ghost spawn event, the ghost should be positioned at coordinates [0, 2.5, -30]
**Validates: Requirements 7.2**

**Property 14: Ghost wave motion**
*For any* ghost over time, its movement should exhibit wave-like characteristics with position varying sinusoidally across lanes
**Validates: Requirements 7.3**

**Property 15: Object cleanup beyond bounds**
*For any* game object (ghost, grave, coin) that moves beyond the visible area (z > HERO_Z_POSITION + 2), it should be removed from the game world
**Validates: Requirements 7.5**

## Error Handling

### Input Validation
- **Invalid Lane Positions**: Clamp lane switching to valid range [-2, 0, 2]
- **Keyboard Event Filtering**: Only process arrow key events during 'playing' game status
- **Rapid Input Protection**: Prevent lane switching while character is already jumping (except up arrow)

### Physics Edge Cases
- **Negative Bounce Values**: Reset to 0 when character position goes below ground level
- **Velocity Overflow**: Cap maximum upward velocity to prevent unrealistic jump heights
- **Frame Rate Independence**: Use delta time for consistent physics regardless of frame rate

### Collision Detection Robustness
- **Duplicate Collision Prevention**: Use collision cooldown and hasCollided flags to prevent multiple triggers
- **Out of Bounds Objects**: Automatically remove objects that exceed position boundaries
- **Null Reference Protection**: Check object existence before collision calculations

### 3D Rendering Fallbacks
- **Model Loading Failures**: Provide fallback geometry (capsule) when GLB models fail to load
- **Animation Missing**: Gracefully handle models without animations by using static poses
- **Texture Loading Errors**: Use solid colors when texture files are unavailable

### State Management Safety
- **Invalid State Transitions**: Validate state changes and revert to previous valid state if needed
- **Counter Overflow Protection**: Prevent score and coins counters from exceeding safe integer limits
- **Memory Leak Prevention**: Clean up event listeners and intervals on component unmount

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests:**
- Verify specific examples and edge cases work correctly
- Test integration points between components
- Validate UI rendering with known state values
- Test error conditions and fallback behaviors

**Property-Based Tests:**
- Verify universal properties hold across all inputs using **fast-check** library
- Configure each property test to run a minimum of 100 iterations
- Test game logic across randomly generated game states
- Validate physics calculations with arbitrary input values

### Property-Based Testing Configuration

Each property-based test will be implemented using the fast-check library with the following configuration:
- **Minimum iterations**: 100 per property test
- **Timeout**: 5 seconds per property test
- **Shrinking**: Enabled to find minimal failing examples
- **Seed**: Configurable for reproducible test runs

### Test Tagging Requirements

Each property-based test must be tagged with a comment explicitly referencing the correctness property:
- Format: `**Feature: haunted-runner-game, Property {number}: {property_text}**`
- Example: `**Feature: haunted-runner-game, Property 1: Lane switching respects boundaries**`

### Testing Scope

**Core Logic Testing:**
- Lane switching mechanics and boundary validation
- Physics simulation (gravity, jumping, ground collision)
- Collision detection between player and game objects
- Score calculation and state management
- Game state transitions and UI updates

**Integration Testing:**
- Component interaction within the 3D scene
- Event handling from UI to game logic
- Callback integration with game hub
- Model loading and fallback behavior

**Performance Testing:**
- Object spawning and cleanup efficiency
- Memory usage during extended gameplay
- Frame rate consistency during collision events
- 3D rendering performance with multiple objects