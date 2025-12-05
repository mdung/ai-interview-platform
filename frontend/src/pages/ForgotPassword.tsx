import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../services/api'
import './Login.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>AI Interview Platform</h1>
          <h2>Check Your Email</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
            Please check your email and click on the link to reset your password.
            The link will expire in 24 hours.
          </p>
          <Link to="/" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>AI Interview Platform</h1>
        <h2>Forgot Password</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword

