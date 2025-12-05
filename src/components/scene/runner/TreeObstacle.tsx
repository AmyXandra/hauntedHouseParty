import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ROLLING_SPEED = 0.008

interface Tree {
  id: string
  lane: number
  position: number
}

interface TreeObstacleProps {
  tree: Tree
  onCollision: (id: string) => void
}

/**
 * Tree obstacle component with flat shading
 * Moves towards player and checks for collision
 */
export default function TreeObstacle({ tree, onCollision }: TreeObstacleProps) {
  const groupRef = useRef<THREE.Group>(null)
  const hasCollidedRef = useRef(false)
  
  useFrame(() => {
    if (!groupRef.current) return
    
    // Move tree towards player
    groupRef.current.position.z += ROLLING_SPEED * 60
    
    // Check collision with hero (at z = 4.8)
    if (!hasCollidedRef.current && 
        Math.abs(groupRef.current.position.z - 4.8) < 0.5 &&
        Math.abs(groupRef.current.position.x - tree.lane) < 0.4) {
      hasCollidedRef.current = true
      onCollision(tree.id)
    }
    
    // Remove if past player
    if (groupRef.current.position.z > 6) {
      onCollision(tree.id)
    }
  })
  
  return (
    <group ref={groupRef} position={[tree.lane, 0, tree.position]}>
      {/* Tree trunk */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.5]} />
        <meshStandardMaterial color="#886633" flatShading />
      </mesh>
      
      {/* Tree top */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <coneGeometry args={[0.5, 1, 8]} />
        <meshStandardMaterial color="#33ff33" flatShading />
      </mesh>
    </group>
  )
}

export type { Tree }
