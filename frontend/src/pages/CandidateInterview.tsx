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
  
  const wsRef = useRef<InterviewWebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (!sessionId) return

    // Load session
    interviewApi.joinInterview(sessionId)
      .then((response) => {
        setSession(response.data)
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

    return () => {
      ws.disconnect()
      stopRecording()
    }
  }, [sessionId])

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    if (message.type === 'question') {
      const questionText = message.text || ''
      setCurrentQuestion(questionText)
      setTurns((prev) => [
        ...prev,
        { question: questionText, timestamp: new Date().toISOString() },
      ])
    } else if (message.type === 'evaluation') {
      setEvaluation(message.data)
      if (sessionId) {
        interviewApi.updateSessionStatus(sessionId, 'COMPLETED')
      }
    }
  }

  const handleWebSocketError = (error: Event) => {
    console.error('WebSocket error:', error)
    setIsConnected(false)
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
  }

  const handleEndInterview = () => {
    if (wsRef.current) {
      wsRef.current.sendText({ type: 'end_interview' })
    }
  }

  if (!session) {
    return <div className="loading">Loading interview session...</div>
  }

  return (
    <div className="candidate-interview">
      <div className="interview-header">
        <h1>AI Interview - {session.candidateName}</h1>
        <div className="status-indicator">
          <span className={isConnected ? 'connected' : 'disconnected'}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </span>
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
          {mode === 'voice' ? (
            <div className="voice-controls">
              {!isRecording ? (
                <button className="btn btn-primary" onClick={startRecording}>
                  Start Recording
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={stopRecording}>
                  Stop Recording
                </button>
              )}
            </div>
          ) : (
            <div className="text-input">
              <textarea
                className="input"
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleTextSubmit()
                  }
                }}
              />
              <button className="btn btn-primary" onClick={handleTextSubmit}>
                Send Answer
              </button>
            </div>
          )}

          <div className="mode-toggle">
            <button
              className={`btn ${mode === 'text' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('text')}
            >
              Text Mode
            </button>
            <button
              className={`btn ${mode === 'voice' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('voice')}
            >
              Voice Mode
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

