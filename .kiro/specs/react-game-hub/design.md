# Design Document

## Overview

This design document outlines the architecture for converting the existing Three.js haunted house scene into a React TypeScript application using React Three Fiber (R3F). The application will serve as a game hub where users interact with a 3D haunted house scene and click on the door to navigate to one of three randomly selected games.

The conversion will maintain all visual fidelity of the original Three.js implementation while leveraging React's component architecture, TypeScript's type safety, and R3F's declarative 3D rendering approach.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Application                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    React Router                        │  │
│  │  ┌─────────────────┐         ┌──────────────────────┐ │  │
│  │  │   Home Route    │         │    Game Routes       │ │  │
│  │  │   (/)           │         │  (/game/:gameId)     │ │  │
│  │  └────────┬────────┘         └──────────┬───────────┘ │  │
│  └───────────┼───────────────────────────────┼────────────┘  │
│              │                               │                │
│  ┌───────────▼────────┐         ┌───────────▼───────────┐   │
│  │  HauntedHousePage  │         │     GamePage          │   │
│  │  ┌──────────────┐  │         │  ┌────────────────┐   │   │
│  │  │ Canvas (R3F) │  │         │  │  Game1/2/3     │   │   │
│  │  │ ┌──────────┐ │  │         │  │  Component     │   │   │
│  │  │ │  Scene   │ │  │         │  └────────────────┘   │   │
│  │  │ │Components│ │  │         │  ┌────────────────┐   │   │
│  │  │ └──────────┘ │  │         │  │ Back Button    │   │   │
│  │  └──────────────┘  │         │  └────────────────┘   │   │
│  └────────────────────┘         └───────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── Router
│   ├── Route: / → HauntedHousePage
│   │   └── Canvas (R3F)
│   │       ├── Scene
│   │       │   ├── Lights
│   │       │   │   ├── AmbientLight
│   │       │   │   ├── DirectionalLight
│   │       │   │   ├── DoorLight
│   │       │   │   └── GhostLights (3x animated)
│   │       │   ├── Environment
│   │       │   │   ├── Sky
│   │       │   │   └── Fog
│   │       │   ├── Floor
│   │       │   ├── House
│   │       │   │   ├── Walls
│   │       │   │   ├── Roof
│   │       │   │   ├── Door (interactive)
│   │       │   │   └── Bushes (4x)
│   │       │   └── Graveyard
│   │       │       └── Graves (30x)
│   │       ├── Camera
│   │       └── OrbitControls
│   │
│   └── Route: /game/:gameId → GamePage
│       ├── Game1 | Game2 | Game3
│       └── BackButton
```

## Components and Interfaces

### Core Application Components

#### App Component
```typescript
interface AppProps {}

// Root component that sets up routing
```

#### HauntedHousePage Component
```typescript
interface HauntedHousePageProps {}

// Page component that wraps the R3F Canvas
// Handles full-screen 3D scene rendering
```

### 3D Scene Components

#### Scene Component
```typescript
interface SceneProps {}

// Main scene container that composes all 3D elements
// Sets up fog and background
```

#### Lights Component
```typescript
interface LightsProps {}

// Container for all light sources
// Manages ambient, directional, point lights, and animated ghosts
```

#### GhostLights Component
```typescript
interface GhostLightProps {
  color: string;
  intensity: number;
  speed: number;
  radius: number;
  offset: number;
}

// Animated point lights that move in circular patterns
// Uses useFrame for animation
```

#### Floor Component
```typescript
interface FloorProps {}

// Ground plane with textures and displacement
// Uses PlaneGeometry with MeshStandardMaterial
```

#### House Component
```typescript
interface HouseProps {
  onDoorClick: () => void;
}

// Container group for house elements
// Composes Walls, Roof, Door, and Bushes
```

#### Door Component
```typescript
interface DoorProps {
  onClick: () => void;
}

// Interactive door plane with hover effects
// Handles click events for navigation
// Uses pointer events for interactivity
```

#### Walls Component
```typescript
interface WallsProps {}

// Box geometry with brick textures
```

#### Roof Component
```typescript
interface RoofProps {}

// Cone geometry with slate textures
```

#### Bushes Component
```typescript
interface BushProps {
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
}

// Sphere geometries with foliage textures
```

#### Graveyard Component
```typescript
interface GraveyardProps {
  count: number;
}

// Procedurally generates grave markers
// Uses random positioning in circular pattern
```

#### Grave Component
```typescript
interface GraveProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

