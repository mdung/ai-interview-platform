import { useState } from 'react'
import './Calendar.css'

export interface CalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  className?: string
  showTodayButton?: boolean
  viewMode?: 'month' | 'week' | 'day'
  events?: Map<string, number>
}

const Calendar = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  className = '',
  showTodayButton = true,
  viewMode = 'month',
  events
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

  const getWeekDays = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const goToPreviousWeek = () => {
    const newDate = new Date(viewYear, viewMonth, currentDate.getDate() - 7)
    setCurrentDate(newDate)
    setViewMonth(newDate.getMonth())
    setViewYear(newDate.getFullYear())
  }

  const goToNextWeek = () => {
    const newDate = new Date(viewYear, viewMonth, currentDate.getDate() + 7)
    setCurrentDate(newDate)
    setViewMonth(newDate.getMonth())
    setViewYear(newDate.getFullYear())
  }

  const goToPreviousDay = () => {
    const newDate = new Date(viewYear, viewMonth, currentDate.getDate() - 1)
    setCurrentDate(newDate)
    setViewMonth(newDate.getMonth())
    setViewYear(newDate.getFullYear())
  }

  const goToNextDay = () => {
    const newDate = new Date(viewYear, viewMonth, currentDate.getDate() + 1)
    setCurrentDate(newDate)
    setViewMonth(newDate.getMonth())
    setViewYear(newDate.getFullYear())
  }

  const getEventCount = (date: Date): number => {
    if (!events) return 0
    const dateKey = date.toISOString().split('T')[0]
    return events.get(dateKey) || 0
  }

  const daysInMonth = getDaysInMonth(viewMonth, viewYear)
  const firstDay = getFirstDayOfMonth(viewMonth, viewYear)

  const days: (number | null)[] = []
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  // Render Month View
  const renderMonthView = () => (
    <>
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
          const eventCount = getEventCount(date)

          return (
            <div
              key={day}
              className={`calendar-day ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''} ${isTodayDate ? 'today' : ''} ${eventCount > 0 ? 'has-events' : ''}`}
              onClick={() => !disabled && handleDateClick(day)}
            >
              <span className="day-number">{day}</span>
              {eventCount > 0 && <span className="event-indicator">{eventCount}</span>}
            </div>
          )
        })}
      </div>
    </>
  )

  // Render Week View
  const renderWeekView = () => {
    const weekDays = getWeekDays(new Date(viewYear, viewMonth, selectedDate?.getDate() || currentDate.getDate()))
    const startDate = weekDays[0]
    const endDate = weekDays[6]

    return (
      <>
        <div className="calendar-header">
          <button onClick={goToPreviousWeek} className="calendar-nav-btn">
            ‹
          </button>
          <div className="calendar-month-year">
            {startDate.getDate()} {monthNames[startDate.getMonth()]} - {endDate.getDate()} {monthNames[endDate.getMonth()]} {viewYear}
          </div>
          <button onClick={goToNextWeek} className="calendar-nav-btn">
            ›
          </button>
        </div>

        <div className="calendar-week-view">
          {weekDays.map((date, index) => {
            const disabled = isDateDisabled(date)
            const selected = isDateSelected(date)
            const isTodayDate = isToday(date)
            const eventCount = getEventCount(date)

            return (
              <div
                key={index}
                className={`calendar-week-day ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''} ${isTodayDate ? 'today' : ''} ${eventCount > 0 ? 'has-events' : ''}`}
                onClick={() => !disabled && onDateSelect?.(date)}
              >
                <div className="week-day-header">
                  <div className="week-day-name">{dayNames[date.getDay()]}</div>
                  <div className="week-day-number">{date.getDate()}</div>
                </div>
                {eventCount > 0 && (
                  <div className="week-day-events">
                    <span className="event-count">{eventCount} interview{eventCount > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </>
    )
  }

  // Render Day View
  const renderDayView = () => {
    const viewDate = selectedDate || currentDate
    const eventCount = getEventCount(viewDate)

    return (
      <>
        <div className="calendar-header">
          <button onClick={goToPreviousDay} className="calendar-nav-btn">
            ‹
          </button>
          <div className="calendar-month-year">
            {dayNames[viewDate.getDay()]}, {monthNames[viewDate.getMonth()]} {viewDate.getDate()}, {viewDate.getFullYear()}
          </div>
          <button onClick={goToNextDay} className="calendar-nav-btn">
            ›
          </button>
        </div>

        <div className="calendar-day-view">
          <div className={`day-view-card ${isToday(viewDate) ? 'today' : ''} ${eventCount > 0 ? 'has-events' : ''}`}>
            <div className="day-view-date">
              <div className="day-view-number">{viewDate.getDate()}</div>
              <div className="day-view-month">{monthNames[viewDate.getMonth()]}</div>
            </div>
            {eventCount > 0 ? (
              <div className="day-view-events">
                <div className="event-count-large">{eventCount}</div>
                <div className="event-label">Interview{eventCount > 1 ? 's' : ''} Scheduled</div>
              </div>
            ) : (
              <div className="day-view-no-events">
                <p>No interviews scheduled</p>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className={`calendar calendar-${viewMode} ${className}`}>
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}

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



