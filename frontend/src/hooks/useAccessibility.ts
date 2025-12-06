import { useEffect, useRef } from 'react'

/**
 * Hook for managing accessibility features
 */
export const useAccessibility = () => {
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  return { announceToScreenReader }
}

/**
 * Hook for managing focus trap
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTab)
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleTab)
    }
  }, [isActive])

  return containerRef
}

/**
 * Hook for managing keyboard shortcuts
 */
export const useKeyboardShortcut = (
  key: string,
  callback: (e: KeyboardEvent) => void,
  deps: any[] = []
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === key && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        callback(e)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [key, ...deps])
}

/**
 * Hook for managing focus restoration
 */
export const useFocusRestore = () => {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const saveFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement
  }

  const restoreFocus = () => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }

  return { saveFocus, restoreFocus }
}


