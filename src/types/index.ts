import { ComponentType } from 'react'
import * as THREE from 'three'

// 3D position and rotation types
export type Position3D = [number, number, number]
export type Rotation3D = [number, number, number]

// Texture configuration
export interface TextureConfig {
  path: string
  repeat?: [number, number]
  wrapS?: number
  wrapT?: number
  colorSpace?: string
}

// Texture set for materials
export interface TextureSet {
  map?: THREE.Texture
  normalMap?: THREE.Texture
  aoMap?: THREE.Texture
  roughnessMap?: THREE.Texture
  metalnessMap?: THREE.Texture
  displacementMap?: THREE.Texture
  alphaMap?: THREE.Texture
}

// Component prop interfaces
export interface GameProps {
  onBack: () => void
}

export interface GhostLightProps {
  color: string
  intensity: number
  speed: number
  radius: number
  offset: number
}

export interface HouseProps {
  onDoorClick: () => void
  knockCount?: number
  isListening?: boolean
}

export interface DoorProps {
  onClick: () => void
  knockCount?: number
  isListening?: boolean
}

export interface BushProps {
  position: Position3D
  scale: number
  rotation: Rotation3D
}

export interface GraveyardProps {
  count: number
}

export interface GraveProps {
  position: Position3D
  rotation: Rotation3D
}

export interface BackButtonProps {
  onClick: () => void
}

// Game model
export interface Game {
  id: string
  name: string
  component: ComponentType<GameProps>
}

// Re-export animation types
export * from './animation'
