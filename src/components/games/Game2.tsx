import { useState } from 'react'
import { GameProps } from '../../types'
import BackButton from '../ui/BackButton'

/**
 * Game2: Ghost Hunt
 * Placeholder game component with ghost catching mechanic
 */
const Game2 = ({ onBack }: GameProps) => {
  const [score, setScore] = useState(0)
  const [ghostPosition, setGhostPosition] = useState({ x: 50, y: 50 })

  const catchGhost = () => {
    setScore((prev) => prev + 1)
    // Move ghost to random position
    setGhostPosition({
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 10,
    })
  }

  return (
    <div
      style={{
        padding: '2rem',
        color: 'white',
        backgroundColor: '#0f3460',
        minHeight: '100vh',
      }}
    >
      <h1>Ghost Hunt</h1>
      <p>Click on the ghost to catch it! How many can you catch?</p>
      <div style={{ marginTop: '2rem' }}>
        <p style={{ fontSize: '1.5rem' }}>Score: {score}</p>
      </div>
      <div
        style={{
          marginTop: '2rem',
          position: 'relative',
          width: '100%',
          maxWidth: '600px',
          height: '400px',
          backgroundColor: '#16213e',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={catchGhost}
          style={{
            position: 'absolute',
            left: `${ghostPosition.x}%`,
            top: `${ghostPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: '3rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          title="Catch the ghost!"
        >
          👻
        </button>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <BackButton onClick={onBack} />
      </div>
    </div>
  )
}

export default Game2
