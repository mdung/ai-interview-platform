import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import './Navigation.css'

const Navigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, initializeFromStorage } = useAuthStore()

  // Initialize user from localStorage on mount if not already loaded
  useEffect(() => {
    if (!user) {
      initializeFromStorage()
    }
  }, [user, initializeFromStorage])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  if (!user) return null

  const isRecruiter = user.role === 'RECRUITER' || user.role === 'ADMIN'
  const isAdmin = user.role === 'ADMIN'

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/recruiter" className="brand-link">
            <span className="brand-icon">🎯</span>
            <span className="brand-text">AI Interview Platform</span>
          </Link>
        </div>

        <div className="nav-menu">
          {isRecruiter && (
            <>
              <Link
                to="/recruiter"
                className={`nav-link ${isActive('/recruiter') && location.pathname === '/recruiter' ? 'active' : ''}`}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Dashboard</span>
              </Link>

              <Link
                to="/recruiter/sessions"
                className={`nav-link ${isActive('/recruiter/sessions') ? 'active' : ''}`}
              >
                <span className="nav-icon">💬</span>
                <span className="nav-text">Sessions</span>
              </Link>

              <Link
                to="/recruiter/sessions/new"
                className={`nav-link ${isActive('/recruiter/sessions/new') ? 'active' : ''}`}
              >
                <span className="nav-icon">➕</span>
                <span className="nav-text">New Session</span>
              </Link>

              <Link
                to="/recruiter/candidates"
                className={`nav-link ${isActive('/recruiter/candidates') ? 'active' : ''}`}
              >
                <span className="nav-icon">👥</span>
                <span className="nav-text">Candidates</span>
              </Link>

              <Link
                to="/recruiter/jobs"
                className={`nav-link ${isActive('/recruiter/jobs') ? 'active' : ''}`}
              >
                <span className="nav-icon">💼</span>
                <span className="nav-text">Jobs</span>
              </Link>

              <Link
                to="/recruiter/templates"
                className={`nav-link ${isActive('/recruiter/templates') ? 'active' : ''}`}
              >
                <span className="nav-icon">📝</span>
                <span className="nav-text">Templates</span>
              </Link>

              <Link
                to="/recruiter/analytics"
                className={`nav-link ${isActive('/recruiter/analytics') ? 'active' : ''}`}
              >
                <span className="nav-icon">📈</span>
                <span className="nav-text">Analytics</span>
              </Link>

              <Link
                to="/recruiter/calendar"
                className={`nav-link ${isActive('/recruiter/calendar') ? 'active' : ''}`}
              >
                <span className="nav-icon">📅</span>
                <span className="nav-text">Calendar</span>
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Admin</span>
            </Link>
          )}
        </div>

        <div className="nav-actions">
          <div className="user-info">
            <span className="user-avatar">{user.firstName?.[0] || user.email[0].toUpperCase()}</span>
            <span className="user-name">{user.firstName || user.email}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
