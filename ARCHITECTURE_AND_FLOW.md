# Application Architecture and Data Flow

## Overview

The AI Interview Platform is a **3-tier architecture** combining:
1. **Frontend**: ReactJS (TypeScript) - User Interface
2. **Backend**: Java Spring Boot - Business Logic & API
3. **AI Service**: Python - AI/ML Processing (Question Generation, Answer Evaluation)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         ReactJS Frontend (Port 3000/5173)            │  │
│  │  - Pages, Components, State Management               │  │
│  │  - API Calls, WebSocket Client                       │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP/REST API
                        │ WebSocket (STOMP)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              SPRING BOOT BACKEND (Port 8080)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers (REST API)                             │  │
│  │  - AuthController, InterviewController, etc.        │  │
│  └───────────────────────┬──────────────────────────────┘  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  Services (Business Logic)                           │  │
│  │  - InterviewSessionService                           │  │
│  │  - CandidateService, JobService                     │  │
│  │  - NotificationService, EmailService                 │  │
│  └───────────────────────┬──────────────────────────────┘  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  Repositories (Data Access)                          │  │
│  │  - JPA/Hibernate → PostgreSQL                       │  │
│  └───────────────────────┬──────────────────────────────┘  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  Redis (Session State, Caching)                      │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP REST API
                        │ (Question Generation, Evaluation)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│            PYTHON AI SERVICE (Port 8000)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AI/ML Services                                       │  │
│  │  - Question Generation (LLM)                         │  │
│  │  - Answer Evaluation (NLP)                           │  │
│  │  - Speech-to-Text (STT)                              │  │
│  │  - Text-to-Speech (TTS)                              │  │
│  │  - Sentiment Analysis                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend (ReactJS)
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand (global state), React Query (API state)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **WebSocket**: Native WebSocket API
- **UI Libraries**: Custom components, Recharts for charts

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: PostgreSQL (via JPA/Hibernate)
- **Cache/Session**: Redis
- **Security**: Spring Security + JWT
- **WebSocket**: Spring WebSocket (STOMP)
- **Messaging**: Kafka (optional, for async processing)
- **Email**: Spring Mail (Thymeleaf templates)

### AI Service (Python)
- **Framework**: FastAPI or Flask (assumed)
- **AI/ML**: 
  - LLM APIs (OpenAI, Anthropic, etc.)
  - NLP libraries (spaCy, NLTK)
  - Speech processing (Whisper, etc.)
- **Port**: 8000 (as configured)

## Data Flow - Complete Interview Process

### 1. User Authentication Flow

```
┌──────────┐         ┌──────────────┐         ┌──────────┐
│  React   │────────▶│ Spring Boot  │────────▶│PostgreSQL│
│ Frontend │  POST   │ AuthController│         │  (User  │
│          │ /login  │              │         │   Data) │
└──────────┘         └──────────────┘         └──────────┘
     │                      │
     │                      │ JWT Token
     │◀─────────────────────┘
     │
     │ Store token in localStorage
     │ Store user in Zustand store
```

**Steps:**
1. User enters credentials in React login form
2. React calls `POST /api/auth/login` via Axios
3. Spring Boot validates credentials against PostgreSQL
4. Spring Boot generates JWT token
5. React receives token and stores it
6. React uses token for subsequent API calls

### 2. Interview Session Creation Flow

```
┌──────────┐         ┌──────────────┐         ┌──────────┐
│  React   │────────▶│ Spring Boot  │────────▶│PostgreSQL│
│ Frontend │  POST   │InterviewCtrl │         │ (Session)│
│          │/sessions│              │         │          │
└──────────┘         └──────┬───────┘         └──────────┘
                             │
                             │ Store session state
                             ▼
                        ┌──────────┐
                        │  Redis   │
                        │ (Session)│
                        └──────────┘
```

