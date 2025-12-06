package com.aiinterview.controller;

import com.aiinterview.dto.InterviewSessionResponse;
import com.aiinterview.dto.NotificationResponse;
import com.aiinterview.service.InterviewSessionService;
import com.aiinterview.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
@RequiredArgsConstructor
public class WebSocketController {
    
    private final SimpMessagingTemplate messagingTemplate;
    @org.springframework.context.annotation.Lazy
    private final InterviewSessionService sessionService;
    @org.springframework.context.annotation.Lazy
    private final NotificationService notificationService;
    
    /**
     * Handle session updates - broadcasts to all subscribers of the session
     */
    @MessageMapping("/session/{sessionId}/update")
    @SendTo("/topic/session/{sessionId}")
    public InterviewSessionResponse handleSessionUpdate(String sessionId) {
        try {
            InterviewSessionResponse session = sessionService.getSessionBySessionId(sessionId);
            log.info("Broadcasting session update for session: {}", sessionId);
            return session;
        } catch (Exception e) {
            log.error("Error handling session update", e);
            return null;
        }
    }
    
    /**
     * Send session update to specific session subscribers
     */
    public void sendSessionUpdate(String sessionId, InterviewSessionResponse session) {
        messagingTemplate.convertAndSend("/topic/session/" + sessionId, session);
    }
    
    /**
     * Send notification to specific user
     */
    public void sendNotificationToUser(Long userId, NotificationResponse notification) {
        messagingTemplate.convertAndSendToUser(
            userId.toString(),
            "/queue/notifications",
            notification
        );
    }
    
    /**
     * Broadcast notification to all users
     */
    public void broadcastNotification(NotificationResponse notification) {
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }
}

