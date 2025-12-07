# Running Backend Without Docker

This guide shows you how to run the AI Interview Platform backend without Docker, using local installations.

## Prerequisites Installation

### 1. Install Java 17+

#### Windows:
1. Download from: https://adoptium.net/temurin/releases/
2. Choose JDK 17 (LTS) for Windows x64
3. Run installer and follow instructions
4. Verify:
   ```cmd
   java -version
   javac -version
   ```

#### macOS:
```bash
# Using Homebrew
brew install openjdk@17

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
java -version
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install openjdk-17-jdk
java -version
```

### 2. Install Maven

#### Windows:
1. Download from: https://maven.apache.org/download.cgi
2. Extract to `C:\Program Files\Apache\maven`
3. Add to PATH:
   - System Properties → Environment Variables
   - Add `C:\Program Files\Apache\maven\bin` to PATH
4. Verify:
   ```cmd
   mvn -version
   ```

#### macOS:
```bash
brew install maven
mvn -version
```

#### Linux:
```bash
sudo apt install maven
mvn -version
```

### 3. Install PostgreSQL

#### Windows:
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer (use default port 5432)
3. Remember the postgres user password you set
4. Verify:
   ```cmd
   psql --version
   ```

#### macOS:
```bash
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb ai_interview
```

#### Linux:
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE ai_interview;
\q
```

### 4. Install Redis

#### Windows:
**Option 1: Using WSL (Windows Subsystem for Linux)**
```bash
# Install WSL
wsl --install

# In WSL terminal
sudo apt update
sudo apt install redis-server
redis-server
```

**Option 2: Using Memurai (Redis for Windows)**
1. Download from: https://www.memurai.com/get-memurai
2. Install and start the service
3. Redis will run on port 6379

**Option 3: Using Chocolatey**
```cmd
choco install redis-64
redis-server
```

#### macOS:
```bash
brew install redis
brew services start redis

# Verify
redis-cli ping
# Should return: PONG
```

#### Linux:
```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping
```

## Step-by-Step Setup

### Step 1: Create Database

#### Using psql:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ai_interview;

# Create user (optional)
CREATE USER aiinterview_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_interview TO aiinterview_user;

# Exit
\q
```

#### Using pgAdmin (GUI):
1. Open pgAdmin
2. Connect to PostgreSQL server
3. Right-click "Databases" → Create → Database
4. Name: `ai_interview`
5. Click Save

### Step 2: Configure Application

Edit `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ai_interview
    username: postgres  # Change if you created a different user
    password: postgres  # Change to your PostgreSQL password
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update  # Creates/updates tables automatically
    show-sql: true

  redis:
    host: localhost
    port: 6379
    # password:  # Uncomment if Redis has password
    timeout: 2000ms

  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME:}  # Set via environment variable
    password: ${MAIL_PASSWORD:}  # Set via environment variable
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

jwt:
  secret: ${JWT_SECRET:your-256-bit-secret-key-change-this-in-production}
  expiration: 86400000

file:
  upload-dir: uploads  # Will be created automatically
```

### Step 3: Set Environment Variables (Optional but Recommended)

#### Windows (Command Prompt):
```cmd
set JWT_SECRET=your-super-secret-key-minimum-32-characters-long
set MAIL_USERNAME=your-email@gmail.com
set MAIL_PASSWORD=your-app-password
```

#### Windows (PowerShell):
```powershell
$env:JWT_SECRET="your-super-secret-key-minimum-32-characters-long"
$env:MAIL_USERNAME="your-email@gmail.com"
$env:MAIL_PASSWORD="your-app-password"
```

#### macOS/Linux:
```bash
export JWT_SECRET="your-super-secret-key-minimum-32-characters-long"
export MAIL_USERNAME="your-email@gmail.com"
export MAIL_PASSWORD="your-app-password"

# To make permanent, add to ~/.bashrc or ~/.zshrc
echo 'export JWT_SECRET="your-secret-key"' >> ~/.zshrc
source ~/.zshrc
```

**Generate JWT Secret:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Or use online generator
# https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

### Step 4: Start Required Services

#### Start PostgreSQL:

**Windows:**
- PostgreSQL service should start automatically
- Or use Services app → Start "postgresql-x64-XX"

**macOS:**
```bash
brew services start postgresql@15
```

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

#### Start Redis:

**Windows (WSL):**
```bash
wsl
redis-server
```

**Windows (Memurai):**
- Service starts automatically
- Or use Services app

**macOS:**
```bash
brew services start redis
```

**Linux:**
```bash
sudo systemctl start redis-server
```

**Verify Redis:**
```bash
redis-cli ping
# Should return: PONG
```

### Step 5: Build the Project

```bash
# Navigate to backend directory
cd backend

# Clean and build
mvn clean install -DskipTests

# Or build with tests
mvn clean install
```

This will:
- Download all dependencies (first time may take a few minutes)
- Compile the code
- Run tests
- Create JAR file in `target/` directory

### Step 6: Run the Application

