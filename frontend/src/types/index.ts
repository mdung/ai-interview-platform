export interface InterviewSession {
  id: number
  sessionId: string
  candidateId: number
  candidateName: string
  templateId: number
  templateName: string
  status: 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'ABANDONED'
  language: string
  startedAt: string
  completedAt?: string
  aiSummary?: string
  strengths?: string
  weaknesses?: string
  recommendation?: 'REJECT' | 'WEAK' | 'MAYBE' | 'STRONG' | 'HIRE'
  totalTurns: number
}

export interface InterviewTurn {
  question: string
  answer?: string
  timestamp: string
}

export interface WebSocketMessage {
  type: 'question' | 'answer' | 'error' | 'evaluation'
  text?: string
  data?: any
}