**Steps:**
1. Recruiter selects candidate and template in React
2. React calls `POST /api/interviews/sessions`
3. Spring Boot creates session in PostgreSQL
4. Spring Boot stores session state in Redis
5. React receives session ID and redirects

### 3. Interview Question Flow (React → Spring Boot → Python)

```
┌──────────┐         ┌──────────────┐         ┌──────────┐
│  React   │────────▶│ Spring Boot  │────────▶│  Python  │
│Candidate │  GET    │InterviewCtrl │  HTTP   │ AI Service│
│Interview │/session │              │────────▶│          │
│  Page    │         │              │         │Generate  │
└──────────┘         └──────┬───────┘         │ Question │
                             │                └────┬─────┘
                             │                     │
                             │◀────────────────────┘
                             │ Question JSON
                             ▼
                        ┌──────────┐
                        │PostgreSQL│
                        │  (Turn)  │
                        └────┬─────┘
                             │
                             │ WebSocket
                             ▼
                        ┌──────────┐
                        │  React   │
                        │ (Display)│
                        └──────────┘
```

**Detailed Steps:**

1. **Candidate Opens Interview:**
   - React: User navigates to `/interview/:sessionId`
   - React: Calls `GET /api/candidates/join/:sessionId`
   - Spring Boot: Validates session, returns session details

2. **Get Next Question:**
   - React: WebSocket connects to `/ws/interview/:sessionId`
   - React: Sends message `{type: "get_question"}`
   - Spring Boot: Receives WebSocket message
   - Spring Boot: Checks Redis for current question
   - **If no question exists:**
     - Spring Boot: Calls Python AI Service
       ```
       POST http://localhost:8000/api/generate-question
       {
         "templateId": 1,
         "sessionId": "abc123",
         "previousQuestions": [...],
         "candidateProfile": {...}
       }
       ```
     - Python: Uses LLM to generate question
     - Python: Returns question JSON
     - Spring Boot: Saves question to PostgreSQL (InterviewTurn)
     - Spring Boot: Stores in Redis
     - Spring Boot: Sends via WebSocket to React
   - React: Displays question to candidate

### 4. Answer Submission Flow (React → Spring Boot → Python)

```
┌──────────┐         ┌──────────────┐         ┌──────────┐
│  React   │────────▶│ Spring Boot  │────────▶│  Python  │
│Candidate │ WebSocket│InterviewCtrl │  HTTP   │ AI Service│
│Interview │────────▶│              │────────▶│          │
│  Page    │ Answer  │              │         │Evaluate  │
└──────────┘         └──────┬───────┘         │ Answer   │
                             │                └────┬─────┘
                             │                     │
                             │◀────────────────────┘
                             │ Evaluation JSON
                             │ (score, feedback)
                             ▼
                        ┌──────────┐
                        │PostgreSQL│
                        │  (Turn)  │
                        └────┬─────┘
                             │
                             │ WebSocket
                             ▼
                        ┌──────────┐
                        │  React   │
                        │ (Display)│
                        └──────────┘
```

**Detailed Steps:**

1. **Candidate Submits Answer:**
   - React: User types/records answer
   - React: Sends via WebSocket:
     ```json
     {
       "type": "submit_answer",
       "sessionId": "abc123",
       "turnId": 1,
       "answer": "My answer text...",
       "audioBlob": "base64..." // if voice mode
     }
     ```

2. **Spring Boot Processes:**
   - Receives WebSocket message
   - Saves answer to PostgreSQL (InterviewTurn)
   - **Calls Python AI Service for Evaluation:**
     ```
     POST http://localhost:8000/api/evaluate-answer
     {
       "question": "Tell me about yourself",
       "answer": "My answer text...",
       "sessionId": "abc123",
       "turnId": 1
     }
     ```

