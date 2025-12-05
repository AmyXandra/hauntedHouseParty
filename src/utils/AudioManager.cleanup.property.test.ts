import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { AudioManager, TransitionSounds } from './AudioManager'
import * as THREE from 'three'

/**
 * **Feature: door-animation-transition, Property 18: Resource cleanup on completion**
 * **Validates: Requirements 6.5**
 * 
 * Property: For any AudioManager instance, when disposed, all audio sources should be
 * stopped, disconnected, and fade intervals should be cleared.
 */

describe('AudioManager - Resource Cleanup Property Tests', () => {
  let mockCamera: THREE.Camera

  beforeEach(() => {
    mockCamera = new THREE.PerspectiveCamera()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('Property 18: should clear all fade intervals on dispose', () => {
    /**
     * Property: For any set of sounds with active fade operations,
     * dispose should clear all fade intervals
     */
    fc.assert(
      fc.property(
        fc.uniqueArray(
          fc.constantFrom('doorCreak', 'boneRattle', 'whoosh'),
          { minLength: 1, maxLength: 3 }
        ),
        fc.integer({ min: 100, max: 2000 }), // Fade duration
        (soundsToFade, fadeDuration) => {
          const manager = new AudioManager(mockCamera)

          // Mock the sounds map to avoid actual audio loading
          const mockSounds = new Map()
          soundsToFade.forEach(soundName => {
            const mockSound = {
              isPlaying: true,
              getVolume: vi.fn().mockReturnValue(1),
              setVolume: vi.fn(),
              stop: vi.fn(),
              disconnect: vi.fn(),
              position: { set: vi.fn() }
            }
            mockSounds.set(soundName, mockSound)
          })

          // Replace the private sounds map
          ;(manager as any).sounds = mockSounds
          ;(manager as any).isAvailable = true

          // Start fade operations on all sounds
          soundsToFade.forEach(soundName => {
            manager.fadeOut(soundName, fadeDuration)
          })

          // Verify fade intervals were created (one per unique sound)
          const fadeIntervals = (manager as any).fadeIntervals
          expect(fadeIntervals.size).toBe(soundsToFade.length)

          // Dispose the manager
          manager.dispose()

          // Verify all fade intervals were cleared
          expect(fadeIntervals.size).toBe(0)

          // Advance time to ensure no fade operations continue
          vi.advanceTimersByTime(fadeDuration * 2)

          // Verify sounds were stopped and disconnected
          mockSounds.forEach(sound => {
            expect(sound.stop).toHaveBeenCalled()
            expect(sound.disconnect).toHaveBeenCalled()
          })
        }
      ),
      { numRuns: 20 }
    )
  })

  it('Property 18: should stop all playing sounds on dispose', () => {
    /**
     * Property: For any set of playing sounds, dispose should stop all of them
     */
    fc.assert(
      fc.property(
        fc.uniqueArray(
          fc.record({
            name: fc.constantFrom('doorCreak', 'boneRattle', 'whoosh'),
            isPlaying: fc.boolean()
          }),
          { 
            minLength: 1, 
            maxLength: 3,
            selector: (item) => item.name // Ensure unique names
          }
        ),
        (soundStates) => {
          const manager = new AudioManager(mockCamera)

          // Mock the sounds
          const mockSounds = new Map()
          soundStates.forEach(({ name, isPlaying }) => {
            const mockSound = {
              isPlaying,
              stop: vi.fn(),
              disconnect: vi.fn(),
              position: { set: vi.fn() }
            }
            mockSounds.set(name, mockSound)
          })

          ;(manager as any).sounds = mockSounds
          ;(manager as any).isAvailable = true

          // Dispose
          manager.dispose()

          // Verify all playing sounds were stopped
          soundStates.forEach(({ name, isPlaying }) => {
            const sound = mockSounds.get(name)
            if (sound) { // Check sound exists
              if (isPlaying) {
                expect(sound.stop).toHaveBeenCalled()
              }
              expect(sound.disconnect).toHaveBeenCalled()
            }
          })

          // Verify sounds map was cleared
          expect((manager as any).sounds.size).toBe(0)
        }
      ),
      { numRuns: 20 }
    )
  })

  it('Property 18: should disconnect all sounds on dispose', () => {
    /**
     * Property: For any AudioManager with loaded sounds, dispose should
     * disconnect all audio nodes
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }), // Number of sounds
        (soundCount) => {
          const manager = new AudioManager(mockCamera)

          // Create mock sounds
          const mockSounds = new Map()
          const disconnectSpies: Array<ReturnType<typeof vi.fn>> = []

          for (let i = 0; i < soundCount; i++) {
            const disconnectSpy = vi.fn()
            disconnectSpies.push(disconnectSpy)
            
            const mockSound = {
              isPlaying: false,
              stop: vi.fn(),
              disconnect: disconnectSpy,
              position: { set: vi.fn() }
            }
            mockSounds.set(`sound${i}`, mockSound)
          }

          ;(manager as any).sounds = mockSounds
          ;(manager as any).isAvailable = true

          // Dispose
          manager.dispose()

          // Verify all sounds were disconnected
          disconnectSpies.forEach(spy => {
            expect(spy).toHaveBeenCalledOnce()
          })

          // Verify sounds map was cleared
          expect((manager as any).sounds.size).toBe(0)
        }
      ),
      { numRuns: 20 }
    )
  })

  it('Property 18: should remove listener from camera on dispose', () => {
    /**
     * Property: For any AudioManager, dispose should remove the audio listener
     * from the camera
     */
    fc.assert(
      fc.property(
        fc.constant(true), // Just a placeholder to run the property
        () => {
          const camera = new THREE.PerspectiveCamera()
          const manager = new AudioManager(camera)

          // Mock the listener
          const mockListener = {
            parent: camera,
            context: { state: 'running' }
          }
          ;(manager as any).listener = mockListener
          ;(manager as any).isAvailable = true

          // Add listener to camera children
          const removeSpy = vi.spyOn(camera, 'remove')

          // Dispose
          manager.dispose()

          // Verify listener was removed from camera
          expect(removeSpy).toHaveBeenCalledWith(mockListener)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('Property 18: should handle dispose when no sounds are loaded', () => {
    /**
     * Property: Dispose should work correctly even when no sounds have been loaded
     */
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const manager = new AudioManager(mockCamera)

          // Dispose without loading any sounds
          expect(() => manager.dispose()).not.toThrow()

          // Verify maps are empty
          expect((manager as any).sounds.size).toBe(0)
          expect((manager as any).fadeIntervals.size).toBe(0)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('Property 18: should handle multiple dispose calls safely', () => {
    /**
     * Property: Calling dispose multiple times should not cause errors
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }), // Number of dispose calls
        (disposeCount) => {
          const manager = new AudioManager(mockCamera)

          // Mock some sounds
          const mockSounds = new Map()
          mockSounds.set('test', {
            isPlaying: true,
            stop: vi.fn(),
            disconnect: vi.fn(),
            position: { set: vi.fn() }
          })

          ;(manager as any).sounds = mockSounds
          ;(manager as any).isAvailable = true

          // Call dispose multiple times
          for (let i = 0; i < disposeCount; i++) {
            expect(() => manager.dispose()).not.toThrow()
          }

          // Verify final state is clean
          expect((manager as any).sounds.size).toBe(0)
          expect((manager as any).fadeIntervals.size).toBe(0)
        }
      ),
      { numRuns: 10 }
    )
  })
})
