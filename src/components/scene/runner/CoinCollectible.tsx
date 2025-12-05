import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { HERO_Z_POSITION } from './HeroCharacter'

const RUNNING_SPEED = 0.3

interface Coin {
  id: string
  lane: number
  position: number
}

interface CoinCollectibleProps {
  coin: Coin
  onCollect: (id: string) => void
  onRemove: (id: string) => void
  currentLane: number
}

/**
 * Coin collectible component
 * Rotates, bobs, and moves towards player for collection
 */
export default function CoinCollectible({ 
  coin, 
  onCollect, 
  onRemove,
  currentLane
}: CoinCollectibleProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const hasCollectedRef = useRef(false)
  const hasRemovedRef = useRef(false)
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    // Move coin towards player with consistent speed
    meshRef.current.position.z += RUNNING_SPEED
    
    // Rotate coin
    meshRef.current.rotation.y += delta * 4
    
    // Bob up and down using elapsed time for consistency
    meshRef.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2
    
    // Check collection with hero (at z = HERO_Z_POSITION)
    const zDistance = Math.abs(meshRef.current.position.z - HERO_Z_POSITION)
    const xDistance = Math.abs(meshRef.current.position.x - currentLane)
    
    // Debug: Log position every few frames for first few seconds
    if (coin.id.includes('coin_') && meshRef.current.position.z > -20 && meshRef.current.position.z < -15) {
      console.log(`🪙 Coin ${coin.id} moving: Z=${meshRef.current.position.z.toFixed(1)}, X=${meshRef.current.position.x.toFixed(1)}`)
    }
    
    if (!hasCollectedRef.current && zDistance < 0.6 && xDistance < 0.8) {
      hasCollectedRef.current = true
      console.log(`🪙 COIN COLLECTED! Coin ${coin.id} at position ${meshRef.current.position.x.toFixed(2)} - Z:${zDistance.toFixed(2)} X:${xDistance.toFixed(2)}`)
      onCollect(coin.id)
    }
    
    // Remove if past player (without triggering collection)
    if (!hasRemovedRef.current && meshRef.current.position.z > HERO_Z_POSITION + 3) {
      hasRemovedRef.current = true
      onRemove(coin.id)
    }
  })
  
  // Load coin model
  const { scene } = useGLTF('/models/coin.glb')
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
useGLTF.preload('/models/coin.glb')

export type { Coin }