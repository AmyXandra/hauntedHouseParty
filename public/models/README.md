# 3D Models

## Skeleton Hand Model

### Requirements
- **Format**: GLB (preferred) or GLTF
- **Polygon Count**: < 5000 triangles
- **File Size**: < 500KB
- **Rigging**: Basic bone structure for finger articulation
- **Textures**: Aged bone appearance (off-white, weathered)
- **Scale**: Appropriate for door interaction (roughly human hand size)

### Recommended Sources

#### Free Options
1. **Sketchfab** (https://sketchfab.com)
   - Search: "skeleton hand", "skeletal hand", "bone hand"
   - Filter: Downloadable, GLB format
   - License: CC0 or CC-BY (check attribution requirements)
   - Example searches: "skeleton hand rigged", "animated skeleton hand"

2. **Poly Pizza** (https://poly.pizza)
   - Search: "skeleton hand"
   - All models are CC0 (public domain)
   - GLB format available

3. **Quaternius** (https://quaternius.com)
   - Ultimate Animated Skeleton pack
   - Free for commercial use
   - Pre-rigged and optimized

4. **Mixamo** (https://www.mixamo.com)
   - Free with Adobe account
   - High-quality rigged models
   - May need to extract just the hand

#### Paid Options
1. **TurboSquid** (https://www.turbosquid.com)
   - Professional quality
   - Search: "skeleton hand low poly"
   - Filter by polygon count

2. **CGTrader** (https://www.cgtrader.com)
   - Wide selection
   - Often includes multiple formats

### Optimization Steps
1. Import model into Blender (free)
2. Decimate geometry if > 5000 triangles
3. Bake textures to single atlas if needed
4. Export as GLB with compression
5. Test file size (should be < 500KB)

### Fallback
If no suitable model is found, the application will use a procedurally generated hand geometry (see `SkeletonHand.tsx` component).

### Current Status
**TODO**: Download and add skeleton hand model as `skeleton-hand.glb`
