import './LoadingSpinner.css'

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
  fullScreen?: boolean
  message?: string
}

const LoadingSpinner = ({
  size = 'medium',
  className = '',
  fullScreen = false,
  message
}: LoadingSpinnerProps) => {
  const spinner = (
    <div className={`loading-spinner-container ${className}`}>
      <div className={`loading-spinner spinner-${size}`} role="status" aria-label="Loading">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return <div className="loading-fullscreen">{spinner}</div>
  }

  return spinner
}

export default LoadingSpinner



