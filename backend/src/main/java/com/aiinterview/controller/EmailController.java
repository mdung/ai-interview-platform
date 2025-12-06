package com.aiinterview.controller;

import com.aiinterview.dto.InterviewSessionResponse;
import com.aiinterview.model.Candidate;
import com.aiinterview.repository.CandidateRepository;
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
    private final CandidateRepository candidateRepository;
    
    @PostMapping("/send")
    public ResponseEntity<Void> sendEmail(
            @RequestParam String to,
            @RequestParam String subject,
            @RequestParam String body) {
        emailService.sendSimpleEmail(to, subject, body);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/interview-invitation/{sessionId}")
    public ResponseEntity<Void> sendInterviewInvitation(@PathVariable String sessionId) {
        InterviewSessionResponse session = sessionService.getSessionBySessionId(sessionId);
        Candidate candidate = candidateRepository.findById(session.getCandidateId())
            .orElseThrow(() -> new RuntimeException("Candidate not found"));
        
        String interviewLink = "/candidates/join/" + sessionId;
        String subject = "Interview Invitation - " + session.getTemplateName();
        String body = String.format(
            "Dear %s %s,\n\n" +
            "You have been invited to participate in an interview.\n\n" +
            "Interview Details:\n" +
            "- Template: %s\n" +
            "- Language: %s\n\n" +
            "Please click the following link to join the interview:\n" +
            "%s\n\n" +
            "Best regards,\n" +
            "AI Interview Platform",
            candidate.getFirstName(),
            candidate.getLastName(),
            session.getTemplateName(),
            session.getLanguage(),
            interviewLink
        );
        
        emailService.sendSimpleEmail(candidate.getEmail(), subject, body);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/interview-reminder/{sessionId}")
    public ResponseEntity<Void> sendInterviewReminder(@PathVariable String sessionId) {
        InterviewSessionResponse session = sessionService.getSessionBySessionId(sessionId);
        Candidate candidate = candidateRepository.findById(session.getCandidateId())
            .orElseThrow(() -> new RuntimeException("Candidate not found"));
        
        String interviewLink = "/candidates/join/" + sessionId;
        String subject = "Interview Reminder - " + session.getTemplateName();
        String body = String.format(
            "Dear %s %s,\n\n" +
            "This is a reminder that you have an interview scheduled.\n\n" +
            "Interview Details:\n" +
            "- Template: %s\n" +
            "- Language: %s\n\n" +
            "Please click the following link to join the interview:\n" +
            "%s\n\n" +
            "Best regards,\n" +
            "AI Interview Platform",
            candidate.getFirstName(),
            candidate.getLastName(),
            session.getTemplateName(),
            session.getLanguage(),
            interviewLink
        );
        
        emailService.sendSimpleEmail(candidate.getEmail(), subject, body);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/interview-complete/{sessionId}")
    public ResponseEntity<Void> sendInterviewComplete(@PathVariable String sessionId) {
        InterviewSessionResponse session = sessionService.getSessionBySessionId(sessionId);
        Candidate candidate = candidateRepository.findById(session.getCandidateId())
            .orElseThrow(() -> new RuntimeException("Candidate not found"));
        
        String subject = "Interview Completed - " + session.getTemplateName();
        String body = String.format(
            "Dear %s %s,\n\n" +
            "Thank you for completing the interview.\n\n" +
            "Interview Details:\n" +
            "- Template: %s\n" +
            "- Status: %s\n" +
            "- Total Turns: %d\n\n" +
            "The results will be reviewed and you will be notified of the outcome.\n\n" +
            "Best regards,\n" +
            "AI Interview Platform",
            candidate.getFirstName(),
            candidate.getLastName(),
            session.getTemplateName(),
            session.getStatus(),
            session.getTotalTurns()
        );
        
        emailService.sendSimpleEmail(candidate.getEmail(), subject, body);
        return ResponseEntity.ok().build();
    }
}

