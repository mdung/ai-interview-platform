import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { candidateApi } from '../services/api'
import { exportToCsv } from '../utils/exportUtils'
import { BulkActions, useToast, PageLayout } from '../components'
import './CandidateManagement.css'

interface Candidate {
  id: number
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  resumeUrl: string
  linkedInUrl: string
  createdAt: string
}

interface CandidateListResponse {
  candidates: Candidate[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

const CandidateManagement = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [candidates, setCandidates] = useState<CandidateListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [selectedCandidates, setSelectedCandidates] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState({
    search: '',
    page: 0,
    size: 20,
    sortBy: 'id',
    sortDir: 'desc',
  })

  useEffect(() => {
    loadCandidates()
  }, [filters])

  const loadCandidates = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await candidateApi.getAllCandidates(filters)
      setCandidates(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) {
      return
    }

    try {
      await candidateApi.bulkDelete([id])
      showToast('Candidate deleted successfully', 'success')
      loadCandidates()
    } catch (err: any) {
      showToast('Failed to delete candidate', 'error')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCandidates.size === 0) return
    
    try {
      await candidateApi.bulkDelete(Array.from(selectedCandidates))
      showToast(`${selectedCandidates.size} candidate(s) deleted`, 'success')
      setSelectedCandidates(new Set())
      loadCandidates()
    } catch (err: any) {
      showToast('Failed to delete candidates', 'error')
    }
  }

  const handleBulkExport = () => {
    if (selectedCandidates.size === 0) {
      showToast('Please select candidates to export', 'warning')
      return
    }

    const selectedData = candidates?.candidates
      .filter((c) => selectedCandidates.has(c.id))
      .map((candidate) => ({
        'ID': candidate.id,
        'First Name': candidate.firstName,
        'Last Name': candidate.lastName,
        'Email': candidate.email,
        'Phone': candidate.phoneNumber || 'N/A',
        'LinkedIn': candidate.linkedInUrl || 'N/A',
        'Has Resume': candidate.resumeUrl ? 'Yes' : 'No',
        'Created At': new Date(candidate.createdAt).toLocaleString()
      })) || []

    exportToCsv(selectedData, `candidates_selected_${new Date().toISOString().split('T')[0]}`)
    showToast(`${selectedCandidates.size} candidate(s) exported`, 'success')
  }

  const toggleCandidateSelection = (id: number) => {
    const newSelected = new Set(selectedCandidates)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCandidates(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedCandidates.size === candidates?.candidates.length) {
      setSelectedCandidates(new Set())
    } else {
      setSelectedCandidates(new Set(candidates?.candidates.map((c) => c.id) || []))
    }
  }

