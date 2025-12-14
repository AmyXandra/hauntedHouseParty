/**
 * Running path component with optimized materials
 * Creates the main path, borders, and surrounding ground
 * OPTIMIZED: Reduced geometry complexity for better performance
 */

import { useFloorTextures } from "../../../hooks/useFloorTextures"

export default function RunningPath() {
  const floorTextures = useFloorTextures()
  return (
    <group>
      
      {/* Main path - reduced segments for performance */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 100, 8, 16]} />
        <meshStandardMaterial
          color="#2a1f1a"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Path edges/borders - no shadows for performance */}
      <mesh rotation-x={-Math.PI / 2} position={[-3.2, 0.01, 0]}>
        <planeGeometry args={[0.4, 100]} />
        <meshStandardMaterial
          color="#1a1510"
          roughness={0.9}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[3.2, 0.01, 0]}>
        <planeGeometry args={[0.4, 100]} />
        <meshStandardMaterial
          color="#1a1510"
          roughness={0.9}
        />
      </mesh>

      {/* Ground beyond path - simplified geometry */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.04, 0]}>
        <planeGeometry args={[14, 100, 4, 8]} />
        <meshStandardMaterial
          color="#0f0a08"
          roughness={1.0}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.08, 0]}>
        <planeGeometry args={[35, 100, 4, 8]} />
        <meshStandardMaterial
          alphaMap={floorTextures.alphaMap}
          transparent
          map={floorTextures.map}
          aoMap={floorTextures.aoMap}
          roughnessMap={floorTextures.roughnessMap}
          metalnessMap={floorTextures.metalnessMap}
          normalMap={floorTextures.normalMap}
          displacementMap={floorTextures.displacementMap}
          displacementScale={0.3}
          displacementBias={-0.2}
        />
      </mesh>
    </group>
  )
}