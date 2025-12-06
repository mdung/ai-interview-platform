import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { interviewApi } from '../services/api'
import { AudioPlayer } from '../components'
import './InterviewReplay.css'

interface Turn {
  id: number
  turnNumber: number
  question: string
  answer: string | null
  questionTimestamp: string
  answerTimestamp: string | null
  answerDurationMs: number | null
  audioUrl?: string | null
}

interface Transcript {
  sessionId: string
  candidateName: string
  templateName: string
  language: string
  status: string
  turns: Turn[]
}

const InterviewReplay = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [autoPlay, setAutoPlay] = useState(true)
  const audioRefs = useRef<Map<number, HTMLAudioElement>>(new Map())

  useEffect(() => {
    if (sessionId) {
      loadTranscript()
    }
  }, [sessionId])

  useEffect(() => {
    if (isPlaying && autoPlay && transcript && currentTurnIndex < transcript.turns.length) {
      const turn = transcript.turns[currentTurnIndex]
      const audio = audioRefs.current.get(turn.id)
      
      if (audio && turn.audioUrl) {
        audio.playbackRate = playbackSpeed
        audio.play().catch(() => {
          // Auto-advance if audio fails
          setTimeout(() => {
            if (currentTurnIndex < transcript.turns.length - 1) {
              setCurrentTurnIndex(currentTurnIndex + 1)
            } else {
              setIsPlaying(false)
            }
          }, 1000)
        })
      } else {
        // Auto-advance if no audio
        const delay = turn.answerDurationMs ? turn.answerDurationMs / playbackSpeed : 3000
        setTimeout(() => {
          if (currentTurnIndex < transcript.turns.length - 1) {
            setCurrentTurnIndex(currentTurnIndex + 1)
          } else {
            setIsPlaying(false)
          }
        }, delay)
      }
    }
  }, [isPlaying, currentTurnIndex, autoPlay, playbackSpeed, transcript])

  const loadTranscript = async () => {
    if (!sessionId) return

    setLoading(true)
    setError('')
    try {
      const response = await interviewApi.getTranscript(sessionId)
      setTranscript(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load transcript')
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = () => {
    setIsPlaying(true)
    if (transcript && currentTurnIndex < transcript.turns.length) {
      const turn = transcript.turns[currentTurnIndex]
      const audio = audioRefs.current.get(turn.id)
      if (audio && turn.audioUrl) {
        audio.playbackRate = playbackSpeed
        audio.play()
      }
    }
  }

  const handlePause = () => {
    setIsPlaying(false)
    audioRefs.current.forEach(audio => {
      audio.pause()
    })
  }

  const handleNext = () => {
    if (transcript && currentTurnIndex < transcript.turns.length - 1) {
      audioRefs.current.forEach(audio => audio.pause())
      setCurrentTurnIndex(currentTurnIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentTurnIndex > 0) {
      audioRefs.current.forEach(audio => audio.pause())
      setCurrentTurnIndex(currentTurnIndex - 1)
    }
  }

  const handleTurnClick = (index: number) => {
    audioRefs.current.forEach(audio => audio.pause())
    setCurrentTurnIndex(index)
    setIsPlaying(false)
  }

  const handleAudioEnded = (turnId: number) => {
    if (autoPlay && transcript) {
      const currentIndex = transcript.turns.findIndex(t => t.id === turnId)
      if (currentIndex >= 0 && currentIndex < transcript.turns.length - 1) {
        setCurrentTurnIndex(currentIndex + 1)
      } else {
        setIsPlaying(false)
      }
    }
  }

  const registerAudioRef = (turnId: number, audio: HTMLAudioElement | null) => {
    if (audio) {
      audioRefs.current.set(turnId, audio)
    } else {
      audioRefs.current.delete(turnId)
    }
  }

  if (loading) {
    return <div className="loading">Loading interview replay...</div>
  }

  if (error || !transcript) {
    return (
      <div className="replay-container">
        <div className="error-message">{error || 'Transcript not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    )
  }

  const currentTurn = transcript.turns[currentTurnIndex]

  return (
    <div className="replay-container">
      <div className="replay-header">
        <div>
          <h1>Interview Replay</h1>
          <p className="session-info">
            Candidate: {transcript.candidateName} | Template: {transcript.templateName}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      <div className="replay-controls">
        <button
          className="btn btn-primary"
          onClick={isPlaying ? handlePause : handlePlay}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentTurnIndex === 0}
        >
          ⏮ Previous
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleNext}
          disabled={currentTurnIndex >= transcript.turns.length - 1}
        >
          Next ⏭
        </button>
        <div className="speed-control">
          <label>Speed:</label>
          <select
            className="input"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => setAutoPlay(e.target.checked)}
          />
          Auto-play
        </label>
        <div className="turn-counter">
          Turn {currentTurnIndex + 1} of {transcript.turns.length}
        </div>
      </div>

      <div className="replay-content">
        <div className="current-turn-section">
          <h2>Current Turn</h2>
          {currentTurn && (
            <div className="turn-display">
              <div className="question-bubble">
                <strong>Interviewer:</strong> {currentTurn.question}
                {currentTurn.questionTimestamp && (
                  <span className="timestamp">
                    {new Date(currentTurn.questionTimestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
              {currentTurn.answer && (
                <div className="answer-bubble">
                  <strong>Candidate:</strong> {currentTurn.answer}
                  {currentTurn.answerTimestamp && (
                    <span className="timestamp">
                      {new Date(currentTurn.answerTimestamp).toLocaleTimeString()}
                    </span>
                  )}
                  {currentTurn.answerDurationMs && (
                    <span className="duration">
                      (Duration: {Math.round(currentTurn.answerDurationMs / 1000)}s)
                    </span>
                  )}
                </div>
              )}
              {currentTurn.audioUrl && (
                <div className="audio-section">
                  <audio
                    ref={(audio) => registerAudioRef(currentTurn.id, audio)}
                    src={currentTurn.audioUrl}
                    onEnded={() => handleAudioEnded(currentTurn.id)}
                    controls
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="turns-timeline">
          <h2>All Turns</h2>
          <div className="turns-list">
            {transcript.turns.map((turn, index) => (
              <div
                key={turn.id}
                className={`turn-item ${index === currentTurnIndex ? 'active' : ''}`}
                onClick={() => handleTurnClick(index)}
              >
                <div className="turn-number">Turn {turn.turnNumber}</div>
                <div className="turn-preview">
                  <div className="question-preview">
                    <strong>Q:</strong> {turn.question.substring(0, 100)}
                    {turn.question.length > 100 && '...'}
                  </div>
                  {turn.answer && (
                    <div className="answer-preview">
                      <strong>A:</strong> {turn.answer.substring(0, 100)}
                      {turn.answer.length > 100 && '...'}
                    </div>
                  )}
                </div>
                {turn.audioUrl && (
                  <div className="audio-indicator">🎤</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewReplay


