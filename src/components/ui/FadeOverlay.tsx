import { useEffect, useState } from 'react'
import './FadeOverlay.css'

interface FadeOverlayProps {
  isActive: boolean
  progress: number // 0 to 1
}

/**
 * Full-screen fade to black overlay for transition effect
 * Opacity increases with progress from 0 (transparent) to 1 (fully black)
 */
export default function FadeOverlay({ isActive, progress }: FadeOverlayProps) {
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    if (isActive) {
      setOpacity(progress)
    } else {
      setOpacity(0)
    }
  }, [isActive, progress])

  if (!isActive && opacity === 0) {
    return null
  }

  return (
    <div
      className="fade-overlay"
      style={{
        opacity,
        pointerEvents: opacity > 0 ? 'auto' : 'none'
      }}
    />
  )
}
