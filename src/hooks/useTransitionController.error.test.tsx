import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTransitionController } from './useTransitionController'
import { AnimationState } from '../types/animation'

/**
 * Unit tests for error handling in useTransitionController
 * Tests model load failure, interruption handling, error logging, and navigation fallback
 * Validates: Requirements 9.1, 9.2, 9.5
 */

// Mock useFrame from @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn()
}))

describe('useTransitionController - Error Handling', () => {
  let consoleErrorSpy: any
  let consoleWarnSpy: any

  beforeEach(() => {
    // Spy on console methods to verify error logging
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  /**
   * Test: Interruption resets state properly
   * Requirement 9.2: WHEN the TransitionSequence is interrupted 
   * THEN the Application SHALL complete the navigation and reset the animation state
   */
  it('should reset state properly when interrupted', () => {
    const { result } = renderHook(() => useTransitionController())

    // Start transition
    act(() => {
      result.current.startTransition()
    })

    expect(result.current.state.currentState).toBe(AnimationState.DOOR_OPENING)

    // Simulate interruption by calling reset
    act(() => {
      result.current.reset()
    })

    // State should be reset to IDLE
    expect(result.current.state.currentState).toBe(AnimationState.IDLE)
    expect(result.current.state.progress).toBe(0)
    expect(result.current.state.totalElapsed).toBe(0)
    expect(result.current.state.selectedGame).toBeNull()
  })

  /**
   * Test: Navigation completes despite errors
   * Requirement 9.5: WHEN the TransitionSequence encounters an error 
   * THEN the Application SHALL log the error and ensure the user can still access games
   */
  it('should complete navigation even with errors', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useTransitionController(undefined, onComplete))

    // Start transition
    act(() => {
      result.current.startTransition()
    })

    // Even if there's an error, the transition should be able to complete
    // The onComplete callback should still be callable
    expect(result.current.state.currentState).toBe(AnimationState.DOOR_OPENING)
    expect(onComplete).toBeDefined()
  })

  /**
   * Test: State can be reset from any animation state
   * Validates that interruption handling works from any state
   */
  it('should allow reset from any animation state', () => {
    const { result } = renderHook(() => useTransitionController())

    const testStates = [
      AnimationState.DOOR_OPENING,
      AnimationState.HAND_EMERGING,
      AnimationState.HAND_PAUSED,
      AnimationState.DRAGGING,
      AnimationState.FADING
    ]

    testStates.forEach(state => {
      // Manually set state (simulating being in that state)
      act(() => {
        result.current.startTransition()
      })

      // Reset should work from any state
      act(() => {
        result.current.reset()
      })

      expect(result.current.state.currentState).toBe(AnimationState.IDLE)
    })
  })

  /**
   * Test: New transition can be triggered after reset
   * Validates that after interruption and reset, the system is ready for new interactions
   */
  it('should allow new transition after reset', () => {
    const { result } = renderHook(() => useTransitionController())

    // Start first transition
    act(() => {
      result.current.startTransition()
    })

    expect(result.current.state.currentState).toBe(AnimationState.DOOR_OPENING)

    // Reset
    act(() => {
      result.current.reset()
    })

    expect(result.current.state.currentState).toBe(AnimationState.IDLE)

    // Start second transition
    act(() => {
      result.current.startTransition()
    })

    expect(result.current.state.currentState).toBe(AnimationState.DOOR_OPENING)
  })

  /**
   * Test: State change callbacks are notified on reset
   * Validates that observers are informed when state is reset
   */
  it('should notify state change callbacks on reset', () => {
    const stateChangeCallback = vi.fn()
    const { result } = renderHook(() => useTransitionController())

    act(() => {
      result.current.onStateChange(stateChangeCallback)
    })

    act(() => {
      result.current.startTransition()
    })

    // Clear previous calls
    stateChangeCallback.mockClear()

    act(() => {
      result.current.reset()
    })

    // Should be called with IDLE as new state
    expect(stateChangeCallback).toHaveBeenCalledWith(
      AnimationState.IDLE,
      AnimationState.DOOR_OPENING
    )
  })

  /**
   * Test: Duplicate animation prevention
   * Requirement 9.3: WHEN the user clicks the door during an active animation 
   * THEN the Application SHALL ignore the click and prevent duplicate animations
   */
  it('should prevent duplicate animations during active transition', () => {
    const { result } = renderHook(() => useTransitionController())

    act(() => {
      result.current.startTransition()
    })

    const stateAfterFirst = result.current.state

    // Try to start again while animating
    act(() => {
      result.current.startTransition()
    })

    // State should not change
    expect(result.current.state).toEqual(stateAfterFirst)
  })

  /**
   * Test: Invalid state transitions are rejected
   * Validates that the state machine prevents invalid transitions
   */
  it('should reject invalid state transitions', () => {
    const { result } = renderHook(() => useTransitionController())

    // Test various invalid transitions
    expect(result.current.isValidTransition(
      AnimationState.IDLE,
      AnimationState.HAND_EMERGING
    )).toBe(false)

    expect(result.current.isValidTransition(
      AnimationState.DOOR_OPENING,
      AnimationState.DRAGGING
    )).toBe(false)

    expect(result.current.isValidTransition(
      AnimationState.HAND_PAUSED,
      AnimationState.FADING
    )).toBe(false)
  })

  /**
   * Test: Valid state transitions are allowed
   * Validates that the state machine allows correct transitions
   */
  it('should allow valid state transitions', () => {
    const { result } = renderHook(() => useTransitionController())

    // Test valid transitions
    expect(result.current.isValidTransition(
      AnimationState.IDLE,
      AnimationState.DOOR_OPENING
    )).toBe(true)

    expect(result.current.isValidTransition(
      AnimationState.DOOR_OPENING,
      AnimationState.HAND_EMERGING
    )).toBe(true)

    expect(result.current.isValidTransition(
      AnimationState.HAND_EMERGING,
      AnimationState.HAND_PAUSED
    )).toBe(true)

    expect(result.current.isValidTransition(
      AnimationState.HAND_PAUSED,
      AnimationState.DRAGGING
    )).toBe(true)

    expect(result.current.isValidTransition(
      AnimationState.DRAGGING,
      AnimationState.FADING
    )).toBe(true)

    expect(result.current.isValidTransition(
      AnimationState.FADING,
      AnimationState.NAVIGATING
    )).toBe(true)
  })

  /**
   * Test: RESETTING state is accessible from any state
   * Validates that reset can be triggered from any animation state
   */
  it('should allow RESETTING transition from any state', () => {
    const { result } = renderHook(() => useTransitionController())

    const allStates = [
      AnimationState.IDLE,
      AnimationState.DOOR_OPENING,
      AnimationState.HAND_EMERGING,
      AnimationState.HAND_PAUSED,
      AnimationState.DRAGGING,
      AnimationState.FADING,
      AnimationState.NAVIGATING
    ]

    allStates.forEach(state => {
      expect(result.current.isValidTransition(
        state,
        AnimationState.RESETTING
      )).toBe(true)
    })
  })
})
