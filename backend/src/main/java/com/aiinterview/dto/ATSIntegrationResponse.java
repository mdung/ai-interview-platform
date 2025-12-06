package com.aiinterview.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ATSIntegrationResponse {
    private Long id;
    private String provider;
    private String baseUrl;
    private Boolean enabled;
    private LocalDateTime lastSyncAt;
    private String status; // "connected", "disconnected", "error"
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

