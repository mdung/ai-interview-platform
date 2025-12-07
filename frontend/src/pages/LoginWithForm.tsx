import { useNavigate, Link } from 'react-router-dom'
import { useFormWithValidation, loginSchema, LoginFormData } from '../hooks/useFormValidation'
import { authApi } from '../services/api'
import { useAuthStore } from '../store'
import './Login.css'

// Example of Login page using React Hook Form
const LoginWithForm = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormWithValidation<LoginFormData>(loginSchema)

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authApi.login(data.email, data.password)
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

      if (response.data.role === 'RECRUITER' || response.data.role === 'ADMIN') {
        navigate('/recruiter')
      } else {
        alert('Please use the interview link provided to you.')
      }
    } catch (err: any) {
      console.error('Login error:', err)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? 'input error' : 'input'}
            />
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className={errors.password ? 'input error' : 'input'}
            />
            {errors.password && <span className="error-message">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-links">
          <Link to="/forgot-password">Forgot Password?</Link>
          <Link to="/register">Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginWithForm



