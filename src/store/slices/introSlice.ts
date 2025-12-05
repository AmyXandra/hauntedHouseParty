import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IntroState {
  hasSeenIntro: boolean
  isAnimating: boolean
  animationPhase: 'initial' | 'title-fade-in' | 'zooming' | 'complete'
  animationProgress: number // 0 to 1
}

const initialState: IntroState = {
  hasSeenIntro: false,
  isAnimating: false,
  animationPhase: 'initial',
  animationProgress: 0,
}

const introSlice = createSlice({
  name: 'intro',
  initialState,
  reducers: {
    startIntroAnimation: (state) => {
      state.isAnimating = true
      state.animationPhase = 'title-fade-in'
      state.animationProgress = 0
    },
    updateAnimationPhase: (state, action: PayloadAction<IntroState['animationPhase']>) => {
      state.animationPhase = action.payload
    },
    updateAnimationProgress: (state, action: PayloadAction<number>) => {
      state.animationProgress = Math.max(0, Math.min(1, action.payload))
    },
    completeIntroAnimation: (state) => {
      state.hasSeenIntro = true
      state.isAnimating = false
      state.animationPhase = 'complete'
      state.animationProgress = 1
      // Persist to localStorage
      localStorage.setItem('hauntedHouse_hasSeenIntro', 'true')
    },
    loadIntroState: (state) => {
      const hasSeenIntro = localStorage.getItem('hauntedHouse_hasSeenIntro') === 'true'
      state.hasSeenIntro = hasSeenIntro
      if (hasSeenIntro) {
        state.animationPhase = 'complete'
        state.animationProgress = 1
      }
    },
    resetIntroState: (state) => {
      state.hasSeenIntro = false
      state.isAnimating = false
      state.animationPhase = 'initial'
      state.animationProgress = 0
      localStorage.removeItem('hauntedHouse_hasSeenIntro')
    },
  },
})

export const {
  startIntroAnimation,
  updateAnimationPhase,
  updateAnimationProgress,
  completeIntroAnimation,
  loadIntroState,
  resetIntroState,
} = introSlice.actions

export default introSlice.reducer