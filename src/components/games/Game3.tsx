import { useState } from 'react'
import { GameProps } from '../../types'
import BackButton from '../ui/BackButton'

/**
 * Game3: Spooky Puzzle
 * Placeholder game component with memory matching game
 */
const Game3 = ({ onBack }: GameProps) => {
  const emojis = ['🎃', '👻', '🦇', '🕷️', '💀', '🕸️']
  const [revealed, setRevealed] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [attempts, setAttempts] = useState(0)

  const handleCardClick = (index: number) => {
    if (revealed.length >= 2 || revealed.includes(index) || matched.includes(index)) {
      return
    }

    const newRevealed = [...revealed, index]
    setRevealed(newRevealed)

    if (newRevealed.length === 2) {
      setAttempts((prev) => prev + 1)
      const [first, second] = newRevealed
      if (emojis[first % emojis.length] === emojis[second % emojis.length]) {
        setMatched([...matched, first, second])
        setRevealed([])
      } else {
        setTimeout(() => setRevealed([]), 1000)
      }
    }
  }

  const resetGame = () => {
    setRevealed([])
    setMatched([])
    setAttempts(0)
  }

  return (
    <div
      style={{
        padding: '2rem',
        color: 'white',
        backgroundColor: '#2d132c',
        minHeight: '100vh',
      }}
    >
      <h1>Spooky Puzzle</h1>
      <p>Match the spooky symbols! Click two cards to find matching pairs.</p>
      <div style={{ marginTop: '2rem' }}>
        <p>Attempts: {attempts}</p>
        <p>Matched: {matched.length / 2} / {emojis.length}</p>
      </div>
      <div
        style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 80px)',
          gap: '1rem',
          width: 'fit-content',
        }}
      >
        {[...emojis, ...emojis].map((emoji, index) => (
          <button
            key={index}
            onClick={() => handleCardClick(index)}
            style={{
              width: '80px',
              height: '80px',
              fontSize: '2rem',
              backgroundColor: revealed.includes(index) || matched.includes(index) ? '#801336' : '#5c2a9d',
              border: 'none',
              borderRadius: '8px',
              cursor: matched.includes(index) ? 'default' : 'pointer',
              opacity: matched.includes(index) ? 0.5 : 1,
            }}
          >
            {revealed.includes(index) || matched.includes(index) ? emoji : '?'}
          </button>
        ))}
      </div>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={resetGame}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#5c2a9d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Reset Game
        </button>
        <BackButton onClick={onBack} />
      </div>
    </div>
  )
}

export default Game3
