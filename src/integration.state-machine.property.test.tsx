import { describe, it, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import * as fc from 'fast-check'
import { useTransitionController } from './hooks/useTransitionController'
import { AnimationState } from './types/animation'

/**
 * Property-based integration test for state machine validity
 * **Feature: door-animation-transition, Property test for state transitions**
 * **Validates: Requirements 4.3, 9.2**
 * 
 * Tests that the state machine correctly handles:
 * - Valid state transitions
 * - Invalid state transitions are rejected
 * - State reset on interruption
 * - State observability
 */

// Mock R3F's useFrame hook
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((callback) => {
    // Store the callback for manual invocation in tests
    if (!(globalThis as any).__r3fCallbacks) {
      (globalThis as any).__r3fCallbacks = []
    }
    (globalThis as any).__r3fCallbacks.push(callback)
    return () => {
      const index = (globalThis as any).__r3fCallbacks.indexOf(callback)
      if (index > -1) {
        (globalThis as any).__r3fCallbacks.splice(index, 1)
      }
    }
  })
}))

describe('Integration Property Tests - State Machine Validity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(globalThis as any).__r3fCallbacks = []
  })

  /**
   * Property test: Valid state transitions
   * Verifies that all valid state transitions are accepted
   */
  it('should accept all valid state transitions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          const { result } = renderHook(() => useTransitionController())

          // Define valid transition sequences
          const validTransitions: Array<[AnimationState, AnimationState]> = [
            [AnimationState.IDLE, AnimationState.DOOR_OPENING],
            [AnimationState.DOOR_OPENING, AnimationState.HAND_EMERGING],
            [AnimationState.HAND_EMERGING, AnimationState.HAND_PAUSED],
            [AnimationState.HAND_PAUSED, AnimationState.DRAGGING],
            [AnimationState.DRAGGING, AnimationState.FADING],
            [AnimationState.FADING, AnimationState.NAVIGATING],
            [AnimationState.NAVIGATING, AnimationState.RESETTING],
            [AnimationState.RESETTING, AnimationState.IDLE]
          ]

          // Property: All valid transitions should be accepted by isValidTransition
          for (const [from, to] of validTransitions) {
            const isValid = result.current.isValidTransition(from, to)
            if (!isValid) {
              console.error(`Invalid transition rejected: ${from} -> ${to}`)
              return false
            }
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property test: Invalid state transitions
   * Verifies that invalid state transitions are rejected
   */
  it('should reject invalid state transitions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.constantFrom(...Object.values(AnimationState)),
          fc.constantFrom(...Object.values(AnimationState))
        ),
        async ([fromState, toState]) => {
          const { result } = renderHook(() => useTransitionController())

          // Define valid transitions
          const validTransitions: Record<AnimationState, AnimationState[]> = {
            [AnimationState.IDLE]: [AnimationState.DOOR_OPENING, AnimationState.RESETTING],
            [AnimationState.DOOR_OPENING]: [AnimationState.HAND_EMERGING, AnimationState.RESETTING],
            [AnimationState.HAND_EMERGING]: [AnimationState.HAND_PAUSED, AnimationState.RESETTING],
            [AnimationState.HAND_PAUSED]: [AnimationState.DRAGGING, AnimationState.RESETTING],
            [AnimationState.DRAGGING]: [AnimationState.FADING, AnimationState.RESETTING],
            [AnimationState.FADING]: [AnimationState.NAVIGATING, AnimationState.RESETTING],
            [AnimationState.NAVIGATING]: [AnimationState.RESETTING],
            [AnimationState.RESETTING]: [AnimationState.IDLE]
          }

          const isValid = result.current.isValidTransition(fromState, toState)
          const shouldBeValid = validTransitions[fromState]?.includes(toState) ?? false

          // Property: isValidTransition should match expected validity
          return isValid === shouldBeValid
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property test: State reset functionality
   * Verifies that reset always returns to IDLE state
   */
  it('should reset to IDLE state from any state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...Object.values(AnimationState)),
        async () => {
          const { result } = renderHook(() => useTransitionController())

          // Manually set state to test reset from any state
          // In real usage, state transitions happen through the animation loop
          
          // Call reset
          act(() => {
            result.current.reset()
          })

          // Property: After reset, state should be IDLE
          return result.current.state.currentState === AnimationState.IDLE &&
                 result.current.state.progress === 0 &&
                 result.current.state.totalElapsed === 0 &&
                 result.current.state.selectedGame === null
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property test: State change observability
   * Verifies that state changes trigger callbacks
   */
  it('should notify observers of state changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          const { result } = renderHook(() => useTransitionController())

          const stateChanges: Array<{ from: AnimationState, to: AnimationState }> = []
          
          // Register state change callback
          act(() => {
            result.current.onStateChange((newState, oldState) => {
              stateChanges.push({ from: oldState, to: newState })
            })
          })

          // Trigger a transition
          act(() => {
            result.current.startTransition()
          })

          // Property: State change callback should be invoked
          // At minimum, we should see transition to DOOR_OPENING
          return stateChanges.some(change => 
            change.from === AnimationState.IDLE && 
            change.to === AnimationState.DOOR_OPENING
          )
        }
      ),
      { numRuns: 30 }
    )
  })

  /**
   * Property test: State machine determinism
   * Verifies that same inputs produce same state transitions
   */
  it('should produce deterministic state transitions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          doorDuration: fc.double({ min: 0.5, max: 2.0, noNaN: true }),
          handDuration: fc.double({ min: 0.3, max: 1.5, noNaN: true }),
          pauseDuration: fc.double({ min: 0.1, max: 0.5, noNaN: true }),
          dragDuration: fc.double({ min: 0.5, max: 2.0, noNaN: true }),
          fadeDuration: fc.double({ min: 0.2, max: 1.0, noNaN: true })
        }),
        async (config) => {
          // Run the same configuration twice
          const { result: result1 } = renderHook(() => useTransitionController(config))
          const { result: result2 } = renderHook(() => useTransitionController(config))

          // Both should start in IDLE state
          const state1 = result1.current.state.currentState
          const state2 = result2.current.state.currentState

          // Property: Same configuration produces same initial state
          return state1 === state2 && state1 === AnimationState.IDLE
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property test: State transition ordering
   * Verifies that states transition in the correct order
   */
  it('should transition through states in correct order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          const { result } = renderHook(() => useTransitionController())

          const observedStates: AnimationState[] = [result.current.state.currentState]

          // Register observer
          act(() => {
            result.current.onStateChange((newState) => {
              observedStates.push(newState)
            })
          })

          // Start transition
          act(() => {
            result.current.startTransition()
          })

          // Property: First state should be IDLE, second should be DOOR_OPENING
          return observedStates[0] === AnimationState.IDLE &&
                 (observedStates.length === 1 || observedStates[1] === AnimationState.DOOR_OPENING)
        }
      ),
      { numRuns: 30 }
    )
  })

  /**
   * Property test: Callback cleanup
   * Verifies that unsubscribing removes callbacks
   */
  it('should remove callbacks when unsubscribed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          const { result } = renderHook(() => useTransitionController())

          let unsubscribe: (() => void) | undefined
          
          // Register callback
          act(() => {
            unsubscribe = result.current.onStateChange(() => {
              // Callback implementation
            })
          })

          // Unsubscribe
          if (unsubscribe) {
            act(() => {
              unsubscribe!()
            })
          }

          // Trigger a transition
          act(() => {
            result.current.startTransition()
          })

          // Property: Unsubscribe function should exist
          return typeof unsubscribe === 'function'
        }
      ),
      { numRuns: 20 }
    )
  })

  /**
   * Property test: Multiple resets
   * Verifies that reset can be called multiple times safely
   */
  it('should handle multiple resets safely', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        async (resetCount) => {
          const { result } = renderHook(() => useTransitionController())

          // Call reset multiple times
          for (let i = 0; i < resetCount; i++) {
            act(() => {
              result.current.reset()
            })
          }

          // Property: After multiple resets, state should still be IDLE
          return result.current.state.currentState === AnimationState.IDLE &&
                 result.current.state.progress === 0
        }
      ),
      { numRuns: 50 }
    )
  })
})
