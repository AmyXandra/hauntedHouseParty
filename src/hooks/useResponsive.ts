import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * Custom hook to handle responsive behavior for the 3D scene
 * Updates camera aspect ratio and renderer size on window resize
 * Ensures pixel ratio is capped at 2 for performance
 */
export function useResponsive() {
  const { camera, gl, size } = useThree()

  useEffect(() => {
    const handleResize = () => {
      // Update camera aspect ratio to match new window dimensions
      if ('aspect' in camera) {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
      }

      // Update renderer size
      gl.setSize(window.innerWidth, window.innerHeight)

      // Cap pixel ratio at min(devicePixelRatio, 2) for performance
      const pixelRatio = Math.min(window.devicePixelRatio, 2)
      gl.setPixelRatio(pixelRatio)
    }

    // Add resize listener
    window.addEventListener('resize', handleResize)

    // Initial setup to ensure correct pixel ratio
    const pixelRatio = Math.min(window.devicePixelRatio, 2)
    gl.setPixelRatio(pixelRatio)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [camera, gl, size])
}
