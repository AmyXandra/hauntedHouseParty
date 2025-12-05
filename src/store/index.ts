import { configureStore } from '@reduxjs/toolkit'
import introReducer from './slices/introSlice'

export const store = configureStore({
  reducer: {
    intro: introReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch