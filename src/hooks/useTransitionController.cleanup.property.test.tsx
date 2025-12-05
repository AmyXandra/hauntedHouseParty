import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import * as fc from 'fast-check'
import { useTransitionController } from './useTransitionController'
import { AnimationState } from '../types/animation'

// Mock useFrame from @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn()
}))

/**
 * **Feature: door-animation-transition, Property 18: Resource cleanup on completion**
 * **Validates: Requirements 6.5**
 * 
 * Property: For any completed transition sequence, animation frame callbacks should be 
 * removed and object references should be cleared.
 * 
 * This test verifies that:
 * 1. State change callbacks are properly cleaned up when unregistered
 * 2. Animation stops when hook unmounts
 * 3. No memory leaks from lingering callbacks or references
 */

describe('useTransitionController - Resource Cleanup Property Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('Property 18: should clean up state change callbacks when unregistered', () => {
    /**
     * Property: For any number of registered callbacks, when they are unregistered,
     * they should not be invoked on subsequent state changes
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // Number of callbacks to register
        (callbackCount) => {
          const { result, unmount } = renderHook(() => useTransitionController())

          // Register multiple callbacks and track their invocations
          const callbacks = Array.from({ length: callbackCount }, () => vi.fn())
          let unsubscribers: Array<() => void> = []

          act(() => {
            unsubscribers = callbacks.map(callback => 
              result.current.onStateChange(callback)
            )
          })

          // Start transition to trigger callbacks
          act(() => {
            result.current.startTransition()
          })

          // Verify all callbacks were invoked
          callbacks.forEach(callback => {
            expect(callback).toHaveBeenCalledWith(
              AnimationState.DOOR_OPENING,
              AnimationState.IDLE
            )
          })

          // Unregister all callbacks
          act(() => {
            unsubscribers.forEach(unsubscribe => unsubscribe())
          })

          // Reset transition to trigger another state change
          act(() => {
            result.current.reset()
          })

          // Clear mock call history
          callbacks.forEach(callback => callback.mockClear())

          // Start another transition
          act(() => {
            result.current.startTransition()
          })

          // Verify callbacks were NOT invoked after unregistering
          callbacks.forEach(callback => {
            expect(callback).not.toHaveBeenCalled()
          })

          unmount()
        }
      ),
      { numRuns: 20 }
    )
  })

  it('Property 18: should stop animation when hook unmounts', () => {
    /**
     * Property: For any transition in progress, when the hook unmounts,
     * the animation should stop and not continue updating
     */
    fc.assert(
      fc.property(
        fc.constantFrom(
          AnimationState.DOOR_OPENING,
          AnimationState.HAND_EMERGING,
          AnimationState.DRAGGING,
          AnimationState.FADING
        ),
        (targetState) => {
          const stateChangeCallback = vi.fn()
          
          const { result, unmount } = renderHook(() => useTransitionController())

          // Register callback to track state changes
          act(() => {
            result.current.onStateChange(stateChangeCallback)
          })

          // Start transition
          act(() => {
            result.current.startTransition()
          })

          // Clear callback history
          stateChangeCallback.mockClear()

          // Unmount the hook
          unmount()

          // Advance time significantly
          vi.advanceTimersByTime(10000)

          // Verify no state changes occurred after unmount
          // The callback should not have been invoked after unmount
          expect(stateChangeCallback).not.toHaveBeenCalled()
        }
      ),
      { numRuns: 20 }
    )
  })

  it('Property 18: should clean up all callbacks on unmount', () => {
    /**
     * Property: For any set of registered callbacks, when the component unmounts,
     * all callbacks should be cleaned up and not invoked
     */
    fc.assert(
      fc.property(
        fc.array(fc.constant(vi.fn()), { minLength: 1, maxLength: 5 }),
        (callbacks) => {
          const { result, unmount } = renderHook(() => useTransitionController())

          // Register all callbacks
          act(() => {
            callbacks.forEach(callback => {
              result.current.onStateChange(callback)
            })
          })

          // Start transition
          act(() => {
            result.current.startTransition()
          })

          // Verify callbacks were invoked initially
          callbacks.forEach(callback => {
            expect(callback).toHaveBeenCalled()
          })

          // Clear mock history
          callbacks.forEach(callback => callback.mockClear())

          // Unmount
          unmount()

          // Try to trigger state changes (this shouldn't work after unmount)
          vi.advanceTimersByTime(5000)

          // Verify no callbacks were invoked after unmount
          callbacks.forEach(callback => {
            expect(callback).not.toHaveBeenCalled()
          })
        }
      ),
      { numRuns: 20 }
    )
  })

  it('Property 18: should handle cleanup for interrupted transitions', () => {
    /**
     * Property: For any transition that is interrupted (reset before completion),
     * resources should be cleaned up properly
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 2000 }), // Time before interruption
        (interruptTime) => {
          const stateChangeCallback = vi.fn()
          
          const { result, unmount } = renderHook(() => useTransitionController())

          act(() => {
            result.current.onStateChange(stateChangeCallback)
          })

          // Start transition
          act(() => {
            result.current.startTransition()
          })

          // Advance time partially
          vi.advanceTimersByTime(interruptTime)

          // Interrupt by resetting
          act(() => {
            result.current.reset()
          })

          // Clear callback history
          stateChangeCallback.mockClear()

          // Advance time further
          vi.advanceTimersByTime(5000)

          // Verify animation stopped (state should be IDLE)
          expect(result.current.state.currentState).toBe(AnimationState.IDLE)

          // Start a new transition to verify system is still functional
          act(() => {
            result.current.startTransition()
          })

          // Should transition to DOOR_OPENING
          expect(stateChangeCallback).toHaveBeenCalledWith(
            AnimationState.DOOR_OPENING,
            AnimationState.IDLE
          )

          unmount()
        }
      ),
      { numRuns: 20 }
    )
  })

  it('Property 18: should not leak memory with repeated mount/unmount cycles', () => {
    /**
     * Property: For any number of mount/unmount cycles, callbacks should be
     * properly cleaned up each time without accumulating
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }), // Number of mount/unmount cycles
        (cycles) => {
          const allCallbacks: Array<ReturnType<typeof vi.fn>> = []

          for (let i = 0; i < cycles; i++) {
            const { result, unmount } = renderHook(() => useTransitionController())

            const callback = vi.fn()
            allCallbacks.push(callback)

            act(() => {
              result.current.onStateChange(callback)
            })
            
            act(() => {
              result.current.startTransition()
            })

            // Verify this callback was invoked
            expect(callback).toHaveBeenCalled()

            unmount()
          }

          // Clear all callback histories
          allCallbacks.forEach(cb => cb.mockClear())

          // Advance time significantly
          vi.advanceTimersByTime(10000)

          // Verify none of the old callbacks are still being invoked
          allCallbacks.forEach(callback => {
            expect(callback).not.toHaveBeenCalled()
          })
        }
      ),
      { numRuns: 10 }
    )
  })
})
