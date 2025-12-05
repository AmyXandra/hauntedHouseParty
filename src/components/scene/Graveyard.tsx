import { useMemo } from 'react'
import { GraveyardProps, Position3D, Rotation3D } from '../../types'
import { useTextures } from '../../hooks/useTextures'
import Grave from './Grave'

interface GraveData {
  position: Position3D
  rotation: Rotation3D
}

/**
 * Graveyard component that procedurally generates graves
 * Uses circular distribution pattern with random angles and radii
 */
export default function Graveyard({ count }: GraveyardProps) {
  const { graveTextures } = useTextures()

  // Generate grave positions and rotations using circular distribution
  const graves = useMemo(() => {
    const graveData: GraveData[] = []

    for (let i = 0; i < count; i++) {
      // Random angle for circular distribution
      const angle = Math.random() * Math.PI * 2

      // Random radius between 3 and 7 units from center
      const radius = 3 + Math.random() * 4

      // Calculate x and z positions using polar coordinates
      const x = Math.sin(angle) * radius
      const z = Math.cos(angle) * radius

      // Slight y-position variation for natural look
      const y = Math.random() * 0.4

      // Random rotation around y-axis
      const rotationY = (Math.random() - 0.5) * 0.4

      graveData.push({
        position: [x, y, z],
        rotation: [0, rotationY, 0],
      })
    }

    return graveData
  }, [count])

  return (
    <group>
      {graves.map((grave, index) => (
        <Grave
          key={index}
          position={grave.position}
          rotation={grave.rotation}
          textures={graveTextures}
        />
      ))}
    </group>
  )
}
