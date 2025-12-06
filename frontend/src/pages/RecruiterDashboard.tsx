import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InterviewSession } from '../types'
import { interviewApi, analyticsApi } from '../services/api'
import { PageLayout, AudioPlayer, NotificationBell, BulkActions, useToast } from '../components'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './RecruiterDashboard.css'

const RecruiterDashboard = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null)
  const [transcript, setTranscript] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [selectedSessions, setSelectedSessions] = useState<Set<number>>(new Set())
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    startDate: '',
    endDate: '',
    page: 0,
    size: 10,
    sortBy: 'startedAt',
    sortDir: 'desc',
  })

  useEffect(() => {
    loadDashboardData()
  }, [filters])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load sessions with real API
      const params: any = {
        page: filters.page,
        size: filters.size,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
      }
      
      if (filters.status) params.status = filters.status
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      
      const sessionsResponse = await interviewApi.getAllSessions(params)
      setSessions(sessionsResponse.data.sessions || [])

      // Load dashboard statistics
      const statsResponse = await analyticsApi.getDashboardOverview()
      setStats(statsResponse.data)
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewSession = async (session: InterviewSession) => {
    setSelectedSession(session)
    try {
      const response = await interviewApi.getTranscript(session.sessionId)
      setTranscript(response.data)
    } catch (err) {
      console.error('Failed to load transcript')
    }
  }

  const handleExport = async (sessionId: string, format: 'pdf' | 'csv') => {
    try {
      const response = format === 'pdf'
        ? await interviewApi.exportPdf(sessionId)
        : await interviewApi.exportCsv(sessionId)

      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transcript_${sessionId}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to export transcript')
    }
  }

  const handleBulkAction = async (action: 'delete' | 'export') => {
    if (selectedSessions.size === 0) {
      showToast('Please select at least one session', 'warning')
      return
    }

    const selectedSessionIds = Array.from(selectedSessions)

    if (action === 'delete') {
      try {
        // Delete sessions one by one (or implement bulk delete API)
        await Promise.all(
          selectedSessionIds.map((id) => {
            const session = sessions.find((s) => s.id === id)
            return session ? interviewApi.updateSessionStatus(session.sessionId, 'ABANDONED') : Promise.resolve()
          })
        )
        showToast(`${selectedSessions.size} session(s) deleted`, 'success')
        setSelectedSessions(new Set())
        loadDashboardData()
      } catch (err) {
        showToast('Failed to delete sessions', 'error')
      }
    } else if (action === 'export') {
      try {
        const { exportToCsv } = await import('../utils/exportUtils')
        const selectedSessionsData = sessions
          .filter((s) => selectedSessions.has(s.id))
          .map((session) => ({
            'Session ID': session.sessionId,
            'Candidate': session.candidateName,
            'Template': session.templateName,
            'Status': session.status,
            'Started At': new Date(session.startedAt).toLocaleString(),
            'Total Turns': session.totalTurns
          }))
        exportToCsv(selectedSessionsData, `sessions_bulk_${new Date().toISOString().split('T')[0]}`)
        showToast(`${selectedSessions.size} session(s) exported`, 'success')
      } catch (err) {
        showToast('Failed to export sessions', 'error')
      }
    }
  }

  const toggleSessionSelection = (sessionId: number) => {
    const newSelected = new Set(selectedSessions)
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId)
    } else {
      newSelected.add(sessionId)
    }
    setSelectedSessions(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedSessions.size === sessions.length) {
      setSelectedSessions(new Set())
    } else {
      setSelectedSessions(new Set(sessions.map(s => s.id)))
    }
  }

  const handleShareSession = async (session: InterviewSession) => {
    try {
      const shareUrl = `${window.location.origin}/recruiter/sessions/${session.sessionId}/transcript`
      
      if (navigator.share) {
        await navigator.share({
          title: `Interview Results - ${session.candidateName}`,
          text: `Interview transcript for ${session.candidateName}`,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        showToast('Link copied to clipboard!', 'success')
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}/recruiter/sessions/${session.sessionId}/transcript`)
          showToast('Link copied to clipboard!', 'success')
        } catch (clipboardErr) {
          showToast('Failed to share. Please copy the URL manually.', 'error')
        }
      }
    }
  }

  if (loading && !sessions.length) {
    return <div className="loading">Loading dashboard...</div>
  }

  // Prepare chart data
  const interviewsByDayData = stats?.interviewsByDay ? Object.entries(stats.interviewsByDay).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count,
  })) : []

  const statusData = stats?.interviewsByStatus ? Object.entries(stats.interviewsByStatus).map(([status, count]) => ({
    status,
    count,
  })) : []

  return (
    <PageLayout 
      title="Recruiter Dashboard"
      actions={
        <>
          <NotificationBell />
          <button className="btn btn-primary" onClick={() => navigate('/recruiter/sessions/new')}>
            ➕ Create Session
          </button>
        </>
      }
    >
      <div className="dashboard-content">

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Candidates</h3>
            <p className="stat-value">{stats.totalCandidates}</p>
          </div>
          <div className="stat-card">
            <h3>Total Jobs</h3>
            <p className="stat-value">{stats.totalJobs}</p>
          </div>
          <div className="stat-card">
            <h3>Total Interviews</h3>
            <p className="stat-value">{stats.totalInterviews}</p>
          </div>
          <div className="stat-card">
            <h3>Active Interviews</h3>
            <p className="stat-value">{stats.activeInterviews}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-value">{stats.completedInterviews}</p>
          </div>
          <div className="stat-card">
            <h3>Completion Rate</h3>
            <p className="stat-value">{stats.completionRate?.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Charts */}
      {stats && (
        <div className="charts-section">
          <div className="chart-card">
            <h3>Interviews by Day (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={interviewsByDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#007bff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <h3>Interviews by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <div className="sessions-section">
          <div className="section-header">
            <h2 className="section-title">📋 RECENT INTERVIEW SESSIONS</h2>
            <button className="btn btn-primary" onClick={() => navigate('/recruiter/sessions')}>
              View All Sessions →
            </button>
          </div>

          {selectedSessions.size > 0 && (
            <BulkActions
              selectedCount={selectedSessions.size}
              onBulkDelete={() => handleBulkAction('delete')}
              onBulkExport={() => handleBulkAction('export')}
              availableActions={['delete', 'export']}
            />
          )}

          {/* Filters */}
          <div className="filters-bar">
            <input
              type="text"
              className="input"
              placeholder="Search by candidate name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 0 })}
            />
            <select
              className="input"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 0 })}
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
              <option value="ABANDONED">Abandoned</option>
            </select>
            <input
              type="date"
              className="input"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 0 })}
            />
            <input
              type="date"
              className="input"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 0 })}
            />
            <select
              className="input"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="startedAt">Sort by Date</option>
              <option value="totalTurns">Sort by Turns</option>
              <option value="candidateName">Sort by Candidate</option>
            </select>
            <select
              className="input"
              value={filters.sortDir}
              onChange={(e) => setFilters({ ...filters, sortDir: e.target.value })}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
            <button
              className="btn btn-secondary"
              onClick={() => setFilters({
                search: '',
                status: '',
                startDate: '',
                endDate: '',
                page: 0,
                size: 10,
                sortBy: 'startedAt',
                sortDir: 'desc',
              })}
            >
              Clear Filters
            </button>
          </div>

          {/* Sessions Table */}
          <div className="sessions-table-container">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedSessions.size === sessions.length && sessions.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Candidate</th>
                  <th>Template</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Turns</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedSessions.has(session.id)}
                        onChange={() => toggleSessionSelection(session.id)}
                      />
                    </td>
                    <td>{session.candidateName}</td>
                    <td>{session.templateName}</td>
                    <td>
                      <span className={`status-badge status-${session.status.toLowerCase()}`}>
                        {session.status}
                      </span>
                    </td>
                    <td>{new Date(session.startedAt).toLocaleDateString()}</td>
                    <td>{session.totalTurns}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-small btn-primary"
                          onClick={() => handleViewSession(session)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => navigate(`/recruiter/sessions/${session.sessionId}/replay`)}
                        >
                          Replay
                        </button>
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => handleShareSession(session)}
                        >
                          Share
                        </button>
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => handleExport(session.sessionId, 'pdf')}
                        >
                          PDF
                        </button>
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => handleExport(session.sessionId, 'csv')}
                        >
                          CSV
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="btn btn-secondary"
              disabled={filters.page === 0}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            >
              Previous
            </button>
            <span>Page {filters.page + 1}</span>
            <button
              className="btn btn-secondary"
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            >
              Next
            </button>
          </div>
        </div>

        {/* Session Details Panel */}
        {selectedSession && (
          <div className="session-details-panel">
            <div className="panel-header">
              <h2>Session Details</h2>
              <button className="btn btn-small btn-secondary" onClick={() => {
                setSelectedSession(null)
                setTranscript(null)
              }}>
                Close
              </button>
            </div>

            <div className="detail-section">
              <h3>Candidate</h3>
              <p>{selectedSession.candidateName}</p>
            </div>
            <div className="detail-section">
              <h3>Template</h3>
              <p>{selectedSession.templateName}</p>
            </div>
            <div className="detail-section">
              <h3>Status</h3>
              <p>{selectedSession.status}</p>
            </div>
            <div className="detail-section">
              <h3>Started</h3>
              <p>{new Date(selectedSession.startedAt).toLocaleString()}</p>
            </div>

            {/* Transcript View */}
            {transcript && (
              <div className="detail-section">
                <h3>Transcript</h3>
                <div className="transcript-preview">
                  {transcript.turns?.slice(0, 3).map((turn: any, index: number) => (
                    <div key={index} className="turn-preview">
                      <strong>Q{turn.turnNumber}:</strong> {turn.question}
                      {turn.answer && (
                        <>
                          <br />
                          <strong>A:</strong> {turn.answer.substring(0, 100)}...
                        </>
                      )}
                    </div>
                  ))}
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => navigate(`/recruiter/sessions/${selectedSession.sessionId}/transcript`)}
                  >
                    View Full Transcript
                  </button>
                </div>
              </div>
            )}

            {/* Audio Player */}
            {transcript?.turns?.some((t: any) => t.audioUrl) && (
              <div className="detail-section">
                <h3>Audio Recording</h3>
                <AudioPlayer audioUrl={transcript.turns.find((t: any) => t.audioUrl)?.audioUrl} />
              </div>
            )}

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
                <p className={`recommendation recommendation-${selectedSession.recommendation.toLowerCase()}`}>
                  {selectedSession.recommendation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </PageLayout>
  )
}

export default RecruiterDashboard
