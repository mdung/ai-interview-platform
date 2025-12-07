package com.aiinterview.service;

import com.aiinterview.dto.*;
import com.aiinterview.model.Candidate;
import com.aiinterview.model.InterviewSession;
import com.aiinterview.model.InterviewTemplate;
import com.aiinterview.repository.CandidateRepository;
import com.aiinterview.repository.InterviewSessionRepository;
import com.aiinterview.repository.InterviewTemplateRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.annotation.Lazy;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewSessionService {
    
    private final InterviewSessionRepository sessionRepository;
    private final CandidateRepository candidateRepository;
    private final InterviewTemplateRepository templateRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    @org.springframework.context.annotation.Lazy
    private final WebSocketService webSocketService;
    
    @Transactional
    public InterviewSessionResponse createSession(CreateInterviewSessionRequest request) {
        Candidate candidate = candidateRepository.findById(request.getCandidateId())
            .orElseThrow(() -> new RuntimeException("Candidate not found"));
        
        InterviewTemplate template = templateRepository.findById(request.getTemplateId())
            .orElseThrow(() -> new RuntimeException("Template not found"));
        
        String sessionId = UUID.randomUUID().toString();
        
        InterviewSession.SessionStatus initialStatus = request.getScheduledAt() != null && 
            request.getScheduledAt().isAfter(LocalDateTime.now())
            ? InterviewSession.SessionStatus.PENDING
            : InterviewSession.SessionStatus.PENDING;
        
        InterviewSession session = InterviewSession.builder()
            .sessionId(sessionId)
            .candidate(candidate)
            .template(template)
            .status(initialStatus)
            .language(request.getLanguage())
            .startedAt(request.getScheduledAt() != null && request.getScheduledAt().isAfter(LocalDateTime.now()) 
                ? request.getScheduledAt() 
                : LocalDateTime.now())
            .scheduledAt(request.getScheduledAt())
            .totalTurns(0)
            .build();
        
        session = sessionRepository.save(session);
        
        // Store session state in Redis (optional - don't fail if Redis is unavailable)
        try {
            Map<String, Object> sessionState = new HashMap<>();
            sessionState.put("sessionId", sessionId);
            sessionState.put("status", "PENDING");
            sessionState.put("currentQuestion", null);
            sessionState.put("conversationHistory", new java.util.ArrayList<>());
            redisTemplate.opsForValue().set("session:" + sessionId, sessionState);
        } catch (Exception e) {
            // Log but don't fail if Redis is unavailable
            System.err.println("Failed to store session in Redis: " + e.getMessage());
        }
        
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
        InterviewSessionResponse response = mapToResponse(session);
        
        // Broadcast session update via WebSocket
        try {
            webSocketService.broadcastSessionUpdate(sessionId, response);
        } catch (Exception e) {
            // Log but don't fail if WebSocket is unavailable
            System.err.println("Failed to broadcast session update: " + e.getMessage());
        }
        
        return response;
    }
    
    public SessionListResponse getAllSessions(
            InterviewSession.SessionStatus status,
            Long candidateId,
            Long templateId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            int page,
            int size,
            String sortBy,
            String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Build dynamic query using Specification
        Specification<InterviewSession> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            
            if (candidateId != null) {
                predicates.add(cb.equal(root.get("candidate").get("id"), candidateId));
            }
            
            if (templateId != null) {
                predicates.add(cb.equal(root.get("template").get("id"), templateId));
            }
            
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startedAt"), startDate));
            }
            
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("startedAt"), endDate));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        Page<InterviewSession> sessionPage = sessionRepository.findAll(spec, pageable);
        
        List<InterviewSessionResponse> sessions = sessionPage.getContent().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        
        return SessionListResponse.builder()
            .sessions(sessions)
            .totalElements(sessionPage.getTotalElements())
            .totalPages(sessionPage.getTotalPages())
            .currentPage(page)
            .pageSize(size)
            .build();
    }
    
    @Transactional
    public InterviewSessionResponse pauseSession(String sessionId) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        
        if (session.getStatus() != InterviewSession.SessionStatus.IN_PROGRESS) {
            throw new RuntimeException("Only IN_PROGRESS sessions can be paused");
        }
        
        session.setStatus(InterviewSession.SessionStatus.PAUSED);
        session = sessionRepository.save(session);
        return mapToResponse(session);
    }
    
    @Transactional
    public InterviewSessionResponse resumeSession(String sessionId) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        
        if (session.getStatus() != InterviewSession.SessionStatus.PAUSED) {
            throw new RuntimeException("Only PAUSED sessions can be resumed");
        }
        
        session.setStatus(InterviewSession.SessionStatus.IN_PROGRESS);
        session = sessionRepository.save(session);
        return mapToResponse(session);
    }
    
    @Transactional
    public InterviewSessionResponse updateEvaluation(String sessionId, UpdateEvaluationRequest request) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setAiSummary(request.getAiSummary());
        session.setStrengths(request.getStrengths());
        session.setWeaknesses(request.getWeaknesses());
        session.setRecommendation(request.getRecommendation());
        
        session = sessionRepository.save(session);
        return mapToResponse(session);
    }
    
    @Transactional
    public void deleteSession(String sessionId) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        
        // Delete session state from Redis if exists
        try {
            redisTemplate.delete("session:" + sessionId);
        } catch (Exception e) {
            // Log but don't fail if Redis is unavailable
            System.err.println("Failed to delete session from Redis: " + e.getMessage());
        }
        
        // Delete the session (cascade will handle related turns if configured)
        sessionRepository.delete(session);
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