3. **Python AI Service:**
   - Processes answer (NLP analysis)
   - Generates evaluation:
     ```json
     {
       "technicalScore": 8.5,
       "communicationScore": 7.0,
       "clarityScore": 9.0,
       "feedback": "Good answer, but could be more specific...",
       "strengths": ["Clear communication", "Relevant experience"],
       "weaknesses": ["Lacked technical depth"]
     }
     ```

4. **Spring Boot:**
   - Saves evaluation to PostgreSQL
   - Updates Redis session state
   - Sends evaluation via WebSocket to React

5. **React:**
   - Displays evaluation
   - Shows next question or interview summary

### 5. Real-Time Updates Flow (WebSocket)

```
┌──────────┐                    ┌──────────────┐
│  React   │◀───WebSocket───────▶│ Spring Boot  │
│Frontend  │   (STOMP)          │WebSocketCtrl │
│          │                    │              │
└──────────┘                    └──────┬───────┘
                                        │
                                        │ Broadcast
                                        ▼
                                   ┌──────────┐
                                   │  Redis   │
                                   │ (Pub/Sub)│
                                   └──────────┘
```

**WebSocket Topics:**
- `/topic/session/{sessionId}` - Session updates
- `/topic/notifications` - Global notifications
- `/queue/notifications` - User-specific notifications

### 6. Audio Recording Flow (Voice Interviews)

```
┌──────────┐         ┌──────────────┐         ┌──────────┐
│  React   │────────▶│ Spring Boot  │────────▶│  Python  │
│Candidate │  POST   │InterviewCtrl │  HTTP   │ AI Service│
│Interview │ Audio   │              │────────▶│          │
│  Page    │ Blob    │              │         │  STT     │
└──────────┘         └──────────────┘         │ (Speech │
                                              │ to Text)│
                                              └────┬─────┘
                                                   │
                                                   │ Text
                                                   ▼
                                              ┌──────────┐
                                              │PostgreSQL│
                                              └──────────┘
```

**Steps:**
1. React: Records audio using MediaRecorder API
2. React: Converts to Blob/Base64
3. React: Uploads via `POST /api/interviews/sessions/{id}/audio`
4. Spring Boot: Saves audio file
5. Spring Boot: Calls Python STT service
6. Python: Converts speech to text
7. Python: Returns transcribed text
8. Spring Boot: Processes as regular answer

## API Communication Patterns

### Frontend → Backend (React → Spring Boot)

**REST API Calls:**
```typescript
// Example from frontend/src/services/api.ts
const response = await api.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
})
```

**WebSocket Connection:**
```typescript
// Example from frontend/src/services/websocket.ts
const ws = new WebSocket('ws://localhost:8080/ws/interview/session123')
ws.send(JSON.stringify({ type: 'get_question' }))
```

### Backend → AI Service (Spring Boot → Python)

**HTTP REST Calls:**
```java
// Example from Spring Boot service
RestTemplate restTemplate = new RestTemplate();
String pythonUrl = "http://localhost:8000/api/generate-question";

GenerateQuestionRequest request = new GenerateQuestionRequest();
request.setTemplateId(templateId);
request.setSessionId(sessionId);

ResponseEntity<QuestionResponse> response = restTemplate.postForEntity(
    pythonUrl, 
    request, 
    QuestionResponse.class
);
```

## State Management Flow

### Frontend State (React)

```
┌─────────────────────────────────────────┐
│         React Application                │
│  ┌───────────────────────────────────┐ │
│  │   Zustand Store (Global State)    │ │
│  │   - authStore (user, token)       │ │
│  │   - uiStore (sidebar, modals)     │ │
│  │   - websocketStore (connections)  │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │   React Query (API Cache)         │ │
│  │   - Candidates, Jobs, Sessions    │ │
│  │   - Automatic refetch, caching    │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │   Component State (useState)      │ │
│  │   - Form inputs, UI state         │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Backend State (Spring Boot)

```
┌─────────────────────────────────────────┐
│      Spring Boot Application            │
│  ┌───────────────────────────────────┐ │
│  │   PostgreSQL (Persistent Data)    │ │
│  │   - Users, Candidates, Jobs       │ │
│  │   - Sessions, Turns, Templates     │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │   Redis (Temporary State)         │ │
│  │   - Session state                  │ │
│  │   - WebSocket subscriptions        │ │
│  │   - Cache                          │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │   In-Memory (Application State)    │ │
│  │   - Active WebSocket connections   │ │
│  │   - Background job queues          │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Authentication & Authorization Flow

