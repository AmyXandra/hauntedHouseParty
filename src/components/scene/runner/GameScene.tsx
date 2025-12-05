import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Sky from '../Sky'
import HeroCharacter from './HeroCharacter'
import GraveObstacle, { type Grave } from './GraveObstacle'
import CoinCollectible, { type Coin } from './CoinCollectible'
import GhostEnemy, { type Ghost } from './GhostEnemy'
import RunningPath from './RunningPath'
import EnvironmentDecorations from './EnvironmentDecorations'

// Game constants
const LEFT_LANE = -2
const MIDDLE_LANE = 0
const RIGHT_LANE = 2

interface GameState {
  score: number
  lives: number
  gameStatus: 'menu' | 'playing' | 'gameover'
  currentLane: number
  isJumping: boolean
  coinsCollected: number
}

interface GameSceneProps {
  gameState: GameState
  onCollision: (id: string, type: 'grave' | 'ghost') => void
  onCoinCollect: (id: string) => void
  bounceValue: number
}

/**
 * Main game scene component for the endless runner
 * Handles spawning, collision detection, and game object management
 */
export default function GameScene({
  gameState,
  onCollision,
  onCoinCollect,
  bounceValue
}: GameSceneProps) {
  const [graves, setGraves] = useState<Grave[]>([])
  const [coins, setCoins] = useState<Coin[]>([])
  const [ghosts, setGhosts] = useState<Ghost[]>([])
  const lastSpawnTime = useRef(0)
  const lastGhostSpawn = useRef(0)
  
  // Spawn graves and coins periodically
  useFrame((state) => {
    if (gameState.gameStatus !== 'playing') return
    
    const elapsed = state.clock.elapsedTime
    
    // Spawn graves and coins every 2 seconds for better spacing
    if (elapsed - lastSpawnTime.current > 2.0) {
      lastSpawnTime.current = elapsed
      
      const lanes = [LEFT_LANE, MIDDLE_LANE, RIGHT_LANE]
      const shuffledLanes = [...lanes].sort(() => Math.random() - 0.5)
      
      // Spawn 1-2 graves, but leave at least one lane clear
      const numGraves = Math.random() > 0.5 ? 1 : 2
      const newGraves: Grave[] = []
      
      for (let i = 0; i < numGraves && i < 2; i++) { // Max 2 graves, leave 1 lane clear
        newGraves.push({
          id: `grave_${elapsed}_${i}`,
          lane: shuffledLanes[i],
          position: -30  // Start further away for better visibility
        })
      }
      
      // Spawn coins in remaining lanes (higher chance for better rewards)
      const newCoins: Coin[] = []
      for (let i = numGraves; i < shuffledLanes.length; i++) {
        if (Math.random() > 0.2) { // 80% chance to spawn coin in free lanes
          newCoins.push({
            id: `coin_${elapsed}_${i}`,
            lane: shuffledLanes[i],
            position: -30  // Start further away for better visibility
          })
        }
      }
      
      // Always ensure at least one collectible or clear path
      if (newGraves.length === 3) {
        newGraves.pop() // Remove one grave to ensure passable lane
      }
      
      setGraves(prev => [...prev, ...newGraves])
      setCoins(prev => [...prev, ...newCoins])
      
      console.log(`🎮 Spawned ${newGraves.length} graves and ${newCoins.length} coins at time ${elapsed.toFixed(1)}s`)
      console.log('Grave positions:', newGraves.map(g => `Lane ${g.lane}, Z ${g.position}`))
      console.log('Coin positions:', newCoins.map(c => `Lane ${c.lane}, Z ${c.position}`))
    }
    
    // Spawn ghost every 8-12 seconds (more frequent for challenge)
    if (elapsed - lastGhostSpawn.current > (8 + Math.random() * 4)) {
      lastGhostSpawn.current = elapsed
      
      const newGhost: Ghost = {
        id: `ghost_${elapsed}`,
        position: new THREE.Vector3(
          0, // Start in center, will wave across lanes
          2.5, // Flying height
          -35 // Start much further behind
        ),
        velocity: new THREE.Vector3(0, 0, 0), // Velocity handled in component
        lifetime: 0
      }
      
      setGhosts(prev => [...prev, newGhost])
      console.log(`👻 Spawned ghost at ${elapsed.toFixed(1)}s`)
    }
  })
  
  const handleGraveCollision = (id: string, type: 'grave') => {
    setGraves(prev => prev.filter(g => g.id !== id))
    onCollision(id, type)
  }
  
  const handleGraveRemove = (id: string) => {
    console.log('Grave removed (missed)', id)
    setGraves(prev => prev.filter(g => g.id !== id))
  }
  
  const handleGhostCollision = (id: string, type: 'ghost') => {
    setGhosts(prev => prev.filter(g => g.id !== id))
    onCollision(id, type)
  }
  
  const handleGhostRemove = (id: string) => {
    console.log('Ghost removed (missed)', id)
    setGhosts(prev => prev.filter(g => g.id !== id))
  }
  
  const handleCoinCollect = (id: string) => {
    console.log('Coin collected!', id)
    setCoins(prev => prev.filter(c => c.id !== id))
    onCoinCollect(id)
  }
  
  const handleCoinRemove = (id: string) => {
    console.log('Coin removed (missed)', id)
    setCoins(prev => prev.filter(c => c.id !== id))
  }
  
  return (
    <>
      {/* Atmospheric sky for immersive experience */}
      <Sky />
      {/* <color attach="background" args={['#0f0a08']} /> */}
      
      <fog attach="fog" args={['#1a0f0a', 12, 40]} />
      
      {/* Increased ambient lighting for better visibility */}
      <ambientLight intensity={5.6} color="#ecd8cfff" />
      <directionalLight
        position={[3, 6, 4]}
        intensity={0.7}
        color="#ff6600"
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      
      {/* Single point light for atmosphere */}
      <pointLight
        position={[0, 2, 8]}
        intensity={0.2}
        color="#ffaa44"
        distance={12}
      />
      
      <RunningPath />
      
      {/* Environment decorations along the path edges */}
      <EnvironmentDecorations />
      
      <HeroCharacter 
        currentLane={gameState.currentLane} 
        bounceValue={bounceValue}
      />
      
      {graves.map(grave => (
        <GraveObstacle
          key={grave.id}
          grave={grave}
          onCollision={handleGraveCollision}
          onRemove={handleGraveRemove}
          currentLane={gameState.currentLane}
        />
      ))}
      
      {coins.map(coin => (
        <CoinCollectible
          key={coin.id}
          coin={coin}
          onCollect={handleCoinCollect}
          onRemove={handleCoinRemove}
          currentLane={gameState.currentLane}
        />
      ))}
      
      {ghosts.map(ghost => (
        <GhostEnemy
          key={ghost.id}
          ghost={ghost}
          onCollision={handleGhostCollision}
          onRemove={handleGhostRemove}
          currentLane={gameState.currentLane}
          bounceValue={bounceValue}
        />
      ))}
    </>
  )
}

export type { GameState }