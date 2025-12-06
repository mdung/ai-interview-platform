import { useState, useEffect } from 'react'
import { notificationApi } from '../services/api'
import { useToast } from './ToastContainer'
import { LoadingSpinner, ErrorDisplay } from './'
import './NotificationCenter.css'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  actionUrl?: string
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  maxNotifications?: number
}

const NotificationCenter = ({ isOpen, onClose, maxNotifications = 50 }: NotificationCenterProps) => {
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
      loadUnreadCount()
    }
  }, [isOpen])

  const loadNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await notificationApi.getNotifications({ page: 0, size: maxNotifications })
      setNotifications(response.data.content || response.data || [])
    } catch (err: any) {
      setError('Failed to load notifications')
      showToast('Failed to load notifications', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount()
      setUnreadCount(response.data || 0)
    } catch (err) {
      console.error('Failed to load unread count')
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      showToast('Failed to mark notification as read', 'error')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
      showToast('All notifications marked as read', 'success')
    } catch (err) {
      showToast('Failed to mark all as read', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await notificationApi.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      showToast('Notification deleted', 'success')
    } catch (err) {
      showToast('Failed to delete notification', 'error')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INTERVIEW_INVITATION':
        return '📧'
      case 'INTERVIEW_REMINDER':
        return '⏰'
      case 'INTERVIEW_COMPLETE':
        return '✅'
      case 'EVALUATION_READY':
        return '📊'
      default:
        return '🔔'
    }
  }

  if (!isOpen) return null

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center" onClick={(e) => e.stopPropagation()}>
        <div className="notification-center-header">
          <h2>Notifications</h2>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button
                className="btn btn-small btn-primary"
                onClick={handleMarkAllAsRead}
              >
                Mark All Read
              </button>
            )}
            <button className="notification-close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        {loading ? (
          <div className="notification-center-loading">
            <LoadingSpinner size="small" />
          </div>
        ) : error ? (
          <ErrorDisplay error={error} />
        ) : notifications.length === 0 ? (
          <div className="notification-center-empty">
            <p>No notifications</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <span className="unread-badge" title="Unread"></span>
                  )}
                  <button
                    className="notification-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(notification.id)
                    }}
                    aria-label="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationCenter

