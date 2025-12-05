import { useEffect, useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import './IntroOverlay.css'

interface IntroOverlayProps {
  knockCount?: number
  isListening?: boolean
}

/**
 * UI overlay component that displays animated text during intro
 * and persistent UI elements after animation completes
 */
export default function IntroOverlay({ knockCount = 0, isListening = false }: IntroOverlayProps = {}) {
  const { hasSeenIntro, isAnimating, animationPhase } = useAppSelector(state => state.intro)
  const [titleVisible, setTitleVisible] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)
  const [instructionVisible, setInstructionVisible] = useState(false)
  
  // Handle title animation during intro
  useEffect(() => {
    if (isAnimating && animationPhase === 'title-fade-in') {
      const timer = setTimeout(() => {
        setTitleVisible(true)
      }, 500) // Small delay before title appears
      
      return () => clearTimeout(timer)
    }
  }, [isAnimating, animationPhase])
  
  // Handle persistent UI elements after animation
  useEffect(() => {
    if (hasSeenIntro && animationPhase === 'complete') {
      setTitleVisible(false) // Hide large title
      setLogoVisible(true) // Show small logo
      setInstructionVisible(true) // Show instruction text
    }
  }, [hasSeenIntro, animationPhase])
  
  // Show persistent UI immediately if user has seen intro
  useEffect(() => {
    if (hasSeenIntro && !isAnimating) {
      setLogoVisible(true)
      setInstructionVisible(true)
    }
  }, [hasSeenIntro, isAnimating])
  
  return (
    <div className="intro-overlay">
      {/* Large animated title during intro */}
      {isAnimating && (
        <div className={`intro-title ${titleVisible ? 'visible' : ''}`}>
          <h1 className="creepster-font">Haunted House Party</h1>
        </div>
      )}
      
      {/* Persistent logo (top-left) */}
      {logoVisible && (
        <div className="persistent-logo">
          <h2 className="creepster-font">Haunted House Party</h2>
        </div>
      )}
      
      {/* Instruction text (bottom-center) */}
      {instructionVisible && (
        <div className="instruction-text">
          <p className="im-fell-english-font">
            Knock on the door 3 times to enter
            {isListening && knockCount > 0 && (
              <span className="knock-progress"> ({knockCount}/3)</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}