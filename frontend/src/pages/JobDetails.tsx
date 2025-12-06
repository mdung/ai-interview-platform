import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobApi } from '../services/api'
import { useToast } from '../components'
import './JobDetails.css'

interface Job {
  id: number
  title: string
  description: string
  seniorityLevel: string
  requiredSkills: string[]
  softSkills: string[]
  active: boolean
  createdAt: string
  updatedAt?: string
}

const JobDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statistics, setStatistics] = useState<any>(null)

  useEffect(() => {
    if (id) {
      loadJob()
      loadStatistics()
    }
  }, [id])

  const loadJob = async () => {
    try {
      const response = await jobApi.getJobById(parseInt(id!))
      setJob(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const response = await jobApi.getJobStatistics(parseInt(id!))
      setStatistics(response.data)
    } catch (err) {
      // Statistics might not be available
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return
    }

    try {
      await jobApi.deleteJob(parseInt(id!))
      showToast('Job deleted successfully', 'success')
      navigate('/recruiter/jobs')
    } catch (err: any) {
      showToast('Failed to delete job', 'error')
    }
  }

  const handleToggleActive = async () => {
    if (!job) return

    try {
      if (job.active) {
        await jobApi.unpublishJob(job.id)
      } else {
        await jobApi.publishJob(job.id)
      }
      loadJob()
      showToast(`Job ${job.active ? 'unpublished' : 'published'} successfully`, 'success')
    } catch (err: any) {
      showToast('Failed to update job status', 'error')
    }
  }

  if (loading) {
    return <div className="loading">Loading job details...</div>
  }

  if (error || !job) {
    return (
      <div className="job-details-container">
        <div className="error-message">{error || 'Job not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="job-details-container">
      <div className="job-details-header">
        <div>
          <h1>{job.title}</h1>
          <div className="job-meta">
            <span className={`status-badge ${job.active ? 'active' : 'inactive'}`}>
              {job.active ? 'Active' : 'Inactive'}
            </span>
            <span className="meta-item">Seniority: {job.seniorityLevel}</span>
            <span className="meta-item">
              Created: {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/recruiter/jobs/${job.id}/candidates`)}
          >
            View Candidates
          </button>
          <button
            className={`btn ${job.active ? 'btn-warning' : 'btn-success'}`}
            onClick={handleToggleActive}
          >
            {job.active ? 'Unpublish' : 'Publish'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)}
          >
            Edit
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      <div className="job-details-content">
        <div className="details-section">
          <h2>Description</h2>
          <div className="description-content">
            {job.description || <em>No description provided</em>}
          </div>
        </div>

        <div className="details-section">
          <h2>Required Skills</h2>
          {job.requiredSkills && job.requiredSkills.length > 0 ? (
            <div className="skills-list">
              {job.requiredSkills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <em>No required skills specified</em>
          )}
        </div>

        <div className="details-section">
          <h2>Soft Skills</h2>
          {job.softSkills && job.softSkills.length > 0 ? (
            <div className="skills-list">
              {job.softSkills.map((skill, index) => (
                <span key={index} className="skill-tag skill-tag-soft">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <em>No soft skills specified</em>
          )}
        </div>

        {statistics && (
          <div className="details-section">
            <h2>Statistics</h2>
            <div className="statistics-grid">
              <div className="stat-item">
                <span className="stat-label">Total Candidates</span>
                <span className="stat-value">{statistics.totalCandidates || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Interviews</span>
                <span className="stat-value">{statistics.totalInterviews || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completed Interviews</span>
                <span className="stat-value">{statistics.completedInterviews || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average Score</span>
                <span className="stat-value">
                  {statistics.averageScore
                    ? `${statistics.averageScore.toFixed(1)}/10`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDetails


