import { useEffect, useState } from 'react'

export const useTabLock = (sessionId: string | undefined) => {
  const [isActiveTab, setIsActiveTab] = useState(true)
  const [otherTabsOpen, setOtherTabsOpen] = useState(false)

  useEffect(() => {
    if (!sessionId) return

    // Use BroadcastChannel to communicate between tabs
    const channel = new BroadcastChannel(`interview_${sessionId}`)

    // Generate unique tab ID
    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Announce this tab
    channel.postMessage({
      type: 'TAB_OPENED',
      tabId,
      timestamp: Date.now(),
    })

    // Listen for other tabs
    const handleMessage = (event: MessageEvent) => {
      if (event.data.tabId === tabId) {
        // Ignore own messages
        return
      }

      switch (event.data.type) {
        case 'TAB_OPENED':
          setOtherTabsOpen(true)
          // Send response to confirm this tab exists
          channel.postMessage({
            type: 'TAB_EXISTS',
            tabId,
            timestamp: Date.now(),
          })
          break

        case 'TAB_EXISTS':
          setOtherTabsOpen(true)
          break

        case 'TAB_CLOSED':
          // Check if any other tabs are still open
          // This is a simple implementation - could be improved
          break
      }
    }

    channel.addEventListener('message', handleMessage)

    // Monitor visibility
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden
      setIsActiveTab(isVisible)

      if (isVisible) {
        // This tab became active, announce it
        channel.postMessage({
          type: 'TAB_ACTIVE',
          tabId,
          timestamp: Date.now(),
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Announce tab closure
    const handleBeforeUnload = () => {
      channel.postMessage({
        type: 'TAB_CLOSED',
        tabId,
        timestamp: Date.now(),
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      channel.postMessage({
        type: 'TAB_CLOSED',
        tabId,
        timestamp: Date.now(),
      })
      channel.removeEventListener('message', handleMessage)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      channel.close()
    }
  }, [sessionId])

  return {
    isActiveTab,
    otherTabsOpen,
  }
}



