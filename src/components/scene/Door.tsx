import { useState, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Group, DoubleSide } from 'three'
import { DoorProps } from '../../types'
import { TextureSet } from '../../types'
import { useCameraTransition } from '../../hooks/useCameraTransition'
import { useAudio } from '../../hooks/useAudio'

interface DoorComponentProps extends DoorProps {
  textures: TextureSet
  triggerNavigation?: () => void
}

/**
 * Interactive door component with PlaneGeometry and door textures
 * Provides hover feedback and click interaction for game navigation
 * Supports animated rotation around left edge hinge point
 * 
 * Simple self-contained animation that opens the door when clicked
 * and navigates to a game after a brief delay.
 * 
 * Accessibility features:
 * - Keyboard support (Enter/Space to trigger)
 * - ARIA labels for interaction state
 * 
 * Performance optimizations:
 * - Uses refs for direct Three.js object manipulation
 * - Smooth easing with useFrame
 */
export default function Door({ textures, onClick, knockCount = 0, isListening = false, triggerNavigation }: DoorComponentProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [knockEffect, setKnockEffect] = useState(false)
  const groupRef = useRef<Group>(null)
  const focusHelperRef = useRef<HTMLButtonElement>(null)
  const animationStartTime = useRef<number>(0)
  const closeAnimationStartTime = useRef<number>(0)
  const lastKnockCount = useRef(0)

  const { zoomIn, isAnimating: isCameraAnimating } = useCameraTransition()
  const { preloadAudio, playAudio } = useAudio()
  
  // Preload door creak sound
  useEffect(() => {
    preloadAudio('/sounds/door-creak.mp3', 0.6)
  }, [preloadAudio])
  
  // Expose door closing function globally for camera transition
  useEffect(() => {
    (window as any).closeDoor = () => {
      setIsClosing(true)
      closeAnimationStartTime.current = 0
      // Play door creak sound when closing
      playAudio('/sounds/door-creak.mp3')
    }
    
    return () => {
      delete (window as any).closeDoor
    }
  }, [playAudio])
  


  const ANIMATION_DURATION = 1.0 // seconds
  const MAX_ROTATION = Math.PI / 2 // 90 degrees

  // Handle knock effect when knockCount changes
  useEffect(() => {
    if (knockCount > lastKnockCount.current && isListening) {
      setKnockEffect(true)
      const timer = setTimeout(() => setKnockEffect(false), 200)
      lastKnockCount.current = knockCount
      return () => clearTimeout(timer)
    }
  }, [knockCount, isListening])

  // Handle door opening animation
  useFrame((state) => {
    if (!groupRef.current) return
    
    // Handle door opening
    if (isAnimating) {
      // Set start time on first frame of animation
      if (animationStartTime.current === 0) {
        animationStartTime.current = state.clock.elapsedTime
        return
      }

      const elapsed = state.clock.elapsedTime - animationStartTime.current
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1)

      // Smooth easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      // Apply rotation (opening)
      groupRef.current.rotation.y = -easedProgress * MAX_ROTATION

      // Complete animation and start camera zoom
      if (progress >= 1) {
        setIsAnimating(false)
        // Start camera zoom-in effect
        zoomIn(() => {
          // Navigate after camera zoom completes
          console.log('Camera zoom completed, triggering navigation...')
          if (triggerNavigation) {
            triggerNavigation()
          }
        })
      }
    }
    
    // Handle door closing
    if (isClosing) {
      // Set start time on first frame of closing animation
      if (closeAnimationStartTime.current === 0) {
        closeAnimationStartTime.current = state.clock.elapsedTime
        return
      }

      const elapsed = state.clock.elapsedTime - closeAnimationStartTime.current
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1)

      // Smooth easing function (ease-in)
      const easedProgress = Math.pow(progress, 2)

      // Apply rotation (closing - from open back to closed)
      groupRef.current.rotation.y = -MAX_ROTATION * (1 - easedProgress)

      // Complete closing animation
      if (progress >= 1) {
        setIsClosing(false)
        groupRef.current.rotation.y = 0 // Ensure door is fully closed
      }
    }
  })

  // Start door animation
  const startAnimation = () => {
    if (isAnimating) return // Prevent multiple animations
    setIsAnimating(true)
    // We'll set the start time in the next frame
    animationStartTime.current = 0
    // Play door creak sound when opening
    playAudio('/sounds/door-creak.mp3')
  }

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFocused) return

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleClick()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFocused, isAnimating, knockCount, onClick])

  const handleClick = () => {
    if (isAnimating || isCameraAnimating) return // Prevent clicks during animations
    
    if (knockCount >= 2) {
      // Third knock - start door animation (navigation will happen after camera zoom)
      startAnimation()
    } else {
      // First or second knock - just register the knock
      onClick()
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const getAriaLabel = () => {
    if (isAnimating) return 'Door is opening'
    if (isListening && knockCount > 0) return `Knocked ${knockCount} times, ${3 - knockCount} more needed`
    return 'Click door to knock and enter game'
  }

  // Calculate emissive effect for knocks and hover
  const getEmissiveColor = () => {
    if (knockEffect) return '#ff3300' // Bright red flash for knock
    if (isHovered || isFocused) return '#ff7d46' // Orange for hover
    if (isListening && knockCount > 0) return '#ffaa00' // Yellow glow when listening
    return '#000000' // No glow
  }

  const getEmissiveIntensity = () => {
    if (knockEffect) return 0.8 // Strong flash for knock
    if (isHovered || isFocused) return 0.3 // Medium glow for hover
    if (isListening && knockCount > 0) return 0.2 // Subtle glow when listening
    return 0 // No glow
  }


  return (
    <group
      ref={groupRef}
      position={[-1.1, 0, 0]} // Position group so left edge is at door frame'
    >
      {/* Hidden button for keyboard accessibility */}
      <Html
        position={[1.1, 1.0, 2.01]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <button
          ref={focusHelperRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={handleClick}
          aria-label={getAriaLabel()}
          disabled={isAnimating}
          style={{
            width: '100px',
            height: '100px',
            opacity: 0,
            pointerEvents: 'auto',
            zIndex: isFocused ? 1000 : -1
          }}
          tabIndex={0}
        />
      </Html>

      <mesh
        position={[1.1, 1.0, 2 + 0.01]} // Offset mesh so left edge is at group origin
        onPointerOver={() => !isAnimating && setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* <planeGeometry args={[2.2, 2.2, 100, 100]} /> */}
        <boxGeometry args={[2.2, 2.2, 0.05]} /> {/* thin door */}
        <meshStandardMaterial
          map={textures.map}
          aoMap={textures.aoMap}
          normalMap={textures.normalMap}
          roughnessMap={textures.roughnessMap}
          metalnessMap={textures.metalnessMap}
          displacementMap={textures.displacementMap}
          displacementScale={0.15}
          displacementBias={-0.04}
          alphaMap={textures.alphaMap}
          transparent
          side={DoubleSide}
          emissive={getEmissiveColor()}
          emissiveIntensity={getEmissiveIntensity()}
        />
      </mesh>


    </group>
  )
}