  const handleDownloadResume = async (id: number) => {
    try {
      const response = await candidateApi.downloadResume(id)
      const { downloadBlob } = await import('../utils/exportUtils')
      downloadBlob(response.data, `resume_${id}.pdf`, 'application/pdf')
      showToast('Resume downloaded successfully', 'success')
    } catch (err: any) {
      showToast('Failed to download resume', 'error')
    }
  }

  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  const handleBulkImport = () => {
    setShowImportModal(true)
  }

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0])
    }
  }

  const handleImportSubmit = async () => {
    if (!importFile) {
      showToast('Please select a file', 'warning')
      return
    }

    setImporting(true)
    try {
      const text = await importFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      
      const candidates = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const candidate: any = {}
        headers.forEach((header, index) => {
          const key = header.toLowerCase().replace(/\s+/g, '')
          if (key === 'firstname' || key === 'first_name') {
            candidate.firstName = values[index]
          } else if (key === 'lastname' || key === 'last_name') {
            candidate.lastName = values[index]
          } else if (key === 'email') {
            candidate.email = values[index]
          } else if (key === 'phone' || key === 'phonenumber' || key === 'phone_number') {
            candidate.phoneNumber = values[index]
          } else if (key === 'linkedin' || key === 'linkedinurl' || key === 'linkedin_url') {
            candidate.linkedInUrl = values[index]
          }
        })
        return candidate
      }).filter(c => c.email && c.firstName && c.lastName)

      if (candidates.length === 0) {
        showToast('No valid candidates found in file', 'warning')
        return
      }

      await candidateApi.bulkCreate(candidates)
      showToast(`${candidates.length} candidate(s) imported successfully`, 'success')
      setShowImportModal(false)
      setImportFile(null)
      loadCandidates()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to import candidates', 'error')
    } finally {
      setImporting(false)
    }
  }

  const handleExportAll = () => {
    if (!candidates || candidates.candidates.length === 0) {
      showToast('No candidates to export', 'warning')
      return
    }

    try {
      setExporting(true)
      const exportData = candidates.candidates.map((candidate) => ({
        'ID': candidate.id,
        'First Name': candidate.firstName,
        'Last Name': candidate.lastName,
        'Email': candidate.email,
        'Phone': candidate.phoneNumber || 'N/A',
        'LinkedIn': candidate.linkedInUrl || 'N/A',
        'Has Resume': candidate.resumeUrl ? 'Yes' : 'No',
        'Created At': new Date(candidate.createdAt).toLocaleString()
      }))

      exportToCsv(exportData, `candidates_export_${new Date().toISOString().split('T')[0]}`)
      showToast('Candidates exported successfully', 'success')
    } catch (err: any) {
      showToast('Failed to export candidates', 'error')
    } finally {
      setExporting(false)
    }
  }

  if (loading && !candidates) {
    return (
      <PageLayout title="Candidate Management">
        <div className="loading">Loading candidates...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Candidate Management"
      actions={
        <>
          <button
            className="btn btn-secondary"
            onClick={handleExportAll}
            disabled={exporting || !candidates || candidates.candidates.length === 0}
          >
            {exporting ? 'Exporting...' : 'Export All (CSV)'}
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/recruiter/candidates/new')}>
            ➕ Add Candidate
          </button>
        </>
      }
    >
    <div className="candidate-management-container">

      {error && <div className="error-message">{error}</div>}

      <div className="search-filter-section">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 0 })}
          />
        </div>
      </div>

      {selectedCandidates.size > 0 && (
        <BulkActions
          selectedCount={selectedCandidates.size}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
          availableActions={['delete', 'export']}
        />
      )}

      <div className="candidates-table-container">
        <table className="candidates-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedCandidates.size === candidates?.candidates.length && candidates.candidates.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Resume</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates?.candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCandidates.has(candidate.id)}
                    onChange={() => toggleCandidateSelection(candidate.id)}
                  />
                </td>
                <td>{candidate.id}</td>
                <td>{candidate.firstName} {candidate.lastName}</td>
                <td>{candidate.email}</td>
                <td>{candidate.phoneNumber || 'N/A'}</td>
                <td>
                  {candidate.resumeUrl ? (
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() => handleDownloadResume(candidate.id)}
                    >
                      Download
                    </button>
                  ) : (
                    <span>No resume</span>
                  )}
                </td>
                <td>{new Date(candidate.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() => navigate(`/recruiter/candidates/${candidate.id}`)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() => navigate(`/recruiter/candidates/${candidate.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(candidate.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {candidates && candidates.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={filters.page === 0}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            Previous
          </button>
          <span>
            Page {filters.page + 1} of {candidates.totalPages} ({candidates.totalElements} total)
          </span>
          <button
            className="btn btn-secondary"
            disabled={filters.page >= candidates.totalPages - 1}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next
          </button>
        </div>
      )}

      {showImportModal && (
        <div className="import-modal">
          <div className="import-modal-content">
            <div className="import-modal-header">
              <h2>Bulk Import Candidates</h2>
              <button
                className="btn btn-small btn-secondary"
                onClick={() => {
                  setShowImportModal(false)
                  setImportFile(null)
                }}
              >
                ×
              </button>
            </div>
            <div className="import-modal-body">
              <p>Upload a CSV file with the following columns:</p>
              <ul>
                <li>First Name (or firstName, first_name)</li>
                <li>Last Name (or lastName, last_name)</li>
                <li>Email</li>
                <li>Phone (optional)</li>
                <li>LinkedIn (optional)</li>
              </ul>
              <div className="file-input-group">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportFileChange}
                  className="file-input"
                />
                {importFile && (
                  <p className="file-name">Selected: {importFile.name}</p>
                )}
              </div>
              <div className="import-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleImportSubmit}
                  disabled={!importFile || importing}
                >
                  {importing ? 'Importing...' : 'Import'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowImportModal(false)
                    setImportFile(null)
                  }}
                  disabled={importing}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageLayout>
  )
}

export default CandidateManagement

