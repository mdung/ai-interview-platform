import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CandidateInterview from './pages/CandidateInterview'
import RecruiterDashboard from './pages/RecruiterDashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import AdminUsers from './pages/AdminUsers'
import AdminPanel from './pages/AdminPanel'
import SessionList from './pages/SessionList'
import TranscriptView from './pages/TranscriptView'
import JobList from './pages/JobList'
import JobForm from './pages/JobForm'
import TemplateList from './pages/TemplateList'
import TemplateForm from './pages/TemplateForm'
import CandidateManagement from './pages/CandidateManagement'
import CandidateForm from './pages/CandidateForm'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/interview/:sessionId" element={<CandidateInterview />} />
        <Route path="/recruiter" element={<RecruiterDashboard />} />
        <Route path="/recruiter/sessions" element={<SessionList />} />
        <Route path="/recruiter/sessions/:sessionId/transcript" element={<TranscriptView />} />
        <Route path="/recruiter/jobs" element={<JobList />} />
        <Route path="/recruiter/jobs/new" element={<JobForm />} />
        <Route path="/recruiter/jobs/:id" element={<JobForm />} />
        <Route path="/recruiter/jobs/:id/edit" element={<JobForm />} />
        <Route path="/recruiter/templates" element={<TemplateList />} />
        <Route path="/recruiter/templates/new" element={<TemplateForm />} />
        <Route path="/recruiter/templates/:id" element={<TemplateForm />} />
        <Route path="/recruiter/templates/:id/edit" element={<TemplateForm />} />
        <Route path="/recruiter/candidates" element={<CandidateManagement />} />
        <Route path="/recruiter/candidates/new" element={<CandidateForm />} />
        <Route path="/recruiter/candidates/:id" element={<CandidateForm />} />
        <Route path="/recruiter/candidates/:id/edit" element={<CandidateForm />} />
        <Route path="/recruiter/analytics" element={<Analytics />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Routes>
    </Router>
  )
}

export default App

