import { WebSocketMessage } from '../types'

export class InterviewWebSocket {
  private ws: WebSocket | null = null
  private sessionId: string
  private onMessage: (message: WebSocketMessage) => void
  private onError: (error: Event) => void
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(
    sessionId: string,
    onMessage: (message: WebSocketMessage) => void,
    onError: (error: Event) => void
  ) {
    this.sessionId = sessionId
    this.onMessage = onMessage
    this.onError = onError
  }

  connect(): void {
    const wsUrl = `ws://localhost:8000/ws/interview/${this.sessionId}`
    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      try {
        if (event.data instanceof Blob) {
          // Handle audio data
          this.onMessage({
            type: 'answer',
            data: event.data,
          })
        } else {
          // Handle text/JSON data
          const message = JSON.parse(event.data)
          this.onMessage(message)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.onError(error)
    }

    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.attemptReconnect()
    }
  }

  sendAudio(audioChunk: ArrayBuffer): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(audioChunk)
    }
  }

  sendText(message: { type: string; text?: string }): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      console.log(`Attempting to reconnect in ${delay}ms...`)
      setTimeout(() => this.connect(), delay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }
}

