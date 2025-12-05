import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const interviewApi = {
  getSession: (sessionId: string) => 
    api.get(`/interviews/sessions/${sessionId}`),
  
  joinInterview: (sessionId: string) =>
    api.get(`/candidates/join/${sessionId}`),
  
  updateSessionStatus: (sessionId: string, status: string) =>
    api.put(`/interviews/sessions/${sessionId}/status`, null, {
      params: { status },
    }),
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
}

export default api

