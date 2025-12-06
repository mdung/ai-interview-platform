import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { interviewApi } from '../services/api'
import './TranscriptView.css'

interface Turn {
  id: number
  turnNumber: number
  question: string
  answer: string | null
  questionTimestamp: string
  answerTimestamp: string | null
  answerDurationMs: number | null
  aiComment: string | null
  communicationScore: number | null
  technicalScore: number | null
  clarityScore: number | null
}

interface Transcript {
  sessionId: string
  candidateName: string
  templateName: string
  language: string
  status: string
  turns: Turn[]
  aiSummary: string | null
  strengths: string | null
  weaknesses: string | null
  recommendation: string | null
}

const TranscriptView = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingEvaluation, setEditingEvaluation] = useState(false)
  const [evaluationData, setEvaluationData] = useState({
    aiSummary: '',
    strengths: '',
    weaknesses: '',
    recommendation: '',
  })

  useEffect(() => {
    if (sessionId) {
      loadTranscript()
    }
  }, [sessionId])

  const loadTranscript = async () => {
    if (!sessionId) return

    setLoading(true)
    setError('')
    try {
      const response = await interviewApi.getTranscript(sessionId)
      setTranscript(response.data)
      setEvaluationData({
        aiSummary: response.data.aiSummary || '',
        strengths: response.data.strengths || '',
        weaknesses: response.data.weaknesses || '',
        recommendation: response.data.recommendation || '',
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load transcript')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (!sessionId) return

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

  const handleSaveEvaluation = async () => {
    if (!sessionId) return

    try {
      await interviewApi.updateEvaluation(sessionId, {
        aiSummary: evaluationData.aiSummary,
        strengths: evaluationData.strengths,
        weaknesses: evaluationData.weaknesses,
        recommendation: evaluationData.recommendation as any,
      })
      setEditingEvaluation(false)
      loadTranscript()
      alert('Evaluation updated successfully')
    } catch (err: any) {
      alert('Failed to update evaluation')
    }
  }

  const handleShare = async () => {
    if (!sessionId || !transcript) return

    try {
      // Create a shareable link
      const shareUrl = `${window.location.origin}/recruiter/sessions/${sessionId}/transcript`
      
      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: `Interview Results - ${transcript.candidateName}`,
          text: `Interview transcript for ${transcript.candidateName}`,
          url: shareUrl,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(`${window.location.origin}/recruiter/sessions/${sessionId}/transcript`)
          alert('Link copied to clipboard!')
        } catch (clipboardErr) {
          alert('Failed to share. Please copy the URL manually.')
        }
      }
    }
  }

  if (loading) {
    return <div className="loading">Loading transcript...</div>
  }

  if (error || !transcript) {
    return (
      <div className="transcript-container">
        <div className="error-message">{error || 'Transcript not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="transcript-container">
      <div className="transcript-header">
        <div>
          <h1>Interview Transcript</h1>
          <p className="session-info">
            Candidate: {transcript.candidateName} | Template: {transcript.templateName} | 
            Status: {transcript.status}
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => navigate(`/recruiter/sessions/${sessionId}/replay`)}
          >
            Replay Interview
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate(`/recruiter/sessions/${sessionId}/analytics`)}
          >
            View Analytics
          </button>
          <button className="btn btn-primary" onClick={() => handleShare()}>
            Share Results
          </button>
          <button
            className="btn btn-primary"
            onClick={async () => {
              try {
                await interviewApi.sendInterviewLink(sessionId!)
                alert('Interview link sent successfully')
              } catch (err) {
                alert('Failed to send interview link')
              }
            }}
          >
            Send Interview Link
          </button>
          <button className="btn btn-primary" onClick={() => handleExport('pdf')}>
            Export PDF
          </button>
          <button className="btn btn-primary" onClick={() => handleExport('csv')}>
            Export CSV
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      <div className="transcript-content">
        <div className="turns-section">
          <h2>Conversation</h2>
          {transcript.turns.map((turn) => (
            <div key={turn.id} className="turn-item">
              <div className="turn-header">
                <span className="turn-number">Turn {turn.turnNumber}</span>
                {turn.questionTimestamp && (
                  <span className="turn-time">
                    {new Date(turn.questionTimestamp).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="question-bubble">
                <strong>Interviewer:</strong> {turn.question}
              </div>
              {turn.answer && (
                <div className="answer-bubble">
                  <strong>Candidate:</strong> {turn.answer}
                  {turn.answerDurationMs && (
                    <span className="duration">
                      (Duration: {Math.round(turn.answerDurationMs / 1000)}s)
                    </span>
                  )}
                </div>
              )}
              {turn.aiComment && (
                <div className="ai-comment">
                  <strong>AI Comment:</strong> {turn.aiComment}
                </div>
              )}
              {(turn.communicationScore || turn.technicalScore || turn.clarityScore) && (
                <div className="scores">
                  {turn.communicationScore && (
                    <span>Communication: {turn.communicationScore}/10</span>
                  )}
                  {turn.technicalScore && (
                    <span>Technical: {turn.technicalScore}/10</span>
                  )}
                  {turn.clarityScore && (
                    <span>Clarity: {turn.clarityScore}/10</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="evaluation-section">
          <div className="evaluation-header">
            <h2>Evaluation</h2>
            <button
              className="btn btn-small btn-primary"
              onClick={() => {
                if (editingEvaluation) {
                  handleSaveEvaluation()
                } else {
                  setEditingEvaluation(true)
                }
              }}
            >
              {editingEvaluation ? 'Save' : 'Edit'}
            </button>
          </div>

          {editingEvaluation ? (
            <div className="evaluation-form">
              <div className="form-group">
                <label>Summary</label>
                <textarea
                  className="input"
                  rows={4}
                  value={evaluationData.aiSummary}
                  onChange={(e) =>
                    setEvaluationData({ ...evaluationData, aiSummary: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Strengths</label>
                <textarea
                  className="input"
                  rows={3}
                  value={evaluationData.strengths}
                  onChange={(e) =>
                    setEvaluationData({ ...evaluationData, strengths: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Weaknesses</label>
                <textarea
                  className="input"
                  rows={3}
                  value={evaluationData.weaknesses}
                  onChange={(e) =>
                    setEvaluationData({ ...evaluationData, weaknesses: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Recommendation</label>
                <select
                  className="input"
                  value={evaluationData.recommendation}
                  onChange={(e) =>
                    setEvaluationData({ ...evaluationData, recommendation: e.target.value })
                  }
                >
                  <option value="">Select...</option>
                  <option value="REJECT">Reject</option>
                  <option value="WEAK">Weak</option>
                  <option value="MAYBE">Maybe</option>
                  <option value="STRONG">Strong</option>
                  <option value="HIRE">Hire</option>
                </select>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setEditingEvaluation(false)
                  loadTranscript()
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="evaluation-display">
              {transcript.aiSummary && (
                <div className="evaluation-item">
                  <h3>Summary</h3>
                  <p>{transcript.aiSummary}</p>
                </div>
              )}
              {transcript.strengths && (
                <div className="evaluation-item">
                  <h3>Strengths</h3>
                  <p>{transcript.strengths}</p>
                </div>
              )}
              {transcript.weaknesses && (
                <div className="evaluation-item">
                  <h3>Weaknesses</h3>
                  <p>{transcript.weaknesses}</p>
                </div>
              )}
              {transcript.recommendation && (
                <div className="evaluation-item">
                  <h3>Recommendation</h3>
                  <p className={`recommendation recommendation-${transcript.recommendation.toLowerCase()}`}>
                    {transcript.recommendation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TranscriptView

