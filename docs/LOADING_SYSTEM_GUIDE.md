# Loading System Guide

## Overview
The loading system provides a smooth user experience by showing a themed loading screen while game assets (3D models, textures) are being loaded.

## Components

### LoadingScreen Component
Location: `src/components/ui/LoadingScreen.tsx`

A reusable loading screen with haunted theme styling.

**Props:**
- `message?: string` - Custom loading message (default: "Loading...")
- `progress?: number` - Optional progress percentage (0-100)

**Usage:**
```tsx
import LoadingScreen from '../ui/LoadingScreen'

// Simple loading screen
<LoadingScreen message="Loading Game..." />

// With progress bar
<LoadingScreen message="Loading Assets..." progress={75} />
```

### useAssetLoader Hook
Location: `src/hooks/useAssetLoader.ts`

Hook for tracking asset loading progress (optional, for advanced use cases).

**Parameters:**
```typescript
{
  models?: string[]    // Array of GLB/GLTF model paths
  textures?: string[]  // Array of texture image paths
}
```

**Returns:**
```typescript
{
  isLoading: boolean   // True while assets are loading
  progress: number     // Loading progress (0-100)
  error: string | null // Error message if loading fails
}
```

**Usage:**
```tsx
import { useAssetLoader } from '../../hooks/useAssetLoader'

const { isLoading, progress, error } = useAssetLoader({
  models: ['/models/character.glb', '/models/enemy.glb'],
  textures: ['/images/background.png']
})

if (isLoading) {
  return <LoadingScreen message="Loading..." progress={progress} />
}
```

## Implementation Pattern

### Basic Pattern (Current Implementation)

**Step 1: Preload assets at module level**
```tsx
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Preload models
useGLTF.preload('/models/model1.glb')
useGLTF.preload('/models/model2.glb')

// Preload textures
new THREE.TextureLoader().load('/images/texture.png')
```

**Step 2: Add loading state**
```tsx
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  const timer = setTimeout(() => {
    setIsLoading(false)
  }, 100) // Small delay to ensure assets are ready
  
  return () => clearTimeout(timer)
}, [])
```

**Step 3: Show loading screen**
```tsx
if (isLoading) {
  return <LoadingScreen message="Loading Game..." />
}
```

**Step 4: Wrap scene in Suspense**
```tsx
<Canvas>
  <Suspense fallback={null}>
    <GameScene {...props} />
  </Suspense>
</Canvas>
```

### Advanced Pattern (With Progress Tracking)

```tsx
import { useAssetLoader } from '../../hooks/useAssetLoader'
import LoadingScreen from '../ui/LoadingScreen'

const Game = () => {
  const { isLoading, progress, error } = useAssetLoader({
    models: [
      '/models/hero.glb',
      '/models/enemy.glb',
      '/models/collectible.glb'
    ],
    textures: [
      '/images/background.png',
      '/images/ui-elements.png'
    ]
  })

  if (error) {
    return <div>Error loading assets: {error}</div>
  }

  if (isLoading) {
    return <LoadingScreen message="Loading..." progress={progress} />
  }

  return (
    <Canvas>
      <Suspense fallback={null}>
        <GameScene />
      </Suspense>
    </Canvas>
  )
}
```

## Best Practices

### 1. Preload Critical Assets
Preload assets that are needed immediately when the game starts:
```tsx
// ✅ Good - preload at module level
useGLTF.preload('/models/hero.glb')

// ❌ Bad - loading inside component causes delays
function Hero() {
  const { scene } = useGLTF('/models/hero.glb') // Blocks render
}
```

### 2. Lazy Load Non-Critical Assets
Load decorative or optional assets after the game starts:
```tsx
// Load environment decorations after core gameplay is ready
useEffect(() => {
  if (gameState === 'playing') {
    useGLTF.preload('/models/decoration.glb')
  }
}, [gameState])
```

### 3. Optimize Model Cloning
Clone models once and reuse instead of cloning on every render:
```tsx
// ✅ Good - clone once
const clonedScene = useRef<THREE.Group | null>(null)
if (!clonedScene.current) {
  clonedScene.current = scene.clone()
}

// ❌ Bad - clones every render
<primitive object={scene.clone()} />
```

### 4. Use Suspense Boundaries
Wrap 3D scenes in Suspense to handle async loading gracefully:
```tsx
<Canvas>
  <Suspense fallback={null}>
    <GameScene />
  </Suspense>
</Canvas>
```

## Examples

### Game4 (Pumpkin Slicer)
```tsx
// Preload at module level
useGLTF.preload('/models/pumkin2.glb')
new THREE.TextureLoader().load('/images/pumpkin-slicer-bg.png')

// In component
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  const timer = setTimeout(() => setIsLoading(false), 100)
  return () => clearTimeout(timer)
}, [])

if (isLoading) {
  return <LoadingScreen message="Loading Pumpkin Slicer..." />
}
```

### Game5 (Tomb Runner)
```tsx
// Preload all assets
useGLTF.preload('/models/box_boy.glb')
useGLTF.preload('/models/stylized_coin/scene.gltf')
useGLTF.preload('/models/ghost.glb')
useGLTF.preload('/models/cap_pumpkin.glb')
useGLTF.preload('/models/pine_tree.glb')
useGLTF.preload('/models/forest_tree.glb')

// Same loading pattern as Game4
```

## Troubleshooting

### Black Screen Still Appears
- Ensure assets are preloaded at module level (outside component)
- Check browser console for loading errors
- Verify asset paths are correct
- Increase timeout delay if assets are large

### Loading Screen Flashes Too Quickly
- This is actually good! It means assets loaded fast
- Can add minimum display time if desired:
```tsx
const MIN_LOADING_TIME = 500 // ms

useEffect(() => {
  const startTime = Date.now()
  const timer = setTimeout(() => {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, MIN_LOADING_TIME - elapsed)
    setTimeout(() => setIsLoading(false), remaining)
  }, 100)
  return () => clearTimeout(timer)
}, [])
```

### Progress Bar Not Working
- The basic pattern doesn't track actual progress
- Use `useAssetLoader` hook for real progress tracking
- Note: Progress tracking adds complexity, only use if needed

## Performance Tips

1. **Compress Models**: Use Draco compression for GLB files
2. **Optimize Textures**: Use WebP format, keep resolution at 1k
3. **Lazy Load**: Only preload assets needed for initial gameplay
4. **Code Split**: Use dynamic imports for game components
5. **Cache Assets**: Browser will cache loaded assets automatically

## Future Enhancements

- [ ] Implement THREE.LoadingManager for accurate progress
- [ ] Add retry logic for failed asset loads
- [ ] Create asset manifest system
- [ ] Add offline asset caching with Service Workers
- [ ] Implement progressive loading (low-res → high-res)
