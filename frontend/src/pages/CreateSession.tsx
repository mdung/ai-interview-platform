import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { interviewApi, candidateApi, templateApi } from '../services/api'
import { useToast } from '../components/ToastContainer'
import { LoadingSpinner, ErrorDisplay, PageLayout } from '../components'
import './CreateSession.css'

interface Candidate {
  id: number
  firstName: string
  lastName: string
  email: string
}

interface Template {
  id: number
  name: string
  mode: string
  estimatedDurationMinutes: number
}

const CreateSession = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  const [formData, setFormData] = useState({
    candidateId: '',
    templateId: '',
    language: 'en',
    scheduledDate: '',
    scheduledTime: '',
  })
  const [scheduleMode, setScheduleMode] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoadingData(true)
    try {
      const [candidatesRes, templatesRes] = await Promise.all([
        candidateApi.getAllCandidates({ page: 0, size: 100 }),
        templateApi.getAllTemplates()
      ])
      setCandidates(candidatesRes.data.candidates || [])
      setTemplates(templatesRes.data || [])
    } catch (err: any) {
      setError('Failed to load candidates or templates')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.candidateId || !formData.templateId) {
      setError('Please select both candidate and template')
      return
    }

    setLoading(true)
    try {
      const sessionData: any = {
        candidateId: parseInt(formData.candidateId),
        templateId: parseInt(formData.templateId),
        language: formData.language
      }

      if (scheduleMode && formData.scheduledDate && formData.scheduledTime) {
        const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
        sessionData.scheduledAt = scheduledDateTime.toISOString()
      }

      const response = await interviewApi.createSession(sessionData)
      
      showToast('Interview session created successfully!', 'success')
      
      if (scheduleMode && sessionData.scheduledAt) {
        navigate('/recruiter/sessions')
      } else {
        navigate(`/recruiter/sessions/${response.data.sessionId}/transcript`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create interview session')
      showToast('Failed to create interview session', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <PageLayout title="Create Interview Session">
        <div className="create-session-container">
          <LoadingSpinner message="Loading candidates and templates..." />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Create Interview Session">
    <div className="create-session-container">

      {error && <ErrorDisplay error={error} />}

      <div className="create-session-form-container">
        <form onSubmit={handleSubmit} className="create-session-form">
          <div className="form-group">
            <label htmlFor="candidateId">
              Candidate <span className="required">*</span>
            </label>
            <select
              id="candidateId"
              className="input"
              value={formData.candidateId}
              onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
              required
            >
              <option value="">Select a candidate</option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.firstName} {candidate.lastName} ({candidate.email})
                </option>
              ))}
            </select>
            {candidates.length === 0 && (
              <p className="form-hint">
                No candidates available. <a href="/recruiter/candidates/new">Create a candidate</a> first.
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="templateId">
              Interview Template <span className="required">*</span>
            </label>
            <select
              id="templateId"
              className="input"
              value={formData.templateId}
              onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
              required
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.mode}, ~{template.estimatedDurationMinutes} min)
                </option>
              ))}
            </select>
            {templates.length === 0 && (
              <p className="form-hint">
                No templates available. <a href="/recruiter/templates/new">Create a template</a> first.
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              className="input"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="scheduleMode">
              <input
                id="scheduleMode"
                type="checkbox"
                checked={scheduleMode}
                onChange={(e) => setScheduleMode(e.target.checked)}
              />
              Schedule for later
            </label>
          </div>

          {scheduleMode && (
            <>
              <div className="form-group">
                <label htmlFor="scheduledDate">Scheduled Date</label>
                <input
                  id="scheduledDate"
                  type="date"
                  className="input"
                  placeholder="Select date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label htmlFor="scheduledTime">Scheduled Time</label>
                <input
                  id="scheduledTime"
                  type="time"
                  className="input"
                  placeholder="Select time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.candidateId || !formData.templateId}
            >
              {loading ? 'Creating...' : 'Create Interview Session'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/recruiter/sessions')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
    </PageLayout>
  )
}

export default CreateSession

