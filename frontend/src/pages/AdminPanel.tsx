import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, analyticsApi } from '../services/api'
import { LoadingSpinner, ErrorDisplay, useToast } from '../components'
import './AdminPanel.css'

const AdminPanel = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'system' | 'logs'>('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [systemStats, setSystemStats] = useState<any>(null)
  const [systemSettings, setSystemSettings] = useState({
    systemName: 'AI Interview Platform',
    maxFileUploadSize: 10,
    sessionTimeout: 30,
    emailNotifications: true,
    autoBackup: true
  })
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    if (activeSection === 'overview') {
      loadSystemStats()
    } else if (activeSection === 'logs') {
      loadLogs()
    }
  }, [activeSection])

  const loadSystemStats = async () => {
    setLoading(true)
    try {
      // Load dashboard overview for system stats
      const response = await analyticsApi.getDashboardOverview()
      setSystemStats(response.data)
    } catch (err: any) {
      setError('Failed to load system statistics')
    } finally {
      setLoading(false)
    }
  }

  const loadLogs = async () => {
    setLoading(true)
    try {
      // Mock logs - in real implementation, this would call an API
      setLogs([
        { id: 1, timestamp: new Date(), level: 'INFO', message: 'System started successfully', user: 'System' },
        { id: 2, timestamp: new Date(Date.now() - 3600000), level: 'WARN', message: 'High memory usage detected', user: 'System' },
        { id: 3, timestamp: new Date(Date.now() - 7200000), level: 'INFO', message: 'User login: admin@example.com', user: 'Admin' }
      ])
    } catch (err) {
      setError('Failed to load logs')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      // In real implementation, this would call an API
      showToast('Settings saved successfully', 'success')
    } catch (err) {
      showToast('Failed to save settings', 'error')
    }
  }

  return (
    <div className="admin-panel-container">
      <div className="admin-panel-header">
        <h1>Admin Panel</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="admin-panel-content">
        <div className="admin-sidebar">
          <button
            className={`sidebar-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            Overview
          </button>
          <button
            className={`sidebar-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            User Management
          </button>
          <button
            className={`sidebar-item ${activeSection === 'system' ? 'active' : ''}`}
            onClick={() => setActiveSection('system')}
          >
            System Settings
          </button>
          <button
            className={`sidebar-item ${activeSection === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveSection('logs')}
          >
            System Logs
          </button>
        </div>

        <div className="admin-main">
          {activeSection === 'overview' && (
            <div className="admin-section">
              <h2>System Overview</h2>
              {loading ? (
                <LoadingSpinner message="Loading system statistics..." />
              ) : error ? (
                <ErrorDisplay error={error} />
              ) : (
                <>
                  <div className="admin-stats">
                    <div className="stat-card">
                      <h3>Total Users</h3>
                      <p className="stat-value">{systemStats?.totalUsers || 'N/A'}</p>
                      <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>
                        Manage Users
                      </button>
                    </div>
                    <div className="stat-card">
                      <h3>Total Candidates</h3>
                      <p className="stat-value">{systemStats?.totalCandidates || 0}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Jobs</h3>
                      <p className="stat-value">{systemStats?.totalJobs || 0}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Interviews</h3>
                      <p className="stat-value">{systemStats?.totalInterviews || 0}</p>
                    </div>
                    <div className="stat-card">
                      <h3>System Health</h3>
                      <p>Monitor system status and performance</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate('/admin/health')}
                        style={{ marginTop: '10px' }}
                      >
                        View Health Details
                      </button>
                    </div>
                    <div className="stat-card">
                      <h3>Completion Rate</h3>
                      <p className="stat-value">{systemStats?.completionRate?.toFixed(1) || 0}%</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeSection === 'users' && (
            <div className="admin-section">
              <h2>User Management</h2>
              <p>Manage all users in the system</p>
              <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>
                Go to User Management
              </button>
            </div>
          )}

          {activeSection === 'system' && (
            <div className="admin-section">
              <h2>System Settings</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label>System Name</label>
                  <input
                    type="text"
                    className="input"
                    value={systemSettings.systemName}
                    onChange={(e) => setSystemSettings({ ...systemSettings, systemName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Max File Upload Size (MB)</label>
                  <input
                    type="number"
                    className="input"
                    value={systemSettings.maxFileUploadSize}
                    onChange={(e) => setSystemSettings({ ...systemSettings, maxFileUploadSize: parseInt(e.target.value) || 10 })}
                  />
                </div>
                <div className="form-group">
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    className="input"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: parseInt(e.target.value) || 30 })}
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={systemSettings.emailNotifications}
                      onChange={(e) => setSystemSettings({ ...systemSettings, emailNotifications: e.target.checked })}
                    />
                    Enable Email Notifications
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={systemSettings.autoBackup}
                      onChange={(e) => setSystemSettings({ ...systemSettings, autoBackup: e.target.checked })}
                    />
                    Enable Auto Backup
                  </label>
                </div>
                <button className="btn btn-primary" onClick={handleSaveSettings}>
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {activeSection === 'logs' && (
            <div className="admin-section">
              <h2>System Logs</h2>
              {loading ? (
                <LoadingSpinner message="Loading logs..." />
              ) : (
                <div className="logs-container">
                  <div className="logs-header">
                    <div className="log-filters">
                      <select className="input" style={{ width: 'auto' }}>
                        <option value="all">All Levels</option>
                        <option value="INFO">Info</option>
                        <option value="WARN">Warning</option>
                        <option value="ERROR">Error</option>
                      </select>
                    </div>
                  </div>
                  <div className="logs-list">
                    {logs.length === 0 ? (
                      <p className="no-logs">No logs available</p>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className={`log-item log-${log.level.toLowerCase()}`}>
                          <div className="log-timestamp">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                          <div className="log-level">{log.level}</div>
                          <div className="log-message">{log.message}</div>
                          <div className="log-user">{log.user}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel

