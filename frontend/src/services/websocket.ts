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
    const wsUrl = `ws://localhost:8080/ws/interview/${this.sessionId}`
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

  attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000)
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      setTimeout(() => this.connect(), delay)
    } else {
      console.error('Max reconnection attempts reached')
      this.onError(new Event('max_reconnect_attempts'))
    }
  }
  
  // Check connection health
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
  
  // Get connection state
  getConnectionState(): 'connecting' | 'connected' | 'disconnected' | 'failed' {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected'
      default:
        return 'failed'
    }
  }
}

