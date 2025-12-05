---
inclusion: always
---

# Product Overview

A React-based 3D haunted house scene built with Three.js and React Three Fiber, serving as a multi-game hub with an immersive 3D landing page.

## Core Features

### 3D Haunted House Scene
- Interactive 3D house with physically-based materials (PBR textures)
- Textured walls, roof, door with normal maps, roughness, metalness, and ambient occlusion
- Decorative bushes positioned around the house
- Atmospheric graveyard with randomly positioned gravestones
- Three animated ghost lights that float around the scene using sine-based motion
- Sky system with fog effects for spooky ambiance
- Real-time shadows (PCF soft shadows) and dynamic lighting
- Debug GUI (lil-gui) for tweaking scene parameters during development

### Game Hub Architecture
- Landing page featuring the 3D haunted house scene
- Navigation system to three separate game experiences (Game1, Game2, Game3)
- Responsive design with mobile and desktop support
- Back button navigation from games to main scene

## Product Principles

### Visual Quality
- Prioritize atmospheric and immersive 3D experiences
- Use realistic lighting with shadows enabled on key objects
- Apply proper texture color spaces (sRGB for color textures, linear for data textures)
- Maintain consistent visual style across all scene elements

### Performance
- Optimize texture sizes (1k resolution preferred)
- Use WebP format for textures with JPG fallbacks
- Reuse materials and geometries where possible
- Keep geometry complexity reasonable for web performance

### User Experience
- Smooth animations using requestAnimationFrame
- Intuitive navigation between games and main scene
- Responsive camera positioning based on screen size
- Clear visual feedback for interactive elements

## Scene Composition

### House Structure
- Walls: 4 units wide × 2.5 units tall × 4 units deep
- Roof: Cone geometry (3.5 radius, 1 height, 4 sides) for pyramid effect
- Door: 2.2 units tall × 2 units wide with full PBR material setup
- Positioned at center of scene (y=0)

### Graveyard
- Randomly positioned graves around the house
- Each grave uses plastered stone wall textures
- Varied rotations and slight size variations for organic feel

### Lighting Setup
- Ambient light for base illumination
- Directional light (moonlight) with shadows
- Point light at door (warm color) for focal point
- Three ghost lights (animated point lights) in cyan, purple, and pink

### Animation Patterns
- Ghost lights use sine/cosine functions for smooth floating motion
- Different frequencies and amplitudes for each ghost light
- Continuous rotation or movement where appropriate

## Development Guidelines

### When Adding New Scene Elements
- Create dedicated component in `src/components/scene/`
- Load textures via `useTextures` hook
- Enable shadows (`castShadow`, `receiveShadow`) where appropriate
- Group related objects using `<group>` for easier manipulation
- Add to main Scene component composition

### When Modifying Materials
- Use `MeshStandardMaterial` for PBR workflow
- Apply color textures with `colorSpace: SRGBColorSpace`
- Use ARM textures (ambient occlusion, roughness, metalness combined)
- Include normal maps for surface detail
- Set appropriate repeat values for tiling textures

### When Adding Animations
- Use `useFrame` hook from React Three Fiber
- Base animations on `state.clock.elapsedTime` for consistency
- Keep animation logic within component or extract to custom hook
- Ensure animations don't cause performance issues

## Testing Expectations
- Test component rendering without errors
- Verify texture loading and application
- Test responsive behavior across breakpoints
- Ensure navigation flows work correctly
- Integration tests for full scene composition
