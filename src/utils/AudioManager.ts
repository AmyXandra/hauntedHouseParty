import * as THREE from 'three'

export interface TransitionSounds {
  doorCreak: string
  boneRattle: string
  whoosh: string
}

export interface Position3D {
  x: number
  y: number
  z: number
}

export class AudioManager {
  private sounds: Map<string, THREE.PositionalAudio>
  private listener: THREE.AudioListener
  private audioLoader: THREE.AudioLoader
  private isAvailable: boolean
  private fadeIntervals: Map<string, ReturnType<typeof setTimeout>>

  constructor(camera: THREE.Camera) {
    this.sounds = new Map()
    this.fadeIntervals = new Map()
    this.audioLoader = new THREE.AudioLoader()
    this.isAvailable = this.checkWebAudioAvailability()

    if (this.isAvailable) {
      this.listener = new THREE.AudioListener()
      camera.add(this.listener)
    } else {
      // Create a dummy listener for fallback
      this.listener = null as any
      console.warn('Web Audio API is not available. Audio will be disabled.')
    }
  }

  private checkWebAudioAvailability(): boolean {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      return !!AudioContext
    } catch (e) {
      return false
    }
  }

  async loadSounds(sounds: TransitionSounds): Promise<void> {
    if (!this.isAvailable) {
      console.warn('Web Audio API unavailable. Skipping sound loading.')
      return
    }

    const loadPromises = Object.entries(sounds).map(([name, path]) =>
      this.loadSound(name, path)
    )

    try {
      await Promise.all(loadPromises)
    } catch (error) {
      console.error('Error loading sounds:', error)
    }
  }

  private loadSound(name: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sound = new THREE.PositionalAudio(this.listener)

      this.audioLoader.load(
        path,
        (buffer) => {
          sound.setBuffer(buffer)
          sound.setRefDistance(5)
          sound.setLoop(false)
          this.sounds.set(name, sound)
          resolve()
        },
        undefined,
        (error) => {
          console.error(`Failed to load sound: ${name}`, error)
          reject(error)
        }
      )
    })
  }

  play(soundName: string, position?: Position3D): void {
    if (!this.isAvailable) {
      return
    }

    const sound = this.sounds.get(soundName)
    if (!sound) {
      console.warn(`Sound not found: ${soundName}`)
      return
    }

    // Stop any ongoing fade for this sound
    this.clearFade(soundName)

    // Set position if provided
    if (position) {
      sound.position.set(position.x, position.y, position.z)
    }

    // Reset volume to full
    sound.setVolume(1)

    // Stop if already playing and restart
    if (sound.isPlaying) {
      sound.stop()
    }

    sound.play()
  }

  stop(soundName: string): void {
    if (!this.isAvailable) {
      return
    }

    const sound = this.sounds.get(soundName)
    if (!sound) {
      console.warn(`Sound not found: ${soundName}`)
      return
    }

    this.clearFade(soundName)

    if (sound.isPlaying) {
      sound.stop()
    }
  }

  fadeOut(soundName: string, duration: number): void {
    if (!this.isAvailable) {
      return
    }

    const sound = this.sounds.get(soundName)
    if (!sound || !sound.isPlaying) {
      return
    }

    this.clearFade(soundName)

    const startVolume = sound.getVolume()
    const startTime = Date.now()
    const fadeSteps = 60 // 60 steps for smooth fade

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const newVolume = startVolume * (1 - progress)

      sound.setVolume(newVolume)

      if (progress >= 1) {
        sound.stop()
        this.clearFade(soundName)
      }
    }, duration / fadeSteps)

    this.fadeIntervals.set(soundName, interval)
  }

  private clearFade(soundName: string): void {
    const interval = this.fadeIntervals.get(soundName)
    if (interval) {
      clearInterval(interval)
      this.fadeIntervals.delete(soundName)
    }
  }

  dispose(): void {
    // Clear all fade intervals
    this.fadeIntervals.forEach((interval) => clearInterval(interval))
    this.fadeIntervals.clear()

    // Stop and disconnect all sounds
    this.sounds.forEach((sound) => {
      if (sound.isPlaying) {
        sound.stop()
      }
      sound.disconnect()
    })

    this.sounds.clear()

    // Remove listener from camera
    if (this.listener && this.listener.parent) {
      this.listener.parent.remove(this.listener)
    }
  }

  getSound(soundName: string): THREE.PositionalAudio | undefined {
    return this.sounds.get(soundName)
  }

  isAudioAvailable(): boolean {
    return this.isAvailable
  }
}
