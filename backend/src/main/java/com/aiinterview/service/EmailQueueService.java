package com.aiinterview.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailQueueService {
    
    private final EmailService emailService;
    
    /**
     * Queue email for async sending
     */
    @Async("emailExecutor")
    public CompletableFuture<Void> queueEmail(String to, String subject, String body) {
        try {
            log.info("Sending queued email to: {}", to);
            emailService.sendSimpleEmail(to, subject, body);
            log.info("Email sent successfully to: {}", to);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("Failed to send queued email to: {}", to, e);
            return CompletableFuture.failedFuture(e);
        }
    }
    
    /**
     * Queue interview invitation email
     */
    @Async("emailExecutor")
    public CompletableFuture<Void> queueInterviewInvitation(
            com.aiinterview.model.Candidate candidate,
            com.aiinterview.model.InterviewSession session) {
        try {
            log.info("Sending queued interview invitation to: {}", candidate.getEmail());
            emailService.sendInterviewInvitation(candidate, session);
            log.info("Interview invitation sent successfully to: {}", candidate.getEmail());
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("Failed to send queued interview invitation to: {}", candidate.getEmail(), e);
            return CompletableFuture.failedFuture(e);
        }
    }
    
    /**
     * Queue interview reminder email
     */
    @Async("emailExecutor")
    public CompletableFuture<Void> queueInterviewReminder(
            com.aiinterview.model.Candidate candidate,
            com.aiinterview.model.InterviewSession session) {
        try {
            log.info("Sending queued interview reminder to: {}", candidate.getEmail());
            emailService.sendInterviewReminder(candidate, session);
            log.info("Interview reminder sent successfully to: {}", candidate.getEmail());
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("Failed to send queued interview reminder to: {}", candidate.getEmail(), e);
            return CompletableFuture.failedFuture(e);
        }
    }
    
    /**
     * Queue interview completion email
     */
    @Async("emailExecutor")
    public CompletableFuture<Void> queueInterviewComplete(
            com.aiinterview.model.Candidate candidate,
            com.aiinterview.model.InterviewSession session) {
        try {
            log.info("Sending queued interview completion email to: {}", candidate.getEmail());
            emailService.sendInterviewCompleteNotification(candidate, session);
            log.info("Interview completion email sent successfully to: {}", candidate.getEmail());
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("Failed to send queued interview completion email to: {}", candidate.getEmail(), e);
            return CompletableFuture.failedFuture(e);
        }
    }
}

