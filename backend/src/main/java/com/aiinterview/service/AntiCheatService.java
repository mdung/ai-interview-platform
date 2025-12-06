package com.aiinterview.service;

import com.aiinterview.model.InterviewSession;
import com.aiinterview.repository.InterviewSessionRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AntiCheatService {
    
    private final InterviewSessionRepository sessionRepository;
    
    private static final Pattern AI_PATTERN = Pattern.compile(
        "(?i)(as an ai|i am an ai|i'm an ai|artificial intelligence|machine learning model|as a language model|i cannot|i don't have)"
    );
    
    private static final int MIN_ANSWER_LENGTH = 20;
    private static final int MAX_ANSWER_LENGTH = 5000;
    private static final long SUSPICIOUS_DELAY_MS = 10000; // 10 seconds
    private static final long TOO_FAST_MS = 2000; // 2 seconds - too fast to be natural
    
    public AntiCheatResult analyzeAnswer(String answer, LocalDateTime questionTime, LocalDateTime answerTime) {
        return analyzeAnswer(answer, questionTime, answerTime, null);
    }
    
    public AntiCheatResult analyzeAnswer(
        String answer, 
        LocalDateTime questionTime, 
        LocalDateTime answerTime,
        Map<String, Object> activityLog
    ) {
        AntiCheatResult result = new AntiCheatResult();
        
        // Check for AI-like language
        if (AI_PATTERN.matcher(answer).find()) {
            result.addSignal("AI_LANGUAGE_DETECTED", "Answer contains AI-related language");
        }
        
        // Check answer length
        if (answer.length() < MIN_ANSWER_LENGTH) {
            result.addSignal("TOO_SHORT", "Answer is too brief");
        } else if (answer.length() > MAX_ANSWER_LENGTH) {
            result.addSignal("TOO_LONG", "Answer is unusually long");
        }
        
        // Check response time
        if (questionTime != null && answerTime != null) {
            long delay = Duration.between(questionTime, answerTime).toMillis();
            if (delay < TOO_FAST_MS) {
                result.addSignal("SUSPICIOUS_RESPONSE_TIME", "Answer submitted too quickly");
            } else if (delay > SUSPICIOUS_DELAY_MS) {
                result.addSignal("LONG_DELAY", "Unusually long delay before answering");
            }
        }
        
        // Check for generic phrases
        String[] genericPhrases = {
            "it depends", "generally speaking", "in most cases",
            "typically", "usually", "commonly"
        };
        int genericCount = 0;
        String lowerAnswer = answer.toLowerCase();
        for (String phrase : genericPhrases) {
            if (lowerAnswer.contains(phrase)) {
                genericCount++;
            }
        }
        if (genericCount > 3) {
            result.addSignal("TOO_GENERIC", "Answer contains too many generic phrases");
        }
        
        // Check activity log
        if (activityLog != null) {
            Object tabSwitchesObj = activityLog.getOrDefault("tabSwitches", 0);
            Integer tabSwitches = tabSwitchesObj instanceof Integer ? (Integer) tabSwitchesObj : 
                tabSwitchesObj instanceof Number ? ((Number) tabSwitchesObj).intValue() : 0;
            if (tabSwitches > 5) {
                result.addSignal("EXCESSIVE_TAB_SWITCHES", "Multiple tab switches detected: " + tabSwitches);
            }
            
            Object pasteDetectedObj = activityLog.getOrDefault("pasteDetected", false);
            Boolean pasteDetected = pasteDetectedObj instanceof Boolean ? (Boolean) pasteDetectedObj : false;
            if (pasteDetected) {
                result.addSignal("PASTE_DETECTED", "Paste operation detected");
            }
            
            Object interruptionsObj = activityLog.getOrDefault("interruptions", 0);
            Integer interruptions = interruptionsObj instanceof Integer ? (Integer) interruptionsObj :
                interruptionsObj instanceof Number ? ((Number) interruptionsObj).intValue() : 0;
            if (interruptions >= 3) {
                result.addSignal("EXCESSIVE_INTERRUPTIONS", "Excessive interruptions: " + interruptions);
            }
        }
        
        // Calculate risk score
        double riskScore = calculateRiskScore(result);
        result.setRiskScore(riskScore);
        
        // Count signals from details string (split by ";")
        int signalCount = result.getDetails().isEmpty() ? 0 : result.getDetails().split(";").length;
        result.setRequiresReview(riskScore > 0.7 || signalCount >= 3);
        
        return result;
    }
    
    private double calculateRiskScore(AntiCheatResult result) {
        double score = 0.0;
        String details = result.getDetails().toLowerCase();
        
        if (details.contains("ai_language_detected")) {
            score += 0.4;
        }
        if (details.contains("paste_detected")) {
            score += 0.3;
        }
        if (details.contains("excessive_tab_switches")) {
            score += 0.2;
        }
        if (details.contains("suspicious_response_time")) {
            score += 0.2;
        }
        if (details.contains("excessive_interruptions")) {
            score += 0.15;
        }
        if (details.contains("too_short") || details.contains("too_long")) {
            score += 0.1;
        }
        if (details.contains("long_delay")) {
            score += 0.1;
        }
        if (details.contains("too_generic")) {
            score += 0.1;
        }
        
        return Math.min(score, 1.0);
    }
    
    @Transactional
    public void reportSuspiciousActivity(String sessionId, String activityType, Map<String, Object> metadata) {
        try {
            InterviewSession session = sessionRepository.findBySessionId(sessionId)
                .orElse(null);
            
            if (session != null) {
                log.warn("Suspicious activity detected in session {}: {} - {}", 
                    sessionId, activityType, metadata);
                
                // In a full implementation, you would:
                // 1. Store activity in a separate ActivityLog table
                // 2. Update session flags
                // 3. Mark session for review if threshold exceeded
            }
        } catch (Exception e) {
            log.error("Error reporting suspicious activity", e);
        }
    }
    
    public static class AntiCheatResult {
        private boolean hasSignals = false;
        private StringBuilder details = new StringBuilder();
        private double riskScore = 0.0;
        private boolean requiresReview = false;
        
        public void addSignal(String type, String message) {
            hasSignals = true;
            if (details.length() > 0) {
                details.append("; ");
            }
            details.append(type).append(": ").append(message);
        }
        
        public boolean hasSignals() {
            return hasSignals;
        }
        
        public String getDetails() {
            return details.toString();
        }
        
        public void setRiskScore(double riskScore) {
            this.riskScore = riskScore;
        }
        
        public double getRiskScore() {
            return riskScore;
        }
        
        public void setRequiresReview(boolean requiresReview) {
            this.requiresReview = requiresReview;
        }
        
        public boolean isRequiresReview() {
            return requiresReview;
        }
    }
}

