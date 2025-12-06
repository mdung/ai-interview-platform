import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { templateApi } from '../services/api'
import { SearchBar, LoadingSpinner, ErrorDisplay, PageLayout } from '../components'
import './TemplateList.css'

interface Template {
  id: number
  name: string
  mode: string
  estimatedDurationMinutes: number
  active: boolean
  createdAt: string
}

interface TemplateListResponse {
  templates?: Template[]
  totalElements?: number
  totalPages?: number
  currentPage?: number
  pageSize?: number
}

const TemplateList = () => {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    page: 0,
    size: 20,
    sortBy: 'name',
    sortDir: 'asc' as 'asc' | 'desc',
  })

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await templateApi.getAllTemplates()
      const data: TemplateListResponse = response.data
      
      // Handle both array and paginated response
      if (Array.isArray(data)) {
        setTemplates(data)
      } else if (data.templates) {
        setTemplates(data.templates)
      } else {
        setTemplates([])
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  // Filter and sort templates client-side
  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter((template) => {
      if (!filters.search) return true
      const searchLower = filters.search.toLowerCase()
      return (
        template.name.toLowerCase().includes(searchLower) ||
        template.mode.toLowerCase().includes(searchLower)
      )
    })

    // Sort templates
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'estimatedDurationMinutes':
          aValue = a.estimatedDurationMinutes
          bValue = b.estimatedDurationMinutes
          break
        default:
          return 0
      }

      if (filters.sortDir === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    return filtered
  }, [templates, filters.search, filters.sortBy, filters.sortDir])

  // Simple pagination (client-side)
  const totalPages = Math.ceil(filteredTemplates.length / filters.size)
  const startIndex = filters.page * filters.size
  const endIndex = startIndex + filters.size
  const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex)

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return
    }

    try {
      await templateApi.deleteTemplate(id)
      await loadTemplates()
    } catch (err: any) {
      alert('Failed to delete template')
    }
  }

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 0 }))
  }, [])

  const handleSortByChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, sortBy: value }))
  }, [])

  const handleSortDirChange = useCallback((value: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortDir: value }))
  }, [])

  if (loading && templates.length === 0) {
    return (
      <div className="template-list-container">
        <LoadingSpinner message="Loading templates..." />
      </div>
    )
  }

  return (
    <PageLayout
      title="Interview Templates"
      actions={
        <button className="btn btn-primary" onClick={() => navigate('/recruiter/templates/new')}>
          ➕ Create New Template
        </button>
      }
    >
    <div className="template-list-container">
      {error && <ErrorDisplay error={error} />}

      <div className="search-filter-section">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search templates by name or mode..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Sort By</label>
          <select
            className="input"
            value={filters.sortBy}
            onChange={(e) => handleSortByChange(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="createdAt">Created Date</option>
            <option value="estimatedDurationMinutes">Duration</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort Direction</label>
          <select
            className="input"
            value={filters.sortDir}
            onChange={(e) => handleSortDirChange(e.target.value as 'asc' | 'desc')}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div className="templates-grid">
        {paginatedTemplates.length === 0 ? (
          <div className="empty-state">
            <p>{filters.search ? 'No templates found matching your search.' : 'No interview templates yet.'}</p>
          </div>
        ) : (
          paginatedTemplates.map((template) => (
            <div key={template.id} className="template-card">
              <h3>{template.name}</h3>
              <p>Mode: {template.mode}</p>
              <p>Duration: {template.estimatedDurationMinutes} minutes</p>
              <div className="template-actions">
                <button
                  className="btn btn-small btn-primary"
                  onClick={() => navigate(`/recruiter/templates/${template.id}`)}
                >
                  View
                </button>
                <button
                  className="btn btn-small btn-primary"
                  onClick={() => navigate(`/recruiter/templates/${template.id}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => handleDelete(template.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={filters.page === 0}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </button>
          <span>
            Page {filters.page + 1} of {totalPages} ({filteredTemplates.length} total)
          </span>
          <button
            className="btn btn-secondary"
            disabled={filters.page >= totalPages - 1}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </button>
        </div>
      )}
    </div>
    </PageLayout>
  )
}

export default TemplateList

