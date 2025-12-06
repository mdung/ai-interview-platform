package com.aiinterview.service;

import com.aiinterview.dto.CreateTurnRequest;
import com.aiinterview.dto.InterviewTurnResponse;
import com.aiinterview.dto.UpdateTurnRequest;
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
    
    @Transactional
    public InterviewTurnResponse createTurn(String sessionId, CreateTurnRequest request) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        
        List<InterviewTurn> existingTurns = getTurnsBySessionId(session.getId());
        int turnNumber = existingTurns.size() + 1;
        
        InterviewTurn turn = InterviewTurn.builder()
            .session(session)
            .turnNumber(turnNumber)
            .question(request.getQuestion())
            .answer(request.getAnswer())
            .questionTimestamp(LocalDateTime.now())
            .answerTimestamp(request.getAnswer() != null ? LocalDateTime.now() : null)
            .answerDurationMs(request.getAnswerDurationMs())
            .audioUrl(request.getAudioUrl())
            .build();
        
        turn = turnRepository.save(turn);
        
        // Update session turn count
        session.setTotalTurns(turnNumber);
        sessionRepository.save(session);
        
        return mapToResponse(turn);
    }
    
    @Transactional
    public InterviewTurnResponse updateTurn(String sessionId, Long turnId, UpdateTurnRequest request) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        
        InterviewTurn turn = turnRepository.findById(turnId)
            .orElseThrow(() -> new RuntimeException("Turn not found"));
        
        // Verify turn belongs to session
        if (!turn.getSession().getId().equals(session.getId())) {
            throw new RuntimeException("Turn does not belong to this session");
        }
        
        // Update fields if provided
        if (request.getQuestion() != null) {
            turn.setQuestion(request.getQuestion());
        }
        if (request.getAnswer() != null) {
            turn.setAnswer(request.getAnswer());
            if (turn.getAnswerTimestamp() == null) {
                turn.setAnswerTimestamp(LocalDateTime.now());
            }
        }
        if (request.getAnswerDurationMs() != null) {
            turn.setAnswerDurationMs(request.getAnswerDurationMs());
        }
        if (request.getAudioUrl() != null) {
            turn.setAudioUrl(request.getAudioUrl());
        }
        if (request.getAiComment() != null) {
            turn.setAiComment(request.getAiComment());
        }
        if (request.getCommunicationScore() != null) {
            turn.setCommunicationScore(request.getCommunicationScore());
        }
        if (request.getTechnicalScore() != null) {
            turn.setTechnicalScore(request.getTechnicalScore());
        }
        if (request.getClarityScore() != null) {
            turn.setClarityScore(request.getClarityScore());
        }
        if (request.getHasAntiCheatSignal() != null) {
            turn.setHasAntiCheatSignal(request.getHasAntiCheatSignal());
        }
        if (request.getAntiCheatDetails() != null) {
            turn.setAntiCheatDetails(request.getAntiCheatDetails());
        }
        
        turn = turnRepository.save(turn);
        return mapToResponse(turn);
    }
}

