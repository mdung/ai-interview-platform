# How to Create Session and Candidate Interview Guide

## 📋 **Complete Workflow**

### **Step 1: Create a Candidate** 👤

#### **Option A: Via Frontend UI**

1. **Navigate to Candidates Page**
   - Go to: `http://localhost:3000/recruiter`
   - Click on **"Candidates"** button in the header

2. **Click "Add Candidate" or "Create New"**
   - You'll see a form to create a new candidate

3. **Fill in Candidate Information**
   ```
   - Email: candidate@example.com
   - First Name: John
   - Last Name: Doe
   - Phone Number: +1234567890 (optional)
   - LinkedIn URL: https://linkedin.com/in/johndoe (optional)
   ```

4. **Upload Resume (Optional)**
   - Click "Upload Resume"
   - Select a PDF file
   - Wait for upload to complete

5. **Click "Save" or "Create Candidate"**
   - Candidate will be created and saved
   - You'll see a success message

#### **Option B: Via API (PowerShell)**

```powershell
$body = @{
    email = "candidate@example.com"
    firstName = "John"
    lastName = "Doe"
    phoneNumber = "+1234567890"
    linkedInUrl = "https://linkedin.com/in/johndoe"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/recruiter/candidates" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

**Note:** Save the `id` from the response - you'll need it for creating the session.

---

### **Step 2: Create an Interview Template** 📝

**Before creating a session, you need an interview template.**

1. **Navigate to Templates Page**
   - Click on **"Templates"** button in the header

2. **Click "Create Template" or "New Template"**

3. **Fill in Template Details**
   ```
   - Name: Software Engineer Interview
   - Description: Technical interview for software engineers
   - Mode: Technical / Behavioral / Mixed
   - Estimated Duration: 30 minutes
   ```

4. **Add Questions**
   - Add interview questions
   - Set question order
   - Configure question types

5. **Save Template**
   - Click "Save" or "Create Template"
   - Note the Template ID

---

### **Step 3: Create an Interview Session** 🎯

#### **Option A: Via Frontend UI**

1. **Navigate to Create Session Page**
   - Click **"Create Session"** button in the header
   - Or go to: `http://localhost:3000/recruiter/sessions/new`

2. **Select Candidate**
   - Choose a candidate from the dropdown
   - Or if you came from candidate details page, it will be pre-selected

3. **Select Template**
   - Choose an interview template from the dropdown

4. **Configure Session Settings**
   ```
   - Language: English (or other supported language)
   - Schedule Mode: 
     * Immediate: Start interview now
     * Scheduled: Set date and time for later
   ```

5. **If Scheduling:**
   - Select **"Schedule for Later"**
   - Choose Date: `mm/dd/yyyy`
   - Choose Time: `hh:mm`
   - The interview will be scheduled for that time

6. **Click "Create Session"**
   - Session will be created
   - You'll get a **Session ID** (save this!)
   - You'll see a success message

#### **Option B: Via API (PowerShell)**

```powershell
$body = @{
    candidateId = 1  # Replace with actual candidate ID
    templateId = 1   # Replace with actual template ID
    language = "en"
    # Optional: scheduledAt = "2025-12-10T14:00:00Z"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN"
    "Content-Type" = "application/json"
}

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/interviews/sessions" `
    -Method Post `
    -Headers $headers `
    -Body $body

# Save the sessionId
$sessionId = $response.sessionId
Write-Host "Session ID: $sessionId"
```

---

### **Step 4: Get Interview Link for Candidate** 🔗

After creating a session, you need to provide the candidate with an interview link.

#### **Option A: From Frontend**

1. **After Creating Session:**
   - The system will show you the session details
   - Look for **"Interview Link"** or **"Share Link"** button

2. **Copy the Interview Link:**
   ```
   http://localhost:3000/interview/{SESSION_ID}
   ```
   Example: `http://localhost:3000/interview/abc123xyz`

3. **Send Link to Candidate:**
   - Email the link to the candidate
   - Or use the "Send Link" feature if available

#### **Option B: Manual Link Construction**

The interview link format is:
```
http://localhost:3000/interview/{SESSION_ID}
```

Replace `{SESSION_ID}` with the actual session ID from Step 3.

#### **Option C: Via API - Send Link**

```powershell
$sessionId = "abc123xyz"  # Replace with actual session ID

$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/interviews/sessions/$sessionId/send-link" `
    -Method Post `
    -Headers $headers
```

This will send an email to the candidate with the interview link (if email service is configured).

---

### **Step 5: Candidate Joins and Does Interview** 🎤

#### **For the Candidate:**

1. **Open the Interview Link**
   - Candidate receives the link via email or directly
   - Opens: `http://localhost:3000/candidate/interview/{SESSION_ID}`
   - The page will automatically load the interview session

2. **Interview Instructions**
   - Candidate sees pre-interview instructions
   - Can read tips and guidelines
   - Can test microphone (if voice mode)

3. **Start Interview**
   - Click **"I Understand, Start Interview"**
   - Interview begins automatically

