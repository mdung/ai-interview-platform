# Development Guide

## Project Structure

```
ai-interview-platform/
├── backend/              # Spring Boot application
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/aiinterview/
│   │       │       ├── model/         # JPA entities
│   │       │       ├── repository/   # Data access
│   │       │       ├── service/      # Business logic
│   │       │       ├── controller/   # REST endpoints
│   │       │       ├── config/       # Configuration
│   │       │       ├── security/     # JWT/auth
│   │       │       └── dto/          # Data transfer objects
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
│
├── frontend/             # React + TypeScript
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API clients
│   │   ├── types/       # TypeScript types
│   │   └── hooks/       # Custom hooks
│   └── package.json
│
├── ai-service/           # Python FastAPI
│   ├── services/
│   │   ├── voice_service.py    # ASR/VAD/TTS
│   │   ├── llm_service.py       # LLM integration
│   │   └── session_manager.py  # Session handling
│   ├── main.py
│   ├── config.py
│   └── requirements.txt
│
└── docs/                 # Documentation
```

## Development Workflow

### 1. Backend Development

```bash
cd backend
./mvnw spring-boot:run
```

- API runs on http://localhost:8080
- H2 console (if enabled): http://localhost:8080/h2-console
- Actuator: http://localhost:8080/actuator

### 2. Frontend Development

```bash
cd frontend
npm install
npm run dev
```

- App runs on http://localhost:3000
- Hot reload enabled

### 3. AI Service Development

```bash
cd ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

- Service runs on http://localhost:8000
- WebSocket on ws://localhost:8000/ws/interview/{sessionId}

## Testing

### Backend Tests
```bash
cd backend
./mvnw test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Code Style

- **Java**: Follow Google Java Style Guide
- **TypeScript**: ESLint with React plugin
- **Python**: PEP 8, use Black formatter

## Git Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and commit
3. Push to GitHub
4. Create pull request

## Common Issues

### Port Already in Use
- Backend (8080): Change in `application.yml`
- Frontend (3000): Change in `vite.config.ts`
- AI Service (8000): Change in `main.py`

### Database Connection
- Ensure PostgreSQL is running
- Check connection string in `application.yml`

### Redis Connection
- Ensure Redis is running
- Check host/port in config

