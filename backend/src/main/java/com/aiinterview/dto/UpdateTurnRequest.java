package com.aiinterview.dto;

import lombok.Data;

@Data
public class UpdateTurnRequest {
    private String question;
    private String answer;
    private Long answerDurationMs;
    private String audioUrl;
    private String aiComment;
    private Double communicationScore;
    private Double technicalScore;
    private Double clarityScore;
    private Boolean hasAntiCheatSignal;
    private String antiCheatDetails;
}


