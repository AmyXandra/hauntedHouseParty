import { describe, it, expect, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import GamePage from './GamePage'
import { games } from '../data/games'
import * as fc from 'fast-check'

// Mock the game navigation hook
vi.mock('../hooks/useGameNavigation', () => ({
  useGameNavigation: () => ({
    navigateToHome: vi.fn(),
    navigateToRandomGame: vi.fn(),
  }),
}))

describe('GamePage', () => {
  // Feature: react-game-hub, Property 5: Game component rendering
  // Validates: Requirements 4.2, 6.4
  it('should render the corresponding game component for any valid game ID', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...games.map((g) => g.id)),
        (gameId) => {
          // Find the expected game
          const expectedGame = games.find((g) => g.id === gameId)
          expect(expectedGame).toBeDefined()

          // Render GamePage with the game ID in the route
          render(
            <MemoryRouter initialEntries={[`/game/${gameId}`]}>
              <Routes>
                <Route path="/game/:gameId" element={<GamePage />} />
              </Routes>
            </MemoryRouter>
          )

          // Property: The game's name should be displayed in the rendered component
          // This verifies that the correct game component was rendered
          const gameNameElement = screen.getByText(expectedGame!.name)
          expect(gameNameElement).toBeInTheDocument()

          // Property: A back button should be present
          const backButtons = screen.getAllByText(/back to haunted house/i)
          expect(backButtons.length).toBeGreaterThan(0)

          // Clean up after each iteration
          cleanup()

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should display error message for invalid game ID', () => {
    const invalidGameId = 'nonexistent-game'

    render(
      <MemoryRouter initialEntries={[`/game/${invalidGameId}`]}>
        <Routes>
          <Route path="/game/:gameId" element={<GamePage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Game Not Found')).toBeInTheDocument()
    expect(screen.getByText(/could not be found/i)).toBeInTheDocument()
  })

  it('should provide a way to return to home page', () => {
    const validGameId = games[0].id

    render(
      <MemoryRouter initialEntries={[`/game/${validGameId}`]}>
        <Routes>
          <Route path="/game/:gameId" element={<GamePage />} />
        </Routes>
      </MemoryRouter>
    )

    // Verify back button exists
    const backButton = screen.getByText(/back to haunted house/i)
    expect(backButton).toBeInTheDocument()
    expect(backButton.tagName).toBe('BUTTON')
  })
})
