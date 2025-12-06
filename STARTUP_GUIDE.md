# 🚀 Application Startup Guide

## ✅ Current Status

### Backend: **RUNNING** ✅
- **Port:** 8080
- **Process ID:** 8
- **Database:** PostgreSQL connected
- **Status:** Healthy and ready

### Frontend: **READY TO START** ⏳
- **Design System:** Complete
- **Navigation:** Implemented
- **Pages Updated:** RecruiterDashboard, SessionList

---

## 🎯 How to Start the Application

### Option 1: Start Frontend Development Server (Recommended)

```bash
cd frontend
npm run dev
```

Then open: **http://localhost:3000**

### Option 2: Build and Preview Frontend

```bash
cd frontend
npm run build
npm run preview
```

---

## 🔐 Login Credentials

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123

### Recruiter Account
- **Email:** recruiter@example.com
- **Password:** recruiter123

---

## 🧭 Navigation Features

### Main Menu Items:
1. **📊 Dashboard** - Overview and statistics
2. **💬 Sessions** - All interview sessions
3. **➕ New Session** - Create new interview
4. **👥 Candidates** - Manage candidates
5. **💼 Jobs** - Manage job postings
6. **📝 Templates** - Interview templates
7. **📈 Analytics** - Reports and analytics
8. **📅 Calendar** - Calendar view
9. **⚙️ Admin** - Admin panel (admin only)

### Features:
- ✅ Always visible at top
- ✅ Active page highlighted
- ✅ No "Back" buttons needed
- ✅ Quick logout access
- ✅ User info displayed

---

## 🎨 UI/UX Features

### Text Clarity:
- **Page Titles:** 42px, extra bold (900 weight)
- **Section Titles:** 28px, bold, UPPERCASE with emojis
- **Form Labels:** 15px, bold, uppercase
- **All text:** High contrast, clear shadows

### Design:
- **Gradient Background:** Purple to pink
- **Glassmorphism:** Blurred transparent panels
- **Smooth Animations:** Hover effects, transitions
- **Responsive:** Works on all devices

---

## 📱 Testing Checklist

### 1. Backend Health Check
```bash
curl http://localhost:8080/actuator/health
```

Expected: `{"status":"UP"}`

### 2. Login Test
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Expected: JWT token in response

### 3. Frontend Pages to Test
- [ ] Login page
- [ ] Dashboard (with navigation menu)
- [ ] Sessions list (with navigation menu)
- [ ] Create new session
- [ ] Candidates management
- [ ] Jobs management
- [ ] Templates management
- [ ] Analytics
- [ ] Calendar view

### 4. Navigation Testing
- [ ] Click each menu item
- [ ] Verify active state highlights
- [ ] Check user info displays
- [ ] Test logout button
- [ ] Test on mobile (resize browser)

### 5. Text Clarity Testing
- [ ] Page titles are large and clear
- [ ] Section titles are bold and visible
- [ ] Form labels are easy to read
- [ ] All text has good contrast

---

## 🐛 Troubleshooting

### Backend Issues

#### Port 8080 already in use
```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Restart backend
cd backend
java -jar target/ai-interview-platform-1.0.0.jar
```

#### Database connection error
- Check PostgreSQL is running on port 5432
- Verify database name: `ai_interview`
- Check credentials: postgres/postgres

### Frontend Issues

#### npm install fails
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Build fails
```bash
cd frontend
npm run build
```
Check console for specific errors

#### Port 3000 already in use
```bash
# Change port in package.json or use:
npm run dev -- --port 3001
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/forgot-password` - Password reset

### Candidates
- `GET /api/recruiter/candidates` - List candidates
- `POST /api/recruiter/candidates` - Create candidate
- `GET /api/recruiter/candidates/{id}` - Get candidate
- `PUT /api/recruiter/candidates/{id}` - Update candidate

### Jobs
- `GET /api/recruiter/jobs` - List jobs
- `POST /api/recruiter/jobs` - Create job
- `GET /api/recruiter/jobs/{id}` - Get job
- `PUT /api/recruiter/jobs/{id}` - Update job

### Sessions
- `GET /api/interviews/sessions` - List sessions
- `POST /api/interviews/sessions` - Create session
- `GET /api/interviews/sessions/{id}` - Get session
- `PUT /api/interviews/sessions/{id}` - Update session

### Analytics
- `GET /api/recruiter/analytics/overview` - Dashboard stats
- `GET /api/recruiter/analytics/interviews` - Interview analytics
- `GET /api/recruiter/analytics/candidates` - Candidate analytics

---

## 🎯 Quick Commands

### Backend
```bash
# Build
cd backend
mvn clean package -DskipTests

# Run
java -jar target/ai-interview-platform-1.0.0.jar

# Check logs
tail -f backend/logs/application.log
```

### Frontend
```bash
# Install dependencies
cd frontend
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run E2E tests
npm run test:e2e
```

### Database
```bash
# Connect to PostgreSQL
psql -U postgres -d ai_interview

# List tables
\dt

# Check users
SELECT * FROM users;
```

---

## ✅ Success Indicators

### Backend Started Successfully:
- ✅ "Started AiInterviewPlatformApplication" in logs
- ✅ "Tomcat started on port 8080" in logs
- ✅ "Admin user already exists" in logs
- ✅ No error messages

### Frontend Started Successfully:
- ✅ "VITE ready in XXXms" in console
- ✅ "Local: http://localhost:3000" displayed
- ✅ No compilation errors
- ✅ Browser opens automatically

### Application Working:
- ✅ Login page loads
- ✅ Can login with credentials
- ✅ Navigation menu appears
- ✅ Can navigate between pages
- ✅ Text is clear and readable
- ✅ No console errors

---

## 📝 Notes

- Backend is already running on port 8080
- Frontend needs to be started with `npm run dev`
- All navigation and text clarity updates are complete
- RecruiterDashboard and SessionList are updated
- Remaining pages can be updated using the same pattern

---

## 🎉 You're Ready!

1. ✅ Backend is running
2. ⏳ Start frontend: `cd frontend && npm run dev`
3. 🌐 Open: http://localhost:3000
4. 🔐 Login with: admin@example.com / admin123
5. 🧭 Use navigation menu to explore

**Enjoy your enhanced AI Interview Platform!** 🚀
