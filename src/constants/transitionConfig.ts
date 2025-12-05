import { TransitionConfig, TransitionTimeline } from '../types/animation'

/**
 * Default transition configuration with durations for each animation phase
 */
export const DEFAULT_TRANSITION_CONFIG: TransitionConfig = {
  doorDuration: 1.2, // seconds
  handDuration: 0.8, // seconds
  pauseDuration: 0.3, // seconds
  dragDuration: 1.0, // seconds
  fadeDuration: 0.5 // seconds
}

/**
 * Reduced motion transition configuration with shorter durations
 * Used when user prefers reduced motion for accessibility
 */
export const REDUCED_MOTION_CONFIG: TransitionConfig = {
  doorDuration: 0.3, // seconds
  handDuration: 0.2, // seconds
  pauseDuration: 0.1, // seconds
  dragDuration: 0.3, // seconds
  fadeDuration: 0.3 // seconds
}

/**
 * Calculate transition timeline based on configuration
 */
export function calculateTimeline(config: TransitionConfig): TransitionTimeline {
  const doorEnd = config.doorDuration
  const handStart = doorEnd * 0.8 // starts at 80% of door animation
  const handEnd = handStart + config.handDuration
  const pauseEnd = handEnd + config.pauseDuration
  const dragEnd = pauseEnd + config.dragDuration
  const fadeStart = pauseEnd + config.dragDuration * 0.7 // starts at 70% of drag
  const fadeEnd = fadeStart + config.fadeDuration

  return {
    doorOpen: { start: 0, end: doorEnd },
    handEmerge: { start: handStart, end: handEnd },
    handPause: { start: handEnd, end: pauseEnd },
    drag: { start: pauseEnd, end: dragEnd },
    fade: { start: fadeStart, end: fadeEnd },
    navigate: { start: fadeEnd }
  }
}

/**
 * Door position in the scene (for audio and camera targeting)
 */
export const DOOR_POSITION = {
  x: 0,
  y: 1.1,
  z: 2.01
}
