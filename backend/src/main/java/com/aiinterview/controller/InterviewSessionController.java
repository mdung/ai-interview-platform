package com.aiinterview.controller;

import com.aiinterview.dto.*;
import com.aiinterview.model.InterviewSession;
import com.aiinterview.service.ExportService;
import com.aiinterview.service.InterviewSessionService;
import com.aiinterview.service.InterviewTurnService;
import com.aiinterview.service.TranscriptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewSessionController {
    
    private final InterviewSessionService sessionService;
    private final InterviewTurnService turnService;
    private final TranscriptService transcriptService;
    private final ExportService exportService;
    private final com.aiinterview.service.AntiCheatService antiCheatService;
    
    @PostMapping("/sessions")
    public ResponseEntity<InterviewSessionResponse> createSession(
            @Valid @RequestBody CreateInterviewSessionRequest request) {
        InterviewSessionResponse response = sessionService.createSession(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/sessions")
    public ResponseEntity<SessionListResponse> getAllSessions(
            @RequestParam(required = false) InterviewSession.SessionStatus status,
            @RequestParam(required = false) Long candidateId,
            @RequestParam(required = false) Long templateId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        SessionListResponse response = sessionService.getAllSessions(
            status, candidateId, templateId, startDate, endDate, page, size, sortBy, sortDir
        );
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
    
    @PostMapping("/sessions/{sessionId}/pause")
    public ResponseEntity<InterviewSessionResponse> pauseSession(@PathVariable String sessionId) {
        InterviewSessionResponse response = sessionService.pauseSession(sessionId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/sessions/{sessionId}/resume")
    public ResponseEntity<InterviewSessionResponse> resumeSession(@PathVariable String sessionId) {
        InterviewSessionResponse response = sessionService.resumeSession(sessionId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/sessions/{sessionId}/turns")
    public ResponseEntity<List<InterviewTurnResponse>> getTurns(@PathVariable String sessionId) {
        List<InterviewTurnResponse> turns = turnService.getTurnsBySessionIdString(sessionId);
        return ResponseEntity.ok(turns);
    }
    
    @PostMapping("/sessions/{sessionId}/turns")
    public ResponseEntity<InterviewTurnResponse> createTurn(
            @PathVariable String sessionId,
            @Valid @RequestBody CreateTurnRequest request) {
        InterviewTurnResponse response = turnService.createTurn(sessionId, request);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/sessions/{sessionId}/turns/{turnId}")
    public ResponseEntity<InterviewTurnResponse> updateTurn(
            @PathVariable String sessionId,
            @PathVariable Long turnId,
            @Valid @RequestBody UpdateTurnRequest request) {
        InterviewTurnResponse response = turnService.updateTurn(sessionId, turnId, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/sessions/{sessionId}/transcript")
    public ResponseEntity<TranscriptResponse> getTranscript(@PathVariable String sessionId) {
        TranscriptResponse transcript = transcriptService.getTranscript(sessionId);
        return ResponseEntity.ok(transcript);
    }
    
    @PutMapping("/sessions/{sessionId}/evaluation")
    public ResponseEntity<InterviewSessionResponse> updateEvaluation(
            @PathVariable String sessionId,
            @Valid @RequestBody UpdateEvaluationRequest request) {
        InterviewSessionResponse response = sessionService.updateEvaluation(sessionId, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/sessions/{sessionId}/export/pdf")
    public ResponseEntity<byte[]> exportTranscriptPdf(@PathVariable String sessionId) throws IOException {
        byte[] pdfBytes = exportService.exportTranscriptAsPdf(sessionId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "transcript_" + sessionId + ".pdf");
        
        return ResponseEntity.ok()
            .headers(headers)
            .body(pdfBytes);
    }
    
    @GetMapping("/sessions/{sessionId}/export/csv")
    public ResponseEntity<String> exportTranscriptCsv(@PathVariable String sessionId) {
        String csv = exportService.exportTranscriptAsCsv(sessionId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "transcript_" + sessionId + ".csv");
        
        return ResponseEntity.ok()
            .headers(headers)
            .body(csv);
    }
    
    @PostMapping("/sessions/{sessionId}/audio")
    public ResponseEntity<String> uploadAudio(
            @PathVariable String sessionId,
            @RequestParam("file") MultipartFile file) {
        // TODO: Implement audio file storage (S3, local filesystem, etc.)
        // For now, return a placeholder URL
        String audioUrl = "/audio/" + sessionId + "/" + file.getOriginalFilename();
        return ResponseEntity.ok(audioUrl);
    }
    
    @GetMapping("/sessions/{sessionId}/audio")
    public ResponseEntity<byte[]> downloadAudio(@PathVariable String sessionId) {
        // Get the session to find audio URL
        InterviewSessionResponse session = sessionService.getSessionBySessionId(sessionId);
        
        // Get all turns for the session to find audio URLs
        List<InterviewTurnResponse> turns = turnService.getTurnsBySessionIdString(sessionId);
        
        // For now, return the first turn's audio if available
        // In a real implementation, you would:
        // 1. Combine all turn audio files into one
        // 2. Or return a list of audio URLs
        // 3. Or stream the audio from storage (S3, filesystem, etc.)
        
        if (turns.isEmpty() || turns.get(0).getAudioUrl() == null) {
            return ResponseEntity.notFound().build();
        }
        
        // TODO: Implement actual audio file retrieval from storage
        // This is a placeholder - in production, you would:
        // - Retrieve audio file from S3/filesystem based on audioUrl
        // - Return the audio bytes with proper content type
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable String sessionId) {
        sessionService.deleteSession(sessionId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/sessions/{sessionId}/send-link")
    public ResponseEntity<Void> sendInterviewLink(@PathVariable String sessionId) {
        InterviewSessionResponse session = sessionService.getSessionBySessionId(sessionId);
        
        // Get candidate email from session
        // In a real implementation, you would:
        // 1. Get candidate from session
        // 2. Generate interview link
        // 3. Send email with link via EmailService
        
        // For now, this is a placeholder
        // emailService.sendInterviewInvitation(candidate, session);
        
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/sessions/{sessionId}/report-activity")
    public ResponseEntity<Void> reportSuspiciousActivity(
            @PathVariable String sessionId,
            @RequestBody SuspiciousActivityRequest request) {
        antiCheatService.reportSuspiciousActivity(
            sessionId,
            request.getActivityType(),
            request.getMetadata()
        );
        return ResponseEntity.ok().build();
    }
}

