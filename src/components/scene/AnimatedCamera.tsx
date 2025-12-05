import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { updateAnimationPhase, updateAnimationProgress, completeIntroAnimation } from '../../store/slices/introSlice'

// Animation timing constants
const TITLE_FADE_DURATION = 1.5 // seconds
const ZOOM_DURATION = 3.0 // seconds
const TOTAL_ANIMATION_DURATION = TITLE_FADE_DURATION + ZOOM_DURATION

// Camera positions
const INITIAL_CAMERA_POSITION = new THREE.Vector3(12, 8, 15) // Zoomed out
const FINAL_CAMERA_POSITION = new THREE.Vector3(4, 2, 5) // Normal game position

/**
 * Animated camera component that handles the intro zoom animation
 */
export default function AnimatedCamera() {
  const { camera } = useThree()
  const dispatch = useAppDispatch()
  const { isAnimating, animationPhase } = useAppSelector(state => state.intro)
  
  const startTimeRef = useRef<number | null>(null)
  const initialPositionRef = useRef<THREE.Vector3>(INITIAL_CAMERA_POSITION.clone())
  const finalPositionRef = useRef<THREE.Vector3>(FINAL_CAMERA_POSITION.clone())
  
  // Set initial camera position when animation starts
  useEffect(() => {
    if (isAnimating && animationPhase === 'title-fade-in' && startTimeRef.current === null) {
      camera.position.copy(initialPositionRef.current)
      camera.lookAt(0, 0, 0) // Look at the house
      startTimeRef.current = null // Will be set in useFrame
    }
  }, [isAnimating, animationPhase, camera])
  
  // Animation loop
  useFrame((state) => {
    if (!isAnimating) return
    
    // Initialize start time on first frame
    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime
      return
    }
    
    const elapsed = state.clock.elapsedTime - startTimeRef.current
    const progress = Math.min(elapsed / TOTAL_ANIMATION_DURATION, 1)
    
    // Update global animation progress
    dispatch(updateAnimationProgress(progress))
    
    // Phase transitions
    if (animationPhase === 'title-fade-in' && elapsed > TITLE_FADE_DURATION) {
      dispatch(updateAnimationPhase('zooming'))
    }
    
    // Camera zoom animation (starts after title fade)
    if (animationPhase === 'zooming') {
      const zoomStartTime = TITLE_FADE_DURATION
      const zoomElapsed = elapsed - zoomStartTime
      const zoomProgress = Math.min(zoomElapsed / ZOOM_DURATION, 1)
      
      // Smooth easing function (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - zoomProgress, 3)
      
      // Interpolate camera position
      camera.position.lerpVectors(
        initialPositionRef.current,
        finalPositionRef.current,
        easedProgress
      )
      
      // Keep looking at the house center
      camera.lookAt(0, 1, 0)
    }
    
    // Complete animation
    if (progress >= 1 && animationPhase !== 'complete') {
      camera.position.copy(finalPositionRef.current)
      camera.lookAt(0, 1, 0)
      dispatch(completeIntroAnimation())
      startTimeRef.current = null
    }
  })
  
  return null // This component doesn't render anything
}

export { INITIAL_CAMERA_POSITION, FINAL_CAMERA_POSITION }