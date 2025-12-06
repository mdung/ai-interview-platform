# Anti-Cheat and Interruption Handling

## Overview

This document explains how the AI Interview Platform handles cheating attempts and interruptions during AI speech in voice interviews.

## Cheating Scenarios and Detection

### 1. Common Cheating Methods

#### A. Using AI to Generate Answers
**Scenario**: Candidate copies question and pastes into ChatGPT/Claude, then copies answer back.

**Detection Methods:**
- **Pattern Detection**: Look for AI-like language patterns
- **Response Time Analysis**: Suspiciously fast or perfect answers
- **Language Style Analysis**: Inconsistent writing style
- **Generic Phrase Detection**: Overuse of generic AI phrases

**Implementation:**
```java
// backend/src/main/java/com/aiinterview/service/AntiCheatService.java
- Detects AI language patterns: "as an AI", "I'm an AI", etc.
- Checks for generic phrases: "it depends", "generally speaking"
- Analyzes answer length (too short or too long)
- Monitors response time delays
```

#### B. Tab Switching / Browser Focus Loss
**Scenario**: Candidate switches tabs to search for answers.

**Detection Methods:**
- **Page Visibility API**: Detect when user switches tabs
- **Focus Events**: Monitor window focus/blur
- **Time Tracking**: Track time between question and answer
- **Activity Monitoring**: Monitor mouse/keyboard activity

**Frontend Implementation:**
```typescript
// Detects tab switching
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // User switched tabs
    reportSuspiciousActivity('TAB_SWITCH')
  }
})

// Detects window focus loss
window.addEventListener('blur', () => {
  reportSuspiciousActivity('WINDOW_BLUR')
})
```

#### C. Copy-Paste Detection
**Scenario**: Candidate copies text from external sources.

**Detection Methods:**
- **Clipboard Events**: Monitor paste events
- **Keyboard Shortcuts**: Detect Ctrl+C, Ctrl+V
- **Text Analysis**: Detect formatting inconsistencies
- **Typing Speed**: Unusually fast typing

**Frontend Implementation:**
```typescript
// Detect paste events
textarea.addEventListener('paste', (e) => {
  reportSuspiciousActivity('PASTE_DETECTED')
  // Mark answer as potentially copied
})
```

#### D. Multiple Device Usage
**Scenario**: Candidate uses phone/tablet to search while on computer.

**Detection Methods:**
- **IP Address Monitoring**: Multiple connections from same IP
- **Device Fingerprinting**: Track device characteristics
- **Session Monitoring**: Monitor active sessions per user
- **Network Analysis**: Detect multiple devices on same network

#### E. Pre-written Answers
**Scenario**: Candidate has answers prepared in advance.

**Detection Methods:**
- **Response Time**: Too fast to be natural
- **Answer Quality**: Perfect answers without thinking time
- **Pattern Matching**: Answers match template too closely
- **Follow-up Questions**: AI asks follow-ups, candidate struggles

#### F. Voice Interview Cheating
**Scenario**: Candidate reads from script or has someone else answer.

**Detection Methods:**
- **Audio Analysis**: Detect reading patterns (monotone, unnatural pauses)
- **Background Noise**: Detect multiple voices
- **Voice Consistency**: Compare voice characteristics across answers
- **Response Patterns**: Detect scripted responses

### 2. Interruption Handling

#### A. Interrupting AI Speech (Voice Mode)
**Scenario**: Candidate interrupts AI while it's speaking.

**Handling:**
1. **Detect Interruption**: Monitor audio input during AI speech
2. **Pause AI Speech**: Stop TTS playback immediately
3. **Record Interruption**: Log interruption event
4. **Handle Gracefully**: Allow candidate to speak, then resume or re-ask question

**Implementation Flow:**
```
AI Speaking → Candidate Starts Talking → 
  → Detect Audio Input → 
  → Pause AI Speech → 
  → Record Interruption → 
  → Allow Candidate to Continue → 
  → Resume or Re-ask Question
```

#### B. Multiple Interruptions
**Scenario**: Candidate repeatedly interrupts AI.

