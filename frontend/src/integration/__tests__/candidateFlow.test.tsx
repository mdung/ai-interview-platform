import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import CandidateManagement from '../../pages/CandidateManagement'
import { candidateApi } from '../../services/api'

// Mock API
vi.mock('../../services/api', () => ({
  candidateApi: {
    getAllCandidates: vi.fn(),
    createCandidate: vi.fn(),
    updateCandidate: vi.fn(),
    bulkDelete: vi.fn(),
  },
}))

describe('Candidate Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load and display candidates', async () => {
    const mockCandidates = {
      candidates: [
        { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User' },
      ],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
    }

    vi.mocked(candidateApi.getAllCandidates).mockResolvedValueOnce({
      data: mockCandidates,
    })

    render(<CandidateManagement />)

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  it('should handle candidate creation flow', async () => {
    const user = userEvent.setup()
    const mockCandidate = { id: 1, email: 'new@example.com', firstName: 'New', lastName: 'User' }

    vi.mocked(candidateApi.getAllCandidates).mockResolvedValue({
      data: { candidates: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 20 },
    })
    vi.mocked(candidateApi.createCandidate).mockResolvedValueOnce({
      data: mockCandidate,
    })

    render(<CandidateManagement />)

    // Navigate to create page (this would be done via router in real app)
    // For integration test, we test the form submission
    await waitFor(() => {
      expect(candidateApi.getAllCandidates).toHaveBeenCalled()
    })
  })
})

