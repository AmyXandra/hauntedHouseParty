import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureSet } from '../types'

/**
 * Optimized hook that ONLY loads floor textures
 * Use this instead of useTextures() when you only need floor
 * Saves ~120MB by not loading unused texture sets
 */
export const useFloorTextures = () => {
  // Floor textures only
  const [
    floorAlphaTexture,
    floorColorTexture,
    floorARMTexture,
    floorNormalTexture,
    floorDisplacementTexture,
  ] = useLoader(THREE.TextureLoader, [
    '/floor/alpha.webp',
    '/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp',
    '/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp',
    '/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp',
    '/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp',
  ])

  // Configure floor textures
  floorColorTexture.colorSpace = THREE.SRGBColorSpace
  floorColorTexture.repeat.set(8, 8)
  floorARMTexture.repeat.set(8, 8)
  floorNormalTexture.repeat.set(8, 8)
  floorDisplacementTexture.repeat.set(8, 8)

  floorColorTexture.wrapS = THREE.RepeatWrapping
  floorARMTexture.wrapS = THREE.RepeatWrapping
  floorNormalTexture.wrapS = THREE.RepeatWrapping
  floorDisplacementTexture.wrapS = THREE.RepeatWrapping

  floorColorTexture.wrapT = THREE.RepeatWrapping
  floorARMTexture.wrapT = THREE.RepeatWrapping
  floorNormalTexture.wrapT = THREE.RepeatWrapping
  floorDisplacementTexture.wrapT = THREE.RepeatWrapping

  return {
    map: floorColorTexture,
    normalMap: floorNormalTexture,
    aoMap: floorARMTexture,
    roughnessMap: floorARMTexture,
    metalnessMap: floorARMTexture,
    displacementMap: floorDisplacementTexture,
    alphaMap: floorAlphaTexture,
  } as TextureSet
}
