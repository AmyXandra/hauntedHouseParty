import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useNavigate, useLocation } from 'react-router-dom'
import Scene from '../components/scene/Scene'
import Sky from '../components/scene/Sky'
import Lights from '../components/scene/Lights'
import Floor from '../components/scene/Floor'
import House from '../components/scene/House'
import Graveyard from '../components/scene/Graveyard'
import AnimatedCamera from '../components/scene/AnimatedCamera'
import IntroOverlay from '../components/ui/IntroOverlay'
import { useTextures } from '../hooks/useTextures'
import { useResponsive } from '../hooks/useResponsive'
import { useDoorKnock } from '../hooks/useDoorKnock'
import { useCameraTransition } from '../hooks/useCameraTransition'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { loadIntroState, startIntroAnimation } from '../store/slices/introSlice'
import { getRandomGame } from '../data/games'
import { INITIAL_CAMERA_POSITION, FINAL_CAMERA_POSITION } from '../components/scene/AnimatedCamera'

/**
 * Home page component that renders the haunted house 3D scene
 * Sets up the R3F Canvas with camera, renderer, and controls
 */
export default function HauntedHousePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { hasSeenIntro, isAnimating } = useAppSelector(state => state.intro)

  // Load intro state from localStorage on mount
  useEffect(() => {
    dispatch(loadIntroState())
  }, [dispatch])

  // Start intro animation if user hasn't seen it
  useEffect(() => {
    if (!hasSeenIntro && !isAnimating) {
      const timer = setTimeout(() => {
        dispatch(startIntroAnimation())
      }, 500) // Small delay before starting animation
      
      return () => clearTimeout(timer)
    }
  }, [hasSeenIntro, isAnimating, dispatch])

  // Check if returning from a game (location state indicates this)
  const shouldZoomOut = location.state?.fromGame === true

  // Door knock system - requires 3 knocks to enter
  const handleDoorEntry = () => {
    const randomGame = getRandomGame()
    navigate(`/game/${randomGame.id}`)
  }
  
  const { knockCount, isListening, handleKnock, triggerNavigation } = useDoorKnock(handleDoorEntry)

  // Determine initial camera position based on intro state
  const initialCameraPosition = hasSeenIntro ? FINAL_CAMERA_POSITION : INITIAL_CAMERA_POSITION

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{
          position: [initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z],
          fov: 75,
          near: 0.1,
          far: 100,
        }}
        shadows
        gl={{
          antialias: true,
          toneMapping: 2, // THREE.ACESFilmicToneMapping
          toneMappingExposure: 1,
        }}
        dpr={[1, 2]} // Cap pixel ratio at 2 for performance
      >
        <SceneContent 
          onDoorClick={handleKnock} 
          knockCount={knockCount} 
          isListening={isListening}
          shouldZoomOut={shouldZoomOut}
          triggerNavigation={triggerNavigation}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <IntroOverlay knockCount={knockCount} isListening={isListening} />
    </div>
  )
}

/**
 * Scene content component that uses hooks
 * Separated to allow hooks to be used within Canvas context
 */
function SceneContent({ 
  onDoorClick, 
  knockCount, 
  isListening,
  shouldZoomOut,
  triggerNavigation
}: { 
  onDoorClick: () => void
  knockCount: number
  isListening: boolean
  shouldZoomOut: boolean
  triggerNavigation: () => void
}) {
  const { floorTextures } = useTextures()
  const { hasSeenIntro, isAnimating } = useAppSelector(state => state.intro)
  const { zoomOut, isAnimating: isCameraAnimating } = useCameraTransition()
  useResponsive() // Handle window resize and responsive behavior
  
  // Handle zoom-out when returning from game
  useEffect(() => {
    if (shouldZoomOut) {
      zoomOut()
    }
  }, [shouldZoomOut, zoomOut])

  return (
    <Scene>
      <Sky />
      <Lights />
      <Floor textures={floorTextures} />
      <House onDoorClick={onDoorClick} knockCount={knockCount} isListening={isListening} triggerNavigation={triggerNavigation} />
      <Graveyard count={30} />

      {/* Animated camera for intro sequence */}
      {isAnimating && <AnimatedCamera />}

      {/* OrbitControls with restricted zoom after intro */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={hasSeenIntro ? 3 : 2} // Restrict zoom after intro
        maxDistance={hasSeenIntro ? 12 : 20} // Restrict zoom after intro
        maxPolarAngle={Math.PI / 2 - 0.1} // Prevent camera from going below ground
        enabled={!isAnimating && !isCameraAnimating} // Disable controls during animations
      />
    </Scene>
  )
}
