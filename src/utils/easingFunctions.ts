import { EasingFunction } from '../types/animation'

/**
 * Ease-in-out cubic easing function
 * Provides smooth acceleration and deceleration
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export const easeInOutCubic: EasingFunction = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Ease-in cubic easing function
 * Provides smooth acceleration from zero velocity
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export const easeInCubic: EasingFunction = (t: number): number => {
  return t * t * t
}

/**
 * Ease-out cubic easing function
 * Provides smooth deceleration to zero velocity
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export const easeOutCubic: EasingFunction = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Linear easing function (no easing)
 * @param t - Progress value between 0 and 1
 * @returns Same value (linear)
 */
export const linear: EasingFunction = (t: number): number => {
  return t
}

/**
 * Collection of all easing functions
 */
export const easings = {
  easeInOutCubic,
  easeInCubic,
  easeOutCubic,
  linear
}
