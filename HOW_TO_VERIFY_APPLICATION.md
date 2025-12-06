# How to Verify the Application is Working

## ✅ **Application Started Successfully**

From your logs, the application started on:
- **Port**: `8080`
- **Status**: `Started AiInterviewPlatformApplication in 6.875 seconds`
- **Tomcat**: Running on port 8080
- **Database**: Connected (HikariPool started)
- **WebSocket**: Started (BrokerAvailabilityEvent available=true)

## 🔍 **Ways to Verify Application is Working**

### 1. Health Check Endpoint ✅

**Endpoint**: `GET /api/health`

**Test it:**
```bash
# Using curl
curl http://localhost:8080/api/health

# Using browser
http://localhost:8080/api/health
```

**Expected Response:**
```json
{
  "status": "UP",
  "timestamp": "2025-12-06T17:02:23.123Z"
}
```

### 2. Spring Boot Actuator Endpoints

**Available Endpoints** (from logs: "Exposing 4 endpoint(s) beneath base path '/actuator'"):

```bash
# Health endpoint
curl http://localhost:8080/actuator/health

# Application info
curl http://localhost:8080/actuator/info

# Application metrics
curl http://localhost:8080/actuator/metrics

# List all endpoints
curl http://localhost:8080/actuator
```

**Expected Response** (`/actuator/health`):
```json
{
  "status": "UP"
}
```

### 3. Test Authentication Endpoints

**Register a User:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "RECRUITER"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

### 4. Test Protected Endpoints (with Token)

**Get Current User:**
```bash
# First, get token from login, then:
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get All Jobs (Recruiter):**
```bash
curl http://localhost:8080/api/recruiter/jobs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Database Connection Check

**Check if database is connected:**
- Look for in logs: `HikariPool-1 - Start completed.`
- If you see this, database connection is working ✅

**Test via API:**
```bash
# Try to create a candidate (requires auth)
curl -X POST http://localhost:8080/api/recruiter/candidates \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }'
```

### 6. WebSocket Connection Test

**Test WebSocket:**
```bash
# Using wscat (install: npm install -g wscat)
wscat -c ws://localhost:8080/ws/interview/test-session-id

# Or use browser console:
const ws = new WebSocket('ws://localhost:8080/ws/interview/test-session-id');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (msg) => console.log('Message:', msg.data);
```

### 7. Quick Verification Script

Create a test script to verify all endpoints:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080"

echo "1. Testing Health Endpoint..."
curl -s $BASE_URL/api/health | jq .

echo -e "\n2. Testing Actuator Health..."
curl -s $BASE_URL/actuator/health | jq .

echo -e "\n3. Testing User Registration..."
curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "RECRUITER"
  }' | jq .

echo -e "\n4. Testing Login..."
TOKEN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq -r '.token')

echo "Token: $TOKEN"

echo -e "\n5. Testing Protected Endpoint (Get Current User)..."
curl -s $BASE_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .
```

## 📋 **Quick Checklist**

### ✅ **Application is Working If:**

1. ✅ **Health endpoint returns 200 OK**
   ```bash
   curl http://localhost:8080/api/health
   # Should return: {"status":"UP","timestamp":"..."}
   ```

2. ✅ **Actuator health is UP**
   ```bash
   curl http://localhost:8080/actuator/health
   # Should return: {"status":"UP"}
   ```

3. ✅ **Can register a user**
   ```bash
   curl -X POST http://localhost:8080/api/auth/register ...
   # Should return: User object with id
   ```

4. ✅ **Can login and get token**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login ...
   # Should return: Token and user info
   ```

5. ✅ **Can access protected endpoints with token**
   ```bash
   curl http://localhost:8080/api/auth/me -H "Authorization: Bearer TOKEN"
   # Should return: Current user info
   ```

6. ✅ **Database connection works** (check logs for HikariPool messages)

7. ✅ **WebSocket broker is available** (check logs for BrokerAvailabilityEvent)

## 🚨 **Common Issues**

### Issue 1: Health endpoint returns 404
**Solution**: Check if `HealthController` is in the correct package and scanned by Spring

### Issue 2: Database connection fails
**Solution**: 
- Check PostgreSQL is running: `pg_isready` or check service status
- Verify credentials in `application.yml`
- Check database exists: `psql -U postgres -l`

### Issue 3: Port 8080 already in use
**Solution**: 
- Change port in `application.yml`: `server.port: 8081`
- Or kill process using port 8080

### Issue 4: CORS errors (when testing from browser)
**Solution**: Check CORS configuration in `SecurityConfig.java`

## 🎯 **Recommended Verification Steps**

**Step 1: Health Check** (Easiest)
```bash
curl http://localhost:8080/api/health
```

**Step 2: Actuator Health**
```bash
curl http://localhost:8080/actuator/health
```

**Step 3: Register & Login**
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","firstName":"Test","lastName":"User","role":"RECRUITER"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Step 4: Test Protected Endpoint**
```bash
# Use token from login response
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

If all these work, your application is fully functional! ✅

