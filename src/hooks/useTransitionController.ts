import { useState, useCallback, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AnimationState,
  TransitionConfig,
  TransitionState,
  TransitionTimeline
} from '../types/animation'
import { Game } from '../types'
import { DEFAULT_TRANSITION_CONFIG, calculateTimeline } from '../constants/transitionConfig'
import { getRandomGame } from '../data/games'

/**
 * State change callback type
 */
type StateChangeCallback = (newState: AnimationState, oldState: AnimationState) => void

/**
 * Hook for managing the door transition animation sequence
 * Implements a state machine that coordinates timing across all animation phases
 */
export function useTransitionController(
  config: TransitionConfig = DEFAULT_TRANSITION_CONFIG,
  onComplete?: (game: Game) => void
) {
  const [state, setState] = useState<TransitionState>({
    currentState: AnimationState.IDLE,
    progress: 0,
    totalElapsed: 0,
    selectedGame: null
  })

  const timelineRef = useRef<TransitionTimeline>(calculateTimeline(config))
  const stateChangeCallbacksRef = useRef<Set<StateChangeCallback>>(new Set())
  const isAnimatingRef = useRef(false)
  const startTimeRef = useRef<number>(0)

  /**
   * Register a callback to be invoked when animation state changes
   */
  const onStateChange = useCallback((callback: StateChangeCallback) => {
    stateChangeCallbacksRef.current.add(callback)
    return () => {
      stateChangeCallbacksRef.current.delete(callback)
    }
  }, [])

  /**
   * Transition to a new animation state
   */
  const transitionToState = useCallback((newState: AnimationState, elapsed: number) => {
    setState(prevState => {
      // Notify all registered callbacks
      stateChangeCallbacksRef.current.forEach(callback => {
        callback(newState, prevState.currentState)
      })

      return {
        ...prevState,
        currentState: newState,
        progress: 0,
        totalElapsed: elapsed
      }
    })
  }, [])

  /**
   * Validate if a state transition is allowed
   */
  const isValidTransition = useCallback((from: AnimationState, to: AnimationState): boolean => {
    // Define valid state transitions
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

    return validTransitions[from]?.includes(to) ?? false
  }, [])

  /**
   * Calculate progress for current animation phase
   */
  const calculateProgress = useCallback((elapsed: number, currentState: AnimationState): number => {
    const timeline = timelineRef.current

    switch (currentState) {
      case AnimationState.DOOR_OPENING: {
        const duration = timeline.doorOpen.end - timeline.doorOpen.start
        return Math.min(elapsed / duration, 1)
      }
      case AnimationState.HAND_EMERGING: {
        const phaseStart = timeline.handEmerge.start
        const duration = timeline.handEmerge.end - timeline.handEmerge.start
        return Math.min((elapsed - phaseStart) / duration, 1)
      }
      case AnimationState.HAND_PAUSED: {
        const phaseStart = timeline.handPause.start
        const duration = timeline.handPause.end - timeline.handPause.start
        return Math.min((elapsed - phaseStart) / duration, 1)
      }
      case AnimationState.DRAGGING: {
        const phaseStart = timeline.drag.start
        const duration = timeline.drag.end - timeline.drag.start
        return Math.min((elapsed - phaseStart) / duration, 1)
      }
      case AnimationState.FADING: {
        const phaseStart = timeline.fade.start
        const duration = timeline.fade.end - timeline.fade.start
        return Math.min((elapsed - phaseStart) / duration, 1)
      }
      default:
        return 0
    }
  }, [])

  /**
   * Update animation state based on elapsed time
   * Throttled to reduce unnecessary state updates and improve performance
   */
  const lastUpdateTimeRef = useRef(0)
  const UPDATE_THROTTLE = 1000 / 60 // Throttle to 60fps max

  useFrame(() => {
    if (!isAnimatingRef.current) return

    const now = performance.now()
    const elapsed = now / 1000 - startTimeRef.current
    const timeline = timelineRef.current

    // Throttle updates to reduce re-renders (except for state transitions)
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current
    const shouldUpdate = timeSinceLastUpdate >= UPDATE_THROTTLE

    setState(prevState => {
      const { currentState } = prevState
      let newState = currentState
      let progress = calculateProgress(elapsed, currentState)
      let selectedGame = prevState.selectedGame
      let hasStateTransition = false

      // State transition logic based on timeline
      if (currentState === AnimationState.DOOR_OPENING && elapsed >= timeline.handEmerge.start) {
        newState = AnimationState.HAND_EMERGING
        progress = 0
        hasStateTransition = true
        if (isValidTransition(currentState, newState)) {
          transitionToState(newState, elapsed)
        }
      } else if (currentState === AnimationState.HAND_EMERGING && elapsed >= timeline.handPause.start) {
        newState = AnimationState.HAND_PAUSED
        progress = 0
        hasStateTransition = true
        if (isValidTransition(currentState, newState)) {
          transitionToState(newState, elapsed)
        }
      } else if (currentState === AnimationState.HAND_PAUSED && elapsed >= timeline.drag.start) {
        newState = AnimationState.DRAGGING
        progress = 0
        hasStateTransition = true
        // Select game when entering DRAGGING state
        selectedGame = getRandomGame()
        if (isValidTransition(currentState, newState)) {
          transitionToState(newState, elapsed)
        }
      } else if (currentState === AnimationState.DRAGGING && elapsed >= timeline.fade.start && newState !== AnimationState.FADING) {
        newState = AnimationState.FADING
        progress = 0
        hasStateTransition = true
        if (isValidTransition(currentState, newState)) {
          transitionToState(newState, elapsed)
        }
      } else if (currentState === AnimationState.FADING && elapsed >= timeline.navigate.start) {
        newState = AnimationState.NAVIGATING
        progress = 1
        hasStateTransition = true
        isAnimatingRef.current = false
        if (isValidTransition(currentState, newState)) {
          transitionToState(newState, elapsed)
          // Invoke completion callback
          if (onComplete && selectedGame) {
            onComplete(selectedGame)
          }
        }
      }

      // Only update state if there's a transition or enough time has passed
      if (hasStateTransition || shouldUpdate) {
        if (shouldUpdate) {
          lastUpdateTimeRef.current = now
        }
        return {
          currentState: newState,
          progress,
          totalElapsed: elapsed,
          selectedGame
        }
      }

      // Return previous state to avoid unnecessary re-renders
      return prevState
    })
  })

  /**
   * Start the transition sequence
   */
  const startTransition = useCallback(() => {
    if (isAnimatingRef.current) return // Prevent duplicate animations

    isAnimatingRef.current = true
    startTimeRef.current = performance.now() / 1000
    timelineRef.current = calculateTimeline(config)

    transitionToState(AnimationState.DOOR_OPENING, 0)
  }, [config, transitionToState])

  /**
   * Reset the animation to idle state
   */
  const reset = useCallback(() => {
    isAnimatingRef.current = false
    startTimeRef.current = 0

    setState({
      currentState: AnimationState.IDLE,
      progress: 0,
      totalElapsed: 0,
      selectedGame: null
    })

    // Notify callbacks about reset
    stateChangeCallbacksRef.current.forEach(callback => {
      callback(AnimationState.IDLE, state.currentState)
    })
  }, [state.currentState])

  return {
    state,
    startTransition,
    reset,
    onStateChange,
    isValidTransition
  }
}
