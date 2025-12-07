import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await authApi.login(email, password)
      
      // Update auth store
      login(
        {
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
        },
        response.data.token
      )
      
      // Navigate based on role
      if (response.data.role === 'RECRUITER' || response.data.role === 'ADMIN') {
        navigate('/recruiter')
      } else {
        // For candidates, they would join via interview link
        alert('Please use the interview link provided to you.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🎯</div>
          <h1 className="login-title">AI Interview Platform</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Sign In
          </button>
          <div className="login-footer">
            <Link to="/forgot-password" className="login-link">
              Forgot Password?
            </Link>
            <div style={{ marginTop: '12px' }}>
              <span style={{ color: '#6b7280', marginRight: '8px' }}>Don't have an account?</span>
              <Link to="/register" className="login-link">
                Register
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login

