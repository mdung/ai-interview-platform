package com.aiinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewTurnResponse {
    private Long id;
    private Integer turnNumber;
    private String question;
    private String answer;
    private LocalDateTime questionTimestamp;
    private LocalDateTime answerTimestamp;
    private Long answerDurationMs;
    private String audioUrl;
    private String aiComment;
    private Double communicationScore;
    private Double technicalScore;
    private Double clarityScore;
    private Boolean hasAntiCheatSignal;
    private String antiCheatDetails;
}

