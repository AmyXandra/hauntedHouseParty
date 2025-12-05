import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { HERO_Z_POSITION } from './HeroCharacter'

const RUNNING_SPEED = 0.005

interface Coin {
  id: string
  lane: number
  position: number
}

interface CoinCollectibleProps {
  coin: Coin
  onCollect: (id: string) => void
  onRemove: (id: string) => void
}

/**
 * Coin collectible component
 * Rotates, bobs, and moves towards player for collection
 */
export default function CoinCollectible({ 
  coin, 
  onCollect, 
  onRemove 
}: CoinCollectibleProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const hasCollectedRef = useRef(false)
  const hasRemovedRef = useRef(false)
  
  useFrame((_, delta) => {
    if (!meshRef.current) return
    
    // Move coin towards player
    meshRef.current.position.z += RUNNING_SPEED * 60
    
    // Rotate coin
    meshRef.current.rotation.y += delta * 4
    
    // Bob up and down
    meshRef.current.position.y = 0.8 + Math.sin(Date.now() * 0.005) * 0.2
    
    // Check collection with hero (at z = HERO_Z_POSITION)
    if (!hasCollectedRef.current && 
        Math.abs(meshRef.current.position.z - HERO_Z_POSITION) < 0.5 &&
        Math.abs(meshRef.current.position.x - coin.lane) < 0.6) {
      hasCollectedRef.current = true
      onCollect(coin.id)
    }
    
    // Remove if past player (without triggering collection)
    if (!hasRemovedRef.current && meshRef.current.position.z > HERO_Z_POSITION + 2) {
      hasRemovedRef.current = true
      onRemove(coin.id)
    }
  })
  
  // Load coin model
  const { scene } = useGLTF('/models/coin2.glb')
  const clonedScene = useMemo(() => scene.clone(), [scene])
  
  return (
    <primitive 
      ref={meshRef} 
      object={clonedScene}
      position={[coin.lane, 0.8, coin.position]} 
      scale={0.8}
      castShadow
    />
  )
}

// Preload the coin model
useGLTF.preload('/models/coin2.glb')

export type { Coin }