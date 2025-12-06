import { useState, useEffect } from 'react'
import { notificationApi } from '../services/api'
import NotificationCenter from './NotificationCenter'
import './NotificationBell.css'

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadUnreadCount()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount()
      setUnreadCount(response.data || 0)
    } catch (err) {
      console.error('Failed to load unread count')
    }
  }

  return (
    <>
      <button
        className="notification-bell"
        onClick={() => setIsOpen(true)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>
      <NotificationCenter
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          loadUnreadCount()
        }}
      />
    </>
  )
}

export default NotificationBell

