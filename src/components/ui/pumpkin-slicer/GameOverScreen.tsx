import BackButton from '../BackButton'

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

interface GameOverScreenProps {
  gameState: GameState
  onResetGame: () => void
  onBack: () => void
}

export default function GameOverScreen({ gameState, onResetGame, onBack }: GameOverScreenProps) {
  const isVictory = gameState.round === 4 && gameState.pumpkinsSlicedThisRound >= gameState.totalPumpkinsThisRound
  
  return (
    <div style={{
      padding: '2rem',
      color: 'white',
      backgroundColor: isVictory ? '#0a1a0f' : '#2d0a0a',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        color: isVictory ? '#00ff66' : '#ff3300', 
        marginBottom: '1rem',
        fontFamily: 'Creepster, cursive'
      }}>
        {isVictory ? 'Victory!' : 'Game Over!'}
      </h1>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p style={{ 
          fontSize: '1.5rem', 
          color: '#ff9900', 
          marginBottom: '0.5rem',
          fontFamily: 'IM_Fell_English, serif'
        }}>
          Final Score
        </p>
        <p style={{ 
          fontSize: '3rem', 
          color: '#ff6600', 
          fontWeight: 'bold',
          fontFamily: 'IM_Fell_English, serif'
        }}>
          {gameState.score}
        </p>
        <p style={{ 
          color: '#ff9900', 
          marginTop: '1rem',
          fontFamily: 'IM_Fell_English, serif'
        }}>
          {isVictory ? 'Completed all 4 rounds!' : `Reached Round ${gameState.round}`}
        </p>
        {isVictory && (
          <p style={{ 
            color: '#00ff66', 
            marginTop: '1rem', 
            fontSize: '1.2rem',
            fontFamily: 'IM_Fell_English, serif'
          }}>
            🎉 Pumpkin Slicing Master! 🎉
          </p>
        )}
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
            cursor: 'pointer',
            fontFamily: 'IM_Fell_English, serif'
          }}
        >
          Play Again
        </button>
        <BackButton onClick={onBack} />
      </div>
    </div>
  )
}