import { Game } from '../types'
import Game1 from '../components/games/Game1'
import Game2 from '../components/games/Game2'
import Game3 from '../components/games/Game3'
import Game4 from '../components/games/Game4'
import Game5 from '../components/games/Game5'

/**
 * Registry of available games in the game hub
 * Each game has a unique ID, display name, and component
 */
export const games: Game[] = [
  {
    id: 'game1',
    name: 'Mystery Maze',
    component: Game1,
  },
  {
    id: 'game2',
    name: 'Ghost Hunt',
    component: Game2,
  },
  {
    id: 'game3',
    name: 'Spooky Puzzle',
    component: Game3,
  },
  {
    id: 'game4',
    name: 'Pumpkin Slicer',
    component: Game4,
  },
  {
    id: 'game5',
    name: 'Endless Runner',
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
