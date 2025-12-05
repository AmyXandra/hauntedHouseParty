import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Bomb {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  lifetime: number
}

interface BombObjProps {
  bomb: Bomb
  onExplode: (id: string, position: THREE.Vector3) => void
  onRemove: (id: string) => void
}

export default function BombObj({ bomb, onExplode, onRemove }: BombObjProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    bomb.position.add(bomb.velocity.clone().multiplyScalar(delta * 60))
    bomb.velocity.y -= 0.006 * delta * 60
    bomb.lifetime += delta
    
    if (bomb.position.y < -5) {
      onRemove(bomb.id)
    }
    
    meshRef.current.position.copy(bomb.position)
    meshRef.current.rotation.y += delta * 5
    
    const pulse = Math.sin(state.clock.elapsedTime * 10) * 0.1 + 1
    meshRef.current.scale.setScalar(pulse)
  })
  
  return (
    <mesh
      ref={meshRef}
      onClick={() => onExplode(bomb.id, bomb.position.clone())}
    >
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshStandardMaterial color="#2a2a2a" emissive="#ff0000" emissiveIntensity={0.5} />
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
    </mesh>
  )
}