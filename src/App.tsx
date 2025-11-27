import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Dashboard from './Dashboard'
import { ThemeProvider } from "./components/common/theme-provider"
import { WorkflowProvider } from './context/WorkflowContext'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <WorkflowProvider>
        <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {/* Adicione outras rotas conforme necessário */}
            </Routes>
        </Router>
      </WorkflowProvider>
    </ThemeProvider>
  )
}

export default App