// Individual gravestone box geometry
```

#### Sky Component
```typescript
interface SkyProps {}

// R3F wrapper for Three.js Sky addon
// Configures atmospheric scattering
```

### Game Components

#### GamePage Component
```typescript
interface GamePageProps {}

// Container page for game display
// Reads gameId from route params
// Renders appropriate game component
```

#### Game1, Game2, Game3 Components
```typescript
interface GameProps {
  onBack: () => void;
}

// Individual game implementations
// Each provides unique gameplay experience
```

#### BackButton Component
```typescript
interface BackButtonProps {
  onClick: () => void;
}

// UI button to return to home page
```

### Utility Hooks

#### useGameNavigation Hook
```typescript
interface UseGameNavigationReturn {
  navigateToRandomGame: () => void;
  navigateToHome: () => void;
}

// Custom hook for game navigation logic
// Handles random game selection
```

#### useTextures Hook
```typescript
interface TextureSet {
  map: THREE.Texture;
  normalMap: THREE.Texture;
  aoMap?: THREE.Texture;
  roughnessMap?: THREE.Texture;
  metalnessMap?: THREE.Texture;
  displacementMap?: THREE.Texture;
  alphaMap?: THREE.Texture;
}

interface UseTexturesReturn {
  floorTextures: TextureSet;
  wallTextures: TextureSet;
  roofTextures: TextureSet;
  bushTextures: TextureSet;
  graveTextures: TextureSet;
  doorTextures: TextureSet;
}

// Custom hook for loading and configuring all textures
// Uses R3F's useLoader with THREE.TextureLoader
```

## Data Models

### Game Model
```typescript
interface Game {
  id: string;
  name: string;
  component: React.ComponentType<GameProps>;
}

// Represents a playable game in the hub
```

### TextureConfig Model
```typescript
interface TextureConfig {
  path: string;
  repeat?: [number, number];
  wrapS?: THREE.Wrapping;
  wrapT?: THREE.Wrapping;
  colorSpace?: THREE.ColorSpace;
}

// Configuration for texture loading
```

### Position3D Model
```typescript
type Position3D = [number, number, number];

// 3D position vector [x, y, z]
```

### Rotation3D Model
```typescript
type Rotation3D = [number, number, number];

// 3D rotation in radians [x, y, z]
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN the Application starts THEN the system SHALL render the HauntedHouseScene using R3F components
Thoughts: This is about the initial render behavior. We can test that when the app mounts at the root route, the Canvas component and scene elements are present in the component tree.
Testable: yes - example

1.2 WHEN the HauntedHouseScene renders THEN the system SHALL display all visual elements from the original Three.js implementation
Thoughts: This is about ensuring all scene objects exist. We can test that for any rendered scene, all required objects (floor, walls, roof, door, bushes, graves, lights) are present in the scene graph.
Testable: yes - property

1.3 WHEN textures are loaded THEN the system SHALL apply them correctly to all 3D objects maintaining the original visual appearance
Thoughts: This is about texture application. We can test that for any textured object, the material has the expected texture maps assigned.
Testable: yes - property

1.4 WHEN the scene is rendered THEN the system SHALL maintain the same camera position, controls, and lighting as the original implementation
Thoughts: This is about specific configuration values. We can test that the camera position, control settings, and light properties match expected values.
Testable: yes - example

1.5 WHEN the Application compiles THEN the system SHALL produce no TypeScript type errors
Thoughts: This is about build-time type checking, which is handled by the TypeScript compiler itself, not runtime tests.
Testable: no

2.1 WHEN the user hovers over the DoorInteraction THEN the system SHALL provide visual feedback indicating the door is interactive
Thoughts: This is about UI interaction. We can test that hovering triggers a state change or style update.
Testable: yes - example

2.2 WHEN the user clicks on the DoorInteraction THEN the system SHALL trigger navigation to the GameSelector
Thoughts: This is about click handling. We can test that clicking the door calls the navigation function.
Testable: yes - example

2.3 WHEN the DoorInteraction is clicked THEN the system SHALL select one game randomly from the available three games
Thoughts: This is about random selection behavior. For any set of available games, the selected game should be one of the available games.
Testable: yes - property

2.4 WHEN navigation occurs THEN the system SHALL transition smoothly from the HauntedHouseScene to the selected game
Thoughts: "Smoothly" is subjective and relates to user experience, not a computable property.
Testable: no

