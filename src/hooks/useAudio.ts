import { useRef, useCallback } from 'react'

/**
 * Custom hook for playing audio effects
 * Provides simple audio playback with volume control and error handling
 */
export function useAudio() {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())

  // Preload audio files
  const preloadAudio = useCallback((src: string, volume: number = 0.5) => {
    if (audioRefs.current.has(src)) return

    const audio = new Audio(src)
    audio.volume = volume
    audio.preload = 'auto'
    
    // Handle loading errors gracefully
    audio.addEventListener('error', (e) => {
      console.warn(`Failed to load audio: ${src}`, e)
    })

    audioRefs.current.set(src, audio)
  }, [])

  // Play audio with optional volume override
  const playAudio = useCallback((src: string, volume?: number) => {
    let audio = audioRefs.current.get(src)
    
    // Create audio element if not preloaded
    if (!audio) {
      audio = new Audio(src)
      audio.volume = volume ?? 0.5
      audioRefs.current.set(src, audio)
    } else if (volume !== undefined) {
      audio.volume = volume
    }

    // Reset to beginning and play
    audio.currentTime = 0
    
    const playPromise = audio.play()
    if (playPromise) {
      playPromise.catch((error) => {
        console.warn(`Failed to play audio: ${src}`, error)
      })
    }
  }, [])

  // Stop audio
  const stopAudio = useCallback((src: string) => {
    const audio = audioRefs.current.get(src)
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }, [])

  return {
    preloadAudio,
    playAudio,
    stopAudio
  }
}