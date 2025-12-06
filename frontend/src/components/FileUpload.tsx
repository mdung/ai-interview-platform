import { useState, useRef, DragEvent } from 'react'
import './FileUpload.css'

export interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  onFileSelect: (files: File[]) => void
  onError?: (error: string) => void
  label?: string
  className?: string
  disabled?: boolean
}

const FileUpload = ({
  accept,
  multiple = false,
  maxSize,
  onFileSelect,
  onError,
  label = 'Choose file or drag and drop',
  className = '',
  disabled = false
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`
    }
    if (accept) {
      const acceptedTypes = accept.split(',').map((type) => type.trim())
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const fileType = file.type

      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase()
        }
        return fileType.match(type.replace('*', '.*'))
      })

      if (!isAccepted) {
        return `File type not accepted. Accepted types: ${accept}`
      }
    }
    return null
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const errors: string[] = []

    fileArray.forEach((file) => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      }
    })

    if (errors.length > 0) {
      onError?.(errors.join('\n'))
      return
    }

    const validFiles = multiple ? fileArray : [fileArray[0]]
    setSelectedFiles(validFiles)
    onFileSelect(validFiles)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    handleFiles(files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleRemove = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFileSelect(newFiles)
  }

  return (
    <div className={`file-upload ${className}`}>
      <div
        className={`file-upload-area ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="file-input"
          disabled={disabled}
        />
        <div className="file-upload-content">
          <div className="file-upload-icon">📁</div>
          <p className="file-upload-label">{label}</p>
          {accept && (
            <p className="file-upload-hint">Accepted: {accept}</p>
          )}
          {maxSize && (
            <p className="file-upload-hint">Max size: {maxSize}MB</p>
          )}
        </div>
      </div>
      {selectedFiles.length > 0 && (
        <div className="file-list">
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(index)
                  }}
                  className="file-remove"
                  aria-label="Remove file"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload

