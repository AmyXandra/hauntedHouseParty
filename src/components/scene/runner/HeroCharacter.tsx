import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

const HERO_BASE_Y = 0.5
const HERO_Z_POSITION = 5  // Position hero in front of camera (camera at z=15)

interface HeroCharacterProps {
  currentLane: number
  bounceValue: number
  scale?: number
}

export default function HeroCharacter({
  currentLane,
  bounceValue,
  scale = 2.0 // Normal scale for boy_jogging model
}: HeroCharacterProps) {
  const group = useRef<THREE.Group>(null)
  const [modelLoaded, setModelLoaded] = useState(false)
  const targetX = currentLane
  const isJumping = bounceValue > 0.1
  const isRunning = true // Always running in endless runner

  const { scene, animations } = useGLTF('/models/boy3.glb')
  const { actions, names } = useAnimations(animations, group)


    useEffect(() => {
      if (animations && animations.length > 0) {
        setModelLoaded(true)
        // Play the first animation by default
        if (names.length > 0 && actions[names[0]]) {
          actions[names[0]]?.reset().play()
        }
      } else {
        setModelLoaded(true)
      }
    }, [animations, names, actions])

    // Handle animation switching based on character state
    useEffect(() => {
      if (!modelLoaded || !actions) return

      // Find appropriate animations
      const runAnimation = names.find(name =>
        name.toLowerCase().includes('run') ||
        name.toLowerCase().includes('walk') ||
        name.toLowerCase().includes('jog')
      )

      const idleAnimation = names.find(name =>
        name.toLowerCase().includes('idle') ||
        name.toLowerCase().includes('stand')
      )

      const jumpAnimation = names.find(name =>
        name.toLowerCase().includes('jump') ||
        name.toLowerCase().includes('leap')
      )

      // Stop all current animations
      Object.values(actions).forEach(action => action?.stop())

      // Play appropriate animation
      if (isJumping && jumpAnimation && actions[jumpAnimation]) {
        actions[jumpAnimation]?.reset().play()
      } else if (isRunning && runAnimation && actions[runAnimation]) {
        actions[runAnimation]?.reset().play()
      } else if (idleAnimation && actions[idleAnimation]) {
        actions[idleAnimation]?.reset().play()
      } else if (names.length > 0 && actions[names[0]]) {
        // Fallback to first available animation
        actions[names[0]]?.reset().play()
      }
    }, [isRunning, isJumping, modelLoaded, actions, names])

    // Animation loop for movement and positioning
    useFrame((state, delta) => {
      if (!group.current) return

      // Smooth lane switching (same as original Hero component)
      group.current.position.x = THREE.MathUtils.lerp(
        group.current.position.x,
        targetX,
        delta * 8
      )

      // Apply bounce/jump from game state
      group.current.position.y = HERO_BASE_Y + bounceValue

      // Set Z position to match original Hero
      group.current.position.z = HERO_Z_POSITION



      // Add subtle running animation rotation
      if (isRunning && !isJumping) {
        group.current.rotation.y = Math.sin(state.clock.elapsedTime * 6) * 0.05
      }
    })

  return (
    <group ref={group} scale={scale}>
      {/* Character model - rotated to face running direction */}
      <primitive
        object={scene.clone()}
        rotation={[0, Math.PI, 0]} // Face forward along the running path
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