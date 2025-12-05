import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import HauntedHousePage from './pages/HauntedHousePage'
import GamePage from './pages/GamePage'
import SimpleGLBTest from './components/test/SimpleGLBTest'

function App() {
  // Temporarily show simple GLB test
  if (window.location.search.includes('test=boy')) {
    return <SimpleGLBTest />
  }

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<HauntedHousePage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
