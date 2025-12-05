package com.aiinterview.service;

import com.aiinterview.model.Candidate;
import com.aiinterview.model.InterviewSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    public void sendInterviewInvitation(Candidate candidate, InterviewSession session) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(candidate.getEmail());
            helper.setSubject("Interview Invitation - " + session.getTemplate().getName());
            
            Context context = new Context();
            context.setVariable("candidateName", candidate.getFirstName() + " " + candidate.getLastName());
            context.setVariable("jobTitle", session.getTemplate().getJob().getTitle());
            context.setVariable("interviewLink", frontendUrl + "/interview/" + session.getSessionId());
            context.setVariable("sessionId", session.getSessionId());
            context.setVariable("estimatedDuration", session.getTemplate().getEstimatedDurationMinutes());
            context.setVariable("startedAt", session.getStartedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            
            String htmlContent = templateEngine.process("interview-invitation", context);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send interview invitation email", e);
        }
    }
    
    public void sendInterviewReminder(Candidate candidate, InterviewSession session) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(candidate.getEmail());
            helper.setSubject("Interview Reminder - " + session.getTemplate().getName());
            
            Context context = new Context();
            context.setVariable("candidateName", candidate.getFirstName() + " " + candidate.getLastName());
            context.setVariable("jobTitle", session.getTemplate().getJob().getTitle());
            context.setVariable("interviewLink", frontendUrl + "/interview/" + session.getSessionId());
            context.setVariable("sessionId", session.getSessionId());
            context.setVariable("startedAt", session.getStartedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            
            String htmlContent = templateEngine.process("interview-reminder", context);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send interview reminder email", e);
        }
    }
    
    public void sendInterviewCompleteNotification(Candidate candidate, InterviewSession session) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(candidate.getEmail());
            helper.setSubject("Interview Completed - " + session.getTemplate().getName());
            
            Context context = new Context();
            context.setVariable("candidateName", candidate.getFirstName() + " " + candidate.getLastName());
            context.setVariable("jobTitle", session.getTemplate().getJob().getTitle());
            context.setVariable("completedAt", session.getCompletedAt() != null 
                ? session.getCompletedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                : "N/A");
            
            String htmlContent = templateEngine.process("interview-complete", context);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send interview completion email", e);
        }
    }
    
    public void sendPasswordResetEmail(String email, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Password Reset Request");
            message.setText("Please click the following link to reset your password:\n\n" +
                frontendUrl + "/reset-password/" + resetToken + "\n\n" +
                "This link will expire in 24 hours.");
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
    
    public void sendSimpleEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}

