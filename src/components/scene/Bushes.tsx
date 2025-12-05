import { TextureSet } from '../../types'

interface BushesProps {
  textures: TextureSet
}

/**
 * Bushes component with four SphereGeometry instances
 * Decorative foliage around the house entrance
 */
export default function Bushes({ textures }: BushesProps) {
  return (
    <>
      {/* Bush 1 */}
      <mesh
        position={[0.8, 0.2, 2.2]}
        scale={[0.5, 0.5, 0.5]}
        rotation-x={-0.75}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#ccffcc"
          map={textures.map}
          aoMap={textures.aoMap}
          roughnessMap={textures.roughnessMap}
          metalnessMap={textures.metalnessMap}
          normalMap={textures.normalMap}
        />
      </mesh>

      {/* Bush 2 */}
      <mesh
        position={[1.4, 0.1, 2.1]}
        scale={[0.25, 0.25, 0.25]}
        rotation-x={-0.75}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#ccffcc"
          map={textures.map}
          aoMap={textures.aoMap}
          roughnessMap={textures.roughnessMap}
          metalnessMap={textures.metalnessMap}
          normalMap={textures.normalMap}
        />
      </mesh>

      {/* Bush 3 */}
      <mesh
        position={[-0.8, 0.1, 2.2]}
        scale={[0.4, 0.4, 0.4]}
        rotation-x={-0.75}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#ccffcc"
          map={textures.map}
          aoMap={textures.aoMap}
          roughnessMap={textures.roughnessMap}
          metalnessMap={textures.metalnessMap}
          normalMap={textures.normalMap}
        />
      </mesh>

      {/* Bush 4 */}
      <mesh
        position={[-1, 0.05, 2.6]}
        scale={[0.15, 0.15, 0.15]}
        rotation-x={-0.75}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#ccffcc"
          map={textures.map}
          aoMap={textures.aoMap}
          roughnessMap={textures.roughnessMap}
          metalnessMap={textures.metalnessMap}
          normalMap={textures.normalMap}
        />
      </mesh>
    </>
  )
}
