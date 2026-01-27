import { useState, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface UseAssetLoaderOptions {
  models?: string[]
  textures?: string[]
}

interface AssetLoaderState {
  isLoading: boolean
  progress: number
  error: string | null
}

/**
 * Hook to preload and track loading progress of game assets
 * Returns loading state with progress percentage
 */
export function useAssetLoader({ models = [], textures = [] }: UseAssetLoaderOptions): AssetLoaderState {
  const [state, setState] = useState<AssetLoaderState>({
    isLoading: true,
    progress: 0,
    error: null
  })

  useEffect(() => {
    const totalAssets = models.length + textures.length
    if (totalAssets === 0) {
      setState({ isLoading: false, progress: 100, error: null })
      return
    }

    let loadedCount = 0

    const updateProgress = () => {
      loadedCount++
      const progress = Math.round((loadedCount / totalAssets) * 100)
      setState(prev => ({ ...prev, progress }))

      if (loadedCount === totalAssets) {
        // Small delay to ensure all assets are ready
        setTimeout(() => {
          setState({ isLoading: false, progress: 100, error: null })
        }, 100)
      }
    }

    const handleError = (error: Error) => {
      console.error('Asset loading error:', error)
      setState(prev => ({ ...prev, error: error.message }))
    }

    // Load models
    models.forEach(modelPath => {
      useGLTF.preload(modelPath)
      // Since preload doesn't return a promise, we simulate loading time
      setTimeout(updateProgress, 50)
    })

    // Load textures
    const textureLoader = new THREE.TextureLoader()
    textures.forEach(texturePath => {
      textureLoader.load(
        texturePath,
        () => updateProgress(),
        undefined,
        (error) => handleError(error as Error)
      )
    })
  }, [models.join(','), textures.join(',')])

  return state
}
