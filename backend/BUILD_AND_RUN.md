# Backend Build and Run Guide

This guide provides step-by-step instructions to build and run the AI Interview Platform backend.

## Prerequisites

### Required Software
1. **Java Development Kit (JDK) 17 or higher**
   - Download from: https://adoptium.net/ or https://www.oracle.com/java/technologies/downloads/
   - Verify installation:
     ```bash
     java -version
     javac -version
     ```

2. **Maven 3.6+**
   - Download from: https://maven.apache.org/download.cgi
   - Or use package manager:
     - **Windows (Chocolatey)**: `choco install maven`
     - **macOS (Homebrew)**: `brew install maven`
     - **Linux (Ubuntu/Debian)**: `sudo apt-get install maven`
   - Verify installation:
     ```bash
     mvn -version
     ```

3. **PostgreSQL 12+** (or MySQL 8+)
   - Download from: https://www.postgresql.org/download/ or https://dev.mysql.com/downloads/
   - Or use Docker:
     ```bash
     docker run --name postgres-aiinterview -e POSTGRES_PASSWORD=password -e POSTGRES_DB=aiinterview -p 5432:5432 -d postgres:15
     ```

4. **Redis 6+** (for session management)
   - Download from: https://redis.io/download
   - Or use Docker:
     ```bash
     docker run --name redis-aiinterview -p 6379:6379 -d redis:7-alpine
     ```

5. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/downloads

## Step-by-Step Setup

### Step 1: Clone the Repository (if not already done)
```bash
git clone <repository-url>
cd ai-interview-platform/backend
```

### Step 2: Configure Database

#### Option A: PostgreSQL (Recommended)
1. Create a database:
   ```sql
   CREATE DATABASE aiinterview;
   CREATE USER aiinterview_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE aiinterview TO aiinterview_user;
   ```

#### Option B: MySQL
1. Create a database:
   ```sql
   CREATE DATABASE aiinterview;
   CREATE USER 'aiinterview_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON aiinterview.* TO 'aiinterview_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Step 3: Configure Application Properties

1. Navigate to `src/main/resources/`
2. Copy `application.yml` (or create if it doesn't exist)
3. Update the following properties:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/aiinterview
    username: aiinterview_user
    password: your_password
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update  # Use 'create' for first run, 'update' for subsequent runs
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

  redis:
    host: localhost
    port: 6379
    password:  # Leave empty if no password
    timeout: 2000ms

  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

jwt:
  secret: your-secret-key-minimum-256-bits-long-for-hs256-algorithm
  expiration: 86400000  # 24 hours in milliseconds

file:
  upload-dir: ./uploads
  max-size: 10485760  # 10MB

server:
  port: 8080
```

**Important**: 
- Replace `your_password` with your actual database password
- Replace `your-email@gmail.com` and `your-app-password` with your email credentials
- Generate a secure JWT secret key (minimum 256 bits)
- Create the `uploads` directory if it doesn't exist

### Step 4: Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Download dependencies (Maven will download all required JARs)
mvn clean install -DskipTests
```

This will:
- Download all Maven dependencies
- Compile the source code
- Run tests (skipped with `-DskipTests`)
- Package the application

### Step 5: Build the Application

```bash
# Build the project
mvn clean package -DskipTests

# Or build with tests
mvn clean package
```

This creates a JAR file in `target/` directory:
- `ai-interview-platform-0.0.1-SNAPSHOT.jar`

### Step 6: Run the Application

#### Option A: Using Maven (Development)
```bash
# Run directly with Maven
mvn spring-boot:run
```

#### Option B: Using Java (Production)
```bash
# Run the JAR file
java -jar target/ai-interview-platform-0.0.1-SNAPSHOT.jar
```

#### Option C: Using IDE (IntelliJ IDEA / Eclipse)
1. Open the project in your IDE
2. Import as Maven project
3. Find the main class: `com.aiinterview.AiInterviewPlatformApplication`
4. Right-click → Run

### Step 7: Verify the Application is Running

1. **Check the console output** - You should see:
   ```
   Started AiInterviewPlatformApplication in X.XXX seconds
   ```

2. **Test the API**:
   ```bash
   # Health check
   curl http://localhost:8080/api/admin/health
   
   # Or open in browser
   http://localhost:8080/api/admin/health
   ```

3. **Check Swagger/API Documentation** (if enabled):
   ```
   http://localhost:8080/swagger-ui.html
   ```

## Common Issues and Solutions

### Issue 1: Port Already in Use
**Error**: `Port 8080 is already in use`

**Solution**:
```bash
# Change port in application.yml
server:
  port: 8081

