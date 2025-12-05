package com.aiinterview.controller;

import com.aiinterview.model.Candidate;
import com.aiinterview.service.CandidateService;
import com.aiinterview.service.InterviewSessionService;
import com.aiinterview.dto.InterviewSessionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CandidateController {
    
    private final CandidateService candidateService;
    private final InterviewSessionService sessionService;
    
    @GetMapping("/recruiter/candidates")
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        return ResponseEntity.ok(candidateService.getAllCandidates());
    }
    
    @GetMapping("/recruiter/candidates/{id}")
    public ResponseEntity<Candidate> getCandidate(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.getCandidateById(id));
    }
    
    @PostMapping("/recruiter/candidates")
    public ResponseEntity<Candidate> createCandidate(@RequestBody Candidate candidate) {
        return ResponseEntity.ok(candidateService.createCandidate(candidate));
    }
    
    @PutMapping("/recruiter/candidates/{id}")
    public ResponseEntity<Candidate> updateCandidate(@PathVariable Long id, @RequestBody Candidate candidate) {
        return ResponseEntity.ok(candidateService.updateCandidate(id, candidate));
    }
    
    @GetMapping("/candidates/join/{sessionId}")
    public ResponseEntity<InterviewSessionResponse> joinInterview(@PathVariable String sessionId) {
        InterviewSessionResponse response = sessionService.getSessionBySessionId(sessionId);
        return ResponseEntity.ok(response);
    }
}