**Handling:**
1. **Count Interruptions**: Track number of interruptions
2. **Warn Candidate**: Show warning after 2-3 interruptions
3. **Penalize Score**: Reduce communication score
4. **Flag for Review**: Mark session for manual review

## Implementation Details

### Backend Anti-Cheat Service

```java
// backend/src/main/java/com/aiinterview/service/AntiCheatService.java

@Service
public class AntiCheatService {
    
    // Detects AI-generated language
    public AntiCheatResult analyzeAnswer(String answer, ...) {
        // Check for AI patterns
        // Check answer length
        // Check response time
        // Check for generic phrases
    }
    
    // Detects suspicious activity
    public void reportSuspiciousActivity(String sessionId, String activityType, Map<String, Object> metadata) {
        // Log suspicious activity
        // Update session flags
        // Notify administrators
    }
}
```

### Frontend Anti-Cheat Monitoring

```typescript
// frontend/src/pages/CandidateInterview.tsx

// Tab switching detection
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      reportSuspiciousActivity('TAB_SWITCH', {
        timestamp: new Date(),
        sessionId: sessionId
      })
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
}, [])

// Window focus detection
useEffect(() => {
  const handleBlur = () => {
    reportSuspiciousActivity('WINDOW_BLUR', {
      timestamp: new Date()
    })
  }
  
  window.addEventListener('blur', handleBlur)
  return () => window.removeEventListener('blur', handleBlur)
}, [])

// Copy-paste detection
const handlePaste = (e: ClipboardEvent) => {
  reportSuspiciousActivity('PASTE_DETECTED', {
    timestamp: new Date(),
    textLength: e.clipboardData?.getData('text').length
  })
}

// Keyboard shortcut detection
const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v')) {
    reportSuspiciousActivity('COPY_PASTE_DETECTED', {
      action: e.key === 'c' ? 'COPY' : 'PASTE'
    })
  }
}
```

### Interruption Detection (Voice Mode)

```typescript
// frontend/src/pages/CandidateInterview.tsx

const [aiSpeaking, setAiSpeaking] = useState(false)
const [interruptionCount, setInterruptionCount] = useState(0)

// Monitor audio input during AI speech
useEffect(() => {
  if (aiSpeaking && isRecording) {
    // Candidate started talking while AI is speaking
    handleInterruption()
  }
}, [aiSpeaking, isRecording])

const handleInterruption = () => {
  // Pause AI speech
  pauseAISpeech()
  
  // Increment interruption count
  setInterruptionCount(prev => {
    const newCount = prev + 1
    
    // Warn after 2 interruptions
    if (newCount === 2) {
      showToast('Please wait for the AI to finish speaking before answering', 'warning')
    }
    
    // Flag for review after 3+ interruptions
    if (newCount >= 3) {
      reportSuspiciousActivity('EXCESSIVE_INTERRUPTIONS', {
        count: newCount
      })
    }
    
    return newCount
  })
  
  // Log interruption
  logInterruption({
    sessionId,
    turnId: currentTurn?.id,
    timestamp: new Date(),
    count: interruptionCount + 1
  })
}
```

## Anti-Cheat Signals and Flags

### Signal Types

1. **AI_LANGUAGE_DETECTED**: Answer contains AI-related phrases
2. **TOO_SHORT**: Answer is suspiciously brief
3. **TOO_LONG**: Answer is unusually long
4. **LONG_DELAY**: Unusually long delay before answering
5. **TAB_SWITCH**: User switched browser tabs
6. **WINDOW_BLUR**: Window lost focus
7. **PASTE_DETECTED**: Paste event detected
8. **COPY_PASTE_DETECTED**: Copy/paste keyboard shortcuts detected
9. **EXCESSIVE_INTERRUPTIONS**: Too many interruptions during AI speech
10. **SUSPICIOUS_RESPONSE_TIME**: Answer submitted too quickly
11. **MULTIPLE_DEVICES**: Multiple devices detected
12. **VOICE_INCONSISTENCY**: Voice characteristics changed

### Flagging System

