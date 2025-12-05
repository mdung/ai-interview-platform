import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { interviewApi } from '../services/api'
import { InterviewSession } from '../types'
import './SessionList.css'

interface SessionListResponse {
  sessions: InterviewSession[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

const SessionList = () => {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<SessionListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    candidateId: '',
    templateId: '',
    startDate: '',
    endDate: '',
    page: 0,
    size: 20,
    sortBy: 'startedAt',
    sortDir: 'desc',
  })

  useEffect(() => {
    loadSessions()
  }, [filters])

  const loadSessions = async () => {
    setLoading(true)
    setError('')
    try {
      const params: any = {
        page: filters.page,
        size: filters.size,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
      }

      if (filters.status) params.status = filters.status
      if (filters.candidateId) params.candidateId = parseInt(filters.candidateId)
      if (filters.templateId) params.templateId = parseInt(filters.templateId)
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate

      const response = await interviewApi.getAllSessions(params)
      setSessions(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value, page: 0 })
  }

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage })
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
    } catch (err: any) {
      alert('Failed to export transcript')
    }
  }

  if (loading && !sessions) {
    return <div className="loading">Loading sessions...</div>
  }

  return (
    <div className="session-list-container">
      <div className="session-list-header">
        <h1>Interview Sessions</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-panel">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Status</label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
              <option value="ABANDONED">Abandoned</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              className="input"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              className="input"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Sort By</label>
            <select
              className="input"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="startedAt">Start Date</option>
              <option value="completedAt">Completion Date</option>
              <option value="totalTurns">Total Turns</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort Direction</label>
            <select
              className="input"
              value={filters.sortDir}
              onChange={(e) => handleFilterChange('sortDir', e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sessions-table-container">
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Candidate</th>
              <th>Template</th>
              <th>Status</th>
              <th>Started</th>
              <th>Turns</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions?.sessions.map((session) => (
              <tr key={session.id}>
                <td>{session.sessionId.substring(0, 8)}...</td>
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
                      onClick={() => navigate(`/recruiter/sessions/${session.sessionId}/transcript`)}
                    >
                      View
                    </button>
                    {session.status === 'IN_PROGRESS' && (
                      <button
                        className="btn btn-small btn-warning"
                        onClick={async () => {
                          try {
                            await interviewApi.pauseSession(session.sessionId)
                            loadSessions()
                          } catch (err) {
                            alert('Failed to pause session')
                          }
                        }}
                      >
                        Pause
                      </button>
                    )}
                    {session.status === 'PAUSED' && (
                      <button
                        className="btn btn-small btn-success"
                        onClick={async () => {
                          try {
                            await interviewApi.resumeSession(session.sessionId)
                            loadSessions()
                          } catch (err) {
                            alert('Failed to resume session')
                          }
                        }}
                      >
                        Resume
                      </button>
                    )}
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

      {sessions && sessions.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={filters.page === 0}
            onClick={() => handlePageChange(filters.page - 1)}
          >
            Previous
          </button>
          <span>
            Page {filters.page + 1} of {sessions.totalPages} ({sessions.totalElements} total)
          </span>
          <button
            className="btn btn-secondary"
            disabled={filters.page >= sessions.totalPages - 1}
            onClick={() => handlePageChange(filters.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default SessionList

