

import { DoubleSide } from 'three'

/**
 * InnerDoor component - Creates a dark room interior that the camera can enter
 * Represents the mysterious space beyond the haunted house door
 */
export default function InnerDoor() {
  return (
    <mesh position={[0, 1.0, 1.51]} receiveShadow>
      <boxGeometry args={[1.0, 1.95, 1]} />
      <meshBasicMaterial
        color="#000000"
        side={DoubleSide} // Render inside faces so camera can see interior
      />
    </mesh>
    // <group position={[0, 1.0, 1.5]}>
    //   {/* Dark room interior - a box the camera can enter */}
    //   <mesh position={[0, 0, -1]} receiveShadow>
    //     <boxGeometry args={[3, 3, 3]} />
    //     <meshBasicMaterial
    //       color="#000000"
    //       side={DoubleSide} // Render inside faces so camera can see interior
    //     />
    //   </mesh>

    //   {/* Optional: Add some subtle ambient elements inside the room */}
    //   <mesh position={[0, 0, -0.5]}>
    //     <sphereGeometry args={[0.1, 8, 8]} />
    //     <meshBasicMaterial
    //       color="#330033"
    //       transparent
    //       opacity={0.3}
    //     />
    //   </mesh>
    // </group>
  )
}