2.5 WHEN the user's cursor is not over the DoorInteraction THEN the system SHALL display the default cursor
Thoughts: This is about cursor state. We can test that when pointer is not over the door, cursor style is default.
Testable: yes - example

3.1 WHEN the HauntedHouseScene renders THEN the system SHALL animate three ghost lights in circular patterns
Thoughts: This is about the presence and behavior of ghost lights. We can test that three ghost lights exist and their positions change over time in a circular pattern.
Testable: yes - property

3.2 WHEN ghost lights move THEN the system SHALL update their positions based on elapsed time using sinusoidal functions
Thoughts: This is about the mathematical relationship between time and position. For any elapsed time value, the position should follow the sinusoidal formula.
Testable: yes - property

3.3 WHEN the animation runs THEN the system SHALL maintain smooth 60fps performance
Thoughts: This is a performance requirement that's difficult to test reliably in unit tests as it depends on hardware and system load.
Testable: no

3.4 WHEN ghost lights animate THEN the system SHALL cast dynamic shadows on the environment
Thoughts: This is about shadow configuration. We can test that ghost lights have castShadow enabled.
Testable: yes - example

4.1 WHEN the Application initializes THEN the system SHALL register three distinct Game components
Thoughts: This is about the game registry. We can test that the games array contains exactly three entries.
Testable: yes - example

4.2 WHEN a Game is selected THEN the system SHALL render that Game's unique content
Thoughts: This is about component rendering. For any selected game ID, the corresponding game component should be rendered.
Testable: yes - property

4.3 WHEN a Game is displayed THEN the system SHALL provide a way for users to return to the HauntedHouseScene
Thoughts: This is about UI presence. We can test that when a game is rendered, a back button or navigation element exists.
Testable: yes - example

4.4 WHEN the user returns to the home page THEN the system SHALL restore the HauntedHouseScene to its initial state
Thoughts: This is about state restoration. We can test that navigating away and back results in the same initial scene state.
Testable: yes - example

5.1 WHEN the browser window is resized THEN the system SHALL update the camera aspect ratio and renderer size
Thoughts: This is about responsive behavior. For any window resize event, the camera aspect should match the new window dimensions.
Testable: yes - property

5.2 WHEN the Application renders on different devices THEN the system SHALL maintain proper 3D scene proportions
Thoughts: This is about visual correctness across devices, which is subjective and hard to quantify.
Testable: no

5.3 WHEN the pixel ratio changes THEN the system SHALL cap the pixel ratio at 2 to maintain performance
Thoughts: This is about a specific constraint. For any device pixel ratio, the renderer's pixel ratio should be min(devicePixelRatio, 2).
Testable: yes - property

5.4 WHEN viewport dimensions change THEN the system SHALL re-render the scene without visual artifacts
Thoughts: "Visual artifacts" is subjective and not computably testable.
Testable: no

6.1 WHEN the Application initializes THEN the system SHALL configure client-side routing for the home page and game routes
Thoughts: This is about router configuration. We can test that the router has routes defined for "/" and "/game/:gameId".
Testable: yes - example

6.2 WHEN a route changes THEN the system SHALL unmount the previous component and mount the new component
Thoughts: This is standard React Router behavior. We can test that navigating between routes causes component lifecycle changes.
Testable: yes - example

6.3 WHEN the user navigates to the root path THEN the system SHALL display the HauntedHouseScene
Thoughts: This is about route-to-component mapping. We can test that navigating to "/" renders the HauntedHousePage.
Testable: yes - example

6.4 WHEN the user navigates to a game route THEN the system SHALL display the corresponding Game component
Thoughts: This is about dynamic routing. For any valid game ID, navigating to "/game/:gameId" should render the corresponding game.
Testable: yes - property

6.5 WHEN routing occurs THEN the system SHALL update the browser URL without full page reloads
Thoughts: This is about SPA behavior. We can test that navigation updates window.location without triggering page reload.
Testable: yes - example

7.1 WHEN textures are loaded THEN the system SHALL use the existing texture files from the static directory
Thoughts: This is about file paths. For any texture, the loaded path should point to the static directory.
Testable: yes - property

7.2 WHEN the Application builds THEN the system SHALL include all texture assets in the output bundle
Thoughts: This is about build output, which is a build-time concern rather than runtime behavior.
Testable: no

7.3 WHEN textures are applied to materials THEN the system SHALL use the correct color space (SRGB for color textures)
Thoughts: This is about texture configuration. For any color texture, the colorSpace property should be set to THREE.SRGBColorSpace.
Testable: yes - property