```java
// InterviewTurn model includes:
private Boolean hasAntiCheatSignal = false;
private String antiCheatDetails; // JSON string with signals

// Example antiCheatDetails:
{
  "signals": [
    {"type": "TAB_SWITCH", "timestamp": "2024-01-01T10:00:00"},
    {"type": "PASTE_DETECTED", "timestamp": "2024-01-01T10:01:00"}
  ],
  "score": 0.3, // Risk score (0-1)
  "requiresReview": true
}
```

## Handling Strategies

### 1. Real-Time Monitoring

**Frontend:**
- Continuously monitor user behavior
- Send suspicious activity events to backend
- Display warnings to candidate
- Track interruption count

**Backend:**
- Receive and log suspicious activities
- Calculate risk score
- Update session flags
- Store in database for review

### 2. Scoring Impact

**Communication Score Reduction:**
```java
// Reduce communication score based on interruptions
if (interruptionCount >= 3) {
  communicationScore *= 0.8; // 20% reduction
}

// Reduce score based on anti-cheat signals
if (hasAntiCheatSignal) {
  double riskScore = calculateRiskScore(antiCheatDetails);
  communicationScore *= (1 - riskScore * 0.3); // Up to 30% reduction
}
```

### 3. Review Flags

**Automatic Flagging:**
- Multiple signals (3+)
- High risk score (>0.7)
- Excessive interruptions (5+)
- Multiple tab switches (10+)

**Manual Review:**
- Flagged sessions appear in admin panel
- Recruiters can review and override scores
- Detailed activity log available

### 4. Candidate Warnings

**Progressive Warnings:**
1. **First Tab Switch**: Silent logging
2. **2-3 Tab Switches**: Warning message
3. **4-5 Tab Switches**: Strong warning + score impact
4. **6+ Tab Switches**: Session flagged for review

**Interruption Warnings:**
1. **First Interruption**: Silent logging
2. **Second Interruption**: "Please wait for the AI to finish"
3. **Third Interruption**: "Excessive interruptions may affect your score"
4. **Fourth+ Interruption**: Session flagged

## Implementation in Code

### Backend: Enhanced Anti-Cheat Service

```java
@Service
@RequiredArgsConstructor
public class AntiCheatService {
    
    private final InterviewSessionRepository sessionRepository;
    private final InterviewTurnRepository turnRepository;
    
    public AntiCheatResult analyzeAnswer(
        String answer, 
        LocalDateTime questionTime, 
        LocalDateTime answerTime,
        Map<String, Object> activityLog
    ) {
        AntiCheatResult result = new AntiCheatResult();
        
        // 1. AI Language Detection
        if (containsAILanguage(answer)) {
            result.addSignal("AI_LANGUAGE_DETECTED", "Answer contains AI-related language");
        }
        
        // 2. Answer Length Analysis
        if (answer.length() < 20) {
            result.addSignal("TOO_SHORT", "Answer is too brief");
        } else if (answer.length() > 5000) {
            result.addSignal("TOO_LONG", "Answer is unusually long");
        }
        
        // 3. Response Time Analysis
        if (questionTime != null && answerTime != null) {
            long delay = Duration.between(questionTime, answerTime).toMillis();
            if (delay < 2000) { // Less than 2 seconds
                result.addSignal("SUSPICIOUS_RESPONSE_TIME", "Answer submitted too quickly");
            } else if (delay > 300000) { // More than 5 minutes
                result.addSignal("LONG_DELAY", "Unusually long delay");
            }
        }
        
        // 4. Activity Log Analysis
        if (activityLog != null) {
            int tabSwitches = (Integer) activityLog.getOrDefault("tabSwitches", 0);
            if (tabSwitches > 5) {
                result.addSignal("EXCESSIVE_TAB_SWITCHES", "Multiple tab switches detected");
            }
            
            boolean pasteDetected = (Boolean) activityLog.getOrDefault("pasteDetected", false);
            if (pasteDetected) {
                result.addSignal("PASTE_DETECTED", "Paste operation detected");
            }
        }
        
        // 5. Calculate Risk Score
        result.setRiskScore(calculateRiskScore(result.getSignals()));
        result.setRequiresReview(result.getRiskScore() > 0.7 || result.getSignals().size() >= 3);
        
        return result;
    }
    
    private boolean containsAILanguage(String answer) {
        String[] aiPatterns = {
            "as an ai", "i am an ai", "i'm an ai",
            "artificial intelligence", "machine learning model",
            "as a language model", "i cannot", "i don't have"
        };
        
        String lowerAnswer = answer.toLowerCase();
        for (String pattern : aiPatterns) {
            if (lowerAnswer.contains(pattern)) {
                return true;
            }
        }
        return false;
    }
    
    private double calculateRiskScore(List<AntiCheatSignal> signals) {
        double score = 0.0;
        for (AntiCheatSignal signal : signals) {
            switch (signal.getType()) {
                case "AI_LANGUAGE_DETECTED":
                    score += 0.4;
                    break;
                case "PASTE_DETECTED":
                    score += 0.3;
                    break;
                case "EXCESSIVE_TAB_SWITCHES":
                    score += 0.2;
                    break;
                case "SUSPICIOUS_RESPONSE_TIME":
                    score += 0.2;
                    break;
                default:
                    score += 0.1;
            }
        }
        return Math.min(score, 1.0);
    }
    
    @Transactional
    public void reportSuspiciousActivity(String sessionId, String activityType, Map<String, Object> metadata) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        
        // Update session flags
        if (session.getAntiCheatFlags() == null) {
            session.setAntiCheatFlags(new HashMap<>());
        }
        
        session.getAntiCheatFlags().put(activityType, metadata);
        session.setRequiresReview(true);
        
        sessionRepository.save(session);
        
        // Log for admin review
        log.warn("Suspicious activity detected in session {}: {}", sessionId, activityType);
    }
}
```

