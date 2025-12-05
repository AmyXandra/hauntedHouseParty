import BackButton from '../BackButton'

interface GameState {
  score: number
  lives: number
  gameStatus: 'menu' | 'playing' | 'gameover'
  currentLane: number
  isJumping: boolean
  coinsCollected: number
}

interface GameUIProps {
  gameState: GameState
  onBack: () => void
  onStartGame: () => void
  onResetGame: () => void
}

/**
 * Game UI component for the endless runner
 * Handles menu, game over, and in-game UI states
 */
export default function GameUI({ 
  gameState, 
  onBack, 
  onStartGame, 
  onResetGame 
}: GameUIProps) {
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
        <h1 style={{ fontSize: '3rem', color: '#ff6600', marginBottom: '1rem', fontFamily: 'Creepster, cursive'}}>
          Tomb Runner
        </h1>
        <p style={{ color: '#ff9900', marginBottom: '2rem', textAlign: 'center' }}>
          Collect coins and dodge graves and ghosts!
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={onStartGame}
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
          <BackButton onClick={onBack} />
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
            onClick={onResetGame}
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
  
  // In-game UI overlay
  return (
    <>
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
                  color: i < gameState.lives ? '#ff3300' : '#666'
                }}
              >
                ❤️
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
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          ⬅️ ➡️ Switch Lanes | ⬆️ Jump | 🪙 Collect Coins | Avoid ⚰️ 👻
        </p>
      </div>

      {/* Back button - moved to avoid overlap */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
        <BackButton onClick={onBack} />
      </div>
    </>
  )
}

export type { GameState }