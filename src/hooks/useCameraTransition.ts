import { useRef, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useAudio } from './useAudio'

interface CameraTransitionState {
  isAnimating: boolean
  startPosition: Vector3
  targetPosition: Vector3
  startTarget: Vector3
  endTarget: Vector3
  startTime: number
  duration: number
  type: 'zoomIn' | 'zoomOut'
  onComplete?: () => void
}

/**
 * Custom hook for smooth camera position transitions
 * Handles the "sucked into game" and "zoom out" effects
 */
export function useCameraTransition() {
  const { camera } = useThree()
  const transitionState = useRef<CameraTransitionState | null>(null)
  const { preloadAudio, playAudio } = useAudio()
  
  // Preload whoosh sound
  useEffect(() => {
    preloadAudio('/sounds/whoosh.mp3', 0.7)
  }, [preloadAudio])
  
  // Single animation loop that handles both timing and animation
  useFrame((state) => {
    if (!transitionState.current?.isAnimating) return
    
    // Set start time on first frame
    if (transitionState.current.startTime === 0) {
      transitionState.current.startTime = state.clock.elapsedTime
      console.log(`Starting ${transitionState.current.type} animation at time:`, state.clock.elapsedTime)
      return
    }
    
    const { startPosition, targetPosition, startTarget, endTarget, startTime, duration, type, onComplete } = transitionState.current
    const elapsed = state.clock.elapsedTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Debug logging
    if (Math.floor(elapsed * 10) % 10 === 0) { // Log every 0.1 seconds
      console.log(`${type} progress: ${(progress * 100).toFixed(1)}% (${elapsed.toFixed(1)}s / ${duration}s)`)
    }
    
    // Linear easing for now to debug timing
    const easedProgress = progress
    
    // Interpolate camera position and target
    const currentPosition = new Vector3()
    const currentTarget = new Vector3()
    
    currentPosition.lerpVectors(startPosition, targetPosition, easedProgress)
    currentTarget.lerpVectors(startTarget, endTarget, easedProgress)
    
    // Update camera
    camera.position.copy(currentPosition)
    camera.lookAt(currentTarget)
    
    // Complete animation
    if (progress >= 1) {
      console.log(`${type} animation completed after ${elapsed.toFixed(2)}s`)
      transitionState.current.isAnimating = false
      onComplete?.()
    }
  })
  
  // Start zoom-in animation (sucked into game)
  const zoomIn = useCallback((onComplete?: () => void) => {
    const startPosition = camera.position.clone() // Use current camera position
    const targetPosition = new Vector3(0, 1.0, 1.51) // Center of the InnerDoor dark room
    const startTarget = new Vector3(0, 0, 0) // Current look-at target (house center)
    const endTarget = new Vector3(0, 1.0, 2.0) // Look slightly forward in dark room
    
    console.log('Starting zoom-in animation from current position')
    console.log('Current camera position:', startPosition)
    console.log('Target position (inside dark room):', targetPosition)
    
    // Play whoosh sound for the zoom effect
    playAudio('/sounds/whoosh.mp3')
    
    transitionState.current = {
      isAnimating: true,
      startPosition,
      targetPosition,
      startTarget,
      endTarget,
      startTime: 0, // Will be set on first frame
      duration: 4.0, // Longer duration for testing
      type: 'zoomIn',
      onComplete
    }
  }, [camera, playAudio])
  
  // Start zoom-out animation (returning from game)
  const zoomOut = useCallback((onComplete?: () => void) => {
    const startPosition = new Vector3(0, 1.0, 1.51) // Start from center of InnerDoor dark room
    const targetPosition = new Vector3(4, 4, 8) // Normal viewing distance
    const startTarget = new Vector3(0, 1.0, 1.51) // Looking at center of dark room
    const endTarget = new Vector3(0, 0, 0) // Back to house center
    
    console.log('Starting zoom-out animation')
    
    // Set camera to close position first
    camera.position.copy(startPosition)
    camera.lookAt(startTarget)
    
    // Trigger door closing animation
    if ((window as any).closeDoor) {
      (window as any).closeDoor()
    }
    
    transitionState.current = {
      isAnimating: true,
      startPosition,
      targetPosition,
      startTarget,
      endTarget,
      startTime: 0, // Will be set on first frame
      duration: 3.0, // Longer, more relaxed exit
      type: 'zoomOut',
      onComplete
    }
  }, [camera])
  
  return {
    zoomIn,
    zoomOut,
    isAnimating: transitionState.current?.isAnimating ?? false
  }
}