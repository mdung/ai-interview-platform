package com.aiinterview.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ATSIntegrationRequest {
    @NotBlank
    private String provider; // e.g., "Greenhouse", "Lever", "Workday", "BambooHR"
    
    @NotBlank
    private String apiKey;
    
    private String apiSecret;
    
    @NotBlank
    private String baseUrl;
    
    private String webhookUrl;
    
    private Boolean enabled = true;
    
    private String configuration; // JSON string for provider-specific config
}


