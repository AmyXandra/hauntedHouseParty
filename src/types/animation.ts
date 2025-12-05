/**
 * Animation state machine states for door transition sequence
 */
export enum AnimationState {
  IDLE = 'IDLE',
  DOOR_OPENING = 'DOOR_OPENING',
  HAND_EMERGING = 'HAND_EMERGING',
  HAND_PAUSED = 'HAND_PAUSED',
  DRAGGING = 'DRAGGING',
  FADING = 'FADING',
  NAVIGATING = 'NAVIGATING',
  RESETTING = 'RESETTING'
}

/**
 * Door animation state interface
 */
export interface DoorAnimationState {
  state: AnimationState
  rotation: number // 0 to Math.PI/2 (90 degrees)
  isAnimating: boolean
}

/**
 * Transition configuration for animation durations
 */
export interface TransitionConfig {
  doorDuration: number // 1.2s
  handDuration: number // 0.8s
  pauseDuration: number // 0.3s
  dragDuration: number // 1.0s
  fadeDuration: number // 0.5s
}

/**
 * Current state of the transition sequence
 */
export interface TransitionState {
  currentState: AnimationState
  progress: number // 0 to 1 for current state
  totalElapsed: number
  selectedGame: any | null
}

/**
 * Timeline for transition phases
 */
export interface TransitionTimeline {
  doorOpen: { start: number; end: number }
  handEmerge: { start: number; end: number }
  handPause: { start: number; end: number }
  drag: { start: number; end: number }
  fade: { start: number; end: number }
  navigate: { start: number }
}

/**
 * 3D position type
 */
export interface Position3D {
  x: number
  y: number
  z: number
}

/**
 * Skeleton hand component props
 */
export interface SkeletonHandProps {
  visible: boolean
  animationProgress: number // 0 to 1
  position: Position3D
}

/**
 * Camera transition component props
 */
export interface CameraTransitionProps {
  isActive: boolean
  progress: number // 0 to 1
  targetPosition: Position3D // door position
}

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number
