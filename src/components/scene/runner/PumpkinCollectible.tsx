import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export interface PumpkinCollectible {
  id: string
  lane: number
  position: number
}

interface PumpkinCollectibleProps {
  pumpkin: PumpkinCollectible
  onCollect: (id: string) => void
  onRemove: (id: string) => void
}

/**
 * Special pumpkin collectible - worth more points than regular coins
 * Rotates and glows with Halloween atmosphere
 */
export default function PumpkinCollectible({
  pumpkin,
  onCollect,
  onRemove
}: PumpkinCollectibleProps) {
  const meshRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  
  // Try to load the actual pumpkin model
  let pumpkinModel = null
  try {
    const { scene } = useGLTF('/models/pumkin2.glb')
    pumpkinModel = useMemo(() => {
      const clone = scene.clone()
      
      // Optimize for collectible use
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = false
          child.receiveShadow = false
          
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  // Make it glow more for collectible visibility
                  mat.emissive = new THREE.Color(0xff6600)
                  mat.emissiveIntensity = 0.4
                }
              })
            } else if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissive = new THREE.Color(0xff6600)
              child.material.emissiveIntensity = 0.4
            }
          }
        }
      })
      
      return clone
    }, [scene])
  } catch (error) {
    console.log('Using fallback pumpkin for collectible')
  }
  
  useFrame((state) => {
    if (!meshRef.current) return
    
    // Move pumpkin forward
    pumpkin.position += 0.15
    meshRef.current.position.z = pumpkin.position
    
    // Floating animation
    const time = state.clock.elapsedTime
    meshRef.current.position.y = 0.5 + Math.sin(time * 3) * 0.2
    
    // Rotation animation
    meshRef.current.rotation.y = time * 2
    
    // Pulsing glow effect
    if (glowRef.current && glowRef.current.material instanceof THREE.MeshStandardMaterial) {
      glowRef.current.material.emissiveIntensity = 0.3 + Math.sin(time * 4) * 0.2
    }
    
    // Check for collection (player is at z=8)
    const distanceToPlayer = Math.abs(pumpkin.position - 8)
    if (distanceToPlayer < 1.5) {
      console.log('🎃 PUMPKIN COLLECTED! Worth 50 points!')
      onCollect(pumpkin.id)
      return
    }
    
    // Remove if passed player
    if (pumpkin.position > 12) {
      onRemove(pumpkin.id)
    }
  })
  
  return (
    <group 
      ref={meshRef}
      position={[pumpkin.lane, 0.5, pumpkin.position]}
    >
      {/* Outer glow effect */}
      <mesh ref={glowRef} scale={1.5}>
        <sphereGeometry args={[0.6, 8, 6]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff6600"
          emissiveIntensity={0.3}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Main pumpkin model or fallback */}
      {pumpkinModel ? (
        <primitive 
          object={pumpkinModel} 
          scale={1.2} // Slightly larger for collectible visibility
          rotation={[0, 0, 0]}
        />
      ) : (
        <group>
          {/* Fallback pumpkin */}
          <mesh>
            <sphereGeometry args={[0.4, 12, 8]} />
            <meshStandardMaterial 
              color="#ff6600" 
              emissive="#ff3300" 
              emissiveIntensity={0.4}
              roughness={0.7}
            />
          </mesh>
          
          {/* Stem */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 0.2, 6]} />
            <meshStandardMaterial color="#228833" />
          </mesh>
          
          {/* Glowing carved face */}
          <mesh position={[-0.15, 0.1, 0.35]}>
            <boxGeometry args={[0.08, 0.08, 0.1]} />
            <meshStandardMaterial 
              color="#ffaa00" 
              emissive="#ffaa00" 
              emissiveIntensity={1.0}
            />
          </mesh>
          <mesh position={[0.15, 0.1, 0.35]}>
            <boxGeometry args={[0.08, 0.08, 0.1]} />
            <meshStandardMaterial 
              color="#ffaa00" 
              emissive="#ffaa00" 
              emissiveIntensity={1.0}
            />
          </mesh>
          <mesh position={[0, -0.1, 0.35]}>
            <boxGeometry args={[0.2, 0.06, 0.1]} />
            <meshStandardMaterial 
              color="#ffaa00" 
              emissive="#ffaa00" 
              emissiveIntensity={1.0}
            />
          </mesh>
        </group>
      )}
      
      {/* Sparkle particles effect */}
      <mesh position={[0.3, 0.3, 0]}>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial 
          color="#ffff00" 
          emissive="#ffff00" 
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[-0.3, 0.2, 0.2]}>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial 
          color="#ffaa00" 
          emissive="#ffaa00" 
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[0.2, -0.2, -0.2]}>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial 
          color="#ff6600" 
          emissive="#ff6600" 
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  )
}

// Preload the pumpkin model
useGLTF.preload('/models/pumkin2.glb')

export type { PumpkinCollectible }