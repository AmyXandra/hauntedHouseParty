import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { useGameNavigation } from './useGameNavigation'
import { games } from '../data/games'
import * as fc from 'fast-check'

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('useGameNavigation', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  describe('navigateToRandomGame', () => {
    // Feature: react-game-hub, Property 3: Random game selection
    // Validates: Requirements 2.3
    it('should always select a game ID from the available games registry', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 999 }), (seed) => {
          // Use seed to make Math.random deterministic for this iteration
          const originalRandom = Math.random
          let callCount = 0
          Math.random = () => {
            callCount++
            // Generate a pseudo-random value based on seed
            return ((seed * callCount * 9301 + 49297) % 233280) / 233280
          }

          try {
            const wrapper = ({ children }: { children: React.ReactNode }) => (
              <BrowserRouter>{children}</BrowserRouter>
            )

            const { result } = renderHook(() => useGameNavigation(), { wrapper })

            // Call navigateToRandomGame
            result.current.navigateToRandomGame()

            // Extract the game ID from the navigate call
            expect(mockNavigate).toHaveBeenCalledTimes(1)
            const navigateCall = mockNavigate.mock.calls[0][0] as string
            expect(navigateCall).toMatch(/^\/game\//)

            const gameId = navigateCall.replace('/game/', '')

            // Property: The selected game ID must be one of the available game IDs
            const validGameIds = games.map((g) => g.id)
            const isValidGameId = validGameIds.includes(gameId)

            return isValidGameId
          } finally {
            Math.random = originalRandom
            mockNavigate.mockClear()
          }
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('navigateToHome', () => {
    it('should navigate to the root path', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <BrowserRouter>{children}</BrowserRouter>
      )

      const { result } = renderHook(() => useGameNavigation(), { wrapper })

      result.current.navigateToHome()

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })
})
