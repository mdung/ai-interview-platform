import { useState, useRef, useEffect } from 'react'
import './VideoRecorder.css'

interface VideoRecorderProps {
  onRecordingComplete?: (blob: Blob) => void
  onError?: (error: Error) => void
  maxDuration?: number // in seconds
  showPreview?: boolean
}

const VideoRecorder = ({ 
  onRecordingComplete, 
  onError,
  maxDuration = 300, // 5 minutes default
  showPreview = true 
}: VideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string>('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    checkPermissions()
    return () => {
      stopRecording()
      cleanup()
    }
  }, [])

  const checkPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
    } catch (err) {
      setHasPermission(false)
      setError('Camera and microphone permissions are required')
      onError?.(new Error('Permission denied'))
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      const options = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000
      }

      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setVideoBlob(blob)
        onRecordingComplete?.(blob)
        cleanup()
      }

      mediaRecorder.onerror = (event: any) => {
        const error = new Error('Recording error occurred')
        setError('Recording error occurred')
        onError?.(error)
      }

      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setRecordingTime(0)
      chunksRef.current = []

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          if (newTime >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return newTime
        })
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to start recording')
      onError?.(err)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          if (newTime >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return newTime
        })
      }, 1000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    cleanup()
  }

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (hasPermission === false) {
    return (
      <div className="video-recorder-error">
        <p>Camera and microphone access is required for video recording.</p>
        <button onClick={checkPermissions} className="btn btn-primary">
          Request Permission
        </button>
      </div>
    )
  }

  return (
    <div className="video-recorder">
      <div className="video-recorder-preview">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={isRecording ? 'recording' : ''}
        />
        {isRecording && (
          <div className="recording-indicator">
            <span className="recording-dot"></span>
            <span>{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="video-recorder-controls">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="btn btn-primary"
            disabled={hasPermission === false}
          >
            Start Recording
          </button>
        ) : (
          <>
            {isPaused ? (
              <button onClick={resumeRecording} className="btn btn-primary">
                Resume
              </button>
            ) : (
              <button onClick={pauseRecording} className="btn btn-secondary">
                Pause
              </button>
            )}
            <button onClick={stopRecording} className="btn btn-danger">
              Stop Recording
            </button>
          </>
        )}
      </div>

      {showPreview && videoBlob && (
        <div className="video-preview">
          <h4>Recorded Video Preview</h4>
          <video
            src={URL.createObjectURL(videoBlob)}
            controls
            className="preview-video"
          />
        </div>
      )}
    </div>
  )
}

export default VideoRecorder