7.4 WHEN textures repeat THEN the system SHALL apply the same wrapping and repeat settings as the original implementation
Thoughts: This is about texture settings. For any repeating texture, the wrap and repeat values should match the original configuration.
Testable: yes - property

8.1 WHEN the HauntedHouseScene renders THEN the system SHALL apply exponential fog with the color #04343f and density 0.1
Thoughts: This is about specific fog configuration. We can test that the scene has fog with the expected type, color, and density.
Testable: yes - example

8.2 WHEN the sky is rendered THEN the system SHALL display the Sky component with turbidity, rayleigh, and sun position matching the original scene
Thoughts: This is about specific sky configuration. We can test that the sky uniforms match expected values.
Testable: yes - example

8.3 WHEN lights are active THEN the system SHALL render ambient light, directional light, door point light, and three ghost point lights
Thoughts: This is about light presence. We can test that the scene contains the expected number and types of lights.
Testable: yes - example

8.4 WHEN shadows are enabled THEN the system SHALL configure shadow mapping for all shadow-casting lights and objects
Thoughts: This is about shadow configuration. For any shadow-casting object, castShadow should be true, and for shadow-receiving objects, receiveShadow should be true.
Testable: yes - property

9.1 WHEN components are created THEN the system SHALL use functional components with TypeScript interfaces
Thoughts: This is about code structure and conventions, not runtime behavior.
Testable: no

9.2 WHEN state management is needed THEN the system SHALL use React hooks
Thoughts: This is about implementation patterns, not testable runtime behavior.
Testable: no

9.3 WHEN R3F-specific functionality is needed THEN the system SHALL use R3F hooks
Thoughts: This is about implementation patterns, not testable runtime behavior.
Testable: no

9.4 WHEN animations occur THEN the system SHALL use the useFrame hook for per-frame updates
Thoughts: This is about implementation patterns, not testable runtime behavior.
Testable: no

9.5 WHEN the Application structure is defined THEN the system SHALL separate concerns into logical component files
Thoughts: This is about code organization, not testable runtime behavior.
Testable: no

10.1 WHEN the development server starts THEN the system SHALL provide hot module replacement for React components
Thoughts: This is about development tooling, not application runtime behavior.
Testable: no

10.2 WHEN TypeScript files are modified THEN the system SHALL perform type checking and display errors
Thoughts: This is about development tooling, not application runtime behavior.
Testable: no

10.3 WHEN the Application builds for production THEN the system SHALL optimize and bundle all assets
Thoughts: This is about build process, not application runtime behavior.
Testable: no

10.4 WHEN dependencies are installed THEN the system SHALL include React, React DOM, TypeScript, React Three Fiber, and Three.js
Thoughts: This is about project configuration, not application runtime behavior.
Testable: no

10.5 WHEN the build completes THEN the system SHALL output static files ready for deployment
Thoughts: This is about build output, not application runtime behavior.
Testable: no

### Property Reflection

After reviewing all testable properties, I've identified the following redundancies and consolidations:

- Properties 1.2 and 8.3 both test for presence of scene elements - these can be combined into a single comprehensive property about scene completeness
- Properties 7.3 and 7.4 both test texture configuration - these can be combined into a single property about texture settings
- Properties 3.1 and 3.2 both test ghost light animation - 3.2 is more specific and comprehensive, so 3.1 is redundant
- Property 8.4 can be consolidated with the shadow configuration testing to avoid separate tests for cast/receive

After consolidation, the unique properties are:

1. Scene completeness (all required objects present)
2. Texture application (materials have expected textures)
3. Random game selection (selected game is from available games)
4. Ghost light animation (positions follow sinusoidal pattern over time)
5. Game component rendering (correct game renders for given ID)
6. Responsive camera (aspect ratio matches window dimensions)
7. Pixel ratio capping (renderer pixel ratio ≤ 2)
8. Dynamic routing (valid game ID renders corresponding game)
9. Texture paths (textures load from static directory)
10. Texture configuration (color space and wrapping settings correct)
11. Shadow configuration (shadow-casting objects configured correctly)

### Correctness Properties

Property 1: Scene completeness
*For any* rendered HauntedHouseScene, the scene graph should contain all required objects: floor, walls, roof, door, four bushes, thirty graves, ambient light, directional light, door point light, and three ghost point lights.
**Validates: Requirements 1.2, 8.3**

