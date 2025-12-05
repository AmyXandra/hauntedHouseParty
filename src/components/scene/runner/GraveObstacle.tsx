import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HERO_Z_POSITION } from './HeroCharacter'

const RUNNING_SPEED = 0.3

interface GraveData {
  id: string
  lane: number
  position: number
}

interface GraveObstacleProps {
  grave: GraveData
  onCollision: (id: string, type: 'grave') => void
  onRemove: (id: string) => void
  currentLane: number
}

/**
 * Simple grave obstacle component
 * Moves towards player and checks for collision
 * Uses simple geometry for better performance
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
  
  // Generate random Y-axis rotation for this grave
  const graveRotation = useMemo(() => {
    const rotationY = (Math.random() - 0.5) * 0.4 // Random rotation around y-axis
    return [0, rotationY, 0] as [number, number, number]
  }, [grave.id]) // Use grave.id as dependency to ensure consistent rotation per grave
  
  useFrame(() => {
    if (!groupRef.current) return
    
    // Move grave towards player with consistent speed
    groupRef.current.position.z += RUNNING_SPEED
    
    // Check collision with hero (at z = HERO_Z_POSITION)
    const zDistance = Math.abs(groupRef.current.position.z - HERO_Z_POSITION)
    const xDistance = Math.abs(groupRef.current.position.x - currentLane)
    
    // Debug: Log position every few frames for first few seconds
    if (grave.id.includes('grave_') && groupRef.current.position.z > -20 && groupRef.current.position.z < -15) {
      console.log(`⚰️ Grave ${grave.id} moving: Z=${groupRef.current.position.z.toFixed(1)}, X=${groupRef.current.position.x.toFixed(1)}, Hero lane=${currentLane}`)
    }
    
    if (!hasCollidedRef.current && zDistance < 0.8 && xDistance < 0.6) {
      hasCollidedRef.current = true
      console.log(`⚰️ GRAVE COLLISION! Grave ${grave.id} at position ${groupRef.current.position.x.toFixed(2)} vs hero at lane ${currentLane} - Z:${zDistance.toFixed(2)} X:${xDistance.toFixed(2)}`)
      onCollision(grave.id, 'grave')
    }
    
    // Remove if past player (prevent multiple removal calls)
    if (!hasRemovedRef.current && groupRef.current.position.z > HERO_Z_POSITION + 3) {
      hasRemovedRef.current = true
      onRemove(grave.id)
    }
  })
  
  return (
    <group ref={groupRef} position={[grave.lane, 0, grave.position]} rotation={graveRotation}>
      {/* Simple grave geometry - better performance than textured Grave component */}
      <group>
        {/* Grave base */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.8, 0.6, 0.2]} />
          <meshStandardMaterial color="#444444" roughness={0.9} />
        </mesh>
        
        {/* Grave headstone */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.6, 0.4, 0.15]} />
          <meshStandardMaterial color="#555555" roughness={0.8} />
        </mesh>
        
        {/* Cross on top */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.05, 0.2, 0.05]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.15, 0.05, 0.05]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
    </group>
  )
}

export type { GraveData as Grave }