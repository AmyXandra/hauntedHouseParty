import { useParams } from 'react-router-dom'
import { getGameById } from '../data/games'
import { useGameNavigation } from '../hooks/useGameNavigation'
import BackButton from '../components/ui/BackButton'

/**
 * Game page component that displays the selected game
 * Reads gameId from route params and renders the corresponding game component
 */
export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { navigateToHome } = useGameNavigation()

  // Find the game by ID
  const game = gameId ? getGameById(gameId) : undefined


  // If game not found, show error message
  if (!game) {
    return (
      <div style={{ padding: '2rem', color: 'white', backgroundColor: '#1a1a2e', minHeight: '100vh' }}>
        <h1>Game Not Found</h1>
        <p>The requested game could not be found.</p>
        <div style={{ marginTop: '1rem' }}>
          <BackButton onClick={navigateToHome} />
        </div>
      </div>
    )
  }

  // Render the game component
  const GameComponent = game.component

  return <GameComponent onBack={navigateToHome} />
}
