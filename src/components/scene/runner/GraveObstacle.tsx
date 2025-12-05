import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HERO_Z_POSITION } from './HeroCharacter'

const RUNNING_SPEED = 0.005

interface Grave {
  id: string
  lane: number
  position: number
}

interface GraveObstacleProps {
  grave: Grave
  onCollision: (id: string, type: 'grave') => void
  onRemove: (id: string) => void
  currentLane: number
}

/**
 * Grave obstacle component
 * Moves towards player and checks for collision
 */
export default function GraveObstacle({ 
  grave, 
  onCollision, 
  onRemove, 
  currentLane 
}: GraveObstacleProps) {
  const groupRef = useRef<THREE.Group>(null)
  const hasCollidedRef = useRef(false)
  const hasRemovedRef = useRef(false)
  
  useFrame(() => {
    if (!groupRef.current) return
    
    // Move grave towards player
    groupRef.current.position.z += RUNNING_SPEED * 60
    
    // Check collision with hero (at z = HERO_Z_POSITION)
    const zDistance = Math.abs(groupRef.current.position.z - HERO_Z_POSITION)
    const xDistance = Math.abs(grave.lane - currentLane)
    
    if (!hasCollidedRef.current && zDistance < 0.6 && xDistance < 0.5) {
      hasCollidedRef.current = true
      console.log(`⚰️ GRAVE COLLISION! Grave ${grave.id} at lane ${grave.lane} vs hero at lane ${currentLane} - Z:${zDistance.toFixed(2)} X:${xDistance.toFixed(2)}`)
      onCollision(grave.id, 'grave')
    }
    
    // Remove if past player (prevent multiple removal calls)
    if (!hasRemovedRef.current && groupRef.current.position.z > HERO_Z_POSITION + 2) {
      hasRemovedRef.current = true
      onRemove(grave.id)
    }
  })
  
  return (
    <group ref={groupRef} position={[grave.lane, 0, grave.position]}>
      {/* Grave base - increased size */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 1.0, 0.3]} /> {/* Increased from [0.6, 0.8, 0.2] */}
        <meshStandardMaterial color="#666666" roughness={0.9} />
      </mesh>
      
      {/* Cross on top - increased size */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.4, 0.12, 0.08]} /> {/* Increased from [0.3, 0.1, 0.05] */}
        <meshStandardMaterial color="#444444" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.12, 0.4, 0.08]} /> {/* Increased from [0.1, 0.3, 0.05] */}
        <meshStandardMaterial color="#444444" />
      </mesh>
    </group>
  )
}

export type { Grave }