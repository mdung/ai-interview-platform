import { useState } from 'react'
import { useParams } from 'react-router-dom'
import VideoRecorder from '../components/VideoRecorder'
import { useToast } from '../components'
import './VideoInterview.css'

const VideoInterview = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { showToast } = useToast()
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null)

  const handleRecordingComplete = async (blob: Blob) => {
    setRecordedVideo(blob)
    showToast('Video recording completed', 'success')
    
    // TODO: Upload video to backend
    // const formData = new FormData()
    // formData.append('video', blob, 'interview-video.webm')
    // await interviewApi.uploadVideo(sessionId!, formData)
  }

  const handleError = (error: Error) => {
    showToast(`Recording error: ${error.message}`, 'error')
  }

  return (
    <div className="video-interview-container">
      <div className="video-interview-header">
        <h1>Video Interview</h1>
        <p>Record your video responses to interview questions</p>
      </div>

      <div className="video-interview-content">
        <div className="question-section">
          <h2>Question 1</h2>
          <p>Tell us about yourself and why you're interested in this position.</p>
        </div>

        <div className="recorder-section">
          <VideoRecorder
            onRecordingComplete={handleRecordingComplete}
            onError={handleError}
            maxDuration={300}
            showPreview={true}
          />
        </div>

        {recordedVideo && (
          <div className="video-actions">
            <button
              onClick={() => {
                // TODO: Submit video
                showToast('Video submitted successfully', 'success')
              }}
              className="btn btn-primary"
            >
              Submit Answer
            </button>
            <button
              onClick={() => setRecordedVideo(null)}
              className="btn btn-secondary"
            >
              Record Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoInterview

