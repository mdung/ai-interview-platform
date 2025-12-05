package com.aiinterview.service;

import com.aiinterview.dto.InterviewTurnResponse;
import com.aiinterview.model.InterviewSession;
import com.aiinterview.model.InterviewTurn;
import com.aiinterview.repository.InterviewSessionRepository;
import com.aiinterview.repository.InterviewTurnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewTurnService {
    
    private final InterviewTurnRepository turnRepository;
    private final InterviewSessionRepository sessionRepository;
    
    public List<InterviewTurn> getTurnsBySessionId(Long sessionId) {
        return turnRepository.findBySession_IdOrderByTurnNumberAsc(sessionId);
    }
    
    public List<InterviewTurnResponse> getTurnsBySessionIdAsResponse(Long sessionId) {
        return turnRepository.findBySession_IdOrderByTurnNumberAsc(sessionId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<InterviewTurnResponse> getTurnsBySessionIdString(String sessionId) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        return getTurnsBySessionIdAsResponse(session.getId());
    }
    
    private InterviewTurnResponse mapToResponse(InterviewTurn turn) {
        return InterviewTurnResponse.builder()
            .id(turn.getId())
            .turnNumber(turn.getTurnNumber())
            .question(turn.getQuestion())
            .answer(turn.getAnswer())
            .questionTimestamp(turn.getQuestionTimestamp())
            .answerTimestamp(turn.getAnswerTimestamp())
            .answerDurationMs(turn.getAnswerDurationMs())
            .audioUrl(turn.getAudioUrl())
            .aiComment(turn.getAiComment())
            .communicationScore(turn.getCommunicationScore())
            .technicalScore(turn.getTechnicalScore())
            .clarityScore(turn.getClarityScore())
            .hasAntiCheatSignal(turn.getHasAntiCheatSignal())
            .antiCheatDetails(turn.getAntiCheatDetails())
            .build();
    }
    
    @Transactional
    public InterviewTurn createTurn(Long sessionId, String question, String answer) {
        InterviewSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        
        List<InterviewTurn> existingTurns = getTurnsBySessionId(sessionId);
        int turnNumber = existingTurns.size() + 1;
        
        InterviewTurn turn = InterviewTurn.builder()
            .session(session)
            .turnNumber(turnNumber)
            .question(question)
            .answer(answer)
            .questionTimestamp(LocalDateTime.now())
            .answerTimestamp(answer != null ? LocalDateTime.now() : null)
            .build();
        
        turn = turnRepository.save(turn);
        
        // Update session turn count
        session.setTotalTurns(turnNumber);
        sessionRepository.save(session);
        
        return turn;
    }
    
    @Transactional
    public InterviewTurn updateTurnWithAnswer(Long turnId, String answer, Long durationMs) {
        InterviewTurn turn = turnRepository.findById(turnId)
            .orElseThrow(() -> new RuntimeException("Turn not found"));
        
        turn.setAnswer(answer);
        turn.setAnswerTimestamp(LocalDateTime.now());
        turn.setAnswerDurationMs(durationMs);
        
        return turnRepository.save(turn);
    }
}

