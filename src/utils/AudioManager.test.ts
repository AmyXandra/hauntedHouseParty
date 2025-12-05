import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as THREE from 'three'
import { AudioManager } from './AudioManager'

describe('AudioManager', () => {
  let camera: THREE.Camera
  let audioManager: AudioManager
  let mockAudioContext: any

  beforeEach(() => {
    camera = new THREE.PerspectiveCamera()
    
    // Create a more complete mock AudioContext
    const mockGainNode = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: { 
        value: 1,
        setTargetAtTime: vi.fn(),
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    }

    mockAudioContext = {
      createGain: vi.fn(() => mockGainNode),
      createBufferSource: vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        buffer: null,
      })),
      createPanner: vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        setPosition: vi.fn(),
        positionX: { value: 0 },
        positionY: { value: 0 },
        positionZ: { value: 0 },
      })),
      destination: {},
      state: 'running',
      sampleRate: 44100,
      currentTime: 0,
    }
    
    // Mock AudioContext availability
    globalThis.AudioContext = vi.fn().mockImplementation(() => mockAudioContext) as any
  })

  afterEach(() => {
    if (audioManager) {
      audioManager.dispose()
    }
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should create AudioManager with camera', () => {
      audioManager = new AudioManager(camera)
      expect(audioManager).toBeDefined()
      expect(audioManager.isAudioAvailable()).toBe(true)
    })

    it('should handle Web Audio API unavailability', () => {
      // Remove AudioContext to simulate unavailability
      const originalAudioContext = globalThis.AudioContext
      delete (globalThis as any).AudioContext
      delete (globalThis as any).webkitAudioContext

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      audioManager = new AudioManager(camera)
      
      expect(audioManager.isAudioAvailable()).toBe(false)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Web Audio API is not available. Audio will be disabled.'
      )

      // Restore
      globalThis.AudioContext = originalAudioContext
      consoleWarnSpy.mockRestore()
    })
  })

  describe('loadSounds', () => {
    it('should load sounds correctly', async () => {
      audioManager = new AudioManager(camera)

      // Mock the AudioLoader
      const mockBuffer = new ArrayBuffer(8)
      vi.spyOn(THREE.AudioLoader.prototype, 'load').mockImplementation(
        (_url: any, onLoad: any) => {
          onLoad(mockBuffer)
          return undefined as any
        }
      )

      const sounds = {
        doorCreak: '/sounds/door-creak.mp3',
        boneRattle: '/sounds/bone-rattle.mp3',
        whoosh: '/sounds/whoosh.mp3',
      }

      await audioManager.loadSounds(sounds)

      expect(audioManager.getSound('doorCreak')).toBeDefined()
      expect(audioManager.getSound('boneRattle')).toBeDefined()
      expect(audioManager.getSound('whoosh')).toBeDefined()
    })

    it('should skip loading when Web Audio unavailable', async () => {
      delete (globalThis as any).AudioContext
      delete (globalThis as any).webkitAudioContext

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      audioManager = new AudioManager(camera)

      const sounds = {
        doorCreak: '/sounds/door-creak.mp3',
        boneRattle: '/sounds/bone-rattle.mp3',
        whoosh: '/sounds/whoosh.mp3',
      }

      await audioManager.loadSounds(sounds)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Web Audio API unavailable. Skipping sound loading.'
      )

      consoleWarnSpy.mockRestore()
    })
  })

  describe('play', () => {
    beforeEach(async () => {
      audioManager = new AudioManager(camera)

      const mockBuffer = new ArrayBuffer(8)
      vi.spyOn(THREE.AudioLoader.prototype, 'load').mockImplementation(
        (_url: any, onLoad: any) => {
          onLoad(mockBuffer)
          return undefined as any
        }
      )

      await audioManager.loadSounds({
        doorCreak: '/sounds/door-creak.mp3',
        boneRattle: '/sounds/bone-rattle.mp3',
        whoosh: '/sounds/whoosh.mp3',
      })
    })

    it('should play sound when called', () => {
      const sound = audioManager.getSound('doorCreak')
      expect(sound).toBeDefined()

      const playSpy = vi.spyOn(sound!, 'play').mockImplementation(() => sound!)
      
      audioManager.play('doorCreak')

      expect(playSpy).toHaveBeenCalled()
    })

    it('should apply spatial positioning when provided', () => {
      const sound = audioManager.getSound('doorCreak')
      expect(sound).toBeDefined()

      vi.spyOn(sound!, 'play').mockImplementation(() => sound!)
      
      const position = { x: 1, y: 2, z: 3 }
      audioManager.play('doorCreak', position)

      expect(sound!.position.x).toBe(1)
      expect(sound!.position.y).toBe(2)
      expect(sound!.position.z).toBe(3)
    })

    it('should warn when sound not found', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      audioManager.play('nonexistent')

      expect(consoleWarnSpy).toHaveBeenCalledWith('Sound not found: nonexistent')
      
      consoleWarnSpy.mockRestore()
    })
  })

  describe('fadeOut', () => {
    beforeEach(async () => {
      audioManager = new AudioManager(camera)

      const mockBuffer = new ArrayBuffer(8)
      vi.spyOn(THREE.AudioLoader.prototype, 'load').mockImplementation(
        (_url: any, onLoad: any) => {
          onLoad(mockBuffer)
          return undefined as any
        }
      )

      await audioManager.loadSounds({
        doorCreak: '/sounds/door-creak.mp3',
        boneRattle: '/sounds/bone-rattle.mp3',
        whoosh: '/sounds/whoosh.mp3',
      })
    })

    it('should reduce volume over time', async () => {
      vi.useFakeTimers()

      const sound = audioManager.getSound('doorCreak')
      expect(sound).toBeDefined()

      vi.spyOn(sound!, 'play').mockImplementation(() => sound!)
      const stopSpy = vi.spyOn(sound!, 'stop').mockImplementation(() => sound!)
      
      // Track volume changes
      let currentVolume = 1
      vi.spyOn(sound!, 'getVolume').mockImplementation(() => currentVolume)
      vi.spyOn(sound!, 'setVolume').mockImplementation((vol: number) => {
        currentVolume = vol
        return sound!
      })
      
      // Mock isPlaying
      Object.defineProperty(sound!, 'isPlaying', {
        get: () => true,
        configurable: true,
      })

      audioManager.play('doorCreak')
      
      const initialVolume = sound!.getVolume()
      expect(initialVolume).toBe(1)

      audioManager.fadeOut('doorCreak', 1000)

      // Advance time by 500ms (50% of fade duration)
      vi.advanceTimersByTime(500)

      const midVolume = sound!.getVolume()
      expect(midVolume).toBeLessThan(initialVolume)
      expect(midVolume).toBeGreaterThan(0)

      // Advance to completion
      vi.advanceTimersByTime(500)

      expect(stopSpy).toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('stop', () => {
    beforeEach(async () => {
      audioManager = new AudioManager(camera)

      const mockBuffer = new ArrayBuffer(8)
      vi.spyOn(THREE.AudioLoader.prototype, 'load').mockImplementation(
        (_url: any, onLoad: any) => {
          onLoad(mockBuffer)
          return undefined as any
        }
      )

      await audioManager.loadSounds({
        doorCreak: '/sounds/door-creak.mp3',
        boneRattle: '/sounds/bone-rattle.mp3',
        whoosh: '/sounds/whoosh.mp3',
      })
    })

    it('should stop playing sound', () => {
      const sound = audioManager.getSound('doorCreak')
      expect(sound).toBeDefined()

      vi.spyOn(sound!, 'play').mockImplementation(() => sound!)
      const stopSpy = vi.spyOn(sound!, 'stop').mockImplementation(() => sound!)
      
      Object.defineProperty(sound!, 'isPlaying', {
        get: () => true,
        configurable: true,
      })

      audioManager.play('doorCreak')
      audioManager.stop('doorCreak')

      expect(stopSpy).toHaveBeenCalled()
    })
  })

  describe('dispose', () => {
    it('should clean up all resources', async () => {
      audioManager = new AudioManager(camera)

      const mockBuffer = new ArrayBuffer(8)
      vi.spyOn(THREE.AudioLoader.prototype, 'load').mockImplementation(
        (_url: any, onLoad: any) => {
          onLoad(mockBuffer)
          return undefined as any
        }
      )

      await audioManager.loadSounds({
        doorCreak: '/sounds/door-creak.mp3',
        boneRattle: '/sounds/bone-rattle.mp3',
        whoosh: '/sounds/whoosh.mp3',
      })

      const sound = audioManager.getSound('doorCreak')
      const disconnectSpy = vi.spyOn(sound!, 'disconnect').mockImplementation(() => sound!)

      audioManager.dispose()

      expect(disconnectSpy).toHaveBeenCalled()
    })
  })
})
