package com.aiinterview.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateInterviewSessionRequest {
    @NotNull
    private Long candidateId;
    
    @NotNull
    private Long templateId;
    
    private String language = "en";
    
    private LocalDateTime scheduledAt;
}

