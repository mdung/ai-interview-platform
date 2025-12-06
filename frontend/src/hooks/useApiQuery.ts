import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'

// Generic query hook
export function useApiQuery<TData = unknown, TError = AxiosError>(
  queryKey: string[],
  queryFn: () => Promise<{ data: TData }>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      const response = await queryFn()
      return response.data
    },
    ...options,
  })
}

// Generic mutation hook
export function useApiMutation<TData = unknown, TVariables = unknown, TError = AxiosError>(
  mutationFn: (variables: TVariables) => Promise<{ data: TData }>,
  options?: UseMutationOptions<TData, TError, TVariables>
) {
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      const response = await mutationFn(variables)
      return response.data
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries()
    },
    ...options,
  })
}

// Query keys factory
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  candidates: {
    all: ['candidates'] as const,
    lists: () => [...queryKeys.candidates.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.candidates.lists(), filters] as const,
    details: () => [...queryKeys.candidates.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.candidates.details(), id] as const,
    interviews: (id: number) => [...queryKeys.candidates.detail(id), 'interviews'] as const,
  },
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.jobs.lists(), filters] as const,
    details: () => [...queryKeys.jobs.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.jobs.details(), id] as const,
    candidates: (id: number) => [...queryKeys.jobs.detail(id), 'candidates'] as const,
    statistics: (id: number) => [...queryKeys.jobs.detail(id), 'statistics'] as const,
  },
  interviews: {
    all: ['interviews'] as const,
    sessions: () => [...queryKeys.interviews.all, 'sessions'] as const,
    session: (sessionId: string) => [...queryKeys.interviews.sessions(), sessionId] as const,
    turns: (sessionId: string) => [...queryKeys.interviews.session(sessionId), 'turns'] as const,
    transcript: (sessionId: string) => [...queryKeys.interviews.session(sessionId), 'transcript'] as const,
  },
  templates: {
    all: ['templates'] as const,
    lists: () => [...queryKeys.templates.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.templates.lists(), filters] as const,
    details: () => [...queryKeys.templates.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.templates.details(), id] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    overview: () => [...queryKeys.analytics.all, 'overview'] as const,
    interviews: () => [...queryKeys.analytics.all, 'interviews'] as const,
    candidates: () => [...queryKeys.analytics.all, 'candidates'] as const,
    jobs: () => [...queryKeys.analytics.all, 'jobs'] as const,
    trends: (params: Record<string, any>) => [...queryKeys.analytics.all, 'trends', params] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.notifications.lists(), filters] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    count: () => [...queryKeys.notifications.all, 'count'] as const,
  },
}


