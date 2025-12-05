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
  
  getAllSessions: (params?: {
    status?: string
    candidateId?: number
    templateId?: number
    startDate?: string
    endDate?: string
    page?: number
    size?: number
    sortBy?: string
    sortDir?: string
  }) => api.get('/interviews/sessions', { params }),
  
  joinInterview: (sessionId: string) =>
    api.get(`/candidates/join/${sessionId}`),
  
  updateSessionStatus: (sessionId: string, status: string) =>
    api.put(`/interviews/sessions/${sessionId}/status`, null, {
      params: { status },
    }),
  
  pauseSession: (sessionId: string) =>
    api.post(`/interviews/sessions/${sessionId}/pause`),
  
  resumeSession: (sessionId: string) =>
    api.post(`/interviews/sessions/${sessionId}/resume`),
  
  getTurns: (sessionId: string) =>
    api.get(`/interviews/sessions/${sessionId}/turns`),
  
  getTranscript: (sessionId: string) =>
    api.get(`/interviews/sessions/${sessionId}/transcript`),
  
  updateEvaluation: (sessionId: string, data: {
    aiSummary: string
    strengths?: string
    weaknesses?: string
    recommendation?: string
    communicationScore?: number
    technicalScore?: number
    clarityScore?: number
  }) => api.put(`/interviews/sessions/${sessionId}/evaluation`, data),
  
  exportPdf: (sessionId: string) =>
    api.get(`/interviews/sessions/${sessionId}/export/pdf`, {
      responseType: 'blob',
    }),
  
  exportCsv: (sessionId: string) =>
    api.get(`/interviews/sessions/${sessionId}/export/csv`, {
      responseType: 'blob',
    }),
  
  uploadAudio: (sessionId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/interviews/sessions/${sessionId}/audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role?: string
  }) => api.post('/auth/register', data),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
  
  refreshToken: (token: string) =>
    api.post('/auth/refresh-token', { token }),
  
  getCurrentUser: () => api.get('/auth/me'),
  
  updateProfile: (data: {
    firstName: string
    lastName: string
    email: string
  }) => api.put('/auth/profile', data),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
}

export const adminApi = {
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (id: number) => api.get(`/admin/users/${id}`),
  updateUser: (id: number, data: {
    firstName: string
    lastName: string
    email: string
  }) => api.put(`/admin/users/${id}`, data),
  activateUser: (id: number) => api.put(`/admin/users/${id}/activate`),
  deactivateUser: (id: number) => api.put(`/admin/users/${id}/deactivate`),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
}

export default api

