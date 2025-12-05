import { useNavigate } from 'react-router-dom'
import { getRandomGame } from '../data/games'

/**
 * Custom hook for game navigation logic
 * Provides functions to navigate to a random game or return home
 */
export const useGameNavigation = () => {
  const navigate = useNavigate()

  /**
   * Navigate to a randomly selected game from the registry
   */
  const navigateToRandomGame = () => {
    const game = getRandomGame()
    navigate(`/game/${game.id}`)
  }

  /**
   * Navigate back to the home page (haunted house scene)
   * Passes state to indicate returning from a game for zoom-out effect
   */
  const navigateToHome = () => {
    navigate('/', { state: { fromGame: true } })
  }

  return {
    navigateToRandomGame,
    navigateToHome,
  }
}
