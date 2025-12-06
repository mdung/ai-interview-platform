import { useState, useRef, useEffect } from 'react'
import './PDFViewer.css'

export interface PDFViewerProps {
  url: string
  title?: string
  className?: string
  showControls?: boolean
  onLoadError?: (error: Error) => void
}

const PDFViewer = ({
  url,
  title,
  className = '',
  showControls = true,
  onLoadError
}: PDFViewerProps) => {
  const [scale, setScale] = useState(1)
  const [page, setPage] = useState(1)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setLoading(true)
    setPage(1)
    setNumPages(null)
  }, [url])

  const handleLoad = () => {
    setLoading(false)
  }

  const handleError = () => {
    setLoading(false)
    onLoadError?.(new Error('Failed to load PDF'))
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  const resetZoom = () => {
    setScale(1)
  }

  const downloadPDF = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = title || 'document.pdf'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={`pdf-viewer ${className}`}>
      {showControls && (
        <div className="pdf-controls">
          <div className="pdf-controls-left">
            {title && <h3 className="pdf-title">{title}</h3>}
          </div>
          <div className="pdf-controls-right">
            <button onClick={zoomOut} className="pdf-control-btn" disabled={scale <= 0.5}>
              −
            </button>
            <span className="pdf-zoom-level">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="pdf-control-btn" disabled={scale >= 3}>
              +
            </button>
            <button onClick={resetZoom} className="pdf-control-btn">
              Reset
            </button>
            <button onClick={downloadPDF} className="pdf-control-btn">
              Download
            </button>
          </div>
        </div>
      )}
      <div className="pdf-container" style={{ transform: `scale(${scale})` }}>
        {loading && (
          <div className="pdf-loading">
            <div className="pdf-spinner"></div>
            <p>Loading PDF...</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={`${url}#toolbar=1`}
          className="pdf-iframe"
          title={title || 'PDF Viewer'}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    </div>
  )
}

export default PDFViewer


