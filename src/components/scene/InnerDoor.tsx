

/**
 * Floor component with PlaneGeometry and textured MeshStandardMaterial
 * Applies displacement mapping for realistic ground surface
 */
export default function InnerDoor() {
  return (
    <mesh position={[0, 1.0, 2 + 0.01]} receiveShadow>
      <planeGeometry args={[1.0, 1.95, 1, 1]} />
      <meshBasicMaterial
        color={"#000000"}
      />
    </mesh>
  )
}
