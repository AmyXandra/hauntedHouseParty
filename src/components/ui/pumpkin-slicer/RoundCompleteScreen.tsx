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

interface RoundCompleteScreenProps {
  gameState: GameState
  getPumpkinsForRound: (round: number) => number
  onStartNextRound: () => void
  onBack: () => void
}

export default function RoundCompleteScreen({ 
  gameState, 
  getPumpkinsForRound, 
  onStartNextRound, 
  onBack 
}: RoundCompleteScreenProps) {
  return (
    <div style={{
      padding: '2rem',
      color: 'white',
      backgroundColor: '#0a1a0f',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', color: '#00ff66', marginBottom: '1rem' }}>
        Round {gameState.round} Complete!
      </h1>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p style={{ fontSize: '1.5rem', color: '#66ff99', marginBottom: '0.5rem' }}>
          Pumpkins Sliced: {gameState.pumpkinsSlicedThisRound}/{gameState.totalPumpkinsThisRound}
        </p>
        <p style={{ fontSize: '2rem', color: '#ff9900', fontWeight: 'bold' }}>
          Score: {gameState.score}
        </p>
        <p style={{ color: '#66ff99', marginTop: '1rem' }}>
          Lives Remaining: {gameState.lives}
        </p>
        <p style={{ color: '#ffcc00', marginTop: '1rem' }}>
          Next Round: {getPumpkinsForRound(gameState.round + 1)} pumpkins to slice!
        </p>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={onStartNextRound}
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#00ff66',
            color: 'black',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Start Round {gameState.round + 1}
        </button>
        <BackButton onClick={onBack} />
      </div>
    </div>
  )
}