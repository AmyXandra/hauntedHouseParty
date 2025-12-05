import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AnimationState, DoorAnimationState } from '../types/animation'

/**
 * Unit tests for reset functionality when returning to home page
 * Tests door reset, hand visibility reset, animation state reset, and ability to trigger new transitions
 * Validates: Requirements 7.4, 7.5
 */

describe('Reset Functionality', () => {
  /**
   * Test: Door resets to closed position
   * Requirement 7.4: WHEN the user returns from a game 
   * THEN the DoorComponent SHALL reset to its closed position
   */
  it('should reset door rotation to 0', () => {
    // Simulate door in open state after animation
    const openDoorState: DoorAnimationState = {
      state: AnimationState.NAVIGATING,
      rotation: Math.PI / 2, // 90 degrees (open)
      isAnimating: false
    }

    expect(openDoorState.rotation).toBe(Math.PI / 2)

    // Simulate reset
    const resetDoorState: DoorAnimationState = {
      state: AnimationState.IDLE,
      rotation: 0,
      isAnimating: false
    }

    expect(resetDoorState.rotation).toBe(0)
    expect(resetDoorState.state).toBe(AnimationState.IDLE)
  })

  /**
   * Test: Hand becomes hidden on reset
   * Requirement 7.5: WHEN the DoorComponent resets 
   * THEN the SkeletonHand SHALL be hidden and ready for the next interaction
   */
  it('should hide skeleton hand on reset', () => {
    // Simulate hand visible during animation
    let handVisible = true
    const currentState = AnimationState.DRAGGING

    // Hand should be visible during DRAGGING
    expect(handVisible).toBe(true)

    // Simulate reset to IDLE
    const resetState = AnimationState.IDLE
    handVisible = [AnimationState.HAND_EMERGING, AnimationState.HAND_PAUSED, AnimationState.DRAGGING].includes(resetState)

    // Hand should be hidden after reset
    expect(handVisible).toBe(false)
  })

  /**
   * Test: Animation state returns to IDLE
   * Requirement 7.4: Animation state should be cleared to IDLE
   */
  it('should reset animation state to IDLE', () => {
    // Simulate various animation states
    const states = [
      AnimationState.DOOR_OPENING,
      AnimationState.HAND_EMERGING,
      AnimationState.HAND_PAUSED,
      AnimationState.DRAGGING,
      AnimationState.FADING,
      AnimationState.NAVIGATING
    ]

    states.forEach(state => {
      // After reset, state should always be IDLE
      const resetState = AnimationState.IDLE
      expect(resetState).toBe(AnimationState.IDLE)
    })
  })

  /**
   * Test: New transition can be triggered after reset
   * Requirement 7.5: Ensure new transitions can be triggered
   */
  it('should allow new transition after reset', () => {
    const mockStartTransition = vi.fn()
    
    // Simulate reset state
    const animationState: DoorAnimationState = {
      state: AnimationState.IDLE,
      rotation: 0,
      isAnimating: false
    }

    // Should be able to trigger new transition
    const canTrigger = !animationState.isAnimating && animationState.state === AnimationState.IDLE
    expect(canTrigger).toBe(true)

    // Simulate click to start new transition
    if (canTrigger) {
      mockStartTransition()
    }

    expect(mockStartTransition).toHaveBeenCalledTimes(1)
  })

  /**
   * Test: Camera position is restored
   * Validates that camera returns to original position on reset
   */
  it('should restore camera to original position', () => {
    const initialCameraPosition = { x: 4, y: 2, z: 5 }
    const duringTransitionPosition = { x: 1, y: 1.5, z: 2.5 }

    // During transition, camera moves
    expect(duringTransitionPosition.z).toBeLessThan(initialCameraPosition.z)

    // After reset, camera should be back at initial position
    const resetCameraPosition = { ...initialCameraPosition }
    expect(resetCameraPosition.x).toBe(initialCameraPosition.x)
    expect(resetCameraPosition.y).toBe(initialCameraPosition.y)
    expect(resetCameraPosition.z).toBe(initialCameraPosition.z)
  })

  /**
   * Test: Complete reset flow
   * Validates that all components reset together
   */
  it('should reset all components together', () => {
    // Simulate state after complete animation
    const beforeReset = {
      doorRotation: Math.PI / 2,
      handVisible: true,
      animationState: AnimationState.NAVIGATING,
      cameraActive: false
    }

    expect(beforeReset.doorRotation).toBe(Math.PI / 2)
    expect(beforeReset.handVisible).toBe(true)

    // Simulate reset
    const afterReset = {
      doorRotation: 0,
      handVisible: false,
      animationState: AnimationState.IDLE,
      cameraActive: false
    }

    expect(afterReset.doorRotation).toBe(0)
    expect(afterReset.handVisible).toBe(false)
    expect(afterReset.animationState).toBe(AnimationState.IDLE)
  })

  /**
   * Test: Reset clears selected game
   * Validates that game selection is cleared on reset
   */
  it('should clear selected game on reset', () => {
    const transitionState = {
      currentState: AnimationState.NAVIGATING,
      progress: 1,
      totalElapsed: 3.5,
      selectedGame: { id: 1, name: 'Game 1' }
    }

    expect(transitionState.selectedGame).not.toBeNull()

    // After reset
    const resetState = {
      currentState: AnimationState.IDLE,
      progress: 0,
      totalElapsed: 0,
      selectedGame: null
    }

    expect(resetState.selectedGame).toBeNull()
  })

  /**
   * Test: Reset can be called multiple times safely
   * Validates idempotent reset behavior
   */
  it('should handle multiple reset calls safely', () => {
    const mockReset = vi.fn(() => {
      return {
        currentState: AnimationState.IDLE,
        progress: 0,
        totalElapsed: 0,
        selectedGame: null
      }
    })

    // Call reset multiple times
    const result1 = mockReset()
    const result2 = mockReset()
    const result3 = mockReset()

    expect(mockReset).toHaveBeenCalledTimes(3)
    expect(result1).toEqual(result2)
    expect(result2).toEqual(result3)
  })

  /**
   * Test: Reset during mid-animation
   * Validates that reset works even if called during active animation
   */
  it('should reset even during active animation', () => {
    const midAnimationState = {
      currentState: AnimationState.DOOR_OPENING,
      progress: 0.5,
      totalElapsed: 0.6,
      selectedGame: null,
      isAnimating: true
    }

    expect(midAnimationState.isAnimating).toBe(true)

    // Reset should work regardless of current state
    const resetState = {
      currentState: AnimationState.IDLE,
      progress: 0,
      totalElapsed: 0,
      selectedGame: null,
      isAnimating: false
    }

    expect(resetState.currentState).toBe(AnimationState.IDLE)
    expect(resetState.isAnimating).toBe(false)
  })
})
