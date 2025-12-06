# Quick Start - Frontend

## 🚀 **3 Simple Steps**

### 1. Navigate to Frontend
```powershell
cd frontend
```

### 2. Install Dependencies (First Time Only)
```powershell
npm install
```

### 3. Start Development Server
```powershell
npm run dev
```

### 4. Open Browser
```
http://localhost:3000
```

---

## ✅ **That's It!**

The frontend will:
- Start on port `3000`
- Automatically connect to backend on port `8080`
- Hot reload when you make changes

---

## 🐛 **If Something Goes Wrong**

### Port 3000 in use?
```powershell
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module errors?
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Backend not connecting?
- Make sure backend is running on port 8080
- Check `http://localhost:8080` in browser

---

**Need more details?** See `HOW_TO_RUN_FRONTEND.md`


