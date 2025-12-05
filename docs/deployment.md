# Deployment Guide

## Prerequisites

- Docker and Docker Compose
- PostgreSQL 14+
- Redis 7+
- Java 17+ (for local backend development)
- Node.js 18+ (for local frontend development)
- Python 3.10+ (for local AI service development)

## Local Development Setup

### 1. Start Infrastructure

```bash
docker-compose up -d postgres redis
```

### 2. Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

Or with Docker:
```bash
cd backend
docker build -t ai-interview-backend .
docker run -p 8080:8080 ai-interview-backend
```

### 3. AI Service Setup

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Or with Docker:
```bash
cd ai-service
docker build -t ai-interview-ai .
docker run -p 8000:8000 ai-interview-ai
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Or with Docker:
```bash
cd frontend
docker build -t ai-interview-frontend .
docker run -p 3000:80 ai-interview-frontend
```

## Environment Variables

### Backend (.env or application.yml)
```yaml
JWT_SECRET=your-secret-key-here
AI_SERVICE_API_KEY=optional-api-key
```

### AI Service (.env)
```env
OPENAI_API_KEY=your-openai-key
BACKEND_URL=http://localhost:8080
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Production Deployment

### Docker Compose (All Services)

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/ai_interview
      - SPRING_REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - REDIS_HOST=redis
      - BACKEND_URL=http://backend:8080
    depends_on:
      - redis
      - backend

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: ai_interview
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

Deploy:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests (to be added).

## Monitoring

- Backend metrics: http://localhost:8080/actuator/prometheus
- Health checks: http://localhost:8080/actuator/health
- AI Service health: http://localhost:8000/health

