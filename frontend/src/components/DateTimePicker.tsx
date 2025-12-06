import { useState } from 'react'
import DatePicker from './DatePicker'
import './DateTimePicker.css'

export interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | null) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  className?: string
  disabled?: boolean
  showSeconds?: boolean
}

const DateTimePicker = ({
  value,
  onChange,
  placeholder = 'Select date and time',
  minDate,
  maxDate,
  className = '',
  disabled = false,
  showSeconds = false
}: DateTimePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null)
  const [time, setTime] = useState({
    hours: value ? String(value.getHours()).padStart(2, '0') : '00',
    minutes: value ? String(value.getMinutes()).padStart(2, '0') : '00',
    seconds: value ? String(value.getSeconds()).padStart(2, '0') : '00'
  })

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const newDate = new Date(date)
      newDate.setHours(parseInt(time.hours), parseInt(time.minutes), parseInt(time.seconds))
      setSelectedDate(newDate)
      onChange?.(newDate)
    } else {
      setSelectedDate(null)
      onChange?.(null)
    }
  }

  const handleTimeChange = (field: 'hours' | 'minutes' | 'seconds', value: string) => {
    const numValue = parseInt(value) || 0
    let newValue = value

    if (field === 'hours') {
      newValue = String(Math.max(0, Math.min(23, numValue))).padStart(2, '0')
    } else if (field === 'minutes') {
      newValue = String(Math.max(0, Math.min(59, numValue))).padStart(2, '0')
    } else if (field === 'seconds') {
      newValue = String(Math.max(0, Math.min(59, numValue))).padStart(2, '0')
    }

    setTime((prev) => ({ ...prev, [field]: newValue }))

    if (selectedDate) {
      const newDate = new Date(selectedDate)
      const hours = field === 'hours' ? parseInt(newValue) : parseInt(time.hours)
      const minutes = field === 'minutes' ? parseInt(newValue) : parseInt(time.minutes)
      const seconds = field === 'seconds' ? parseInt(newValue) : parseInt(time.seconds)
      newDate.setHours(hours, minutes, seconds)
      setSelectedDate(newDate)
      onChange?.(newDate)
    }
  }

  return (
    <div className={`date-time-picker ${className}`}>
      <DatePicker
        value={selectedDate || undefined}
        onChange={handleDateChange}
        placeholder={placeholder}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
      />
      <div className="time-picker">
        <div className="time-input-group">
          <label>Hours</label>
          <input
            type="number"
            min="0"
            max="23"
            value={time.hours}
            onChange={(e) => handleTimeChange('hours', e.target.value)}
            className="time-input"
            disabled={disabled}
          />
        </div>
        <span className="time-separator">:</span>
        <div className="time-input-group">
          <label>Minutes</label>
          <input
            type="number"
            min="0"
            max="59"
            value={time.minutes}
            onChange={(e) => handleTimeChange('minutes', e.target.value)}
            className="time-input"
            disabled={disabled}
          />
        </div>
        {showSeconds && (
          <>
            <span className="time-separator">:</span>
            <div className="time-input-group">
              <label>Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={time.seconds}
                onChange={(e) => handleTimeChange('seconds', e.target.value)}
                className="time-input"
                disabled={disabled}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DateTimePicker


