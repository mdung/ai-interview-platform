# How to Run the Frontend

## ✅ **Backend Status**

**Backend is running!** ✅
- Port: `8080`
- Status: Started successfully
- Database: Connected
- WebSocket: Available

**Note:** Health endpoints are currently blocked by security, but the main application endpoints work.

---

## 🚀 **Frontend Setup & Run Steps**

### **Prerequisites**

1. **Node.js** installed (version 18 or higher)
   - Check: `node --version`
   - Download: https://nodejs.org/

2. **npm** (comes with Node.js)
   - Check: `npm --version`

### **Step 1: Navigate to Frontend Directory**

```powershell
cd frontend
```

### **Step 2: Install Dependencies** (First time only)

```powershell
npm install
```

**Note:** If `node_modules` already exists, you can skip this step. But if you encounter errors, run this again.

### **Step 3: Create Environment File** (Optional)

Create `.env` file in the `frontend` directory (if not exists):

```powershell
# Create .env file
New-Item -Path ".env" -ItemType File -Force
```

Add this content to `.env`:
```env
VITE_API_URL=http://localhost:8080/api
```

**Note:** This is optional - the frontend defaults to `http://localhost:8080/api` if not set.

### **Step 4: Start the Frontend Development Server**

```powershell
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### **Step 5: Open in Browser**

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📋 **Available Frontend Commands**

### **Development**
```powershell
npm run dev          # Start development server (port 3000)
```

### **Build for Production**
```powershell
npm run build        # Build for production
npm run preview      # Preview production build
```

### **Testing**
```powershell
npm test             # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run end-to-end tests
```

### **Linting**
```powershell
npm run lint         # Check code quality
```

---

## 🔧 **Configuration**

### **Frontend Port**
- Default: `3000`
- Configured in: `vite.config.ts`

### **API Proxy**
The frontend automatically proxies `/api` requests to `http://localhost:8080`:
- Frontend: `http://localhost:3000/api/...`
- Proxied to: `http://localhost:8080/api/...`

### **WebSocket**
- WebSocket connections go to: `ws://localhost:8080/ws/...`

---

## 🐛 **Troubleshooting**

### **Issue 1: Port 3000 Already in Use**

**Error:**
```
Port 3000 is in use, trying another one...
```

**Solution:**
1. Kill the process using port 3000:
   ```powershell
   # Find process
   netstat -ano | findstr :3000
   # Kill process (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```

2. Or change port in `vite.config.ts`:
   ```typescript
   server: {
     port: 3001,  // Change to different port
   }
   ```

### **Issue 2: Module Not Found Errors**

**Error:**
```
Cannot find module '...'
```

**Solution:**
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### **Issue 3: API Connection Errors**

**Error:**
```
Network Error
Failed to fetch
```

**Solution:**
1. **Verify backend is running:**
   ```powershell
   # In another terminal
   curl http://localhost:8080/api/auth/login
   ```

2. **Check CORS configuration** in backend `SecurityConfig.java`

3. **Verify API URL** in `.env` file:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

### **Issue 4: npm install Fails**

**Error:**
```
npm ERR! ...
```

**Solution:**
1. Clear npm cache:
   ```powershell
   npm cache clean --force
   ```

2. Delete `node_modules` and `package-lock.json`, then reinstall:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   ```

3. If still failing, try:
   ```powershell
   npm install --legacy-peer-deps
   ```

---

## ✅ **Verification Checklist**

After starting the frontend:

1. ✅ **Frontend server starts** (no errors in terminal)
2. ✅ **Browser opens** `http://localhost:3000`
3. ✅ **Login page loads** (or redirects to login)
4. ✅ **Can register a new user**
5. ✅ **Can login with credentials**
6. ✅ **Dashboard loads** after login

---

## 🎯 **Quick Start (All Steps)**

```powershell
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies (first time only)
npm install

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:3000
```

---

## 📝 **Project Structure**

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── hooks/         # Custom React hooks
│   ├── store/         # State management (Zustand)
│   └── utils/         # Utility functions
├── package.json       # Dependencies and scripts
├── vite.config.ts    # Vite configuration
└── .env              # Environment variables (optional)
```

---

## 🔗 **Related Files**

- **Backend API**: `http://localhost:8080`
- **Frontend Dev**: `http://localhost:3000`
- **API Service**: `frontend/src/services/api.ts`
- **Vite Config**: `frontend/vite.config.ts`

---

## 💡 **Tips**

1. **Hot Reload**: Changes to frontend code automatically refresh the browser
2. **Browser DevTools**: Press `F12` to open developer tools for debugging
3. **Network Tab**: Check Network tab in DevTools to see API requests
4. **Console**: Check Console tab for any JavaScript errors

---

**That's it! Your frontend should now be running.** 🎉

