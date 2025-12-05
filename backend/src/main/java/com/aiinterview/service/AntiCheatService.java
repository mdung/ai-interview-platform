package com.aiinterview.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AntiCheatService {
    
    private static final Pattern AI_PATTERN = Pattern.compile(
        "(?i)(as an ai|i am an ai|i'm an ai|artificial intelligence|machine learning model)"
    );
    
    private static final int MIN_ANSWER_LENGTH = 20;
    private static final int MAX_ANSWER_LENGTH = 5000;
    private static final long SUSPICIOUS_DELAY_MS = 10000; // 10 seconds
    
    public AntiCheatResult analyzeAnswer(String answer, LocalDateTime questionTime, LocalDateTime answerTime) {
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
            if (delay > SUSPICIOUS_DELAY_MS) {
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
        
        return result;
    }
    
    public static class AntiCheatResult {
        private boolean hasSignals = false;
        private StringBuilder details = new StringBuilder();
        
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
    }
}

