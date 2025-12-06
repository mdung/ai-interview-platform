# Login Credentials

## 🔐 **Default Users**

The application automatically creates default users on first startup:

### **Admin User**
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** ADMIN
- **Access:** Full system access (admin panel, user management, etc.)

### **Recruiter User**
- **Email:** `recruiter@example.com`
- **Password:** `recruiter123`
- **Role:** RECRUITER
- **Access:** Recruiter dashboard, job management, candidate management, etc.

---

## 🆕 **Register a New User**

If you want to create your own account, you can register:

### **Option 1: Via Frontend**
1. Go to: `http://localhost:3000`
2. Click **"Don't have an account? Register"**
3. Fill in the registration form:
   - Email
   - Password (minimum 6 characters)
   - First Name
   - Last Name
   - Role (ADMIN, RECRUITER, or CANDIDATE)
4. Click **"Register"**

### **Option 2: Via API (PowerShell)**

```powershell
$body = @{
    email = "your-email@example.com"
    password = "your-password"
    firstName = "Your"
    lastName = "Name"
    role = "RECRUITER"  # or "ADMIN" or "CANDIDATE"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

---

## 🔑 **Login**

### **Via Frontend**
1. Go to: `http://localhost:3000`
2. Enter your email and password
3. Click **"Login"**

### **Via API (PowerShell)**

```powershell
$body = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

Write-Host "Token: $($response.token)"
```

---

## 📝 **Quick Reference**

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `admin@example.com` | `admin123` | Full system access |
| **Recruiter** | `recruiter@example.com` | `recruiter123` | Recruiter features |
| **Candidate** | (Register new) | (Your choice) | Interview access only |

---

## ⚠️ **Important Notes**

1. **Default users are created automatically** on first application startup
2. **Change passwords** in production! These are default development credentials
3. **Password requirements:**
   - Minimum 6 characters
   - No other restrictions (for development)
4. **User roles:**
   - `ADMIN`: Full access to all features
   - `RECRUITER`: Can manage jobs, candidates, templates, interviews
   - `CANDIDATE`: Can only access interviews via invitation link

---

## 🔄 **Reset Password**

If you forget your password:

1. Click **"Forgot Password?"** on the login page
2. Enter your email
3. Check your email for reset link (if email service is configured)
4. Or use the API:

```powershell
# Request password reset
$body = @{ email = "admin@example.com" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/api/auth/forgot-password" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# Reset password (use token from email or database)
$body = @{
    token = "reset-token-here"
    newPassword = "newpassword123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/auth/reset-password" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

---

## 🎯 **Quick Start**

1. **Start backend** (if not running)
2. **Start frontend** (if not running)
3. **Open browser:** `http://localhost:3000`
4. **Login with:**
   - Email: `admin@example.com`
   - Password: `admin123`

That's it! You're logged in as admin. 🎉

