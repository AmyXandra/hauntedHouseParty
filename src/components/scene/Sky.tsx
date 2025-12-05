import { Sky as DreiSky } from '@react-three/drei'

/**
 * Sky component wrapper for atmospheric effects
 * Configures sky uniforms for haunted house ambiance
 */
export default function Sky() {
  return (
    <DreiSky
      turbidity={10}
      rayleigh={3}
      mieCoefficient={0.005}
      mieDirectionalG={0.95}
      sunPosition={[0.3, -0.038, -0.95]}
    />
  )
}
