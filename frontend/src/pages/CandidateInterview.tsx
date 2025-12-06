import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { InterviewSession, InterviewTurn, WebSocketMessage } from '../types'
import { interviewApi } from '../services/api'
import { InterviewWebSocket } from '../services/websocket'
import { AudioPlayer, useToast } from '../components'
import { useAntiCheat } from '../hooks/useAntiCheat'
import { useInterviewRecovery } from '../hooks/useInterviewRecovery'
import { useConnectionMonitor } from '../hooks/useConnectionMonitor'
import { useTabLock } from '../hooks/useTabLock'
import './CandidateInterview.css'

const CandidateInterview = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { showToast } = useToast()
  
  // Anti-cheat monitoring
  const {
    activityLog,
    tabSwitchCount,
    interruptionCount,
    pasteDetected,
    handlePaste,
    handleKeyDown,
    reportInterruption,
    getActivitySummary
  } = useAntiCheat(sessionId)
  
  // Interview recovery (browser crash, page refresh)
  const {
    isRecovering,
    recoveredState,
    clearRecoveredState
  } = useInterviewRecovery(sessionId)
  
  // Connection monitoring (network disconnection)
  const {
    status: connectionStatus,
    attemptReconnect
  } = useConnectionMonitor(
    () => {
      // On reconnect
      showToast('Connection restored', 'success')
      if (wsRef.current && !wsRef.current.isConnected()) {
        wsRef.current.connect()
      }
    },
    () => {
      // On disconnect
      showToast('Connection lost. Attempting to reconnect...', 'warning')
      saveDraft() // Auto-save on disconnect
    }
  )
  
  // Tab locking (multiple tabs prevention)
  const {
    isActiveTab,
    otherTabsOpen
  } = useTabLock(sessionId)
  
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
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showTechnicalReport, setShowTechnicalReport] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [browserCompatible, setBrowserCompatible] = useState(true)
  const [audioQuality, setAudioQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good')
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [feedback, setFeedback] = useState({
    rating: 0,
    comments: '',
    technicalIssues: false,
    suggestions: '',
  })
  
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

    // Check browser compatibility
    checkBrowserCompatibility()
    
    // Set up paste detection
    const textarea = document.querySelector('textarea')
    if (textarea) {
      textarea.addEventListener('paste', handlePaste as any)
      document.addEventListener('keydown', handleKeyDown)
    }
    
    return () => {
      if (textarea) {
        textarea.removeEventListener('paste', handlePaste as any)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [sessionId, handlePaste, handleKeyDown])
  
  // Monitor for interruptions (voice mode)
  useEffect(() => {
    if (aiSpeaking && isRecording && mode === 'voice') {
      const count = reportInterruption()
      if (count === 2) {
        showToast('Please wait for the AI to finish speaking', 'info')
      } else if (count === 3) {
        showToast('Excessive interruptions may affect your communication score', 'warning')
      } else if (count >= 4) {
        showToast('Multiple interruptions detected. Session may be flagged for review.', 'error')
      }
    }
  }, [aiSpeaking, isRecording, mode, reportInterruption, showToast])
  
  useEffect(() => {
    if (!sessionId) return

    // Load session
    interviewApi.joinInterview(sessionId)
      .then((response) => {
        setSession(response.data)
        
        // Try to recover state first (from useInterviewRecovery)
        if (recoveredState && recoveredState.sessionId === sessionId) {
          setAnswer(recoveredState.currentAnswer || '')
          setTurns(recoveredState.turns || [])
          setMode(recoveredState.mode || 'text')
          showToast('Interview state recovered', 'info')
          clearRecoveredState()
        } else {
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

  const checkBrowserCompatibility = () => {
    const issues: string[] = []
    
    // Check for required APIs
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      issues.push('Microphone access not supported')
    }
    
    if (!window.MediaRecorder) {
      issues.push('Audio recording not supported')
    }
    
    if (!window.WebSocket) {
      issues.push('WebSocket not supported')
    }
    
    // Check for modern browser features
    if (!window.localStorage) {
      issues.push('Local storage not supported')
    }
    
    if (issues.length > 0) {
      setBrowserCompatible(false)
      showToast(`Browser compatibility issues: ${issues.join(', ')}`, 'warning')
    } else {
      setBrowserCompatible(true)
    }
  }

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
      
      // If voice mode, AI is speaking
      if (mode === 'voice') {
        setAiSpeaking(true)
        // Simulate AI speech duration (in real implementation, this would be based on TTS)
        setTimeout(() => setAiSpeaking(false), 5000) // 5 seconds for example
      }
    } else if (message.type === 'evaluation') {
      setEvaluation(message.data)
      setShowSummary(true)
      if (sessionId) {
        interviewApi.updateSessionStatus(sessionId, 'COMPLETED')
        // Clear draft on completion
        localStorage.removeItem(`interview_draft_${sessionId}`)
      }
    } else if (message.type === 'ai_speaking') {
      setAiSpeaking(true)
    } else if (message.type === 'ai_finished') {
      setAiSpeaking(false)
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
        
        // Update audio quality based on mic level
        if (average > 100) {
          setAudioQuality('excellent')
        } else if (average > 50) {
          setAudioQuality('good')
        } else if (average > 20) {
          setAudioQuality('fair')
        } else {
          setAudioQuality('poor')
        }
        
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
      mode,
      timestamp: new Date().toISOString(),
    }
    
    try {
      // Try localStorage first
      localStorage.setItem(`interview_draft_${sessionId}`, JSON.stringify(draft))
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 2000)
    } catch (error: any) {
      // If quota exceeded, try sessionStorage
      if (error.name === 'QuotaExceededError') {
        try {
          sessionStorage.setItem(`interview_draft_${sessionId}`, JSON.stringify(draft))
          setDraftSaved(true)
          setTimeout(() => setDraftSaved(false), 2000)
          showToast('Draft saved (using temporary storage)', 'info')
        } catch (e) {
          console.error('Failed to save draft to sessionStorage:', e)
          // Last resort: try to send to backend immediately
          if (wsRef.current?.isConnected()) {
            wsRef.current.sendText({
              type: 'save_draft',
              text: answer,
            })
          }
        }
      } else {
        console.error('Failed to save draft:', error)
      }
    }
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
        // Create final audio blob from chunks
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          setRecordedAudio(audioBlob)
        }
      }

      mediaRecorder.start(100) // Send chunks every 100ms
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      showToast('Recording started', 'info')
    } catch (error) {
      console.error('Error starting recording:', error)
      showToast('Could not access microphone. Please check permissions.', 'error')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
      setIsRecording(false)
      showToast('Recording stopped', 'info')
      // Clear chunks after a delay to allow onstop to process
      setTimeout(() => {
        audioChunksRef.current = []
      }, 100)
    }
  }

  const handleTextSubmit = async () => {
    if (!answer.trim() || !sessionId) return

    // Validate minimum length
    if (answer.trim().length < 20) {
      const confirmed = window.confirm(
        'Your answer seems too short (minimum 20 characters).\n\n' +
        'Would you like to submit anyway, or add more detail?'
      )
      if (!confirmed) return
    }

    // Include activity summary with answer submission
    const activitySummary = getActivitySummary()
    
    // Retry logic for answer submission
    let retries = 3
    let submitted = false
    
    while (retries > 0 && !submitted) {
      try {
        // Try WebSocket first if connected
        if (wsRef.current && wsRef.current.isConnected()) {
          wsRef.current.sendText({ 
            type: 'answer', 
            text: answer,
            activityLog: activitySummary
          })
          submitted = true
        } else {
          // Fallback to API
          const currentTurn = turns[turns.length - 1]
          if (currentTurn?.id) {
            await interviewApi.updateTurn(sessionId, currentTurn.id, {
              answer: answer,
            })
            submitted = true
          } else {
            throw new Error('No active turn found')
          }
        }
      } catch (error) {
        console.error(`Answer submission failed (${retries} retries left):`, error)
        retries--
        
        if (retries > 0) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)))
        } else {
          // All retries failed, save to offline queue
          const queue = JSON.parse(localStorage.getItem('interview_sync_queue') || '[]')
          queue.push({
            sessionId,
            answer,
            activityLog: activitySummary,
            timestamp: Date.now(),
            turnId: turns[turns.length - 1]?.id
          })
          localStorage.setItem('interview_sync_queue', JSON.stringify(queue))
          showToast('Answer saved offline. Will sync when connection is restored.', 'info')
        }
      }
    }
    
    if (submitted) {
      setTurns((prev) => {
        const updated = [...prev]
        if (updated.length > 0) {
          updated[updated.length - 1].answer = answer
        }
        return updated
      })
      
      setAnswer('')
      saveDraft()
      showToast('Answer submitted successfully', 'success')
    }
  }

  const handleEndInterview = () => {
    if (wsRef.current) {
      wsRef.current.sendText({ type: 'end_interview' })
    }
    if (sessionId) {
      localStorage.removeItem(`interview_draft_${sessionId}`)
    }
    setShowSummary(true)
  }

  const handleSubmitFeedback = async () => {
    try {
      // In real implementation, send feedback to API
      showToast('Thank you for your feedback!', 'success')
      setShowFeedback(false)
    } catch (err) {
      showToast('Failed to submit feedback', 'error')
    }
  }

  const handleSubmitTechnicalReport = async () => {
    try {
      // In real implementation, send technical report to API
      showToast('Technical issue reported. We will investigate.', 'success')
      setShowTechnicalReport(false)
    } catch (err) {
      showToast('Failed to submit report', 'error')
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

  // Show recovery message if recovering
  if (isRecovering) {
    return (
      <div className="loading">
        <p>Recovering interview session...</p>
        <p className="text-muted">Please wait while we restore your progress</p>
      </div>
    )
  }

  // Show warning if other tabs are open
  if (otherTabsOpen && !isActiveTab) {
    return (
      <div className="interview-warning">
        <h2>⚠️ Interview is open in another tab</h2>
        <p>Please close other tabs and refresh this page to continue.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>
    )
  }

  if (!session) {
    return <div className="loading">Loading interview session...</div>
  }

  return (
    <div className="candidate-interview">
      {/* Connection Status Banner */}
      {!connectionStatus.isOnline && (
        <div className="connection-banner warning">
          <span>⚠️ Connection lost. Attempting to reconnect...</span>
          <span>Attempt {connectionStatus.reconnectAttempts}/5</span>
        </div>
      )}
      
      {connectionStatus.quality === 'poor' && connectionStatus.isOnline && (
        <div className="connection-banner info">
          <span>⚠️ Slow connection detected. Some features may be limited.</span>
        </div>
      )}
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
            {mode === 'voice' && (
              <div className="status-indicator">
                <span className={`audio-quality ${audioQuality}`}>
                  🎤 {audioQuality.charAt(0).toUpperCase() + audioQuality.slice(1)}
                </span>
              </div>
            )}
            <div className="status-indicator">
              <span className={isConnected ? 'connected' : 'disconnected'}>
                {isConnected ? '● Connected' : '○ Disconnected'}
              </span>
            </div>
            {!browserCompatible && (
              <div className="status-indicator warning">
                ⚠️ Browser Compatibility Issues
              </div>
            )}
            {draftSaved && (
              <span className="draft-saved-indicator">💾 Draft saved</span>
            )}
          </div>
          <div className="header-actions">
            <button
              className="btn btn-small btn-secondary"
              onClick={() => setShowTips(!showTips)}
            >
              💡 Tips
            </button>
            {turns.length > 0 && (
              <button
                className="btn btn-small btn-secondary"
                onClick={() => setShowReview(!showReview)}
              >
                📋 Review Answers
              </button>
            )}
            <button
              className="btn btn-small btn-secondary"
              onClick={() => setShowTechnicalReport(true)}
            >
              🛠️ Report Issue
            </button>
          </div>
        </div>
      </div>

      {/* Interview Tips Panel */}
      {showTips && (
        <div className="tips-panel">
          <div className="tips-header">
            <h3>💡 Interview Tips</h3>
            <button className="btn btn-small btn-secondary" onClick={() => setShowTips(false)}>
              ×
            </button>
          </div>
          <div className="tips-content">
            <ul>
              <li><strong>Be Clear and Concise:</strong> Provide specific examples from your experience</li>
              <li><strong>Take Your Time:</strong> It's okay to pause and think before answering</li>
              <li><strong>Stay Calm:</strong> Take deep breaths if you feel nervous</li>
              <li><strong>Ask for Clarification:</strong> If a question is unclear, ask for clarification</li>
              <li><strong>Be Honest:</strong> Authenticity is valued over perfection</li>
              <li><strong>Use the STAR Method:</strong> Situation, Task, Action, Result</li>
              <li><strong>Test Your Equipment:</strong> Ensure microphone and internet connection work well</li>
              <li><strong>Save Your Work:</strong> Your answers are auto-saved, but you can manually save drafts</li>
            </ul>
          </div>
        </div>
      )}

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
        {/* Review Answers Panel */}
        {showReview && (
          <div className="review-panel">
            <div className="review-header">
              <h3>📋 Review Your Answers</h3>
              <button className="btn btn-small btn-secondary" onClick={() => setShowReview(false)}>
                ×
              </button>
            </div>
            <div className="review-content">
              {turns.filter(t => t.answer).length === 0 ? (
                <p className="empty-state">No answers to review yet.</p>
              ) : (
                <div className="review-list">
                  {turns
                    .filter((turn) => turn.answer)
                    .map((turn, index) => (
                      <div key={index} className="review-item">
                        <div className="review-question">
                          <strong>Q{index + 1}:</strong> {turn.question}
                        </div>
                        <div className="review-answer">
                          <strong>Your Answer:</strong> {turn.answer}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

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
                aria-label="Answer input"
                aria-describedby="answer-hint"
              />
              <p id="answer-hint" className="sr-only">
                Type your answer and press Ctrl+Enter to submit, or click the Send Answer button
              </p>
              <div className="text-input-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleTextSubmit}
                  aria-label="Send answer"
                >
                  Send Answer
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={saveDraft}
                  aria-label="Save draft manually"
                >
                  💾 Save Draft
                </button>
              </div>
            </div>
          )}

          {recordedAudio && (
            <div className="recorded-audio-section">
              <h4>Recorded Audio</h4>
              <AudioPlayer audioBlob={recordedAudio} />
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

      {/* Interview Summary Modal */}
      {showSummary && (
        <div className="summary-modal">
          <div className="summary-content">
            <div className="summary-header">
              <h2>Interview Complete! 🎉</h2>
              <button className="btn btn-small btn-secondary" onClick={() => setShowSummary(false)}>
                ×
              </button>
            </div>
            <div className="summary-body">
              {evaluation ? (
                <div className="evaluation-summary">
                  <h3>Interview Evaluation</h3>
                  <div className="summary-section">
                    <p><strong>Summary:</strong> {evaluation.summary}</p>
                  </div>
                  {evaluation.strengths && (
                    <div className="summary-section">
                      <p><strong>Strengths:</strong> {evaluation.strengths}</p>
                    </div>
                  )}
                  {evaluation.weaknesses && (
                    <div className="summary-section">
                      <p><strong>Areas for Improvement:</strong> {evaluation.weaknesses}</p>
                    </div>
                  )}
                  {evaluation.recommendation && (
                    <div className="summary-section">
                      <p><strong>Recommendation:</strong> {evaluation.recommendation}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="summary-section">
                  <p>Your interview has been completed. The evaluation will be available soon.</p>
                </div>
              )}
              <div className="summary-stats">
                <div className="stat-item">
                  <strong>Total Questions:</strong> {turns.length}
                </div>
                <div className="stat-item">
                  <strong>Duration:</strong> {formatTime(elapsedTime)}
                </div>
              </div>
              <div className="summary-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowSummary(false)
                    setShowFeedback(true)
                  }}
                >
                  Provide Feedback
                </button>
                <button className="btn btn-secondary" onClick={() => setShowSummary(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Form Modal */}
      {showFeedback && (
        <div className="feedback-modal">
          <div className="feedback-content">
            <div className="feedback-header">
              <h2>Interview Feedback</h2>
              <button className="btn btn-small btn-secondary" onClick={() => setShowFeedback(false)}>
                ×
              </button>
            </div>
            <div className="feedback-body">
              <div className="form-group">
                <label>Overall Rating</label>
                <div className="rating-buttons">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={`rating-btn ${feedback.rating === rating ? 'active' : ''}`}
                      onClick={() => setFeedback({ ...feedback, rating })}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Comments</label>
                <textarea
                  className="input"
                  rows={4}
                  value={feedback.comments}
                  onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                  placeholder="Share your thoughts about the interview experience..."
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={feedback.technicalIssues}
                    onChange={(e) =>
                      setFeedback({ ...feedback, technicalIssues: e.target.checked })
                    }
                  />
                  I experienced technical issues during the interview
                </label>
              </div>
              <div className="form-group">
                <label>Suggestions for Improvement</label>
                <textarea
                  className="input"
                  rows={3}
                  value={feedback.suggestions}
                  onChange={(e) => setFeedback({ ...feedback, suggestions: e.target.value })}
                  placeholder="Any suggestions to improve the interview experience..."
                />
              </div>
              <div className="feedback-actions">
                <button className="btn btn-primary" onClick={handleSubmitFeedback}>
                  Submit Feedback
                </button>
                <button className="btn btn-secondary" onClick={() => setShowFeedback(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technical Issues Report Modal */}
      {showTechnicalReport && (
        <div className="technical-report-modal">
          <div className="technical-report-content">
            <div className="technical-report-header">
              <h2>Report Technical Issue</h2>
              <button
                className="btn btn-small btn-secondary"
                onClick={() => setShowTechnicalReport(false)}
              >
                ×
              </button>
            </div>
            <div className="technical-report-body">
              <div className="form-group">
                <label>Issue Type</label>
                <select className="input">
                  <option>Audio/Video Problems</option>
                  <option>Connection Issues</option>
                  <option>Browser Compatibility</option>
                  <option>Recording Problems</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="input"
                  rows={5}
                  placeholder="Please describe the technical issue you encountered..."
                />
              </div>
              <div className="form-group">
                <label>Browser Information</label>
                <input
                  type="text"
                  className="input"
                  readOnly
                  value={`${navigator.userAgent}`}
                />
              </div>
              <div className="technical-report-actions">
                <button className="btn btn-primary" onClick={handleSubmitTechnicalReport}>
                  Submit Report
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowTechnicalReport(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CandidateInterview
