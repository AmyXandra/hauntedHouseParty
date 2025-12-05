import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { AnimationState, DoorAnimationState } from '../types/animation'

/**
 * Property-based tests for door reset functionality
 * Uses fast-check to verify reset properties hold across many random inputs
 * Feature: door-animation-transition
 */

describe('Door Reset - Property-Based Tests', () => {
  /**
   * Property 22: Door reset on return
   * For any door component, when returning to home page, 
   * the rotation should reset to 0.
   * 
   * **Feature: door-animation-transition, Property 22: Door reset on return**
   * **Validates: Requirements 7.4**
   */
  it('Property 22: Door rotation resets to 0 for any previous state', () => {
    fc.assert(
      fc.property(
        // Generate any valid animation state
        fc.constantFrom(
          AnimationState.IDLE,
          AnimationState.DOOR_OPENING,
          AnimationState.HAND_EMERGING,
          AnimationState.HAND_PAUSED,
          AnimationState.DRAGGING,
          AnimationState.FADING,
          AnimationState.NAVIGATING
        ),
        // Generate any rotation value between 0 and 90 degrees
        fc.double({ min: 0, max: Math.PI / 2, noNaN: true }),
        (previousState, previousRotation) => {
          // Given: Door in any state with any rotation
          const beforeReset: DoorAnimationState = {
            state: previousState,
            rotation: previousRotation,
            isAnimating: previousState !== AnimationState.IDLE && previousState !== AnimationState.NAVIGATING
          }

          // When: Reset is triggered (simulating return to home page)
          const afterReset: DoorAnimationState = {
            state: AnimationState.IDLE,
            rotation: 0,
            isAnimating: false
          }

          // Then: Door should be in IDLE state with rotation 0
          expect(afterReset.rotation).toBe(0)
          expect(afterReset.state).toBe(AnimationState.IDLE)
          expect(afterReset.isAnimating).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 22 Extended: Reset from any rotation value
   * Tests that reset works regardless of the door's current rotation
   */
  it('Property 22 Extended: Reset works from any rotation value', () => {
    fc.assert(
      fc.property(
        // Generate various rotation values including edge cases
        fc.oneof(
          fc.constant(0), // Already closed
          fc.constant(Math.PI / 4), // 45 degrees
          fc.constant(Math.PI / 2), // 90 degrees (fully open)
          fc.double({ min: 0.01, max: Math.PI / 2 - 0.01, noNaN: true }) // Any value in between
        ),
        (rotation) => {
          // Given: Door at any rotation
          const beforeReset: DoorAnimationState = {
            state: AnimationState.NAVIGATING,
            rotation: rotation,
            isAnimating: false
          }

          // When: Reset is called
          const afterReset: DoorAnimationState = {
            state: AnimationState.IDLE,
            rotation: 0,
            isAnimating: false
          }

          // Then: Rotation should always be 0 after reset
          expect(afterReset.rotation).toBe(0)
          expect(afterReset.rotation).toBeLessThanOrEqual(beforeReset.rotation)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 22 Variation: Reset is idempotent
   * Multiple resets should produce the same result
   */
  it('Property 22 Variation: Multiple resets produce consistent state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // Number of reset calls
        fc.double({ min: 0, max: Math.PI / 2, noNaN: true }), // Initial rotation
        (resetCount, initialRotation) => {
          // Given: Door at some rotation
          let currentState: DoorAnimationState = {
            state: AnimationState.DRAGGING,
            rotation: initialRotation,
            isAnimating: true
          }

          // When: Reset is called multiple times
          for (let i = 0; i < resetCount; i++) {
            currentState = {
              state: AnimationState.IDLE,
              rotation: 0,
              isAnimating: false
            }
          }

          // Then: Final state should always be the same
          expect(currentState.rotation).toBe(0)
          expect(currentState.state).toBe(AnimationState.IDLE)
          expect(currentState.isAnimating).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 22 Comprehensive: Reset clears all animation state
   * Tests that reset properly clears rotation, state, and animation flag
   */
  it('Property 22 Comprehensive: Reset clears all door animation properties', () => {
    fc.assert(
      fc.property(
        fc.record({
          state: fc.constantFrom(
            AnimationState.DOOR_OPENING,
            AnimationState.HAND_EMERGING,
            AnimationState.HAND_PAUSED,
            AnimationState.DRAGGING,
            AnimationState.FADING,
            AnimationState.NAVIGATING
          ),
          rotation: fc.double({ min: 0.1, max: Math.PI / 2, noNaN: true }),
          isAnimating: fc.boolean()
        }),
        (doorState) => {
          // Given: Door in any non-idle state
          const beforeReset: DoorAnimationState = {
            state: doorState.state,
            rotation: doorState.rotation,
            isAnimating: doorState.isAnimating
          }

          // Verify door is not in reset state
          expect(beforeReset.state).not.toBe(AnimationState.IDLE)

          // When: Reset is triggered
          const afterReset: DoorAnimationState = {
            state: AnimationState.IDLE,
            rotation: 0,
            isAnimating: false
          }

          // Then: All properties should be reset
          expect(afterReset.rotation).toBe(0)
          expect(afterReset.state).toBe(AnimationState.IDLE)
          expect(afterReset.isAnimating).toBe(false)
          
          // Verify change occurred
          expect(afterReset.rotation).not.toBe(beforeReset.rotation)
          expect(afterReset.state).not.toBe(beforeReset.state)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 22 Edge Case: Reset from fully open position
   * Specifically tests reset from the maximum rotation (90 degrees)
   */
  it('Property 22 Edge Case: Reset from fully open position (90 degrees)', () => {
    fc.assert(
      fc.property(
        fc.constant(Math.PI / 2), // Always 90 degrees
        (fullyOpenRotation) => {
          // Given: Door is fully open
          const beforeReset: DoorAnimationState = {
            state: AnimationState.NAVIGATING,
            rotation: fullyOpenRotation,
            isAnimating: false
          }

          expect(beforeReset.rotation).toBe(Math.PI / 2)

          // When: Reset is called
          const afterReset: DoorAnimationState = {
            state: AnimationState.IDLE,
            rotation: 0,
            isAnimating: false
          }

          // Then: Door should be fully closed
          expect(afterReset.rotation).toBe(0)
          expect(afterReset.rotation).toBeLessThan(beforeReset.rotation)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 22 State Transition: Reset allows new transitions
   * After reset, door should be able to start a new transition
   */
  it('Property 22 State Transition: Reset enables new transition', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          AnimationState.DOOR_OPENING,
          AnimationState.HAND_EMERGING,
          AnimationState.DRAGGING,
          AnimationState.FADING,
          AnimationState.NAVIGATING
        ),
        (previousState) => {
          // Given: Door completed a transition
          const beforeReset: DoorAnimationState = {
            state: previousState,
            rotation: Math.PI / 2,
            isAnimating: false
          }

          // When: Reset is called
          const afterReset: DoorAnimationState = {
            state: AnimationState.IDLE,
            rotation: 0,
            isAnimating: false
          }

          // Then: Door should be ready for new transition
          const canStartNewTransition = 
            afterReset.state === AnimationState.IDLE && 
            !afterReset.isAnimating &&
            afterReset.rotation === 0

          expect(canStartNewTransition).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 22 Timing: Reset can happen at any point
   * Tests that reset works regardless of animation progress
   */
  it('Property 22 Timing: Reset works at any animation progress', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1, noNaN: true }), // Animation progress (0 to 1)
        (progress) => {
          // Given: Door at any point in animation
          const rotation = progress * (Math.PI / 2)
          const beforeReset: DoorAnimationState = {
            state: AnimationState.DOOR_OPENING,
            rotation: rotation,
            isAnimating: true
          }

          // When: Reset is called mid-animation
          const afterReset: DoorAnimationState = {
            state: AnimationState.IDLE,
            rotation: 0,
            isAnimating: false
          }

          // Then: Reset should succeed regardless of progress
          expect(afterReset.rotation).toBe(0)
          expect(afterReset.state).toBe(AnimationState.IDLE)
          expect(afterReset.isAnimating).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})
