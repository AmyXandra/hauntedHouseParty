import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

const HERO_BASE_Y = 0.5
const HERO_Z_POSITION = 8  // Position hero in front of camera (camera at z=18)

interface HeroCharacterProps {
  currentLane: number
  bounceValue: number
  scale?: number
}

export default function HeroCharacter({
  currentLane,
  bounceValue,
  scale = 0.8  // Adjusted for boy3 model
}: HeroCharacterProps) {
  const group = useRef<THREE.Group>(null)
  const [modelLoaded, setModelLoaded] = useState(false)
  const targetX = currentLane
  const isJumping = bounceValue > 0.1
  const isRunning = true // Always running in endless runner

  try {
    const { scene, animations } = useGLTF('/models/boy3.glb')
    const { actions, names } = useAnimations(animations, group)

    useEffect(() => {
      if (animations && animations.length > 0) {
        console.log('🎬 Boy3 character animations available:')
        animations.forEach((clip, index) => {
          console.log(`  ${index + 1}. "${clip.name}" - ${clip.duration.toFixed(2)}s`)
        })
        setModelLoaded(true)

        // Play the first animation by default (likely idle or run)
        if (names.length > 0 && actions[names[0]]) {
          console.log(`🏃 Playing default animation: ${names[0]}`)
          actions[names[0]]?.reset().play()
        }
      } else {
        console.log('📝 Boy3 is a static model (no animations)')
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
        console.log(`🦘 Boy3 jumping: ${jumpAnimation}`)
        actions[jumpAnimation]?.reset().play()
      } else if (isRunning && runAnimation && actions[runAnimation]) {
        console.log(`🏃 Boy3 running: ${runAnimation}`)
        actions[runAnimation]?.reset().play()
      } else if (idleAnimation && actions[idleAnimation]) {
        console.log(`🧍 Boy3 idle: ${idleAnimation}`)
        actions[idleAnimation]?.reset().play()
      } else if (names.length > 0 && actions[names[0]]) {
        // Fallback to first available animation
        console.log(`🎭 Boy3 fallback animation: ${names[0]}`)
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

        {/* Debug info - small indicator */}
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial
            color={modelLoaded ? 'green' : 'red'}
            emissive={modelLoaded ? 'green' : 'red'}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    )

  } catch (error) {
    console.error('❌ Failed to load boy3.glb hero character:', error)

    // Fallback character (simple capsule) - matches original Hero component
    return (
      <group ref={group} scale={scale}>
        <mesh position={[0, HERO_BASE_Y, HERO_Z_POSITION]} castShadow>
          <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
        </mesh>

        {/* Error indicator */}
        <mesh position={[0, 2.5, HERO_Z_POSITION]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
        </mesh>
      </group>
    )
  }
}

// Export constants for compatibility
export { HERO_BASE_Y, HERO_Z_POSITION }

// Preload the model for better performance
useGLTF.preload('/models/boy3.glb')