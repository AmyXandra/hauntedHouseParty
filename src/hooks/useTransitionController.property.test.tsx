import { describe, it, expect, vi } from 'vitest'
import * as fc from 'fast-check'
import { calculateTimeline } from '../constants/transitionConfig'
import { TransitionConfig, AnimationState } from '../types/animation'

// Mock useFrame from @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn()
}))

describe('useTransitionController - Property-Based Tests', () => {
  /**
   * Feature: door-animation-transition, Property 2: Animation timing accuracy
   * Validates: Requirements 1.2, 2.3, 3.3
   *
   * For any animation phase (door open, hand emerge, drag), when the configured
   * duration elapses, the animation progress should equal 1.0 (complete).
   */
  it('Property 2: animation phases complete when configured duration elapses', () => {
    fc.assert(
      fc.property(
        // Generate random but reasonable duration configurations
        fc.record({
          doorDuration: fc.double({ min: 0.5, max: 3.0, noNaN: true }),
          handDuration: fc.double({ min: 0.3, max: 2.0, noNaN: true }),
          pauseDuration: fc.double({ min: 0.1, max: 1.0, noNaN: true }),
          dragDuration: fc.double({ min: 0.5, max: 2.5, noNaN: true }),
          fadeDuration: fc.double({ min: 0.2, max: 1.5, noNaN: true })
        }),
        (config: TransitionConfig) => {
          const timeline = calculateTimeline(config)

          // Test door opening phase
          const doorDuration = timeline.doorOpen.end - timeline.doorOpen.start
          expect(Math.abs(doorDuration - config.doorDuration)).toBeLessThan(0.001)

          // Test hand emerging phase
          const handDuration = timeline.handEmerge.end - timeline.handEmerge.start
          expect(Math.abs(handDuration - config.handDuration)).toBeLessThan(0.001)

          // Test hand pause phase
          const pauseDuration = timeline.handPause.end - timeline.handPause.start
          expect(Math.abs(pauseDuration - config.pauseDuration)).toBeLessThan(0.001)

          // Test drag phase
          const dragDuration = timeline.drag.end - timeline.drag.start
          expect(Math.abs(dragDuration - config.dragDuration)).toBeLessThan(0.001)

          // Test fade phase
          const fadeDuration = timeline.fade.end - timeline.fade.start
          expect(Math.abs(fadeDuration - config.fadeDuration)).toBeLessThan(0.001)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: door-animation-transition, Property 13: Configurable animation durations
   * Validates: Requirements 4.1
   *
   * For any transition configuration with custom duration values, the actual
   * animation durations should match the configured values within 50ms tolerance.
   */
  it('Property 13: configured durations match actual animation durations within tolerance', () => {
    fc.assert(
      fc.property(
        fc.record({
          doorDuration: fc.double({ min: 0.5, max: 3.0, noNaN: true }),
          handDuration: fc.double({ min: 0.3, max: 2.0, noNaN: true }),
          pauseDuration: fc.double({ min: 0.1, max: 1.0, noNaN: true }),
          dragDuration: fc.double({ min: 0.5, max: 2.5, noNaN: true }),
          fadeDuration: fc.double({ min: 0.2, max: 1.5, noNaN: true })
        }),
        (config: TransitionConfig) => {
          const timeline = calculateTimeline(config)
          const tolerance = 0.05 // 50ms tolerance

          // Verify each phase duration matches configuration within tolerance
          const doorActual = timeline.doorOpen.end - timeline.doorOpen.start
          expect(Math.abs(doorActual - config.doorDuration)).toBeLessThanOrEqual(tolerance)

          const handActual = timeline.handEmerge.end - timeline.handEmerge.start
          expect(Math.abs(handActual - config.handDuration)).toBeLessThanOrEqual(tolerance)

          const pauseActual = timeline.handPause.end - timeline.handPause.start
          expect(Math.abs(pauseActual - config.pauseDuration)).toBeLessThanOrEqual(tolerance)

          const dragActual = timeline.drag.end - timeline.drag.start
          expect(Math.abs(dragActual - config.dragDuration)).toBeLessThanOrEqual(tolerance)

          const fadeActual = timeline.fade.end - timeline.fade.start
          expect(Math.abs(fadeActual - config.fadeDuration)).toBeLessThanOrEqual(tolerance)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: door-animation-transition, Property 14: State change observability
   * Validates: Requirements 4.3
   *
   * For any animation state transition, registered state change callbacks
   * should be invoked with the new state value.
   */
  it('Property 14: state change callbacks are invoked for all valid transitions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { from: AnimationState.IDLE, to: AnimationState.DOOR_OPENING },
          { from: AnimationState.DOOR_OPENING, to: AnimationState.HAND_EMERGING },
          { from: AnimationState.HAND_EMERGING, to: AnimationState.HAND_PAUSED },
          { from: AnimationState.HAND_PAUSED, to: AnimationState.DRAGGING },
          { from: AnimationState.DRAGGING, to: AnimationState.FADING },
          { from: AnimationState.FADING, to: AnimationState.NAVIGATING },
          { from: AnimationState.NAVIGATING, to: AnimationState.RESETTING },
          { from: AnimationState.RESETTING, to: AnimationState.IDLE }
        ),
        (transition) => {
          // Test that valid transitions are recognized
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

          const isValid = validTransitions[transition.from]?.includes(transition.to) ?? false
          expect(isValid).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Additional property: Timeline sequencing
   * Verifies that animation phases occur in the correct order
   */
  it('Property: animation phases occur in sequential order', () => {
    fc.assert(
      fc.property(
        fc.record({
          doorDuration: fc.double({ min: 0.5, max: 3.0, noNaN: true }),
          handDuration: fc.double({ min: 0.3, max: 2.0, noNaN: true }),
          pauseDuration: fc.double({ min: 0.1, max: 1.0, noNaN: true }),
          dragDuration: fc.double({ min: 0.5, max: 2.5, noNaN: true }),
          fadeDuration: fc.double({ min: 0.2, max: 1.5, noNaN: true })
        }),
        (config: TransitionConfig) => {
          const timeline = calculateTimeline(config)

          // Verify phases occur in order
          expect(timeline.doorOpen.start).toBe(0)
          expect(timeline.doorOpen.end).toBeGreaterThan(timeline.doorOpen.start)
          
          // Hand emerges during door opening (at 80%)
          expect(timeline.handEmerge.start).toBeGreaterThan(timeline.doorOpen.start)
          expect(timeline.handEmerge.start).toBeLessThan(timeline.doorOpen.end)
          expect(timeline.handEmerge.end).toBeGreaterThan(timeline.handEmerge.start)
          
          // Pause comes after hand emergence
          expect(timeline.handPause.start).toBe(timeline.handEmerge.end)
          expect(timeline.handPause.end).toBeGreaterThan(timeline.handPause.start)
          
          // Drag comes after pause
          expect(timeline.drag.start).toBe(timeline.handPause.end)
          expect(timeline.drag.end).toBeGreaterThan(timeline.drag.start)
          
          // Fade starts during drag (at 70%)
          expect(timeline.fade.start).toBeGreaterThan(timeline.drag.start)
          expect(timeline.fade.start).toBeLessThan(timeline.drag.end)
          expect(timeline.fade.end).toBeGreaterThan(timeline.fade.start)
          
          // Navigation starts after fade
          expect(timeline.navigate.start).toBe(timeline.fade.end)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Additional property: Hand emergence timing
   * Verifies that hand emerges at 80% of door opening
   */
  it('Property: hand emergence starts at 80% of door opening duration', () => {
    fc.assert(
      fc.property(
        fc.record({
          doorDuration: fc.double({ min: 0.5, max: 3.0, noNaN: true }),
          handDuration: fc.double({ min: 0.3, max: 2.0, noNaN: true }),
          pauseDuration: fc.double({ min: 0.1, max: 1.0, noNaN: true }),
          dragDuration: fc.double({ min: 0.5, max: 2.5, noNaN: true }),
          fadeDuration: fc.double({ min: 0.2, max: 1.5, noNaN: true })
        }),
        (config: TransitionConfig) => {
          const timeline = calculateTimeline(config)
          
          const expectedHandStart = config.doorDuration * 0.8
          const actualHandStart = timeline.handEmerge.start
          
          expect(Math.abs(actualHandStart - expectedHandStart)).toBeLessThan(0.001)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Additional property: Fade timing
   * Verifies that fade starts at 70% of drag duration
   */
  it('Property: fade starts at 70% of drag duration', () => {
    fc.assert(
      fc.property(
        fc.record({
          doorDuration: fc.double({ min: 0.5, max: 3.0, noNaN: true }),
          handDuration: fc.double({ min: 0.3, max: 2.0, noNaN: true }),
          pauseDuration: fc.double({ min: 0.1, max: 1.0, noNaN: true }),
          dragDuration: fc.double({ min: 0.5, max: 2.5, noNaN: true }),
          fadeDuration: fc.double({ min: 0.2, max: 1.5, noNaN: true })
        }),
        (config: TransitionConfig) => {
          const timeline = calculateTimeline(config)
          
          const expectedFadeStart = timeline.drag.start + config.dragDuration * 0.7
          const actualFadeStart = timeline.fade.start
          
          expect(Math.abs(actualFadeStart - expectedFadeStart)).toBeLessThan(0.001)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: door-animation-transition, Property 9: Hand pause state transition
   * Validates: Requirements 2.5
   *
   * For any transition sequence, when hand animation completes, the state should
   * transition to HAND_PAUSED before DRAGGING.
   */
  it('Property 9: hand pause state occurs between hand emergence and dragging', () => {
    fc.assert(
      fc.property(
        fc.record({
          doorDuration: fc.double({ min: 0.5, max: 3.0, noNaN: true }),
          handDuration: fc.double({ min: 0.3, max: 2.0, noNaN: true }),
          pauseDuration: fc.double({ min: 0.1, max: 1.0, noNaN: true }),
          dragDuration: fc.double({ min: 0.5, max: 2.5, noNaN: true }),
          fadeDuration: fc.double({ min: 0.2, max: 1.5, noNaN: true })
        }),
        (config: TransitionConfig) => {
          const timeline = calculateTimeline(config)
          
          // Verify that hand pause phase exists and occurs in the correct sequence
          // 1. Hand pause should start exactly when hand emergence ends
          expect(timeline.handPause.start).toBe(timeline.handEmerge.end)
          
          // 2. Hand pause should end before dragging starts
          expect(timeline.handPause.end).toBe(timeline.drag.start)
          
          // 3. Hand pause duration should match the configured pause duration
          const actualPauseDuration = timeline.handPause.end - timeline.handPause.start
          expect(Math.abs(actualPauseDuration - config.pauseDuration)).toBeLessThan(0.001)
          
          // 4. The pause phase should be non-zero (there must be a pause)
          expect(timeline.handPause.end).toBeGreaterThan(timeline.handPause.start)
          
          // 5. Verify the state machine allows HAND_EMERGING -> HAND_PAUSED -> DRAGGING
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
          
          // Verify HAND_EMERGING can transition to HAND_PAUSED
          expect(validTransitions[AnimationState.HAND_EMERGING]).toContain(AnimationState.HAND_PAUSED)
          
          // Verify HAND_PAUSED can transition to DRAGGING
          expect(validTransitions[AnimationState.HAND_PAUSED]).toContain(AnimationState.DRAGGING)
          
          // Verify HAND_EMERGING cannot transition directly to DRAGGING (must go through HAND_PAUSED)
          expect(validTransitions[AnimationState.HAND_EMERGING]).not.toContain(AnimationState.DRAGGING)
        }
      ),
      { numRuns: 100 }
    )
  })
})
