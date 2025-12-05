import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import HauntedHousePage from './pages/HauntedHousePage'
import GamePage from './pages/GamePage'

function App() {

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
