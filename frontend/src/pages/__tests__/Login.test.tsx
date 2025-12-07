import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import Login from '../Login'
import { authApi } from '../../services/api'

// Mock the API
vi.mock('../../services/api', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    render(<Login />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('shows error on login failure', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    })

    render(<Login />)
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('submits form with correct credentials', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValueOnce({
      data: {
        token: 'test-token',
        role: 'RECRUITER',
      },
    })

    render(<Login />)
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })
})



