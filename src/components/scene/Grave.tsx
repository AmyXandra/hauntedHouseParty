import { GraveProps } from '../../types'
import { TextureSet } from '../../types'

interface GraveComponentProps extends GraveProps {
  textures: TextureSet
}

/**
 * Individual grave component with BoxGeometry and stone textures
 * Configured to cast and receive shadows
 */
export default function Grave({ position, rotation, textures }: GraveComponentProps) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[0.6, 0.8, 0.2]} />
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
