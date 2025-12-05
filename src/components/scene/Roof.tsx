import { TextureSet } from '../../types'

interface RoofProps {
  textures: TextureSet
}

/**
 * Roof component with ConeGeometry and slate textures
 * Creates the peaked roof of the haunted house
 */
export default function Roof({ textures }: RoofProps) {
  return (
    <mesh position-y={2.5 + 0.75} rotation-y={Math.PI / 4} castShadow>
      <coneGeometry args={[3.5, 1.5, 4]} />
      <meshStandardMaterial
        map={textures.map}
        aoMap={textures.aoMap}
        roughnessMap={textures.roughnessMap}
        metalnessMap={textures.metalnessMap}
        normalMap={textures.normalMap}
      />
    </mesh>
  )
}
