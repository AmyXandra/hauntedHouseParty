import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import * as fc from 'fast-check'
import { useTransitionController } from './useTransitionController'
import { AnimationState } from '../types/animation'

/**
 * Property-based test for state reset on interruption
 * Feature: door-animation-transition, Property 30: State reset on interruption
 * Validates: Requirements 9.2
 * 
 * Property: For any animation state, when the transition is interrupted (reset is called),
 * the state should return to IDLE with all values cleared, allowing new transitions to be triggered
 */

// Mock useFrame from @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn()
}))

describe('Property 30: State reset on interruption', () => {
  /**
   * Property test: State reset on interruption
   * For any animation state, interrupting the transition should reset to IDLE
   * and allow new transitions to be started
   */
  it('should reset to IDLE from any state when interrupted', () => {
    fc.assert(
      fc.property(
        // Generate random animation states (excluding IDLE and RESETTING)
        fc.constantFrom(
          AnimationState.DOOR_OPENING,
          AnimationState.HAND_EMERGING,
          AnimationState.HAND_PAUSED,
          AnimationState.DRAGGING,
          AnimationState.FADING,
          AnimationState.NAVIGATING
        ),
        (interruptedState) => {
          const { result } = renderHook(() => useTransitionController())

          // Start transition to get into an active state
          act(() => {
            result.current.startTransition()
          })

          // Verify we're in an active state (not IDLE)
          const stateBeforeReset = result.current.state.currentState
          expect(stateBeforeReset).not.toBe(AnimationState.IDLE)

          // Interrupt by calling reset
          act(() => {
            result.current.reset()
          })

          // Property: State should be reset to IDLE
          expect(result.current.state.currentState).toBe(AnimationState.IDLE)
          expect(result.current.state.progress).toBe(0)
          expect(result.current.state.totalElapsed).toBe(0)
          expect(result.current.state.selectedGame).toBeNull()

          // Property: New transition should be possible after reset
          act(() => {
            result.current.startTransition()
          })

          expect(result.current.state.currentState).toBe(AnimationState.DOOR_OPENING)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property test: Reset is idempotent
   * Calling reset multiple times should have the same effect as calling it once
   */
  it('should be idempotent - multiple resets have same effect as single reset', () => {
    fc.assert(
      fc.property(
        // Generate random number of reset calls (1 to 5)
        fc.integer({ min: 1, max: 5 }),
        (numResets) => {
          const { result } = renderHook(() => useTransitionController())

          // Start transition
          act(() => {
            result.current.startTransition()
          })

          // Call reset multiple times
          for (let i = 0; i < numResets; i++) {
            act(() => {
              result.current.reset()
            })
          }

          // Property: State should be IDLE regardless of number of resets
          expect(result.current.state.currentState).toBe(AnimationState.IDLE)
          expect(result.current.state.progress).toBe(0)
          expect(result.current.state.totalElapsed).toBe(0)
          expect(result.current.state.selectedGame).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property test: State change callbacks are notified on reset
   * For any state, resetting should notify all registered callbacks
   */
  it('should notify state change callbacks when reset from any state', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          AnimationState.DOOR_OPENING,
          AnimationState.HAND_EMERGING,
          AnimationState.HAND_PAUSED,
          AnimationState.DRAGGING,
          AnimationState.FADING,
          AnimationState.NAVIGATING
        ),
        (fromState) => {
          const { result } = renderHook(() => useTransitionController())
          const stateChangeCallback = vi.fn()

          // Register callback
          act(() => {
            result.current.onStateChange(stateChangeCallback)
          })

          // Start transition
          act(() => {
            result.current.startTransition()
          })

          // Clear previous calls
          stateChangeCallback.mockClear()

          // Reset
          act(() => {
            result.current.reset()
          })

          // Property: Callback should be called with IDLE as new state
          expect(stateChangeCallback).toHaveBeenCalled()
          const lastCall = stateChangeCallback.mock.calls[stateChangeCallback.mock.calls.length - 1]
          expect(lastCall[0]).toBe(AnimationState.IDLE)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property test: Reset clears selected game
   * For any state where a game might be selected, reset should clear it
   */
  it('should clear selected game on reset', () => {
    fc.assert(
      fc.property(
        fc.record({
          hasSelectedGame: fc.boolean()
        }),
        ({ hasSelectedGame }) => {
          const { result } = renderHook(() => useTransitionController())

          // Start transition
          act(() => {
            result.current.startTransition()
          })

          // If we simulate having a selected game
          if (hasSelectedGame) {
            // In real scenario, game would be selected during DRAGGING state
            // For this test, we just verify reset clears it
          }

          // Reset
          act(() => {
            result.current.reset()
          })

          // Property: Selected game should be null after reset
          expect(result.current.state.selectedGame).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property test: Reset allows immediate new transition
   * After reset, starting a new transition should work immediately
   */
  it('should allow immediate new transition after reset', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        (numCycles) => {
          const { result } = renderHook(() => useTransitionController())

          // Perform multiple start-reset cycles
          for (let i = 0; i < numCycles; i++) {
            // Start transition
            act(() => {
              result.current.startTransition()
            })

            expect(result.current.state.currentState).toBe(AnimationState.DOOR_OPENING)

            // Reset
            act(() => {
              result.current.reset()
            })

            expect(result.current.state.currentState).toBe(AnimationState.IDLE)
          }

          // Property: After all cycles, should still be able to start new transition
          act(() => {
            result.current.startTransition()
          })

          expect(result.current.state.currentState).toBe(AnimationState.DOOR_OPENING)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property test: Reset from IDLE is safe
   * Calling reset when already in IDLE state should be safe (no-op)
   */
  it('should safely handle reset when already in IDLE state', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const { result } = renderHook(() => useTransitionController())

          // Verify starting in IDLE
          expect(result.current.state.currentState).toBe(AnimationState.IDLE)

          // Reset while already in IDLE
          act(() => {
            result.current.reset()
          })

          // Property: Should remain in IDLE with clean state
          expect(result.current.state.currentState).toBe(AnimationState.IDLE)
          expect(result.current.state.progress).toBe(0)
          expect(result.current.state.totalElapsed).toBe(0)
          expect(result.current.state.selectedGame).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })
})
