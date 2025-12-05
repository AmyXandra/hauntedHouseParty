import { ReactNode } from 'react'

interface SceneProps {
  children: ReactNode
}

/**
 * Main scene container that sets up fog and background
 * Configures exponential fog for atmospheric effect
 */
export default function Scene({ children }: SceneProps) {
  return (
    <>
      {/* Exponential fog with haunted house color and density */}
      <fog attach="fog" args={['#04343f', 0.1]} />
      
      {/* Set background color to match fog */}
      <color attach="background" args={['#04343f']} />
      
      {children}
    </>
  )
}
