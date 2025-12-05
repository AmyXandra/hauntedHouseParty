import * as THREE from 'three'

export interface Pumpkin {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  isHalo: boolean
  sliced: boolean
  sliceTime: number
}

export interface Bat {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  lifetime: number
}

export interface Bomb {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  lifetime: number
}

export interface Particle {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  lifetime: number
  color: string
}

export interface ScorePopup {
  id: string
  position: THREE.Vector3
  score: number
  lifetime: number
}

export interface GameState {
  score: number
  lives: number
  round: number
  gameStatus: 'menu' | 'playing' | 'gameover' | 'roundComplete'
  pumpkins: Pumpkin[]
  bats: Bat[]
  bombs: Bomb[]
  particles: Particle[]
  scorePopups: ScorePopup[]
  pumpkinsSlicedThisRound: number
  totalPumpkinsThisRound: number
}