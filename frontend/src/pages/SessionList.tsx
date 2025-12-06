import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { interviewApi } from '../services/api'
import { InterviewSession } from '../types'
import { exportToCsv, downloadBlob } from '../utils/exportUtils'
import { PageLayout, BulkActions, useToast } from '../components'
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
  const { showToast } = useToast()
  const [sessions, setSessions] = useState<SessionListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [selectedSessions, setSelectedSessions] = useState<Set<number>>(new Set())

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

  const handleBulkDelete = async () => {
    if (selectedSessions.size === 0) return
    
    try {
      await Promise.all(
        Array.from(selectedSessions).map((id) => {
          const session = sessions?.sessions.find((s) => s.id === id)
          return session ? interviewApi.updateSessionStatus(session.sessionId, 'ABANDONED') : Promise.resolve()
        })
      )
      showToast(`${selectedSessions.size} session(s) deleted`, 'success')
      setSelectedSessions(new Set())
      loadSessions()
    } catch (err) {
      showToast('Failed to delete sessions', 'error')
    }
  }

  const handleBulkExport = () => {
    if (selectedSessions.size === 0) {
      showToast('Please select sessions to export', 'warning')
      return
    }

    const selectedData = sessions?.sessions
      .filter((s) => selectedSessions.has(s.id))
      .map((session) => ({
        'Session ID': session.sessionId,
        'Candidate': session.candidateName,
        'Template': session.templateName,
        'Status': session.status,
        'Started At': new Date(session.startedAt).toLocaleString(),
        'Total Turns': session.totalTurns
      })) || []

    exportToCsv(selectedData, `sessions_selected_${new Date().toISOString().split('T')[0]}`)
    showToast(`${selectedSessions.size} session(s) exported`, 'success')
  }

  const toggleSessionSelection = (id: number) => {
    const newSelected = new Set(selectedSessions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedSessions(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedSessions.size === sessions?.sessions.length) {
      setSelectedSessions(new Set())
    } else {
      setSelectedSessions(new Set(sessions?.sessions.map((s) => s.id) || []))
    }
  }

  const handleExport = async (sessionId: string, format: 'pdf' | 'csv') => {
    try {
      setExporting(true)
      const response = format === 'pdf'
        ? await interviewApi.exportPdf(sessionId)
        : await interviewApi.exportCsv(sessionId)

      downloadBlob(
        response.data,
        `transcript_${sessionId}.${format}`,
        format === 'pdf' ? 'application/pdf' : 'text/csv'
      )
      showToast(`Transcript exported as ${format.toUpperCase()}`, 'success')
    } catch (err: any) {
      showToast('Failed to export transcript', 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleExportAll = async (format: 'csv' | 'json') => {
    if (!sessions || sessions.sessions.length === 0) {
      showToast('No sessions to export', 'warning')
      return
    }

    try {
      setExporting(true)
      const exportData = sessions.sessions.map((session) => ({
        'Session ID': session.sessionId,
        'Candidate': session.candidateName,
        'Template': session.templateName,
        'Status': session.status,
        'Started At': new Date(session.startedAt).toLocaleString(),
        'Completed At': session.completedAt ? new Date(session.completedAt).toLocaleString() : 'N/A',
        'Total Turns': session.totalTurns,
        'Recommendation': session.recommendation || 'N/A'
      }))

      if (format === 'csv') {
        exportToCsv(exportData, `sessions_export_${new Date().toISOString().split('T')[0]}`)
      } else {
        const { exportToJson } = await import('../utils/exportUtils')
        exportToJson(exportData, `sessions_export_${new Date().toISOString().split('T')[0]}`)
      }
      showToast(`All sessions exported as ${format.toUpperCase()}`, 'success')
    } catch (err: any) {
      showToast('Failed to export sessions', 'error')
    } finally {
      setExporting(false)
    }
  }

  if (loading && !sessions) {
    return <div className="loading">Loading sessions...</div>
  }

  return (
    <PageLayout
      title="All Interview Sessions"
      actions={
        <>
          <button
            className="btn btn-secondary"
            onClick={() => handleExportAll('csv')}
            disabled={exporting || !sessions || sessions.sessions.length === 0}
          >
            {exporting ? '⏳ Exporting...' : '📥 Export All (CSV)'}
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/recruiter/sessions/new')}>
            ➕ Create New Session
          </button>
          <button className="btn btn-info" onClick={() => navigate('/recruiter/calendar')}>
            📅 Calendar View
          </button>
        </>
      }
    >
      <div className="session-list-content">
        {error && <div className="error-message">{error}</div>}

      {selectedSessions.size > 0 && (
        <BulkActions
          selectedCount={selectedSessions.size}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
          availableActions={['delete', 'export']}
        />
      )}

      <div className="filters-panel">
        <h3 className="filter-title">🔍 SEARCH & FILTER OPTIONS</h3>
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
              <th>
                <input
                  type="checkbox"
                  checked={selectedSessions.size === sessions?.sessions.length && sessions.sessions.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
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
                <td>
                  <input
                    type="checkbox"
                    checked={selectedSessions.has(session.id)}
                    onChange={() => toggleSessionSelection(session.id)}
                  />
                </td>
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
    </PageLayout>
  )
}

export default SessionList

