package com.aiinterview.dto;

import com.aiinterview.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private Notification.NotificationType type;
    private Notification.NotificationStatus status;
    private String actionUrl;
    private Boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}

