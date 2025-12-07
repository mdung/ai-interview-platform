import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { I18nProvider } from './contexts/I18nContext'
import { ToastProvider } from './components/ToastContainer'
import ErrorBoundary from './components/ErrorBoundary'
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
import AdvancedAnalytics from './pages/AdvancedAnalytics'
import CalendarView from './pages/CalendarView'
import Settings from './pages/Settings'
import CreateSession from './pages/CreateSession'
import InterviewReplay from './pages/InterviewReplay'
import JobDetails from './pages/JobDetails'
import JobCandidates from './pages/JobCandidates'
import CandidateDetails from './pages/CandidateDetails'
import SessionAnalytics from './pages/SessionAnalytics'
import JobAnalytics from './pages/JobAnalytics'
import Reports from './pages/Reports'
import AdminHealth from './pages/AdminHealth'
import ATSIntegration from './pages/ATSIntegration'
import VideoInterview from './pages/VideoInterview'
import TechnicalInterview from './pages/TechnicalInterview'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <ToastProvider>
            <Router>
              <a href="#main-content" className="skip-to-main">
                Skip to main content
              </a>
              <main id="main-content">
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/interview/:sessionId" element={<CandidateInterview />} />
                  <Route path="/recruiter" element={<RecruiterDashboard />} />
                  <Route path="/recruiter/sessions" element={<SessionList />} />
                  <Route path="/recruiter/sessions/new" element={<CreateSession />} />
                  <Route path="/recruiter/sessions/:sessionId/transcript" element={<TranscriptView />} />
                  <Route path="/recruiter/sessions/:sessionId/replay" element={<InterviewReplay />} />
                  <Route path="/recruiter/sessions/:sessionId/analytics" element={<SessionAnalytics />} />
                  <Route path="/recruiter/jobs" element={<JobList />} />
                  <Route path="/recruiter/jobs/new" element={<JobForm />} />
                  <Route path="/recruiter/jobs/:id" element={<JobDetails />} />
                  <Route path="/recruiter/jobs/:id/edit" element={<JobForm />} />
                  <Route path="/recruiter/jobs/:id/candidates" element={<JobCandidates />} />
                  <Route path="/recruiter/templates" element={<TemplateList />} />
                  <Route path="/recruiter/templates/new" element={<TemplateForm />} />
                  <Route path="/recruiter/templates/:id" element={<TemplateForm />} />
                  <Route path="/recruiter/templates/:id/edit" element={<TemplateForm />} />
                  <Route path="/recruiter/candidates" element={<CandidateManagement />} />
                  <Route path="/recruiter/candidates/new" element={<CandidateForm />} />
                  <Route path="/recruiter/candidates/:id" element={<CandidateDetails />} />
                  <Route path="/recruiter/candidates/:id/edit" element={<CandidateForm />} />
                  <Route path="/recruiter/analytics" element={<Analytics />} />
                  <Route path="/recruiter/analytics/advanced" element={<AdvancedAnalytics />} />
                  <Route path="/recruiter/analytics/jobs" element={<JobAnalytics />} />
                  <Route path="/recruiter/reports" element={<Reports />} />
                  <Route path="/recruiter/calendar" element={<CalendarView />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/ats" element={<ATSIntegration />} />
                  <Route path="/interviews/:sessionId/video" element={<VideoInterview />} />
                  <Route path="/interviews/:sessionId/technical" element={<TechnicalInterview />} />
                </Routes>
              </main>
            </Router>
          </ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App

