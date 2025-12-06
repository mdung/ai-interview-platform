import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { interviewApi } from '../services/api'
import { InterviewSession } from '../types'
import { Calendar, LoadingSpinner, ErrorDisplay, useToast, PageLayout } from '../components'
import './CalendarView.css'

interface CalendarEvent {
  date: Date
  sessions: InterviewSession[]
}

const CalendarView = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    loadSessions()
  }, [currentMonth])

  const loadSessions = async () => {
    setLoading(true)
    setError('')
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
      
      const response = await interviewApi.getAllSessions({
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
        page: 0,
        size: 1000
      })
      setSessions(response.data.sessions || [])
    } catch (err: any) {
      setError('Failed to load sessions')
      showToast('Failed to load calendar data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getSessionsForDate = (date: Date): InterviewSession[] => {
    const dateStr = date.toISOString().split('T')[0]
    return sessions.filter((session) => {
      const sessionDate = new Date(session.startedAt).toISOString().split('T')[0]
      return sessionDate === dateStr
    })
  }

  const getEventsByDate = (): Map<string, InterviewSession[]> => {
    const eventsMap = new Map<string, InterviewSession[]>()
    sessions.forEach((session) => {
      const date = new Date(session.startedAt)
      const dateKey = date.toISOString().split('T')[0]
      if (!eventsMap.has(dateKey)) {
        eventsMap.set(dateKey, [])
      }
      eventsMap.get(dateKey)!.push(session)
    })
    return eventsMap
  }

  const eventsMap = getEventsByDate()

  const getDateEvents = (date: Date): number => {
    const dateKey = date.toISOString().split('T')[0]
    return eventsMap.get(dateKey)?.length || 0
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    const dateSessions = getSessionsForDate(date)
    if (dateSessions.length > 0) {
      // Show sessions for selected date
    }
  }

  const selectedDateSessions = selectedDate ? getSessionsForDate(selectedDate) : []

  if (loading) {
    return (
      <PageLayout title="Interview Calendar">
        <LoadingSpinner message="Loading calendar..." />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Interview Calendar"
      actions={
        <div className="view-mode-selector">
          <button
            className={`btn btn-small ${viewMode === 'month' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button
            className={`btn btn-small ${viewMode === 'week' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button
            className={`btn btn-small ${viewMode === 'day' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
        </div>
      }
    >
    <div className="calendar-view-container">

      {error && <ErrorDisplay error={error} />}

      <div className="calendar-view-content">
        <div className="calendar-section">
          <div className="calendar-wrapper">
            <Calendar
              selectedDate={selectedDate || undefined}
              onDateSelect={handleDateSelect}
              minDate={new Date(2020, 0, 1)}
            />
          </div>
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: 'var(--primary-color)' }}></span>
              <span>Has interviews</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: 'var(--success-color)' }}></span>
              <span>Completed</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: 'var(--warning-color)' }}></span>
              <span>In Progress</span>
            </div>
          </div>
        </div>

        <div className="sessions-panel">
          {selectedDate ? (
            <>
              <h2>
                Sessions for {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              {selectedDateSessions.length === 0 ? (
                <div className="empty-sessions">
                  <p>No interviews scheduled for this date</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/recruiter/sessions/new')}
                  >
                    Create Interview Session
                  </button>
                </div>
              ) : (
                <div className="sessions-list">
                  {selectedDateSessions.map((session) => (
                    <div
                      key={session.id}
                      className="session-card"
                      onClick={() => navigate(`/recruiter/sessions/${session.sessionId}/transcript`)}
                    >
                      <div className="session-card-header">
                        <h3>{session.candidateName}</h3>
                        <span className={`status-badge status-${session.status.toLowerCase()}`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="session-card-details">
                        <p><strong>Template:</strong> {session.templateName}</p>
                        <p><strong>Time:</strong> {new Date(session.startedAt).toLocaleTimeString()}</p>
                        <p><strong>Turns:</strong> {session.totalTurns}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-date-selected">
              <p>Select a date to view interviews</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </PageLayout>
  )
}

export default CalendarView

