import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { candidateApi } from '../services/api'
import './CandidateManagement.css'

interface Candidate {
  id: number
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  resumeUrl: string
  linkedInUrl: string
  createdAt: string
}

interface CandidateListResponse {
  candidates: Candidate[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

const CandidateManagement = () => {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState<CandidateListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    page: 0,
    size: 20,
    sortBy: 'id',
    sortDir: 'desc',
  })

  useEffect(() => {
    loadCandidates()
  }, [filters])

  const loadCandidates = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await candidateApi.getAllCandidates(filters)
      setCandidates(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) {
      return
    }

    try {
      await candidateApi.bulkDelete([id])
      loadCandidates()
    } catch (err: any) {
      alert('Failed to delete candidate')
    }
  }

  const handleDownloadResume = async (id: number) => {
    try {
      const response = await candidateApi.downloadResume(id)
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `resume_${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      alert('Failed to download resume')
    }
  }

  if (loading && !candidates) {
    return <div className="loading">Loading candidates...</div>
  }

  return (
    <div className="candidate-management-container">
      <div className="candidate-management-header">
        <h1>Candidate Management</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/recruiter/candidates/new')}>
            Add Candidate
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-panel">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            className="input"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 0 })}
          />
        </div>
      </div>

      <div className="candidates-table-container">
        <table className="candidates-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Resume</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates?.candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>{candidate.id}</td>
                <td>{candidate.firstName} {candidate.lastName}</td>
                <td>{candidate.email}</td>
                <td>{candidate.phoneNumber || 'N/A'}</td>
                <td>
                  {candidate.resumeUrl ? (
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() => handleDownloadResume(candidate.id)}
                    >
                      Download
                    </button>
                  ) : (
                    <span>No resume</span>
                  )}
                </td>
                <td>{new Date(candidate.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() => navigate(`/recruiter/candidates/${candidate.id}`)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() => navigate(`/recruiter/candidates/${candidate.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(candidate.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {candidates && candidates.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={filters.page === 0}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            Previous
          </button>
          <span>
            Page {filters.page + 1} of {candidates.totalPages} ({candidates.totalElements} total)
          </span>
          <button
            className="btn btn-secondary"
            disabled={filters.page >= candidates.totalPages - 1}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default CandidateManagement

