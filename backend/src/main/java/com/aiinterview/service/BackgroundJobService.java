package com.aiinterview.service;

import com.aiinterview.model.InterviewSession;
import com.aiinterview.model.User;
import com.aiinterview.repository.InterviewSessionRepository;
import com.aiinterview.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BackgroundJobService {
    
    private final InterviewSessionRepository sessionRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final ReportService reportService;
    private final UserRepository userRepository;
    
    /**
     * Clean up old abandoned sessions (runs daily at 2 AM)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupOldSessions() {
        log.info("Starting cleanup of old sessions");
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        List<InterviewSession> oldSessions = sessionRepository.findAll().stream()
            .filter(s -> s.getStatus() == InterviewSession.SessionStatus.ABANDONED &&
                        s.getStartedAt() != null &&
                        s.getStartedAt().isBefore(cutoffDate))
            .toList();
        
        // Soft delete or archive old sessions
        log.info("Found {} old sessions to cleanup", oldSessions.size());
        // sessionRepository.deleteAll(oldSessions); // Uncomment if hard delete needed
    }
    
    /**
     * Send interview reminders (runs every hour)
     */
    @Scheduled(cron = "0 0 * * * ?")
    @Transactional
    public void sendInterviewReminders() {
        log.info("Checking for interviews to remind");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderTime = now.plusHours(1); // Remind 1 hour before
        
        List<InterviewSession> upcomingSessions = sessionRepository.findAll().stream()
            .filter(s -> s.getStatus() == InterviewSession.SessionStatus.PENDING &&
                        s.getStartedAt() != null &&
                        s.getStartedAt().isAfter(now) &&
                        s.getStartedAt().isBefore(reminderTime))
            .toList();
        
        for (InterviewSession session : upcomingSessions) {
            // Send reminder asynchronously
            sendInterviewReminderAsync(session);
        }
    }
    
    /**
     * Async method to send interview reminder
     */
    @Async("emailExecutor")
    public void sendInterviewReminderAsync(InterviewSession session) {
        try {
            emailService.sendInterviewReminder(session.getCandidate(), session);
            notificationService.sendInterviewNotification(
                session.getCandidate().getUser() != null ? session.getCandidate().getUser().getId() : null,
                session.getSessionId(),
                com.aiinterview.model.Notification.NotificationType.INTERVIEW_REMINDER
            );
            log.info("Sent reminder for session: {}", session.getSessionId());
        } catch (Exception e) {
            log.error("Failed to send reminder for session: {}", session.getSessionId(), e);
        }
    }
    
    /**
     * Process pending notifications (runs every 5 minutes)
     */
    @Scheduled(cron = "0 */5 * * * ?")
    @Transactional
    public void processPendingNotifications() {
        log.info("Processing pending notifications");
        
        // This would process notifications that failed to send
        // and retry them
        // Implementation depends on your notification queue system
    }
    
    /**
     * Generate daily reports (runs daily at 6 AM)
     */
    @Scheduled(cron = "0 0 6 * * ?")
    public void generateDailyReports() {
        log.info("Generating daily reports");
        
        // Get all admin users
        List<User> adminUsers = userRepository.findAll().stream()
            .filter(u -> u.getRole() == User.Role.ADMIN)
            .toList();
        
        // Generate and send reports asynchronously
        for (User admin : adminUsers) {
            generateAndSendReportAsync(admin);
        }
    }
    
    /**
     * Async method to generate and send report
     */
    @Async("reportExecutor")
    public void generateAndSendReportAsync(User admin) {
        try {
            log.info("Generating report for admin: {}", admin.getEmail());
            
            // Generate dashboard report
            byte[] pdfBytes = reportService.generateDashboardReport();
            
            // Send email with report attachment
            String subject = "Daily Dashboard Report - " + LocalDateTime.now().toLocalDate();
            String body = "Please find attached the daily dashboard report.";
            
            // Note: In production, you would attach the PDF to the email
            // For now, we'll just send a notification
            emailService.sendSimpleEmail(admin.getEmail(), subject, body);
            
            log.info("Report generated and sent to admin: {}", admin.getEmail());
        } catch (Exception e) {
            log.error("Failed to generate and send report for admin: {}", admin.getEmail(), e);
        }
    }
    
    /**
     * Update session statuses (runs every 10 minutes)
     */
    @Scheduled(cron = "0 */10 * * * ?")
    @Transactional
    public void updateSessionStatuses() {
        log.info("Updating session statuses");
        
        LocalDateTime timeoutThreshold = LocalDateTime.now().minusHours(2);
        
        List<InterviewSession> staleSessions = sessionRepository.findAll().stream()
            .filter(s -> s.getStatus() == InterviewSession.SessionStatus.IN_PROGRESS &&
                        s.getStartedAt() != null &&
                        s.getStartedAt().isBefore(timeoutThreshold))
            .toList();
        
        for (InterviewSession session : staleSessions) {
            session.setStatus(InterviewSession.SessionStatus.ABANDONED);
            sessionRepository.save(session);
            log.info("Marked stale session as abandoned: {}", session.getSessionId());
        }
    }
}

