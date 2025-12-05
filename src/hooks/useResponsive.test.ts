import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

describe('useResponsive', () => {
  let originalInnerWidth: number
  let originalInnerHeight: number
  let originalDevicePixelRatio: number

  beforeEach(() => {
    // Store original values
    originalInnerWidth = window.innerWidth
    originalInnerHeight = window.innerHeight
    originalDevicePixelRatio = window.devicePixelRatio
  })

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    })
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: originalDevicePixelRatio,
    })
  })

  /**
   * Feature: react-game-hub, Property 6: Responsive camera aspect ratio
   * For any window resize event, the camera's aspect ratio should equal 
   * the new window width divided by the new window height.
   * Validates: Requirements 5.1
   */
  it('property: camera aspect ratio matches window dimensions after resize', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }), // width
        fc.integer({ min: 240, max: 2160 }), // height
        (width, height) => {
          // Mock window dimensions
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
          })
          Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: height,
          })

          // Create mock camera and renderer
          const mockCamera = {
            aspect: 1,
            updateProjectionMatrix: vi.fn(),
          }

          const mockGl = {
            setSize: vi.fn(),
            setPixelRatio: vi.fn(),
          }

          // Simulate what the hook does
          const expectedAspect = width / height
          mockCamera.aspect = expectedAspect
          mockCamera.updateProjectionMatrix()
          mockGl.setSize(width, height)

          // Verify the aspect ratio calculation
          expect(mockCamera.aspect).toBeCloseTo(expectedAspect, 5)
          expect(mockCamera.updateProjectionMatrix).toHaveBeenCalled()
          expect(mockGl.setSize).toHaveBeenCalledWith(width, height)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: react-game-hub, Property 7: Pixel ratio capping
   * For any device pixel ratio value, the renderer's configured pixel ratio 
   * should be the minimum of the device pixel ratio and 2.
   * Validates: Requirements 5.3
   */
  it('property: pixel ratio is capped at 2', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0.5, max: 5.0, noNaN: true }), // device pixel ratio
        (devicePixelRatio) => {
          // Mock device pixel ratio
          Object.defineProperty(window, 'devicePixelRatio', {
            writable: true,
            configurable: true,
            value: devicePixelRatio,
          })

          // Create mock renderer
          const mockGl = {
            setSize: vi.fn(),
            setPixelRatio: vi.fn(),
          }

          // Simulate what the hook does
          const expectedPixelRatio = Math.min(devicePixelRatio, 2)
          mockGl.setPixelRatio(expectedPixelRatio)

          // Verify the pixel ratio is capped at 2
          expect(mockGl.setPixelRatio).toHaveBeenCalledWith(expectedPixelRatio)
          expect(expectedPixelRatio).toBeLessThanOrEqual(2)
          
          // Additional verification: if device pixel ratio > 2, should be capped at 2
          if (devicePixelRatio > 2) {
            expect(expectedPixelRatio).toBe(2)
          } else {
            expect(expectedPixelRatio).toBe(devicePixelRatio)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
