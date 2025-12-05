import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Group, MeshStandardMaterial, Mesh, Color } from 'three'
import { SkeletonHandProps } from '../../types/animation'
import { createProceduralSkeletonHand } from '../../utils/proceduralSkeletonHand'

// Shared bone material - reused across all instances
const boneMaterial = new MeshStandardMaterial({
  color: new Color(0.91, 0.86, 0.78), // Off-white bone color (RGB > 200/255)
  roughness: 0.6, // Medium roughness for aged bone
  metalness: 0.1 // Low metalness
})

/**
 * SkeletonHand component that emerges from the doorway during transition
 * Loads a GLTF model and animates position based on animation progress
 * Includes error handling for model load failures
 * 
 * Performance optimizations:
 * - Lazy loads model only when visible
 * - Reuses shared material across renders
 * - Uses refs for animation values to avoid re-renders
 */
export default function SkeletonHand({ visible, animationProgress, position }: SkeletonHandProps) {
  const groupRef = useRef<Group>(null)
  const [modelLoadError, setModelLoadError] = useState(false)
  const [shouldLoadModel, setShouldLoadModel] = useState(false)
  
  // Use refs for animation values to avoid triggering re-renders
  const animationProgressRef = useRef(animationProgress)
  animationProgressRef.current = animationProgress

  // Initial position inside doorway
  const startPosition = useMemo(() => ({ x: 0, y: 1.5, z: 2 }), [])
  // Final position reaching toward camera
  const endPosition = useMemo(() => position, [position.x, position.y, position.z])

  // Lazy load model only when visible for the first time
  if (visible && !shouldLoadModel && !modelLoadError) {
    setShouldLoadModel(true)
  }

  // Try to load the skeleton hand model only when needed
  let model: any = null
  if (shouldLoadModel) {
    try {
      model = useGLTF('/models/skeleton-hand.glb')
    } catch (error) {
      console.warn('Failed to load skeleton hand model:', error)
      if (!modelLoadError) {
        setModelLoadError(true)
      }
    }
  }

  // Memoize the configured model scene to avoid re-processing
  const configuredScene = useMemo(() => {
    if (!model || !model.scene) return null
    
    const scene = model.scene.clone()
    // Apply bone-like material properties to all meshes
    scene.traverse((child: any) => {
      if (child instanceof Mesh) {
        child.castShadow = true
        // Reuse shared material instead of creating new ones
        child.material = boneMaterial
      }
    })
    
    return scene
  }, [model])

  // Update position based on animation progress using refs
  useFrame(() => {
    if (groupRef.current && visible && !modelLoadError) {
      // Interpolate position from start to end based on progress
      const t = animationProgressRef.current
      groupRef.current.position.x = startPosition.x + (endPosition.x - startPosition.x) * t
      groupRef.current.position.y = startPosition.y + (endPosition.y - startPosition.y) * t
      groupRef.current.position.z = startPosition.z + (endPosition.z - startPosition.z) * t
    }
  })

  // Don't render if model failed to load or not visible
  if (modelLoadError || !visible) {
    return null
  }

  // Fallback to procedural skeleton hand if model not loaded yet
  const proceduralHand = useMemo(() => {
    if (configuredScene) return null
    return createProceduralSkeletonHand()
  }, [configuredScene])

  if (!configuredScene && proceduralHand) {
    return (
      <group ref={groupRef} position={[startPosition.x, startPosition.y, startPosition.z]}>
        <primitive object={proceduralHand} />
      </group>
    )
  }

  return (
    <group ref={groupRef} position={[startPosition.x, startPosition.y, startPosition.z]}>
      <primitive object={configuredScene} />
    </group>
  )
}

// Conditionally preload the model - only if it exists
// This prevents errors during development when model file doesn't exist yet
try {
  useGLTF.preload('/models/skeleton-hand.glb')
} catch (error) {
  console.warn('Skeleton hand model not available for preload')
}
