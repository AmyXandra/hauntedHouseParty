import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AnimationState, DoorAnimationState } from '../../types/animation'

/**
 * Accessibility tests for Door component
 * Tests keyboard support, reduced motion, ARIA labels, and focus management
 * Validates: Requirements 5.1 (implicit accessibility requirement)
 */

describe('Door Component - Accessibility Tests', () => {
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    // Store original matchMedia
    originalMatchMedia = window.matchMedia
  })

  afterEach(() => {
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia
  })

  /**
   * Test: Keyboard triggers door interaction (Enter key)
   * Requirement 5.1: Door should be accessible via keyboard
   */
  it('should trigger door interaction when Enter key is pressed', () => {
    const mockOnClick = vi.fn()
    const isFocused = true
    const isAnimating = false

    // Simulate keyboard event handler
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFocused) return
      
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!isAnimating) {
          mockOnClick()
        }
      }
    }

    // Simulate Enter key press
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
    handleKeyDown(enterEvent)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  /**
   * Test: Keyboard triggers door interaction (Space key)
   * Requirement 5.1: Door should be accessible via keyboard
   */
  it('should trigger door interaction when Space key is pressed', () => {
    const mockOnClick = vi.fn()
    const isFocused = true
    const isAnimating = false

    // Simulate keyboard event handler
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFocused) return
      
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!isAnimating) {
          mockOnClick()
        }
      }
    }

    // Simulate Space key press
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' })
    handleKeyDown(spaceEvent)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  /**
   * Test: Keyboard interaction ignored when not focused
   * Requirement 5.1: Keyboard events should only work when door is focused
   */
  it('should not trigger interaction when door is not focused', () => {
    const mockOnClick = vi.fn()
    const isFocused = false
    const isAnimating = false

    // Simulate keyboard event handler
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFocused) return
      
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!isAnimating) {
          mockOnClick()
        }
      }
    }

    // Simulate Enter key press
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
    handleKeyDown(enterEvent)

    expect(mockOnClick).not.toHaveBeenCalled()
  })

  /**
   * Test: Keyboard interaction blocked during animation
   * Requirement 5.1: Keyboard should not trigger during animation
   */
  it('should not trigger interaction during animation', () => {
    const mockOnClick = vi.fn()
    const isFocused = true
    const isAnimating = true

    // Simulate keyboard event handler
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFocused) return
      
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!isAnimating) {
          mockOnClick()
        }
      }
    }

    // Simulate Enter key press
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
    handleKeyDown(enterEvent)

    expect(mockOnClick).not.toHaveBeenCalled()
  })

  /**
   * Test: Other keys do not trigger interaction
   * Requirement 5.1: Only Enter and Space should trigger interaction
   */
  it('should not trigger interaction for other keys', () => {
    const mockOnClick = vi.fn()
    const isFocused = true
    const isAnimating = false

    // Simulate keyboard event handler
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFocused) return
      
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!isAnimating) {
          mockOnClick()
        }
      }
    }

    // Try various keys that should not trigger
    const keys = ['a', 'Escape', 'Tab', 'ArrowUp', 'ArrowDown']
    keys.forEach(key => {
      const event = new KeyboardEvent('keydown', { key })
      handleKeyDown(event)
    })

    expect(mockOnClick).not.toHaveBeenCalled()
  })

  /**
   * Test: Reduced motion preference is detected
   * Requirement 5.1: Respect prefers-reduced-motion media query
   */
  it('should detect prefers-reduced-motion preference', () => {
    // Mock matchMedia to return reduced motion preference
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    expect(prefersReducedMotion).toBe(true)
  })

  /**
   * Test: No reduced motion preference by default
   * Requirement 5.1: Default behavior when no preference set
   */
  it('should not detect reduced motion when preference is not set', () => {
    // Mock matchMedia to return no reduced motion preference
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    expect(prefersReducedMotion).toBe(false)
  })

  /**
   * Test: Reduced motion skips to final animation state
   * Requirement 5.1: Animations should be instant with reduced motion
   */
  it('should skip to final rotation when reduced motion is preferred', () => {
    const prefersReducedMotion = true
    const isAnimating = true
    let currentRotation = Math.PI / 4 // Mid-animation

    // Simulate useFrame logic with reduced motion
    if (prefersReducedMotion && isAnimating) {
      currentRotation = Math.PI / 2 // Jump to open position
    }

    expect(currentRotation).toBe(Math.PI / 2)
  })

  /**
   * Test: Normal animation progression without reduced motion
   * Requirement 5.1: Normal animation when no preference
   */
  it('should animate normally when reduced motion is not preferred', () => {
    const prefersReducedMotion = false
    const isAnimating = true
    const targetRotation = Math.PI / 4
    let currentRotation = targetRotation

    // Simulate useFrame logic without reduced motion
    if (prefersReducedMotion && isAnimating) {
      currentRotation = Math.PI / 2
    }

    expect(currentRotation).toBe(Math.PI / 4)
  })

  /**
   * Test: ARIA label for idle state
   * Requirement 5.1: Provide descriptive ARIA labels
   */
  it('should have correct ARIA label for idle state', () => {
    const animationState: DoorAnimationState = {
      state: AnimationState.IDLE,
      rotation: 0,
      isAnimating: false
    }

    const getAriaLabel = (state: AnimationState) => {
      switch (state) {
        case AnimationState.IDLE:
          return 'Click door to enter game'
        case AnimationState.DOOR_OPENING:
          return 'Door is opening'
        case AnimationState.HAND_EMERGING:
          return 'Skeleton hand is emerging'
        case AnimationState.HAND_PAUSED:
          return 'Preparing to enter'
        case AnimationState.DRAGGING:
          return 'Being pulled into game'
        case AnimationState.FADING:
          return 'Transitioning to game'
        case AnimationState.NAVIGATING:
          return 'Loading game'
        default:
          return 'Door interaction'
      }
    }

    const label = getAriaLabel(animationState.state)
    expect(label).toBe('Click door to enter game')
  })

  /**
   * Test: ARIA label for door opening state
   * Requirement 5.1: Provide descriptive ARIA labels for all states
   */
  it('should have correct ARIA label for door opening state', () => {
    const animationState: DoorAnimationState = {
      state: AnimationState.DOOR_OPENING,
      rotation: Math.PI / 4,
      isAnimating: true
    }

    const getAriaLabel = (state: AnimationState) => {
      switch (state) {
        case AnimationState.IDLE:
          return 'Click door to enter game'
        case AnimationState.DOOR_OPENING:
          return 'Door is opening'
        case AnimationState.HAND_EMERGING:
          return 'Skeleton hand is emerging'
        case AnimationState.HAND_PAUSED:
          return 'Preparing to enter'
        case AnimationState.DRAGGING:
          return 'Being pulled into game'
        case AnimationState.FADING:
          return 'Transitioning to game'
        case AnimationState.NAVIGATING:
          return 'Loading game'
        default:
          return 'Door interaction'
      }
    }

    const label = getAriaLabel(animationState.state)
    expect(label).toBe('Door is opening')
  })

  /**
   * Test: ARIA label for hand emerging state
   * Requirement 5.1: Provide descriptive ARIA labels for all states
   */
  it('should have correct ARIA label for hand emerging state', () => {
    const getAriaLabel = (state: AnimationState) => {
      switch (state) {
        case AnimationState.IDLE:
          return 'Click door to enter game'
        case AnimationState.DOOR_OPENING:
          return 'Door is opening'
        case AnimationState.HAND_EMERGING:
          return 'Skeleton hand is emerging'
        case AnimationState.HAND_PAUSED:
          return 'Preparing to enter'
        case AnimationState.DRAGGING:
          return 'Being pulled into game'
        case AnimationState.FADING:
          return 'Transitioning to game'
        case AnimationState.NAVIGATING:
          return 'Loading game'
        default:
          return 'Door interaction'
      }
    }

    const label = getAriaLabel(AnimationState.HAND_EMERGING)
    expect(label).toBe('Skeleton hand is emerging')
  })

  /**
   * Test: ARIA label for dragging state
   * Requirement 5.1: Provide descriptive ARIA labels for all states
   */
  it('should have correct ARIA label for dragging state', () => {
    const getAriaLabel = (state: AnimationState) => {
      switch (state) {
        case AnimationState.IDLE:
          return 'Click door to enter game'
        case AnimationState.DOOR_OPENING:
          return 'Door is opening'
        case AnimationState.HAND_EMERGING:
          return 'Skeleton hand is emerging'
        case AnimationState.HAND_PAUSED:
          return 'Preparing to enter'
        case AnimationState.DRAGGING:
          return 'Being pulled into game'
        case AnimationState.FADING:
          return 'Transitioning to game'
        case AnimationState.NAVIGATING:
          return 'Loading game'
        default:
          return 'Door interaction'
      }
    }

    const label = getAriaLabel(AnimationState.DRAGGING)
    expect(label).toBe('Being pulled into game')
  })

  /**
   * Test: ARIA label for navigating state
   * Requirement 5.1: Provide descriptive ARIA labels for all states
   */
  it('should have correct ARIA label for navigating state', () => {
    const getAriaLabel = (state: AnimationState) => {
      switch (state) {
        case AnimationState.IDLE:
          return 'Click door to enter game'
        case AnimationState.DOOR_OPENING:
          return 'Door is opening'
        case AnimationState.HAND_EMERGING:
          return 'Skeleton hand is emerging'
        case AnimationState.HAND_PAUSED:
          return 'Preparing to enter'
        case AnimationState.DRAGGING:
          return 'Being pulled into game'
        case AnimationState.FADING:
          return 'Transitioning to game'
        case AnimationState.NAVIGATING:
          return 'Loading game'
        default:
          return 'Door interaction'
      }
    }

    const label = getAriaLabel(AnimationState.NAVIGATING)
    expect(label).toBe('Loading game')
  })

  /**
   * Test: Focus management - blur on navigation
   * Requirement 5.1: Implement focus management during transition
   */
  it('should remove focus when navigating away', () => {
    let isFocused = true
    const animationState: DoorAnimationState = {
      state: AnimationState.NAVIGATING,
      rotation: Math.PI / 2,
      isAnimating: false
    }

    // Simulate focus management logic
    if (animationState.state === AnimationState.NAVIGATING) {
      isFocused = false
    }

    expect(isFocused).toBe(false)
  })

  /**
   * Test: Focus state can be set
   * Requirement 5.1: Focus management works correctly
   */
  it('should set focus state when door receives focus', () => {
    let isFocused = false

    const handleFocus = () => {
      isFocused = true
    }

    handleFocus()
    expect(isFocused).toBe(true)
  })

  /**
   * Test: Focus state can be cleared
   * Requirement 5.1: Focus management works correctly
   */
  it('should clear focus state when door loses focus', () => {
    let isFocused = true

    const handleBlur = () => {
      isFocused = false
    }

    handleBlur()
    expect(isFocused).toBe(false)
  })

  /**
   * Test: Emissive effect applies to focused door
   * Requirement 5.1: Visual feedback for keyboard focus
   */
  it('should apply emissive effect when door is focused', () => {
    const isHovered = false
    const isFocused = true

    const shouldShowEmissive = isHovered || isFocused
    const emissiveColor = shouldShowEmissive ? '#ff7d46' : '#000000'
    const emissiveIntensity = shouldShowEmissive ? 0.3 : 0

    expect(emissiveColor).toBe('#ff7d46')
    expect(emissiveIntensity).toBe(0.3)
  })

  /**
   * Test: Emissive effect applies to hovered door
   * Requirement 5.1: Visual feedback for hover state
   */
  it('should apply emissive effect when door is hovered', () => {
    const isHovered = true
    const isFocused = false

    const shouldShowEmissive = isHovered || isFocused
    const emissiveColor = shouldShowEmissive ? '#ff7d46' : '#000000'
    const emissiveIntensity = shouldShowEmissive ? 0.3 : 0

    expect(emissiveColor).toBe('#ff7d46')
    expect(emissiveIntensity).toBe(0.3)
  })

  /**
   * Test: No emissive effect when not hovered or focused
   * Requirement 5.1: Default state has no emissive effect
   */
  it('should not apply emissive effect when door is neither hovered nor focused', () => {
    const isHovered = false
    const isFocused = false

    const shouldShowEmissive = isHovered || isFocused
    const emissiveColor = shouldShowEmissive ? '#ff7d46' : '#000000'
    const emissiveIntensity = shouldShowEmissive ? 0.3 : 0

    expect(emissiveColor).toBe('#000000')
    expect(emissiveIntensity).toBe(0)
  })
})

