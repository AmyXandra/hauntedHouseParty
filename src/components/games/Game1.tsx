import { useState } from 'react'
import { GameProps } from '../../types'
import BackButton from '../ui/BackButton'

/**
 * Game1: Mystery Maze
 * Placeholder game component with interactive maze navigation
 */
const Game1 = ({ onBack }: GameProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [moves, setMoves] = useState(0)

  const move = (dx: number, dy: number) => {
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
    setMoves((prev) => prev + 1)
  }

  return (
    <div
      style={{
        padding: '2rem',
        color: 'white',
        backgroundColor: '#1a1a2e',
        minHeight: '100vh',
      }}
    >
      <h1>Mystery Maze</h1>
      <p>Navigate through the mysterious maze using the arrow buttons!</p>
      <div style={{ marginTop: '2rem' }}>
        <p>
          Position: ({position.x}, {position.y})
        </p>
        <p>Moves: {moves}</p>
      </div>
      <div
        style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 60px)',
          gap: '0.5rem',
          width: 'fit-content',
        }}
      >
        <div />
        <button onClick={() => move(0, 1)} style={{ padding: '1rem' }}>
          ↑
        </button>
        <div />
        <button onClick={() => move(-1, 0)} style={{ padding: '1rem' }}>
          ←
        </button>
        <button onClick={() => setPosition({ x: 0, y: 0 })} style={{ padding: '1rem' }}>
          ⌂
        </button>
        <button onClick={() => move(1, 0)} style={{ padding: '1rem' }}>
          →
        </button>
        <div />
        <button onClick={() => move(0, -1)} style={{ padding: '1rem' }}>
          ↓
        </button>
        <div />
      </div>
      <div style={{ marginTop: '2rem' }}>
        <BackButton onClick={onBack} />
      </div>
    </div>
  )
}

export default Game1
