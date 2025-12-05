import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobApi } from '../services/api'
import './JobList.css'

interface Job {
  id: number
  title: string
  description: string
  seniorityLevel: string
  requiredSkills: string[]
  softSkills: string[]
  active: boolean
  createdAt: string
}

interface JobListResponse {
  jobs: Job[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

const JobList = () => {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<JobListResponse | null>(null)
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
    loadJobs()
  }, [filters])

  const loadJobs = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await jobApi.getAllJobs(filters)
      setJobs(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return
    }

    try {
      await jobApi.deleteJob(id)
      loadJobs()
    } catch (err: any) {
      alert('Failed to delete job')
    }
  }

  if (loading && !jobs) {
    return <div className="loading">Loading jobs...</div>
  }

  return (
    <div className="job-list-container">
      <div className="job-list-header">
        <h1>Job Management</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/recruiter/jobs/new')}>
            Create New Job
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
            placeholder="Search by title or description..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 0 })}
          />
        </div>
      </div>

      <div className="jobs-table-container">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Seniority</th>
              <th>Required Skills</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs?.jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.id}</td>
                <td>{job.title}</td>
                <td>
                  <span className={`seniority-badge seniority-${job.seniorityLevel.toLowerCase()}`}>
                    {job.seniorityLevel}
                  </span>
                </td>
                <td>{job.requiredSkills?.slice(0, 3).join(', ') || 'N/A'}</td>
                <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() => navigate(`/recruiter/jobs/${job.id}`)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(job.id)}
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

      {jobs && jobs.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={filters.page === 0}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            Previous
          </button>
          <span>
            Page {filters.page + 1} of {jobs.totalPages} ({jobs.totalElements} total)
          </span>
          <button
            className="btn btn-secondary"
            disabled={filters.page >= jobs.totalPages - 1}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default JobList

