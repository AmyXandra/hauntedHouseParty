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
      <h1 style={{
        fontSize: '6rem',
        color: '#ff6600',
        marginBottom: '1rem',
        fontFamily: 'Creepster, cursive'
      }}>
        Pumpkin Slicer
      </h1>
      <p style={{
        color: '#ff9900',
        marginBottom: '2rem',
        textAlign: 'center',
      }}>
        Swipe across pumpkins to slice them and score points! Avoid the bombs!
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
          }}
        >
          Start Game
        </button>
        <BackButton onClick={onBack} />
      </div>
    </div>
  )
}