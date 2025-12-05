import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, notificationApi } from '../services/api'
import './Settings.css'

const Settings = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences'>('profile')
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])

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
            className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
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
              <div className="notifications-header">
                <h2>Notifications</h2>
                {notifications.length > 0 && (
                  <button className="btn btn-small btn-primary" onClick={handleMarkAllAsRead}>
                    Mark All as Read
                  </button>
                )}
              </div>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <p className="empty-state">No notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    >
                      <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span className="notification-time">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {!notification.read && (
                        <button
                          className="btn btn-small btn-primary"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h2>Preferences</h2>
              <div className="preferences-form">
                <div className="form-group">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Email notifications
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Interview reminders
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input type="checkbox" />
                    Weekly summary reports
                  </label>
                </div>
                <button className="btn btn-primary">Save Preferences</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings

