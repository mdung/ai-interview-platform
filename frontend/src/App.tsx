import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CandidateInterview from './pages/CandidateInterview'
import RecruiterDashboard from './pages/RecruiterDashboard'
import Login from './pages/Login'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/interview/:sessionId" element={<CandidateInterview />} />
        <Route path="/recruiter" element={<RecruiterDashboard />} />
      </Routes>
    </Router>
  )
}

export default App

