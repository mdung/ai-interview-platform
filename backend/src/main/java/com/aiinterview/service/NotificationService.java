package com.aiinterview.service;

import com.aiinterview.model.Notification;
import com.aiinterview.model.User;
import com.aiinterview.repository.NotificationRepository;
import com.aiinterview.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    @org.springframework.context.annotation.Lazy
    private final WebSocketService webSocketService;
    
    @Transactional
    public Notification createNotification(Long userId, String title, String message, 
                                          Notification.NotificationType type, String actionUrl) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification notification = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .type(type)
            .status(Notification.NotificationStatus.PENDING)
            .actionUrl(actionUrl)
            .read(false)
            .build();
        
        notification = notificationRepository.save(notification);
        
        // Send email notification if user has email (async)
        try {
            emailService.sendSimpleEmail(
                user.getEmail(),
                title,
                message
            );
            notification.setStatus(Notification.NotificationStatus.SENT);
        } catch (Exception e) {
            notification.setStatus(Notification.NotificationStatus.FAILED);
        }
        
        notification = notificationRepository.save(notification);
        
        // Send real-time notification via WebSocket
        try {
            com.aiinterview.dto.NotificationResponse notificationResponse = 
                com.aiinterview.dto.NotificationResponse.builder()
                    .id(notification.getId())
                    .title(notification.getTitle())
                    .message(notification.getMessage())
                    .type(notification.getType())
                    .status(notification.getStatus())
                    .actionUrl(notification.getActionUrl())
                    .read(notification.getRead())
                    .createdAt(notification.getCreatedAt())
                    .readAt(notification.getReadAt())
                    .build();
            
            webSocketService.sendNotificationToUser(userId, notificationResponse);
        } catch (Exception e) {
            // Log but don't fail if WebSocket is unavailable
            System.err.println("Failed to send WebSocket notification: " + e.getMessage());
        }
        
        return notification;
    }
    
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }
    
    public Page<Notification> getUserNotificationsPaginated(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);
    }
    
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUser_IdAndReadFalseOrderByCreatedAtDesc(userId);
    }
    
    public long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByUser_IdAndReadFalse(userId);
    }
    
    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        
        return notificationRepository.save(notification);
    }
    
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        unreadNotifications.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unreadNotifications);
    }
    
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
    
    @Transactional
    public void sendInterviewNotification(Long userId, String sessionId, 
                                         Notification.NotificationType type) {
        String title = "";
        String message = "";
        String actionUrl = "/interview/" + sessionId;
        
        switch (type) {
            case INTERVIEW_SCHEDULED:
                title = "Interview Scheduled";
                message = "Your interview has been scheduled. Click to join.";
                break;
            case INTERVIEW_REMINDER:
                title = "Interview Reminder";
                message = "This is a reminder that you have an interview scheduled.";
                break;
            case INTERVIEW_COMPLETED:
                title = "Interview Completed";
                message = "Your interview has been completed. Results will be available soon.";
                break;
            case INTERVIEW_CANCELLED:
                title = "Interview Cancelled";
                message = "Your interview has been cancelled.";
                break;
        }
        
        createNotification(userId, title, message, type, actionUrl);
    }
    
    @Transactional
    public Notification sendNotification(String title, String message, String type, 
                                        String actionUrl, Long userId) {
        Notification.NotificationType notificationType = Notification.NotificationType.SYSTEM;
        if (type != null) {
            try {
                notificationType = Notification.NotificationType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Default to SYSTEM if invalid type
            }
        }
        
        if (userId != null) {
            // Send to specific user
            return createNotification(userId, title, message, notificationType, actionUrl);
        } else {
            // Send to all users (broadcast)
            List<User> allUsers = userRepository.findAll();
            Notification firstNotification = null;
            for (User user : allUsers) {
                Notification notification = createNotification(
                    user.getId(), title, message, notificationType, actionUrl
                );
                if (firstNotification == null) {
                    firstNotification = notification;
                }
            }
            return firstNotification != null ? firstNotification : 
                Notification.builder().title(title).message(message).build();
        }
    }
}

