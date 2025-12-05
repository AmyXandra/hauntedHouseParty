import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Bat {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  lifetime: number
}

interface BatObjProps {
  bat: Bat
  onRemove: (id: string) => void
}

export default function BatObj({ bat, onRemove }: BatObjProps) {
  const meshRef = useRef<THREE.Group>(null)
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    bat.position.add(bat.velocity.clone().multiplyScalar(delta * 60))
    bat.velocity.y -= 0.005 * delta * 60
    bat.lifetime += delta
    
    if (bat.lifetime > 3) {
      onRemove(bat.id)
    }
    
    meshRef.current.position.copy(bat.position)
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.5
  })
  
  return (
    <group ref={meshRef}>
      <mesh>
        <coneGeometry args={[0.3, 0.6, 4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.2, 0, 0]}>
        <coneGeometry args={[0.2, 0.4, 4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.2, 0, 0]}>
        <coneGeometry args={[0.2, 0.4, 4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  )
}