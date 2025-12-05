import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const HERO_BASE_Y = 0.5
const HERO_Z_POSITION = 8  // Position hero in front of camera (camera at z=18)

interface HeroProps {
  currentLane: number
  bounceValue: number
}

/**
 * Hero runner component
 * Represents the player character that moves between lanes
 */
export default function Hero({ currentLane, bounceValue }: HeroProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetX = currentLane
  const heroRadius = 0.5 // Increased from 0.3 to 0.5
  
  useFrame((_, delta) => {
    if (!meshRef.current) return
    
    // Smooth lane switching
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      delta * 8
    )
    
    // Apply bounce/jump
    meshRef.current.position.y = HERO_BASE_Y + bounceValue
    
    // Running animation - bob up and down
    meshRef.current.rotation.z = Math.sin(Date.now() * 0.01) * 0.1
  })
  
  return (
    <mesh ref={meshRef} position={[0, HERO_BASE_Y, HERO_Z_POSITION]} castShadow>
      <capsuleGeometry args={[heroRadius, 1.2, 4, 8]} /> {/* Increased height from 0.8 to 1.2 */}
      <meshStandardMaterial 
        color="#4a4a4a" 
        roughness={0.8}
      />
    </mesh>
  )
}

export { HERO_BASE_Y, HERO_Z_POSITION }