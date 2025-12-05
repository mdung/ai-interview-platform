import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminPanel.css'

const AdminPanel = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'system'>('overview')

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
        </div>

        <div className="admin-main">
          {activeSection === 'overview' && (
            <div className="admin-section">
              <h2>System Overview</h2>
              <div className="admin-stats">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p>View and manage all system users</p>
                  <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>
                    Manage Users
                  </button>
                </div>
                <div className="stat-card">
                  <h3>System Health</h3>
                  <p>Monitor system status and performance</p>
                  <span className="status-indicator healthy">Healthy</span>
                </div>
              </div>
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
                  <input type="text" className="input" defaultValue="AI Interview Platform" />
                </div>
                <div className="form-group">
                  <label>Max File Upload Size (MB)</label>
                  <input type="number" className="input" defaultValue="10" />
                </div>
                <div className="form-group">
                  <label>Session Timeout (minutes)</label>
                  <input type="number" className="input" defaultValue="30" />
                </div>
                <button className="btn btn-primary">Save Settings</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel

