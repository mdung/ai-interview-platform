# Interview Scenarios and Handling Strategies

## Overview

This document covers all possible scenarios that can occur during an interview session and how the application handles them.

## 🔴 **Critical Scenarios**

### 1. Network Disconnection

**Scenario**: Candidate loses internet connection during interview.

**Detection**:
- WebSocket connection loss
- Failed API requests
- Network status API

**Handling**:
```typescript
// Frontend: Auto-reconnect with exponential backoff
- Detect WebSocket disconnect
- Show "Connection lost" notification
- Auto-save current answer to localStorage
- Attempt reconnection every 5s, 10s, 20s, 40s...
- On reconnect: Sync state with backend
- Resume from last saved position
```

**Implementation**:
- WebSocket reconnection logic
- Offline state detection
- Auto-save on disconnect
- State synchronization on reconnect

### 2. Browser Crash / Tab Closed

**Scenario**: Candidate accidentally closes browser or tab crashes.

**Detection**:
- `beforeunload` event
- `visibilitychange` event
- Session timeout on backend

**Handling**:
```typescript
// Frontend: Save state before unload
window.addEventListener('beforeunload', (e) => {
  // Save current answer
  saveDraft()
  // Save interview state
  saveInterviewState()
})

// Backend: Session recovery
- Store session state in Redis (TTL: 24 hours)
- On reconnect: Check for existing session
- Restore from last saved state
- Allow candidate to resume
```

**Implementation**:
- `beforeunload` handler
- Session state persistence
- Recovery mechanism

### 3. Session Timeout / Expiration

**Scenario**: Interview session expires or times out.

**Detection**:
- JWT token expiration
- Session TTL in Redis
- Last activity timestamp

**Handling**:
```java
// Backend: Session validation
- Check session expiration on each request
- Extend session on activity
- Auto-pause after 30 minutes of inactivity
- Send warning at 25 minutes
```

**Implementation**:
- Token refresh mechanism
- Activity-based session extension
- Auto-pause on timeout

### 4. Multiple Browser Tabs / Windows

**Scenario**: Candidate opens interview in multiple tabs.

**Detection**:
- Multiple WebSocket connections from same session
- Tab count tracking
- Session locking

**Handling**:
```typescript
// Frontend: Single tab enforcement
- Use BroadcastChannel API to detect multiple tabs
- Show warning: "Interview is open in another tab"
- Lock other tabs (read-only)
- Only allow one active tab
```

**Implementation**:
- BroadcastChannel for tab communication
- Session locking mechanism
- Tab conflict resolution

## 🟡 **Important Scenarios**

### 5. Microphone / Camera Failure

**Scenario**: Microphone or camera stops working during voice/video interview.

**Detection**:
- `getUserMedia` errors
- Audio level monitoring
- Device disconnection events

**Handling**:
```typescript
// Frontend: Device monitoring
- Monitor audio levels continuously
- Detect device disconnection
- Show error: "Microphone disconnected"
- Offer to switch to text mode
- Allow device reconnection
- Save partial audio if available
```

**Implementation**:
- Device monitoring
- Fallback to text mode
- Error recovery

### 6. Answer Submission Failure

**Scenario**: Answer fails to submit (network error, server error).

**Detection**:
- API request failure
- WebSocket send failure
- Response timeout

**Handling**:
```typescript
// Frontend: Retry mechanism
- Save answer locally
- Show error notification
- Retry automatically (3 attempts)
- If all fail: Save as draft
- Show "Answer saved offline" message
- Sync when connection restored
```

**Implementation**:
- Retry logic with exponential backoff
- Offline queue
- Sync on reconnect

### 7. Very Long Answer / Timeout

**Scenario**: Candidate takes too long to answer or writes very long answer.

**Detection**:
- Answer length monitoring
- Time since question asked
- Typing inactivity

**Handling**:
```typescript
// Frontend: Timeout warnings
- Show warning at 5 minutes: "Consider submitting your answer"
- Show warning at 10 minutes: "Time limit approaching"
- Auto-save every 30 seconds
- Allow extension if needed
- Prevent answer loss
```

**Implementation**:
- Timeout warnings
- Auto-save mechanism
- Time extension option

