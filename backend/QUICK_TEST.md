# Quick Test Guide - Verify Application is Working

## 🚀 **Quick Verification (30 seconds)**

### Option 1: Browser Test (Easiest)

1. **Health Check:**
   ```
   http://localhost:8080/api/health
   ```
   ✅ Should show: `{"status":"UP","timestamp":"..."}`

2. **Actuator Health:**
   ```
   http://localhost:8080/actuator/health
   ```
   ✅ Should show: `{"status":"UP"}`

### Option 2: PowerShell Test

Run the test script:
```powershell
cd backend
.\TEST_APPLICATION.ps1
```

### Option 3: Manual curl/Invoke-WebRequest

**1. Health Check:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get
```

**2. Actuator Health:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method Get
```

**3. Register User:**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
    role = "RECRUITER"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -ContentType "application/json" -Body $body
```

**4. Login:**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $body
$token = $response.token
Write-Host "Token: $token"
```

**5. Test Protected Endpoint:**
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/auth/me" -Method Get -Headers $headers
```

## ✅ **Success Indicators**

### Application is Working If:

1. ✅ **Health endpoint returns 200 OK**
   - URL: `http://localhost:8080/api/health`
   - Response: `{"status":"UP","timestamp":"..."}`

2. ✅ **Actuator health is UP**
   - URL: `http://localhost:8080/actuator/health`
   - Response: `{"status":"UP"}`

3. ✅ **Can register a user**
   - Endpoint: `POST /api/auth/register`
   - Response: User object with id

4. ✅ **Can login and get token**
   - Endpoint: `POST /api/auth/login`
   - Response: Token and user info

5. ✅ **Can access protected endpoints**
   - Endpoint: `GET /api/auth/me`
   - Headers: `Authorization: Bearer TOKEN`
   - Response: Current user info

## 📊 **Available Endpoints to Test**

### Public Endpoints (No Auth Required):
- `GET /api/health` - Health check
- `GET /actuator/health` - Spring Boot actuator health
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Protected Endpoints (Require JWT Token):
- `GET /api/auth/me` - Get current user
- `GET /api/recruiter/jobs` - List jobs
- `GET /api/recruiter/candidates` - List candidates
- `GET /api/recruiter/templates` - List templates
- `GET /api/interviews/sessions` - List interview sessions

## 🔍 **Check Application Status from Logs**

From your startup logs, verify:

1. ✅ **Tomcat started**: `Tomcat started on port 8080`
2. ✅ **Database connected**: `HikariPool-1 - Start completed.`
3. ✅ **WebSocket ready**: `BrokerAvailabilityEvent[available=true]`
4. ✅ **Application started**: `Started AiInterviewPlatformApplication`

## 🎯 **Recommended Test Sequence**

1. **Start with Health Check** (simplest)
   ```powershell
   Invoke-RestMethod http://localhost:8080/api/health
   ```

2. **Test Authentication Flow**
   - Register → Login → Get Current User

3. **Test Protected Endpoints**
   - Use token from login to access recruiter endpoints

4. **Test Database Operations**
   - Create a candidate or job (requires auth)

If all tests pass, your application is fully functional! ✅