```
1. User Login (React)
   ↓
2. POST /api/auth/login (Spring Boot)
   ↓
3. Validate credentials (PostgreSQL)
   ↓
4. Generate JWT token (Spring Boot)
   ↓
5. Return token to React
   ↓
6. Store token in localStorage + Zustand
   ↓
7. Include token in all API requests:
   Authorization: Bearer <token>
   ↓
8. Spring Boot validates token on each request
   ↓
9. Grant/deny access based on role
```

## Complete Interview Session Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERVIEW SESSION FLOW                    │
└─────────────────────────────────────────────────────────────┘

1. RECRUITER CREATES SESSION
   React → Spring Boot → PostgreSQL
   - Select candidate & template
   - Create session record
   - Generate session ID

2. CANDIDATE JOINS
   React → Spring Boot → PostgreSQL
   - Candidate opens interview link
   - Validate session
   - Initialize WebSocket connection

3. QUESTION GENERATION (LOOP)
   React → Spring Boot → Python AI → Spring Boot → React
   a. React requests question via WebSocket
   b. Spring Boot checks Redis/PostgreSQL
   c. If new question needed:
      - Call Python AI Service
      - Python generates question using LLM
      - Save to PostgreSQL
      - Send to React via WebSocket
   d. React displays question

4. ANSWER SUBMISSION (LOOP)
   React → Spring Boot → Python AI → Spring Boot → React
   a. Candidate submits answer (text/audio)
   b. Spring Boot saves answer
   c. Call Python AI Service for evaluation
   d. Python analyzes answer (NLP)
   e. Python returns scores & feedback
   f. Spring Boot saves evaluation
   g. Send evaluation to React
   h. React displays feedback

5. INTERVIEW COMPLETION
   React → Spring Boot → Python AI → Spring Boot → React
   a. All questions answered
   b. Spring Boot calls Python for final summary
   c. Python generates overall evaluation
   d. Spring Boot saves summary
   e. Send email notifications
   f. React displays interview summary
```

## File Upload Flow (Resume, Audio)

```
┌──────────┐         ┌──────────────┐         ┌──────────┐
│  React   │────────▶│ Spring Boot  │────────▶│FileSystem│
│Frontend  │  POST   │ FileController│         │ /uploads │
│          │ Multipart│              │         │          │
└──────────┘         └──────┬───────┘         └──────────┘
                             │
                             │ Save metadata
                             ▼
                        ┌──────────┐
                        │PostgreSQL│
                        │(StoredFile)│
                        └──────────┘
```

## Background Jobs Flow

```
┌─────────────────────────────────────────┐
│      Spring Boot Scheduler              │
│  ┌───────────────────────────────────┐ │
│  │   @Scheduled Jobs                 │ │
│  │   - Cleanup old sessions          │ │
│  │   - Send interview reminders      │ │
│  │   - Generate reports              │ │
│  └───────────────────────────────────┘ │
│           │                              │
│           │ Async                        │
│           ▼                              │
│  ┌───────────────────────────────────┐ │
│  │   Email Queue                     │ │
│  │   - Send invitations              │ │
│  │   - Send reminders                │ │
│  └───────────────────────────────────┘ │
│           │                              │
│           ▼                              │
│  ┌───────────────────────────────────┐ │
│  │   Email Service                    │ │
│  │   - SMTP                           │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Error Handling Flow

