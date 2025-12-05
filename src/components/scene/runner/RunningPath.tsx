/**
 * Running path component with optimized materials
 * Creates the main path, borders, and surrounding ground
 * OPTIMIZED: Reduced geometry complexity for better performance
 */
export default function RunningPath() {
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
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 100, 4, 8]} />
        <meshStandardMaterial
          color="#0f0a08"
          roughness={1.0}
        />
      </mesh>
    </group>
  )
}