---
inclusion: always
---

# Project Structure

## Directory Layout

```
/
├── src/
│   ├── components/
│   │   ├── games/           # Game component implementations (Game1, Game2, Game3)
│   │   ├── scene/           # Three.js scene components (House, Door, Floor, etc.)
│   │   └── ui/              # UI components (BackButton)
│   ├── hooks/               # Custom React hooks (useTextures, useGameNavigation, useResponsive)
│   ├── pages/               # Page components (GamePage, HauntedHousePage)
│   ├── data/                # Static data (games.ts)
│   ├── types/               # TypeScript type definitions
│   ├── styles/              # Global styles
│   ├── test/                # Test setup and utilities
│   ├── main.tsx             # React app entry point
│   ├── App.tsx              # Root component with routing
│   └── index.html           # HTML entry point
│
├── public/                  # Public assets (textures organized by category)
│   ├── door/, floor/, wall/, roof/, bush/, grave/
│
├── static/                  # Legacy static assets (mirror of public/)
│
└── dist/                    # Build output (generated)
```

## Architecture Patterns

### Component Organization
- **Scene components** (`src/components/scene/`) - Encapsulate Three.js objects as React components using `@react-three/fiber`
- **Game components** (`src/components/games/`) - Individual game implementations
- **Page components** (`src/pages/`) - Top-level route components
- **UI components** (`src/components/ui/`) - Reusable UI elements

### Component Structure
Each scene component follows this pattern:
1. Load textures via `useTextures` hook
2. Define geometry and materials
3. Return JSX with Three.js primitives (`<mesh>`, `<group>`, etc.)
4. Co-locate tests in `.test.tsx` files

### Custom Hooks
- `useTextures` - Loads and manages Three.js textures from public assets
- `useGameNavigation` - Handles routing between games
- `useResponsive` - Provides responsive breakpoint detection

### Testing
- Vitest for unit and integration tests
- React Testing Library for component tests
- Tests co-located with source files (`.test.tsx`, `.test.ts`)
- Test setup in `src/test/setup.ts`

## File Naming Conventions
- Components: PascalCase (e.g., `Door.tsx`, `BackButton.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useTextures.ts`)
- Tests: Same name as source with `.test` suffix (e.g., `Door.test.tsx`)
- Types: `index.ts` for type definitions
- Styles: kebab-case for CSS files (e.g., `BackButton.css`)

## Asset Management
- Textures stored in `/public` directory (served as-is by Vite)
- Organized by category: door, floor, wall, roof, bush, grave
- Each texture set includes: diffuse/color, ARM (AO/roughness/metalness), normal maps
- WebP format preferred with JPG fallbacks
- Load textures using `useTextures` hook, not direct imports

## Code Conventions
- TypeScript for type safety
- Functional React components with hooks
- Three.js objects wrapped in React components via `@react-three/fiber`
- Shadow mapping enabled for 3D realism
- Color textures use SRGB color space
- Group related 3D objects (e.g., house parts, graves)
