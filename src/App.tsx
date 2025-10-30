import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import Home from './Home'
import './App.css'
import Dashboard from './Dashboard'
import { ThemeProvider } from "./components/common/theme-provider"
import { WorkFlowProvider } from './context/WorkflowContext'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <WorkFlowProvider>
        <Router>
          <Routes>
            {/* <Route path="/home" element={<Home />} /> */}
            <Route path="/" element={<Dashboard />} />
            {/* Adicione outras rotas conforme necessário */}
          </Routes>
        </Router>
      </WorkFlowProvider>
    </ThemeProvider>
  )
}

export default App