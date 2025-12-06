import { useApiQuery, useApiMutation, queryKeys } from './useApiQuery'
import { candidateApi } from '../services/api'

export function useCandidates(filters?: {
  search?: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}) {
  return useApiQuery(
    queryKeys.candidates.list(filters || {}),
    () => candidateApi.getAllCandidates(filters),
    {
      enabled: true,
      staleTime: 30000, // 30 seconds
    }
  )
}

export function useCandidate(id: number) {
  return useApiQuery(
    queryKeys.candidates.detail(id),
    () => candidateApi.getCandidateById(id),
    {
      enabled: !!id,
    }
  )
}

export function useCandidateInterviews(id: number) {
  return useApiQuery(
    queryKeys.candidates.interviews(id),
    () => candidateApi.getCandidateInterviews(id),
    {
      enabled: !!id,
    }
  )
}

export function useCreateCandidate() {
  return useApiMutation(
    (data: any) => candidateApi.createCandidate(data),
    {
      onSuccess: () => {
        // Invalidate candidates list
      },
    }
  )
}

export function useUpdateCandidate() {
  return useApiMutation(
    ({ id, data }: { id: number; data: any }) => candidateApi.updateCandidate(id, data)
  )
}

export function useDeleteCandidate() {
  return useApiMutation(
    (id: number) => candidateApi.bulkDelete([id]),
    {
      onSuccess: () => {
        // Invalidate candidates list
      },
    }
  )
}


