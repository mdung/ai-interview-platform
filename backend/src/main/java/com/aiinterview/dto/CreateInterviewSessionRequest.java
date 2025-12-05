package com.aiinterview.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateInterviewSessionRequest {
    @NotNull
    private Long candidateId;
    
    @NotNull
    private Long templateId;
    
    private String language = "en";
}

