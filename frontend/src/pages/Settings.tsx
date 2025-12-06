import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, notificationApi } from '../services/api'
import { useToast } from '../components'
import './Settings.css'

const Settings = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'email' | 'api'>('profile')
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    interviewReminders: true,
    weeklyReports: false,
    candidateUpdates: true,
    systemAlerts: true,
  })
  const [emailSettings, setEmailSettings] = useState({
    emailFrequency: 'immediate',
    digestFrequency: 'daily',
    includeSummary: true,
    includeAttachments: true,
  })
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [newApiKey, setNewApiKey] = useState({ name: '', permissions: [] as string[] })
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    loadUnreadCount()
    if (activeTab === 'notifications') {
      loadNotifications()
    }
  }, [activeTab])

  const loadUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount()
      setUnreadCount(response.data)
    } catch (err) {
      console.error('Failed to load unread count')
    }
  }

  const loadNotifications = async () => {
    try {
      const response = await notificationApi.getNotifications()
      setNotifications(response.data)
    } catch (err) {
      console.error('Failed to load notifications')
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id)
      loadNotifications()
      loadUnreadCount()
    } catch (err) {
      console.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      loadNotifications()
      loadUnreadCount()
    } catch (err) {
      console.error('Failed to mark all as read')
    }
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
          <button
            className={`tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            Email Settings
          </button>
          <button
            className={`tab ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            API Settings
          </button>
        </div>

        <div className="settings-panel">
          {activeTab === 'profile' && (
            <div>
              <h2>Profile Settings</h2>
              <p>Profile management is available on the Profile page.</p>
              <button className="btn btn-primary" onClick={() => navigate('/profile')}>
                Go to Profile
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2>Notification Settings</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: e.target.checked,
                        })
                      }
                    />
                    Email Notifications
                  </label>
                  <p className="form-hint">Receive notifications via email</p>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          pushNotifications: e.target.checked,
                        })
                      }
                    />
                    Push Notifications
                  </label>
                  <p className="form-hint">Receive browser push notifications</p>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={notificationSettings.interviewReminders}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          interviewReminders: e.target.checked,
                        })
                      }
                    />
                    Interview Reminders
                  </label>
                  <p className="form-hint">Get reminded before scheduled interviews</p>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklyReports}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          weeklyReports: e.target.checked,
                        })
                      }
                    />
                    Weekly Summary Reports
                  </label>
                  <p className="form-hint">Receive weekly summary reports</p>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={notificationSettings.candidateUpdates}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          candidateUpdates: e.target.checked,
                        })
                      }
                    />
                    Candidate Updates
                  </label>
                  <p className="form-hint">Get notified about candidate activity</p>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={notificationSettings.systemAlerts}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          systemAlerts: e.target.checked,
                        })
                      }
                    />
                    System Alerts
                  </label>
                  <p className="form-hint">Receive important system alerts</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    setLoading(true)
                    try {
                      // In real implementation, save to API
                      await new Promise((resolve) => setTimeout(resolve, 500))
                      showToast('Notification settings saved', 'success')
                    } catch (err) {
                      showToast('Failed to save settings', 'error')
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Notification Settings'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div>
              <h2>Email Settings</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label>Email Notification Frequency</label>
                  <select
                    className="input"
                    value={emailSettings.emailFrequency}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, emailFrequency: e.target.value })
                    }
                  >
                    <option value="immediate">Immediate</option>
                    <option value="hourly">Hourly Digest</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                  </select>
                  <p className="form-hint">How often to receive email notifications</p>
                </div>
                <div className="form-group">
                  <label>Digest Frequency</label>
                  <select
                    className="input"
                    value={emailSettings.digestFrequency}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, digestFrequency: e.target.value })
                    }
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <p className="form-hint">Frequency for summary digests</p>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={emailSettings.includeSummary}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, includeSummary: e.target.checked })
                      }
                    />
                    Include Summary in Emails
                  </label>
                  <p className="form-hint">Include brief summary in notification emails</p>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={emailSettings.includeAttachments}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          includeAttachments: e.target.checked,
                        })
                      }
                    />
                    Include Attachments
                  </label>
                  <p className="form-hint">Include file attachments in emails</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    setLoading(true)
                    try {
                      // In real implementation, save to API
                      await new Promise((resolve) => setTimeout(resolve, 500))
                      showToast('Email settings saved', 'success')
                    } catch (err) {
                      showToast('Failed to save settings', 'error')
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Email Settings'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div>
              <h2>API Settings</h2>
              <p className="section-description">
                Manage your API keys for programmatic access to the platform.
              </p>
              <div className="api-keys-section">
                <div className="api-keys-header">
                  <h3>Your API Keys</h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      const modal = document.getElementById('create-api-key-modal')
                      if (modal) {
                        ;(modal as any).showModal()
                      }
                    }}
                  >
                    Create New API Key
                  </button>
                </div>
                {apiKeys.length === 0 ? (
                  <div className="empty-state">
                    <p>No API keys created yet</p>
                    <p className="form-hint">Create an API key to get started</p>
                  </div>
                ) : (
                  <div className="api-keys-list">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="api-key-item">
                        <div className="api-key-info">
                          <h4>{key.name}</h4>
                          <p className="api-key-value">{key.key}</p>
                          <p className="api-key-meta">
                            Created: {new Date(key.createdAt).toLocaleDateString()} | Last used:{' '}
                            {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                        <div className="api-key-actions">
                          <button
                            className="btn btn-small btn-secondary"
                            onClick={() => {
                              navigator.clipboard.writeText(key.key)
                              showToast('API key copied to clipboard', 'success')
                            }}
                          >
                            Copy
                          </button>
                          <button
                            className="btn btn-small btn-danger"
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this API key?')) {
                                setApiKeys(apiKeys.filter((k) => k.id !== key.id))
                                showToast('API key deleted', 'success')
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <dialog id="create-api-key-modal" className="modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Create New API Key</h3>
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() => {
                        const modal = document.getElementById('create-api-key-modal')
                        if (modal) {
                          ;(modal as any).close()
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>API Key Name</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g., Production API Key"
                        value={newApiKey.name}
                        onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Permissions</label>
                      <div className="permissions-list">
                        {['read', 'write', 'delete', 'admin'].map((perm) => (
                          <label key={perm} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={newApiKey.permissions.includes(perm)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewApiKey({
                                    ...newApiKey,
                                    permissions: [...newApiKey.permissions, perm],
                                  })
                                } else {
                                  setNewApiKey({
                                    ...newApiKey,
                                    permissions: newApiKey.permissions.filter((p) => p !== perm),
                                  })
                                }
                              }}
                            />
                            {perm.charAt(0).toUpperCase() + perm.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          if (!newApiKey.name) {
                            showToast('Please enter a name for the API key', 'warning')
                            return
                          }
                          const generatedKey = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
                          setApiKeys([
                            ...apiKeys,
                            {
                              id: Date.now(),
                              name: newApiKey.name,
                              key: generatedKey,
                              createdAt: new Date(),
                              lastUsed: null,
                            },
                          ])
                          setNewApiKey({ name: '', permissions: [] })
                          const modal = document.getElementById('create-api-key-modal')
                          if (modal) {
                            ;(modal as any).close()
                          }
                          showToast('API key created successfully. Please copy it now.', 'success')
                        }}
                      >
                        Create API Key
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          const modal = document.getElementById('create-api-key-modal')
                          if (modal) {
                            ;(modal as any).close()
                          }
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings

