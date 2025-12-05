import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAudio } from './useAudio'

// Mock HTMLAudioElement
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  currentTime: 0,
  volume: 0.5,
  preload: 'auto',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}

// Mock Audio constructor
;(globalThis as any).Audio = vi.fn().mockImplementation(() => mockAudio)

describe('useAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should preload audio files', () => {
    const { result } = renderHook(() => useAudio())
    
    result.current.preloadAudio('/sounds/test.mp3', 0.7)
    
    expect((globalThis as any).Audio).toHaveBeenCalledWith('/sounds/test.mp3')
    expect(mockAudio.volume).toBe(0.7)
    expect(mockAudio.preload).toBe('auto')
  })

  it('should play audio files', () => {
    const { result } = renderHook(() => useAudio())
    
    result.current.playAudio('/sounds/test.mp3')
    
    expect((globalThis as any).Audio).toHaveBeenCalledWith('/sounds/test.mp3')
    expect(mockAudio.currentTime).toBe(0)
    expect(mockAudio.play).toHaveBeenCalled()
  })

  it('should stop audio files', () => {
    const { result } = renderHook(() => useAudio())
    
    // First preload the audio
    result.current.preloadAudio('/sounds/test.mp3')
    
    // Then stop it
    result.current.stopAudio('/sounds/test.mp3')
    
    expect(mockAudio.pause).toHaveBeenCalled()
    expect(mockAudio.currentTime).toBe(0)
  })

  it('should handle audio play errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockAudio.play.mockRejectedValueOnce(new Error('Play failed'))
    
    const { result } = renderHook(() => useAudio())
    
    result.current.playAudio('/sounds/test.mp3')
    
    expect(mockAudio.play).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })
})