import './ErrorDisplay.css'

export interface ErrorDisplayProps {
  error: Error | string | null
  title?: string
  onRetry?: () => void
  className?: string
  showDetails?: boolean
}

const ErrorDisplay = ({
  error,
  title = 'An error occurred',
  onRetry,
  className = '',
  showDetails = false
}: ErrorDisplayProps) => {
  if (!error) return null

  const errorMessage = typeof error === 'string' ? error : error.message
  const errorStack = typeof error === 'string' ? null : error.stack

  return (
    <div className={`error-display ${className}`} role="alert">
      <div className="error-display-icon">⚠️</div>
      <h3 className="error-display-title">{title}</h3>
      <p className="error-display-message">{errorMessage}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary error-display-retry">
          Try Again
        </button>
      )}
      {showDetails && errorStack && (
        <details className="error-display-details">
          <summary>Error Details</summary>
          <pre className="error-display-stack">{errorStack}</pre>
        </details>
      )}
    </div>
  )
}

export default ErrorDisplay



