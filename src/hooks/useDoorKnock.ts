import { useState, useCallback, useRef } from 'react'

interface DoorKnockState {
  knockCount: number
  isListening: boolean
  timeoutId: number | null
}

/**
 * Custom hook to handle the "knock 3 times" door interaction
 * Tracks consecutive clicks within a time window
 */
export function useDoorKnock(onComplete: () => void, timeWindow = 2000) {
  const [knockState, setKnockState] = useState<DoorKnockState>({
    knockCount: 0,
    isListening: false,
    timeoutId: null
  })
  
  const stateRef = useRef(knockState)
  stateRef.current = knockState
  
  const resetKnocks = useCallback(() => {
    if (stateRef.current.timeoutId) {
      clearTimeout(stateRef.current.timeoutId)
    }
    setKnockState({
      knockCount: 0,
      isListening: false,
      timeoutId: null
    })
  }, [])
  
  const handleKnock = useCallback(() => {
    const currentState = stateRef.current
    
    // Clear existing timeout
    if (currentState.timeoutId) {
      clearTimeout(currentState.timeoutId)
    }
    
    const newKnockCount = currentState.knockCount + 1
    
    // Check if we've reached 3 knocks
    if (newKnockCount >= 3) {
      setKnockState({
        knockCount: 3, // Keep the count at 3 for UI feedback
        isListening: false,
        timeoutId: null
      })
      // Don't call onComplete immediately - let Door component handle timing
      // The Door component will call the navigation after animations complete
      return
    }
    
    // Set new timeout to reset knocks
    const timeoutId = window.setTimeout(() => {
      setKnockState(prev => ({
        ...prev,
        knockCount: 0,
        isListening: false,
        timeoutId: null
      }))
    }, timeWindow)
    
    setKnockState({
      knockCount: newKnockCount,
      isListening: true,
      timeoutId
    })
  }, [onComplete, timeWindow])
  
  const triggerNavigation = useCallback(() => {
    onComplete()
    // Reset after navigation
    setKnockState({
      knockCount: 0,
      isListening: false,
      timeoutId: null
    })
  }, [onComplete])
  
  return {
    knockCount: knockState.knockCount,
    isListening: knockState.isListening,
    handleKnock,
    resetKnocks,
    triggerNavigation
  }
}