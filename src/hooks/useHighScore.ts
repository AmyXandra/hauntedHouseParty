import { useState } from 'react'

/**
 * Custom hook for managing high scores with localStorage persistence
 * @param gameId - Unique identifier for the game (e.g., 'tomb-runner', 'pumpkin-slicer')
 * @returns Object with current high score and function to update it
 */
export const useHighScore = (gameId: string) => {
  const storageKey = `haunted-house-${gameId}-highscore`
  
  const [highScore, setHighScore] = useState<number>(() => {
    // Load high score from localStorage on initialization
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? parseInt(saved, 10) : 0
    } catch (error) {
      console.warn(`Failed to load high score for ${gameId}:`, error)
      return 0
    }
  })

  // Update high score if current score is higher
  const updateHighScore = (currentScore: number): boolean => {
    if (currentScore > highScore) {
      const newHighScore = currentScore
      setHighScore(newHighScore)
      
      // Persist to localStorage
      try {
        localStorage.setItem(storageKey, newHighScore.toString())
      } catch (error) {
        console.warn(`Failed to save high score for ${gameId}:`, error)
      }
      
      return true // New high score achieved
    }
    return false // No new high score
  }

  // Reset high score (for testing or user preference)
  const resetHighScore = () => {
    setHighScore(0)
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.warn(`Failed to reset high score for ${gameId}:`, error)
    }
  }

  return {
    highScore,
    updateHighScore,
    resetHighScore
  }
}