import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { HERO_BASE_Y, HERO_Z_POSITION } from './HeroCharacter'

interface Ghost {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  lifetime: number
}

interface GhostEnemyProps {
  ghost: Ghost
  onCollision: (id: string, type: 'ghost') => void
  onRemove: (id: string) => void
  currentLane: number
  bounceValue: number
}

/**
 * Ghost Model Component - loads ghost.glb model
 */
function GhostModel({ scale = 1.0 }: { scale?: number }) {
  try {
    const { scene } = useGLTF('/models/ghost.glb')
    
    const clonedScene = useMemo(() => {
      const clone = scene.clone()
      
      // Configure ghost materials for enhanced spooky effect
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = false // Ghosts don't cast shadows
          child.receiveShadow = false
          
          // Apply enhanced ghostly material properties
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  // Enhanced ghost appearance
                  mat.transparent = true
                  mat.opacity = 0.85 // Slightly more opaque for better visibility
                  mat.emissive = new THREE.Color(0xaaccff) // Cooler blue-white glow
                  mat.emissiveIntensity = 0.6 // Stronger glow
                  mat.color = new THREE.Color(0xffffff) // Pure white
                  mat.roughness = 0.1 // Very smooth for ethereal look
                  mat.metalness = 0.0 // Non-metallic
                  mat.side = THREE.DoubleSide // Visible from both sides
                }
              })
            } else if (child.material instanceof THREE.MeshStandardMaterial) {
              // Enhanced ghost appearance
              child.material.transparent = true
              child.material.opacity = 0.85 // Slightly more opaque for better visibility
              child.material.emissive = new THREE.Color(0xaaccff) // Cooler blue-white glow
              child.material.emissiveIntensity = 0.6 // Stronger glow
              child.material.color = new THREE.Color(0xffffff) // Pure white
              child.material.roughness = 0.1 // Very smooth for ethereal look
              child.material.metalness = 0.0 // Non-metallic
              child.material.side = THREE.DoubleSide // Visible from both sides
            }
          }
        }
      })
      
      return clone
    }, [scene])
    
    return <primitive object={clonedScene} scale={scale} />
  } catch (error) {
    console.error('Failed to load ghost.glb:', error)
    // Fallback to procedural ghost
    return (
      <group scale={scale}>
        {/* Ghost body */}
        <mesh castShadow>
          <sphereGeometry args={[0.5, 8, 6]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent
            opacity={0.8}
            emissive="#ccccff"
            emissiveIntensity={0.4}
          />
        </mesh>
        
        {/* Ghost tail/wispy effect */}
        <mesh position={[0, -0.3, 0]}>
          <coneGeometry args={[0.3, 0.8, 6]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent
            opacity={0.6}
            emissive="#ccccff"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    )
  }
}

/**
 * Ghost enemy component - flies in wave pattern
 * Requires ducking or precise timing to avoid
 */
export default function GhostEnemy({ 
  ghost, 
  onCollision, 
  onRemove, 
  currentLane, 
  bounceValue 
}: GhostEnemyProps) {
  const groupRef = useRef<THREE.Group>(null)
  const hasCollidedRef = useRef(false)
  const hasRemovedRef = useRef(false)
  
  useFrame((_, delta) => {
    if (!groupRef.current) return
    
    // Update ghost position - moves forward
    ghost.position.z += 0.4 // Faster than graves/coins
    ghost.lifetime += delta
    
    // Wave motion - flies in sine wave pattern across lanes
    ghost.position.x = Math.sin(ghost.lifetime * 2) * 3 // Oscillate between lanes
    
    // Flying height - higher than runner, requires ducking
    ghost.position.y = 2.5 + Math.sin(ghost.lifetime * 4) * 0.5 // Float between 2-3 units high
    
    // Check collision with hero (when hero is jumping or ghost dips low)
    const zDistance = Math.abs(ghost.position.z - HERO_Z_POSITION)
    const xDistance = Math.abs(ghost.position.x - currentLane)
    const yDistance = Math.abs(ghost.position.y - (HERO_BASE_Y + bounceValue))
    
    if (!hasCollidedRef.current && 
        zDistance < 1.0 &&
        xDistance < 0.8 &&
        yDistance < 1.0) { // Tighter collision box - only when ghost is low or hero is high
      hasCollidedRef.current = true
      console.log(`GHOST COLLISION! Ghost ${ghost.id} - Z:${zDistance.toFixed(2)} X:${xDistance.toFixed(2)} Y:${yDistance.toFixed(2)}`)
      onCollision(ghost.id, 'ghost')
    }
    
    // Remove if too far (prevent multiple removal calls)
    if (!hasRemovedRef.current && ghost.position.z > HERO_Z_POSITION + 4) {
      hasRemovedRef.current = true
      onRemove(ghost.id)
    }
    
    groupRef.current.position.copy(ghost.position)
  })
  
  return (
    <group ref={groupRef}>
      {/* Ghost 3D Model */}
      <GhostModel scale={0.3} />
      
      {/* Enhanced glowing aura effect */}
      <mesh scale={1.0}>
        <sphereGeometry args={[0.5, 12, 8]} />
        <meshBasicMaterial 
          color="#aaccff" 
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Inner glow for more depth */}
      <mesh scale={0.8}>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// Preload the ghost model
useGLTF.preload('/models/ghost.glb')

export type { Ghost }