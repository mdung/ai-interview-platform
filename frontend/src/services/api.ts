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
  createSession: (data: {
    candidateId: number
    templateId: number
    language?: string
    scheduledAt?: string
  }) => api.post('/interviews/sessions', data),
  
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
  sendInterviewLink: (sessionId: string) =>
    api.post(`/interviews/sessions/${sessionId}/send-link`),
  
  reportSuspiciousActivity: (sessionId: string, data: {
    activityType: string
    timestamp: string
    metadata?: Record<string, any>
  }) => api.post(`/interviews/sessions/${sessionId}/report-activity`, data),
  
  updateTurn: (sessionId: string, turnId: number, data: {
    answer?: string
    answerDurationMs?: number
    audioUrl?: string
  }) => api.put(`/interviews/sessions/${sessionId}/turns/${turnId}`, data),
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

export const jobApi = {
  getAllJobs: (params?: {
    search?: string
    page?: number
    size?: number
    sortBy?: string
    sortDir?: string
  }) => api.get('/recruiter/jobs', { params }),
  getJobById: (id: number) => api.get(`/recruiter/jobs/${id}`),
  createJob: (data: any) => api.post('/recruiter/jobs', data),
  updateJob: (id: number, data: any) => api.put(`/recruiter/jobs/${id}`, data),
  deleteJob: (id: number) => api.delete(`/recruiter/jobs/${id}`),
  bulkCreate: (data: any[]) => api.post('/recruiter/jobs/bulk', data),
  bulkDelete: (ids: number[]) => api.delete('/recruiter/jobs/bulk', { data: ids }),
  getStatistics: () => api.get('/recruiter/jobs/statistics'),
  getJobStatistics: (id: number) => api.get(`/recruiter/jobs/${id}/statistics`),
  getJobCandidates: (id: number) => api.get(`/recruiter/jobs/${id}/candidates`),
  publishJob: (id: number) => api.post(`/recruiter/jobs/${id}/publish`),
  unpublishJob: (id: number) => api.post(`/recruiter/jobs/${id}/unpublish`),
}

export const templateApi = {
  getAllTemplates: () => api.get('/recruiter/templates'),
  getTemplatesByJob: (jobId: number) => api.get(`/recruiter/templates/job/${jobId}`),
  getTemplateById: (id: number) => api.get(`/recruiter/templates/${id}`),
  createTemplate: (data: any) => api.post('/recruiter/templates', data),
  updateTemplate: (id: number, data: any) => api.put(`/recruiter/templates/${id}`, data),
  deleteTemplate: (id: number) => api.delete(`/recruiter/templates/${id}`),
}

export const candidateApi = {
  getAllCandidates: (params?: {
    search?: string
    page?: number
    size?: number
    sortBy?: string
    sortDir?: string
  }) => api.get('/recruiter/candidates', { params }),
  getCandidateById: (id: number) => api.get(`/recruiter/candidates/${id}`),
  createCandidate: (data: any) => api.post('/recruiter/candidates', data),
  updateCandidate: (id: number, data: any) => api.put(`/recruiter/candidates/${id}`, data),
  uploadResume: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/recruiter/candidates/${id}/resume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  downloadResume: (id: number) => api.get(`/recruiter/candidates/${id}/resume`, {
    responseType: 'blob',
  }),
  bulkCreate: (data: any) => api.post('/recruiter/candidates/bulk', data),
  bulkDelete: (ids: number[]) => api.delete('/recruiter/candidates/bulk', { data: ids }),
  getStatistics: () => api.get('/recruiter/candidates/statistics'),
  getCandidateInterviews: (id: number) => api.get(`/recruiter/candidates/${id}/interviews`),
}

export const analyticsApi = {
  getDashboardOverview: () => api.get('/recruiter/analytics/overview'),
  getInterviewAnalytics: () => api.get('/recruiter/analytics/interviews'),
  getCandidateAnalytics: () => api.get('/recruiter/analytics/candidates'),
  getJobAnalytics: () => api.get('/recruiter/analytics/jobs'),
  getTrends: (params?: {
    metric?: string
    period?: string
    days?: number
  }) => api.get('/recruiter/analytics/trends', { params }),
  exportDashboardPdf: () => api.get('/recruiter/analytics/reports/dashboard/pdf', {
    responseType: 'blob',
  }),
  exportDashboardCsv: () => api.get('/recruiter/analytics/reports/dashboard/csv', {
    responseType: 'blob',
  }),
  exportInterviewPdf: () => api.get('/recruiter/analytics/reports/interviews/pdf', {
    responseType: 'blob',
  }),
  exportCandidatePdf: () => api.get('/recruiter/analytics/reports/candidates/pdf', {
    responseType: 'blob',
  }),
}

export const atsApi = {
  integrate: (data: {
    provider: string
    apiKey: string
    apiSecret?: string
    baseUrl: string
    webhookUrl?: string
    enabled?: boolean
  }) => api.post('/ats/integrate', data),
  
  getIntegrations: () => api.get('/ats/integrations'),
  
  getIntegration: (id: number) => api.get(`/ats/integrations/${id}`),
  
  updateIntegration: (id: number, data: any) => api.put(`/ats/integrations/${id}`, data),
  
  deleteIntegration: (id: number) => api.delete(`/ats/integrations/${id}`),
  
  syncIntegration: (id: number) => api.post(`/ats/integrations/${id}/sync`),
  
  exportCandidate: (candidateId: number, integrationId: number) =>
    api.post(`/ats/candidates/${candidateId}/export`, null, {
      params: { integrationId },
    }),
}

export const adminApi = {
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (id: number) => api.get(`/admin/users/${id}`),
  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  activateUser: (id: number) => api.put(`/admin/users/${id}/activate`),
  deactivateUser: (id: number) => api.put(`/admin/users/${id}/activate`, { active: false }),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  getSystemStatistics: () => api.get('/admin/statistics'),
  getSystemLogs: (params?: { level?: string; page?: number; size?: number }) =>
    api.get('/admin/logs', { params }),
  getSystemSettings: () => api.get('/admin/settings'),
  updateSystemSettings: (settings: any) => api.put('/admin/settings', settings),
  getSystemHealth: () => api.get('/admin/health'),
}

export const notificationApi = {
  getNotifications: (params?: {
    page?: number
    size?: number
  }) => api.get('/notifications', { params }),
  getUnreadNotifications: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id: number) => api.delete(`/notifications/${id}`),
}

export default api

