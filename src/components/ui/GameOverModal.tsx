import './GameOverModal.css'

interface GameOverModalProps {
  score: number
  highScore?: number
  onReplay: () => void
  onHome: () => void
  isVisible: boolean
}

export default function GameOverModal({
  score,
  highScore,
  onReplay,
  onHome,
  isVisible
}: GameOverModalProps) {
  if (!isVisible) return null

  return (
    <div className="go-overlay">
      <div className="tombstone">
        <div className="tombstone-top">
          <h1>Game Over</h1>
        </div>
        <div className="tombstone-body">
          <div style={{ marginBottom: '45px' }}>
            <p style={{ fontFamily: 'Creepster, cursive', fontSize: '26px' }}>Score:</p>
            <div style={{
              background: '#383753',
              padding: '4px',
              minWidth: '120px',
              width: 'fit-content',
              textAlign: 'center',
              borderRadius: '6px',
              display: 'flex',
              margin: '4px auto',
              color: 'white',
            }}>
              <p><span>{score}</span></p>
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontFamily: 'Creepster, cursive', fontSize: '26px' }}>High Score: </p>
            <div style={{
              background: '#383753',
              padding: '4px',
              minWidth: '120px',
              width: 'fit-content',
              textAlign: 'center',
              borderRadius: '6px',
              display: 'flex',
              margin: '4px auto',
              color: 'white',
            }}>
              {highScore !== undefined && (
                <p><span>{highScore}</span></p>
              )}
            </div>
          </div>
        </div>
        <div className="tombstone-base">
          <button onClick={onReplay}>Replay</button>
          <button onClick={onHome}>Home</button>
        </div>
      </div>
    </div>
  )
}