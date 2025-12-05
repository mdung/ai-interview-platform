import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { templateApi } from '../services/api'
import './TemplateList.css'

interface Template {
  id: number
  name: string
  mode: string
  estimatedDurationMinutes: number
  active: boolean
  createdAt: string
}

const TemplateList = () => {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await templateApi.getAllTemplates()
      setTemplates(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return
    }

    try {
      await templateApi.deleteTemplate(id)
      loadTemplates()
    } catch (err: any) {
      alert('Failed to delete template')
    }
  }

  if (loading) {
    return <div className="loading">Loading templates...</div>
  }

  return (
    <div className="template-list-container">
      <div className="template-list-header">
        <h1>Interview Templates</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/recruiter/templates/new')}>
            Create New Template
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="templates-grid">
        {templates.length === 0 ? (
          <div className="empty-state">
            <p>No interview templates yet.</p>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="template-card">
              <h3>{template.name}</h3>
              <p>Mode: {template.mode}</p>
              <p>Duration: {template.estimatedDurationMinutes} minutes</p>
              <div className="template-actions">
                <button
                  className="btn btn-small btn-primary"
                  onClick={() => navigate(`/recruiter/templates/${template.id}`)}
                >
                  View
                </button>
                <button
                  className="btn btn-small btn-primary"
                  onClick={() => navigate(`/recruiter/templates/${template.id}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => handleDelete(template.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TemplateList

