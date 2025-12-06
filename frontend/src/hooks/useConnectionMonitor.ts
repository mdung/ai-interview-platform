import { useEffect, useState, useRef } from 'react'

export interface ConnectionStatus {
  isOnline: boolean
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  latency: number
  reconnectAttempts: number
}

export const useConnectionMonitor = (
  onReconnect?: () => void,
  onDisconnect?: () => void
) => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    quality: 'excellent',
    latency: 0,
    reconnectAttempts: 0,
  })

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const latencyCheckRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true, reconnectAttempts: 0 }))
      reconnectAttemptsRef.current = 0
      if (onReconnect) {
        onReconnect()
      }
    }

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }))
      if (onDisconnect) {
        onDisconnect()
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [onReconnect, onDisconnect])

  // Monitor connection quality
  useEffect(() => {
    const checkLatency = async () => {
      if (!navigator.onLine) {
        setStatus(prev => ({ ...prev, quality: 'poor' }))
        return
      }

      try {
        const startTime = performance.now()
        const response = await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000), // 5 second timeout
        })

        if (response.ok) {
          const latency = performance.now() - startTime
          
          let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent'
          if (latency < 100) {
            quality = 'excellent'
          } else if (latency < 300) {
            quality = 'good'
          } else if (latency < 1000) {
            quality = 'fair'
          } else {
            quality = 'poor'
          }

          setStatus(prev => ({
            ...prev,
            latency,
            quality,
            isOnline: true,
          }))
        } else {
          setStatus(prev => ({ ...prev, quality: 'poor' }))
        }
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          quality: 'poor',
          isOnline: false,
        }))
      }
    }

    // Check immediately
    checkLatency()

    // Check every 10 seconds
    latencyCheckRef.current = setInterval(checkLatency, 10000)

    return () => {
      if (latencyCheckRef.current) {
        clearInterval(latencyCheckRef.current)
      }
    }
  }, [])

  // Reconnection logic with exponential backoff
  const attemptReconnect = (callback: () => Promise<boolean>) => {
    const maxAttempts = 5
    const baseDelay = 5000 // 5 seconds

    const reconnect = async (attempt: number): Promise<void> => {
      if (attempt > maxAttempts) {
        setStatus(prev => ({
          ...prev,
          reconnectAttempts: attempt,
        }))
        return
      }

      reconnectAttemptsRef.current = attempt
      setStatus(prev => ({
        ...prev,
        reconnectAttempts: attempt,
      }))

      try {
        const success = await callback()
        if (success) {
          setStatus(prev => ({
            ...prev,
            isOnline: true,
            reconnectAttempts: 0,
          }))
          reconnectAttemptsRef.current = 0
          return
        }
      } catch (error) {
        console.error('Reconnection attempt failed:', error)
      }

      // Exponential backoff: 5s, 10s, 20s, 40s, 80s
      const delay = baseDelay * Math.pow(2, attempt - 1)
      
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnect(attempt + 1)
      }, delay)
    }

    reconnect(1)
  }

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    status,
    attemptReconnect,
  }
}