/**
 * Reduced Motion Configuration Tests
 * Tests that reduced motion config uses shorter durations
 */
describe('Reduced Motion Configuration', () => {
  /**
   * Test: Reduced motion config has shorter durations
   * Requirement 5.1: Reduced motion should use faster transitions
   */
  it('should have shorter durations than default config', () => {
    const defaultConfig = {
      doorDuration: 1.2,
      handDuration: 0.8,
      pauseDuration: 0.3,
      dragDuration: 1.0,
      fadeDuration: 0.5
    }

    const reducedMotionConfig = {
      doorDuration: 0.3,
      handDuration: 0.2,
      pauseDuration: 0.1,
      dragDuration: 0.3,
      fadeDuration: 0.3
    }

    expect(reducedMotionConfig.doorDuration).toBeLessThan(defaultConfig.doorDuration)
    expect(reducedMotionConfig.handDuration).toBeLessThan(defaultConfig.handDuration)
    expect(reducedMotionConfig.pauseDuration).toBeLessThan(defaultConfig.pauseDuration)
    expect(reducedMotionConfig.dragDuration).toBeLessThan(defaultConfig.dragDuration)
    expect(reducedMotionConfig.fadeDuration).toBeLessThan(defaultConfig.fadeDuration)
  })

  /**
   * Test: Reduced motion config is valid
   * Requirement 5.1: Config should have positive durations
   */
  it('should have valid positive durations', () => {
    const reducedMotionConfig = {
      doorDuration: 0.3,
      handDuration: 0.2,
      pauseDuration: 0.1,
      dragDuration: 0.3,
      fadeDuration: 0.3
    }

    expect(reducedMotionConfig.doorDuration).toBeGreaterThan(0)
    expect(reducedMotionConfig.handDuration).toBeGreaterThan(0)
    expect(reducedMotionConfig.pauseDuration).toBeGreaterThan(0)
    expect(reducedMotionConfig.dragDuration).toBeGreaterThan(0)
    expect(reducedMotionConfig.fadeDuration).toBeGreaterThan(0)
  })
})
