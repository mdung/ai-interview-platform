import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobApi, candidateApi } from '../services/api'
import { useToast, PageLayout } from '../components'
import './JobCandidates.css'

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
  status: string
  startedAt: string
  completedAt?: string
  totalTurns: number
  recommendation?: string
}

const JobCandidates = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [job, setJob] = useState<any>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [candidateInterviews, setCandidateInterviews] = useState<Interview[]>([])

  useEffect(() => {
    if (id) {
      loadJob()
      loadCandidates()
    }
  }, [id])

  const loadJob = async () => {
    try {
      const response = await jobApi.getJobById(parseInt(id!))
      setJob(response.data)
    } catch (err: any) {
      setError('Failed to load job')
    }
  }

  const loadCandidates = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await jobApi.getJobCandidates(parseInt(id!))
      setCandidates(response.data.candidates || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  const loadCandidateInterviews = async (candidateId: number) => {
    try {
      const response = await candidateApi.getCandidateInterviews(candidateId)
      setCandidateInterviews(response.data || [])
    } catch (err) {
      console.error('Failed to load candidate interviews')
    }
  }

  const handleViewCandidate = async (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    await loadCandidateInterviews(candidate.id)
  }

  const handleCreateInterview = (candidateId: number) => {
    navigate(`/recruiter/sessions/new?candidateId=${candidateId}&jobId=${id}`)
  }

  if (loading && candidates.length === 0) {
    return (
      <PageLayout title="Job Candidates">
        <div className="loading">Loading candidates...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={`Candidates for: ${job?.title || 'Job'}`}
      actions={
        <>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/recruiter/candidates/new?jobId=${id}`)}
          >
            Add Candidate
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </>
      }
    >
      <div className="job-candidates-container">
        <p className="subtitle">
          {candidates.length} candidate(s) associated with this job
        </p>

        {error && <div className="error-message">{error}</div>}

      <div className="job-candidates-content">
        <div className="candidates-list">
          <h2>Candidates</h2>
          {candidates.length === 0 ? (
            <div className="empty-state">
              <p>No candidates associated with this job yet.</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/recruiter/candidates/new?jobId=${id}`)}
              >
                Add First Candidate
              </button>
            </div>
          ) : (
            <div className="candidates-grid">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`candidate-card ${selectedCandidate?.id === candidate.id ? 'selected' : ''}`}
                  onClick={() => handleViewCandidate(candidate)}
                >
                  <div className="candidate-header">
                    <h3>
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                  </div>
                  <div className="candidate-info">
                    <p>
                      <strong>Email:</strong> {candidate.email}
                    </p>
                    {candidate.phoneNumber && (
                      <p>
                        <strong>Phone:</strong> {candidate.phoneNumber}
                      </p>
                    )}
                    {candidate.linkedInUrl && (
                      <p>
                        <strong>LinkedIn:</strong>{' '}
                        <a href={candidate.linkedInUrl} target="_blank" rel="noopener noreferrer">
                          View Profile
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="candidate-actions">
                    <button
                      className="btn btn-small btn-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/recruiter/candidates/${candidate.id}`)
                      }}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCreateInterview(candidate.id)
                      }}
                    >
                      Create Interview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCandidate && (
          <div className="candidate-details-panel">
            <div className="panel-header">
              <h2>
                {selectedCandidate.firstName} {selectedCandidate.lastName}
              </h2>
              <button
                className="btn btn-small btn-secondary"
                onClick={() => setSelectedCandidate(null)}
              >
                Close
              </button>
            </div>

            <div className="panel-content">
              <div className="detail-section">
                <h3>Contact Information</h3>
                <p>
                  <strong>Email:</strong> {selectedCandidate.email}
                </p>
                {selectedCandidate.phoneNumber && (
                  <p>
                    <strong>Phone:</strong> {selectedCandidate.phoneNumber}
                  </p>
                )}
                {selectedCandidate.linkedInUrl && (
                  <p>
                    <strong>LinkedIn:</strong>{' '}
                    <a
                      href={selectedCandidate.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Profile
                    </a>
                  </p>
                )}
              </div>

              {selectedCandidate.resumeUrl && (
                <div className="detail-section">
                  <h3>Resume</h3>
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      try {
                        const response = await candidateApi.downloadResume(selectedCandidate.id)
                        const blob = new Blob([response.data], { type: 'application/pdf' })
                        const url = window.URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = `resume_${selectedCandidate.id}.pdf`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        window.URL.revokeObjectURL(url)
                      } catch (err) {
                        showToast('Failed to download resume', 'error')
                      }
                    }}
                  >
                    Download Resume
                  </button>
                </div>
              )}

              <div className="detail-section">
                <h3>Interviews</h3>
                {candidateInterviews.length === 0 ? (
                  <p>No interviews yet.</p>
                ) : (
                  <div className="interviews-list">
                    {candidateInterviews.map((interview) => (
                      <div key={interview.id} className="interview-item">
                        <div className="interview-header">
                          <span className="interview-id">Session: {interview.sessionId}</span>
                          <span className={`status-badge status-${interview.status.toLowerCase()}`}>
                            {interview.status}
                          </span>
                        </div>
                        <div className="interview-info">
                          <p>
                            <strong>Started:</strong>{' '}
                            {new Date(interview.startedAt).toLocaleString()}
                          </p>
                          {interview.completedAt && (
                            <p>
                              <strong>Completed:</strong>{' '}
                              {new Date(interview.completedAt).toLocaleString()}
                            </p>
                          )}
                          <p>
                            <strong>Turns:</strong> {interview.totalTurns}
                          </p>
                          {interview.recommendation && (
                            <p>
                              <strong>Recommendation:</strong>{' '}
                              <span
                                className={`recommendation recommendation-${interview.recommendation.toLowerCase()}`}
                              >
                                {interview.recommendation}
                              </span>
                            </p>
                          )}
                        </div>
                        <button
                          className="btn btn-small btn-primary"
                          onClick={() =>
                            navigate(`/recruiter/sessions/${interview.sessionId}/transcript`)
                          }
                        >
                          View Transcript
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  className="btn btn-primary"
                  onClick={() => handleCreateInterview(selectedCandidate.id)}
                >
                  Create New Interview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </PageLayout>
  )
}

export default JobCandidates



