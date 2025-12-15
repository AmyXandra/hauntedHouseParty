import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

const HERO_BASE_Y = 0.5
const HERO_Z_POSITION = 7  // Position hero in front of camera (camera at z=15)
const BASE_ROTATION_Y = -Math.PI

interface HeroCharacterProps {
  currentLane: number
  bounceValue: number
  scale?: number
  isHit?: boolean // New prop to indicate when hero is hit
}

export default function HeroCharacter({
  currentLane,
  bounceValue,
  scale = 0.7,
  isHit = false
}: HeroCharacterProps) {
  const group = useRef<THREE.Group>(null)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [hitAnimationActive, setHitAnimationActive] = useState(false)
  const targetX = currentLane
  const isJumping = bounceValue > 0.1
  const isRunning = !isHit && !hitAnimationActive // Stop running when hit

  const { scene, animations } = useGLTF('/models/box_boy.glb')
  const { actions, names } = useAnimations(animations, group)


  useEffect(() => {
    if (animations && animations.length > 0) {
      setModelLoaded(true)
      // Play the first animation by default
      if (names.length > 0 && actions[names[2]]) {
        actions[names[2]]?.reset().play()
      }
    } else {
      setModelLoaded(true)
    }
  }, [animations, names, actions])

  // Handle hit animation timing
  useEffect(() => {
    if (!isHit) return

    setHitAnimationActive(true)

    const timer = setTimeout(() => {
      setHitAnimationActive(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [isHit])

  const currentAction = useRef<THREE.AnimationAction | null>(null)
  // Handle animation switching based on character state
  useEffect(() => {
    if (!modelLoaded) return

    const run = actions['Controls|RunCycle']
    const jump = actions['Controls|JumpCycle']

    let next: THREE.AnimationAction | null = null

    if (hitAnimationActive) {
      next = null
    } else if (isJumping && jump) {
      next = jump
    } else if (run) {
      next = run
    }

    if (next && currentAction.current !== next) {
      currentAction.current?.fadeOut(0.2)
      next.reset().fadeIn(0.2).play()
      currentAction.current = next
    }
  }, [hitAnimationActive, isJumping, modelLoaded, actions])
  
  // useEffect(() => {
  //   if (!modelLoaded || !actions) return

  //   // Use specific animation names from box_boy.glb
  //   const runCycleAnimation = 'Controls|RunCycle'
  //   const jumpCycleAnimation = 'Controls|JumpCycle'
  //   const normalWalkAnimation = 'Controls|NormalWalk'

  //   // Stop all current animations
  //   // Object.values(actions).forEach(action => action?.stop())

  //   // Play appropriate animation based on state
  //   if (hitAnimationActive) {
  //     // Stop animation when hit (pause for impact effect)
  //     // No animation plays during hit state
  //   } else if (isJumping && actions[jumpCycleAnimation]) {
  //     // Play jump animation when jumping
  //     actions[jumpCycleAnimation]?.reset().play()
  //   } else if (actions[runCycleAnimation]) {
  //     // Always use RunCycle for normal running
  //     actions[runCycleAnimation]?.reset().play()
  //   } else if (actions[normalWalkAnimation]) {
  //     // Fallback to walk animation if RunCycle not available
  //     actions[normalWalkAnimation]?.reset().play()
  //   } else if (names.length > 0 && actions[names[0]]) {
  //     // Final fallback to first available animation
  //     actions[names[0]]?.reset().play()
  //   }
  // }, [isRunning, isJumping, hitAnimationActive, modelLoaded, actions, names])

  // Animation loop for movement and positioning
  
  
  useFrame((state, delta) => {
    if (!group.current) return

    // Debug: Log position changes
    const oldX = group.current.position.x

    // Smooth lane switching (same as original Hero component)
    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      targetX,
      delta * 8
    )

    // // Debug: Log when position changes
    // if (Math.abs(oldX - group.current.position.x) > 0.01) {
    //   console.log(`🏃 Hero moving: currentLane=${currentLane}, targetX=${targetX}, oldX=${oldX.toFixed(2)}, newX=${group.current.position.x.toFixed(2)}`)
    // }

    // Apply bounce/jump from game state
    group.current.position.y = HERO_BASE_Y + bounceValue

    // Set Z position to match original Hero
    group.current.position.z = HERO_Z_POSITION

    // Add subtle running animation rotation
    // if (isRunning && !isJumping) {
    //   group.current.rotation.y = Math.sin(state.clock.elapsedTime * 6) * 0.05
    // }
    if (isRunning && !isJumping) {
      group.current.rotation.y =
        BASE_ROTATION_Y + Math.sin(state.clock.elapsedTime * 6) * 0.05
    } else {
      group.current.rotation.y = BASE_ROTATION_Y
    }
  })

  return (
    <group ref={group} scale={scale}>
      {/* Character model - facing the camera (front to camera) */}
      <primitive
        // object={scene.clone()} //Don't use cloned scene for animations
        object={scene}
        castShadow
        receiveShadow
      />
    </group>
  )
}

// Export constants for compatibility
export { HERO_BASE_Y, HERO_Z_POSITION }

// OPTIMIZATION: Load on-demand instead of preloading
// useGLTF.preload('/models/boy3.glb')