import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CameraTransitionProps } from '../../types/animation'
import { easeInCubic } from '../../utils/easingFunctions'

/**
 * CameraTransition component handles the camera movement during the drag phase
 * of the door transition sequence. It interpolates the camera position toward
 * the door and applies a slight downward rotation for a "being pulled" effect.
 * 
 * @param isActive - Whether the camera transition is currently active
 * @param progress - Animation progress from 0 to 1
 * @param targetPosition - The door position to move toward
 */
export default function CameraTransition({
  isActive,
  progress,
  targetPosition
}: CameraTransitionProps) {
  const { camera } = useThree()
  const initialPositionRef = useRef<THREE.Vector3 | null>(null)
  const initialRotationRef = useRef<THREE.Euler | null>(null)

  // Store initial camera position and rotation when transition becomes active
  useEffect(() => {
    if (isActive && !initialPositionRef.current) {
      initialPositionRef.current = camera.position.clone()
      initialRotationRef.current = camera.rotation.clone()
    }
  }, [isActive, camera])

  // Reset camera to initial position when transition is no longer active
  useEffect(() => {
    if (!isActive && initialPositionRef.current && initialRotationRef.current) {
      camera.position.copy(initialPositionRef.current)
      camera.rotation.copy(initialRotationRef.current)
      initialPositionRef.current = null
      initialRotationRef.current = null
    }
  }, [isActive, camera])

  // Animate camera position and rotation each frame
  useFrame(() => {
    if (!isActive || !initialPositionRef.current || !initialRotationRef.current) {
      return
    }

    // Apply ease-in easing for acceleration effect
    const easedProgress = easeInCubic(progress)

    // Interpolate camera position toward door
    const startPos = initialPositionRef.current
    const targetPos = new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z)
    
    camera.position.x = THREE.MathUtils.lerp(startPos.x, targetPos.x, easedProgress)
    camera.position.y = THREE.MathUtils.lerp(startPos.y, targetPos.y - 0.5, easedProgress) // Slight downward movement
    camera.position.z = THREE.MathUtils.lerp(startPos.z, targetPos.z, easedProgress)

    // Apply slight downward rotation for "being pulled" effect
    const startRotation = initialRotationRef.current
    const targetRotationX = startRotation.x + 0.2 // Look down slightly (radians)
    
    camera.rotation.x = THREE.MathUtils.lerp(startRotation.x, targetRotationX, easedProgress)
  })

  return null // This component doesn't render anything visible
}
