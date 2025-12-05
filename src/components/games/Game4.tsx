import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { GameProps } from '../../types'
import { GameState, Pumpkin, Bat, Bomb, ScorePopup } from '../../types/pumpkin-slicer'
import BackButton from '../ui/BackButton'
import GameScene from '../scene/pumpkin-slicer/GameScene'
import GameUI from '../ui/pumpkin-slicer/GameUI'
import MenuScreen from '../ui/pumpkin-slicer/MenuScreen'
import GameOverScreen from '../ui/pumpkin-slicer/GameOverScreen'


/**
 * Game4: Pumpkin Slicer
 * 3D pumpkin slicing game inspired by Fruit Ninja
 * Click pumpkins to slice them and score points, avoid bombs
 * Infinite gameplay - game ends when lives reach 0
 */
const Game4 = ({ onBack }: GameProps) => {
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

  // Game actions
  const startGame = () => {
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

    setTimeout(() => addPumpkinBatch(2), 500)
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

  const addBomb = (position: THREE.Vector3) => {
    const id = Math.random().toString(36)
    const bomb: Bomb = {
      id,
      position: position.clone().add(new THREE.Vector3(0, -0.5, 0)),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.15,
        0.05 + Math.random() * 0.05,
        (Math.random() - 0.5) * 0.15
      ),
      lifetime: 0
    }

    setGameState(prev => ({
      ...prev,
      bombs: [...prev.bombs, bomb]
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

      if (Math.random() < 0.3) {
        addBomb(position)
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
      return {
        ...prev,
        lives: newLives,
        gameStatus: newLives <= 0 ? 'gameover' : prev.gameStatus,
        bombs: prev.bombs.filter(b => b.id !== id)
      }
    })
  }

  const removePumpkin = (id: string, missed: boolean = false) => {
    if (missed) {
      setGameState(prev => {
        const newLives = prev.lives - 1
        return {
          ...prev,
          lives: newLives,
          gameStatus: newLives <= 0 ? 'gameover' : prev.gameStatus,
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

  // Infinite spawn system - continuously spawn pumpkins
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return

    const maxOnScreen = 5
    const spawnInterval = 1500
    const batchSize = 2

    const interval = setInterval(() => {
      const currentCount = gameState.pumpkins.filter(p => !p.sliced).length

      if (currentCount < maxOnScreen) {
        const spawnCount = Math.min(batchSize, maxOnScreen - currentCount)
        addPumpkinBatch(spawnCount)
      }
    }, spawnInterval)

    return () => clearInterval(interval)
  }, [gameState.pumpkins.length, gameState.gameStatus])

  if (gameState.gameStatus === 'menu') {
    return <MenuScreen onStartGame={startGame} onBack={onBack} />
  }

  if (gameState.gameStatus === 'gameover') {
    return (
      <GameOverScreen
        gameState={gameState}
        onResetGame={resetGame}
        onBack={onBack}
      />
    )
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
      </Canvas>
    </div>
  )
}

export default Game4