# Or kill the process using port 8080
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:8080 | xargs kill -9
```

### Issue 2: Database Connection Failed
**Error**: `Connection refused` or `Authentication failed`

**Solution**:
1. Verify database is running:
   ```bash
   # PostgreSQL
   psql -U postgres -l
   
   # MySQL
   mysql -u root -p
   ```

2. Check credentials in `application.yml`
3. Ensure database exists
4. Check firewall settings

### Issue 3: Redis Connection Failed
**Error**: `Unable to connect to Redis`

**Solution**:
1. Verify Redis is running:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. Check Redis host/port in `application.yml`
3. If using Docker, ensure container is running:
   ```bash
   docker ps | grep redis
   ```

### Issue 4: Maven Dependencies Not Downloading
**Error**: `Could not resolve dependencies`

**Solution**:
1. Check internet connection
2. Clear Maven cache:
   ```bash
   mvn clean
   rm -rf ~/.m2/repository
   mvn install
   ```
3. Use a different Maven repository mirror (configure in `~/.m2/settings.xml`)

### Issue 5: JWT Secret Key Too Short
**Error**: `JWT secret key must be at least 256 bits`

**Solution**:
Generate a secure key:
```bash
# Using OpenSSL
openssl rand -base64 32

# Or use online generator
# Update in application.yml
jwt:
  secret: <generated-key>
```

## Development Mode

### Hot Reload with Spring DevTools
1. Add to `pom.xml` (if not already present):
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-devtools</artifactId>
       <scope>runtime</scope>
       <optional>true</optional>
   </dependency>
   ```

2. Run with:
   ```bash
   mvn spring-boot:run
   ```

3. Changes will auto-reload (may need IDE configuration)

### Running Tests
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=AuthControllerTest

# Run with coverage
mvn test jacoco:report
```

## Production Deployment

### Build for Production
```bash
# Build with production profile
mvn clean package -Pprod -DskipTests

# The JAR will be in target/
```

### Run as a Service (Linux)
1. Create systemd service file `/etc/systemd/system/aiinterview.service`:
   ```ini
   [Unit]
   Description=AI Interview Platform Backend
   After=network.target

   [Service]
   Type=simple
   User=aiinterview
   WorkingDirectory=/opt/aiinterview
   ExecStart=/usr/bin/java -jar /opt/aiinterview/ai-interview-platform-0.0.1-SNAPSHOT.jar
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

2. Enable and start:
   ```bash
   sudo systemctl enable aiinterview
   sudo systemctl start aiinterview
   sudo systemctl status aiinterview
   ```

### Docker Deployment
1. Create `Dockerfile`:
   ```dockerfile
   FROM openjdk:17-jdk-slim
   WORKDIR /app
   COPY target/ai-interview-platform-0.0.1-SNAPSHOT.jar app.jar
   EXPOSE 8080
   ENTRYPOINT ["java", "-jar", "app.jar"]
   ```

2. Build and run:
   ```bash
   docker build -t ai-interview-backend .
   docker run -p 8080:8080 ai-interview-backend
   ```

## Environment Variables

Instead of hardcoding values in `application.yml`, use environment variables:

```yaml
spring:
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/aiinterview}
    username: ${DATABASE_USER:aiinterview_user}
    password: ${DATABASE_PASSWORD:password}
  
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
```

Set environment variables:
```bash
# Linux/macOS
export DATABASE_PASSWORD=your_password
export JWT_SECRET=your_secret_key

# Windows
set DATABASE_PASSWORD=your_password
set JWT_SECRET=your_secret_key
```

## Logging

Logs are typically written to:
- Console (default)
- File: `logs/application.log` (if configured)

View logs:
```bash
# Tail logs
tail -f logs/application.log

# Or if running with Maven
# Logs appear in console
```

## API Endpoints

Once running, the API will be available at:
- Base URL: `http://localhost:8080/api`
- Health Check: `http://localhost:8080/api/admin/health`
- Authentication: `http://localhost:8080/api/auth/*`
- Interviews: `http://localhost:8080/api/interviews/*`
- Recruiter: `http://localhost:8080/api/recruiter/*`
- Admin: `http://localhost:8080/api/admin/*`

## Next Steps

1. **Initialize Database Schema**: The first run will create tables automatically (if `ddl-auto: update`)
2. **Create Admin User**: Use registration endpoint or database script
3. **Configure Email**: Set up SMTP for email notifications
4. **Test API**: Use Postman, curl, or Swagger UI
5. **Connect Frontend**: Update frontend API base URL to `http://localhost:8080/api`

## Quick Start Summary

```bash
# 1. Install prerequisites (Java, Maven, PostgreSQL, Redis)
# 2. Configure application.yml
# 3. Build
mvn clean package -DskipTests

# 4. Run
mvn spring-boot:run

# 5. Verify
curl http://localhost:8080/api/admin/health
```

## Support

For issues or questions:
1. Check application logs
2. Verify all prerequisites are installed
3. Ensure database and Redis are running
4. Check configuration in `application.yml`

