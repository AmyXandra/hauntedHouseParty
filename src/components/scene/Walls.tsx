import { TextureSet } from '../../types'

interface WallsProps {
  textures: TextureSet
}

/**
 * Walls component with BoxGeometry and brick textures
 * Forms the main structure of the haunted house
 */
export default function Walls({ textures }: WallsProps) {
  return (
    <mesh position-y={2.5 / 2} castShadow receiveShadow>
      <boxGeometry args={[4, 2.5, 4]} />
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
