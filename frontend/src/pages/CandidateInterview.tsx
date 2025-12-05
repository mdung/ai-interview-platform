import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { InterviewSession, InterviewTurn, WebSocketMessage } from '../types'
import { interviewApi } from '../services/api'
import { InterviewWebSocket } from '../services/websocket'
import './CandidateInterview.css'

const CandidateInterview = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [turns, setTurns] = useState<InterviewTurn[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const [answer, setAnswer] = useState<string>('')
  const [mode, setMode] = useState<'voice' | 'text'>('text')
  const [isRecording, setIsRecording] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [evaluation, setEvaluation] = useState<any>(null)
  const [showInstructions, setShowInstructions] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent')
  const [micTested, setMicTested] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [draftSaved, setDraftSaved] = useState(false)
  
  const wsRef = useRef<InterviewWebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micTestStreamRef = useRef<MediaStream | null>(null)
  const draftSaveIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!sessionId) return

    // Load session
    interviewApi.joinInterview(sessionId)
      .then((response) => {
        setSession(response.data)
        // Load saved draft if exists
        const savedDraft = localStorage.getItem(`interview_draft_${sessionId}`)
        if (savedDraft) {
          try {
            const draft = JSON.parse(savedDraft)
            setAnswer(draft.answer || '')
            setTurns(draft.turns || [])
          } catch (e) {
            console.error('Failed to load draft:', e)
          }
        }
      })
      .catch((error) => {
        console.error('Error loading session:', error)
      })

    // Initialize WebSocket
    const ws = new InterviewWebSocket(
      sessionId,
      handleWebSocketMessage,
      handleWebSocketError
    )
    wsRef.current = ws
    ws.connect()
    setIsConnected(true)

    // Start timer
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    // Monitor connection quality
    const qualityInterval = setInterval(() => {
      checkConnectionQuality()
    }, 5000)

    // Auto-save draft every 30 seconds
    draftSaveIntervalRef.current = setInterval(() => {
      saveDraft()
    }, 30000)

    return () => {
      ws.disconnect()
      stopRecording()
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (qualityInterval) clearInterval(qualityInterval)
      if (draftSaveIntervalRef.current) clearInterval(draftSaveIntervalRef.current)
      if (micTestStreamRef.current) {
        micTestStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [sessionId])

  const checkConnectionQuality = () => {
    if (!wsRef.current || !isConnected) {
      setConnectionQuality('poor')
      return
    }

    // Simulate connection quality check
    // In a real implementation, this would check WebSocket latency, packet loss, etc.
    const latency = Math.random() * 200 // Simulated latency in ms
    if (latency < 50) {
      setConnectionQuality('excellent')
    } else if (latency < 100) {
      setConnectionQuality('good')
    } else if (latency < 150) {
      setConnectionQuality('fair')
    } else {
      setConnectionQuality('poor')
    }
  }

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    if (message.type === 'question') {
      const questionText = message.text || ''
      setCurrentQuestion(questionText)
      setTurns((prev) => [
        ...prev,
        { question: questionText, timestamp: new Date().toISOString() },
      ])
      // Save draft after new question
      setTimeout(() => saveDraft(), 1000)
    } else if (message.type === 'evaluation') {
      setEvaluation(message.data)
      if (sessionId) {
        interviewApi.updateSessionStatus(sessionId, 'COMPLETED')
        // Clear draft on completion
        localStorage.removeItem(`interview_draft_${sessionId}`)
      }
    }
  }

  const handleWebSocketError = (error: Event) => {
    console.error('WebSocket error:', error)
    setIsConnected(false)
    setConnectionQuality('poor')
  }

  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micTestStreamRef.current = stream
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext
      
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser
      
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      const checkMicLevel = () => {
        if (!analyserRef.current) return
        
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setMicLevel(average)
        
        if (micTestStreamRef.current) {
          requestAnimationFrame(checkMicLevel)
        }
      }
      
      checkMicLevel()
      setMicTested(true)
      
      // Stop test after 5 seconds
      setTimeout(() => {
        if (micTestStreamRef.current) {
          micTestStreamRef.current.getTracks().forEach(track => track.stop())
          micTestStreamRef.current = null
        }
        setMicLevel(0)
      }, 5000)
    } catch (error) {
      console.error('Error testing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const saveDraft = () => {
    if (!sessionId) return
    
    const draft = {
      answer,
      turns,
      timestamp: new Date().toISOString(),
    }
    
    localStorage.setItem(`interview_draft_${sessionId}`, JSON.stringify(draft))
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 2000)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          // Send audio chunk to WebSocket
          event.data.arrayBuffer().then((buffer) => {
            wsRef.current?.sendAudio(buffer)
          })
        }
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(100) // Send chunks every 100ms
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
      audioChunksRef.current = []
      setIsRecording(false)
    }
  }

  const handleTextSubmit = () => {
    if (!answer.trim() || !wsRef.current) return

    wsRef.current.sendText({ type: 'answer', text: answer })
    
    setTurns((prev) => {
      const updated = [...prev]
      if (updated.length > 0) {
        updated[updated.length - 1].answer = answer
      }
      return updated
    })
    
    setAnswer('')
    saveDraft()
  }

  const handleEndInterview = () => {
    if (wsRef.current) {
      wsRef.current.sendText({ type: 'end_interview' })
    }
    if (sessionId) {
      localStorage.removeItem(`interview_draft_${sessionId}`)
    }
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    // Estimate progress based on number of turns (assuming ~10 questions per interview)
    const estimatedTotalQuestions = 10
    const currentQuestionNumber = turns.length
    return Math.min((currentQuestionNumber / estimatedTotalQuestions) * 100, 100)
  }

  if (!session) {
    return <div className="loading">Loading interview session...</div>
  }

  return (
    <div className="candidate-interview">
      {/* Interview Instructions Modal */}
      {showInstructions && (
        <div className="instructions-modal">
          <div className="instructions-content">
            <h2>Interview Instructions</h2>
            <div className="instructions-list">
              <p><strong>Welcome to your AI interview!</strong></p>
              <ul>
                <li>This interview will be conducted by an AI interviewer</li>
                <li>You can answer via <strong>voice</strong> or <strong>text</strong> mode</li>
                <li>Take your time to think before answering</li>
                <li>Be honest and provide specific examples from your experience</li>
                <li>Your answers are automatically saved as drafts</li>
                <li>You can pause and resume the interview at any time</li>
                <li>Make sure you have a stable internet connection</li>
                <li>Test your microphone before starting (recommended)</li>
              </ul>
              <div className="instructions-actions">
                <button className="btn btn-primary" onClick={() => setShowInstructions(false)}>
                  I Understand, Start Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="interview-header">
        <div className="header-left">
          <h1>AI Interview - {session.candidateName}</h1>
          <div className="header-info">
            <span className="question-counter">
              Question {turns.length} of ~10
            </span>
            <span className="timer">
              ⏱ {formatTime(elapsedTime)}
            </span>
          </div>
        </div>
        <div className="header-right">
          <div className="status-indicators">
            <div className="status-indicator">
              <span className={`connection-status ${connectionQuality}`}>
                {connectionQuality === 'excellent' && '● Excellent'}
                {connectionQuality === 'good' && '● Good'}
                {connectionQuality === 'fair' && '○ Fair'}
                {connectionQuality === 'poor' && '○ Poor'}
              </span>
            </div>
            <div className="status-indicator">
              <span className={isConnected ? 'connected' : 'disconnected'}>
                {isConnected ? '● Connected' : '○ Disconnected'}
              </span>
            </div>
            {draftSaved && (
              <span className="draft-saved-indicator">💾 Draft saved</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        <div className="progress-text">
          {Math.round(getProgressPercentage())}% Complete
        </div>
      </div>

      <div className="interview-container">
        <div className="conversation-panel">
          <div className="turns-list">
            {turns.map((turn, index) => (
              <div key={index} className="turn">
                <div className="question-bubble">
                  <strong>Interviewer:</strong> {turn.question}
                </div>
                {turn.answer && (
                  <div className="answer-bubble">
                    <strong>You:</strong> {turn.answer}
                  </div>
                )}
              </div>
            ))}
            {currentQuestion && !turns.some((t) => t.question === currentQuestion) && (
              <div className="turn">
                <div className="question-bubble">
                  <strong>Interviewer:</strong> {currentQuestion}
                </div>
              </div>
            )}
          </div>

          {evaluation && (
            <div className="evaluation-panel">
              <h3>Interview Evaluation</h3>
              <div className="evaluation-content">
                <p><strong>Summary:</strong> {evaluation.summary}</p>
                <p><strong>Strengths:</strong> {evaluation.strengths}</p>
                <p><strong>Weaknesses:</strong> {evaluation.weaknesses}</p>
                <p><strong>Recommendation:</strong> {evaluation.recommendation}</p>
              </div>
            </div>
          )}
        </div>

        <div className="input-panel">
          {/* Microphone Test Section */}
          {mode === 'voice' && !isRecording && (
            <div className="mic-test-section">
              <h4>Microphone Test</h4>
              {!micTested ? (
                <div className="mic-test-controls">
                  <button className="btn btn-secondary" onClick={testMicrophone}>
                    Test Microphone
                  </button>
                  <p className="mic-test-hint">Click to test your microphone before starting</p>
                </div>
              ) : (
                <div className="mic-level-display">
                  <div className="mic-level-bar">
                    <div 
                      className="mic-level-fill" 
                      style={{ width: `${Math.min(micLevel * 2, 100)}%` }}
                    />
                  </div>
                  <span className="mic-level-text">
                    {micLevel > 50 ? '✅ Microphone working' : '⚠️ Speak louder'}
                  </span>
                </div>
              )}
            </div>
          )}

          {mode === 'voice' ? (
            <div className="voice-controls">
              {!isRecording ? (
                <button className="btn btn-primary btn-large" onClick={startRecording}>
                  🎤 Start Recording
                </button>
              ) : (
                <div className="recording-active">
                  <button className="btn btn-danger btn-large" onClick={stopRecording}>
                    ⏹ Stop Recording
                  </button>
                  <div className="recording-indicator">
                    <span className="pulse-dot"></span>
                    Recording...
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-input">
              <textarea
                className="input"
                rows={4}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value)
                  // Auto-save on change (debounced)
                  clearTimeout((window as any).draftSaveTimeout)
                  ;(window as any).draftSaveTimeout = setTimeout(() => saveDraft(), 2000)
                }}
                placeholder="Type your answer here... (Ctrl+Enter to send)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleTextSubmit()
                  }
                }}
              />
              <div className="text-input-actions">
                <button className="btn btn-primary" onClick={handleTextSubmit}>
                  Send Answer
                </button>
                <button className="btn btn-secondary" onClick={saveDraft}>
                  💾 Save Draft
                </button>
              </div>
            </div>
          )}

          <div className="mode-toggle">
            <button
              className={`btn ${mode === 'text' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('text')}
            >
              📝 Text Mode
            </button>
            <button
              className={`btn ${mode === 'voice' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('voice')}
            >
              🎤 Voice Mode
            </button>
          </div>

          <button className="btn btn-secondary" onClick={handleEndInterview}>
            End Interview
          </button>
        </div>
      </div>
    </div>
  )
}

export default CandidateInterview