### 8. Empty Answer Submission

**Scenario**: Candidate tries to submit empty or very short answer.

**Detection**:
- Answer length validation
- Content analysis

**Handling**:
```typescript
// Frontend: Validation
- Check minimum length (20 characters)
- Show warning: "Answer seems too short"
- Require confirmation
- Suggest adding more detail
```

**Implementation**:
- Client-side validation
- Confirmation dialog
- Helpful suggestions

### 9. Page Refresh / Reload

**Scenario**: Candidate refreshes the page during interview.

**Detection**:
- `beforeunload` event
- Session state check on load

**Handling**:
```typescript
// Frontend: State recovery
- Save state before refresh
- On reload: Check for saved state
- Restore interview state
- Resume from last position
- Show "Welcome back" message
```

**Implementation**:
- State persistence
- Recovery on page load
- Seamless resume

### 10. Browser Minimize / Background

**Scenario**: Candidate minimizes browser or switches to another app.

**Detection**:
- `visibilitychange` event
- `blur` event
- Page visibility API

**Handling**:
```typescript
// Frontend: Activity monitoring
- Detect page hidden
- Log as suspicious activity (already implemented)
- Pause timer (optional)
- Show warning on return
- Continue interview normally
```

**Implementation**:
- Already implemented in anti-cheat
- Optional: Pause timer
- Resume on return

## 🟢 **Edge Cases**

### 11. Audio Upload Failure

**Scenario**: Audio recording fails to upload.

**Detection**:
- File upload error
- Network error during upload
- Storage quota exceeded

**Handling**:
```typescript
// Frontend: Audio handling
- Save audio blob locally
- Retry upload (3 attempts)
- If fails: Convert to text (STT)
- Store text as fallback
- Show notification
```

**Implementation**:
- Audio retry mechanism
- Fallback to text
- Local storage

### 12. Evaluation Failure

**Scenario**: AI evaluation service fails or times out.

**Detection**:
- Python AI service error
- Timeout (30s)
- Service unavailable

**Handling**:
```java
// Backend: Fallback mechanism
- Retry evaluation (2 attempts)
- If fails: Queue for async processing
- Return partial evaluation
- Notify candidate: "Evaluation in progress"
- Complete evaluation later
```

**Implementation**:
- Async evaluation queue
- Partial results
- Background processing

### 13. Question Generation Failure

**Scenario**: AI fails to generate next question.

**Detection**:
- Python AI service error
- Empty response
- Timeout

**Handling**:
```java
// Backend: Fallback questions
- Use template's default questions
- Select from question bank
- Show generic question
- Log error for admin
- Continue interview
```

**Implementation**:
- Question bank fallback
- Default questions
- Error logging

### 14. Storage Quota Exceeded

**Scenario**: Browser localStorage quota exceeded.

**Detection**:
- `QuotaExceededError`
- Storage API errors

**Handling**:
```typescript
// Frontend: Storage management
- Try localStorage first
- If fails: Use sessionStorage
- If fails: Use IndexedDB
- If fails: Send to backend immediately
- Clear old drafts
```

**Implementation**:
- Multi-tier storage
- Automatic cleanup
- Backend fallback

### 15. Token Expiration During Interview

**Scenario**: JWT token expires while interview is in progress.

**Detection**:
- 401 Unauthorized responses
- Token expiry check

**Handling**:
```typescript
// Frontend: Token refresh
- Detect 401 response
- Automatically refresh token
- Retry failed request
- If refresh fails: Pause interview
- Show "Session expired" message
- Allow re-authentication
```

**Implementation**:
- Auto token refresh
- Request retry
- Re-authentication flow

### 16. Concurrent Session Detection

**Scenario**: Candidate tries to start interview from multiple devices.

**Detection**:
- Multiple active sessions
- Different IP addresses
- Device fingerprinting

**Handling**:
```java
// Backend: Session management
- Allow only one active session
- Invalidate previous session
- Notify candidate: "Session started on another device"
- Lock previous session
```

**Implementation**:
- Session locking
- Device tracking
- Conflict resolution

### 17. Malformed Answer / Special Characters

**Scenario**: Answer contains special characters, emojis, or malformed data.