Property 2: Texture application
*For any* 3D object with textures, the material should have the expected texture maps (map, normalMap, aoMap, roughnessMap, metalnessMap, displacementMap, alphaMap) assigned according to the object type.
**Validates: Requirements 1.3**

Property 3: Random game selection
*For any* game selection event, the selected game ID should be one of the three available game IDs in the game registry.
**Validates: Requirements 2.3**

Property 4: Ghost light sinusoidal animation
*For any* elapsed time value, each ghost light's position should follow the formula: x = cos(angle) * radius, z = sin(angle) * radius, y = sin(angle) * sin(angle * 2.34) * sin(angle * 3.45), where angle = elapsedTime * speed.
**Validates: Requirements 3.2**

Property 5: Game component rendering
*For any* valid game ID from the game registry, navigating to "/game/:gameId" should render the corresponding game component.
**Validates: Requirements 4.2, 6.4**

Property 6: Responsive camera aspect ratio
*For any* window resize event, the camera's aspect ratio should equal the new window width divided by the new window height.
**Validates: Requirements 5.1**

Property 7: Pixel ratio capping
*For any* device pixel ratio value, the renderer's configured pixel ratio should be the minimum of the device pixel ratio and 2.
**Validates: Requirements 5.3**

Property 8: Texture path validation
*For any* loaded texture, the texture's source URL should contain the "/static/" path prefix or start with "./".
**Validates: Requirements 7.1**

Property 9: Color texture color space
*For any* color/diffuse texture (floor, wall, roof, bush, grave, door color), the texture's colorSpace property should be set to THREE.SRGBColorSpace.
**Validates: Requirements 7.3**

Property 10: Texture wrapping configuration
*For any* repeating texture, the wrapS and wrapT properties should be set to THREE.RepeatWrapping, and the repeat values should match the original configuration.
**Validates: Requirements 7.4**

Property 11: Shadow configuration
*For any* object that should cast or receive shadows (walls, roof, floor, graves, directional light, ghost lights), the castShadow or receiveShadow property should be set to true as appropriate.
**Validates: Requirements 8.4**

## Error Handling

### Texture Loading Errors
- **Strategy**: Implement error boundaries and fallback textures
- **Handling**: Use R3F's Suspense component with fallback UI while textures load
- **Recovery**: Display error message if texture fails to load, use solid color material as fallback

### Navigation Errors
- **Strategy**: Validate game IDs before navigation
- **Handling**: Check if game ID exists in registry before routing
- **Recovery**: Redirect to home page if invalid game ID is provided

### Rendering Errors
- **Strategy**: Implement React error boundaries around 3D scene
- **Handling**: Catch rendering errors in Canvas component
- **Recovery**: Display error message and provide button to reload scene

### Window Resize Errors
- **Strategy**: Debounce resize events to prevent excessive updates
- **Handling**: Use requestAnimationFrame for resize handling
- **Recovery**: Gracefully handle edge cases like zero-dimension windows

### Component Unmount Errors
- **Strategy**: Clean up Three.js resources on unmount
- **Handling**: Dispose geometries, materials, and textures in useEffect cleanup
- **Recovery**: Prevent memory leaks by ensuring proper cleanup

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and component behavior:

- **Component Rendering**: Test that each component renders without errors
- **Door Click Handler**: Test that clicking the door triggers navigation callback
- **Back Button**: Test that back button navigates to home route
- **Game Registry**: Test that exactly three games are registered
- **Texture Loading**: Test that useTextures hook returns expected texture objects
- **Navigation Hook**: Test that useGameNavigation returns correct navigation functions
- **Route Configuration**: Test that router has correct routes defined

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript/TypeScript property-based testing library):

- Each property-based test will run a minimum of 100 iterations
- Each test will be tagged with a comment referencing the design document property
- Tag format: `// Feature: react-game-hub, Property {number}: {property_text}`
- Each correctness property will be implemented by a single property-based test

**Property Test Coverage**:

1. **Scene Completeness Test**: Generate various scene states, verify all required objects present
2. **Texture Application Test**: Generate different object types, verify correct textures applied
3. **Random Game Selection Test**: Run selection multiple times, verify result always in valid set
4. **Ghost Animation Test**: Generate random time values, verify positions follow sinusoidal formula
5. **Game Rendering Test**: Generate random valid game IDs, verify correct component renders
6. **Camera Aspect Test**: Generate random window dimensions, verify aspect ratio calculation
7. **Pixel Ratio Test**: Generate random device pixel ratios, verify capping at 2
8. **Texture Path Test**: Generate texture configurations, verify paths contain static directory
9. **Color Space Test**: Generate color textures, verify SRGB color space set
10. **Texture Wrapping Test**: Generate repeating textures, verify wrapping and repeat settings
11. **Shadow Configuration Test**: Generate shadow-casting objects, verify shadow properties set

