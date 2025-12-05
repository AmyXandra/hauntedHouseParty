import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as THREE from 'three'
import * as fc from 'fast-check'
import { AudioManager } from './AudioManager'

describe('AudioManager Property Tests', () => {
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

  /**
   * Feature: door-animation-transition, Property 27: Spatial audio positioning
   * 
   * For any played transition sound, the audio object should be PositionalAudio 
   * with position set to door coordinates.
   * 
   * Validates: Requirements 8.4
   */
  it('Property 27: Spatial audio positioning - all sounds should be positioned at specified coordinates', async () => {
    audioManager = new AudioManager(camera)

    // Mock the AudioLoader
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

    // Property: For any sound name and any 3D position, when played with that position,
    // the sound's position should match the specified coordinates
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('doorCreak', 'boneRattle', 'whoosh'),
        fc.record({
          x: fc.float({ min: -100, max: 100, noNaN: true }),
          y: fc.float({ min: -100, max: 100, noNaN: true }),
          z: fc.float({ min: -100, max: 100, noNaN: true }),
        }),
        async (soundName, position) => {
          const sound = audioManager.getSound(soundName)
          expect(sound).toBeDefined()
          expect(sound).toBeInstanceOf(THREE.PositionalAudio)

          // Mock play to avoid actual audio playback
          vi.spyOn(sound!, 'play').mockImplementation(() => sound!)

          audioManager.play(soundName, position)

          // Verify the sound is positioned at the specified coordinates
          expect(sound!.position.x).toBeCloseTo(position.x, 5)
          expect(sound!.position.y).toBeCloseTo(position.y, 5)
          expect(sound!.position.z).toBeCloseTo(position.z, 5)
        }
      ),
      { numRuns: 100 }
    )
  })
})

  /**
   * Feature: door-animation-transition, Property 28: Audio fadeout on completion
   * 
   * For any completed transition sequence, fadeOut should be called on all active 
   * audio sources and volume should decrease over time until the sound stops.
   * 
   * Validates: Requirements 8.5
   */
  it('Property 28: Audio fadeout - volume should decrease monotonically until sound stops', async () => {
    vi.useFakeTimers()

    const testCamera = new THREE.PerspectiveCamera()
    const testAudioManager = new AudioManager(testCamera)

    // Mock the AudioLoader
    const mockBuffer = new ArrayBuffer(8)
    vi.spyOn(THREE.AudioLoader.prototype, 'load').mockImplementation(
      (_url: any, onLoad: any) => {
        onLoad(mockBuffer)
        return undefined as any
      }
    )

    await testAudioManager.loadSounds({
      doorCreak: '/sounds/door-creak.mp3',
      boneRattle: '/sounds/bone-rattle.mp3',
      whoosh: '/sounds/whoosh.mp3',
    })

    // Property: For any sound and any fade duration, the volume should decrease
    // monotonically from initial volume to 0, and the sound should stop at the end
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('doorCreak', 'boneRattle', 'whoosh'),
        fc.integer({ min: 100, max: 5000 }), // fade duration in ms
        async (soundName, fadeDuration) => {
          const sound = testAudioManager.getSound(soundName)
          expect(sound).toBeDefined()

          // Track volume changes
          let currentVolume = 1
          const volumeHistory: number[] = []
          
          vi.spyOn(sound!, 'getVolume').mockImplementation(() => currentVolume)
          vi.spyOn(sound!, 'setVolume').mockImplementation((vol: number) => {
            currentVolume = vol
            volumeHistory.push(vol)
            return sound!
          })
          
          const stopSpy = vi.spyOn(sound!, 'stop').mockImplementation(() => sound!)
          vi.spyOn(sound!, 'play').mockImplementation(() => sound!)
          
          // Mock isPlaying
          Object.defineProperty(sound!, 'isPlaying', {
            get: () => true,
            configurable: true,
          })

          // Play the sound
          testAudioManager.play(soundName)
          const initialVolume = sound!.getVolume()
          expect(initialVolume).toBe(1)

          // Start fadeout
          testAudioManager.fadeOut(soundName, fadeDuration)

          // Sample volume at multiple points during fade
          const samplePoints = [0.25, 0.5, 0.75, 1.0]
          const sampledVolumes: number[] = []

          for (const point of samplePoints) {
            vi.advanceTimersByTime(fadeDuration * point / samplePoints.length)
            sampledVolumes.push(sound!.getVolume())
          }

          // Property 1: Volume should decrease monotonically
          for (let i = 1; i < sampledVolumes.length; i++) {
            expect(sampledVolumes[i]).toBeLessThanOrEqual(sampledVolumes[i - 1])
          }

          // Property 2: Final volume should be close to 0
          expect(sampledVolumes[sampledVolumes.length - 1]).toBeLessThanOrEqual(0.1)

          // Property 3: Sound should be stopped at the end
          expect(stopSpy).toHaveBeenCalled()

          // Reset for next iteration
          vi.clearAllTimers()
          stopSpy.mockClear()
        }
      ),
      { numRuns: 100 }
    )

    testAudioManager.dispose()
    vi.useRealTimers()
  })