4. **Answer Questions**
   - **Text Mode:**
     * Type answers in the text area
     * Click "Send Answer" or press `Ctrl+Enter`
     * Answers are auto-saved as drafts
   
   - **Voice Mode:**
     * Click "Start Recording"
     * Speak your answer
     * Click "Stop Recording" when done
     * Audio is sent automatically

5. **Interview Features:**
   - **Timer**: Shows elapsed time
   - **Progress Bar**: Shows interview progress
   - **Question Counter**: Shows current question number
   - **Review Answers**: Can review previous answers
   - **Save Draft**: Answers auto-save every 30 seconds
   - **Connection Status**: Shows network quality

6. **Complete Interview**
   - Answer all questions
   - Interview ends automatically
   - Candidate sees evaluation summary
   - Can provide feedback

---

## 🔄 **Complete Example Workflow**

### **As a Recruiter:**

```powershell
# 1. Login
$loginBody = @{
    email = "recruiter@example.com"
    password = "recruiter123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$token = $loginResponse.token
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

# 2. Create Candidate
$candidateBody = @{
    email = "john.doe@example.com"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

$candidateResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/recruiter/candidates" `
    -Method Post `
    -Headers $headers `
    -Body $candidateBody

$candidateId = $candidateResponse.id
Write-Host "Candidate ID: $candidateId"

# 3. Create Interview Session
$sessionBody = @{
    candidateId = $candidateId
    templateId = 1  # Assuming template ID 1 exists
    language = "en"
} | ConvertTo-Json

$sessionResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/interviews/sessions" `
    -Method Post `
    -Headers $headers `
    -Body $sessionBody

$sessionId = $sessionResponse.sessionId
Write-Host "Session ID: $sessionId"
Write-Host "Interview Link: http://localhost:3000/interview/$sessionId"
```

### **For the Candidate:**

1. **Open the link:** `http://localhost:3000/interview/{SESSION_ID}`
2. **Read instructions**
3. **Start interview**
4. **Answer questions** (text or voice)
5. **Complete interview**
6. **View results**

---

## 📍 **Quick Reference - URLs**

### **Recruiter URLs:**
- Dashboard: `http://localhost:3000/recruiter`
- Create Session: `http://localhost:3000/recruiter/sessions/new`
- All Sessions: `http://localhost:3000/recruiter/sessions`
- Candidates: `http://localhost:3000/recruiter/candidates`
- Templates: `http://localhost:3000/recruiter/templates`
- Jobs: `http://localhost:3000/recruiter/jobs`

### **Candidate URLs:**
- Interview: `http://localhost:3000/interview/{SESSION_ID}`

---

## 🎯 **Step-by-Step Visual Guide**

### **1. Create Candidate (UI)**
```
Recruiter Dashboard → Candidates → Add Candidate
→ Fill Form → Upload Resume (optional) → Save
```

### **2. Create Session (UI)**
```
Recruiter Dashboard → Create Session
→ Select Candidate → Select Template
→ Choose Language → (Optional) Schedule
→ Create Session
```

### **3. Share Link**
```
After Session Created → Copy Interview Link
→ Send to Candidate (Email/Message)
```

### **4. Candidate Interview**
```
Candidate Opens Link → Reads Instructions
→ Starts Interview → Answers Questions
→ Completes Interview → Views Results
```

---

## ⚠️ **Important Notes**

1. **Session ID is Required**
   - Save the session ID after creating
   - It's needed for the candidate interview link

2. **Template Must Exist**
   - Create a template before creating a session
   - Template contains the interview questions

3. **Candidate Must Exist**
   - Create candidate before creating session
   - Candidate email is used for notifications

4. **Interview Link Format**
   - Must be: `/interview/{SESSION_ID}`
   - Session ID is case-sensitive

5. **Scheduled Interviews**
   - If scheduled, candidate can only join at scheduled time
   - Immediate interviews can be joined right away

6. **Session Status**
   - `PENDING`: Created but not started
   - `IN_PROGRESS`: Candidate is doing interview
   - `COMPLETED`: Interview finished
   - `PAUSED`: Temporarily paused
   - `ABANDONED`: Candidate left without completing

---

## 🔍 **Troubleshooting**

### **Issue: Can't Create Session**
- **Check:** Candidate exists and is active
- **Check:** Template exists and has questions
- **Check:** You're logged in as recruiter/admin

### **Issue: Candidate Can't Join**
- **Check:** Session ID is correct
- **Check:** Session status is `PENDING` or `IN_PROGRESS`
- **Check:** If scheduled, check if it's the right time
- **Check:** Session hasn't expired

### **Issue: Interview Not Starting**
- **Check:** WebSocket connection is working
- **Check:** Backend is running
- **Check:** Browser console for errors

---

## ✅ **Checklist**

Before creating a session:
- [ ] Candidate is created
- [ ] Template is created with questions
- [ ] You're logged in as recruiter/admin

After creating a session:
- [ ] Session ID is saved
- [ ] Interview link is generated
- [ ] Link is sent to candidate

For candidate:
- [ ] Has the interview link
- [ ] Browser is compatible
- [ ] Microphone permissions (if voice mode)
- [ ] Stable internet connection

---

**That's it! You now know how to create sessions and have candidates do interviews.** 🎉

