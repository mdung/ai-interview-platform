package com.aiinterview.dto;

import com.aiinterview.model.InterviewSession;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateEvaluationRequest {
    @NotBlank
    private String aiSummary;
    
    private String strengths;
    private String weaknesses;
    private InterviewSession.Recommendation recommendation;
    private Double communicationScore;
    private Double technicalScore;
    private Double clarityScore;
}

