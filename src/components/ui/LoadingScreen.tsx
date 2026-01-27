import { CSSProperties } from 'react'

interface LoadingScreenProps {
  message?: string
  progress?: number
}

/**
 * Loading screen component shown while game assets are loading
 */
export default function LoadingScreen({ 
  message = 'Loading...', 
  progress 
}: LoadingScreenProps) {
  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    backgroundColor: '#1a0f0a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    color: '#ff9900'
  }

  const spinnerStyle: CSSProperties = {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(255, 102, 0, 0.2)',
    borderTop: '4px solid #ff6600',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1.5rem'
  }

  const textStyle: CSSProperties = {
    fontSize: '1.5rem',
    fontFamily: 'Creepster, cursive',
    color: '#ff6600',
    marginBottom: '1rem'
  }

  const progressBarContainerStyle: CSSProperties = {
    width: '300px',
    height: '8px',
    backgroundColor: 'rgba(255, 102, 0, 0.2)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '1rem'
  }

  const progressBarFillStyle: CSSProperties = {
    height: '100%',
    backgroundColor: '#ff6600',
    transition: 'width 0.3s ease',
    width: progress !== undefined ? `${progress}%` : '0%'
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={containerStyle}>
        <div style={spinnerStyle} />
        <div style={textStyle}>{message}</div>
        
        {progress !== undefined && (
          <div style={progressBarContainerStyle}>
            <div style={progressBarFillStyle} />
          </div>
        )}
      </div>
    </>
  )
}
