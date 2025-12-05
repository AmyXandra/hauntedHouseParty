import { useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { GameProps } from '../../types'
import GameScene, { type GameState } from '../scene/runner/GameScene'
import BackButton from '../ui/BackButton'

// Game constants
const GRAVITY = 0.008
const LEFT_LANE = -2
const MIDDLE_LANE = 0
const RIGHT_LANE = 2



/**
 * Game5: Tomb Runner
 * Navigate through a haunted graveyard, collecting coins while avoiding graves and ghosts
 */
const Game5 = ({ onBack }: GameProps) => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    gameStatus: 'menu',
    currentLane: MIDDLE_LANE,
    isJumping: false,
    coinsCollected: 0
  })

  const bounceValueRef = useRef(0)
  const velocityRef = useRef(0)

  // Debug: Monitor lives changes
  useEffect(() => {
    console.log(`💖 LIVES CHANGED TO: ${gameState.lives}`)
  }, [gameState.lives])

  // Handle keyboard input
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isJumping && e.key !== 'ArrowUp') return

      let newLane = gameState.currentLane
      let shouldJump = false

      if (e.key === 'ArrowLeft') { // Left arrow
        if (gameState.currentLane === MIDDLE_LANE) newLane = LEFT_LANE
        else if (gameState.currentLane === RIGHT_LANE) newLane = MIDDLE_LANE
        shouldJump = true
      } else if (e.key === 'ArrowRight') { // Right arrow
        if (gameState.currentLane === MIDDLE_LANE) newLane = RIGHT_LANE
        else if (gameState.currentLane === LEFT_LANE) newLane = MIDDLE_LANE
        shouldJump = true
      } else if (e.key === 'ArrowUp') { // Up arrow (jump)
        velocityRef.current = 0.1
        shouldJump = true
      }

      if (shouldJump) {
        setGameState(prev => ({
          ...prev,
          currentLane: newLane,
          isJumping: true
        }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState.gameStatus, gameState.currentLane, gameState.isJumping])

  // Physics update
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return

    const interval = setInterval(() => {
      // Apply gravity and bounce
      velocityRef.current -= GRAVITY
      bounceValueRef.current += velocityRef.current

      // Ground collision
      if (bounceValueRef.current <= 0) {
        bounceValueRef.current = 0
        velocityRef.current = Math.random() * 0.04 + 0.005 // Small bounce
        setGameState(prev => ({ ...prev, isJumping: false }))
      }
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [gameState.gameStatus])

  const startGame = () => {
    setGameState({
      score: 0,
      lives: 3,
      gameStatus: 'playing',
      currentLane: MIDDLE_LANE,
      isJumping: false,
      coinsCollected: 0
    })
    bounceValueRef.current = 0
    velocityRef.current = 0
  }

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'menu',
      score: 0,
      lives: 3,
      coinsCollected: 0
    }))
  }

  const collisionCooldownRef = useRef(0)

  const handleCollision = (_id: string, _type: 'grave' | 'ghost') => {
    console.log(`🎯 COLLISION HANDLER CALLED! Type: ${_type}, ID: ${_id}`)
    console.log(`🎯 Current lives BEFORE collision: ${gameState.lives}`)

    // Prevent multiple collisions in quick succession
    const now = Date.now()
    if (now - collisionCooldownRef.current < 500) { // 500ms cooldown
      console.log(`🚫 COLLISION IGNORED (cooldown) - Type: ${_type}, ID: ${_id}`)
      return
    }
    collisionCooldownRef.current = now

    console.log(`🔥 COLLISION ACCEPTED! Type: ${_type}, ID: ${_id}`) // Debug log
    console.log(`🔥 Current game state:`, {
      lives: gameState.lives,
      currentLane: gameState.currentLane,
      isJumping: gameState.isJumping,
      bounceValue: bounceValueRef.current
    })

    setGameState(prev => {
      const newLives = prev.lives - 1
      console.log(`🔥 Lives reduced from ${prev.lives} to ${newLives}`) // Debug log
      console.log(`🔥 Game status will be: ${newLives <= 0 ? 'gameover' : 'playing'}`)
      return {
        ...prev,
        lives: newLives,
        gameStatus: newLives <= 0 ? 'gameover' : prev.gameStatus
      }
    })
  }

  const handleCoinCollect = (_id: string) => {
    console.log('Coin collected! Adding 10 points') // Debug log
    setGameState(prev => ({
      ...prev,
      score: prev.score + 10,
      coinsCollected: prev.coinsCollected + 1
    }))
  }



  // Handle non-playing states with inline UI for now
  if (gameState.gameStatus !== 'playing') {
    if (gameState.gameStatus === 'menu') {
      return (
        <div style={{
          padding: '2rem',
          color: 'white',
          backgroundColor: '#1a0f0a',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{ fontSize: '6rem', color: '#ff6600', marginBottom: '1rem', fontFamily: 'Creepster, cursive' }}>
            Tomb Runner
          </h1>
          <p style={{ color: '#ff9900', marginBottom: '2rem', textAlign: 'center' }}>
            Collect coins and dodge graves and ghosts!
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={startGame}
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#ff6600',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.2rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Start Game
            </button>
            {/* <BackButton onClick={onBack} /> */}
          </div>
        </div>
      )
    }

    if (gameState.gameStatus === 'gameover') {
      return (
        <div style={{
          padding: '2rem',
          color: 'white',
          backgroundColor: '#2d0a0a',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{ fontSize: '3rem', color: '#ff3300', marginBottom: '1rem' }}>
            Game Over!
          </h1>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.5rem', color: '#ff9900', marginBottom: '0.5rem' }}>
              Final Score
            </p>
            <p style={{ fontSize: '3rem', color: '#ff6600', fontWeight: 'bold' }}>
              {gameState.score}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={resetGame}
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#ff6600',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >
              Play Again
            </button>
            <BackButton onClick={onBack} />
          </div>
        </div>
      )
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#000' }}>
      {/* Game UI */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        right: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        {/* Score */}
        <div style={{
          padding: '1rem',
          backgroundColor: 'rgba(0,0,0,0.8)',
          border: '2px solid #ff6600',
          borderRadius: '8px',
          color: '#ff9900'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🪙</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{gameState.score}</span>
          </div>
        </div>

        {/* Coins collected */}
        <div style={{
          padding: '1rem',
          backgroundColor: 'rgba(0,0,0,0.8)',
          border: '2px solid #ffd700',
          borderRadius: '8px',
          color: '#ffd700',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.8rem', margin: 0 }}>Coins</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            {gameState.coinsCollected}
          </p>
        </div>



        {/* Lives */}
        <div style={{
          padding: '1rem',
          backgroundColor: 'rgba(0,0,0,0.8)',
          border: '2px solid #ff3300',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                style={{
                  fontSize: '1.5rem',
                  color: i < gameState.lives ? '#ff3300' : '#666666'
                }}
              >
                {i < gameState.lives ? '❤️' : '✖️'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        pointerEvents: 'none',
        textAlign: 'center',
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: '0.5rem 1rem',
        borderRadius: '8px'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>⬅️ ➡️ Switch Lanes | ⬆️ Jump | 🪙 Coins (+10) | Avoid ⚰️ 👻</p>
      </div>

      {/* Back button - moved to bottom right */}
      <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 10 }}>
        <BackButton onClick={onBack} />
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 4, 15], fov: 60 }}
        shadows
      >
        <GameScene
          gameState={gameState}
          onCollision={handleCollision}
          onCoinCollect={handleCoinCollect}
          bounceValue={bounceValueRef.current}
        />
      </Canvas>
    </div>
  )
}

export default Game5
