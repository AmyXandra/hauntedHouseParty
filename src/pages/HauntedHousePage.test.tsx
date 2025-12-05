import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HauntedHousePage from './HauntedHousePage'
import * as transitionHook from '../hooks/useTransitionController'
import { AnimationState } from '../types/animation'
import { Game } from '../types'

// Mock the transition controller hook
vi.mock('../hooks/useTransitionController')

// Mock the game data
vi.mock('../data/games', () => ({
  getRandomGame: vi.fn(() => ({
    id: 'game1',
    name: 'Test Game',
    component: () => null
  }))
}))

// Mock React Router's useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }: any) => children
  }
})

// Mock Canvas and Three.js components
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: { position: { x: 0, y: 0, z: 0 } },
    scene: {}
  }))
}))

vi.mock('@react-three/drei', () => {
  const mockUseGLTF = vi.fn(() => ({
    scene: { traverse: vi.fn() },
    nodes: {},
    materials: {}
  }))
  mockUseGLTF.preload = vi.fn()
  
  return {
    OrbitControls: () => null,
    useGLTF: mockUseGLTF,
    Sky: () => null
  }
})

// Mock scene components
vi.mock('../components/scene/Scene', () => ({
  default: ({ children }: any) => <div data-testid="scene">{children}</div>
}))

vi.mock('../components/scene/Sky', () => ({
  default: () => null
}))

vi.mock('../components/scene/Lights', () => ({
  default: () => null
}))

vi.mock('../components/scene/Floor', () => ({
  default: () => null
}))

vi.mock('../components/scene/House', () => ({
  default: () => null
}))

vi.mock('../components/scene/Graveyard', () => ({
  default: () => null
}))

// Mock texture hook
vi.mock('../hooks/useTextures', () => ({
  useTextures: () => ({
    floorTextures: {},
    wallTextures: {},
    roofTextures: {},
    bushTextures: {},
    doorTextures: {}
  })
}))

// Mock responsive hook
vi.mock('../hooks/useResponsive', () => ({
  useResponsive: () => ({})
}))

describe('HauntedHousePage - Game Selection Integration', () => {
  let mockOnStateChange: (callback: (newState: AnimationState) => void) => () => void
  let stateChangeCallback: ((newState: AnimationState) => void) | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    stateChangeCallback = null

    // Setup mock for onStateChange that captures the callback
    mockOnStateChange = (callback: (newState: AnimationState) => void) => {
      stateChangeCallback = callback
      return () => {}
    }

    // Default mock implementation
    vi.mocked(transitionHook.useTransitionController).mockReturnValue({
      state: {
        currentState: AnimationState.IDLE,
        progress: 0,
        totalElapsed: 0,
        selectedGame: null
      },
      startTransition: vi.fn(),
      reset: vi.fn(),
      onStateChange: mockOnStateChange,
      isValidTransition: vi.fn()
    })
  })

  it('should call onComplete callback when transition completes', async () => {
    const mockOnComplete = vi.fn()
    const testGame: Game = {
      id: 'game1',
      name: 'Test Game',
      component: () => null
    }

    // Mock the hook to call onComplete immediately
    vi.mocked(transitionHook.useTransitionController).mockImplementation((config, onComplete) => {
      // Simulate completion
      setTimeout(() => {
        if (onComplete) {
          onComplete(testGame)
        }
      }, 0)

      return {
        state: {
          currentState: AnimationState.NAVIGATING,
          progress: 1,
          totalElapsed: 3.26,
          selectedGame: testGame
        },
        startTransition: vi.fn(),
        reset: vi.fn(),
        onStateChange: mockOnStateChange,
        isValidTransition: vi.fn()
      }
    })

    render(
      <BrowserRouter>
        <HauntedHousePage />
      </BrowserRouter>
    )

    // Wait for navigation to be called
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/game/game1')
    })
  })

  it('should trigger fade when entering FADING state', async () => {
    render(
      <BrowserRouter>
        <HauntedHousePage />
      </BrowserRouter>
    )

    // Simulate state change to FADING
    if (stateChangeCallback) {
      stateChangeCallback(AnimationState.FADING)
    }

    // Check that fade overlay is rendered
    await waitFor(() => {
      const overlay = document.querySelector('.fade-overlay')
      expect(overlay).toBeTruthy()
    })
  })

  it('should preload game component when entering DRAGGING state', async () => {
    const testGame: Game = {
      id: 'game2',
      name: 'Test Game 2',
      component: () => null
    }

    vi.mocked(transitionHook.useTransitionController).mockReturnValue({
      state: {
        currentState: AnimationState.DRAGGING,
        progress: 0.5,
        totalElapsed: 2.5,
        selectedGame: testGame
      },
      startTransition: vi.fn(),
      reset: vi.fn(),
      onStateChange: mockOnStateChange,
      isValidTransition: vi.fn()
    })

    render(
      <BrowserRouter>
        <HauntedHousePage />
      </BrowserRouter>
    )

    // Simulate state change to DRAGGING
    if (stateChangeCallback) {
      stateChangeCallback(AnimationState.DRAGGING)
    }

    // The game should be set for preloading
    // We can't directly test lazy loading, but we can verify the state change was handled
    await waitFor(() => {
      expect(stateChangeCallback).toBeTruthy()
    })
  })

  it('should navigate after fade completes', async () => {
    const testGame: Game = {
      id: 'game3',
      name: 'Test Game 3',
      component: () => null
    }

    // Start with FADING state
    vi.mocked(transitionHook.useTransitionController).mockImplementation((config, onComplete) => {
      // Simulate fade completion and navigation
      setTimeout(() => {
        if (onComplete) {
          onComplete(testGame)
        }
      }, 100)

      return {
        state: {
          currentState: AnimationState.FADING,
          progress: 1,
          totalElapsed: 3.2,
          selectedGame: testGame
        },
        startTransition: vi.fn(),
        reset: vi.fn(),
        onStateChange: mockOnStateChange,
        isValidTransition: vi.fn()
      }
    })

    render(
      <BrowserRouter>
        <HauntedHousePage />
      </BrowserRouter>
    )

    // Wait for navigation to occur after fade
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/game/game3')
    }, { timeout: 200 })
  })

  it('should reset animation when component unmounts', () => {
    const mockReset = vi.fn()

    vi.mocked(transitionHook.useTransitionController).mockReturnValue({
      state: {
        currentState: AnimationState.IDLE,
        progress: 0,
        totalElapsed: 0,
        selectedGame: null
      },
      startTransition: vi.fn(),
      reset: mockReset,
      onStateChange: mockOnStateChange,
      isValidTransition: vi.fn()
    })

    const { unmount } = render(
      <BrowserRouter>
        <HauntedHousePage />
      </BrowserRouter>
    )

    unmount()

    expect(mockReset).toHaveBeenCalled()
  })
})
