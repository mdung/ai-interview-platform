# API Documentation

## Authentication

### POST /api/auth/login
Login and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "user@example.com",
  "role": "RECRUITER",
  "firstName": "John",
  "lastName": "Doe"
}
```

## Interview Sessions

### POST /api/interviews/sessions
Create a new interview session.

**Request:**
```json
{
  "candidateId": 1,
  "templateId": 1,
  "language": "en"
}
```

**Response:**
```json
{
  "id": 1,
  "sessionId": "uuid-here",
  "candidateId": 1,
  "candidateName": "Jane Doe",
  "templateId": 1,
  "templateName": "Senior Python Engineer",
  "status": "PENDING",
  "language": "en",
  "startedAt": "2024-01-01T10:00:00",
  "totalTurns": 0
}
```

### GET /api/interviews/sessions/{sessionId}
Get session details.

### PUT /api/interviews/sessions/{sessionId}/status
Update session status.

**Query Parameters:**
- `status`: PENDING | IN_PROGRESS | PAUSED | COMPLETED | ABANDONED

## Jobs

### GET /api/recruiter/jobs
Get all active jobs.

### POST /api/recruiter/jobs
Create a new job.

### GET /api/recruiter/jobs/{id}
Get job by ID.

### PUT /api/recruiter/jobs/{id}
Update job.

### DELETE /api/recruiter/jobs/{id}
Delete job (soft delete).

## Interview Templates

### GET /api/recruiter/templates
Get all active templates.

### POST /api/recruiter/templates
Create a new template.

### GET /api/recruiter/templates/job/{jobId}
Get templates for a specific job.

## Candidates

### GET /api/recruiter/candidates
Get all candidates.

### POST /api/recruiter/candidates
Create a new candidate.

### GET /api/candidates/join/{sessionId}
Public endpoint for candidates to join interview.

## WebSocket

### ws://localhost:8000/ws/interview/{sessionId}

**Message Types:**

1. **Question** (from server):
```json
{
  "type": "question",
  "text": "Tell me about your experience with Python."
}
```

2. **Answer** (from client):
```json
{
  "type": "answer",
  "text": "I have 5 years of experience..."
}
```

3. **Audio** (binary):
- Raw audio bytes sent from client
- Audio response bytes from server

4. **Evaluation** (from server):
```json
{
  "type": "evaluation",
  "data": {
    "summary": "...",
    "strengths": "...",
    "weaknesses": "...",
    "recommendation": "STRONG"
  }
}
```

