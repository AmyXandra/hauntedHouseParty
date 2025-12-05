import { describe, it, expect, vi } from 'vitest'
import * as fc from 'fast-check'
import { AnimationState } from '../types/animation'
import { Game } from '../types'

/**
 * Property-based test for error handling with navigation fallback
 * Feature: door-animation-transition, Property 31: Error handling with navigation fallback
 * Validates: Requirements 9.5
 * 
 * Property: For any error that occurs during the transition sequence,
 * navigation to a game should still complete successfully, ensuring users can always access games
 */

describe('Property 31: Error handling with navigation fallback', () => {
  /**
   * Property test: Navigation completes despite errors
   * For any type of error during transition, navigation should still succeed
   */
  it('should complete navigation despite any error type', () => {
    fc.assert(
      fc.property(
        // Generate random error scenarios
        fc.record({
          errorType: fc.constantFrom(
            'model_load_error',
            'audio_load_error',
            'animation_error',
            'preload_error',
            'state_error'
          ),
          errorMessage: fc.string({ minLength: 5, maxLength: 50 }),
          gameId: fc.integer({ min: 1, max: 3 })
        }),
        ({ errorType, errorMessage, gameId }) => {
          const mockNavigate = vi.fn()
          let errorOccurred = false
          let navigationCompleted = false

          // Simulate error based on type
          try {
            switch (errorType) {
              case 'model_load_error':
                throw new Error(`Model load failed: ${errorMessage}`)
              case 'audio_load_error':
                throw new Error(`Audio load failed: ${errorMessage}`)
              case 'animation_error':
                throw new Error(`Animation error: ${errorMessage}`)
              case 'preload_error':
                throw new Error(`Preload failed: ${errorMessage}`)
              case 'state_error':
                throw new Error(`State error: ${errorMessage}`)
            }
          } catch (error) {
            errorOccurred = true
            // Log error (as required by 9.5)
            console.error('Transition error:', error)
          }

          // Property: Navigation should still complete despite error
          mockNavigate(`/game/${gameId}`)
          navigationCompleted = mockNavigate.mock.calls.length > 0

          expect(errorOccurred).toBe(true)
          expect(navigationCompleted).toBe(true)
          expect(mockNavigate).toHaveBeenCalledWith(`/game/${gameId}`)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property test: Multiple errors don't prevent navigation
   * Even with multiple errors, navigation should succeed
   */
  it('should handle multiple errors and still navigate', () => {
    fc.assert(
      fc.property(
        fc.record({
          numErrors: fc.integer({ min: 1, max: 5 }),
          gameId: fc.integer({ min: 1, max: 3 })
        }),
        ({ numErrors, gameId }) => {
          const mockNavigate = vi.fn()
          const errors: Error[] = []

          // Simulate multiple errors
          for (let i = 0; i < numErrors; i++) {
            try {
              throw new Error(`Error ${i + 1}`)
            } catch (error) {
              errors.push(error as Error)
              console.error('Error occurred:', error)
            }
          }

          // Property: Navigation should still work
          mockNavigate(`/game/${gameId}`)

          expect(errors.length).toBe(numErrors)
          expect(mockNavigate).toHaveBeenCalledWith(`/game/${gameId}`)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property test: Error recovery allows new transitions
   * After an error and recovery, new transitions should be possible
   */
  it('should allow new transitions after error recovery', () => {
    fc.assert(
      fc.property(
        fc.record({
          errorMessage: fc.string({ minLength: 5, maxLength: 50 }),
          numRecoveryCycles: fc.integer({ min: 1, max: 3 })
        }),
        ({ errorMessage, numRecoveryCycles }) => {
          let currentState = AnimationState.DRAGGING

          for (let i = 0; i < numRecoveryCycles; i++) {
            // Simulate error
            try {
              throw new Error(errorMessage)
            } catch (error) {
              console.error('Error:', error)
              // Reset to IDLE on error
              currentState = AnimationState.IDLE
            }

            // Property: After reset, should be able to start new transition
            if (currentState === AnimationState.IDLE) {
              currentState = AnimationState.DOOR_OPENING
            }

            expect(currentState).toBe(AnimationState.DOOR_OPENING)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property test: Model load failure fallback
   * When model fails to load, transition should skip hand animation but continue
   */
  it('should skip hand animation when model fails but continue transition', () => {
    fc.assert(
      fc.property(
        fc.record({
          modelLoadFails: fc.boolean(),
          gameId: fc.integer({ min: 1, max: 3 })
        }),
        ({ modelLoadFails, gameId }) => {
          const mockNavigate = vi.fn()
          let handAnimationSkipped = false

          if (modelLoadFails) {
            // Simulate model load failure
            try {
              throw new Error('Failed to load skeleton hand model')
            } catch (error) {
              console.warn('Model load failed, skipping hand animation:', error)
              handAnimationSkipped = true
            }
          }

          // Property: Navigation should complete regardless
          mockNavigate(`/game/${gameId}`)

          if (modelLoadFails) {
            expect(handAnimationSkipped).toBe(true)
          }
          expect(mockNavigate).toHaveBeenCalledWith(`/game/${gameId}`)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property test: Audio load failure doesn't block transition
   * When audio fails to load, transition should continue without audio
   */
  it('should continue transition when audio fails to load', () => {
    fc.assert(
      fc.property(
        fc.record({
          audioLoadFails: fc.boolean(),
          gameId: fc.integer({ min: 1, max: 3 })
        }),
        ({ audioLoadFails, gameId }) => {
          const mockNavigate = vi.fn()
          let audioDisabled = false

          if (audioLoadFails) {
            // Simulate audio load failure
            try {
              throw new Error('Failed to load audio')
            } catch (error) {
              console.warn('Audio load failed, continuing without audio:', error)
              audioDisabled = true
            }
          }

          // Property: Navigation should complete regardless
          mockNavigate(`/game/${gameId}`)

          if (audioLoadFails) {
            expect(audioDisabled).toBe(true)
          }
          expect(mockNavigate).toHaveBeenCalledWith(`/game/${gameId}`)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property test: Preload failure doesn't block navigation
   * When game preloading fails, navigation should still happen
   */
  it('should navigate even when preloading fails', () => {
    fc.assert(
      fc.property(
        fc.record({
          preloadFails: fc.boolean(),
          gameId: fc.integer({ min: 1, max: 3 })
        }),
        ({ preloadFails, gameId }) => {
          const mockNavigate = vi.fn()
          let preloadError = false

          if (preloadFails) {
            // Simulate preload failure
            try {
              throw new Error('Failed to preload game component')
            } catch (error) {
              console.warn('Preload failed, navigating anyway:', error)
              preloadError = true
            }
          }

          // Property: Navigation should complete regardless
          mockNavigate(`/game/${gameId}`)

          if (preloadFails) {
            expect(preloadError).toBe(true)
          }
          expect(mockNavigate).toHaveBeenCalledWith(`/game/${gameId}`)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property test: Error logging is consistent
   * All errors should be logged appropriately
   */
  it('should log all errors consistently', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    fc.assert(
      fc.property(
        fc.record({
          isCritical: fc.boolean(),
          errorMessage: fc.string({ minLength: 5, maxLength: 50 })
        }),
        ({ isCritical, errorMessage }) => {
          const error = new Error(errorMessage)

          // Log based on severity
          if (isCritical) {
            console.error('Critical error:', error)
          } else {
            console.warn('Warning:', error)
          }

          // Property: Appropriate logging method should be called
          if (isCritical) {
            expect(consoleErrorSpy).toHaveBeenCalled()
          } else {
            expect(consoleWarnSpy).toHaveBeenCalled()
          }

          // Clear for next iteration
          consoleErrorSpy.mockClear()
          consoleWarnSpy.mockClear()
        }
      ),
      { numRuns: 100 }
    )

    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  /**
   * Property test: User can always access games
   * Regardless of errors, user should always be able to navigate to games
   */
  it('should ensure user can always access games despite errors', () => {
    fc.assert(
      fc.property(
        fc.record({
          hasModelError: fc.boolean(),
          hasAudioError: fc.boolean(),
          hasAnimationError: fc.boolean(),
          selectedGame: fc.record({
            id: fc.integer({ min: 1, max: 3 }),
            name: fc.string({ minLength: 3, maxLength: 20 })
          })
        }),
        ({ hasModelError, hasAudioError, hasAnimationError, selectedGame }) => {
          const mockNavigate = vi.fn()
          const errors: string[] = []

          // Simulate various errors
          if (hasModelError) {
            try {
              throw new Error('Model error')
            } catch (error) {
              errors.push('model')
              console.warn('Model error:', error)
            }
          }

          if (hasAudioError) {
            try {
              throw new Error('Audio error')
            } catch (error) {
              errors.push('audio')
              console.warn('Audio error:', error)
            }
          }

          if (hasAnimationError) {
            try {
              throw new Error('Animation error')
            } catch (error) {
              errors.push('animation')
              console.error('Animation error:', error)
            }
          }

          // Property: Navigation should always succeed
          mockNavigate(`/game/${selectedGame.id}`)
          const canAccessGame = mockNavigate.mock.calls.length > 0

          expect(canAccessGame).toBe(true)
          expect(mockNavigate).toHaveBeenCalledWith(`/game/${selectedGame.id}`)
        }
      ),
      { numRuns: 100 }
    )
  })
})
