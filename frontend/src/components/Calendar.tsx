import { useState } from 'react'
import './Calendar.css'

export interface CalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  className?: string
  showTodayButton?: boolean
}

const Calendar = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  className = '',
  showTodayButton = true
}: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date())
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth())
  const [viewYear, setViewYear] = useState(currentDate.getFullYear())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isDateDisabled = (date: Date): boolean => {
    if (minDate) {
      const min = new Date(minDate)
      min.setHours(0, 0, 0, 0)
      if (date < min) return true
    }
    if (maxDate) {
      const max = new Date(maxDate)
      max.setHours(0, 0, 0, 0)
      if (date > max) return true
    }
    return false
  }

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const isToday = (date: Date): boolean => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handleDateClick = (day: number) => {
    const date = new Date(viewYear, viewMonth, day)
    if (!isDateDisabled(date)) {
      onDateSelect?.(date)
    }
  }

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const goToToday = () => {
    const today = new Date()
    setViewMonth(today.getMonth())
    setViewYear(today.getFullYear())
    onDateSelect?.(today)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const daysInMonth = getDaysInMonth(viewMonth, viewYear)
  const firstDay = getFirstDayOfMonth(viewMonth, viewYear)

  const days = []
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(viewYear, viewMonth, day)
    days.push(day)
  }

  return (
    <div className={`calendar ${className}`}>
      <div className="calendar-header">
        <button onClick={goToPreviousMonth} className="calendar-nav-btn">
          ‹
        </button>
        <div className="calendar-month-year">
          {monthNames[viewMonth]} {viewYear}
        </div>
        <button onClick={goToNextMonth} className="calendar-nav-btn">
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {dayNames.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-days">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="calendar-day empty" />
          }

          const date = new Date(viewYear, viewMonth, day)
          const disabled = isDateDisabled(date)
          const selected = isDateSelected(date)
          const isTodayDate = isToday(date)

          return (
            <div
              key={day}
              className={`calendar-day ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
              onClick={() => !disabled && handleDateClick(day)}
            >
              {day}
            </div>
          )
        })}
      </div>

      {showTodayButton && (
        <div className="calendar-footer">
          <button onClick={goToToday} className="calendar-today-btn">
            Today
          </button>
        </div>
      )}
    </div>
  )
}

export default Calendar

