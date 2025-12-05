import { HouseProps } from '../../types'
import { useTextures } from '../../hooks/useTextures'
import Walls from './Walls'
import Roof from './Roof'
import Bushes from './Bushes'
import Door from './Door'
import InnerDoor from './InnerDoor'

/**
 * House component that groups walls, roof, door, and bushes
 * Container for the main haunted house structure
 */
export default function House({ onDoorClick, knockCount = 0, isListening = false, triggerNavigation }: HouseProps & { triggerNavigation?: () => void }) {
  const { wallTextures, roofTextures, bushTextures, doorTextures } =
    useTextures()

  return (
    <group>
      <Walls textures={wallTextures} />
      <Roof textures={roofTextures} />
      <Door 
        textures={doorTextures} 
        onClick={onDoorClick}
        knockCount={knockCount}
        isListening={isListening}
        triggerNavigation={triggerNavigation}
      />
      <InnerDoor/>
      <Bushes textures={bushTextures} />
    </group>
  )
}
