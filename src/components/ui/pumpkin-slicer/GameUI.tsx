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

interface GameUIProps {
  gameState: GameState
}

export default function GameUI({ gameState }: GameUIProps) {
  return (
    <div style={{
      position: 'absolute',
      top: '1rem',
      left: '1rem',
      right: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      backgroundColor: '#1a0f0a',
      zIndex: 10,
      pointerEvents: 'none'
    }}>
      <div style={{
        padding: '1rem',
        backgroundColor: 'rgba(0,0,0,0.8)',
        border: '2px solid #ff6600',
        borderRadius: '8px',
        color: '#ff9900'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🏆</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{gameState.score}</span>
        </div>
      </div>

      <div style={{
        padding: '1rem',
        backgroundColor: 'rgba(0,0,0,0.8)',
        border: '2px solid #ff6600',
        borderRadius: '8px',
        color: '#ff9900',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '0.8rem', margin: 0 }}>Round {gameState.round}/4</p>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>
          {gameState.pumpkinsSlicedThisRound}/{gameState.totalPumpkinsThisRound}
        </p>
        <p style={{ fontSize: '0.7rem', margin: 0, color: '#ffcc00' }}>Sliced</p>
        <p style={{ fontSize: '0.6rem', margin: 0, color: '#fff' }}>
          On Screen: {gameState.pumpkins.filter(p => !p.sliced).length}
        </p>
      </div>

      <div style={{
        padding: '1rem',
        backgroundColor: 'rgba(0,0,0,0.8)',
        border: '2px solid #ff6600',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontSize: '2rem',
                color: i < gameState.lives ? '#ff3300' : '#666'
              }}
            >
              ❤️
            </span>
          ))}
          {/* Debug: Show actual lives value */}
          <span style={{ fontSize: '1rem', color: '#fff', marginLeft: '0.5rem' }}>
            ({gameState.lives})
          </span>
        </div>
      </div>
    </div>
  )
}