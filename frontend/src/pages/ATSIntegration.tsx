import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { atsApi } from '../services/api'
import { LoadingSpinner, useToast } from '../components'
import './ATSIntegration.css'

interface ATSIntegration {
  id: number
  provider: string
  baseUrl: string
  enabled: boolean
  lastSyncAt: string | null
  status: string
}

const ATSIntegration = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [integrations, setIntegrations] = useState<ATSIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    provider: '',
    apiKey: '',
    apiSecret: '',
    baseUrl: '',
    webhookUrl: '',
    enabled: true
  })

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      const response = await atsApi.getIntegrations()
      setIntegrations(response.data)
    } catch (err) {
      console.error('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await atsApi.integrate(formData)
      showToast('ATS integration created successfully', 'success')
      setShowForm(false)
      setFormData({
        provider: '',
        apiKey: '',
        apiSecret: '',
        baseUrl: '',
        webhookUrl: '',
        enabled: true
      })
      loadIntegrations()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create integration', 'error')
    }
  }

  const handleSync = async (id: number) => {
    try {
      await atsApi.syncIntegration(id)
      showToast('Sync started successfully', 'success')
      loadIntegrations()
    } catch (err) {
      showToast('Failed to sync', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this integration?')) {
      return
    }

    try {
      await atsApi.deleteIntegration(id)
      showToast('Integration deleted successfully', 'success')
      loadIntegrations()
    } catch (err) {
      showToast('Failed to delete integration', 'error')
    }
  }

  const providers = ['Greenhouse', 'Lever', 'Workday', 'BambooHR', 'Jobvite', 'SmartRecruiters']

  if (loading) {
    return <LoadingSpinner message="Loading ATS integrations..." />
  }

  return (
    <div className="ats-integration-container">
      <div className="page-header">
        <h1>ATS Integration</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : 'Add Integration'}
        </button>
      </div>

      {showForm && (
        <div className="integration-form">
          <h2>New ATS Integration</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Provider</label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="input"
                required
              >
                <option value="">Select Provider</option>
                {providers.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>API Key</label>
              <input
                type="text"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label>API Secret</label>
              <input
                type="password"
                value={formData.apiSecret}
                onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                className="input"
              />
            </div>

            <div className="form-group">
              <label>Base URL</label>
              <input
                type="url"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                className="input"
                required
                placeholder="https://api.example.com"
              />
            </div>

            <div className="form-group">
              <label>Webhook URL (Optional)</label>
              <input
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                className="input"
                placeholder="https://your-domain.com/webhook"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
                Enable Integration
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Create Integration
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="integrations-list">
        {integrations.length === 0 ? (
          <div className="empty-state">
            <p>No ATS integrations configured</p>
            <p className="hint">Add an integration to sync candidates and interview results with your ATS</p>
          </div>
        ) : (
          integrations.map((integration) => (
            <div key={integration.id} className="integration-card">
              <div className="integration-header">
                <h3>{integration.provider}</h3>
                <span className={`status-badge status-${integration.status}`}>
                  {integration.status}
                </span>
              </div>
              <div className="integration-details">
                <p><strong>Base URL:</strong> {integration.baseUrl}</p>
                <p><strong>Status:</strong> {integration.enabled ? 'Enabled' : 'Disabled'}</p>
                {integration.lastSyncAt && (
                  <p><strong>Last Sync:</strong> {new Date(integration.lastSyncAt).toLocaleString()}</p>
                )}
              </div>
              <div className="integration-actions">
                <button
                  onClick={() => handleSync(integration.id)}
                  className="btn btn-secondary"
                >
                  Sync Now
                </button>
                <button
                  onClick={() => handleDelete(integration.id)}
                  className="btn btn-danger"
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

export default ATSIntegration


