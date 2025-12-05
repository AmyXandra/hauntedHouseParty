# Implementation Plan

- [x] 1. Set up React TypeScript project structure with Vite
  - Initialize new Vite project with React TypeScript template
  - Configure tsconfig.json with strict mode enabled
  - Install core dependencies: react, react-dom, @types/react, @types/react-dom
  - Install Three.js and R3F: three, @react-three/fiber, @react-three/drei
  - Install routing: react-router-dom, @types/react-router-dom
  - Set up project directory structure (src/pages, src/components, src/hooks, src/types, src/data)
  - Copy existing static assets to public directory
  - Configure Vite to serve static assets correctly
  - _Requirements: 10.4, 10.5_

- [x] 2. Create TypeScript type definitions and data models
  - Define Position3D and Rotation3D types
  - Define TextureConfig and TextureSet interfaces
  - Define Game interface and game registry structure
  - Define component prop interfaces (GameProps, GhostLightProps, etc.)
  - Create games.ts with registry of three placeholder games
  - _Requirements: 1.5, 4.1_

- [x] 3. Implement texture loading hook
  - Create useTextures hook with useLoader for all texture sets
  - Configure texture repeat, wrapping, and color space for floor textures
  - Configure texture settings for wall, roof, bush, grave, and door textures
  - Return TextureSet objects for each material type
  - _Requirements: 1.3, 7.1, 7.3, 7.4_

- [x] 3.1 Write property test for texture path validation
  - **Property 8: Texture path validation**
  - **Validates: Requirements 7.1**

- [x] 3.2 Write property test for color texture color space
  - **Property 9: Color texture color space**
  - **Validates: Requirements 7.3**

- [x] 3.3 Write property test for texture wrapping configuration
  - **Property 10: Texture wrapping configuration**
  - **Validates: Requirements 7.4**

