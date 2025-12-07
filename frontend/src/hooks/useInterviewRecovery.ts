import { useEffect, useRef, useState } from 'react'
import { interviewApi } from '../services/api'

interface InterviewState {
  sessionId: string
  currentAnswer: string
  turns: any[]
  timestamp: number
  mode: 'text' | 'voice'
}

export const useInterviewRecovery = (sessionId: string | undefined) => {
  const [isRecovering, setIsRecovering] = useState(false)
  const [recoveredState, setRecoveredState] = useState<InterviewState | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Save state before page unload
  useEffect(() => {
    if (!sessionId) return

    const saveState = (state: Partial<InterviewState>) => {
      try {
        const fullState: InterviewState = {
          sessionId,
          currentAnswer: state.currentAnswer || '',
          turns: state.turns || [],
          timestamp: Date.now(),
          mode: state.mode || 'text',
        }
        
        // Save to localStorage
        localStorage.setItem(`interview_state_${sessionId}`, JSON.stringify(fullState))
        
        // Also save to sessionStorage as backup
        sessionStorage.setItem(`interview_state_${sessionId}`, JSON.stringify(fullState))
      } catch (error) {
        console.error('Failed to save interview state:', error)
        // If localStorage fails, try to send to backend immediately
        if (state.currentAnswer) {
          // Queue for backend sync
          const queue = JSON.parse(localStorage.getItem('interview_sync_queue') || '[]')
          queue.push({ sessionId, answer: state.currentAnswer, timestamp: Date.now() })
          localStorage.setItem('interview_sync_queue', JSON.stringify(queue))
        }
      }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Save current state
      const currentState = {
        currentAnswer: (document.querySelector('textarea') as HTMLTextAreaElement)?.value || '',
        turns: [], // Will be populated from component state
        mode: 'text', // Will be populated from component state
      }
      saveState(currentState)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is being hidden, save state
        const currentState = {
          currentAnswer: (document.querySelector('textarea') as HTMLTextAreaElement)?.value || '',
          turns: [],
          mode: 'text',
        }
        saveState(currentState)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [sessionId])

  // Recover state on mount
  useEffect(() => {
    if (!sessionId) return

    const recoverState = async () => {
      try {
        // Try localStorage first
        let savedState = localStorage.getItem(`interview_state_${sessionId}`)
        
        // If not found, try sessionStorage
        if (!savedState) {
          savedState = sessionStorage.getItem(`interview_state_${sessionId}`)
        }

        if (savedState) {
          const state: InterviewState = JSON.parse(savedState)
          
          // Check if state is recent (within 24 hours)
          const age = Date.now() - state.timestamp
          const maxAge = 24 * 60 * 60 * 1000 // 24 hours
          
          if (age < maxAge) {
            setIsRecovering(true)
            setRecoveredState(state)
            
            // Verify session still exists on backend
            try {
              const session = await interviewApi.getSession(sessionId)
              if (session.data.status === 'IN_PROGRESS' || session.data.status === 'PAUSED') {
                // Session is still valid, return recovered state
                return state
              }
            } catch (error) {
              // Session might be completed or invalid
              console.warn('Session recovery failed:', error)
            }
          } else {
            // State is too old, clear it
            localStorage.removeItem(`interview_state_${sessionId}`)
            sessionStorage.removeItem(`interview_state_${sessionId}`)
          }
        }
      } catch (error) {
        console.error('Failed to recover interview state:', error)
      } finally {
        setIsRecovering(false)
      }
      return null
    }

    recoverState()
  }, [sessionId])

  // Sync queued answers to backend
  useEffect(() => {
    if (!sessionId) return

    const syncQueue = async () => {
      try {
        const queueStr = localStorage.getItem('interview_sync_queue')
        if (!queueStr) return

        const queue = JSON.parse(queueStr)
        const sessionQueue = queue.filter((item: any) => item.sessionId === sessionId)

        if (sessionQueue.length > 0) {
          // Sync each queued item
          for (const item of sessionQueue) {
            try {
              // Try to sync answer
              // This would need to be implemented based on your API
              await interviewApi.updateTurn(sessionId, item.turnId || 0, {
                answer: item.answer,
              })
              
              // Remove from queue on success
              const updatedQueue = queue.filter((q: any) => q !== item)
              localStorage.setItem('interview_sync_queue', JSON.stringify(updatedQueue))
            } catch (error) {
              console.error('Failed to sync queued answer:', error)
              // Keep in queue for retry
            }
          }
        }
      } catch (error) {
        console.error('Failed to sync queue:', error)
      }
    }

    // Sync immediately on mount
    syncQueue()

    // Also sync periodically
    const interval = setInterval(syncQueue, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [sessionId])

  const clearRecoveredState = () => {
    if (!sessionId) return
    localStorage.removeItem(`interview_state_${sessionId}`)
    sessionStorage.removeItem(`interview_state_${sessionId}`)
    setRecoveredState(null)
  }

  return {
    isRecovering,
    recoveredState,
    clearRecoveredState,
  }
}



