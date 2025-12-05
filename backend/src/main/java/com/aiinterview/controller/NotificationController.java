package com.aiinterview.controller;

import com.aiinterview.dto.NotificationResponse;
import com.aiinterview.model.Notification;
import com.aiinterview.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        // Get user ID from email (would need user service)
        // For now, using a placeholder
        Long userId = 1L; // TODO: Get from authentication
        
        Page<Notification> notifications = notificationService.getUserNotificationsPaginated(userId, page, size);
        List<NotificationResponse> responses = notifications.getContent().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Long userId = 1L; // TODO: Get from authentication
        
        List<Notification> notifications = notificationService.getUnreadNotifications(userId);
        List<NotificationResponse> responses = notifications.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Long userId = 1L; // TODO: Get from authentication
        
        long count = notificationService.getUnreadNotificationCount(userId);
        return ResponseEntity.ok(count);
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        Notification notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(mapToResponse(notification));
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Long userId = 1L; // TODO: Get from authentication
        
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
    
    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
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
    }
}

