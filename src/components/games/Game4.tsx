import { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GameProps } from '../../types'
import { GameState, Pumpkin, Bat, Bomb, ScorePopup } from '../../types/pumpkin-slicer'
import BackButton from '../ui/BackButton'
import GameScene from '../scene/pumpkin-slicer/GameScene'
import GameUI from '../ui/pumpkin-slicer/GameUI'
import MenuScreen from '../ui/pumpkin-slicer/MenuScreen'
import GameOverModal from '../ui/GameOverModal'
import LoadingScreen from '../ui/LoadingScreen'
import { useHighScore } from '../../hooks/useHighScore'

// Preload assets for faster loading
useGLTF.preload('/models/pumkin2.glb')
new THREE.TextureLoader().load('/images/pumpkin-slicer-bg.png')


/**
 * Game4: Pumpkin Slicer
 * 3D pumpkin slicing game inspired by Fruit Ninja
 * Click pumpkins to slice them and score points, avoid bombs
 * Infinite gameplay - game ends when lives reach 0
 */
const Game4 = ({ onBack }: GameProps) => {
  const [isLoadingAssets, setIsLoadingAssets] = useState(false)
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    round: 1,
    gameStatus: 'menu',
    pumpkins: [],
    bats: [],
    bombs: [],
    particles: [],
    scorePopups: [],
    pumpkinsSlicedThisRound: 0,
    totalPumpkinsThisRound: 0
  })

  // High score tracking
  const { highScore, updateHighScore } = useHighScore('pumpkin-slicer')

  // Game actions
  const startGame = () => {
    // Show loading screen
    setIsLoadingAssets(true)
    
    // Small delay to show loading screen, then start game
    setTimeout(() => {
      setGameState({
        score: 0,
        lives: 3,
        round: 1,
        gameStatus: 'playing',
        pumpkins: [],
        bats: [],
        bombs: [],
        particles: [],
        scorePopups: [],
        pumpkinsSlicedThisRound: 0,
        totalPumpkinsThisRound: 0
      })

      // Hide loading screen after assets are ready
      setTimeout(() => {
        setIsLoadingAssets(false)
        addPumpkinBatch(2)
      }, 1000) // Give time for Canvas and scene to initialize
    }, 100)
  }

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'menu',
      pumpkins: [],
      bats: [],
      bombs: [],
      particles: [],
      scorePopups: [],
      pumpkinsSlicedThisRound: 0,
      totalPumpkinsThisRound: 0
    }))
  }

  const addPumpkin = () => {
    const id = Math.random().toString(36)
    const isHalo = Math.random() < 0.1
    const pumpkin: Pumpkin = {
      id,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        -4,
        (Math.random() - 0.5) * 6
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.09,
        0.18 + Math.random() * 0.08,
        (Math.random() - 0.5) * 0.04
      ),
      isHalo,
      sliced: false,
      sliceTime: 0
    }

    setGameState(prev => ({
      ...prev,
      pumpkins: [...prev.pumpkins, pumpkin]
    }))
  }

  const addBombNaturally = () => {
    const id = Math.random().toString(36)
    const bomb: Bomb = {
      id,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        -4,
        (Math.random() - 0.5) * 6
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.09,
        0.18 + Math.random() * 0.08,
        (Math.random() - 0.5) * 0.04
      ),
      lifetime: 0
    }

    setGameState(prev => ({
      ...prev,
      bombs: [...prev.bombs, bomb]
    }))
  }

  const addPumpkinBatch = (count: number) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => addPumpkin(), i * 200)
    }
  }



  const addScorePopup = (position: THREE.Vector3, score: number) => {
    const popup: ScorePopup = {
      id: Math.random().toString(36),
      position: position.clone(),
      score,
      lifetime: 0
    }

    setGameState(prev => ({
      ...prev,
      scorePopups: [...prev.scorePopups, popup]
    }))
  }

  const addBat = (position: THREE.Vector3) => {
    const id = Math.random().toString(36)
    const bat: Bat = {
      id,
      position: position.clone(),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        0.1 + Math.random() * 0.1,
        (Math.random() - 0.5) * 0.2
      ),
      lifetime: 0
    }

    setGameState(prev => ({
      ...prev,
      bats: [...prev.bats, bat]
    }))
  }



  const slicePumpkin = (id: string, position: THREE.Vector3) => {
    const pumpkin = gameState.pumpkins.find(p => p.id === id)
    if (!pumpkin || pumpkin.sliced) return

    if (pumpkin.isHalo) {
      const unslicedCount = gameState.pumpkins.filter(p => !p.sliced).length

      setGameState(prev => {
        const newSlicedCount = prev.pumpkinsSlicedThisRound + unslicedCount
        return {
          ...prev,
          score: prev.score + 500,
          pumpkinsSlicedThisRound: newSlicedCount,
          pumpkins: prev.pumpkins.map(p => ({ ...p, sliced: true, sliceTime: Date.now() }))
        }
      })
      addScorePopup(position, 500)
    } else {
      setGameState(prev => {
        const newSlicedCount = prev.pumpkinsSlicedThisRound + 1
        return {
          ...prev,
          score: prev.score + 100,
          pumpkinsSlicedThisRound: newSlicedCount,
          pumpkins: prev.pumpkins.map(p =>
            p.id === id ? { ...p, sliced: true, sliceTime: Date.now() } : p
          )
        }
      })

      addScorePopup(position, 100)

      for (let i = 0; i < 3; i++) {
        setTimeout(() => addBat(position), i * 100)
      }
    }

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        pumpkins: prev.pumpkins.filter(p => p.id !== id)
      }))
    }, 1000)
  }

  const explodeBomb = (id: string, _position: THREE.Vector3) => {
    setGameState(prev => {
      const newLives = prev.lives - 1
      const isGameOver = newLives <= 0
      
      // Update high score when game ends
      if (isGameOver) {
        const isNewHighScore = updateHighScore(prev.score)
        if (isNewHighScore) {
          console.log(`🏆 NEW HIGH SCORE: ${prev.score}!`)
        }
      }
      
      return {
        ...prev,
        lives: newLives,
        gameStatus: isGameOver ? 'gameover' : prev.gameStatus,
        bombs: prev.bombs.filter(b => b.id !== id)
      }
    })
  }

  const removePumpkin = (id: string, missed: boolean = false) => {
    if (missed) {
      setGameState(prev => {
        const newLives = prev.lives - 1
        const isGameOver = newLives <= 0
        
        // Update high score when game ends
        if (isGameOver) {
          const isNewHighScore = updateHighScore(prev.score)
          if (isNewHighScore) {
            console.log(`🏆 NEW HIGH SCORE: ${prev.score}!`)
          }
        }
        
        return {
          ...prev,
          lives: newLives,
          gameStatus: isGameOver ? 'gameover' : prev.gameStatus,
          pumpkins: prev.pumpkins.filter(p => p.id !== id)
        }
      })
    } else {
      setGameState(prev => ({
        ...prev,
        pumpkins: prev.pumpkins.filter(p => p.id !== id)
      }))
    }
  }

  const removeBat = (id: string) => {
    setGameState(prev => ({
      ...prev,
      bats: prev.bats.filter(b => b.id !== id)
    }))
  }

  const removeBomb = (id: string) => {
    setGameState(prev => ({
      ...prev,
      bombs: prev.bombs.filter(b => b.id !== id)
    }))
  }

  const removeParticle = (id: string) => {
    setGameState(prev => ({
      ...prev,
      particles: prev.particles.filter(p => p.id !== id)
    }))
  }

  const removeScorePopup = (id: string) => {
    setGameState(prev => ({
      ...prev,
      scorePopups: prev.scorePopups.filter(p => p.id !== id)
    }))
  }

  // Infinite spawn system - continuously spawn pumpkins and occasional bombs
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return

    const maxPumpkinsOnScreen = 5
    const spawnInterval = 1500
    const batchSize = 2

    const interval = setInterval(() => {
      const currentPumpkinCount = gameState.pumpkins.filter(p => !p.sliced).length
      const currentBombCount = gameState.bombs.length

      // Spawn pumpkins if below max
      if (currentPumpkinCount < maxPumpkinsOnScreen) {
        const spawnCount = Math.min(batchSize, maxPumpkinsOnScreen - currentPumpkinCount)
        addPumpkinBatch(spawnCount)
      }

      // Spawn bomb occasionally (10% chance) but only if no bomb is currently on screen
      if (currentBombCount === 0 && Math.random() < 0.1) {
        setTimeout(() => addBombNaturally(), Math.random() * 1000) // Random delay 0-1s
      }
    }, spawnInterval)

    return () => clearInterval(interval)
  }, [gameState.pumpkins.length, gameState.bombs.length, gameState.gameStatus])

  if (gameState.gameStatus === 'menu') {
    return <MenuScreen onStartGame={startGame} onBack={onBack} />
  }

  // Show loading screen while assets are being initialized
  if (isLoadingAssets) {
    return <LoadingScreen message="Loading Pumpkin Slicer..." />
  }

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      position: 'relative',
      backgroundColor: '#1a0f0a',
      overflow: 'hidden'
    }}>
      <GameUI gameState={gameState} />

      <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 10 }}>
        <BackButton onClick={onBack} />
      </div>

      <Canvas
        style={{ width: '100%', height: '100%' }}
        orthographic
        camera={{
          position: [0, 0, 10],
          zoom: 50,
          near: 0.1,
          far: 1000
        }}
      >
        <Suspense fallback={null}>
          <GameScene
            gameState={gameState}
            onSlicePumpkin={slicePumpkin}
            onRemovePumpkin={removePumpkin}
            onRemoveBat={removeBat}
            onExplodeBomb={explodeBomb}
            onRemoveBomb={removeBomb}
            onRemoveParticle={removeParticle}
            onRemoveScorePopup={removeScorePopup}
          />
        </Suspense>
      </Canvas>

      {/* Game Over Modal */}
      <GameOverModal
        score={gameState.score}
        highScore={highScore}
        onReplay={resetGame}
        onHome={onBack}
        isVisible={gameState.gameStatus === 'gameover'}
      />
    </div>
  )
}

export default Game4
