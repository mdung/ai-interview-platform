package com.aiinterview.controller;

import com.aiinterview.dto.InterviewSessionResponse;
import com.aiinterview.service.EmailService;
import com.aiinterview.service.InterviewSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emails")
@RequiredArgsConstructor
public class EmailController {
    
    private final EmailService emailService;
    private final InterviewSessionService sessionService;
    
    @PostMapping("/interview-invitation/{sessionId}")
    public ResponseEntity<Void> sendInterviewInvitation(@PathVariable String sessionId) {
        InterviewSessionResponse session = sessionService.getSessionBySessionId(sessionId);
        // Get candidate from session and send invitation
        // emailService.sendInterviewInvitation(candidate, session);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/interview-reminder/{sessionId}")
    public ResponseEntity<Void> sendInterviewReminder(@PathVariable String sessionId) {
        InterviewSessionResponse session = sessionService.getSessionBySessionId(sessionId);
        // Get candidate from session and send reminder
        // emailService.sendInterviewReminder(candidate, session);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/interview-complete/{sessionId}")
    public ResponseEntity<Void> sendInterviewComplete(@PathVariable String sessionId) {
        InterviewSessionResponse session = sessionService.getSessionBySessionId(sessionId);
        // Get candidate from session and send completion notification
        // emailService.sendInterviewCompleteNotification(candidate, session);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/send")
    public ResponseEntity<Void> sendEmail(
            @RequestParam String to,
            @RequestParam String subject,
            @RequestParam String body) {
        emailService.sendSimpleEmail(to, subject, body);
        return ResponseEntity.ok().build();
    }
}

