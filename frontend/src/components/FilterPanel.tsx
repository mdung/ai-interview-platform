import { useState } from 'react'
import './FilterPanel.css'

export interface FilterOption {
  label: string
  value: string
}

export interface Filter {
  key: string
  label: string
  type: 'select' | 'checkbox' | 'date' | 'text'
  options?: FilterOption[]
  placeholder?: string
}

export interface FilterPanelProps {
  filters: Filter[]
  onFilterChange: (filters: Record<string, any>) => void
  className?: string
}

const FilterPanel = ({ filters, onFilterChange, className = '' }: FilterPanelProps) => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value }
    setFilterValues(newFilters)
    onFilterChange(newFilters)
  }

  const handleClear = () => {
    const clearedFilters: Record<string, any> = {}
    filters.forEach((filter) => {
      clearedFilters[filter.key] = filter.type === 'checkbox' ? false : ''
    })
    setFilterValues(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(filterValues).some((value) => {
    if (typeof value === 'boolean') return value
    return value !== '' && value !== null && value !== undefined
  })

  return (
    <div className={`filter-panel ${className}`}>
      <div className="filter-panel-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button onClick={handleClear} className="filter-clear-btn">
            Clear All
          </button>
        )}
      </div>
      <div className="filter-panel-content">
        {filters.map((filter) => (
          <div key={filter.key} className="filter-item">
            <label className="filter-label">{filter.label}</label>
            {filter.type === 'select' && (
              <select
                value={filterValues[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="filter-input"
              >
                <option value="">All</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            {filter.type === 'checkbox' && (
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filterValues[filter.key] || false}
                  onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                />
                <span>Enabled</span>
              </label>
            )}
            {filter.type === 'date' && (
              <input
                type="date"
                value={filterValues[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="filter-input"
              />
            )}
            {filter.type === 'text' && (
              <input
                type="text"
                placeholder={filter.placeholder}
                value={filterValues[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="filter-input"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FilterPanel

