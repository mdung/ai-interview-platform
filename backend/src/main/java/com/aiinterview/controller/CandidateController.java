package com.aiinterview.controller;

import com.aiinterview.dto.*;
import com.aiinterview.model.Candidate;
import com.aiinterview.service.CandidateService;
import com.aiinterview.service.FileStorageService;
import com.aiinterview.service.InterviewSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CandidateController {
    
    private final CandidateService candidateService;
    private final InterviewSessionService sessionService;
    private final FileStorageService fileStorageService;
    
    @GetMapping("/recruiter/candidates")
    public ResponseEntity<CandidateListResponse> getAllCandidates(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        CandidateListResponse response = candidateService.getAllCandidatesWithPagination(
            search, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/recruiter/candidates/{id}")
    public ResponseEntity<Candidate> getCandidate(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.getCandidateById(id));
    }
    
    @GetMapping("/recruiter/candidates/{id}/interviews")
    public ResponseEntity<List<InterviewSessionResponse>> getCandidateInterviews(@PathVariable Long id) {
        List<InterviewSessionResponse> interviews = candidateService.getCandidateInterviews(id);
        return ResponseEntity.ok(interviews);
    }
    
    @PostMapping("/recruiter/candidates")
    public ResponseEntity<Candidate> createCandidate(@RequestBody Candidate candidate) {
        return ResponseEntity.ok(candidateService.createCandidate(candidate));
    }
    
    @PostMapping("/recruiter/candidates/bulk")
    public ResponseEntity<List<Candidate>> bulkCreateCandidates(
            @Valid @RequestBody BulkCandidateRequest request) {
        List<Candidate> candidates = candidateService.bulkCreateCandidates(request);
        return ResponseEntity.ok(candidates);
    }
    
    @DeleteMapping("/recruiter/candidates/bulk")
    public ResponseEntity<Void> bulkDeleteCandidates(@RequestBody List<Long> candidateIds) {
        candidateService.bulkDeleteCandidates(candidateIds);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/recruiter/candidates/{id}")
    public ResponseEntity<Void> deleteCandidate(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/recruiter/candidates/{id}")
    public ResponseEntity<Candidate> updateCandidate(@PathVariable Long id, @RequestBody Candidate candidate) {
        return ResponseEntity.ok(candidateService.updateCandidate(id, candidate));
    }
    
    @PostMapping("/recruiter/candidates/{id}/resume")
    public ResponseEntity<String> uploadResume(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        Candidate candidate = candidateService.getCandidateById(id);
        String filePath = fileStorageService.storeFile(file, "resumes");
        candidate.setResumeUrl(filePath);
        candidateService.updateCandidate(id, candidate);
        return ResponseEntity.ok(filePath);
    }
    
    @GetMapping("/recruiter/candidates/{id}/resume")
    public ResponseEntity<Resource> downloadResume(@PathVariable Long id) throws IOException {
        Candidate candidate = candidateService.getCandidateById(id);
        if (candidate.getResumeUrl() == null || candidate.getResumeUrl().isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Resource resource = fileStorageService.loadFileAsResource(candidate.getResumeUrl());
        
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .header(HttpHeaders.CONTENT_DISPOSITION, 
                "attachment; filename=\"" + resource.getFilename() + "\"")
            .body(resource);
    }
    
    @GetMapping("/recruiter/candidates/statistics")
    public ResponseEntity<CandidateStatisticsResponse> getCandidateStatistics() {
        CandidateStatisticsResponse statistics = candidateService.getCandidateStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/candidates/join/{sessionId}")
    public ResponseEntity<InterviewSessionResponse> joinInterview(@PathVariable String sessionId) {
        InterviewSessionResponse response = sessionService.getSessionBySessionId(sessionId);
        return ResponseEntity.ok(response);
    }
}
