import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { interviewApi } from '../services/api'
import { useToast } from '../components'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './SessionAnalytics.css'

interface Turn {
  id: number
  turnNumber: number
  question: string
  answer: string | null
  communicationScore: number | null
  technicalScore: number | null
  clarityScore: number | null
  answerDurationMs: number | null
}

interface Session {
  sessionId: string
  candidateName: string
  templateName: string
  status: string
  startedAt: string
  completedAt?: string
  totalTurns: number
  turns: Turn[]
}

const SessionAnalytics = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sessionId) {
      loadSessionData()
    }
  }, [sessionId])

  const loadSessionData = async () => {
    if (!sessionId) return

    setLoading(true)
    setError('')
    try {
      const [sessionRes, turnsRes] = await Promise.all([
        interviewApi.getSession(sessionId),
        interviewApi.getTurns(sessionId)
      ])
      
      setSession({
        ...sessionRes.data,
        turns: turnsRes.data || []
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load session data')
    } finally {
      setLoading(false)
    }
  }

  const handleSendLink = async () => {
    if (!sessionId) return

    try {
      await interviewApi.sendInterviewLink(sessionId)
      showToast('Interview link sent successfully', 'success')
    } catch (err: any) {
      showToast('Failed to send interview link', 'error')
    }
  }

  if (loading) {
    return <div className="loading">Loading analytics...</div>
  }

  if (error || !session) {
    return (
      <div className="session-analytics-container">
        <div className="error-message">{error || 'Session not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    )
  }

  // Prepare chart data
  const scoreData = session.turns
    .filter(t => t.communicationScore || t.technicalScore || t.clarityScore)
    .map(t => ({
      turn: t.turnNumber,
      communication: t.communicationScore || 0,
      technical: t.technicalScore || 0,
      clarity: t.clarityScore || 0,
    }))

  const durationData = session.turns
    .filter(t => t.answerDurationMs)
    .map(t => ({
      turn: t.turnNumber,
      duration: Math.round((t.answerDurationMs || 0) / 1000), // Convert to seconds
    }))

  const averageScores = {
    communication: session.turns
      .filter(t => t.communicationScore)
      .reduce((sum, t) => sum + (t.communicationScore || 0), 0) / 
      session.turns.filter(t => t.communicationScore).length || 0,
    technical: session.turns
      .filter(t => t.technicalScore)
      .reduce((sum, t) => sum + (t.technicalScore || 0), 0) / 
      session.turns.filter(t => t.technicalScore).length || 0,
    clarity: session.turns
      .filter(t => t.clarityScore)
      .reduce((sum, t) => sum + (t.clarityScore || 0), 0) / 
      session.turns.filter(t => t.clarityScore).length || 0,
  }

  const scoreDistribution = [
    { name: 'Communication', value: averageScores.communication },
    { name: 'Technical', value: averageScores.technical },
    { name: 'Clarity', value: averageScores.clarity },
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

  return (
    <div className="session-analytics-container">
      <div className="analytics-header">
        <div>
          <h1>Session Analytics</h1>
          <p className="session-info">
            {session.candidateName} | {session.templateName} | {session.sessionId}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleSendLink}>
            Send Interview Link
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/recruiter/sessions/${sessionId}/transcript`)}
          >
            View Transcript
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      <div className="analytics-stats">
        <div className="stat-card">
          <h3>Total Turns</h3>
          <p className="stat-value">{session.totalTurns}</p>
        </div>
        <div className="stat-card">
          <h3>Average Communication Score</h3>
          <p className="stat-value">
            {averageScores.communication > 0
              ? averageScores.communication.toFixed(1)
              : 'N/A'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Average Technical Score</h3>
          <p className="stat-value">
            {averageScores.technical > 0 ? averageScores.technical.toFixed(1) : 'N/A'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Average Clarity Score</h3>
          <p className="stat-value">
            {averageScores.clarity > 0 ? averageScores.clarity.toFixed(1) : 'N/A'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Status</h3>
          <p className="stat-value">{session.status}</p>
        </div>
        <div className="stat-card">
          <h3>Duration</h3>
          <p className="stat-value">
            {session.completedAt && session.startedAt
              ? `${Math.round(
                  (new Date(session.completedAt).getTime() -
                    new Date(session.startedAt).getTime()) /
                    60000
                )} min`
              : 'In Progress'}
          </p>
        </div>
      </div>

      <div className="analytics-charts">
        {scoreData.length > 0 && (
          <div className="chart-card">
            <h2>Score Trends by Turn</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="turn" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="communication"
                  stroke="#0088FE"
                  strokeWidth={2}
                  name="Communication"
                />
                <Line
                  type="monotone"
                  dataKey="technical"
                  stroke="#00C49F"
                  strokeWidth={2}
                  name="Technical"
                />
                <Line
                  type="monotone"
                  dataKey="clarity"
                  stroke="#FFBB28"
                  strokeWidth={2}
                  name="Clarity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {durationData.length > 0 && (
          <div className="chart-card">
            <h2>Answer Duration by Turn</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={durationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="turn" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="duration" fill="#8884d8" name="Duration (seconds)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {averageScores.communication > 0 && (
          <div className="chart-card">
            <h2>Average Score Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionAnalytics

