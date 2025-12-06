# PowerShell Script to Test Application Endpoints
# Run this script to verify the application is working

$baseUrl = "http://localhost:8080"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing AI Interview Platform API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get
    Write-Host "   ✅ Health Check: PASSED" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    Write-Host "   Timestamp: $($response.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Health Check: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Actuator Health
Write-Host "2. Testing Actuator Health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -Method Get
    Write-Host "   ✅ Actuator Health: PASSED" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Actuator Health: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: User Registration
Write-Host "3. Testing User Registration..." -ForegroundColor Yellow
$registerData = @{
    email = "test@example.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
    role = "RECRUITER"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Headers $headers -Body $registerData
    Write-Host "   ✅ User Registration: PASSED" -ForegroundColor Green
    Write-Host "   User ID: $($response.id)" -ForegroundColor Gray
    Write-Host "   Email: $($response.email)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   ⚠️  User already exists (this is OK)" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ User Registration: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: User Login
Write-Host "4. Testing User Login..." -ForegroundColor Yellow
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$token = $null
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Headers $headers -Body $loginData
    $token = $response.token
    Write-Host "   ✅ User Login: PASSED" -ForegroundColor Green
    Write-Host "   Token received: $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "   ❌ User Login: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get Current User (Protected Endpoint)
if ($token) {
    Write-Host "5. Testing Protected Endpoint (Get Current User)..." -ForegroundColor Yellow
    $authHeaders = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $authHeaders
        Write-Host "   ✅ Protected Endpoint: PASSED" -ForegroundColor Green
        Write-Host "   User: $($response.firstName) $($response.lastName)" -ForegroundColor Gray
        Write-Host "   Email: $($response.email)" -ForegroundColor Gray
    } catch {
        Write-Host "   ❌ Protected Endpoint: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 6: List Jobs (Recruiter Endpoint)
if ($token) {
    Write-Host "6. Testing Recruiter Endpoint (List Jobs)..." -ForegroundColor Yellow
    $authHeaders = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/recruiter/jobs" -Method Get -Headers $authHeaders
        Write-Host "   ✅ Recruiter Endpoint: PASSED" -ForegroundColor Green
        Write-Host "   Jobs found: $($response.totalElements)" -ForegroundColor Gray
    } catch {
        Write-Host "   ❌ Recruiter Endpoint: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 7: List Candidates (Recruiter Endpoint)
if ($token) {
    Write-Host "7. Testing Recruiter Endpoint (List Candidates)..." -ForegroundColor Yellow
    $authHeaders = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/recruiter/candidates" -Method Get -Headers $authHeaders
        Write-Host "   ✅ Recruiter Endpoint: PASSED" -ForegroundColor Green
        Write-Host "   Candidates found: $($response.totalElements)" -ForegroundColor Gray
    } catch {
        Write-Host "   ❌ Recruiter Endpoint: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan


