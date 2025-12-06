import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { candidateApi, interviewApi } from '../services/api'
import { useToast } from '../components'
import './CandidateDetails.css'

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

interface Interview {
  id: number
  sessionId: string
  templateName: string
  status: string
  startedAt: string
  completedAt?: string
  totalTurns: number
  recommendation?: string
  aiSummary?: string
}

const CandidateDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resumeBlob, setResumeBlob] = useState<Blob | null>(null)
  const [showResume, setShowResume] = useState(false)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'interviews'>('details')
  const resumeUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (id) {
      loadCandidate()
      loadInterviews()
    }
  }, [id])

  const loadCandidate = async () => {
    try {
      const response = await candidateApi.getCandidateById(parseInt(id!))
      setCandidate(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load candidate')
    } finally {
      setLoading(false)
    }
  }

  const loadInterviews = async () => {
    try {
      const response = await candidateApi.getCandidateInterviews(parseInt(id!))
      setInterviews(response.data || [])
    } catch (err) {
      console.error('Failed to load interviews')
    }
  }

  const handleDownloadResume = async () => {
    if (!candidate) return

    try {
      const response = await candidateApi.downloadResume(candidate.id)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `resume_${candidate.firstName}_${candidate.lastName}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showToast('Resume downloaded successfully', 'success')
    } catch (err: any) {
      showToast('Failed to download resume', 'error')
    }
  }

  const handleViewResume = async () => {
    if (!candidate) return

    try {
      const response = await candidateApi.downloadResume(candidate.id)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      if (resumeUrlRef.current) {
        URL.revokeObjectURL(resumeUrlRef.current)
      }
      resumeUrlRef.current = url
      setResumeBlob(blob)
      setResumeUrl(url)
      setShowResume(true)
    } catch (err: any) {
      showToast('Failed to load resume', 'error')
    }
  }

  useEffect(() => {
    return () => {
      if (resumeUrlRef.current) {
        URL.revokeObjectURL(resumeUrlRef.current)
      }
    }
  }, [])

  const handleCreateInterview = () => {
    navigate(`/recruiter/sessions/new?candidateId=${id}`)
  }

  if (loading) {
    return <div className="loading">Loading candidate details...</div>
  }

  if (error || !candidate) {
    return (
      <div className="candidate-details-container">
        <div className="error-message">{error || 'Candidate not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="candidate-details-container">
      <div className="candidate-details-header">
        <div>
          <h1>
            {candidate.firstName} {candidate.lastName}
          </h1>
          <p className="candidate-email">{candidate.email}</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={handleCreateInterview}
          >
            Create Interview
          </button>
          <button
            className="btn btn-primary"
            onClick={handleViewResume}
            disabled={!candidate.resumeUrl}
          >
            View Resume
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleDownloadResume}
            disabled={!candidate.resumeUrl}
          >
            Download Resume
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/recruiter/candidates/${id}/edit`)}
          >
            Edit
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      <div className="candidate-tabs">
        <button
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={`tab ${activeTab === 'interviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('interviews')}
        >
          Interview History ({interviews.length})
        </button>
      </div>

      {activeTab === 'details' && (
        <div className="candidate-details-content">
          <div className="details-section">
            <h2>Contact Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Email</label>
                <p>{candidate.email}</p>
              </div>
              {candidate.phoneNumber && (
                <div className="info-item">
                  <label>Phone</label>
                  <p>{candidate.phoneNumber}</p>
                </div>
              )}
              {candidate.linkedInUrl && (
                <div className="info-item">
                  <label>LinkedIn</label>
                  <p>
                    <a
                      href={candidate.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Profile
                    </a>
                  </p>
                </div>
              )}
              <div className="info-item">
                <label>Member Since</label>
                <p>{new Date(candidate.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h2>Resume</h2>
            {candidate.resumeUrl ? (
              <div className="resume-section">
                <p>Resume is available for this candidate.</p>
                <div className="resume-actions">
                  <button className="btn btn-primary" onClick={handleViewResume}>
                    View Resume
                  </button>
                  <button className="btn btn-secondary" onClick={handleDownloadResume}>
                    Download Resume
                  </button>
                </div>
              </div>
            ) : (
              <p className="no-resume">No resume uploaded yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'interviews' && (
        <div className="candidate-interviews-content">
          <div className="interviews-header">
            <h2>Interview History</h2>
            <button className="btn btn-primary" onClick={handleCreateInterview}>
              Create New Interview
            </button>
          </div>

          {interviews.length === 0 ? (
            <div className="empty-state">
              <p>No interviews yet for this candidate.</p>
              <button className="btn btn-primary" onClick={handleCreateInterview}>
                Create First Interview
              </button>
            </div>
          ) : (
            <div className="interviews-list">
              {interviews.map((interview) => (
                <div key={interview.id} className="interview-card">
                  <div className="interview-header">
                    <div>
                      <h3>{interview.templateName}</h3>
                      <p className="session-id">Session: {interview.sessionId}</p>
                    </div>
                    <span className={`status-badge status-${interview.status.toLowerCase()}`}>
                      {interview.status}
                    </span>
                  </div>
                  <div className="interview-info">
                    <div className="info-row">
                      <span className="label">Started:</span>
                      <span>{new Date(interview.startedAt).toLocaleString()}</span>
                    </div>
                    {interview.completedAt && (
                      <div className="info-row">
                        <span className="label">Completed:</span>
                        <span>{new Date(interview.completedAt).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="label">Total Turns:</span>
                      <span>{interview.totalTurns}</span>
                    </div>
                    {interview.recommendation && (
                      <div className="info-row">
                        <span className="label">Recommendation:</span>
                        <span
                          className={`recommendation recommendation-${interview.recommendation.toLowerCase()}`}
                        >
                          {interview.recommendation}
                        </span>
                      </div>
                    )}
                  </div>
                  {interview.aiSummary && (
                    <div className="interview-summary">
                      <strong>Summary:</strong> {interview.aiSummary.substring(0, 200)}
                      {interview.aiSummary.length > 200 && '...'}
                    </div>
                  )}
                  <div className="interview-actions">
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() =>
                        navigate(`/recruiter/sessions/${interview.sessionId}/transcript`)
                      }
                    >
                      View Transcript
                    </button>
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() =>
                        navigate(`/recruiter/sessions/${interview.sessionId}/analytics`)
                      }
                    >
                      View Analytics
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showResume && resumeBlob && resumeUrl && (
        <div className="resume-modal">
          <div className="resume-modal-content">
            <div className="resume-modal-header">
              <h2>Resume - {candidate.firstName} {candidate.lastName}</h2>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowResume(false)
                  setResumeBlob(null)
                  if (resumeUrlRef.current) {
                    URL.revokeObjectURL(resumeUrlRef.current)
                    resumeUrlRef.current = null
                  }
                  setResumeUrl(null)
                }}
              >
                Close
              </button>
            </div>
            <div className="resume-viewer">
              <iframe
                src={resumeUrl}
                className="resume-iframe"
                title={`${candidate.firstName} ${candidate.lastName} - Resume`}
                style={{ width: '100%', height: '600px', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CandidateDetails

