import { Game } from '../types'
import Game4 from '../components/games/Game4'
import Game5 from '../components/games/Game5'

/**
 * Registry of available games in the game hub
 * Each game has a unique ID, display name, and component
 */
export const games: Game[] = [
  {
    id: 'game4',
    name: 'Pumpkin Slicer',
    component: Game4,
  },
  {
    id: 'game5',
    name: 'Tomb Runner',
    component: Game5,
  },
]

/**
 * Get a game by its ID
 */
export const getGameById = (id: string): Game | undefined => {
  return games.find((game) => game.id === id)
}

/**
 * Get a random game from the registry
 */
export const getRandomGame = (): Game => {
  const randomIndex = Math.floor(Math.random() * games.length)
  return games[randomIndex]
}
