package com.aiinterview.service;

import com.aiinterview.dto.CreateInterviewSessionRequest;
import com.aiinterview.dto.InterviewSessionResponse;
import com.aiinterview.model.Candidate;
import com.aiinterview.model.InterviewSession;
import com.aiinterview.model.InterviewTemplate;
import com.aiinterview.repository.CandidateRepository;
import com.aiinterview.repository.InterviewSessionRepository;
import com.aiinterview.repository.InterviewTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InterviewSessionService {
    
    private final InterviewSessionRepository sessionRepository;
    private final CandidateRepository candidateRepository;
    private final InterviewTemplateRepository templateRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Transactional
    public InterviewSessionResponse createSession(CreateInterviewSessionRequest request) {
        Candidate candidate = candidateRepository.findById(request.getCandidateId())
            .orElseThrow(() -> new RuntimeException("Candidate not found"));
        
        InterviewTemplate template = templateRepository.findById(request.getTemplateId())
            .orElseThrow(() -> new RuntimeException("Template not found"));
        
        String sessionId = UUID.randomUUID().toString();
        
        InterviewSession session = InterviewSession.builder()
            .sessionId(sessionId)
            .candidate(candidate)
            .template(template)
            .status(InterviewSession.SessionStatus.PENDING)
            .language(request.getLanguage())
            .startedAt(LocalDateTime.now())
            .totalTurns(0)
            .build();
        
        session = sessionRepository.save(session);
        
        // Store session state in Redis
        Map<String, Object> sessionState = new HashMap<>();
        sessionState.put("sessionId", sessionId);
        sessionState.put("status", "PENDING");
        sessionState.put("currentQuestion", null);
        sessionState.put("conversationHistory", new java.util.ArrayList<>());
        redisTemplate.opsForValue().set("session:" + sessionId, sessionState);
        
        return mapToResponse(session);
    }
    
    public InterviewSessionResponse getSessionBySessionId(String sessionId) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        return mapToResponse(session);
    }
    
    @Transactional
    public InterviewSessionResponse updateSessionStatus(String sessionId, InterviewSession.SessionStatus status) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setStatus(status);
        if (status == InterviewSession.SessionStatus.COMPLETED) {
            session.setCompletedAt(LocalDateTime.now());
        }
        
        session = sessionRepository.save(session);
        return mapToResponse(session);
    }
    
    private InterviewSessionResponse mapToResponse(InterviewSession session) {
        return InterviewSessionResponse.builder()
            .id(session.getId())
            .sessionId(session.getSessionId())
            .candidateId(session.getCandidate().getId())
            .candidateName(session.getCandidate().getFirstName() + " " + session.getCandidate().getLastName())
            .templateId(session.getTemplate().getId())
            .templateName(session.getTemplate().getName())
            .status(session.getStatus())
            .language(session.getLanguage())
            .startedAt(session.getStartedAt())
            .completedAt(session.getCompletedAt())
            .aiSummary(session.getAiSummary())
            .strengths(session.getStrengths())
            .weaknesses(session.getWeaknesses())
            .recommendation(session.getRecommendation())
            .totalTurns(session.getTotalTurns())
            .build();
    }
}

