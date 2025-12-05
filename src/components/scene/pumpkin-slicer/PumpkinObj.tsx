import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface Pumpkin {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  isHalo: boolean
  sliced: boolean
  sliceTime: number
}

interface PumpkinObjProps {
  pumpkin: Pumpkin
  onRemove: (id: string, missed?: boolean) => void
}

export default function PumpkinObj({ pumpkin, onRemove }: PumpkinObjProps) {
  const meshRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/pumkin2.glb')
  
  useFrame((_, delta) => {
    if (!meshRef.current || pumpkin.sliced) return
    
    pumpkin.position.add(pumpkin.velocity.clone().multiplyScalar(delta * 60))
    pumpkin.velocity.y -= 0.004 * delta * 60 // Reduced gravity (was 0.008)
    
    // Check if pumpkin fell below ground level (missed)
    if (pumpkin.position.y < -5) {
      onRemove(pumpkin.id, true) // Pass true to indicate it was missed
      return
    }
    
    // Remove if too high (off screen)
    if (pumpkin.position.y > 12) { // Higher ceiling before removal
      onRemove(pumpkin.id)
    }
    
    meshRef.current.position.copy(pumpkin.position)
    meshRef.current.rotation.y += delta * 1.5 // Slower rotation
    meshRef.current.rotation.x = pumpkin.velocity.length() * 8
  })
  
  if (pumpkin.sliced) {
    const timeSinceSlice = (Date.now() - pumpkin.sliceTime) / 1000
    const scale = 1 - timeSinceSlice * 2
    
    return (
      <group ref={meshRef} scale={Math.max(0, scale)}>
        {/* Sliced pumpkin halves */}
        <primitive object={scene.clone()} position={[-0.2, 0, 0]} rotation={[0, 0, 0.3]} scale={0.5} />
        {/* <primitive object={scene.clone()} position={[0.2, 0, 0]} rotation={[0, 0, -0.3]} scale={2} /> */}
      </group>
    )
  }
  
  return (
    <group ref={meshRef} userData={{ pumpkinId: pumpkin.id, pumpkin }}>
      {/* 3D Pumpkin model */}
      <primitive 
        object={scene.clone()} 
        scale={1.3}
      />
      
      {pumpkin.isHalo && (
        <>
          <mesh position={[0, 2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.2, 0.1, 16, 32]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffff00" emissiveIntensity={2} />
          </mesh>
          {/* Halo glow effect */}
          <mesh position={[0, 2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.0, 0.08, 16, 32]} />
            <meshBasicMaterial 
              color="#ffff00" 
              transparent 
              opacity={0.4}
            />
          </mesh>
        </>
      )}
    </group>
  )
}