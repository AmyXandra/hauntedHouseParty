import GhostLights from './GhostLights'

/**
 * Lights component container
 * Manages all light sources in the haunted house scene
 * Includes ambient light, directional light with shadows, door point light, and animated ghost lights
 */
export default function Lights() {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight color="#86cdff" intensity={0.275} />
      
      {/* Directional light with shadows - main light source */}
      <directionalLight
        color="#86cdff"
        intensity={1}
        position={[3, 2, -8]}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
        shadow-camera-top={8}
        shadow-camera-right={8}
        shadow-camera-bottom={-8}
        shadow-camera-left={-8}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
      
      {/* Door point light - warm glow at the entrance */}
      <pointLight
        color="#ff7d46"
        intensity={5}
        position={[0, 2.2, 2.5]}
        distance={7}
        decay={2}
      />
      
      {/* Animated ghost lights */}
      <GhostLights />
    </>
  )
}
