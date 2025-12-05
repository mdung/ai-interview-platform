package com.aiinterview.controller;

import com.aiinterview.dto.CreateInterviewSessionRequest;
import com.aiinterview.dto.InterviewSessionResponse;
import com.aiinterview.model.InterviewSession;
import com.aiinterview.service.InterviewSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewSessionController {
    
    private final InterviewSessionService sessionService;
    
    @PostMapping("/sessions")
    public ResponseEntity<InterviewSessionResponse> createSession(
            @Valid @RequestBody CreateInterviewSessionRequest request) {
        InterviewSessionResponse response = sessionService.createSession(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<InterviewSessionResponse> getSession(@PathVariable String sessionId) {
        InterviewSessionResponse response = sessionService.getSessionBySessionId(sessionId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/sessions/{sessionId}/status")
    public ResponseEntity<InterviewSessionResponse> updateStatus(
            @PathVariable String sessionId,
            @RequestParam InterviewSession.SessionStatus status) {
        InterviewSessionResponse response = sessionService.updateSessionStatus(sessionId, status);
        return ResponseEntity.ok(response);
    }
}

