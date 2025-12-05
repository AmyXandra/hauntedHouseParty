import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import PumpkinObj from './PumpkinObj'
import BatObj from './BatObj'
import BombObj from './BombObj'
import ParticleObj from './ParticleObj'
import ScorePopupObj from './ScorePopupObj'
import SwipeDetector from './SwipeDetector'

interface GameState {
  score: number
  lives: number
  round: number
  gameStatus: 'menu' | 'playing' | 'gameover' | 'roundComplete'
  pumpkins: any[]
  bats: any[]
  bombs: any[]
  particles: any[]
  scorePopups: any[]
  pumpkinsSlicedThisRound: number
  totalPumpkinsThisRound: number
}

interface GameSceneProps {
  gameState: GameState
  onSlicePumpkin: (id: string, position: THREE.Vector3) => void
  onRemovePumpkin: (id: string, missed?: boolean) => void
  onRemoveBat: (id: string) => void
  onExplodeBomb: (id: string, position: THREE.Vector3) => void
  onRemoveBomb: (id: string) => void
  onRemoveParticle: (id: string) => void
  onRemoveScorePopup: (id: string) => void
}

export default function GameScene({
  gameState,
  onSlicePumpkin,
  onRemovePumpkin,
  onRemoveBat,
  onExplodeBomb,
  onRemoveBomb,
  onRemoveParticle,
  onRemoveScorePopup
}: GameSceneProps) {
  // Load PNG background texture
  const backgroundTexture = useLoader(
    THREE.TextureLoader,
    '/images/pumpkin-slicer-bg.png' // Replace with your PNG path
  )

  // Configure background texture
  useMemo(() => {
    backgroundTexture.colorSpace = THREE.SRGBColorSpace
  }, [backgroundTexture])

  return (
    <>
      <color attach="background" args={['#1a0f0a']} /> {/* Dark brown/orange to match haunted theme */}
      <fog attach="fog" args={['#2a1810', 12, 30]} /> {/* Warm dark fog that fades to background */} 

      {/* Lighting setup */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} color="#ff8800" castShadow /> Orange moon
      <pointLight position={[0, 5, 10]} intensity={0.8} color="#ffffff" /> {/* Front light for wall */}
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />

      {/* PNG background backdrop - positioned far back, full width */}
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[100, 20]} />
        <meshBasicMaterial
          map={backgroundTexture}
          transparent={true}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Spooky ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Swipe detector for slice mechanics */}
      <SwipeDetector gameState={gameState} onSlicePumpkin={onSlicePumpkin} />

      {gameState.pumpkins.map(pumpkin => (
        <PumpkinObj
          key={pumpkin.id}
          pumpkin={pumpkin}
          onRemove={onRemovePumpkin}
        />
      ))}

      {gameState.bats.map(bat => (
        <BatObj
          key={bat.id}
          bat={bat}
          onRemove={onRemoveBat}
        />
      ))}

      {gameState.bombs.map(bomb => (
        <BombObj
          key={bomb.id}
          bomb={bomb}
          onExplode={onExplodeBomb}
          onRemove={onRemoveBomb}
        />
      ))}

      {gameState.particles.map(particle => (
        <ParticleObj
          key={particle.id}
          particle={particle}
          onRemove={onRemoveParticle}
        />
      ))}

      {gameState.scorePopups.map(popup => (
        <ScorePopupObj
          key={popup.id}
          popup={popup}
          onRemove={onRemoveScorePopup}
        />
      ))}
    </>
  )
}