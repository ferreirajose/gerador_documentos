import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Adicione outras rotas conforme necessário */}
      </Routes>
    </Router>
  )
}

export default App