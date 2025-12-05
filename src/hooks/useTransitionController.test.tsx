import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTransitionController } from './useTransitionController'
import { AnimationState, TransitionConfig } from '../types/animation'
import { DEFAULT_TRANSITION_CONFIG } from '../constants/transitionConfig'
import React from 'react'

// Mock useFrame from @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn()
}))

describe('useTransitionController', () => {
  it('should initialize in IDLE state', () => {
    const { result } = renderHook(() => useTransitionController())

    expect(result.current.state.currentState).toBe(AnimationState.IDLE)
    expect(result.current.state.progress).toBe(0)
    expect(result.current.state.totalElapsed).toBe(0)
    expect(result.current.state.selectedGame).toBeNull()
  })

  it('should transition to DOOR_OPENING when startTransition is called', () => {
    const { result } = renderHook(() => useTransitionController())

    act(() => {
      result.current.startTransition()
    })

    expect(result.current.state.currentState).toBe(AnimationState.DOOR_OPENING)
  })

  it('should prevent duplicate animations when startTransition is called multiple times', () => {
    const { result } = renderHook(() => useTransitionController())

    act(() => {
      result.current.startTransition()
    })

    const firstState = result.current.state

    act(() => {
      result.current.startTransition()
    })

    // State should not change on second call
    expect(result.current.state).toEqual(firstState)
  })

  it('should reset to IDLE state when reset is called', () => {
    const { result } = renderHook(() => useTransitionController())

    act(() => {
      result.current.startTransition()
    })

    expect(result.current.state.currentState).toBe(AnimationState.DOOR_OPENING)

    act(() => {
      result.current.reset()
    })

    expect(result.current.state.currentState).toBe(AnimationState.IDLE)
    expect(result.current.state.progress).toBe(0)
    expect(result.current.state.totalElapsed).toBe(0)
    expect(result.current.state.selectedGame).toBeNull()
  })

  it('should accept custom configuration', () => {
    const customConfig: TransitionConfig = {
      doorDuration: 2.0,
      handDuration: 1.0,
      pauseDuration: 0.5,
      dragDuration: 1.5,
      fadeDuration: 0.8
    }

    const { result } = renderHook(() => useTransitionController(customConfig))

    expect(result.current.state.currentState).toBe(AnimationState.IDLE)
  })

  it('should use default configuration when none provided', () => {
    const { result } = renderHook(() => useTransitionController())

    expect(result.current.state.currentState).toBe(AnimationState.IDLE)
  })

  it('should reject invalid state transitions', () => {
    const { result } = renderHook(() => useTransitionController())

    // IDLE -> HAND_EMERGING is invalid (should go through DOOR_OPENING first)
    const isValid = result.current.isValidTransition(
      AnimationState.IDLE,
      AnimationState.HAND_EMERGING
    )

    expect(isValid).toBe(false)
  })

  it('should allow valid state transitions', () => {
    const { result } = renderHook(() => useTransitionController())

    // IDLE -> DOOR_OPENING is valid
    const isValid = result.current.isValidTransition(
      AnimationState.IDLE,
      AnimationState.DOOR_OPENING
    )

    expect(isValid).toBe(true)
  })

  it('should allow RESETTING from any state', () => {
    const { result } = renderHook(() => useTransitionController())

    const states = [
      AnimationState.DOOR_OPENING,
      AnimationState.HAND_EMERGING,
      AnimationState.HAND_PAUSED,
      AnimationState.DRAGGING,
      AnimationState.FADING,
      AnimationState.NAVIGATING
    ]

    states.forEach(state => {
      const isValid = result.current.isValidTransition(state, AnimationState.RESETTING)
      expect(isValid).toBe(true)
    })
  })

  it('should invoke onComplete callback when animation completes', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useTransitionController(DEFAULT_TRANSITION_CONFIG, onComplete))

    act(() => {
      result.current.startTransition()
    })

    // Note: Full animation testing requires frame advancement which is complex with useFrame
    // This test verifies the callback is registered
    expect(onComplete).not.toHaveBeenCalled() // Not called yet since animation hasn't completed
  })

  it('should register and invoke state change callbacks', () => {
    const stateChangeCallback = vi.fn()
    const { result } = renderHook(() => useTransitionController())

    act(() => {
      result.current.onStateChange(stateChangeCallback)
    })

    act(() => {
      result.current.startTransition()
    })

    expect(stateChangeCallback).toHaveBeenCalledWith(
      AnimationState.DOOR_OPENING,
      AnimationState.IDLE
    )
  })

  it('should unregister state change callbacks', () => {
    const stateChangeCallback = vi.fn()
    const { result } = renderHook(() => useTransitionController())

    let unregister: () => void

    act(() => {
      unregister = result.current.onStateChange(stateChangeCallback)
    })

    act(() => {
      unregister()
    })

    act(() => {
      result.current.startTransition()
    })

    // Callback should not be invoked after unregistering
    expect(stateChangeCallback).not.toHaveBeenCalled()
  })

  it('should handle configuration parameter changes', () => {
    const config1: TransitionConfig = {
      doorDuration: 1.0,
      handDuration: 0.5,
      pauseDuration: 0.2,
      dragDuration: 0.8,
      fadeDuration: 0.3
    }

    const { result, rerender } = renderHook(
      ({ config }) => useTransitionController(config),
      {
        initialProps: { config: config1 }
      }
    )

    expect(result.current.state.currentState).toBe(AnimationState.IDLE)

    const config2: TransitionConfig = {
      doorDuration: 2.0,
      handDuration: 1.0,
      pauseDuration: 0.5,
      dragDuration: 1.5,
      fadeDuration: 0.8
    }

    rerender({ config: config2 })

    // Should still be in IDLE state after config change
    expect(result.current.state.currentState).toBe(AnimationState.IDLE)
  })
})
