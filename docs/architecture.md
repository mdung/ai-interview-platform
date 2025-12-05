# Architecture Overview

## System Architecture

The AI Interview Platform consists of three main components:

1. **React Frontend** - User interfaces for candidates and recruiters
2. **Spring Boot Backend** - Business logic, APIs, and data persistence
3. **Python AI Service** - Voice processing, LLM integration, and interview orchestration

## Component Diagram

```
┌─────────────────┐
│  React Frontend │
│  (TypeScript)   │
└────────┬────────┘
         │
         │ HTTP/REST
         │ WebSocket
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│Spring │ │ Python  │
│ Boot  │ │ AI Svc  │
│Backend│ │(FastAPI)│
└───┬───┘ └──┬──────┘
    │        │
    │        │
┌───▼───┐ ┌──▼──────┐
│PostgreSQL│ │ Redis │
└─────────┘ └────────┘
```

## Data Flow

### Voice Interview Flow

1. Candidate opens interview link → Frontend connects to Spring Boot
2. Spring Boot creates session → Stores in PostgreSQL and Redis
3. Frontend connects WebSocket to Python AI Service
4. Python service:
   - Receives audio chunks
   - Runs VAD to detect speech
   - Transcribes with Whisper ASR
   - Sends to LLM for next question
   - Generates TTS response
   - Handles barge-in (stops TTS when candidate speaks)
5. Results stored in PostgreSQL via Spring Boot API

### Text Interview Flow

1. Similar to voice, but uses text messages instead of audio
2. No VAD/ASR/TTS needed
3. Direct text exchange via WebSocket

## Database Schema

- **users** - System users (admin, recruiter, candidate)
- **jobs** - Job postings
- **interview_templates** - Interview configurations
- **candidates** - Candidate information
- **interview_sessions** - Interview instances
- **interview_turns** - Individual Q&A pairs

## Security

- JWT authentication for API access
- HTTPS for all communications
- Role-based access control (RBAC)
- Session tokens for candidate access

## Scalability

- Stateless backend services
- Redis for session state (horizontal scaling)
- PostgreSQL for persistent data
- Docker containerization
- Kubernetes-ready architecture

