import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import HauntedHousePage from './pages/HauntedHousePage'
import GamePage from './pages/GamePage'

describe('App Routing', () => {
  it('should render HauntedHousePage at root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HauntedHousePage />} />
        </Routes>
      </MemoryRouter>
    )
    
    // Canvas should be present (R3F renders a canvas element)
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeTruthy()
  })

  it('should render GamePage at /game/:gameId path', () => {
    render(
      <MemoryRouter initialEntries={['/game/game1']}>
        <Routes>
          <Route path="/game/:gameId" element={<GamePage />} />
        </Routes>
      </MemoryRouter>
    )
    
    // Game1 content should be present
    expect(screen.getByText('Mystery Maze')).toBeTruthy()
  })

  it('should show error for invalid game ID', () => {
    render(
      <MemoryRouter initialEntries={['/game/invalid']}>
        <Routes>
          <Route path="/game/:gameId" element={<GamePage />} />
        </Routes>
      </MemoryRouter>
    )
    
    // Error message should be present
    expect(screen.getByText('Game Not Found')).toBeTruthy()
  })
})
