import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobApi } from '../services/api'
import { exportToCsv } from '../utils/exportUtils'
import { BulkActions, useToast, PageLayout } from '../components'
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
  const { showToast } = useToast()
  const [jobs, setJobs] = useState<JobListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [selectedJobs, setSelectedJobs] = useState<Set<number>>(new Set())
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
      showToast('Job deleted successfully', 'success')
      loadJobs()
    } catch (err: any) {
      showToast('Failed to delete job', 'error')
    }
  }

  const handleExportAll = () => {
    if (!jobs || jobs.jobs.length === 0) {
      showToast('No jobs to export', 'warning')
      return
    }

    try {
      setExporting(true)
      const exportData = jobs.jobs.map((job) => ({
        'ID': job.id,
        'Title': job.title,
        'Description': job.description?.substring(0, 100) || 'N/A',
        'Seniority Level': job.seniorityLevel,
        'Required Skills': job.requiredSkills?.join('; ') || 'N/A',
        'Soft Skills': job.softSkills?.join('; ') || 'N/A',
        'Active': job.active ? 'Yes' : 'No',
        'Created At': new Date(job.createdAt).toLocaleString()
      }))

      exportToCsv(exportData, `jobs_export_${new Date().toISOString().split('T')[0]}`)
      showToast('Jobs exported successfully', 'success')
    } catch (err: any) {
      showToast('Failed to export jobs', 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedJobs.size === 0) return
    
    try {
      await jobApi.bulkDelete(Array.from(selectedJobs))
      showToast(`${selectedJobs.size} job(s) deleted`, 'success')
      setSelectedJobs(new Set())
      loadJobs()
    } catch (err: any) {
      showToast('Failed to delete jobs', 'error')
    }
  }

  const handleBulkExport = () => {
    if (selectedJobs.size === 0) {
      showToast('Please select jobs to export', 'warning')
      return
    }

    const selectedData = jobs?.jobs
      .filter((j) => selectedJobs.has(j.id))
      .map((job) => ({
        'ID': job.id,
        'Title': job.title,
        'Description': job.description?.substring(0, 100) || 'N/A',
        'Seniority Level': job.seniorityLevel,
        'Required Skills': job.requiredSkills?.join('; ') || 'N/A',
        'Soft Skills': job.softSkills?.join('; ') || 'N/A',
        'Active': job.active ? 'Yes' : 'No',
        'Created At': new Date(job.createdAt).toLocaleString()
      })) || []

    exportToCsv(selectedData, `jobs_selected_${new Date().toISOString().split('T')[0]}`)
    showToast(`${selectedJobs.size} job(s) exported`, 'success')
  }

  const toggleJobSelection = (id: number) => {
    const newSelected = new Set(selectedJobs)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedJobs(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedJobs.size === jobs?.jobs.length) {
      setSelectedJobs(new Set())
    } else {
      setSelectedJobs(new Set(jobs?.jobs.map((j) => j.id) || []))
    }
  }

  if (loading && !jobs) {
    return <div className="loading">Loading jobs...</div>
  }

  return (
    <PageLayout
      title="Job Management"
      actions={
        <>
          <button
            className="btn btn-secondary"
            onClick={handleExportAll}
            disabled={exporting || !jobs || jobs.jobs.length === 0}
          >
            {exporting ? 'Exporting...' : 'Export All (CSV)'}
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/recruiter/jobs/new')}>
            ➕ Create New Job
          </button>
        </>
      }
    >
    <div className="job-list-container">
      {error && <div className="error-message">{error}</div>}

      <div className="search-filter-section">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title or description..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 0 })}
          />
        </div>
      </div>

      {selectedJobs.size > 0 && (
        <BulkActions
          selectedCount={selectedJobs.size}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
          availableActions={['delete', 'export']}
        />
      )}

      <div className="jobs-table-container">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedJobs.size === jobs?.jobs.length && jobs.jobs.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
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
                <td>
                  <input
                    type="checkbox"
                    checked={selectedJobs.has(job.id)}
                    onChange={() => toggleJobSelection(job.id)}
                  />
                </td>
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
                      className="btn btn-small btn-secondary"
                      onClick={() => navigate(`/recruiter/jobs/${job.id}/candidates`)}
                    >
                      Candidates
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
    </PageLayout>
  )
}

export default JobList

