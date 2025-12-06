import { useState, useRef, useEffect } from 'react'
import Calendar from './Calendar'
import './DatePicker.css'

export interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | null) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  className?: string
  disabled?: boolean
  format?: string
}

const DatePicker = ({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  className = '',
  disabled = false,
  format = 'YYYY-MM-DD'
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelectedDate(value || null)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const formatDate = (date: Date | null): string => {
    if (!date) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('YY', String(year).slice(-2))
      .replace('M', String(date.getMonth() + 1))
      .replace('D', String(date.getDate()))
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    onChange?.(date)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDate(null)
    onChange?.(null)
  }

  return (
    <div ref={containerRef} className={`date-picker ${className}`}>
      <div
        className={`date-picker-input ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <input
          type="text"
          readOnly
          value={formatDate(selectedDate)}
          placeholder={placeholder}
          className="date-picker-input-field"
          disabled={disabled}
        />
        <div className="date-picker-icons">
          {selectedDate && !disabled && (
            <button
              onClick={handleClear}
              className="date-picker-clear"
              aria-label="Clear date"
            >
              ✕
            </button>
          )}
          <span className="date-picker-icon">📅</span>
        </div>
      </div>
      {isOpen && !disabled && (
        <div className="date-picker-dropdown">
          <Calendar
            selectedDate={selectedDate || undefined}
            onDateSelect={handleDateSelect}
            minDate={minDate}
            maxDate={maxDate}
            showTodayButton={true}
          />
        </div>
      )}
    </div>
  )
}

export default DatePicker


