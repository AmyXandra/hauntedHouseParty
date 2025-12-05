import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureSet } from '../types'

/**
 * Custom hook for loading and configuring all textures used in the haunted house scene
 * Loads textures from the static directory and applies appropriate settings
 * for repeat, wrapping, and color space
 */
export const useTextures = () => {
  // Floor textures
  const [
    floorAlphaTexture,
    floorColorTexture,
    floorARMTexture,
    floorNormalTexture,
    floorDisplacementTexture,
  ] = useLoader(THREE.TextureLoader, [
    '/floor/alpha.webp',
    './floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp',
    './floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp',
    './floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp',
    './floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp',
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

  // Wall textures
  const [wallColorTexture, wallARMTexture, wallNormalTexture] = useLoader(
    THREE.TextureLoader,
    [
      './wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp',
      './wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp',
      './wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp',
    ]
  )

  wallColorTexture.colorSpace = THREE.SRGBColorSpace

  // Roof textures
  const [roofColorTexture, roofARMTexture, roofNormalTexture] = useLoader(
    THREE.TextureLoader,
    [
      './roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp',
      './roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp',
      './roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp',
    ]
  )

  roofColorTexture.colorSpace = THREE.SRGBColorSpace
  roofColorTexture.repeat.set(3, 1)
  roofARMTexture.repeat.set(3, 1)
  roofNormalTexture.repeat.set(3, 1)

  roofColorTexture.wrapS = THREE.RepeatWrapping
  roofARMTexture.wrapS = THREE.RepeatWrapping
  roofNormalTexture.wrapS = THREE.RepeatWrapping

  // Bush textures
  const [bushColorTexture, bushARMTexture, bushNormalTexture] = useLoader(
    THREE.TextureLoader,
    [
      './bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp',
      './bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp',
      './bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp',
    ]
  )

  bushColorTexture.colorSpace = THREE.SRGBColorSpace
  bushColorTexture.repeat.set(2, 1)
  bushARMTexture.repeat.set(2, 1)
  bushNormalTexture.repeat.set(2, 1)

  bushColorTexture.wrapS = THREE.RepeatWrapping
  bushARMTexture.wrapS = THREE.RepeatWrapping
  bushNormalTexture.wrapS = THREE.RepeatWrapping

  // Grave textures
  const [graveColorTexture, graveARMTexture, graveNormalTexture] = useLoader(
    THREE.TextureLoader,
    [
      './grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp',
      './grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp',
      './grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp',
    ]
  )

  graveColorTexture.colorSpace = THREE.SRGBColorSpace
  graveColorTexture.repeat.set(0.3, 0.4)
  graveARMTexture.repeat.set(0.3, 0.4)
  graveNormalTexture.repeat.set(0.3, 0.4)

  // Door textures
  const [
    doorColorTexture,
    doorAOTexture,
    doorNormalTexture,
    doorAlphaTexture,
    doorHeightTexture,
    doorMetalnessTexture,
    doorRoughnessTexture,
  ] = useLoader(THREE.TextureLoader, [
    './door/color.webp',
    './door/ambientOcclusion.webp',
    './door/normal.webp',
    './door/alpha.webp',
    './door/height.webp',
    './door/metalness.webp',
    './door/roughness.webp',
  ])

  doorColorTexture.colorSpace = THREE.SRGBColorSpace

  // Return TextureSet objects for each material type
  return {
    floorTextures: {
      map: floorColorTexture,
      normalMap: floorNormalTexture,
      aoMap: floorARMTexture,
      roughnessMap: floorARMTexture,
      metalnessMap: floorARMTexture,
      displacementMap: floorDisplacementTexture,
      alphaMap: floorAlphaTexture,
    } as TextureSet,
    wallTextures: {
      map: wallColorTexture,
      normalMap: wallNormalTexture,
      aoMap: wallARMTexture,
      roughnessMap: wallARMTexture,
      metalnessMap: wallARMTexture,
    } as TextureSet,
    roofTextures: {
      map: roofColorTexture,
      normalMap: roofNormalTexture,
      aoMap: roofARMTexture,
      roughnessMap: roofARMTexture,
      metalnessMap: roofARMTexture,
    } as TextureSet,
    bushTextures: {
      map: bushColorTexture,
      normalMap: bushNormalTexture,
      aoMap: bushARMTexture,
      roughnessMap: bushARMTexture,
      metalnessMap: bushARMTexture,
    } as TextureSet,
    graveTextures: {
      map: graveColorTexture,
      normalMap: graveNormalTexture,
      aoMap: graveARMTexture,
      roughnessMap: graveARMTexture,
      metalnessMap: graveARMTexture,
    } as TextureSet,
    doorTextures: {
      map: doorColorTexture,
      normalMap: doorNormalTexture,
      aoMap: doorAOTexture,
      roughnessMap: doorRoughnessTexture,
      metalnessMap: doorMetalnessTexture,
      displacementMap: doorHeightTexture,
      alphaMap: doorAlphaTexture,
    } as TextureSet,
  }
}
