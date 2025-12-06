package com.aiinterview.service;

import com.aiinterview.dto.InterviewSessionResponse;
import com.aiinterview.dto.NotificationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Broadcast session update to all subscribers
     */
    public void broadcastSessionUpdate(String sessionId, InterviewSessionResponse session) {
        try {
            messagingTemplate.convertAndSend("/topic/session/" + sessionId, session);
            log.debug("Broadcasted session update for session: {}", sessionId);
        } catch (Exception e) {
            log.error("Failed to broadcast session update", e);
        }
    }
    
    /**
     * Send notification to specific user
     */
    public void sendNotificationToUser(Long userId, NotificationResponse notification) {
        try {
            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                notification
            );
            log.debug("Sent notification to user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to send notification to user", e);
        }
    }
    
    /**
     * Broadcast notification to all users
     */
    public void broadcastNotification(NotificationResponse notification) {
        try {
            messagingTemplate.convertAndSend("/topic/notifications", notification);
            log.debug("Broadcasted notification to all users");
        } catch (Exception e) {
            log.error("Failed to broadcast notification", e);
        }
    }
}

