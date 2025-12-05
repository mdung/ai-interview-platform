# Quick Setup Guide

## Prerequisites

- Docker Desktop (or Docker + Docker Compose)
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/mdung/ai-interview-platform.git
   cd ai-interview-platform
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Set up environment variables**

   Create `ai-service/.env`:
   ```env
   OPENAI_API_KEY=your-openai-api-key
   BACKEND_URL=http://localhost:8080
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. **Start Backend**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   Or use Docker:
   ```bash
   docker build -t ai-interview-backend ./backend
   docker run -p 8080:8080 ai-interview-backend
   ```

5. **Start AI Service**
   ```bash
   cd ai-service
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

6. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - AI Service: http://localhost:8000

## Using Docker Compose (All Services)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Initial Setup

1. Create an admin user (you'll need to add this via database or API)
2. Create a job posting
3. Create an interview template
4. Create a candidate
5. Start an interview session

## Troubleshooting

### Port conflicts
- Change ports in respective config files

### Database connection errors
- Ensure PostgreSQL is running: `docker ps`
- Check connection string in `backend/src/main/resources/application.yml`

### Redis connection errors
- Ensure Redis is running: `docker ps`
- Check Redis host/port in config files

### AI Service errors
- Ensure OpenAI API key is set in `.env`
- Check that Whisper/TTS models can be downloaded (requires internet)

## Next Steps

- Read [Development Guide](./docs/development.md)
- Check [API Documentation](./docs/api.md)
- Review [Architecture](./docs/architecture.md)