**Detection**:
- Input validation
- Character encoding issues
- Size limits

**Handling**:
```typescript
// Frontend: Input sanitization
- Sanitize input on submit
- Validate encoding (UTF-8)
- Limit size (5000 characters)
- Show warning for special characters
- Preserve formatting where possible
```

**Implementation**:
- Input sanitization
- Encoding validation
- Size limits

### 18. Interview Completion During Disconnection

**Scenario**: Interview completes while candidate is offline.

**Detection**:
- Session status check on reconnect
- Backend completion status

**Handling**:
```typescript
// Frontend: Completion detection
- On reconnect: Check session status
- If completed: Show completion screen
- Display evaluation results
- Allow feedback submission
- Download transcript
```

**Implementation**:
- Status synchronization
- Completion screen
- Result display

### 19. Time Zone Changes

**Scenario**: Candidate travels or system time changes.

**Detection**:
- Time zone mismatch
- Scheduled time validation

**Handling**:
```java
// Backend: Time zone handling
- Store all times in UTC
- Convert for display
- Validate scheduled times
- Handle DST changes
```

**Implementation**:
- UTC storage
- Time zone conversion
- DST handling

### 20. Very Slow Network

**Scenario**: Candidate has very slow internet connection.

**Detection**:
- High latency
- Slow response times
- Connection quality monitoring

**Handling**:
```typescript
// Frontend: Adaptive behavior
- Show connection quality indicator
- Increase timeout values
- Compress data before sending
- Use chunked uploads for audio
- Show "Slow connection" warning
- Allow offline mode
```

**Implementation**:
- Connection quality monitoring
- Adaptive timeouts
- Data compression
- Offline mode

## 🔧 **Implementation Plan**

### Phase 1: Critical Scenarios (Immediate)

1. **Network Disconnection Handling**
   - WebSocket reconnection
   - Auto-save mechanism
   - State synchronization

2. **Browser Crash Recovery**
   - `beforeunload` handler
   - Session state persistence
   - Recovery on reload

3. **Session Timeout**
   - Token refresh
   - Activity-based extension
   - Auto-pause

### Phase 2: Important Scenarios (High Priority)

4. **Multiple Tabs Prevention**
   - BroadcastChannel implementation
   - Session locking

5. **Device Failure Handling**
   - Device monitoring
   - Fallback to text mode

6. **Answer Submission Retry**
   - Retry mechanism
   - Offline queue

### Phase 3: Edge Cases (Nice to Have)

7. **Storage Management**
   - Multi-tier storage
   - Quota handling

8. **Evaluation Fallback**
   - Async queue
   - Partial results

9. **Question Generation Fallback**
   - Question bank
   - Default questions

## 📋 **Monitoring & Alerts**

### Metrics to Track

1. **Connection Issues**
   - Disconnection frequency
   - Reconnection time
   - Failed reconnection attempts

2. **Technical Failures**
   - Device failure rate
   - Upload failure rate
   - Evaluation failure rate

3. **User Behavior**
   - Page refresh rate
   - Multiple tab usage
   - Session abandonment

4. **Performance**
   - Answer submission time
   - Evaluation time
   - Question generation time

### Alerts

- High disconnection rate (>10%)
- Evaluation service down
- Storage quota warnings
- Session timeout spikes

## 🎯 **Best Practices**

1. **Always Save State**: Save interview state frequently
2. **Graceful Degradation**: Provide fallbacks for all features
3. **User Communication**: Always inform user of issues
4. **Recovery Options**: Always allow recovery/resume
5. **Error Logging**: Log all errors for analysis
6. **Testing**: Test all scenarios in staging

## 📝 **Summary**

**Total Scenarios**: 20
- **Critical**: 4 scenarios
- **Important**: 6 scenarios  
- **Edge Cases**: 10 scenarios

**Implementation Priority**:
1. Network disconnection (Critical)
2. Browser crash recovery (Critical)
3. Session timeout (Critical)
4. Multiple tabs (Important)
5. Device failure (Important)
6. Answer submission retry (Important)
7. Others (Edge cases)

All scenarios have defined handling strategies and can be implemented incrementally.



