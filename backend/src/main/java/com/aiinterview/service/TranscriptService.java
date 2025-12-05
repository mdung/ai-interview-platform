package com.aiinterview.service;

import com.aiinterview.dto.InterviewSessionResponse;
import com.aiinterview.dto.InterviewTurnResponse;
import com.aiinterview.dto.TranscriptResponse;
import com.aiinterview.model.InterviewSession;
import com.aiinterview.repository.InterviewSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TranscriptService {
    
    private final InterviewSessionRepository sessionRepository;
    private final InterviewTurnService turnService;
    private final InterviewSessionService sessionService;
    
    public TranscriptResponse getTranscript(String sessionId) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        
        InterviewSessionResponse sessionResponse = sessionService.getSessionBySessionId(sessionId);
        List<InterviewTurnResponse> turns = turnService.getTurnsBySessionIdString(sessionId);
        
        return TranscriptResponse.builder()
            .sessionId(sessionId)
            .candidateName(sessionResponse.getCandidateName())
            .templateName(sessionResponse.getTemplateName())
            .language(sessionResponse.getLanguage())
            .status(sessionResponse.getStatus().name())
            .turns(turns)
            .aiSummary(sessionResponse.getAiSummary())
            .strengths(sessionResponse.getStrengths())
            .weaknesses(sessionResponse.getWeaknesses())
            .recommendation(sessionResponse.getRecommendation() != null ? sessionResponse.getRecommendation().name() : null)
            .build();
    }
}

