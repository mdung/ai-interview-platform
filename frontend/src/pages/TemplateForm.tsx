import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { templateApi, jobApi } from '../services/api'
import { PageLayout } from '../components'
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
  const [showPreview, setShowPreview] = useState(false)
  const [builderMode, setBuilderMode] = useState(false)

  useEffect(() => {
    loadJobs()
    if (id) {
      loadTemplate()
    }
  }, [id])

  const loadJobs = async () => {
    try {
      const response = await jobApi.getAllJobs({ page: 0, size: 100 })
      // Handle different response structures
      if (response.data) {
        if (Array.isArray(response.data)) {
          setJobs(response.data)
        } else if (response.data.jobs) {
          setJobs(response.data.jobs)
        } else if (response.data.content) {
          setJobs(response.data.content)
        } else {
          setJobs([])
        }
      } else {
        setJobs([])
      }
    } catch (err: any) {
      console.error('Failed to load jobs:', err)
      setError('Failed to load jobs. Please try again.')
      setJobs([])
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
    <PageLayout
      title={id ? 'Edit Template' : 'Create New Template'}
    >
    <div className="template-form-container">

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="template-form">
        <div className="form-group">
          <label htmlFor="templateName">Template Name *</label>
          <input
            id="templateName"
            type="text"
            className="input"
            placeholder="Enter template name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="jobId">Job *</label>
          <select
            id="jobId"
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
          {jobs.length === 0 && (
            <p className="form-hint">
              No jobs available. <a href="/recruiter/jobs/new">Create a job</a> first.
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="interviewMode">Interview Mode *</label>
          <select
            id="interviewMode"
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
          <label htmlFor="systemPrompt">System Prompt</label>
          <textarea
            id="systemPrompt"
            className="input"
            rows={6}
            placeholder="Custom system prompt for AI interviewer..."
            value={formData.systemPrompt}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
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
          <label htmlFor="estimatedDuration">Estimated Duration (minutes) *</label>
          <input
            id="estimatedDuration"
            type="number"
            className="input"
            min="1"
            placeholder="30"
            value={formData.estimatedDurationMinutes}
            onChange={(e) => setFormData({ ...formData, estimatedDurationMinutes: parseInt(e.target.value) || 30 })}
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide Preview' : 'Preview Template'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setBuilderMode(!builderMode)}
          >
            {builderMode ? 'Simple Mode' : 'Builder Mode'}
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Template' : 'Create Template'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/recruiter/templates')}
          >
            Cancel
          </button>
        </div>

        {showPreview && (
          <div className="template-preview">
            <h2>Template Preview</h2>
            <div className="preview-content">
              <div className="preview-section">
                <h3>Template Information</h3>
                <p><strong>Name:</strong> {formData.name || 'Untitled Template'}</p>
                <p><strong>Job:</strong> {jobs.find(j => j.id.toString() === formData.jobId)?.title || 'Not selected'}</p>
                <p><strong>Mode:</strong> {formData.mode}</p>
                <p><strong>Estimated Duration:</strong> {formData.estimatedDurationMinutes} minutes</p>
              </div>
              {formData.systemPrompt && (
                <div className="preview-section">
                  <h3>System Prompt</h3>
                  <div className="preview-text">{formData.systemPrompt}</div>
                </div>
              )}
              {formData.questionBank.length > 0 && (
                <div className="preview-section">
                  <h3>Question Bank ({formData.questionBank.length} questions)</h3>
                  <ol className="preview-questions">
                    {formData.questionBank.map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {builderMode && (
          <div className="template-builder">
            <h2>Template Builder</h2>
            <div className="builder-content">
              <div className="builder-section">
                <h3>Question Bank Manager</h3>
                <div className="question-bank-manager">
                  <div className="question-input-area">
                    <textarea
                      className="input"
                      rows={3}
                      placeholder="Enter a question..."
                      value={questionInput}
                      onChange={(e) => setQuestionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          e.preventDefault()
                          addQuestion()
                        }
                      }}
                    />
                    <div className="input-hint">Press Ctrl+Enter to add question</div>
                    <button type="button" className="btn btn-primary" onClick={addQuestion}>
                      Add Question
                    </button>
                  </div>
                  <div className="questions-bank-list">
                    <h4>Questions ({formData.questionBank.length})</h4>
                    {formData.questionBank.length === 0 ? (
                      <p className="empty-message">No questions added yet. Add questions above.</p>
                    ) : (
                      <div className="questions-grid">
                        {formData.questionBank.map((question, index) => (
                          <div key={index} className="question-card" draggable>
                            <div className="question-number">{index + 1}</div>
                            <div className="question-text">{question}</div>
                            <div className="question-actions">
                              <button
                                type="button"
                                className="btn btn-small btn-secondary"
                                onClick={() => {
                                  const newOrder = [...formData.questionBank]
                                  if (index > 0) {
                                    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]]
                                    setFormData({ ...formData, questionBank: newOrder })
                                  }
                                }}
                                disabled={index === 0}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                className="btn btn-small btn-secondary"
                                onClick={() => {
                                  const newOrder = [...formData.questionBank]
                                  if (index < newOrder.length - 1) {
                                    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
                                    setFormData({ ...formData, questionBank: newOrder })
                                  }
                                }}
                                disabled={index === formData.questionBank.length - 1}
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                className="btn btn-small btn-danger"
                                onClick={() => removeQuestion(index)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
    </PageLayout>
  )
}

export default TemplateForm

