import { useApiQuery, useApiMutation, queryKeys } from './useApiQuery'
import { interviewApi } from '../services/api'

export function useInterviewSessions(filters?: {
  status?: string
  candidateId?: number
  templateId?: number
  startDate?: string
  endDate?: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}) {
  return useApiQuery(
    queryKeys.interviews.sessions(),
    () => interviewApi.getAllSessions(filters),
    {
      enabled: true,
      staleTime: 30000,
    }
  )
}

export function useInterviewSession(sessionId: string) {
  return useApiQuery(
    queryKeys.interviews.session(sessionId),
    () => interviewApi.getSession(sessionId),
    {
      enabled: !!sessionId,
    }
  )
}

export function useInterviewTurns(sessionId: string) {
  return useApiQuery(
    queryKeys.interviews.turns(sessionId),
    () => interviewApi.getTurns(sessionId),
    {
      enabled: !!sessionId,
    }
  )
}

export function useInterviewTranscript(sessionId: string) {
  return useApiQuery(
    queryKeys.interviews.transcript(sessionId),
    () => interviewApi.getTranscript(sessionId),
    {
      enabled: !!sessionId,
    }
  )
}

export function useCreateSession() {
  return useApiMutation(
    (data: { candidateId: number; templateId: number; language?: string }) =>
      interviewApi.createSession(data)
  )
}

export function useUpdateSessionStatus() {
  return useApiMutation(
    ({ sessionId, status }: { sessionId: string; status: string }) =>
      interviewApi.updateSessionStatus(sessionId, status)
  )
}



