import { create } from 'zustand'
import { InterviewWebSocket } from '../services/websocket'
import { WebSocketMessage } from '../types'

interface WebSocketState {
  connections: Map<string, InterviewWebSocket>
  connectionStatus: Map<string, 'connecting' | 'connected' | 'disconnected' | 'error'>
  messages: Map<string, WebSocketMessage[]>
  connect: (sessionId: string, onMessage: (message: WebSocketMessage) => void, onError: (error: Event) => void) => void
  disconnect: (sessionId: string) => void
  sendMessage: (sessionId: string, message: { type: string; text?: string }) => void
  sendAudio: (sessionId: string, audioChunk: ArrayBuffer) => void
  getConnectionStatus: (sessionId: string) => 'connecting' | 'connected' | 'disconnected' | 'error'
  getMessages: (sessionId: string) => WebSocketMessage[]
  clearMessages: (sessionId: string) => void
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  connections: new Map(),
  connectionStatus: new Map(),
  messages: new Map(),

  connect: (sessionId, onMessage, onError) => {
    const state = get()
    
    // Disconnect existing connection if any
    if (state.connections.has(sessionId)) {
      state.connections.get(sessionId)?.disconnect()
    }

    // Create message handler that stores messages
    const messageHandler = (message: WebSocketMessage) => {
      const currentMessages = state.messages.get(sessionId) || []
      set((prev) => {
        const newMessages = new Map(prev.messages)
        newMessages.set(sessionId, [...currentMessages, message])
        return { messages: newMessages }
      })
      onMessage(message)
    }

    // Create error handler that updates status
    const errorHandler = (error: Event) => {
      set((prev) => {
        const newStatus = new Map(prev.connectionStatus)
        newStatus.set(sessionId, 'error')
        return { connectionStatus: newStatus }
      })
      onError(error)
    }

    // Create WebSocket connection
    const ws = new InterviewWebSocket(sessionId, messageHandler, errorHandler)
    
    // Override connect to update status
    const originalConnect = ws.connect.bind(ws)
    ws.connect = () => {
      set((prev) => {
        const newStatus = new Map(prev.connectionStatus)
        newStatus.set(sessionId, 'connecting')
        return { connectionStatus: newStatus }
      })
      originalConnect()
      
      // Update status after connection
      setTimeout(() => {
        set((prev) => {
          const newStatus = new Map(prev.connectionStatus)
          newStatus.set(sessionId, 'connected')
          return { connectionStatus: newStatus }
        })
      }, 100)
    }

    ws.connect()

    set((prev) => {
      const newConnections = new Map(prev.connections)
      newConnections.set(sessionId, ws)
      return { connections: newConnections }
    })
  },

  disconnect: (sessionId) => {
    const state = get()
    const ws = state.connections.get(sessionId)
    if (ws) {
      ws.disconnect()
      set((prev) => {
        const newConnections = new Map(prev.connections)
        newConnections.delete(sessionId)
        const newStatus = new Map(prev.connectionStatus)
        newStatus.set(sessionId, 'disconnected')
        return { connections: newConnections, connectionStatus: newStatus }
      })
    }
  },

  sendMessage: (sessionId, message) => {
    const state = get()
    const ws = state.connections.get(sessionId)
    if (ws) {
      ws.sendText(message)
    }
  },

  sendAudio: (sessionId, audioChunk) => {
    const state = get()
    const ws = state.connections.get(sessionId)
    if (ws) {
      ws.sendAudio(audioChunk)
    }
  },

  getConnectionStatus: (sessionId) => {
    const state = get()
    return state.connectionStatus.get(sessionId) || 'disconnected'
  },

  getMessages: (sessionId) => {
    const state = get()
    return state.messages.get(sessionId) || []
  },

  clearMessages: (sessionId) => {
    set((prev) => {
      const newMessages = new Map(prev.messages)
      newMessages.set(sessionId, [])
      return { messages: newMessages }
    })
  },
}))


