---
inclusion: always
---

# Tech Stack

## Core Dependencies

### React & Three.js Ecosystem
- **React** (v19.2.0) + **React DOM** (v19.2.0) - UI framework
- **React Router DOM** (v7.9.6) - Client-side routing
- **Three.js** (v0.174.0) - WebGL 3D graphics library
- **@react-three/fiber** (v9.4.0) - React renderer for Three.js (declarative JSX for 3D scenes)
- **@react-three/drei** (v10.7.7) - Helper components and hooks for R3F
- **lil-gui** (v0.20.0) - Debug UI controls for development

### Build & Development Tools
- **Vite** (v6.2.2) - Fast build tool and dev server with HMR
- **TypeScript** (v5.9.3) - Type safety and better DX
- **vite-plugin-restart** (v0.4.2) - Auto-restart dev server on static file changes

### Testing Stack
- **Vitest** (v3.2.4) - Fast unit test runner (Vite-native)
- **React Testing Library** (v16.3.0) - Component testing utilities
- **@react-three/test-renderer** (v9.1.0) - Testing utilities for R3F components
- **jsdom** (v27.0.1) - DOM implementation for Node.js tests
- **fast-check** (v4.3.0) - Property-based testing library

## Build Configuration

### Vite Setup
- Source root: `src/` (entry point: `src/main.tsx`)
- HTML template: `src/index.html`
- Public assets: `public/` (served at root, use absolute paths like `/door/color.webp`)
- Build output: `dist/`
- Hot reload enabled for static file changes
- Sourcemaps enabled for debugging
- React plugin with Fast Refresh

### TypeScript Configuration
- Strict mode enabled
- Target: ES2020+
- Module: ESNext with ES module interop
- JSX: React with automatic runtime
- Path aliases not configured (use relative imports)

## Development Workflow

### Available Commands
```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Type-check + production build
npm run type-check   # Run TypeScript compiler without emitting
npm run test         # Run tests once (CI mode)
npm run test:watch   # Run tests in watch mode
```

### Code Style Conventions
- Use TypeScript for all new files (`.ts`, `.tsx`)
- Functional components with hooks (no class components)
- Use `const` for immutable values, avoid `var`
- Prefer named exports over default exports for better refactoring
- Use explicit return types for functions when not obvious
- Enable strict null checks (handle `undefined` and `null` explicitly)

## Three.js & React Three Fiber Patterns

### Component Structure
```tsx
// Use @react-three/fiber primitives (lowercase for Three.js objects)
<mesh castShadow receiveShadow>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="red" />
</mesh>
```

### Hooks to Use
- `useFrame((state, delta) => {})` - Animation loop (runs every frame)
- `useThree()` - Access Three.js scene, camera, renderer, etc.
- `useLoader()` - Load assets (textures, models, etc.)
- Custom `useTextures()` hook - Load texture sets from public directory

### Material Best Practices
- Use `MeshStandardMaterial` for PBR workflow (physically-based rendering)
- Set `colorSpace: SRGBColorSpace` for color/diffuse textures
- Keep data textures (normal, roughness, AO) in linear color space
- Enable shadows with `castShadow` and `receiveShadow` props
- Reuse materials and geometries to reduce memory usage

## Asset Management

### Texture Organization
- Textures stored in `/public` directory (NOT `/static` - legacy)
- Access via absolute paths: `/door/color.webp`, `/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp`
- Categories: `door`, `floor`, `wall`, `roof`, `bush`, `grave`
- Each texture set includes:
  - **Diffuse/Color** (`*_diff_*.webp` or `color.webp`) - Base color
  - **ARM** (`*_arm_*.webp`) - Packed texture (Ambient Occlusion + Roughness + Metalness)
  - **Normal** (`*_nor_gl_*.webp` or `normal.webp`) - Surface detail (OpenGL format)
  - **Displacement/Height** (optional) - Geometry displacement

### Texture Format Strategy
- **Prefer WebP** for smaller file sizes and faster loading
- **Fallback to JPG** if WebP not available or for compatibility
- Use 1k resolution (1024×1024) for balance of quality and performance
- Load textures using `useTextures` hook, not direct imports

## Testing Guidelines

### Test File Conventions
- Co-locate tests with source: `Component.tsx` → `Component.test.tsx`
- Use `.test.ts` for non-component tests (hooks, utilities)
- Setup file: `src/test/setup.ts` (imported by Vitest config)

### Testing Patterns
- Use `render()` from React Testing Library for components
- Use `screen.getByRole()`, `screen.getByText()` for queries (avoid `getByTestId`)
- Test user interactions with `userEvent` or `fireEvent`
- For R3F components, use `@react-three/test-renderer` or render within `<Canvas>`
- Mock Three.js objects when needed to avoid WebGL context issues
- Use `fast-check` for property-based testing of complex logic

### What to Test
- Component renders without errors
- User interactions trigger expected behavior
- Navigation flows work correctly
- Texture loading and application (mock `useTextures` hook)
- Responsive behavior across breakpoints
- Integration tests for full scene composition

## Performance Considerations

### Optimization Strategies
- Keep texture sizes reasonable (1k preferred, 2k max)
- Reuse geometries and materials across instances
- Use `useMemo` for expensive Three.js object creation
- Limit shadow-casting objects (shadows are expensive)
- Use `frustumCulled` to skip rendering off-screen objects
- Profile with React DevTools and Three.js stats panel

### Common Pitfalls to Avoid
- Don't create new materials/geometries every render (use `useMemo`)
- Don't load textures inside render loop (use hooks or `useLoader`)
- Don't forget to dispose of Three.js objects when unmounting
- Avoid too many real-time shadows (use baked lighting when possible)
- Don't use high-poly geometry for simple shapes
