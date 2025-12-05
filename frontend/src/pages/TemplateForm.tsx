import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { templateApi, jobApi } from '../services/api'
import './TemplateForm.css'

const TemplateForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [jobs, setJobs] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    jobId: '',
    mode: 'BOTH',
    systemPrompt: '',
    questionBank: [] as string[],
    estimatedDurationMinutes: 30,
  })
  const [questionInput, setQuestionInput] = useState('')

  useEffect(() => {
    loadJobs()
    if (id) {
      loadTemplate()
    }
  }, [id])

  const loadJobs = async () => {
    try {
      const response = await jobApi.getAllJobs()
      setJobs(response.data.jobs || [])
    } catch (err) {
      console.error('Failed to load jobs')
    }
  }

  const loadTemplate = async () => {
    try {
      const response = await templateApi.getTemplateById(parseInt(id!))
      setFormData({
        name: response.data.name,
        jobId: response.data.job?.id?.toString() || '',
        mode: response.data.mode,
        systemPrompt: response.data.systemPrompt || '',
        questionBank: response.data.questionBank || [],
        estimatedDurationMinutes: response.data.estimatedDurationMinutes || 30,
      })
    } catch (err: any) {
      setError('Failed to load template')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = {
        ...formData,
        job: { id: parseInt(formData.jobId) },
      }
      if (id) {
        await templateApi.updateTemplate(parseInt(id), data)
      } else {
        await templateApi.createTemplate(data)
      }
      navigate('/recruiter/templates')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = () => {
    if (questionInput.trim()) {
      setFormData({
        ...formData,
        questionBank: [...formData.questionBank, questionInput.trim()],
      })
      setQuestionInput('')
    }
  }

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questionBank: formData.questionBank.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="template-form-container">
      <div className="template-form-header">
        <h1>{id ? 'Edit Template' : 'Create New Template'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="template-form">
        <div className="form-group">
          <label>Template Name *</label>
          <input
            type="text"
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Job *</label>
          <select
            className="input"
            value={formData.jobId}
            onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
            required
          >
            <option value="">Select a job...</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Interview Mode *</label>
          <select
            className="input"
            value={formData.mode}
            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
            required
          >
            <option value="VOICE">Voice</option>
            <option value="TEXT">Text</option>
            <option value="BOTH">Both</option>
          </select>
        </div>

        <div className="form-group">
          <label>System Prompt</label>
          <textarea
            className="input"
            rows={6}
            value={formData.systemPrompt}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            placeholder="Custom system prompt for AI interviewer..."
          />
        </div>

        <div className="form-group">
          <label>Question Bank</label>
          <div className="question-input-group">
            <textarea
              className="input"
              rows={2}
              placeholder="Add a question..."
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
            />
            <button type="button" className="btn btn-primary" onClick={addQuestion}>
              Add Question
            </button>
          </div>
          <div className="questions-list">
            {formData.questionBank.map((question, index) => (
              <div key={index} className="question-item">
                <span>{question}</span>
                <button
                  type="button"
                  className="btn btn-small btn-danger"
                  onClick={() => removeQuestion(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Estimated Duration (minutes) *</label>
          <input
            type="number"
            className="input"
            min="1"
            value={formData.estimatedDurationMinutes}
            onChange={(e) => setFormData({ ...formData, estimatedDurationMinutes: parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Template' : 'Create Template'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default TemplateForm

