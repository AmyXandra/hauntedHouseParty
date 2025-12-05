import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GhostLightProps } from '../../types'

/**
 * Individual animated ghost light
 * Moves in a circular pattern using sinusoidal functions
 */
function GhostLight({ color, intensity, speed, radius, offset }: GhostLightProps) {
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (!lightRef.current) return

    const elapsedTime = state.clock.getElapsedTime()
    const angle = elapsedTime * speed + offset

    // Calculate position using sinusoidal functions
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const y = Math.sin(angle) * Math.sin(angle * 2.34) * Math.sin(angle * 3.45)

    lightRef.current.position.set(x, y, z)
  })

  return (
    <pointLight
      ref={lightRef}
      color={color}
      intensity={intensity}
      distance={10}
      decay={2}
      castShadow
      shadow-mapSize-width={256}
      shadow-mapSize-height={256}
      shadow-camera-far={10}
    />
  )
}

/**
 * GhostLights component with three animated point lights
 * Each ghost has different color, speed, and radius for variety
 */
export default function GhostLights() {
  return (
    <>
      {/* Purple ghost */}
      <GhostLight
        color="#8800ff"
        intensity={6}
        speed={0.5}
        radius={4}
        offset={0}
      />
      
      {/* Pink ghost */}
      <GhostLight
        color="#ff0088"
        intensity={6}
        speed={0.38}
        radius={5}
        offset={Math.PI * 0.5}
      />
      
      {/* Red ghost */}
      <GhostLight
        color="#ff0000"
        intensity={6}
        speed={0.23}
        radius={6}
        offset={Math.PI}
      />
    </>
  )
}
