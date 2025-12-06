package com.aiinterview.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendNotificationRequest {
    @NotBlank
    private String title;
    
    @NotBlank
    private String message;
    
    private String type; // INFO, WARNING, ERROR, SUCCESS
    
    private String actionUrl;
    
    private Long userId; // Optional: if null, sends to all users
}

