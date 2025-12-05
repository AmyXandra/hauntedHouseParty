import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ScorePopup {
  id: string
  position: THREE.Vector3
  score: number
  lifetime: number
}

interface ScorePopupObjProps {
  popup: ScorePopup
  onRemove: (id: string) => void
}

export default function ScorePopupObj({ popup, onRemove }: ScorePopupObjProps) {
  const meshRef = useRef<THREE.Group>(null)
  
  useFrame((_, delta) => {
    if (!meshRef.current) return
    
    popup.position.y += delta * 2 // Float upward
    popup.lifetime += delta
    
    if (popup.lifetime > 2) {
      onRemove(popup.id)
    }
    
    meshRef.current.position.copy(popup.position)
    meshRef.current.scale.setScalar(1 + popup.lifetime * 0.5)
  })
  
  return (
    <group ref={meshRef}>
      <mesh>
        <planeGeometry args={[1, 0.5]} />
        <meshBasicMaterial 
          color={popup.score >= 500 ? '#ffd700' : '#00ff00'} 
          transparent 
          opacity={Math.max(0, 1 - popup.lifetime / 2)}
        />
      </mesh>
    </group>
  )
}