#### Option 1: Using Maven (Recommended for Development)
```bash
mvn spring-boot:run
```

#### Option 2: Using JAR File
```bash
# Build first
mvn clean package -DskipTests

# Run
java -jar target/ai-interview-platform-1.0.0.jar
```

#### Option 3: Using IDE (IntelliJ IDEA / Eclipse / VS Code)

**IntelliJ IDEA:**
1. Open project: File → Open → Select `backend` folder
2. Wait for Maven to sync dependencies
3. Find: `src/main/java/com/aiinterview/AiInterviewPlatformApplication.java`
4. Right-click → Run 'AiInterviewPlatformApplication'

**Eclipse:**
1. File → Import → Maven → Existing Maven Projects
2. Select `backend` folder
3. Find main class and Run

**VS Code:**
1. Install "Extension Pack for Java"
2. Open `backend` folder
3. Find main class → Run

### Step 7: Verify It's Running

1. **Check Console Output:**
   ```
   Started AiInterviewPlatformApplication in X.XXX seconds
   ```

2. **Test Health Endpoint:**
   ```bash
   # Using curl
   curl http://localhost:8080/api/admin/health
   
   # Or open in browser
   http://localhost:8080/api/admin/health
   ```

3. **Check Logs:**
   - Console output shows startup logs
   - File logs: `backend/logs/application.log`

## Troubleshooting

### Issue: PostgreSQL Connection Failed

**Check:**
```bash
# Verify PostgreSQL is running
psql -U postgres -l

# Check if database exists
psql -U postgres -c "\l" | grep ai_interview

# Test connection
psql -U postgres -d ai_interview
```

**Fix:**
- Update username/password in `application.yml`
- Ensure database `ai_interview` exists
- Check PostgreSQL is listening on port 5432:
  ```bash
  # Windows
  netstat -an | findstr 5432
  
  # macOS/Linux
  lsof -i :5432
  ```

### Issue: Redis Connection Failed

**Check:**
```bash
redis-cli ping
# Should return: PONG
```

**Fix:**
- Start Redis service
- Check Redis is on port 6379:
  ```bash
  # Windows
  netstat -an | findstr 6379
  
  # macOS/Linux
  lsof -i :6379
  ```

### Issue: Port 8080 Already in Use

**Find process:**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8080 | xargs kill -9
```

**Or change port in `application.yml`:**
```yaml
server:
  port: 8081
```

### Issue: Maven Dependencies Not Downloading

**Fix:**
```bash
# Clear Maven cache
mvn clean
rm -rf ~/.m2/repository  # macOS/Linux
rmdir /s /q %USERPROFILE%\.m2\repository  # Windows

# Rebuild
mvn clean install
```

### Issue: JWT Secret Key Error

**Generate new key:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Update in application.yml or set as environment variable
```

## Running Without Redis (Optional)

If you want to run without Redis (some features won't work):

1. Comment out Redis dependencies in `pom.xml` (not recommended)
2. Or use in-memory Redis alternative
3. Or disable Redis-related features

**Note:** Redis is required for:
- Session state management
- WebSocket message queuing
- Caching

## Running Without Email (Optional)

Email is optional. The app will work without it, but:
- Password reset won't work
- Interview invitations won't be sent
- Reminders won't be sent

To disable email errors, you can:
1. Leave email credentials empty
2. Or configure a mock SMTP server

## Quick Start Checklist

- [ ] Java 17+ installed (`java -version`)
- [ ] Maven installed (`mvn -version`)
- [ ] PostgreSQL installed and running
- [ ] Database `ai_interview` created
- [ ] Redis installed and running (`redis-cli ping`)
- [ ] `application.yml` configured
- [ ] Environment variables set (optional)
- [ ] Project built (`mvn clean install`)
- [ ] Application running (`mvn spring-boot:run`)
- [ ] Health check passes (`curl http://localhost:8080/api/admin/health`)

## Development Workflow

```bash
# 1. Start services
# PostgreSQL and Redis should be running

# 2. Build project
cd backend
mvn clean install

# 3. Run application
mvn spring-boot:run

# 4. Make changes to code
# Application will auto-reload (if devtools enabled)

# 5. Test endpoints
curl http://localhost:8080/api/admin/health
```

## Next Steps

1. **Create Admin User:**
   - Use registration endpoint: `POST /api/auth/register`
   - Or insert directly into database

2. **Test API:**
   - Use Postman
   - Or Swagger UI (if enabled)
   - Or curl commands

3. **Connect Frontend:**
   - Update frontend API base URL to `http://localhost:8080/api`
   - Start frontend: `cd frontend && npm run dev`

## Summary

Running without Docker requires:
1. ✅ Install Java, Maven, PostgreSQL, Redis locally
2. ✅ Create database
3. ✅ Configure `application.yml`
4. ✅ Start PostgreSQL and Redis services
5. ✅ Build with Maven
6. ✅ Run with `mvn spring-boot:run`

The application will be available at: `http://localhost:8080`



