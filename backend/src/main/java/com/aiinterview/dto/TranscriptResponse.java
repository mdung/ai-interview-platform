package com.aiinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptResponse {
    private String sessionId;
    private String candidateName;
    private String templateName;
    private String language;
    private String status;
    private List<InterviewTurnResponse> turns;
    private String aiSummary;
    private String strengths;
    private String weaknesses;
    private String recommendation;
}