```
┌──────────┐         ┌──────────────┐
│  React   │◀────────│ Spring Boot  │
│Frontend  │  Error  │GlobalException│
│          │ Response│   Handler    │
└──────────┘         └──────────────┘
     │
     │ Display error
     │ Show toast notification
     ▼
┌──────────┐
│   User   │
└──────────┘
```

## Key Integration Points

### 1. React ↔ Spring Boot
- **Protocol**: HTTP REST API, WebSocket (STOMP)
- **Authentication**: JWT tokens in Authorization header
- **Data Format**: JSON
- **Base URL**: `http://localhost:8080/api`

### 2. Spring Boot ↔ Python AI Service
- **Protocol**: HTTP REST API
- **Base URL**: `http://localhost:8000` (configurable)
- **Endpoints** (assumed):
  - `POST /api/generate-question`
  - `POST /api/evaluate-answer`
  - `POST /api/speech-to-text`
  - `POST /api/generate-summary`

### 3. Spring Boot ↔ PostgreSQL
- **Protocol**: JDBC (via Hibernate/JPA)
- **Connection**: `jdbc:postgresql://localhost:5432/ai_interview`
- **ORM**: Hibernate with JPA annotations

### 4. Spring Boot ↔ Redis
- **Protocol**: Redis protocol
- **Connection**: `localhost:6379`
- **Usage**: Session state, caching, WebSocket pub/sub

## Example: Complete Interview Turn

```
1. React: User clicks "Next Question"
   ↓
2. React: WebSocket.send({type: "get_question"})
   ↓
3. Spring Boot: WebSocketController receives message
   ↓
4. Spring Boot: InterviewSessionService.getNextQuestion()
   ↓
5. Spring Boot: Check Redis for cached question
   ↓
6. If not cached:
   Spring Boot: RestTemplate → Python AI Service
   POST http://localhost:8000/api/generate-question
   {
     "templateId": 1,
     "sessionId": "abc123",
     "turnNumber": 1
   }
   ↓
7. Python: LLM generates question
   ↓
8. Python: Returns {question: "Tell me about yourself", ...}
   ↓
9. Spring Boot: Save to PostgreSQL (InterviewTurn)
   ↓
10. Spring Boot: Cache in Redis
    ↓
11. Spring Boot: WebSocket.sendTo("/topic/session/abc123", question)
    ↓
12. React: Receives question via WebSocket
    ↓
13. React: Displays question to user
    ↓
14. User types answer
    ↓
15. React: WebSocket.send({type: "submit_answer", answer: "..."})
    ↓
16. Spring Boot: Save answer to PostgreSQL
    ↓
17. Spring Boot: RestTemplate → Python AI Service
    POST http://localhost:8000/api/evaluate-answer
    {
      "question": "...",
      "answer": "...",
      "sessionId": "abc123"
    }
    ↓
18. Python: NLP analysis, scoring
    ↓
19. Python: Returns {score: 8.5, feedback: "...", ...}
    ↓
20. Spring Boot: Save evaluation to PostgreSQL
    ↓
21. Spring Boot: WebSocket.sendTo("/topic/session/abc123", evaluation)
    ↓
22. React: Displays evaluation
    ↓
23. Repeat for next question...
```

## Summary

**React (Frontend):**
- Handles all UI/UX
- Makes API calls to Spring Boot
- Manages client-side state
- Connects via WebSocket for real-time updates

**Spring Boot (Backend):**
- Business logic and validation
- Database operations (PostgreSQL)
- Session management (Redis)
- API gateway to Python AI Service
- WebSocket server for real-time communication
- Authentication & authorization

**Python (AI Service):**
- AI/ML processing
- Question generation (LLM)
- Answer evaluation (NLP)
- Speech processing (STT/TTS)
- Returns structured JSON responses

This architecture provides:
- ✅ Separation of concerns
- ✅ Scalability (each service can scale independently)
- ✅ Real-time communication
- ✅ Secure authentication
- ✅ Efficient data management



