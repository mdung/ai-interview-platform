import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../../store/authStore'

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    })
    localStorage.clear()
  })

  it('initializes with null user and token', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('logs in user and sets token', () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'RECRUITER' as const,
    }
    const token = 'test-token'

    useAuthStore.getState().login(user, token)

    const state = useAuthStore.getState()
    expect(state.user).toEqual(user)
    expect(state.token).toBe(token)
    expect(state.isAuthenticated).toBe(true)
  })

  it('logs out user and clears token', () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'RECRUITER' as const,
    }
    const token = 'test-token'

    useAuthStore.getState().login(user, token)
    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('updates user information', () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'RECRUITER' as const,
    }
    const token = 'test-token'

    useAuthStore.getState().login(user, token)
    useAuthStore.getState().updateUser({ firstName: 'Updated' })

    const state = useAuthStore.getState()
    expect(state.user?.firstName).toBe('Updated')
    expect(state.user?.email).toBe('test@example.com')
  })
})


