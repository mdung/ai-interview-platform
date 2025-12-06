package com.aiinterview.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTurnRequest {
    @NotBlank
    private String question;
    
    private String answer;
    
    private Long answerDurationMs;
    
    private String audioUrl;
}

