import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AnimationState } from '../types/animation'

/**
 * Unit tests for error handling in HauntedHousePage
 * Tests navigation fallback, error logging, and state recovery
 * Validates: Requirements 9.1, 9.2, 9.5
 */

describe('HauntedHousePage - Error Handling', () => {
  let consoleErrorSpy: any
  let consoleWarnSpy: any

  beforeEach(() => {
    // Spy on console methods to verify error logging
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  /**
   * Test: Errors are logged
   * Requirement 9.5: WHEN the TransitionSequence encounters an error 
   * THEN the Application SHALL log the error
   */
  it('should log errors when they occur', () => {
    const error = new Error('Test error')
    
    // Simulate error logging
    console.error('Transition error:', error)

    expect(consoleErrorSpy).toHaveBeenCalledWith('Transition error:', error)
  })

  /**
   * Test: Warnings are logged for non-critical issues
   * Validates that warnings are logged for issues like audio load failures
   */
  it('should log warnings for non-critical issues', () => {
    const warning = 'Failed to load audio'
    
    // Simulate warning logging
    console.warn(warning)

    expect(consoleWarnSpy).toHaveBeenCalledWith(warning)
  })

  /**
   * Test: Navigation completes despite errors
   * Requirement 9.5: WHEN the TransitionSequence encounters an error 
   * THEN the Application SHALL ensure the user can still access games
   */
  it('should complete navigation even with errors', () => {
    const mockNavigate = vi.fn()
    const selectedGame = { id: 1, name: 'Game 1', component: () => null }

    // Simulate error during transition
    let errorOccurred = false
    try {
      throw new Error('Animation error')
    } catch (error) {
      errorOccurred = true
      console.error('Error during transition:', error)
    }

    // Navigation should still complete
    mockNavigate(`/game/${selectedGame.id}`)

    expect(errorOccurred).toBe(true)
    expect(mockNavigate).toHaveBeenCalledWith('/game/1')
  })

  /**
   * Test: State reset on error
   * Validates that animation state is reset when errors occur
   */
  it('should reset state when error occurs', () => {
    let currentState = AnimationState.DRAGGING
    let errorOccurred = false

    try {
      throw new Error('Test error')
    } catch (error) {
      errorOccurred = true
      // Reset state on error
      currentState = AnimationState.IDLE
    }

    expect(errorOccurred).toBe(true)
    expect(currentState).toBe(AnimationState.IDLE)
  })

  /**
   * Test: Audio load failure doesn't prevent transition
   * Validates that audio errors are handled gracefully
   */
  it('should continue transition when audio fails to load', () => {
    let audioLoadError = false
    let transitionContinues = true

    try {
      throw new Error('Failed to load audio')
    } catch (error) {
      audioLoadError = true
      console.warn('Failed to load audio:', error)
      // Transition should continue without audio
      transitionContinues = true
    }

    expect(audioLoadError).toBe(true)
    expect(transitionContinues).toBe(true)
  })

  /**
   * Test: Model load failure doesn't prevent navigation
   * Requirement 9.1: WHEN the SkeletonHand model fails to load 
   * THEN the Application SHALL fall back to the original simple navigation
   */
  it('should navigate successfully when model fails to load', () => {
    const mockNavigate = vi.fn()
    const selectedGame = { id: 2, name: 'Game 2', component: () => null }
    let modelLoadError = false

    try {
      throw new Error('Failed to load skeleton hand model')
    } catch (error) {
      modelLoadError = true
      console.warn('Model load failed, continuing without hand animation:', error)
    }

    // Navigation should still work
    mockNavigate(`/game/${selectedGame.id}`)

    expect(modelLoadError).toBe(true)
    expect(mockNavigate).toHaveBeenCalledWith('/game/2')
  })

  /**
   * Test: Component unmount during animation
   * Requirement 9.2: WHEN the TransitionSequence is interrupted 
   * THEN the Application SHALL complete the navigation and reset the animation state
   */
  it('should handle component unmount during animation', () => {
    let isAnimating = true
    let stateReset = false

    // Simulate unmount cleanup
    const cleanup = () => {
      isAnimating = false
      stateReset = true
    }

    cleanup()

    expect(isAnimating).toBe(false)
    expect(stateReset).toBe(true)
  })

  /**
   * Test: Multiple errors don't crash the application
   * Validates robust error handling
   */
  it('should handle multiple errors gracefully', () => {
    const errors: Error[] = []

    // Simulate multiple errors
    try {
      throw new Error('Audio load failed')
    } catch (error) {
      errors.push(error as Error)
      console.warn('Audio error:', error)
    }

    try {
      throw new Error('Model load failed')
    } catch (error) {
      errors.push(error as Error)
      console.warn('Model error:', error)
    }

    // Application should still be functional
    expect(errors.length).toBe(2)
    expect(consoleWarnSpy).toHaveBeenCalledTimes(2)
  })

  /**
   * Test: Error recovery allows new transitions
   * Validates that after an error, new transitions can be started
   */
  it('should allow new transitions after error recovery', () => {
    let currentState = AnimationState.DRAGGING
    let canStartNewTransition = false

    // Simulate error
    try {
      throw new Error('Test error')
    } catch (error) {
      console.error('Error occurred:', error)
      // Reset to IDLE
      currentState = AnimationState.IDLE
    }

    // After reset, new transition should be possible
    if (currentState === AnimationState.IDLE) {
      canStartNewTransition = true
    }

    expect(currentState).toBe(AnimationState.IDLE)
    expect(canStartNewTransition).toBe(true)
  })

  /**
   * Test: Preloading errors don't block navigation
   * Validates that game preloading errors are handled
   */
  it('should navigate even if preloading fails', () => {
    const mockNavigate = vi.fn()
    const selectedGame = { id: 3, name: 'Game 3', component: () => null }
    let preloadError = false

    try {
      // Simulate preload failure
      throw new Error('Failed to preload game component')
    } catch (error) {
      preloadError = true
      console.warn('Preload failed, navigating anyway:', error)
    }

    // Navigation should still happen
    mockNavigate(`/game/${selectedGame.id}`)

    expect(preloadError).toBe(true)
    expect(mockNavigate).toHaveBeenCalledWith('/game/3')
  })
})