### Integration Testing

Integration tests will verify component interactions:

- **Full Scene Rendering**: Test that HauntedHousePage renders complete scene with all elements
- **Door to Game Navigation**: Test complete flow from door click to game display
- **Game to Home Navigation**: Test complete flow from game back button to home page
- **Texture Loading Pipeline**: Test that textures load and apply to materials correctly
- **Animation Loop**: Test that useFrame updates ghost positions over time

### Testing Tools

- **Test Framework**: Vitest (fast, Vite-native test runner)
- **React Testing**: @testing-library/react (component testing)
- **R3F Testing**: @react-three/test-renderer (3D scene testing)
- **Property Testing**: fast-check (property-based testing)
- **Type Checking**: TypeScript compiler (tsc --noEmit)

## Implementation Notes

### React Three Fiber Patterns

1. **Declarative 3D**: Use JSX to declare 3D objects instead of imperative Three.js API
2. **Hooks for Animation**: Use `useFrame` for per-frame updates instead of manual animation loops
3. **Automatic Cleanup**: R3F handles disposal of Three.js resources automatically
4. **Props Mapping**: R3F maps JSX props directly to Three.js object properties

### Performance Considerations

1. **Texture Optimization**: Use WebP format for smaller file sizes
2. **Shadow Map Size**: Keep shadow map sizes reasonable (256x256) for performance
3. **Geometry Reuse**: Share geometries and materials between similar objects
4. **Pixel Ratio Cap**: Limit pixel ratio to 2 to prevent excessive rendering load
5. **Memoization**: Use React.memo for components that don't need frequent re-renders

### TypeScript Integration

1. **Strict Mode**: Enable strict TypeScript checking for type safety
2. **Three.js Types**: Use @types/three for Three.js type definitions
3. **R3F Types**: Use @react-three/fiber types for R3F-specific props
4. **Custom Types**: Define interfaces for all component props and data models
5. **Type Guards**: Use type guards for runtime type checking where needed

### File Structure

```
src/
├── App.tsx                          # Root component with router
├── main.tsx                         # Entry point
├── pages/
│   ├── HauntedHousePage.tsx        # Home page with 3D scene
│   └── GamePage.tsx                 # Game display page
├── components/
│   ├── scene/
│   │   ├── Scene.tsx               # Main scene container
│   │   ├── Lights.tsx              # All lights
│   │   ├── GhostLights.tsx         # Animated ghost lights
│   │   ├── Floor.tsx               # Ground plane
│   │   ├── House.tsx               # House container
│   │   ├── Door.tsx                # Interactive door
│   │   ├── Walls.tsx               # House walls
│   │   ├── Roof.tsx                # House roof
│   │   ├── Bushes.tsx              # Decorative bushes
│   │   ├── Graveyard.tsx           # Grave container
│   │   ├── Grave.tsx               # Individual grave
│   │   └── Sky.tsx                 # Sky component
│   ├── games/
│   │   ├── Game1.tsx               # First game
│   │   ├── Game2.tsx               # Second game
│   │   └── Game3.tsx               # Third game
│   └── ui/
│       └── BackButton.tsx          # Navigation button
├── hooks/
│   ├── useGameNavigation.ts        # Navigation logic
│   └── useTextures.ts              # Texture loading
├── data/
│   └── games.ts                    # Game registry
├── types/
│   └── index.ts                    # TypeScript interfaces
└── styles/
    └── global.css                  # Global styles
```

### Migration Strategy

1. **Phase 1**: Set up React + TypeScript + Vite project structure
2. **Phase 2**: Install R3F and Three.js dependencies
3. **Phase 3**: Create basic Canvas and scene structure
4. **Phase 4**: Convert static elements (floor, house, graves)
5. **Phase 5**: Implement animated elements (ghost lights)
6. **Phase 6**: Add interactivity (door click)
7. **Phase 7**: Implement routing and game pages
8. **Phase 8**: Create placeholder games
9. **Phase 9**: Add tests
10. **Phase 10**: Polish and optimize
