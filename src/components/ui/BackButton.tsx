import { BackButtonProps } from '../../types'
import './BackButton.css'

/**
 * BackButton component for navigating back to the home page
 * Provides consistent styling across all game pages
 */
const BackButton = ({ onClick }: BackButtonProps) => {
  return (
    <button onClick={onClick} className="back-button">
      Back to Haunted House
    </button>
  )
}

export default BackButton
