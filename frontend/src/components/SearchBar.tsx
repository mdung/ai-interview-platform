import { useState, useEffect } from 'react'
import './SearchBar.css'

export interface SearchBarProps {
  placeholder?: string
  onSearch: (value: string) => void
  debounceMs?: number
  className?: string
}

const SearchBar = ({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  className = ''
}: SearchBarProps) => {
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchValue, debounceMs, onSearch])

  const handleClear = () => {
    setSearchValue('')
    onSearch('')
  }

  return (
    <div className={`search-bar ${className}`}>
      <div className="search-bar-icon">🔍</div>
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="search-bar-input"
      />
      {searchValue && (
        <button onClick={handleClear} className="search-bar-clear" aria-label="Clear search">
          ✕
        </button>
      )}
    </div>
  )
}

export default SearchBar

