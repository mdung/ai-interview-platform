# AI Interview Platform

An AI-driven first-round interview system that conducts interviews with candidates via voice and/or chat, simulating a real human interviewer experience.

## 🎯 Overview

This platform enables recruiters to automate the first round of technical interviews using AI. The system supports both voice and text-based interviews, with real-time conversation capabilities, anti-cheating mechanisms, and comprehensive evaluation features.

## 🏗️ Architecture

### Tech Stack

- **Backend (Business & Admin APIs)**: Java + Spring Boot
- **Frontend**: ReactJS with TypeScript
- **AI / Voice / NLP Services**: Python (FastAPI)
- **Database**: PostgreSQL
- **Cache / Session Store**: Redis
- **Message Broker**: Kafka (optional)
- **Deployment**: Docker, Kubernetes
- **Logging & Monitoring**: ELK/Loki + Grafana, Prometheus

### Components

1. **React Frontend**
   - Candidate UI: Join interview, voice/text modes, real-time conversation
   - Recruiter UI: Manage jobs, view results, review transcripts

2. **Spring Boot Backend**
   - REST APIs for interview management
   - Authentication & authorization
   - Data persistence (PostgreSQL)
   - Session state management (Redis)

3. **Python AI Service**
   - WebSocket for real-time audio streaming
   - ASR (Automatic Speech Recognition)
   - VAD (Voice Activity Detection)
   - TTS (Text-to-Speech)
   - LLM integration for intelligent questioning
   - Barge-in handling

## 🚀 Features

### Core Functionality

- ✅ Interview orchestration with templates
- ✅ Multi-turn conversation with context
- ✅ Real-time voice AI with streaming
- ✅ Voice Activity Detection (VAD)
- ✅ Barge-in handling (interrupt AI while speaking)
- ✅ Robust session handling with reconnect/resume
- ✅ LLM-powered intelligent questioning
- ✅ Anti-cheating mechanisms
- ✅ Comprehensive logging and monitoring
- ✅ Role-based access control (Admin, Recruiter, Candidate)

### Anti-Cheating Features

- Scenario-based questions
- Experience-based probing
- Real-time answer analysis
- Personalized follow-up questions

## 📁 Project Structure

```
ai-interview-platform/
├── backend/              # Spring Boot application
├── frontend/             # React + TypeScript application
├── ai-service/           # Python FastAPI service
├── docker-compose.yml    # Local development setup
├── k8s/                  # Kubernetes manifests
└── docs/                 # Documentation
```

## 🛠️ Setup & Installation

### Prerequisites

- Java 17+
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 7+

### Quick Start

1. Clone the repository
2. Start infrastructure services:
   ```bash
   docker-compose up -d postgres redis
   ```
3. Start backend:
   ```bash
   cd backend && ./mvnw spring-boot:run
   ```
4. Start AI service:
   ```bash
   cd ai-service && python -m uvicorn main:app --reload
   ```
5. Start frontend:
   ```bash
   cd frontend && npm install && npm start
   ```

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Development Guide](./docs/development.md)

## 🔐 Security

- HTTPS for all traffic
- JWT/OAuth2 authentication
- Data retention policies
- Privacy-compliant data handling

## 📊 Monitoring

- Centralized logging (ELK/Loki)
- Metrics (Prometheus)
- Real-time dashboards (Grafana)

## 🤝 Contributing

Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License

