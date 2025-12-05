import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InterviewSession } from '../types'
import { interviewApi } from '../services/api'
import './RecruiterDashboard.css'

const RecruiterDashboard = () => {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll use mock data
    setLoading(false)
  }, [])

  const handleViewSession = (session: InterviewSession) => {
    setSelectedSession(session)
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="recruiter-dashboard">
      <div className="dashboard-header">
        <h1>Recruiter Dashboard</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/recruiter/sessions')}>
            View All Sessions
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/profile')}>
            Profile
          </button>
          <button className="btn btn-secondary" onClick={() => {
            localStorage.removeItem('token')
            navigate('/')
          }}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="sessions-list">
          <h2>Interview Sessions</h2>
          <div className="sessions-grid">
            {sessions.length === 0 ? (
              <div className="empty-state">
                <p>No interview sessions yet.</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="session-card"
                  onClick={() => handleViewSession(session)}
                >
                  <h3>{session.candidateName}</h3>
                  <p>Template: {session.templateName}</p>
                  <p>Status: {session.status}</p>
                  <p>Turns: {session.totalTurns}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedSession && (
          <div className="session-details">
            <h2>Session Details</h2>
            <div className="detail-section">
              <h3>Candidate</h3>
              <p>{selectedSession.candidateName}</p>
            </div>
            <div className="detail-section">
              <h3>Status</h3>
              <p>{selectedSession.status}</p>
            </div>
            {selectedSession.aiSummary && (
              <div className="detail-section">
                <h3>AI Summary</h3>
                <p>{selectedSession.aiSummary}</p>
              </div>
            )}
            {selectedSession.strengths && (
              <div className="detail-section">
                <h3>Strengths</h3>
                <p>{selectedSession.strengths}</p>
              </div>
            )}
            {selectedSession.weaknesses && (
              <div className="detail-section">
                <h3>Weaknesses</h3>
                <p>{selectedSession.weaknesses}</p>
              </div>
            )}
            {selectedSession.recommendation && (
              <div className="detail-section">
                <h3>Recommendation</h3>
                <p className={`recommendation ${selectedSession.recommendation.toLowerCase()}`}>
                  {selectedSession.recommendation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecruiterDashboard

