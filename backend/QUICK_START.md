# Quick Start Guide - No Docker

## Prerequisites Check

```bash
# Check Java (need 17+)
java -version

# Check Maven
mvn -version

# Check PostgreSQL
psql --version

# Check Redis
redis-cli --version
```

## 5-Minute Setup

### 1. Install Prerequisites (if missing)

**macOS:**
```bash
brew install openjdk@17 maven postgresql@15 redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install openjdk-17-jdk maven postgresql postgresql-contrib redis-server
```

**Windows:**
- Download installers from official websites
- Or use Chocolatey: `choco install openjdk17 maven postgresql redis`

### 2. Start Services

```bash
# PostgreSQL
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Redis
# macOS
brew services start redis

# Linux
sudo systemctl start redis-server

# Verify
redis-cli ping  # Should return: PONG
```

### 3. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ai_interview;

# Exit
\q
```

### 4. Configure Application

Edit `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ai_interview
    username: postgres
    password: your_postgres_password  # Change this!
```

### 5. Build and Run

```bash
cd backend

# Build
mvn clean install -DskipTests

# Run
mvn spring-boot:run
```

### 6. Verify

Open browser: http://localhost:8080/api/admin/health

Or use curl:
```bash
curl http://localhost:8080/api/admin/health
```

## That's It! 🎉

Your backend is now running at `http://localhost:8080`

For detailed instructions, see `RUN_WITHOUT_DOCKER.md`


