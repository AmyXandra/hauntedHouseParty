import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
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
  const meshRef = useRef<THREE.Mesh>(null)
  const hasCollidedRef = useRef(false)
  const hasRemovedRef = useRef(false)
  
  useFrame((_, delta) => {
    if (!meshRef.current) return
    
    // Update ghost position - moves forward
    ghost.position.z += 0.04 * delta * 60 // Faster than graves/coins
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
    
    meshRef.current.position.copy(ghost.position)
    meshRef.current.rotation.y += delta * 3
    meshRef.current.rotation.x += delta * 2
  })
  
  return (
    <group ref={meshRef}>
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
      
      {/* Glowing aura */}
      <mesh scale={1.3}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshBasicMaterial 
          color="#ccccff" 
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  )
}

export type { Ghost }