- [x] 4. Create basic scene structure and environment
  - Create Scene component with fog configuration (FogExp2, color #04343f, density 0.1)
  - Implement Sky component wrapper for Three.js Sky addon
  - Configure sky uniforms (turbidity, rayleigh, mieCoefficient, sunPosition)
  - Set up Canvas in HauntedHousePage with camera and renderer settings
  - Add OrbitControls with damping enabled
  - _Requirements: 1.1, 1.4, 8.1, 8.2_

- [x] 5. Implement static house components
  - Create Floor component with PlaneGeometry and textured MeshStandardMaterial
  - Apply floor textures with displacement mapping
  - Create Walls component with BoxGeometry and brick textures
  - Create Roof component with ConeGeometry and slate textures
  - Create Bushes component with four SphereGeometry instances at specified positions
  - Create House component that groups walls, roof, and bushes
  - _Requirements: 1.2_

- [x] 5.1 Write property test for texture application
  - **Property 2: Texture application**
  - **Validates: Requirements 1.3**

- [x] 6. Implement graveyard with procedural generation
  - Create Grave component with BoxGeometry and stone textures
  - Create Graveyard component that generates 30 graves
  - Use circular distribution pattern (random angle and radius)
  - Apply random rotations and slight y-position variations
  - Configure shadow casting and receiving for graves
  - _Requirements: 1.2_

- [x] 6.1 Write property test for shadow configuration
  - **Property 11: Shadow configuration**
  - **Validates: Requirements 8.4**

- [x] 7. Implement lighting system
  - Create Lights component container
  - Add AmbientLight with color #86cdff and intensity 0.275
  - Add DirectionalLight with color #86cdff, intensity 1, position [3, 2, -8]
  - Add door PointLight with color #ff7d46, intensity 5, position [0, 2.2, 2.5]
  - Configure shadow mapping for directional light (mapSize 256x256, camera bounds)
  - _Requirements: 1.2, 8.3_

- [x] 8. Implement animated ghost lights
  - Create GhostLights component with three PointLight instances
  - Configure colors (#8800ff, #ff0088, #ff0000) and intensity 6
  - Implement useFrame hook for animation loop
  - Calculate positions using sinusoidal functions based on elapsed time
  - Apply different speeds (0.5, 0.38, 0.23) and radii (4, 5, 6) for each ghost
  - Configure shadow mapping for ghost lights (mapSize 256x256, far 10)
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 8.1 Write property test for ghost light sinusoidal animation
  - **Property 4: Ghost light sinusoidal animation**
  - **Validates: Requirements 3.2**

- [x] 9. Implement interactive door component
  - Create Door component with PlaneGeometry and door textures
  - Add displacement mapping with scale 0.15 and bias -0.04
  - Implement hover state using useState and pointer event handlers
  - Add visual feedback on hover (e.g., emissive color or scale change)
  - Accept onClick prop and trigger on pointer click
  - Update cursor style on hover
  - _Requirements: 2.1, 2.2, 2.5_

- [x] 9.1 Write unit tests for door interaction
  - Test hover state changes
  - Test click handler invocation
  - Test cursor style updates
  - _Requirements: 2.1, 2.2, 2.5_

- [x] 10. Implement game navigation system
  - Create useGameNavigation hook
  - Implement navigateToRandomGame function that selects random game from registry
  - Implement navigateToHome function
  - Use useNavigate from react-router-dom for routing
  - _Requirements: 2.3, 6.1_

- [x] 10.1 Write property test for random game selection
  - **Property 3: Random game selection**
  - **Validates: Requirements 2.3**

- [x] 11. Create routing structure
  - Create App component with BrowserRouter
  - Define Routes for "/" (HauntedHousePage) and "/game/:gameId" (GamePage)
  - Implement HauntedHousePage with Canvas and Scene
  - Connect door onClick to navigateToRandomGame
  - _Requirements: 6.1, 6.3_

- [x] 12. Implement game page and placeholder games
  - Create GamePage component that reads gameId from route params
  - Implement Game1, Game2, Game3 placeholder components with unique content
  - Each game should display its name and simple interactive element
  - Create BackButton component with navigation to home
  - Render appropriate game component based on gameId
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 12.1 Write property test for game component rendering
  - **Property 5: Game component rendering**
  - **Validates: Requirements 4.2, 6.4**

- [x] 13. Implement responsive behavior
  - Add window resize listener in Canvas or useThree hook
  - Update camera aspect ratio on resize
  - Update renderer size on resize
  - Cap pixel ratio at min(devicePixelRatio, 2)
  - _Requirements: 5.1, 5.3_

- [x] 13.1 Write property test for responsive camera aspect ratio
  - **Property 6: Responsive camera aspect ratio**
  - **Validates: Requirements 5.1**

- [x] 13.2 Write property test for pixel ratio capping
  - **Property 7: Pixel ratio capping**
  - **Validates: Requirements 5.3**

- [x] 14. Add global styles and polish
  - Create global.css with full-screen canvas styling
  - Remove default margins and padding
  - Set canvas to fill viewport
  - Add cursor pointer style for interactive elements
  - Style BackButton component
  - _Requirements: 2.1_

- [x] 15. Configure shadow system
  - Enable shadow mapping in renderer (PCFShadowMap)
  - Set castShadow on walls, roof, directional light, and ghost lights
  - Set receiveShadow on floor, walls, and graves
  - Verify shadow configuration matches original implementation
  - _Requirements: 8.4_

- [x] 15.1 Write property test for scene completeness
  - **Property 1: Scene completeness**
  - **Validates: Requirements 1.2, 8.3**

- [x] 16. Final integration and testing
  - Test complete navigation flow from home to game and back
  - Verify all textures load correctly
  - Verify ghost animations run smoothly
  - Verify door interaction works as expected
  - Test responsive behavior on different window sizes
  - Ensure no console errors or warnings
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2, 4.2, 4.3, 4.4, 5.1_

- [x] 16.1 Write integration tests
  - Test full scene rendering with all elements
  - Test door to game navigation flow
  - Test game to home navigation flow
  - Test texture loading pipeline
  - _Requirements: 1.1, 2.2, 4.3, 4.4_

- [x] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