### Frontend: Activity Monitoring

```typescript
// frontend/src/pages/CandidateInterview.tsx

interface SuspiciousActivity {
  type: string
  timestamp: Date
  metadata?: Record<string, any>
}

const [activityLog, setActivityLog] = useState<SuspiciousActivity[]>([])
const [tabSwitchCount, setTabSwitchCount] = useState(0)
const [interruptionCount, setInterruptionCount] = useState(0)

// Tab switching detection
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      const newCount = tabSwitchCount + 1
      setTabSwitchCount(newCount)
      
      const activity: SuspiciousActivity = {
        type: 'TAB_SWITCH',
        timestamp: new Date(),
        metadata: { count: newCount }
      }
      
      addActivity(activity)
      
      // Warn after 2 switches
      if (newCount === 2) {
        showToast('Please stay on this page during the interview', 'warning')
      }
      
      // Strong warning after 5 switches
      if (newCount === 5) {
        showToast('Excessive tab switching detected. This may affect your score.', 'error')
      }
      
      // Report to backend
      reportActivityToBackend(activity)
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
}, [tabSwitchCount])

// Window focus detection
useEffect(() => {
  const handleBlur = () => {
    const activity: SuspiciousActivity = {
      type: 'WINDOW_BLUR',
      timestamp: new Date()
    }
    addActivity(activity)
    reportActivityToBackend(activity)
  }
  
  window.addEventListener('blur', handleBlur)
  return () => window.removeEventListener('blur', handleBlur)
}, [])

// Copy-paste detection
const handlePaste = (e: ClipboardEvent) => {
  const activity: SuspiciousActivity = {
    type: 'PASTE_DETECTED',
    timestamp: new Date(),
    metadata: {
      textLength: e.clipboardData?.getData('text').length || 0
    }
  }
  
  addActivity(activity)
  showToast('Copy-paste detected. Please type your own answers.', 'warning')
  reportActivityToBackend(activity)
}

// Keyboard shortcut detection
const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v')) {
    const activity: SuspiciousActivity = {
      type: 'COPY_PASTE_DETECTED',
      timestamp: new Date(),
      metadata: {
        action: e.key === 'c' ? 'COPY' : 'PASTE'
      }
    }
    
    addActivity(activity)
    reportActivityToBackend(activity)
  }
}

// Interruption detection (voice mode)
const handleInterruption = () => {
  if (!aiSpeaking) return
  
  const newCount = interruptionCount + 1
  setInterruptionCount(newCount)
  
  // Pause AI speech
  pauseAISpeech()
  
  const activity: SuspiciousActivity = {
    type: 'INTERRUPTION',
    timestamp: new Date(),
    metadata: { count: newCount }
  }
  
  addActivity(activity)
  
  // Progressive warnings
  if (newCount === 1) {
    // Silent logging
  } else if (newCount === 2) {
    showToast('Please wait for the AI to finish speaking', 'info')
  } else if (newCount === 3) {
    showToast('Excessive interruptions may affect your communication score', 'warning')
  } else if (newCount >= 4) {
    showToast('Multiple interruptions detected. Session may be flagged for review.', 'error')
  }
  
  reportActivityToBackend(activity)
}

// Report activity to backend
const reportActivityToBackend = async (activity: SuspiciousActivity) => {
  try {
    await interviewApi.reportSuspiciousActivity(sessionId!, {
      type: activity.type,
      timestamp: activity.timestamp.toISOString(),
      metadata: activity.metadata
    })
  } catch (error) {
    console.error('Failed to report activity:', error)
  }
}

// Monitor AI speech state
const [aiSpeaking, setAiSpeaking] = useState(false)

// When AI starts speaking
const startAISpeech = () => {
  setAiSpeaking(true)
  
  // Monitor for interruptions
  if (mode === 'voice' && isRecording) {
    handleInterruption()
  }
}

// When AI finishes speaking
const stopAISpeech = () => {
  setAiSpeaking(false)
}

// Include activity log when submitting answer
const submitAnswer = async () => {
  const answerData = {
    answer: answer,
    activityLog: {
      tabSwitches: tabSwitchCount,
      interruptions: interruptionCount,
      pasteDetected: activityLog.some(a => a.type === 'PASTE_DETECTED'),
      activities: activityLog
    }
  }
  
  // Submit with activity log
  await interviewApi.submitAnswer(sessionId!, turnId, answerData)
}
```

