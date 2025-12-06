import { useEffect, useState, useRef } from 'react'

export interface SuspiciousActivity {
  type: string
  timestamp: Date
  metadata?: Record<string, any>
}

export const useAntiCheat = (sessionId: string | undefined) => {
  const [activityLog, setActivityLog] = useState<SuspiciousActivity[]>([])
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [interruptionCount, setInterruptionCount] = useState(0)
  const [pasteDetected, setPasteDetected] = useState(false)
  
  // Tab switching detection
  useEffect(() => {
    if (!sessionId) return
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = tabSwitchCount + 1
        setTabSwitchCount(newCount)
        
        const activity: SuspiciousActivity = {
          type: 'TAB_SWITCH',
          timestamp: new Date(),
          metadata: { count: newCount }
        }
        
        setActivityLog(prev => [...prev, activity])
        reportActivity(activity)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [sessionId, tabSwitchCount])
  
  // Window focus detection
  useEffect(() => {
    if (!sessionId) return
    
    const handleBlur = () => {
      const activity: SuspiciousActivity = {
        type: 'WINDOW_BLUR',
        timestamp: new Date()
      }
      
      setActivityLog(prev => [...prev, activity])
      reportActivity(activity)
    }
    
    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [sessionId])
  
  // Copy-paste detection
  const handlePaste = (e: ClipboardEvent) => {
    if (!sessionId) return
    
    setPasteDetected(true)
    
    const activity: SuspiciousActivity = {
      type: 'PASTE_DETECTED',
      timestamp: new Date(),
      metadata: {
        textLength: e.clipboardData?.getData('text').length || 0
      }
    }
    
    setActivityLog(prev => [...prev, activity])
    reportActivity(activity)
  }
  
  // Keyboard shortcut detection
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!sessionId) return
    
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v')) {
      const activity: SuspiciousActivity = {
        type: 'COPY_PASTE_DETECTED',
        timestamp: new Date(),
        metadata: {
          action: e.key === 'c' ? 'COPY' : 'PASTE'
        }
      }
      
      setActivityLog(prev => [...prev, activity])
      reportActivity(activity)
    }
  }
  
  // Report interruption
  const reportInterruption = () => {
    if (!sessionId) return
    
    const newCount = interruptionCount + 1
    setInterruptionCount(newCount)
    
    const activity: SuspiciousActivity = {
      type: 'INTERRUPTION',
      timestamp: new Date(),
      metadata: { count: newCount }
    }
    
    setActivityLog(prev => [...prev, activity])
    reportActivity(activity)
    
    return newCount
  }
  
  // Report activity to backend
  const reportActivity = async (activity: SuspiciousActivity) => {
    if (!sessionId) return
    
    try {
      const { interviewApi } = await import('../services/api')
      await interviewApi.reportSuspiciousActivity(sessionId, {
        activityType: activity.type,
        timestamp: activity.timestamp.toISOString(),
        metadata: activity.metadata || {}
      })
    } catch (error) {
      console.error('Failed to report activity:', error)
    }
  }
  
  // Get activity summary for answer submission
  const getActivitySummary = () => {
    return {
      tabSwitches: tabSwitchCount,
      interruptions: interruptionCount,
      pasteDetected: pasteDetected,
      activities: activityLog
    }
  }
  
  // Reset activity log
  const resetActivityLog = () => {
    setActivityLog([])
    setTabSwitchCount(0)
    setInterruptionCount(0)
    setPasteDetected(false)
  }
  
  return {
    activityLog,
    tabSwitchCount,
    interruptionCount,
    pasteDetected,
    handlePaste,
    handleKeyDown,
    reportInterruption,
    getActivitySummary,
    resetActivityLog
  }
}

