import { TextureSet } from '../../types'

interface FloorProps {
  textures: TextureSet
}

/**
 * Floor component with PlaneGeometry and textured MeshStandardMaterial
 * Applies displacement mapping for realistic ground surface
 */
export default function Floor({ textures }: FloorProps) {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[20, 20, 100, 100]} />
      <meshStandardMaterial
        alphaMap={textures.alphaMap}
        transparent
        map={textures.map}
        aoMap={textures.aoMap}
        roughnessMap={textures.roughnessMap}
        metalnessMap={textures.metalnessMap}
        normalMap={textures.normalMap}
        displacementMap={textures.displacementMap}
        displacementScale={0.3}
        displacementBias={-0.2}
      />
    </mesh>
  )
}
