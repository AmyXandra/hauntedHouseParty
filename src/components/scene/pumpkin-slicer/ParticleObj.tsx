import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Particle {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  lifetime: number
  color: string
}

interface ParticleObjProps {
  particle: Particle
  onRemove: (id: string) => void
}

export default function ParticleObj({ particle, onRemove }: ParticleObjProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((_, delta) => {
    if (!meshRef.current) return
    
    particle.position.add(particle.velocity.clone().multiplyScalar(delta * 60))
    particle.velocity.y -= 0.01 * delta * 60
    particle.lifetime += delta
    
    if (particle.lifetime > 1) {
      onRemove(particle.id)
    }
    
    meshRef.current.position.copy(particle.position)
    const scale = 1 - particle.lifetime
    meshRef.current.scale.setScalar(scale * 0.2)
  })
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color={particle.color} emissive={particle.color} emissiveIntensity={2} />
    </mesh>
  )
}