### Backend: Activity Reporting Endpoint

```java
// backend/src/main/java/com/aiinterview/controller/InterviewSessionController.java

@PostMapping("/sessions/{sessionId}/report-activity")
public ResponseEntity<Void> reportSuspiciousActivity(
        @PathVariable String sessionId,
        @RequestBody SuspiciousActivityRequest request) {
    
    antiCheatService.reportSuspiciousActivity(
        sessionId,
        request.getActivityType(),
        request.getMetadata()
    );
    
    return ResponseEntity.ok().build();
}
```

## Scoring Impact

### Communication Score Reduction

```java
// Calculate final score with anti-cheat penalties
double baseScore = calculateBaseScore(answer);
double riskScore = antiCheatResult.getRiskScore();

// Reduce score based on risk
double finalScore = baseScore * (1 - riskScore * 0.3); // Up to 30% reduction

// Additional penalty for interruptions
if (interruptionCount >= 3) {
  finalScore *= 0.9; // 10% additional reduction
}
```

## Admin Review Interface

```typescript
// frontend/src/pages/AdminReview.tsx

// Display flagged sessions
const FlaggedSessions = () => {
  return (
    <div>
      {flaggedSessions.map(session => (
        <SessionCard>
          <h3>Session {session.sessionId}</h3>
          <div>Risk Score: {session.riskScore}</div>
          <div>Signals: {session.signals.join(', ')}</div>
          <ActivityLog activities={session.activities} />
          <button onClick={() => overrideScore(session.id)}>
            Override Score
          </button>
        </SessionCard>
      ))}
    </div>
  )
}
```

## Summary

### Cheating Detection:
1. ✅ AI language pattern detection
2. ✅ Tab switching monitoring
3. ✅ Copy-paste detection
4. ✅ Response time analysis
5. ✅ Activity logging
6. ✅ Risk score calculation

### Interruption Handling:
1. ✅ Real-time interruption detection
2. ✅ Progressive warnings
3. ✅ AI speech pausing
4. ✅ Interruption counting
5. ✅ Score impact
6. ✅ Session flagging

### Response Actions:
1. ✅ Real-time warnings to candidate
2. ✅ Score reduction based on risk
3. ✅ Session flagging for review
4. ✅ Activity logging for admins
5. ✅ Manual review capability

The system provides comprehensive anti-cheat protection while maintaining a fair interview experience.

