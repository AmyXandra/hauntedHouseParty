import BackButton from '../BackButton'

interface MenuScreenProps {
  onStartGame: () => void
  onBack: () => void
}

export default function MenuScreen({ onStartGame, onBack }: MenuScreenProps) {
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
      <h1 style={{ fontSize: '3rem', color: '#ff6600', marginBottom: '1rem' }}>
        Pumpkin Slicer
      </h1>
      <p style={{ color: '#ff9900', marginBottom: '2rem', textAlign: 'center' }}>
        Swipe across pumpkins to slice them and score points!
      </p>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#66ff66' }}>✂️ Draw fast swipes across pumpkins to slice them!</p>
        <p style={{ color: '#ffcc00' }}>🎯 Round 1: 12 pumpkins → Round 4: 35 pumpkins!</p>
        <p style={{ color: '#ff6666' }}>⚠️ Missing pumpkins costs a life!</p>
        <p style={{ color: '#ffcc00' }}>🟡 Golden halo pumpkins slice everything!</p>
        <p style={{ color: '#ffcc00' }}>🦇 Sliced pumpkins release bats</p>
        <p style={{ color: '#ffcc00' }}>💣 Some bats drop bombs - avoid them!</p>
      </div>
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
            cursor: 'pointer'
          }}
        >
          Start Game
        </button>
        <BackButton onClick={onBack} />
      </div>
    </div>
  )
}